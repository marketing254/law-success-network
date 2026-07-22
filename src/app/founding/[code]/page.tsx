import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import SiteFooter from "@/components/site/SiteFooter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The private founding-invite landing page.
 *
 * Unlisted and unguessable: reachable only via the 24-char code the admin
 * console mails. It is never linked from the site and must never be indexed,
 * because it shows terms (the founding cohort is free for life) that are
 * deliberately absent from every public page.
 *
 * Phase 1 shows the invitee their terms and tells them what happens next.
 * The "I agree" click-wrap, the acceptance record (IP, user agent, agreement
 * version) and the Stripe card capture come with the Agree and Pay build,
 * per Agreements/LMN_Esign_Stripe_Dev_Spec.md.
 */
export const metadata: Metadata = {
  title: "Your founding invitation | Law Member Network",
  robots: { index: false, follow: false, nocache: true },
};

type Props = { params: Promise<{ code: string }> };

export default async function FoundingInvitePage({ params }: Props) {
  const { code } = await params;

  // Codes are 24 url-safe chars. Reject anything else before touching the DB.
  if (!/^[A-Za-z0-9_-]{16,32}$/.test(code)) notFound();

  const db = getSupabaseAdmin();
  const { data: invite } = await db
    .from("founding_invites")
    .select(
      "id, code, role, full_name, company_name, member_offer, status, agreement_version, viewed_at, expires_at"
    )
    .eq("code", code)
    .maybeSingle();

  // A revoked or missing invite is a 404, not an explanation. Nothing here
  // should confirm to a stranger that a code once existed.
  if (!invite || invite.status === "revoked") notFound();

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return (
      <>
        <main className="sec">
          <div className="wrap" style={{ maxWidth: 720 }}>
            <div className="kicker">Founding invitation</div>
            <div className="h2">This invitation has expired.</div>
            <p className="lead">
              Reply to the email we sent you and we&rsquo;ll issue a fresh link.
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // Stamp the first view so the team can see who has opened their invite.
  if (!invite.viewed_at && invite.status === "sent") {
    await db
      .from("founding_invites")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", invite.id);
  }

  const isExpert = invite.role === "expert" || invite.role === "both";
  const isPartner = invite.role === "partner" || invite.role === "both";
  const firstName = String(invite.full_name).trim().split(/\s+/)[0];

  return (
    <>
      <main className="sec">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="kicker">Founding invitation</div>
          <h1 className="h2">Welcome to the bench, {firstName}.</h1>
          <p className="lead">
            This invitation is personal to you. Please don&rsquo;t forward it. The link is
            what identifies you.
          </p>

          <div className="formcard" style={{ marginTop: 32 }}>
            <h3 style={{ fontFamily: "var(--disp)", fontSize: 21, marginBottom: 14 }}>
              Your founding terms
            </h3>
            <ul className="wperks">
              {isExpert ? (
                <li>
                  <span className="tk">&#10003;</span>
                  <span>
                    <b>Your founding expert listing is free for life</b>, for as long as it stays
                    active. There is nothing to set up and no billing.
                  </span>
                </li>
              ) : null}
              {isExpert ? (
                <li>
                  <span className="tk">&#10003;</span>
                  <span>
                    On any paid course you sell to members, <b>you keep 70%</b>. You set your own
                    prices.
                  </span>
                </li>
              ) : null}
              {isPartner ? (
                <li>
                  <span className="tk">&#10003;</span>
                  <span>
                    <b>{invite.company_name}</b> joins as a founding partner with priority placement
                    in its category and the Verified Partner badge at launch.
                  </span>
                </li>
              ) : null}
              {isPartner ? (
                <li>
                  <span className="tk">&#10003;</span>
                  <span>
                    Your first <b>6 months are free</b>, then $49/month, then $199/month from month
                    13.
                  </span>
                </li>
              ) : null}
              <li>
                <span className="tk">&#10003;</span>
                <span>
                  Expert Hotline referrals are routed by fit, <b>never pay-to-play</b>.
                </span>
              </li>
            </ul>

            {isPartner && invite.member_offer ? (
              <>
                <h3
                  style={{
                    fontFamily: "var(--disp)",
                    fontSize: 19,
                    margin: "26px 0 10px",
                  }}
                >
                  Your member offer on file
                </h3>
                <p style={{ color: "var(--muted)" }}>{invite.member_offer}</p>
                <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>
                  This is what members will see. Reply to your invitation email if anything needs
                  correcting before it goes live.
                </p>
              </>
            ) : null}

            <h3
              style={{ fontFamily: "var(--disp)", fontSize: 19, margin: "26px 0 10px" }}
            >
              What happens next
            </h3>
            <p style={{ color: "var(--muted)" }}>
              Our team will reach out personally to schedule your onboarding conversation and walk
              you through your agreement ({invite.agreement_version}). Your profile
              {isExpert ? " and resource kit" : ""} go live at launch.
            </p>
            <p style={{ color: "var(--muted)", marginTop: 12 }}>
              Questions in the meantime? Reply to your invitation email, or write to{" "}
              <a href="mailto:support@lawmembernetwork.com">support@lawmembernetwork.com</a>.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
