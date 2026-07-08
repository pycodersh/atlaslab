import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase admin client (service role).
 * Bypasses RLS — use only in API routes for trusted server-side writes.
 * Never expose this to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Support both naming conventions (SUPABASE_SERVICE_ROLE_KEY is canonical;
  // SUPABASE_SECRET_KEY is the legacy name used in some Vercel projects)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase admin key (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY)')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
