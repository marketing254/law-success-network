-- ============================================================================
-- LMN 0005 — seed the admin team.
--
-- Being an admin is TWO records, matched by email:
--   1. this allow-list row (below), and
--   2. a Supabase auth user with the same email (Authentication -> Users).
-- The login flow uses shouldCreateUser:false, so an email WITHOUT a
-- pre-created auth user can never receive a sign-in code. Create the auth
-- users in the dashboard (Add user -> Create new user, no password needed)
-- or via scripts/seed-admins.mjs, which does both records at once.
--
-- auth_user_id starts null and is linked automatically on first sign-in.
-- ============================================================================

insert into public.admin_users (email, full_name, role, active) values
  ('lester@ekwa.com',                'Lester De Alwis', 'owner', true),
  ('fathimarushdhaakbar28@gmail.com','Fathima Rushdha', 'admin', true)
on conflict (email) do nothing;

-- Verify:
--   select email, role, active, auth_user_id from public.admin_users order by role;
