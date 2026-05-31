'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab]       = useState('login'); // 'login' | 'register'
  const [email, setEmail]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName]     = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    // Add escape key listener
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function validate() {
    const errs = {};
    if (!email.trim())            errs.email    = 'Email wajib diisi.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Format email tidak valid.';
    if (!password)                errs.password = 'Password wajib diisi.';
    else if (password.length < 6) errs.password = 'Password minimal 6 karakter.';
    if (tab === 'register' && !name.trim()) errs.name = 'Nama wajib diisi.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (tab === 'login') {
        const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
        if (authErr) throw authErr;
        // AuthContext will fire SIGNED_IN → merge guest cart/wishlist
        onClose(); // Automatically close modal on successful login
      } else {
        const { error: authErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (authErr) throw authErr;
        setSuccess('Akun berhasil dibuat! Silakan masuk dengan email dan password kamu.');
        setTab('login');
        setPassword('');
      }
    } catch (err) {
      const msg = err?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      // Make common Supabase errors more user-friendly (Indonesian)
      if (msg.includes('Invalid login credentials'))
        setError('Email atau password salah.');
      else if (msg.includes('already registered') || msg.includes('already been registered'))
        setError('Email ini sudah terdaftar. Silakan masuk.');
      else if (msg.includes('Email not confirmed'))
        setError('Email belum dikonfirmasi. Periksa inbox kamu.');
      else
        setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError('');
    try {
      const { error: authErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : '/auth/callback',
        },
      });
      if (authErr) throw authErr;
      // Browser will redirect to Google — modal stays open during redirect
    } catch (err) {
      setError(err?.message || 'Gagal masuk dengan Google. Silakan coba lagi.');
      setGoogleLoading(false);
    }
  }

  function switchTab(t) {
    setTab(t);
    setError('');
    setSuccess('');
    setFieldErrors({});
  }

  // Prevent closing when clicking inside the card
  function handleCardClick(e) {
    e.stopPropagation();
  }

  if (!mounted) return null;

  return createPortal(
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-card" onClick={handleCardClick}>
        
        <button className="auth-close-btn" onClick={onClose} aria-label="Tutup">
          <ion-icon name="close-outline"></ion-icon>
        </button>

        {/* Logo */}
        <div className="auth-logo">
          <img src="/images/logo/labkimia_header.png" alt="Labkimia logo" />
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs" role="tablist">
          <button
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => switchTab('login')}
            role="tab"
            aria-selected={tab === 'login'}
            id="tab-login"
          >
            Masuk
          </button>
          <button
            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => switchTab('register')}
            role="tab"
            aria-selected={tab === 'register'}
            id="tab-register"
          >
            Daftar
          </button>
        </div>

        {/* Alerts */}
        {error   && <div className="auth-error"   role="alert">{error}</div>}
        {success && <div className="auth-success" role="status">{success}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Name — register only */}
          {tab === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Nama lengkap</label>
              <input
                id="auth-name"
                type="text"
                placeholder="Nama kamu"
                value={name}
                onChange={e => setName(e.target.value)}
                className={fieldErrors.name ? 'error' : ''}
                autoComplete="name"
              />
                {fieldErrors.name && <span className="auth-field-error">{fieldErrors.name}</span>}
            </div>
          )}

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              placeholder="email@kamu.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={fieldErrors.email ? 'error' : ''}
              autoComplete="email"
            />
            {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <div className="auth-password-wrapper">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={tab === 'register' ? 'Min. 6 karakter' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={fieldErrors.password ? 'error' : ''}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                <ion-icon name={showPassword ? 'eye-off-outline' : 'eye-outline'}></ion-icon>
              </button>
            </div>
            {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
            id="auth-submit-btn"
          >
            {loading
              ? <span className="auth-spinner" />
              : tab === 'login' ? 'Masuk' : 'Buat Akun'
            }
          </button>

        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>atau</span>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          id="auth-google-btn"
        >
          {googleLoading ? (
            <span className="auth-spinner auth-spinner--dark" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          )}
          {googleLoading ? 'Mengalihkan…' : 'Lanjutkan dengan Google'}
        </button>

        {/* Switch tab footer */}
        <div className="auth-footer">
          {tab === 'login'
            ? <>Belum punya akun? <button onClick={() => switchTab('register')}>Daftar sekarang</button></>
            : <>Sudah punya akun? <button onClick={() => switchTab('login')}>Masuk</button></>
          }
        </div>

      </div>
    </div>,
    document.body
  );
}
