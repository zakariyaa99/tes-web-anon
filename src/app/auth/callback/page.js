'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

/**
 * /auth/callback — Client-side PKCE code exchange page.
 *
 * The PKCE code_verifier is stored in localStorage by signInWithOAuth().
 * It must be exchanged by the SAME browser client, not a fresh server instance.
 * This page runs in the browser, finds the verifier, and swaps the code for
 * a real session before redirecting the user to the homepage.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function exchange() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        // No code in URL — redirect home.
        router.replace('/');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[auth/callback] exchangeCodeForSession error:', error.message);
        setErrorMsg('Gagal masuk. Silakan coba lagi.');
        // Redirect home after a short delay so the user can see the message.
        setTimeout(() => router.replace('/'), 2500);
        return;
      }

      // Session stored — AuthContext SIGNED_IN listener will fire automatically.
      router.replace('/');
    }

    exchange();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Poppins, sans-serif',
      gap: '16px',
    }}>
      {errorMsg ? (
        <p style={{ color: '#ef4444', fontSize: '15px' }}>{errorMsg}</p>
      ) : (
        <>
          {/* Reuse the existing spinner style from AuthModal.css */}
          <span style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(24, 95, 165, 0.15)',
            borderTopColor: '#185FA5',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            display: 'inline-block',
          }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Sedang masuk…</p>
        </>
      )}

      {/* Keyframe for the spinner (isolated to this page) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
