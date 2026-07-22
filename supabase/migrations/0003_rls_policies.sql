-- ============================================================================
-- LMN 0003 — Row Level Security. NEVER SKIP THIS FILE.
--
-- Posture: every table below is RLS-enabled with NO permissive policy for
-- anon/authenticated. All application reads and writes go through server-side
-- route handlers using the service-role key, which bypasses RLS by design.
-- The anon key is therefore useless for reading data even if it leaks — which
-- is the point, because the anon key ships to the browser.
--
-- If you later add a member/expert/partner portal that queries Supabase
-- directly from the client, add narrowly-scoped policies HERE (e.g. a member
-- may select their own row via auth.uid() = auth_user_id). Do not disable RLS.
-- ============================================================================

alter table public.waitlist_signups     enable row level security;
alter table public.members              enable row level security;
alter table public.expert_applications  enable row level security;
alter table public.experts              enable row level security;
alter table public.partner_applications enable row level security;
alter table public.partners             enable row level security;
alter table public.admin_users          enable row level security;
alter table public.review_actions       enable row level security;
alter table public.auth_audit           enable row level security;
alter table public.notifications        enable row level security;
alter table public.email_events         enable row level security;
alter table public.founding_invites     enable row level security;

-- Force RLS even for the table owner, so a misconfigured connection cannot
-- silently read everything.
alter table public.waitlist_signups     force row level security;
alter table public.members              force row level security;
alter table public.expert_applications  force row level security;
alter table public.experts              force row level security;
alter table public.partner_applications force row level security;
alter table public.partners             force row level security;
alter table public.admin_users          force row level security;
alter table public.review_actions       force row level security;
alter table public.auth_audit           force row level security;
alter table public.notifications        force row level security;
alter table public.email_events         force row level security;
alter table public.founding_invites     force row level security;

-- Explicitly drop anything Supabase templates may have added.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'waitlist_signups','members','expert_applications','experts',
        'partner_applications','partners','admin_users','review_actions',
        'auth_audit','notifications','email_events','founding_invites'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;
