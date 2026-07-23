import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requestFingerprint } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { str, isEmail, normalizeEmail, bool, nullIfNa } from "@/lib/validate";
import { sendWaitlistConfirmationEmail } from "@/lib/email/templates";
import { notifySignup } from "@/lib/email/teamNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/waitlist — the homepage founding-waitlist form. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const firstName = str(body.first_name, 120);
  const lastName = str(body.last_name, 120);
  const rawEmail = str(body.email, 254);
  // "NA" and friends must never block or be stored as data (see nullIfNa)
  const phone = nullIfNa(str(body.mobile ?? body.phone, 40));
  const firmName = str(body.firm_name, 200);
  const role = str(body.role, 120);
  const challenge = str(body.biggest_challenge, 2000);

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!rawEmail || !isEmail(rawEmail)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (!firmName) {
    return NextResponse.json(
      { error: "Please enter your firm name." },
      { status: 400 }
    );
  }
  if (!bool(body.agreement_accepted)) {
    return NextResponse.json(
      { error: "Please accept the Member Agreement to continue." },
      { status: 400 }
    );
  }

  const email = normalizeEmail(rawEmail);
  const fingerprint = requestFingerprint(req);

  const limit = checkRateLimit([fingerprint.ip_hash, email]);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const now = new Date().toISOString();
  const smsConsent = bool(body.sms_consent);

  const db = getSupabaseAdmin();
  const { data: row, error } = await db
    .from("waitlist_signups")
    .insert({
      role: "member",
      email,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      firm_name: firmName,
      practice_role: role,
      phone,
      message: challenge,
      source: "website",
      status: "new",
      agreement_accepted: true,
      agreement_accepted_at: now,
      sms_consent: smsConsent,
      sms_consent_text: smsConsent ? str(body.sms_consent_text, 1000) : null,
      sms_consent_at: smsConsent ? now : null,
      ...fingerprint,
    })
    .select("id")
    .single();

  if (error) {
    // 23505 = already on the list. Treat as success so the form never leaks
    // whether an address is already registered, and never scolds a returning
    // owner who simply forgot they signed up.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, status: "already_registered" });
    }
    console.error("[waitlist] insert failed", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // Both are best-effort: the signup is saved, so a mail failure must not
  // turn into an error the applicant sees.
  await sendWaitlistConfirmationEmail({
    email,
    firstName,
    referenceId: row.id,
  }).catch((err) => console.error("[waitlist] confirmation email failed", err));

  void notifySignup("member", {
    name: `${firstName} ${lastName}`,
    email,
    fields: [
      ["Firm", firmName],
      ["Role", role],
      ["Phone", phone],
      ["Biggest challenge", challenge],
    ],
  });

  return NextResponse.json({ ok: true, id: row.id });
}
