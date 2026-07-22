# Law Member Network — Next.js app

Migration of the static `LMN/Dev_Handoff` build into Next.js 15 (App Router), plus the
Supabase schema, the three signup APIs, the transactional emails, and the admin console.

**Phase 1 (waitlist mode).** No Stripe, no e-sign, no member/expert/partner portals — matching
`Dev_Handoff/DEV_HANDOVER.md`. The schema is wired for Phase 2 up front so nothing needs
migrating later.

---

## 1. Run it

```bash
npm install
cp .env.example .env.local     # fill in Supabase + email
npm run dev                    # http://localhost:3000
```

Without `SUPABASE_SERVICE_ROLE_KEY` the signup routes return a 500 (by design — the app refuses
to start a write it cannot audit). Without any mail transport, emails are logged to the console
instead of sent, so the whole flow is still testable locally.

## 2. Supabase setup

Create a new Supabase project for LMN, then run the files in `supabase/migrations/` **in
numeric order** in the SQL editor:

| File | What it does |
|---|---|
| `0001_core_schema.sql` | `waitlist_signups`, `members`, `expert_applications`, `experts`, `partner_applications`, `partners` |
| `0002_admin_audit_notifications.sql` | `admin_users`, `review_actions`, `auth_audit`, `notifications`, `email_events`, `founding_invites` |
| `0003_rls_policies.sql` | **Never skip.** RLS on every table, no anon/authenticated policies |
| `0004_grants.sql` | **Never skip.** Revokes table grants from the browser-facing roles |
| `0005_admin_seed.sql` | Seeds the admin team (edit the emails first) |
| `0006_verify.sql` | Verification queries — every column must return `true` |

**Security model:** anon and authenticated roles can read nothing. Every read and write goes
through a server-side route handler using the service-role key. The anon key ships to the
browser, so it is treated as public and given no privileges.

In the Supabase dashboard also configure **Auth → Email templates** for the OTP (`{{ .Token }}`
renders the 6-digit code) and point Auth at your SMTP, or admin sign-in codes will not arrive.

## 3. Naming: partners, not vendors

The DMN reference build calls this table `vendors` and only labels it "Partners" in the UI.
LMN is a fresh project with no legacy rows, so the table, the API route and the URL are all
`partners`. If you port code from DMN, rename accordingly.

## 4. What exists

### Public site
| Route | Source |
|---|---|
| `/` | `Dev_Handoff/index.html` |
| `/experts` | `Dev_Handoff/experts.html` |
| `/partners` | `Dev_Handoff/partners.html` |
| `/founding/<code>` | Private invite landing page (noindex, unlisted) |

`assets/lmn.js` is ported to `src/components/site/MotionLayer.tsx` — same reveals, parallax,
count-ups, tilt, magnetic buttons, pricing toggle, FAQ, line-draw and marquee, with proper
teardown on navigation. `assets/lmn.css` is `src/app/lmn.css`, unchanged apart from pointing
`--disp`/`--body` at the next/font variables.

Fonts are self-hosted via `next/font`, so the site now has **zero** third-party requests.

### Signup APIs
| Route | Writes |
|---|---|
| `POST /api/waitlist` | `waitlist_signups` + confirmation email + team alert |
| `POST /api/expert/signup` | `expert_applications` + confirmation email + team alert |
| `POST /api/partner/signup` | `partner_applications` **and** `partners` (pending) + confirmation + team alert |

All three: salted-hash the IP (never stored raw), rate-limit per IP+email, treat a duplicate
email as success, and never let an email failure fail the signup.

### Admin console — `/admin`
Email OTP sign-in, gated on an **active `admin_users` row**. Pages: Dashboard, Waitlist,
Members, Experts, Partners, Founding invites, Admin team, Audit log.

| Queue | Actions |
|---|---|
| Waitlist | `new / contacted / converted / declined`, activate as member, CSV export |
| Members | activate (welcome email), deactivate, reactivate, delete (owner only) |
| Experts | `start_review / approve / decline / mark_onboarded / reset` — **approve** provisions + emails, first time only |
| Partners | `approve / reject / suspend / unsuspend` — **approve** sets verified + emails, first time only |
| Founding invites | create **draft** (emails nothing), send, revoke, notify team |
| Admin team | add / activate / deactivate / change role (owner only) |

Every mutation writes a `review_actions` audit row; approvals also write `notifications` and
`email_events`.

## 5. The two safety rules baked in

**Founding invites are draft-first.** Creating one writes a draft row and emails nobody. `send`
is a separate, explicit action, refuses placeholder addresses, and — unlike every other email
in the app — is *not* fail-soft: if the send fails the invite is not marked sent. These invites
carry free-for-life terms that appear nowhere public, so an accidental send is an unintended
offer, not a cosmetic slip.

**The private agreements are not in `public/`.** Only the four WEBSITE agreements are published.
The two `PRIVATE - Founding …` documents were deliberately left out of the app entirely; they
are invitation-only and must never be fetchable by URL.

## 5a. Agreements

Readable pages only — **no PDFs are served by the site**:

| URL | |
|---|---|
| `/agreements` | index of all four |
| `/agreements/member` · `/expert` · `/partner` · `/expert-partner` | full text, prerendered |

The agreement PDFs live in `LMN/Agreements/` and are sent to individuals by the team (the admin
portal / founding-invite flow), never published as site downloads. The form checkboxes link to
the readable pages.

**The content is not hand-transcribed.** `scripts/extract-agreements.mjs` parses
`LMN/Agreements/_render/*.html` — the exact sources the PDFs were built from — into
`src/lib/agreements/content.json`. That is what guarantees the on-site wording and the PDF
wording cannot drift.

```bash
node scripts/extract-agreements.mjs   # re-run after ANY change to the source documents
```

The script asserts its output against the source (heading count, list count, list-item count,
ramp steps, role chips, and that title/subtitle/parties/footer are all non-empty) and **throws**
rather than emitting a partial agreement. Silent under-extraction is the dangerous failure: a
page that looks fine but is missing a pricing step or a clause is worse than no page at all.
Verified: all 111 clauses across the four documents render verbatim.

`/agreements` is deliberately indexable — these are the public terms. `/founding` and `/admin`
are not.

## 6. Emails

Copy lives in `src/lib/email/templates.ts`, adapted from `VSN_Transactional_Emails.md` to LMN
canon. Two shells in `src/lib/email/shell.ts`: a branded journey shell and a simple one.
Transport (`transport.ts`) picks the first configured of SMTP → Gmail → Resend → log-only.

### Transport: Rackspace (configured, auth verified 2026-07-21)

```
SMTP_HOST=secure.emailsrvr.com
SMTP_PORT=465                              # implicit TLS
SMTP_USER=noreply@lawmembernetwork.com     # password in .env.local / host secrets
```

The app authenticates as `noreply@` and sends **from** `noreply@`, so no send-as identity is
needed. Only Reply-To varies per message, and that is just a header:

| Template group | Reply-To |
|---|---|
| Member waitlist + welcome | `members@lawmembernetwork.com` |
| Expert + partner journeys, founding invites | `founding@lawmembernetwork.com` |
| Admin sign-in code, team alerts | `support@lawmembernetwork.com` |

Every `lawmembernetwork.com` inbox except `noreply@` forwards to `lester@`, `rushdha@` and
`reshani@ekwa.com`, so replies reach all three. `noreply@` is send-only and does not forward —
which is exactly why every template sets an explicit Reply-To.

**`joinlmn.com` is the marketing domain and is deliberately not wired into this app.** Its three
inboxes (`hello@`, `partnerships@`, `Experts@`) are for newsletters, campaigns and outreach.
Keeping transactional mail off it is the entire reason for the two-domain split: marketing volume
must never be able to damage the operational domain's deliverability.

Webmail for all twelve inboxes: <https://apps.rackspace.com/index.php>

### Supabase Auth email (separate, and easy to forget)

The admin sign-in code is sent by **Supabase**, not by this app, so the SMTP settings above do
not cover it. In the Supabase dashboard set **Project Settings → Auth → SMTP** to the same
Rackspace credentials, and edit **Auth → Email templates → Magic Link** so it renders
`{{ .Token }}` (the 6-digit code) rather than a link. Without this, `/admin/login` accepts an
email address and no code ever arrives.

| Template | Trigger |
|---|---|
| `member_waitlist_confirmation` | waitlist signup |
| `member_welcome` | admin activates a member |
| `expert_application_received` | expert applies |
| `expert_approved` | admin approves an expert (public ramp) |
| `founding_expert_invite` | admin sends a founding invite (**free for life — internal only**) |
| `partner_application_received` | partner applies |
| `partner_approved` | admin approves a partner |
| `admin_signin_code` | admin OTP fallback |
| `team_*` | internal alerts to `TEAM_DISTRIBUTION_LIST` |

Copy rules enforced throughout: no em-dashes; contact is `support@lawmembernetwork.com` (never
`joinlmn.com`, which is marketing-only); entity line "Law Member Network, a service offered by
Ekwa Marketing Inc."; credit "Powered by Dominate Law"; hotline always described as voicemail →
text + email in 2–3 business days, AI-assisted, not live, not 24/7; experts keep 70% on courses;
no invented numbers or testimonials.

> **Open item:** LMN has no announced launch date, so the expert/partner ramp is written as
> "first 6 months free, then $49, then $199 from month 13". DMN's rule is to use plain calendar
> dates instead, because they prevent billing disputes. Rewrite those lines in `templates.ts`
> once the launch date is fixed.

## 7. Form fields

The forms ship the `LMN_Signup_Forms_Spec.md` field set, not the thinner set in the static HTML.
The material additions:

- **Expert:** required Expert Agreement checkbox (Fix 1 — the old form agreed to nothing), the
  "also list my company as a partner" checkbox replacing the ambiguous Company field (Fix 3),
  founding-consideration and SMS consent.
- **Partner:** member offer made required (Fix 2), category, description, secondary contacts,
  signer name/title, required Partner Agreement + authority checkboxes, "also an expert" (Fix 3).
- **Member:** firm name required (Fix 5), Member Agreement checkbox, SMS consent.

Agreement links point at the new versions (Fix 4) — as readable pages, see §5a.

## 8. Not built (Phase 2)

Stripe subscription schedules ($0 → $49 → $199), the Agree & Pay click-wrap + acceptance record,
agreement PDF generation, the `checkout.session.completed` webhook chain, and the member /
expert / partner portals. Specs: `Agreements/LMN_Esign_Stripe_Dev_Spec.md` and
`For Dev/Agreement PDF/CONFIRMATION EMAIL SPEC.md`.

## 9. Pre-launch checklist

- [ ] Run migrations `0001`–`0006`; `0006` returns `true` everywhere and **zero** anon grants
- [ ] Seed admins in `0005`, then sign in at `/admin/login` to confirm the OTP round trip
- [ ] Set a permanent `IP_HASH_SALT` (never rotate it after launch)
- [ ] Put `SMTP_PASS` in the host's secret store (Rackspace `noreply@`); never commit it
- [ ] Configure Supabase Auth SMTP + the `{{ .Token }}` email template — separate from the above
- [ ] Rotate the twelve Rackspace mailbox passwords (they were shared over email/chat in plaintext)
- [ ] Confirm SPF/DKIM/DMARC are live on **both** domains before any send (Lahiru actioning)
- [ ] Warm up `joinlmn.com` ~2–3 weeks before any bulk marketing send
- [ ] Submit all three forms → rows land → confirmation + team emails arrive
- [ ] Walk the admin loop: triage → activate → approve expert → approve partner → draft an
      invite and confirm **nothing** is emailed until Send
- [ ] Ethics / bar-advertising review of the site copy (still open per `DEV_HANDOVER.md`)
- [ ] Point DNS at the host; confirm `/admin`, `/founding`, `/agreements` are noindex
