-- ============================================================================
-- LMN 0001 — core schema (waitlist + members + experts + partners)
-- Run FIRST, in the Supabase SQL editor of the new LMN project.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Email uniqueness note: every write path in the app normalizes emails to
-- lowercase before storing (src/lib/validate.ts normalizeEmail), so the unique
-- indexes below are PLAIN column indexes, not lower(col) expression indexes.
-- Plain indexes are what ON CONFLICT (email) and the API's upserts require;
-- an expression index cannot satisfy them (error 42P10).
-- Each index is dropped first so re-running this file always converges on the
-- correct definition, even over a partially applied older version.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- waitlist_signups — the Phase-1 capture table behind the homepage form
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist_signups (
  id             uuid primary key default gen_random_uuid(),
  role           text not null default 'member',   -- member | expert | partner
  email          text not null,
  full_name      text,
  first_name     text,
  last_name      text,
  firm_name      text,
  practice_role  text,
  phone          text,
  city_state     text,
  message        text,                              -- "biggest challenge"
  source         text default 'website',
  status         text not null default 'new',       -- new | contacted | converted | declined
  contacted_at   timestamptz,
  utm            jsonb default '{}'::jsonb,
  agreement_accepted    boolean default false,
  agreement_accepted_at timestamptz,
  sms_consent           boolean default false,
  sms_consent_text      text,
  sms_consent_at        timestamptz,
  ip_hash        text,                              -- salted hash, never the raw IP
  user_agent     text,
  created_at     timestamptz not null default now()
);

drop index if exists waitlist_signups_email_key;
create unique index waitlist_signups_email_key
  on public.waitlist_signups (email);
create index if not exists waitlist_signups_status_idx  on public.waitlist_signups (status);
create index if not exists waitlist_signups_created_idx on public.waitlist_signups (created_at desc);

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
create table if not exists public.members (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique,
  email         text not null,
  first_name    text,
  last_name     text,
  firm_name     text,
  practice_role text,
  phone         text,
  city          text,
  status        text not null default 'active',    -- active | paused | cancelled
  tier          text not null default 'founding',  -- founding | early | standard
  waitlist_signup_id uuid references public.waitlist_signups(id) on delete set null,
  joined_at     timestamptz,
  activated_at  timestamptz,
  activated_by  uuid,
  -- Stripe columns live here from day one so Phase 2 needs no migration of
  -- existing rows; they stay null for the whole waitlist phase.
  stripe_customer_id     text,
  stripe_subscription_id text,
  sms_consent      boolean default false,
  sms_consent_text text,
  sms_consent_at   timestamptz,
  utm           jsonb default '{}'::jsonb,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop index if exists members_email_key;
create unique index members_email_key on public.members (email);
create index if not exists members_status_idx on public.members (status);

-- ---------------------------------------------------------------------------
-- expert_applications — inbound from /experts
-- ---------------------------------------------------------------------------
create table if not exists public.expert_applications (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null,
  phone         text,
  company_name  text,
  specialty     text,
  topics        text,
  website       text,
  booking_link  text,
  what_you_teach text,
  status        text not null default 'new',   -- new | reviewing | approved | declined | onboarded
  source        text default 'website',
  notes         text,
  contacted_at  timestamptz,
  agreement_accepted    boolean default false,
  agreement_accepted_at timestamptz,
  -- cross-role: "I'd also like to list my company as a partner"
  also_partner        boolean default false,
  company_offer       text,
  considered_founding boolean default false,
  sms_consent      boolean default false,
  sms_consent_text text,
  sms_consent_at   timestamptz,
  ip_hash       text,
  user_agent    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop index if exists expert_applications_email_key;
create unique index expert_applications_email_key
  on public.expert_applications (email);
create index if not exists expert_applications_status_idx on public.expert_applications (status);

-- ---------------------------------------------------------------------------
-- experts — the provisioned portal record (created on approve/onboard)
-- ---------------------------------------------------------------------------
create table if not exists public.experts (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid references public.expert_applications(id) on delete set null,
  auth_user_id   uuid unique,
  email          text not null,
  full_name      text not null,
  display_name   text,
  phone          text,
  company_name   text,
  specialty      text,
  topics         text,
  website        text,
  booking_link   text,
  bio            text,
  headshot_url   text,
  status         text not null default 'invited', -- invited | active | suspended | archived
  -- founding cohort of 20: free for life. INTERNAL ONLY — never rendered publicly.
  is_founding    boolean default false,
  invited_by     uuid,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop index if exists experts_email_key;
create unique index experts_email_key on public.experts (email);
create index if not exists experts_status_idx on public.experts (status);

-- ---------------------------------------------------------------------------
-- partner_applications + partners
-- LMN uses "partners" as both the label AND the table name (DMN's legacy
-- `vendors` naming is not carried over — this is a fresh project).
-- ---------------------------------------------------------------------------
create table if not exists public.partner_applications (
  id             uuid primary key default gen_random_uuid(),
  company_name   text not null,
  contact_name   text not null,
  contact_email  text not null,
  contact_phone  text,
  secondary_email text,
  secondary_phone text,
  signature_name  text,
  signature_title text,
  category       text,
  website        text,
  description    text,
  member_offer   text,
  status         text not null default 'pending_review',
  source         text default 'website',
  notes          text,
  agreed_to_terms     boolean default false,
  confirmed_authority boolean default false,
  agreement_accepted_at timestamptz,
  also_expert    boolean default false,
  sms_consent      boolean default false,
  sms_consent_text text,
  sms_consent_at   timestamptz,
  ip_hash        text,
  user_agent     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop index if exists partner_applications_email_key;
create unique index partner_applications_email_key
  on public.partner_applications (contact_email);
create index if not exists partner_applications_status_idx on public.partner_applications (status);

create table if not exists public.partners (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid references public.partner_applications(id) on delete set null,
  auth_user_id   uuid unique,
  company_name   text not null,
  display_name   text,
  contact_name   text,
  contact_email  text not null,
  contact_phone  text,
  secondary_email text,
  secondary_phone text,
  signature_name  text,
  signature_title text,
  category       text,
  website        text,
  description    text,
  member_offer   text,
  logo_url       text,
  calendar_link  text,
  status         text not null default 'pending_review', -- pending_review | approved | rejected | suspended | churned
  verified       boolean not null default false,
  plan_id        text default 'founding',                -- founding | covered | standard
  -- Multi-company: a covered company inherits billing from its principal.
  billing_parent_id uuid references public.partners(id) on delete set null,
  approved_at    timestamptz,
  invited_by     uuid,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop index if exists partners_email_key;
create unique index partners_email_key on public.partners (contact_email);
create index if not exists partners_status_idx on public.partners (status);
create index if not exists partners_billing_parent_idx on public.partners (billing_parent_id);
