import "server-only";
import { renderSimple, esc } from "./shell";
import { sendAndLog, SITE_URL, SUPPORT_EMAIL } from "./transport";

/**
 * Internal team alerts. Every signup, admin add, invite and approval fires one.
 *
 * Per LMN_Email_Domains.md every LMN alias forwards to these three Ekwa
 * inboxes, so this list is the real destination. Override with the
 * TEAM_DISTRIBUTION_LIST env var.
 */
export const TEAM_DISTRIBUTION_LIST = (
  process.env.TEAM_DISTRIBUTION_LIST ||
  "lester@ekwa.com,rushdha@ekwa.com,reshani@ekwa.com"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export type TeamEventKind =
  | "signup"
  | "admin_added"
  | "invite_sent"
  | "invite_accepted"
  | "approved";

export type TeamEventRole = "member" | "expert" | "partner" | "both";

const KIND_LABEL: Record<TeamEventKind, string> = {
  signup: "New signup",
  admin_added: "Added by admin",
  invite_sent: "Founding invite sent",
  invite_accepted: "Founding invite accepted",
  approved: "Approved",
};

/**
 * Best-effort internal alert. Call it with `void notifyTeamEvent(...)` so a
 * slow or failing SMTP server can never delay or break the user's response.
 */
export async function notifyTeamEvent(opts: {
  kind: TeamEventKind;
  role: TeamEventRole;
  name?: string | null;
  email?: string | null;
  adminLink?: string;
  highlight?: string;
  fields?: Array<[string, string | null | undefined]>;
}) {
  if (!TEAM_DISTRIBUTION_LIST.length) return;

  const roleLabel = opts.role.charAt(0).toUpperCase() + opts.role.slice(1);
  const subject = `[LMN] ${KIND_LABEL[opts.kind]}: ${roleLabel}${
    opts.name ? ` — ${opts.name}` : ""
  }`;

  const rows: Array<[string, string | null | undefined]> = [
    ["Event", KIND_LABEL[opts.kind]],
    ["Role", roleLabel],
    ["Name", opts.name],
    ["Email", opts.email],
    ...(opts.fields || []),
  ];

  const table = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin:6px 0 18px">
    ${rows
      .filter(([, v]) => v)
      .map(
        ([label, value]) =>
          `<tr>
            <td style="padding:8px 12px 8px 0;border-bottom:1px solid #eee;font-family:system-ui,sans-serif;font-size:13px;color:#63737f;white-space:nowrap;vertical-align:top">${esc(
              label
            )}</td>
            <td style="padding:8px 0;border-bottom:1px solid #eee;font-family:system-ui,sans-serif;font-size:14px;color:#22303f">${esc(
              String(value)
            )}</td>
          </tr>`
      )
      .join("")}
  </table>
  <a href="${esc(opts.adminLink || `${SITE_URL}/admin`)}" style="display:inline-block;padding:11px 22px;background:#1B3A5C;color:#fff;border-radius:8px;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;text-decoration:none">Review it in the admin console</a>`;

  const html = renderSimple({
    headline: KIND_LABEL[opts.kind],
    paragraphs: opts.highlight ? [opts.highlight] : [],
    html: table,
    contactEmail: SUPPORT_EMAIL,
    footerNote: "Internal notification. Not sent to the applicant.",
  });

  try {
    await sendAndLog(
      `team_${opts.kind}`,
      { to: TEAM_DISTRIBUTION_LIST, subject, html, replyTo: SUPPORT_EMAIL },
      { role: opts.role }
    );
  } catch (err) {
    console.error("[teamNotify] failed", err);
  }
}

/** Convenience wrapper for the three public signup routes. */
export function notifySignup(
  role: TeamEventRole,
  details: {
    name?: string | null;
    email?: string | null;
    fields?: Array<[string, string | null | undefined]>;
  }
) {
  return notifyTeamEvent({ kind: "signup", role, ...details });
}
