import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/audit — the combined trail.
 *   ?type=review|auth  (default: both)
 *   ?target=<target_type>
 */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const db = getSupabaseAdmin();
  const params = req.nextUrl.searchParams;
  const type = params.get("type");
  const target = params.get("target");

  const wantReview = type !== "auth";
  const wantAuth = type !== "review";

  let reviewQuery = db
    .from("review_actions")
    .select("id, target_type, target_id, action, note, admin_id, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (target) reviewQuery = reviewQuery.eq("target_type", target);

  const [reviewRes, authRes, adminsRes] = await Promise.all([
    wantReview ? reviewQuery : Promise.resolve({ data: [], error: null }),
    wantAuth
      ? db
          .from("auth_audit")
          .select("id, email, event, audience, created_at")
          .order("created_at", { ascending: false })
          .limit(300)
      : Promise.resolve({ data: [], error: null }),
    db.from("admin_users").select("id, email, full_name"),
  ]);

  if (reviewRes.error || authRes.error) {
    console.error("[admin/audit] GET failed", reviewRes.error || authRes.error);
    return NextResponse.json({ error: "Could not load the audit log." }, { status: 500 });
  }

  // Resolve admin_id to a name here rather than making the page do a second
  // round trip for a handful of admins.
  const adminById = new Map(
    (adminsRes.data ?? []).map((a) => [a.id, a.full_name || a.email])
  );

  return NextResponse.json({
    reviewActions: (reviewRes.data ?? []).map((r) => ({
      ...r,
      admin_name: r.admin_id ? (adminById.get(r.admin_id) ?? "Unknown") : "System",
    })),
    authEvents: authRes.data ?? [],
  });
}
