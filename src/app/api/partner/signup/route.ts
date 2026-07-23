import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requestFingerprint } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { str, isEmail, normalizeEmail, safeUrl, bool, nullIfNa } from "@/lib/validate";
import { sendPartnerConfirmationEmail } from "@/lib/email/templates";
import { notifySignup } from "@/lib/email/teamNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/partner/signup — the /partners application form.
 *
 * Writes BOTH the application row (the record of what they submitted) and the
 * partners row that the admin console approves. The partners row starts
 * pending_review and unverified: nothing is listed until an admin approves.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const companyName = str(body.company ?? body.company_name, 200);
  const contactName = str(body.contact_name, 200);
  const rawEmail = str(body.email ?? body.contact_email, 254);
  // "NA" in any non-required field passes through as "no value" (see nullIfNa)
  const phone = nullIfNa(str(body.phone ?? body.contact_phone, 40));
  const website = safeUrl(nullIfNa(str(body.website, 500)));
  const category = str(body.category, 120);
  const description = str(body.description, 2000);
  const memberOffer = str(body.member_offer, 2000);
  const secondaryEmail = nullIfNa(str(body.secondary_email, 254));
  const secondaryPhone = nullIfNa(str(body.secondary_phone, 40));
  const signatureName = str(body.signature_name, 200);
  const signatureTitle = str(body.signature_title, 200);

  if (!companyName) {
    return NextResponse.json(
      { error: "Please enter your company name." },
      { status: 400 }
    );
  }
  if (!contactName) {
    return NextResponse.json(
      { error: "Please enter a contact name." },
      { status: 400 }
    );
  }
  if (!rawEmail || !isEmail(rawEmail)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  // Fix 2 in LMN_Signup_Forms_Spec.md: the page promises "tell us the member
  // discount you'll offer" and the authorisation checkbox commits them to it,
  // so the offer cannot be optional.
  if (!memberOffer) {
    return NextResponse.json(
      { error: "Please tell us the exclusive offer you would make to members." },
      { status: 400 }
    );
  }
  if (!bool(body.agreed_to_terms)) {
    return NextResponse.json(
      { error: "Please accept the Partner Agreement to continue." },
      { status: 400 }
    );
  }
  if (!bool(body.confirmed_authority)) {
    return NextResponse.json(
      { error: "Please confirm you are authorised to commit your company." },
      { status: 400 }
    );
  }

  const contactEmail = normalizeEmail(rawEmail);
  const fingerprint = requestFingerprint(req);

  const limit = checkRateLimit([fingerprint.ip_hash, contactEmail]);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const now = new Date().toISOString();
  const smsConsent = bool(body.sms_consent);
  const alsoExpert = bool(body.also_expert);
  const db = getSupabaseAdmin();

  const { data: application, error: appError } = await db
    .from("partner_applications")
    .insert({
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: phone,
      secondary_email: secondaryEmail,
      secondary_phone: secondaryPhone,
      signature_name: signatureName,
      signature_title: signatureTitle,
      category,
      website,
      description,
      member_offer: memberOffer,
      status: "pending_review",
      source: "website",
      agreed_to_terms: true,
      confirmed_authority: true,
      agreement_accepted_at: now,
      also_expert: alsoExpert,
      sms_consent: smsConsent,
      sms_consent_text: smsConsent ? str(body.sms_consent_text, 1000) : null,
      sms_consent_at: smsConsent ? now : null,
      ...fingerprint,
    })
    .select("id")
    .single();

  if (appError) {
    if (appError.code === "23505") {
      return NextResponse.json({ ok: true, status: "already_applied" });
    }
    console.error("[partner/signup] application insert failed", appError);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // The reviewable partner record. Unverified and pending until an admin
  // approves, so nothing reaches the directory on the strength of a form post.
  const { error: partnerError } = await db.from("partners").insert({
    application_id: application.id,
    company_name: companyName,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: phone,
    secondary_email: secondaryEmail,
    secondary_phone: secondaryPhone,
    signature_name: signatureName,
    signature_title: signatureTitle,
    category,
    website,
    description,
    member_offer: memberOffer,
    status: "pending_review",
    verified: false,
    plan_id: "founding",
  });

  if (partnerError && partnerError.code !== "23505") {
    // The application row is already saved, which is the record that matters.
    // Log and carry on rather than failing a submission we have captured.
    console.error("[partner/signup] partners insert failed", partnerError);
  }

  await sendPartnerConfirmationEmail({ email: contactEmail, contactName }).catch(
    (err) => console.error("[partner/signup] confirmation email failed", err)
  );

  void notifySignup(alsoExpert ? "both" : "partner", {
    name: `${contactName} (${companyName})`,
    email: contactEmail,
    fields: [
      ["Company", companyName],
      ["Category", category],
      ["Website", website],
      ["Member offer", memberOffer],
      ["Phone", phone],
      ["Also an expert", alsoExpert ? "Yes" : "No"],
    ],
  });

  return NextResponse.json({ ok: true, id: application.id });
}
