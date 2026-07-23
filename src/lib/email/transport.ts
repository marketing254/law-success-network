import "server-only";
import nodemailer from "nodemailer";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type MailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
};

export type MailResult = {
  sent: boolean;
  provider: string;
  reason?: string;
};

export const FROM_EMAIL =
  process.env.WAITLIST_EMAIL_FROM || "Law Member Network <noreply@lawmembernetwork.com>";
export const SUPPORT_EMAIL =
  process.env.WAITLIST_SUPPORT_EMAIL || "support@lawmembernetwork.com";
export const MEMBERS_EMAIL =
  process.env.WAITLIST_MEMBERS_EMAIL || "members@lawmembernetwork.com";
export const PARTNERSHIPS_EMAIL =
  process.env.WAITLIST_PARTNERSHIPS_EMAIL || "founding@lawmembernetwork.com";
/**
 * The site URL used inside EMAILS. Every "Visit the network" button points
 * here and nowhere else — never at anything an applicant typed into a form.
 * A localhost NEXT_PUBLIC_APP_URL (local dev) is ignored on purpose: a real
 * email carrying a localhost link is broken for its recipient no matter where
 * it was generated.
 */
const rawSiteUrl = process.env.NEXT_PUBLIC_APP_URL || "";
export const SITE_URL =
  !rawSiteUrl || /^https?:\/\/(localhost|127\.|0\.0\.0\.0)/i.test(rawSiteUrl)
    ? "https://lawmembernetwork.com"
    : rawSiteUrl;

/** Crude but adequate HTML -> text fallback for the plain-text alternative. */
function toPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h1|h2|h3|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Sends via the first configured transport: SMTP -> Gmail -> Resend -> log-only.
 *
 * NEVER throws into the response path. A failed email is logged and recorded in
 * email_events; the signup itself still succeeds. Losing a confirmation email is
 * recoverable, losing the signup row is not.
 */
export async function dispatchMail(input: MailInput): Promise<MailResult> {
  if (process.env.WAITLIST_EMAIL_DISABLED === "true") {
    return { sent: false, provider: "disabled", reason: "disabled" };
  }

  const from = input.from || FROM_EMAIL;
  const text = input.text || toPlainText(input.html);

  try {
    // 1. Generic SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const port = Number(process.env.SMTP_PORT || 465);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465, // 465 implicit TLS, 587 STARTTLS
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({ ...input, from, text });
      return { sent: true, provider: "smtp" };
    }

    // 2. Gmail (dev / legacy)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      await transporter.sendMail({ ...input, from, text });
      return { sent: true, provider: "gmail" };
    }

    // 3. Resend
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: Array.isArray(input.to) ? input.to : [input.to],
          subject: input.subject,
          html: input.html,
          text,
          reply_to: input.replyTo,
        }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
      return { sent: true, provider: "resend" };
    }

    // 4. Log-only
    console.info("[email:log-only]", {
      to: input.to,
      subject: input.subject,
      replyTo: input.replyTo,
    });
    console.info(text);
    return { sent: false, provider: "log", reason: "no transport configured" };
  } catch (err) {
    console.error("[email] send failed", err);
    return {
      sent: false,
      provider: "error",
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
}

/** Records the delivery attempt. Best-effort: never blocks or throws. */
export async function logEmailEvent(params: {
  template: string;
  recipient: string | string[];
  subject: string;
  result: MailResult;
  metadata?: Record<string, unknown>;
}) {
  try {
    await getSupabaseAdmin()
      .from("email_events")
      .insert({
        template: params.template,
        recipient: Array.isArray(params.recipient)
          ? params.recipient.join(",")
          : params.recipient,
        subject: params.subject,
        provider: params.result.provider,
        status: params.result.sent
          ? "queued"
          : params.result.provider === "disabled"
            ? "disabled"
            : "failed",
        error: params.result.reason ?? null,
        metadata: params.metadata ?? {},
      });
  } catch (err) {
    console.error("[email] failed to log email_event", err);
  }
}

/** Send + log in one call. Returns the result; never throws. */
export async function sendAndLog(
  template: string,
  input: MailInput,
  metadata?: Record<string, unknown>
): Promise<MailResult> {
  const result = await dispatchMail(input);
  await logEmailEvent({
    template,
    recipient: input.to,
    subject: input.subject,
    result,
    metadata,
  });
  return result;
}
