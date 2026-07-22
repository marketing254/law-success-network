import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin, requireOwner, ADMIN_ROLES } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { str, isEmail, normalizeEmail } from "@/lib/validate";
import { recordAudit } from "@/lib/admin/sideEffects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/admins — any admin may see the team. */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { data, error } = await getSupabaseAdmin()
    .from("admin_users")
    .select("id, email, full_name, role, active, last_active_at, created_at")
    .order("created_at")
    .limit(100);

  if (error) {
    console.error("[admin/admins] GET failed", error);
    return NextResponse.json({ error: "Could not load the admin team." }, { status: 500 });
  }

  return NextResponse.json({ admins: data ?? [], currentAdminId: guard.adminId });
}

/** POST /api/admin/admins — owner only. Adds an allow-list row. */
export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rawEmail = str(body.email, 254);
  const fullName = str(body.full_name, 200);
  const role = str(body.role, 32) || "admin";

  if (!rawEmail || !isEmail(rawEmail)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Unsupported role." }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("admin_users")
    .insert({
      email: normalizeEmail(rawEmail),
      full_name: fullName,
      role,
      active: true,
    })
    .select("id, email, full_name, role, active, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That email is already on the admin team." },
        { status: 409 }
      );
    }
    console.error("[admin/admins] POST failed", error);
    return NextResponse.json({ error: "Could not add the admin." }, { status: 500 });
  }

  await recordAudit({
    targetType: "member",
    targetId: data.id,
    action: "admin_added",
    note: `${data.email} added as ${role}`,
    adminId: guard.adminId,
  });

  // No email: the new admin simply requests a code at /admin/login, and the
  // allow-list row is what lets it through.
  return NextResponse.json({ ok: true, admin: data });
}

/** PATCH /api/admin/admins — owner only. { id, active?, role? } */
export async function PATCH(req: NextRequest) {
  const guard = await requireOwner();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = str(body.id, 64);
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (typeof body.active === "boolean") patch.active = body.active;
  if (body.role !== undefined) {
    const role = str(body.role, 32);
    if (!role || !ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
      return NextResponse.json({ error: "Unsupported role." }, { status: 400 });
    }
    patch.role = role;
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  // An owner locking themselves out would leave the console with no one able
  // to restore access, since only an owner can re-activate an admin.
  if (id === guard.adminId && (patch.active === false || patch.role !== undefined)) {
    return NextResponse.json(
      { error: "You cannot change your own role or deactivate yourself." },
      { status: 400 }
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from("admin_users")
    .update(patch)
    .eq("id", id)
    .select("id, email, full_name, role, active")
    .single();

  if (error) {
    console.error("[admin/admins] PATCH failed", error);
    return NextResponse.json({ error: "Could not update the admin." }, { status: 500 });
  }

  await recordAudit({
    targetType: "member",
    targetId: id,
    action: "admin_updated",
    note: JSON.stringify(patch),
    adminId: guard.adminId,
  });

  return NextResponse.json({ ok: true, admin: data });
}
