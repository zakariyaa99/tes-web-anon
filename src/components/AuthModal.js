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
  const [name, setName]     = useState('');
  const [loading, setLoading] = useState(false);
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
            <input
              id="auth-password"
              type="password"
              placeholder={tab === 'register' ? 'Min. 6 karakter' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={fieldErrors.password ? 'error' : ''}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
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
