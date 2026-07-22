import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS.
 *
 * SERVER ONLY — the "server-only" import above makes importing this from a
 * client component a build error, which is the guardrail that keeps the
 * service-role key out of the browser bundle.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
    );
  }

  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
