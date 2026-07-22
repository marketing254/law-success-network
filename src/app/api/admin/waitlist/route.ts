import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { str } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["new", "contacted", "converted", "declined"] as const;

/** GET /api/admin/waitlist — the triage list (and the source for CSV export). */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { data, error } = await getSupabaseAdmin()
    .from("waitlist_signups")
    .select(
      "id, role, email, full_name, first_name, last_name, firm_name, practice_role, phone, city_state, message, source, status, contacted_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[admin/waitlist] GET failed", error);
    return NextResponse.json({ error: "Could not load the waitlist." }, { status: 500 });
  }

  return NextResponse.json({ signups: data ?? [] });
}

/**
 * PATCH /api/admin/waitlist — move a signup through triage.
 *
 * Lightweight on purpose: no audit row, no notification, no email. The moment
 * a signup becomes a real member it goes through /api/admin/members/activate,
 * which does write the full trail and flips this row to `converted`.
 */
export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = str(body.id, 64);
  const status = str(body.status, 32);

  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  if (!status || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: "Unsupported status." }, { status: 400 });
  }

  const patch: Record<string, unknown> = { status };
  if (status === "contacted") patch.contacted_at = new Date().toISOString();

  const { data, error } = await getSupabaseAdmin()
    .from("waitlist_signups")
    .update(patch)
    .eq("id", id)
    .select("id, status, contacted_at")
    .single();

  if (error) {
    console.error("[admin/waitlist] PATCH failed", error);
    return NextResponse.json({ error: "Could not update the signup." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, signup: data });
}
