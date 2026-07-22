import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin, requireOwner } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { str } from "@/lib/validate";
import { recordAudit } from "@/lib/admin/sideEffects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = ["deactivate", "reactivate"] as const;

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/members/[id] */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;
  const { data, error } = await getSupabaseAdmin()
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }
  return NextResponse.json({ member: data });
}

/**
 * PATCH /api/admin/members/[id] — { action }
 *
 * deactivate -> status "paused";  reactivate -> status "active".
 *
 * Stripe note: once billing is live this is also where the subscription's
 * cancel_at_period_end is set and cleared. There is no Stripe integration in
 * the waitlist phase, so this only moves the local status.
 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const action = str(body.action, 32);
  if (!action || !ACTIONS.includes(action as (typeof ACTIONS)[number])) {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  const status = action === "deactivate" ? "paused" : "active";

  const { data, error } = await getSupabaseAdmin()
    .from("members")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[admin/members/:id] PATCH failed", error);
    return NextResponse.json({ error: "Could not update the member." }, { status: 500 });
  }

  await recordAudit({
    targetType: "member",
    targetId: id,
    action,
    note: str(body.note, 2000),
    adminId: guard.adminId,
  });

  return NextResponse.json({ ok: true, member: data });
}

/**
 * DELETE /api/admin/members/[id] — owner only.
 *
 * Hard delete, and the audit row is written BEFORE the delete so the trail
 * survives the record it describes. Deactivate is almost always the right
 * action instead; this exists for genuine erasure requests.
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const guard = await requireOwner();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;
  const db = getSupabaseAdmin();

  const { data: member } = await db
    .from("members")
    .select("id, email, auth_user_id")
    .eq("id", id)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  await recordAudit({
    targetType: "member",
    targetId: id,
    action: "delete",
    note: `Deleted member ${member.email}`,
    adminId: guard.adminId,
  });

  const { error } = await db.from("members").delete().eq("id", id);
  if (error) {
    console.error("[admin/members/:id] DELETE failed", error);
    return NextResponse.json({ error: "Could not delete the member." }, { status: 500 });
  }

  // Best-effort: an orphaned auth user is harmless, a failed request is not.
  if (member.auth_user_id) {
    try {
      await db.auth.admin.deleteUser(member.auth_user_id);
    } catch (err) {
      console.error("[admin/members/:id] auth user delete failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
