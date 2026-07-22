import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isEmail, normalizeEmail, str } from "@/lib/validate";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { requestFingerprint } from "@/lib/security/request";
import { recordAuthAudit } from "@/lib/admin/sideEffects";
import { sendAdminCodeEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login — request a 6-digit sign-in code.
 *
 * Admin identity is two things: a pre-created Supabase auth user, and an
 * ACTIVE admin_users row. This route checks the allow-list first and only then
 * asks Supabase to mail a code, so a stranger's address never triggers a send.
 *
 * `shouldCreateUser: false` is the security property: an email without a
 * pre-created auth user can NEVER receive a code. Seeding an admin therefore
 * means both the admin_users row AND the auth user (dashboard or seed script).
 *
 * Fallback: if Supabase's own SMTP send fails, we mint the code server-side
 * via generateLink and send it through the app's transport, so a broken
 * dashboard SMTP can never lock the whole team out of the console.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = str(body.email, 254);
  if (!raw || !isEmail(raw)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  const email = normalizeEmail(raw);
  const fingerprint = requestFingerprint(req);

  const limit = checkRateLimit([fingerprint.ip_hash, email], { limit: 6 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const db = getSupabaseAdmin();
  const { data: admin } = await db
    .from("admin_users")
    .select("id, active")
    .eq("email", email)
    .maybeSingle();

  if (!admin || !admin.active) {
    void recordAuthAudit({
      email,
      event: "otp_denied",
      audience: "admin",
      ipHash: fingerprint.ip_hash,
      userAgent: fingerprint.user_agent,
    });
    // Same shape and timing as success. Whether an address is an admin is not
    // something an unauthenticated caller gets to enumerate.
    return NextResponse.json({ ok: true });
  }

  // Primary: Supabase sends the code through its dashboard SMTP.
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  let sentVia: "supabase" | "fallback" = "supabase";

  if (error) {
    // Supabase's ~60s resend throttle is not a failure; surface it as such.
    if (error.status === 429) {
      return NextResponse.json(
        { error: "A code was sent recently. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    // Fallback: mint the code server-side and send it through our own SMTP.
    // generateLink does not email anything itself; it returns the OTP.
    console.error("[admin/login] signInWithOtp failed, using fallback", error);
    try {
      const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      const code = linkData?.properties?.email_otp;
      if (linkError || !code) throw linkError ?? new Error("no email_otp in generateLink");

      const result = await sendAdminCodeEmail({ email, code });
      if (!result.sent) throw new Error(`fallback send failed: ${result.reason}`);
      sentVia = "fallback";
    } catch (fallbackError) {
      console.error("[admin/login] fallback failed", fallbackError);
      return NextResponse.json(
        { error: "Could not send the sign-in code. Please try again." },
        { status: 500 }
      );
    }
  }

  void recordAuthAudit({
    email,
    event: "otp_requested",
    audience: "admin",
    ipHash: fingerprint.ip_hash,
    userAgent: fingerprint.user_agent,
    metadata: { sentVia },
  });

  return NextResponse.json({ ok: true, sentVia });
}
