import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
