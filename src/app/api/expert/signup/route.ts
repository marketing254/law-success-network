import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requestFingerprint } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { str, isEmail, normalizeEmail, safeUrl, bool } from "@/lib/validate";
import { sendExpertConfirmationEmail } from "@/lib/email/templates";
import { notifySignup } from "@/lib/email/teamNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/expert/signup — the /experts application form.
 *
 * Application-only. Provisioning (the experts row, the portal, the approval
 * email) happens later, from the admin console.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const fullName = str(body.name ?? body.full_name, 200);
  const rawEmail = str(body.email, 254);
  const phone = str(body.phone, 40);
  const specialty = str(body.specialty, 200);
  const website = safeUrl(body.website_linkedin ?? body.website);
  const bookingLink = safeUrl(body.booking_link);
  const teach = str(body.what_you_would_teach, 4000);
  const topics = str(body.topics, 2000);

  if (!fullName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!rawEmail || !isEmail(rawEmail)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (!specialty) {
    return NextResponse.json(
      { error: "Please choose your specialty." },
      { status: 400 }
    );
  }
  if (!teach) {
    return NextResponse.json(
      { error: "Please tell us what you would teach law firm owners." },
      { status: 400 }
    );
  }

  // Fix 1 in LMN_Signup_Forms_Spec.md: the expert form previously agreed to
  // nothing. Acceptance is now a hard submit gate.
  if (!bool(body.agreement_accepted)) {
    return NextResponse.json(
      { error: "Please accept the Expert Agreement to continue." },
      { status: 400 }
    );
  }

  // Fix 3: cross-role. A ticked "also list my company as a partner" decides
  // which agreement variant gets served at the Agree and Pay step, so the
  // company name has to come with it.
  const alsoPartner = bool(body.also_partner);
  const companyName = str(body.company_name, 200);
  const companyOffer = str(body.company_offer, 1000);
  if (alsoPartner && !companyName) {
    return NextResponse.json(
      { error: "Please enter your company name." },
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
    .from("expert_applications")
    .insert({
      full_name: fullName,
      email,
      phone,
      company_name: companyName,
      specialty,
      topics,
      website,
      booking_link: bookingLink,
      what_you_teach: teach,
      status: "new",
      source: "website",
      agreement_accepted: true,
      agreement_accepted_at: now,
      also_partner: alsoPartner,
      company_offer: alsoPartner ? companyOffer : null,
      considered_founding: bool(body.considered_founding),
      sms_consent: smsConsent,
      sms_consent_text: smsConsent ? str(body.sms_consent_text, 1000) : null,
      sms_consent_at: smsConsent ? now : null,
      ...fingerprint,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Already applied. Friendly success rather than an error that invites
      // a second submission through a different address.
      return NextResponse.json({ ok: true, status: "already_applied" });
    }
    console.error("[expert/signup] insert failed", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  await sendExpertConfirmationEmail({ email, fullName }).catch((err) =>
    console.error("[expert/signup] confirmation email failed", err)
  );

  void notifySignup("expert", {
    name: fullName,
    email,
    fields: [
      ["Specialty", specialty],
      ["Phone", phone],
      ["Website", website],
      ["Would teach", teach],
      ["Also a partner", alsoPartner ? `Yes — ${companyName}` : "No"],
      ["Founding consideration", bool(body.considered_founding) ? "Yes" : "No"],
    ],
  });

  return NextResponse.json({ ok: true, id: row.id });
}
