/**
 * Server-only Supabase client using the service role key.
 * This bypasses Row Level Security — NEVER import this in client components.
 * Uses lazy initialization to avoid crashing during next build page-data collection.
 */
import { createClient } from '@supabase/supabase-js';

let _adminClient = null;

export function getSupabaseAdmin() {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    }
    _adminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _adminClient;
}

