import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/members */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { data, error } = await getSupabaseAdmin()
    .from("members")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[admin/members] GET failed", error);
    return NextResponse.json({ error: "Could not load members." }, { status: 500 });
  }

  return NextResponse.json({ members: data ?? [] });
}
