import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isEmail, normalizeEmail, str } from "@/lib/validate";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { requestFingerprint } from "@/lib/security/request";
import { recordAuthAudit } from "@/lib/admin/sideEffects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/admin/verify-otp — exchange the 6-digit code for a session cookie. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = str(body.email, 254);
  const token = str(body.code ?? body.token, 12);

  if (!raw || !isEmail(raw) || !token) {
    return NextResponse.json({ error: "Invalid code." }, { status: 400 });
  }

  const email = normalizeEmail(raw);
  const fingerprint = requestFingerprint(req);

  const limit = checkRateLimit([fingerprint.ip_hash, email, "verify"], { limit: 10 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const supabase = await getSupabaseServer();

  // Codes can come from two paths: signInWithOtp (type "email") or the
  // generateLink fallback (type "magiclink"). Try both; each mints the same
  // session on success.
  let { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error || !data.user) {
    ({ data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "magiclink",
    }));
  }

  if (error || !data.user) {
    void recordAuthAudit({
      email,
      event: "otp_failed",
      audience: "admin",
      ipHash: fingerprint.ip_hash,
      userAgent: fingerprint.user_agent,
    });
    return NextResponse.json(
      { error: "That code is not valid or has expired." },
      { status: 401 }
    );
  }

  // Verifying the code proves control of the inbox, not authorisation. The
  // allow-list is re-checked here: an admin deactivated between requesting and
  // entering the code must not end up with a valid session.
  const db = getSupabaseAdmin();
  const { data: admin } = await db
    .from("admin_users")
    .select("id, active")
    .eq("email", email)
    .maybeSingle();

  if (!admin || !admin.active) {
    await supabase.auth.signOut();
    void recordAuthAudit({
      email,
      event: "otp_denied",
      audience: "admin",
      ipHash: fingerprint.ip_hash,
      userAgent: fingerprint.user_agent,
    });
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  await db
    .from("admin_users")
    .update({ auth_user_id: data.user.id, last_active_at: new Date().toISOString() })
    .eq("id", admin.id);

  void recordAuthAudit({
    email,
    event: "otp_verified",
    audience: "admin",
    ipHash: fingerprint.ip_hash,
    userAgent: fingerprint.user_agent,
  });

  return NextResponse.json({ ok: true });
}
