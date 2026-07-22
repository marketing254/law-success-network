import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const ADMIN_ROLES = ["owner", "admin", "reviewer", "support"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminContext = {
  ok: true;
  userId: string;
  email: string;
  adminId: string;
  role: AdminRole;
};

export type GuardFailure = { ok: false; response: NextResponse };
export type GuardResult = AdminContext | GuardFailure;

function deny(status: number, error: string): GuardFailure {
  return { ok: false, response: NextResponse.json({ error }, { status }) };
}

/**
 * The gate on EVERY /api/admin/* handler.
 *
 *   const guard = await requireAdmin();
 *   if (!guard.ok) return guard.response;
 *
 * 401 = not signed in. 403 = signed in, but not an active admin.
 * Side effects: links auth_user_id on first sign-in, bumps last_active_at.
 */
export async function requireAdmin(): Promise<GuardResult> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return deny(401, "Not signed in.");

  const email = user.email.toLowerCase();
  const db = getSupabaseAdmin();

  const { data: admin, error } = await db
    .from("admin_users")
    .select("id, role, active, auth_user_id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[requireAdmin] admin_users lookup failed", error);
    return deny(403, "Not authorised.");
  }
  if (!admin || !admin.active) return deny(403, "Not authorised.");
  if (!ADMIN_ROLES.includes(admin.role)) return deny(403, "Not authorised.");

  // Link the auth user on first sign-in and keep last_active_at fresh.
  const patch: Record<string, unknown> = { last_active_at: new Date().toISOString() };
  if (!admin.auth_user_id) patch.auth_user_id = user.id;
  await db.from("admin_users").update(patch).eq("id", admin.id);

  return {
    ok: true,
    userId: user.id,
    email,
    adminId: admin.id,
    role: admin.role as AdminRole,
  };
}

/**
 * requireAdmin() plus an owner check. Use on privileged endpoints — anything
 * that changes who can administer the network.
 */
export async function requireOwner(): Promise<GuardResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  if (guard.role !== "owner") return deny(403, "Owner access required.");
  return guard;
}
