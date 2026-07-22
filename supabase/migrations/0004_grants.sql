-- ============================================================================
-- LMN 0004 — grants. Run immediately after 0003. NEVER SKIP.
--
-- Revoke table privileges from the browser-facing roles. RLS (0003) already
-- denies them, but grants are the second lock: a future permissive policy
-- added by mistake still cannot read anything without a grant.
-- ============================================================================

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

alter default privileges in schema public
  revoke all on tables from anon, authenticated;
alter default privileges in schema public
  revoke all on sequences from anon, authenticated;

-- service_role is what the server-side route handlers use. It bypasses RLS.
grant usage on schema public to service_role;
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;

alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant all on sequences to service_role;

-- Sanity check: this should return zero rows.
--   select grantee, table_name, privilege_type
--   from information_schema.role_table_grants
--   where table_schema='public' and grantee in ('anon','authenticated');
