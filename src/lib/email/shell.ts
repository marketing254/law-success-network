import { SITE_URL } from "./transport";

/**
 * The two email shells.
 *
 * Inline styles only. Never reference the site's CSS variables here: mail
 * clients strip <style> blocks and have no custom-property support, so the
 * Fraunces/Inter web fonts are approximated with Georgia/system-ui stacks.
 *
 * Brand: navy #1B3A5C, gold #C8993D, cream #F5ECD7 (Counsel Classic Premium).
 * Copy rule: no em-dashes anywhere in email bodies.
 */

const NAVY = "#1B3A5C";
const GOLD = "#C8993D";
const CREAM = "#F5ECD7";
const INK = "#22303f";
const MUTED = "#63737f";

const BODY_FONT =
  "system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const DISPLAY_FONT = "Georgia,'Times New Roman',serif";

export const ENTITY_LINE =
  "Law Member Network, a service offered by Ekwa Marketing Inc.";
export const CREDIT_LINE = "Powered by Dominate Law";

export type Section = { heading?: string; paragraphs?: string[]; bullets?: string[] };

export type BrandedEmail = {
  previewText: string;
  eyebrow: string;
  headline: string;
  intro: string[];
  sections?: Section[];
  cta?: { label: string; url: string };
  closing?: string;
  signoff?: { line: string; team?: string };
  footerNote: string;
  contactEmail: string;
  reference?: string;
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Copy may contain **bold** spans. Escape first, then apply the markup, so
 * user-supplied values (names, company names, offer text) can never inject HTML.
 */
function rich(s: string): string {
  return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function renderSection(s: Section): string {
  const heading = s.heading
    ? `<tr><td style="padding:26px 0 10px"><div style="font-family:${DISPLAY_FONT};font-size:17px;font-weight:700;color:${NAVY};letter-spacing:.2px">${esc(
        s.heading
      )}</div></td></tr>`
    : "";

  const paragraphs = (s.paragraphs || [])
    .map(
      (p) =>
        `<tr><td style="padding:0 0 12px;font-family:${BODY_FONT};font-size:15.5px;line-height:1.65;color:${INK}">${rich(
          p
        )}</td></tr>`
    )
    .join("");

  const bullets = (s.bullets || [])
    .map(
      (b) => `<tr><td style="padding:0 0 11px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="18" valign="top" style="padding-top:7px">
            <div style="width:7px;height:7px;border-radius:50%;background:${GOLD}"></div>
          </td>
          <td style="font-family:${BODY_FONT};font-size:15.5px;line-height:1.6;color:${INK}">${rich(
            b
          )}</td>
        </tr></table>
      </td></tr>`
    )
    .join("");

  return heading + paragraphs + bullets;
}

/** Rich journey shell: preview text, gradient bar, wordmark, eyebrow chip, sections, CTA, dark footer. */
export function renderBranded(e: BrandedEmail): string {
  const sections = (e.sections || []).map(renderSection).join("");

  const cta = e.cta
    ? `<tr><td style="padding:30px 0 6px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="background:${GOLD};border-radius:999px">
            <a href="${esc(e.cta.url)}" style="display:inline-block;padding:14px 30px;font-family:${BODY_FONT};font-size:15px;font-weight:700;color:#1a1408;text-decoration:none;border-radius:999px">${esc(
              e.cta.label
            )}</a>
          </td>
        </tr></table>
      </td></tr>`
    : "";

  const closing = e.closing
    ? `<tr><td style="padding:28px 0 0;border-top:1px solid #e6e1d5;margin-top:10px">
        <div style="padding-top:22px;font-family:${BODY_FONT};font-size:14.5px;line-height:1.65;color:${MUTED}">${rich(
          e.closing
        )}</div>
      </td></tr>`
    : "";

  const signoff = e.signoff
    ? `<tr><td style="padding:22px 0 0;font-family:${BODY_FONT};font-size:15px;line-height:1.7;color:${INK}">
        ${esc(e.signoff.line)}<br>
        <strong>${esc(e.signoff.team || "The Law Member Network Team")}</strong><br>
        <span style="color:${MUTED};font-size:13.5px">${esc(CREDIT_LINE)}</span>
      </td></tr>`
    : "";

  const reference = e.reference
    ? `<div style="margin-top:8px;color:#8fa3b5;font-size:12px">Reference: ${esc(
        e.reference
      )}</div>`
    : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(e.headline)}</title></head>
<body style="margin:0;padding:0;background:#f4f1ea">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(e.previewText)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1ea;padding:28px 12px">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 14px rgba(27,58,92,.08)">

    <tr><td style="height:5px;background:${GOLD};line-height:5px;font-size:0">&nbsp;</td></tr>

    <tr><td style="padding:28px 34px 0">
      <div style="font-family:${DISPLAY_FONT};font-size:19px;font-weight:700;color:${NAVY};letter-spacing:.3px">Law Member Network</div>
      <div style="font-family:${BODY_FONT};font-size:12.5px;color:${MUTED};margin-top:3px">${esc(CREDIT_LINE)}</div>
    </td></tr>

    <tr><td style="padding:22px 34px 0">
      <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:${CREAM};font-family:${BODY_FONT};font-size:11.5px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;color:#7a5a1c">${esc(
        e.eyebrow
      )}</span>
    </td></tr>

    <tr><td style="padding:14px 34px 0">
      <h1 style="margin:0;font-family:${DISPLAY_FONT};font-size:29px;line-height:1.22;font-weight:700;color:${NAVY}">${esc(
        e.headline
      )}</h1>
    </td></tr>

    <tr><td style="padding:18px 34px 34px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${e.intro
          .map(
            (p) =>
              `<tr><td style="padding:0 0 13px;font-family:${BODY_FONT};font-size:15.5px;line-height:1.68;color:${INK}">${rich(
                p
              )}</td></tr>`
          )
          .join("")}
        ${sections}
        ${cta}
        ${closing}
        ${signoff}
      </table>
    </td></tr>

    <tr><td style="background:${NAVY};padding:24px 34px">
      <div style="font-family:${BODY_FONT};font-size:12.5px;line-height:1.65;color:#c3d2df">${esc(
        e.footerNote
      )}</div>
      ${reference}
      <div style="margin-top:12px;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:#8fa3b5">
        ${esc(ENTITY_LINE)}<br>
        <a href="mailto:${esc(e.contactEmail)}" style="color:${GOLD};text-decoration:none">${esc(
          e.contactEmail
        )}</a> &middot;
        <a href="${esc(SITE_URL)}" style="color:${GOLD};text-decoration:none">lawmembernetwork.com</a>
      </div>
    </td></tr>

  </table>
</td></tr></table>
</body></html>`;
}

/** Simple shell: headline + paragraphs. Used for the "application received" acknowledgements. */
export function renderSimple(opts: {
  headline: string;
  paragraphs: string[];
  contactEmail: string;
  footerNote?: string;
  html?: string;
  /** Optional pill button rendered after the paragraphs. */
  cta?: { label: string; url: string };
}): string {
  const cta = opts.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px"><tr>
        <td style="background:${GOLD};border-radius:999px">
          <a href="${esc(opts.cta.url)}" style="display:inline-block;padding:13px 28px;font-family:${BODY_FONT};font-size:15px;font-weight:700;color:#1a1408;text-decoration:none;border-radius:999px">${esc(
            opts.cta.label
          )}</a>
        </td>
      </tr></table>`
    : "";
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(opts.headline)}</title></head>
<body style="margin:0;padding:0;background:#f4f1ea">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1ea;padding:28px 12px">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:14px;overflow:hidden">
    <tr><td style="height:5px;background:${GOLD};line-height:5px;font-size:0">&nbsp;</td></tr>
    <tr><td style="padding:30px 34px 0">
      <div style="font-family:${DISPLAY_FONT};font-size:18px;font-weight:700;color:${NAVY}">Law Member Network</div>
      <div style="font-family:${BODY_FONT};font-size:12.5px;color:${MUTED};margin-top:3px">${esc(CREDIT_LINE)}</div>
    </td></tr>
    <tr><td style="padding:22px 34px 0">
      <h1 style="margin:0;font-family:${DISPLAY_FONT};font-size:26px;line-height:1.25;font-weight:700;color:${NAVY}">${esc(
        opts.headline
      )}</h1>
    </td></tr>
    <tr><td style="padding:16px 34px 32px">
      ${opts.paragraphs
        .map(
          (p) =>
            `<p style="margin:0 0 13px;font-family:${BODY_FONT};font-size:15.5px;line-height:1.68;color:${INK}">${rich(
              p
            )}</p>`
        )
        .join("")}
      ${opts.html || ""}
      ${cta}
    </td></tr>
    <tr><td style="background:${NAVY};padding:22px 34px">
      ${
        opts.footerNote
          ? `<div style="font-family:${BODY_FONT};font-size:12.5px;line-height:1.6;color:#c3d2df;margin-bottom:10px">${esc(
              opts.footerNote
            )}</div>`
          : ""
      }
      <div style="font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:#8fa3b5">
        ${esc(ENTITY_LINE)}<br>
        <a href="mailto:${esc(opts.contactEmail)}" style="color:${GOLD};text-decoration:none">${esc(
          opts.contactEmail
        )}</a> &middot;
        <a href="${esc(SITE_URL)}" style="color:${GOLD};text-decoration:none">lawmembernetwork.com</a>
      </div>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

export { esc };
