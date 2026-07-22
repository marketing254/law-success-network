/**
 * Extracts the four WEBSITE agreements from LMN/Agreements/_render/*.html into
 * src/lib/agreements/content.json.
 *
 * The _render HTML files are the exact sources the signed PDFs were built from,
 * so parsing them is what guarantees the on-site wording and the PDF wording
 * cannot drift. Nothing here paraphrases: every string is lifted verbatim.
 *
 * The two PRIVATE founding agreements are deliberately NOT extracted. They are
 * invitation-only and must never be reachable on the public site.
 *
 * Re-run after any change to the source documents:
 *   node scripts/extract-agreements.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const RENDER_DIR = join(here, "..", "..", "LMN", "Agreements", "_render");
const OUT = join(here, "..", "src", "lib", "agreements", "content.json");

const DOCS = [
  { slug: "member", file: "WEBSITE - Member Agreement.html", pdf: "lmn-member-agreement.pdf" },
  { slug: "expert", file: "WEBSITE - Expert Agreement.html", pdf: "lmn-expert-agreement.pdf" },
  { slug: "partner", file: "WEBSITE - Partner Agreement.html", pdf: "lmn-partner-agreement.pdf" },
  {
    slug: "expert-partner",
    file: "WEBSITE - Expert + Partner Agreement.html",
    pdf: "lmn-expert-partner-agreement.pdf",
  },
];

/** Decode the handful of entities these documents actually use. */
function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rsquo;/g, "’")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");
}

/** Strip tags and collapse whitespace. Inline <b> is preserved as **bold**. */
function text(html) {
  return decode(
    html
      .replace(/<b>(.*?)<\/b>/gi, "**$1**")
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function grab(html, re) {
  const m = html.match(re);
  return m ? text(m[1]) : null;
}

/**
 * Walks the body in document order, emitting a block per element.
 *
 * The source has unclosed <div class="sec"> wrappers, so relying on nesting
 * would be fragile; a linear scan is not. Beyond h2/p/ul these documents carry
 * three bespoke constructs that are NOT paragraphs and would be silently lost
 * if we only scanned the standard tags:
 *
 *   .ramp   the $0 / $49 / $199 pricing steps  <- real pricing terms
 *   .roles  the Expert / Partner capability chips (a tick marks the ones this
 *           document covers)
 *   .fld    the acceptance-record fields (label + the value taken from sign-up)
 *
 * Anything matched here is emitted in the order it appears, so the rendered
 * page follows the same sequence as the PDF.
 */
function parseBody(html) {
  const body = html.slice(html.indexOf("<body"));
  const sections = [];
  let current = null;

  // Each document contains exactly ONE ramp and ONE roles block. Matching them
  // inline is what produced truncated results (the non-greedy </div> terminator
  // stopped at the first nested close), so they are pre-scanned globally here
  // and emitted when the linear walk reaches their opening marker.
  const rampSteps = [
    ...body.matchAll(/<div class="n">([\s\S]*?)<\/div>\s*<div class="l">([\s\S]*?)<\/div>/gi),
  ]
    .map((s) => ({ amount: text(s[1]), label: text(s[2]) }))
    .filter((s) => s.amount);

  const roleChips = [...body.matchAll(/<div class="chip">((?:(?!<\/?div)[\s\S])*)<\/div>/gi)].map(
    (c) => ({
      // A <span class="k"> tick marks the capabilities this document covers.
      active: /class="k"/.test(c[1]),
      label: text(c[1]).replace(/[✓✓]/g, "").trim(),
    })
  );

  // The LAST .small is the document's version/footer line; any earlier ones are
  // inline notes belonging to the section they sit in. Grabbing the first as
  // the footer silently swaps a note for the version stamp.
  const smalls = [...body.matchAll(/<div class=["']small["'][^>]*>([\s\S]*?)<\/div>/gi)].map((s) =>
    text(s[1])
  );
  const footerText = smalls.length ? smalls[smalls.length - 1] : null;

  const re =
    /<(h2|p|ul)\b[^>]*>([\s\S]*?)<\/\1>|<div class="(ramp|roles)">|<div class="fld"[^>]*>([\s\S]*?)<\/div>\s*<\/div>|<div class=["']small["'][^>]*>([\s\S]*?)<\/div>/gi;

  let m;
  while ((m = re.exec(body)) !== null) {
    const [, tag, inner, marker, fld, small] = m;

    // --- inline note (not the trailing version line) -----------------------
    if (small !== undefined) {
      const t = text(small);
      if (t && t !== footerText && current) current.blocks.push({ type: "note", text: t });
      continue;
    }

    // --- pricing ramp -----------------------------------------------------
    if (marker === "ramp") {
      if (rampSteps.length && current) current.blocks.push({ type: "ramp", steps: rampSteps });
      continue;
    }

    // --- capability chips -------------------------------------------------
    if (marker === "roles") {
      if (roleChips.length) {
        sections.push({ heading: null, blocks: [{ type: "roles", chips: roleChips }] });
      }
      continue;
    }

    // --- acceptance-record fields ----------------------------------------
    if (fld !== undefined) {
      const label = grab(fld, /<div class="q">([\s\S]*?)<\/div>/i);
      const value = grab(fld, /<div class="line">([\s\S]*?)<\/div>/i);
      if (label && current) current.blocks.push({ type: "field", label, value: value ?? "" });
      continue;
    }

    // --- standard tags ----------------------------------------------------
    if (tag.toLowerCase() === "h2") {
      current = { heading: text(inner), blocks: [] };
      sections.push(current);
      continue;
    }
    // Anything before the first h2 belongs to the preamble, handled separately.
    if (!current) continue;

    if (tag.toLowerCase() === "p") {
      const t = text(inner);
      if (t) current.blocks.push({ type: "p", text: t });
    } else {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li) => text(li[1]))
        .filter(Boolean);
      if (items.length) current.blocks.push({ type: "ul", items });
    }
  }
  return sections;
}

const out = {};

for (const doc of DOCS) {
  const html = readFileSync(join(RENDER_DIR, doc.file), "utf8");

  // The source documents mix quote styles: the member agreement uses
  // class='sub', the others use class="sub". Match either, or fields go
  // silently missing.
  const record = {
    slug: doc.slug,
    pdf: doc.pdf,
    docLabel: grab(html, /data-doclabel=["']([^"']+)["']/) ?? null,
    title: grab(html, /<h1>([\s\S]*?)<\/h1>/i),
    subtitle: grab(html, /<div class=["']sub["']>([\s\S]*?)<\/div>/i),
    parties: grab(html, /<div class=["']parties["']>([\s\S]*?)<\/div>/i),
    sections: parseBody(html),
    footer: (() => {
      const all = [
        ...html.matchAll(/<div class=["']small["'][^>]*>([\s\S]*?)<\/div>/gi),
      ].map((s) => text(s[1]));
      return all.length ? all[all.length - 1] : null;
    })(),
  };

  // Fail loudly rather than shipping a quietly incomplete agreement. Silent
  // under-extraction is the dangerous failure here: a page that looks fine but
  // is missing a pricing step or a clause is worse than no page at all.
  for (const field of ["title", "subtitle", "parties", "footer", "docLabel"]) {
    if (!record[field]) {
      throw new Error(`Extraction failed for ${doc.file}: "${field}" is empty.`);
    }
  }
  if (!record.sections.length) {
    throw new Error(`Extraction failed for ${doc.file}: no sections.`);
  }

  const srcBody = html.slice(html.indexOf("<body"));
  const expect = (label, actual, wanted) => {
    if (actual !== wanted) {
      throw new Error(
        `Extraction mismatch in ${doc.file}: ${label} — got ${actual}, source has ${wanted}.`
      );
    }
  };
  const countTag = (t) => (srcBody.match(new RegExp(`<${t}[ >]`, "gi")) || []).length;
  const blocks = record.sections.flatMap((s) => s.blocks);

  expect("h2 headings", record.sections.filter((s) => s.heading).length, countTag("h2"));
  expect("lists", blocks.filter((b) => b.type === "ul").length, countTag("ul"));
  expect(
    "list items",
    blocks.filter((b) => b.type === "ul").reduce((n, b) => n + b.items.length, 0),
    countTag("li")
  );
  expect(
    "ramp steps",
    blocks.filter((b) => b.type === "ramp").reduce((n, b) => n + b.steps.length, 0),
    (srcBody.match(/class="rstep"/g) || []).length
  );
  expect(
    "role chips",
    blocks.filter((b) => b.type === "roles").reduce((n, b) => n + b.chips.length, 0),
    (srcBody.match(/class="chip"/g) || []).length
  );

  out[doc.slug] = record;
  console.log(
    `${doc.slug.padEnd(15)} ${record.sections.length} sections, ${blocks.length} blocks — "${record.title}"`
  );
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`\nWrote ${OUT}`);
