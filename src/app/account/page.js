'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

import './account.css';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, openAuthModal } = useAuth();
  
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toast state
  const [toastMsg, setToastMsg] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });

  // 1. Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      openAuthModal();
    }
  }, [user, authLoading, router, openAuthModal]);

  // 2. Fetch profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            postal_code: data.postal_code || ''
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setProfileLoading(false);
      }
    }

    if (user && !authLoading) {
      loadProfile();
    }
  }, [user, authLoading]);

  // 3. Handle save
  async function handleSave(e) {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
        }, { onConflict: 'id' });
        
      if (error) throw error;
      
      showToast('Profil berhasil disimpan!');
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }

  // If auth is still resolving, or redirecting, or profile is fetching...
  const isLoading = authLoading || profileLoading || !user;

  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: toastMsg.includes('Gagal') ? '#FEE2E2' : '#DCFCE7',
          color: toastMsg.includes('Gagal') ? '#991B1B' : '#166534',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 10000,
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'cardIn 0.3s ease'
        }}>
          <ion-icon name={toastMsg.includes('Gagal') ? 'warning-outline' : 'checkmark-circle-outline'} style={{ fontSize: '20px' }}></ion-icon>
          {toastMsg}
        </div>
      )}

      <main className="account-page">
        <div className="account-container">
          
          <div className="account-nav-row">
            <h1 className="account-page-title">
              <ion-icon name="person-circle-outline"></ion-icon>
              Pengaturan Akun
            </h1>
            <button className="account-back-btn" onClick={() => router.back()} aria-label="Kembali">
              <ion-icon name="arrow-back-outline"></ion-icon>
            </button>
          </div>

          <div className="account-card">
            <div className="account-card-header">
              <h2 className="account-card-title">Informasi Pribadi & Pengiriman</h2>
              <p className="account-card-subtitle">Perbarui data diri dan alamat pengiriman Anda di sini.</p>
            </div>

            {isLoading ? (
              <div className="account-skeleton">
                <div className="skel-line short"></div>
                <div className="skel-line"></div>
                <div className="skel-line tall"></div>
                <div className="skel-line short"></div>
              </div>
            ) : (
              <div className="account-card-body">
                <form className="account-form" onSubmit={handleSave}>
                  
                  <div className="account-field">
                    <label>Email (Tidak dapat diubah)</label>
                    <input type="email" value={user.email} disabled />
                  </div>

                  <div className="account-form-grid">
                    <div className="account-field">
                      <label htmlFor="full_name">Nama Lengkap</label>
                      <input 
                        id="full_name"
                        name="full_name"
                        type="text" 
                        value={formData.full_name} 
                        onChange={handleChange}
                        placeholder="Nama lengkap Anda"
                        required
                      />
                    </div>

                    <div className="account-field">
                      <label htmlFor="phone">Nomor Telepon</label>
                      <input 
                        id="phone"
                        name="phone"
                        type="tel" 
                        value={formData.phone} 
                        onChange={handleChange}
                        placeholder="Contoh: 08123456789"
                      />
                    </div>

                    <div className="account-field full">
                      <label htmlFor="address">Alamat Lengkap</label>
                      <textarea 
                        id="address"
                        name="address"
                        value={formData.address} 
                        onChange={handleChange}
                        placeholder="Nama jalan, gedung, no. rumah, dll."
                        rows="3"
                      />
                    </div>

                    <div className="account-field">
                      <label htmlFor="city">Kota / Kabupaten</label>
                      <input 
                        id="city"
                        name="city"
                        type="text" 
                        value={formData.city} 
                        onChange={handleChange}
                        placeholder="Contoh: Jakarta Selatan"
                      />
                    </div>

                    <div className="account-field">
                      <label htmlFor="postal_code">Kode Pos</label>
                      <input 
                        id="postal_code"
                        name="postal_code"
                        type="text" 
                        value={formData.postal_code} 
                        onChange={handleChange}
                        placeholder="Contoh: 12345"
                      />
                    </div>
                  </div>

                  <div className="account-actions">
                    <button type="button" className="account-btn-cancel" onClick={() => router.back()}>
                      Batal
                    </button>
                    <button type="submit" className="account-btn-save" disabled={saving}>
                      {saving ? <span className="btn-spinner"></span> : 'Simpan Perubahan'}
                    </button>
                  </div>

                </form>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
