-- ============================================================================
-- LMN 0006 — verification. Run LAST. Every column must come back `true`.
-- ============================================================================

select
  to_regclass('public.waitlist_signups')     is not null as waitlist,
  to_regclass('public.members')              is not null as members,
  to_regclass('public.expert_applications')  is not null as expert_apps,
  to_regclass('public.experts')              is not null as experts,
  to_regclass('public.partner_applications') is not null as partner_apps,
  to_regclass('public.partners')             is not null as partners,
  to_regclass('public.admin_users')          is not null as admins,
  to_regclass('public.review_actions')       is not null as audit,
  to_regclass('public.auth_audit')           is not null as auth_audit,
  to_regclass('public.notifications')        is not null as notifications,
  to_regclass('public.email_events')         is not null as email_events,
  to_regclass('public.founding_invites')     is not null as founding_invites;

-- Every table must show rowsecurity = true.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- Must return ZERO rows. Anything here means the browser-facing roles can
-- reach a table directly — go back and re-run 0004.
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated');

-- Admin seed present?
select email, role, active from public.admin_users order by role, email;
