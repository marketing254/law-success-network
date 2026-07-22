-- ============================================================================
-- LMN 0002 — admin team, audit trail, notifications, email log, founding invites
-- ============================================================================

-- ---------------------------------------------------------------------------
-- admin_users — being an admin IS having an active row here.
-- There is no separate admin password store; identity is a Supabase auth user
-- and this table is the allow-list.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique,
  email         text not null,
  full_name     text,
  role          text not null default 'admin',  -- owner | admin | reviewer | support
  active        boolean not null default true,
  last_active_at timestamptz,
  created_at    timestamptz not null default now()
);

-- Plain column index (not lower(email)) — the app lowercases before writing,
-- and ON CONFLICT (email) requires a plain unique index. Drop-first so a
-- re-run converges even over an older expression-index version.
drop index if exists admin_users_email_key;
create unique index admin_users_email_key on public.admin_users (email);

-- ---------------------------------------------------------------------------
-- review_actions — the audit trail. Every admin mutation writes one row.
-- ---------------------------------------------------------------------------
create table if not exists public.review_actions (
  id          uuid primary key default gen_random_uuid(),
  target_type text not null,   -- expert_application | expert | partner | member | waitlist_signup | founding_invite
  target_id   uuid,
  action      text not null,
  note        text,
  admin_id    uuid references public.admin_users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists review_actions_target_idx  on public.review_actions (target_type, target_id);
create index if not exists review_actions_created_idx on public.review_actions (created_at desc);

-- ---------------------------------------------------------------------------
-- auth_audit — sign-in / OTP trail, separate from review actions
-- ---------------------------------------------------------------------------
create table if not exists public.auth_audit (
  id         uuid primary key default gen_random_uuid(),
  email      text,
  event      text not null,      -- otp_requested | otp_verified | otp_failed | signed_out
  audience   text,               -- admin | member | expert | partner
  ip_hash    text,
  user_agent text,
  metadata   jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists auth_audit_created_idx on public.auth_audit (created_at desc);

-- ---------------------------------------------------------------------------
-- notifications — the in-app bell. `audience` is what the bell filters on.
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  audience   text not null,      -- admin | member | expert | partner
  admin_id   uuid references public.admin_users(id) on delete cascade,
  member_id  uuid references public.members(id) on delete cascade,
  expert_id  uuid references public.experts(id) on delete cascade,
  partner_id uuid references public.partners(id) on delete cascade,
  kind       text not null,
  title      text not null,
  body       text,
  link       text,
  metadata   jsonb default '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_audience_idx on public.notifications (audience, created_at desc);
create index if not exists notifications_unread_idx   on public.notifications (audience, read_at);

-- ---------------------------------------------------------------------------
-- email_events — delivery log. Every send attempt records one row.
-- ---------------------------------------------------------------------------
create table if not exists public.email_events (
  id         uuid primary key default gen_random_uuid(),
  template   text not null,
  recipient  text not null,
  subject    text,
  provider   text,
  status     text not null default 'queued',  -- queued | failed | disabled
  error      text,
  metadata   jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_events_created_idx   on public.email_events (created_at desc);
drop index if exists email_events_recipient_idx;
create index email_events_recipient_idx on public.email_events (recipient);

-- ---------------------------------------------------------------------------
-- founding_invites — draft-first private invites for the hand-picked cohort.
-- Creating an invite emails NOTHING. Only the explicit "send" action mails.
-- ---------------------------------------------------------------------------
create table if not exists public.founding_invites (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,          -- 24-char unguessable
  role          text not null,                 -- expert | partner | both
  full_name     text not null,
  email         text not null,
  company_name  text,
  member_offer  text,
  phone         text,
  notes         text,
  -- per-company payload for multi-company partners: [{name, category, member_offer}]
  companies     jsonb default '[]'::jsonb,
  status        text not null default 'draft', -- draft | sent | viewed | accepted | revoked
  agreement_version   text not null default 'v4',
  agreement_pdf_path  text,
  sent_at       timestamptz,
  viewed_at     timestamptz,
  accepted_at   timestamptz,
  revoked_at    timestamptz,
  expires_at    timestamptz,
  created_by    uuid references public.admin_users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists founding_invites_status_idx on public.founding_invites (status);
drop index if exists founding_invites_email_idx;
create index founding_invites_email_idx  on public.founding_invites (email);
