import "server-only";
import { renderBranded, renderSimple } from "./shell";
import {
  sendAndLog,
  SITE_URL,
  MEMBERS_EMAIL,
  SUPPORT_EMAIL,
  PARTNERSHIPS_EMAIL,
} from "./transport";

/**
 * Every transactional email LMN sends in the waitlist phase.
 *
 * Copy adapted from VSN_Transactional_Emails.md to LMN canon
 * (LMN_Build_and_Replication_Playbook.md + Dev_Handoff/DEV_HANDOVER.md):
 *
 *  - Credit line is "Powered by Dominate Law"; entity is Ekwa Marketing Inc.
 *  - Contact is support@lawmembernetwork.com. Never joinlmn.com, which is the
 *    marketing domain and must stay off transactional sends.
 *  - Members: $49 first 100 locked for life, $99 for 101-500, $199 standard.
 *    Annual is 10x monthly, so two months free.
 *  - Experts and partners ramp $0 for 6 months, then $49/mo, then $199/mo.
 *  - Course split IS stated for LMN: the expert keeps 70%. (This differs from
 *    VSN, where courses were deferred.)
 *  - Founding-20 free-for-life is INTERNAL. It appears only in the private
 *    founding invite below and never in a public-facing email.
 *  - Hotline is always: voicemail, reply by text and email in 2 to 3 business
 *    days, 3 to 4 vetted experts, AI-assisted, not a live human, not 24/7.
 *  - No invented numbers, member counts or testimonials.
 *  - No em-dashes anywhere in email copy.
 *
 * LAUNCH DATE: LMN has not announced one, so the ramp is written in months
 * rather than dates. Once the launch date is fixed, rewrite the ramp lines as
 * plain calendar dates ("free through February 28, 2027, then $49/month") the
 * way DMN does. Plain dates are what prevent billing disputes.
 */

const NOT_LEGAL_ADVICE =
  "The Law Member Network provides education and business resources for law firm owners. Nothing in this email or the membership is legal advice, and no attorney-client relationship is created. LMN does not claim CLE accreditation or bar association affiliation.";

function firstNameOf(full: string | null | undefined): string {
  if (!full) return "there";
  return full.trim().split(/\s+/)[0] || "there";
}

// ---------------------------------------------------------------------------
// 1. MEMBER: waitlist join
// ---------------------------------------------------------------------------
export async function sendWaitlistConfirmationEmail(opts: {
  email: string;
  firstName?: string | null;
  referenceId: string;
  submittedAt?: Date;
}) {
  const first = firstNameOf(opts.firstName);
  const submitted = (opts.submittedAt || new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = "Your founding spot is reserved | Law Member Network";
  const html = renderBranded({
    previewText:
      "You are on the founding waitlist. $49/month founding rate, locked for life while active. Nothing to pay today.",
    eyebrow: "Founding Waitlist",
    headline: "You are on the list.",
    intro: [
      `Hi ${first},`,
      "Welcome to the Law Member Network. Your spot on the founding waitlist is reserved, and there is **nothing to pay today**. As founding spots open we will reach out personally, and you confirm before any charge.",
    ],
    sections: [
      {
        heading: "What you get as a founding member",
        bullets: [
          "**The Expert Hotline.** Leave a voicemail on the members' toll-free line and get a reply by text and email within 2 to 3 business days: a recommended solution plus 3 to 4 vetted experts to contact. It is AI-assisted and routed by fit, never pay-to-play. It is not a live human answering the phone and it is not 24/7.",
          "**A growing resource library.** Every expert kit has seven core pieces: a training video, action guide, checklist, key takeaways, worksheet, slide deck and wall poster. New kits are added regularly.",
          "**Member-only partner deals.** Exclusive pricing from vetted companies serving law firms, better than their standard rates.",
          "**Live AMAs and training sessions.** Recurring live sessions with law-business experts, with replays anytime.",
          "**A community of firm owners.** Fellow owners carrying the same weight you do, curated by people rather than an algorithm.",
        ],
      },
      {
        heading: "A few things to know",
        bullets: [
          "Your founding rate is **$49/month** (or $490/year, two months free), locked for as long as your membership stays active. Members 101 to 500 join at $99/month, and the standard rate after that is $199/month.",
          "Every membership comes with a **money-back guarantee**, and you can cancel anytime.",
          "We are pre-launch while the founding expert bench and the first resource kits are assembled. Waitlist members hear first, and founding invitations go out in waitlist order. No payment happens until you confirm.",
        ],
      },
    ],
    cta: { label: "Visit the network", url: SITE_URL },
    closing:
      "Questions in the meantime? Reply to this email. We read and respond to every message.",
    signoff: { line: "Welcome aboard." },
    footerNote: `This is an automated confirmation of your waitlist signup on ${submitted}. If this was not you, just ignore it. ${NOT_LEGAL_ADVICE}`,
    contactEmail: SUPPORT_EMAIL,
    reference: opts.referenceId,
  });

  return sendAndLog(
    "member_waitlist_confirmation",
    { to: opts.email, subject, html, replyTo: MEMBERS_EMAIL },
    { referenceId: opts.referenceId }
  );
}

// ---------------------------------------------------------------------------
// 2. MEMBER: activation welcome (admin activates a member)
// ---------------------------------------------------------------------------
export async function sendMemberWelcomeEmail(opts: {
  email: string;
  firstName?: string | null;
}) {
  const first = firstNameOf(opts.firstName);
  const subject = "Your founding spot is confirmed | Law Member Network";

  const html = renderBranded({
    previewText:
      "Your founding membership is confirmed at the locked $49/month rate. Here is what happens next.",
    eyebrow: "Founding Member · Confirmed",
    headline: `Welcome, ${first}.`,
    intro: [
      `Hi ${first},`,
      "Your founding spot on the Law Member Network is confirmed. Your **$49/month founding rate is locked in** and never increases for as long as your membership stays active.",
    ],
    sections: [
      {
        heading: "What happens next",
        bullets: [
          "Our team will reach out to you personally with your membership setup and payment details. Exactly as promised, **you confirm before any charge**.",
          "The member portal opens with the network at launch: the Expert Hotline (a reply by text and email in 2 to 3 business days), the resource library with new kits added regularly, member-only partner deals, and live AMAs and training sessions.",
        ],
      },
      {
        heading: "A few things to know",
        bullets: [
          "Your founding status is permanent. As the network grows you keep every new feature at the same $49/month (or $490/year) rate for as long as your membership stays active.",
          "Every membership comes with a **money-back guarantee**, and you can cancel anytime.",
        ],
      },
    ],
    cta: { label: "Visit the network", url: SITE_URL },
    closing:
      "Questions? Reply to this email. Our team reads and responds to every message.",
    signoff: { line: "Welcome aboard." },
    footerNote: `You are receiving this because our team confirmed your founding membership on the Law Member Network. ${NOT_LEGAL_ADVICE}`,
    contactEmail: SUPPORT_EMAIL,
  });

  return sendAndLog("member_welcome", {
    to: opts.email,
    subject,
    html,
    replyTo: MEMBERS_EMAIL,
  });
}

// ---------------------------------------------------------------------------
// 3. EXPERT: application received
// ---------------------------------------------------------------------------
export async function sendExpertConfirmationEmail(opts: {
  email: string;
  fullName?: string | null;
}) {
  const first = firstNameOf(opts.fullName);
  const subject = "Application received | Law Member Network experts";

  const html = renderSimple({
    headline: "Application received.",
    paragraphs: [
      `Hi ${first},`,
      "Thanks for applying to become an expert on the Law Member Network. Our team reviews every application personally, for fit, and we will be in touch soon.",
      "A quick reminder of how it works: you share one recording of you teaching your topic, we produce your full content kit in your branding, and interested members reach out to you directly. Your first 6 months are free, then $49/month, then $199/month from month 13. On any paid course you sell to members, **you keep 70%**.",
      "Every expert is vetted for real experience with law firms before being featured, and Expert Hotline referrals are routed by fit, never pay-to-play.",
    ],
    contactEmail: PARTNERSHIPS_EMAIL,
    footerNote: NOT_LEGAL_ADVICE,
  });

  return sendAndLog("expert_application_received", {
    to: opts.email,
    subject,
    html,
    replyTo: PARTNERSHIPS_EMAIL,
  });
}

// ---------------------------------------------------------------------------
// 4. EXPERT: approved (PUBLIC ramp). For inbound applicants only.
//    The hand-picked founding 20 get sendFoundingExpertEmail instead.
// ---------------------------------------------------------------------------
export async function sendExpertApprovalEmail(opts: {
  email: string;
  fullName?: string | null;
}) {
  const first = firstNameOf(opts.fullName);
  const subject = "You're approved | Law Member Network experts";

  const html = renderBranded({
    previewText:
      "Your expert application is approved. Our team will reach out to schedule your onboarding.",
    eyebrow: "Expert Application · Approved",
    headline: `Welcome to the network, ${first}.`,
    intro: [
      `Hi ${first},`,
      "Great news: your application to join the Law Member Network as an expert is approved. We review every expert personally, and you are exactly the kind of fit the network was built around.",
    ],
    sections: [
      {
        heading: "What happens next",
        bullets: [
          "Our team will reach out to you personally to schedule your onboarding conversation and walk you through everything.",
          "You share **one recording** of you teaching your topic. We produce your full kit in your branding: training video, action guide, checklist, key takeaways, worksheet, slide deck and wall poster. You approve it before anything goes live.",
          "Every resource carries a book-a-meeting button, so interested members reach out to you directly.",
        ],
      },
      {
        heading: "Your terms",
        bullets: [
          "Your first **6 months are free**, then **$49/month**, then **$199/month** from month 13.",
          "On any paid course you sell to members, **you keep 70%** and the network keeps 30%. You set your own prices.",
          "Expert Hotline referrals are routed by fit, never pay-to-play.",
        ],
      },
    ],
    cta: { label: "Visit the network", url: SITE_URL },
    closing:
      "Questions before we talk? Reply to this email and our team will get back to you within one business day.",
    signoff: { line: "Welcome to the bench." },
    footerNote: `You are receiving this because our team approved your expert application on the Law Member Network. ${NOT_LEGAL_ADVICE}`,
    contactEmail: PARTNERSHIPS_EMAIL,
  });

  return sendAndLog("expert_approved", {
    to: opts.email,
    subject,
    html,
    replyTo: PARTNERSHIPS_EMAIL,
  });
}

// ---------------------------------------------------------------------------
// 5. EXPERT: private founding invite. FREE FOR LIFE.
//
//    INTERNAL. This is the ONLY email in which free-for-life appears. It is
//    sent by the team to one of the hand-picked 20, never by the public apply
//    route. An invited founding expert who goes through the public form gets
//    the standard ramp and a card demand, which is the wrong deal.
// ---------------------------------------------------------------------------
export async function sendFoundingExpertEmail(opts: {
  email: string;
  fullName?: string | null;
  inviteUrl: string;
}) {
  const first = firstNameOf(opts.fullName);
  const subject = `You're in, ${first}. Welcome to the Law Member Network.`;

  const html = renderBranded({
    previewText:
      "Your founding expert listing is free for life. Here is what happens next.",
    eyebrow: "Founding Expert · Invitation",
    headline: `Welcome to the bench, ${first}.`,
    intro: [
      `Hi ${first},`,
      "Welcome to the Law Member Network as a **founding expert**. Your expert listing is **free for life**, and no payment details are needed.",
    ],
    sections: [
      {
        heading: "What happens next",
        bullets: [
          "Review and accept your founding agreement using the link below. It is personalised to you and takes a minute.",
          "Our team will reach out personally to schedule your onboarding conversation.",
          "You share **one recording** of you teaching your topic. We produce your full kit (training video, action guide, checklist, key takeaways, worksheet, slide deck and wall poster) in your branding, and you approve it before anything goes live.",
          "Your profile and resource kit go live at launch, and every resource carries a book-a-meeting button so members reach out to you directly.",
        ],
      },
      {
        heading: "Your founding terms",
        bullets: [
          "Your founding expert listing is **free for life**, for as long as it stays active. There is nothing to set up and no billing.",
          "On any paid course you sell to members, **you keep 70%**. You set your own prices.",
          "Expert Hotline referrals are routed by fit, never pay-to-play.",
        ],
      },
    ],
    cta: { label: "Review and accept your agreement", url: opts.inviteUrl },
    closing:
      "This link is private to you, so please do not forward it. Questions before we talk? Just reply to this email.",
    signoff: { line: "Welcome to the bench." },
    footerNote: `You are receiving this because our team invited you as a founding expert on the Law Member Network. ${NOT_LEGAL_ADVICE}`,
    contactEmail: PARTNERSHIPS_EMAIL,
  });

  return sendAndLog("founding_expert_invite", {
    to: opts.email,
    subject,
    html,
    replyTo: PARTNERSHIPS_EMAIL,
  });
}

// ---------------------------------------------------------------------------
// 6. PARTNER: application received
// ---------------------------------------------------------------------------
export async function sendPartnerConfirmationEmail(opts: {
  email: string;
  contactName?: string | null;
}) {
  const first = firstNameOf(opts.contactName);
  const subject = "Partner application received | Law Member Network";

  const html = renderSimple({
    headline: "Application received.",
    paragraphs: [
      `Hi ${first},`,
      "Thanks for applying to become a founding partner of the Law Member Network. Our team reviews every application personally and we will be in touch soon.",
      "A quick reminder of the terms: your first 6 months are free, then $49/month, then $199/month from month 13. Founding partners get **priority placement** in their category.",
      "Partners can also turn on the Expert capability and contribute educational content. It clears the same quality bar as any expert content, and Hotline routing is always by fit, never pay-to-play.",
    ],
    contactEmail: PARTNERSHIPS_EMAIL,
    footerNote: NOT_LEGAL_ADVICE,
  });

  return sendAndLog("partner_application_received", {
    to: opts.email,
    subject,
    html,
    replyTo: PARTNERSHIPS_EMAIL,
  });
}

// ---------------------------------------------------------------------------
// 7. PARTNER: approved
// ---------------------------------------------------------------------------
export async function sendPartnerApprovalEmail(opts: {
  email: string;
  contactName?: string | null;
  companyName: string;
}) {
  const first = firstNameOf(opts.contactName);
  const subject = "You're approved | Law Member Network partners";

  const html = renderBranded({
    previewText: `${opts.companyName} is approved as a founding partner. Our team will reach out to finalise your listing.`,
    eyebrow: "Partner Application · Approved",
    headline: `You're in, ${first}.`,
    intro: [
      `Hi ${first},`,
      `Great news: **${opts.companyName}** is approved as a **founding partner** of the Law Member Network. We review every partner personally, and you are one of our founding partners.`,
    ],
    sections: [
      {
        heading: "What happens next",
        bullets: [
          "Our team will reach out to you personally to finalise your listing: your logo, the exact wording of your member deal, and your booking link.",
          "As a founding partner you get **priority placement** in your category, and the **Verified Partner badge** goes live with your listing when the network opens.",
          "Member leads route directly to you, and you will see the channel working through your dashboard as the platform rolls out.",
        ],
      },
      {
        heading: "Your founding terms",
        bullets: [
          "Your first **6 months are free**, then **$49/month**, then **$199/month** from month 13. Annual billing is two months free.",
          "The partner commitments apply: your best deal for members, stay reachable, a working booking link, 30 days' notice on offer changes, and the fee after your free period.",
          "You are welcome to contribute educational content as an expert too. Same quality bar, and Hotline routing stays by fit rather than by who paid.",
        ],
      },
    ],
    cta: { label: "Visit the network", url: SITE_URL },
    closing:
      "Questions? Reply to this email and our partnerships team will get back to you.",
    signoff: { line: "Welcome aboard." },
    footerNote: `You are receiving this because our team approved your partner application on the Law Member Network. ${NOT_LEGAL_ADVICE}`,
    contactEmail: PARTNERSHIPS_EMAIL,
  });

  return sendAndLog("partner_approved", {
    to: opts.email,
    subject,
    html,
    replyTo: PARTNERSHIPS_EMAIL,
  });
}

// ---------------------------------------------------------------------------
// 8. ADMIN: sign-in code (fallback when Supabase Auth SMTP is not configured)
//    NOT fail-soft: if this does not send, the admin cannot sign in, so the
//    caller surfaces the failure rather than pretending it worked.
// ---------------------------------------------------------------------------
export async function sendAdminCodeEmail(opts: { email: string; code: string }) {
  const subject = `Your Law Member Network sign-in code: ${opts.code}`;

  const html = renderSimple({
    headline: "Your admin sign-in code",
    paragraphs: ["Enter this code in the Law Member Network admin console to sign in."],
    html: `<div style="margin:22px 0;padding:18px;border:1px solid #d8d2c4;border-radius:10px;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:9px;color:#1B3A5C">${opts.code}</div>
    <p style="margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#63737f">If you did not try to sign in to the Law Member Network admin console, you can ignore this email. The code is useless without access to this inbox.</p>`,
    contactEmail: SUPPORT_EMAIL,
  });

  return sendAndLog("admin_signin_code", {
    to: opts.email,
    subject,
    html,
    replyTo: SUPPORT_EMAIL,
  });
}
