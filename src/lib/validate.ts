/**
 * Shared field validation for the three public signup forms.
 * Field sets follow LMN_Signup_Forms_Spec.md (with the five fixes applied).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function str(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export function isEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v.trim());
}

export function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
}

/**
 * Only http(s) URLs are accepted. Rejects javascript:, data: and friends,
 * which would otherwise be rendered as links in the admin console.
 */
export function safeUrl(v: unknown, max = 500): string | null {
  const raw = str(v, max);
  if (!raw) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().slice(0, max);
  } catch {
    return null;
  }
}

export function bool(v: unknown): boolean {
  return v === true || v === "true" || v === "on" || v === 1;
}

/**
 * Placeholder domains that must never receive a real email. Used to stop an
 * admin accidentally "sending" a founding invite into the void.
 */
export function isSendableEmail(v: unknown): v is string {
  if (!isEmail(v)) return false;
  const domain = normalizeEmail(v).split("@")[1] ?? "";
  return !/\.(invalid|local|example|test)$/.test(domain) && domain !== "example.com";
}
