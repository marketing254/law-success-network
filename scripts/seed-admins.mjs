/**
 * Seeds LMN admins — BOTH records each admin needs:
 *   1. the Supabase auth user (Authentication -> Users), created confirmed,
 *      no password: sign-in is by 6-digit OTP only, and the login route's
 *      shouldCreateUser:false means an email without this record can never
 *      receive a code;
 *   2. the admin_users allow-list row the guards check.
 *
 * Idempotent: safe to re-run; existing users/rows are left alone.
 * Reads credentials from .env.local. Run:  node scripts/seed-admins.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ADMINS = [
  { email: "lester@ekwa.com", full_name: "Lester De Alwis", role: "owner" },
  { email: "fathimarushdhaakbar28@gmail.com", full_name: "Fathima Rushdha", role: "admin" },
];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
}

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (const admin of ADMINS) {
  const email = admin.email.toLowerCase();

  // --- 1. auth user ---------------------------------------------------------
  let authUserId = null;
  const { data: created, error: createError } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { user_type: "admin", full_name: admin.full_name },
  });

  if (createError) {
    // "already registered" -> find the existing user instead of failing.
    const { data: list } = await db.auth.admin.listUsers({ perPage: 200 });
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email);
    if (!existing) throw new Error(`auth user for ${email}: ${createError.message}`);
    authUserId = existing.id;
    console.log(`auth user exists   ${email}`);
  } else {
    authUserId = created.user.id;
    console.log(`auth user created  ${email}`);
  }

  // --- 2. allow-list row ----------------------------------------------------
  // auth_user_id is linked here up front; the guards would also link it on
  // first sign-in, but there is no reason to leave it null when we know it.
  const { data: existingRow } = await db
    .from("admin_users")
    .select("id, role, active")
    .eq("email", email)
    .maybeSingle();

  if (existingRow) {
    await db.from("admin_users").update({ auth_user_id: authUserId }).eq("id", existingRow.id);
    console.log(`admin row exists   ${email} (${existingRow.role}, active=${existingRow.active})`);
  } else {
    const { error: insertError } = await db.from("admin_users").insert({
      email,
      full_name: admin.full_name,
      role: admin.role,
      active: true,
      auth_user_id: authUserId,
    });
    if (insertError) throw new Error(`admin row for ${email}: ${insertError.message}`);
    console.log(`admin row created  ${email} (${admin.role})`);
  }
}

// --- verify ----------------------------------------------------------------
const { data: rows } = await db
  .from("admin_users")
  .select("email, full_name, role, active, auth_user_id")
  .order("role");
console.log("\nadmin_users:");
for (const r of rows ?? []) {
  console.log(
    `  ${r.email.padEnd(36)} ${r.role.padEnd(7)} active=${r.active} auth=${r.auth_user_id ? "linked" : "NULL"}`
  );
}
const { data: users } = await db.auth.admin.listUsers({ perPage: 50 });
console.log("auth.users:", (users?.users ?? []).map((u) => `${u.email} (confirmed=${!!u.email_confirmed_at})`).join(", "));
