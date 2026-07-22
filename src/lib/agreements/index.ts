import content from "./content.json";

/**
 * The four WEBSITE agreements, extracted verbatim from
 * LMN/Agreements/_render/*.html by scripts/extract-agreements.mjs.
 *
 * Regenerate after ANY change to the source documents:
 *   node scripts/extract-agreements.mjs
 *
 * The two PRIVATE founding agreements are intentionally absent. They are
 * invitation-only and must never be reachable from the public site.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ramp"; steps: Array<{ amount: string; label: string }> }
  | { type: "roles"; chips: Array<{ active: boolean; label: string }> }
  | { type: "field"; label: string; value: string }
  | { type: "note"; text: string };

export type Section = { heading: string | null; blocks: Block[] };

/**
 * The agreement version stamped on every founding invite and acceptance record.
 *
 * Bump this whenever the agreement text changes. Never edit a version in place:
 * each acceptance has to reference the exact wording the signer saw, which is
 * what makes the click-wrap binding.
 */
export const AGREEMENT_VERSION = "v4";

/*
 * NOTE: the agreement PDFs are deliberately NOT served by this site. They are
 * sent to individuals by the team (admin portal / founding invite flow). The
 * public pages render the same text extracted from the _render sources, so
 * nothing needs a download link. The `pdf` filename on each record is kept as
 * metadata for the send flow only.
 */

export type Agreement = {
  slug: string;
  pdf: string;
  docLabel: string | null;
  title: string;
  subtitle: string | null;
  parties: string | null;
  sections: Section[];
  footer: string | null;
};

const AGREEMENTS = content as unknown as Record<string, Agreement>;

/** Slug -> the human label used in nav and links. */
export const AGREEMENT_INDEX = [
  { slug: "member", label: "Member Agreement", who: "For members joining the network" },
  { slug: "expert", label: "Expert Agreement", who: "For experts contributing content" },
  { slug: "partner", label: "Partner Agreement", who: "For companies partnering with the network" },
  {
    slug: "expert-partner",
    label: "Expert + Partner Agreement",
    who: "For signers holding both capabilities",
  },
] as const;

export type AgreementSlug = (typeof AGREEMENT_INDEX)[number]["slug"];

export function getAgreement(slug: string): Agreement | null {
  return AGREEMENTS[slug] ?? null;
}

export function allAgreementSlugs(): string[] {
  return AGREEMENT_INDEX.map((a) => a.slug);
}

/**
 * Which agreement a signer is served, per LMN_Signup_Forms_Spec.md.
 * The ticked cross-role checkbox is what promotes a signer to the combined doc.
 */
export function agreementForRoles(opts: {
  expert?: boolean;
  partner?: boolean;
  member?: boolean;
}): AgreementSlug {
  if (opts.expert && opts.partner) return "expert-partner";
  if (opts.expert) return "expert";
  if (opts.partner) return "partner";
  return "member";
}
