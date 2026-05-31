import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /auth/callback
 *
 * Supabase PKCE OAuth callback handler.
 * Exchanges the `code` query param for a valid session, stores it in cookies,
 * then redirects to the homepage (or a custom `next` param).
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // Use a server-side Supabase client so the session cookie is set correctly.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          // Persist to cookies so the browser client picks up the session.
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Clean redirect — no tokens in the URL.
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('[auth/callback] exchangeCodeForSession error:', error.message);
  }

  // Something went wrong — redirect to homepage with an error flag.
  return NextResponse.redirect(`${origin}/?auth_error=callback_failed`);
}
