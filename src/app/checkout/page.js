'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { getCart, getRemoteCart, cartTotal } from '../../lib/cartUtils';
import './checkout.css';

function formatPrice(n) {
  return `Rp ${Number(n).toLocaleString('id-ID')}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading, openAuthModal } = useAuth();

  const [cart, setCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState('');
  const [snapLoaded, setSnapLoaded] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', postal: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Load cart ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    async function load() {
      if (user) {
        try {
          setCart(await getRemoteCart(user.id));
        } catch {
          setCart(getCart());
        }
      } else {
        setCart(getCart());
      }
      setCartLoaded(true);
    }
    load();
  }, [user, authLoading]);

  // ── Pre-fill shipping from profile ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('full_name, phone, address, city, postal_code')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            name:    data.full_name   || '',
            phone:   data.phone       || '',
            address: data.address     || '',
            city:    data.city        || '',
            postal:  data.postal_code || '',
          });
        }
      });
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'Nama wajib diisi.';
    if (!form.phone.trim())   errs.phone   = 'Nomor telepon wajib diisi.';
    if (!form.address.trim()) errs.address = 'Alamat wajib diisi.';
    if (!form.city.trim())    errs.city    = 'Kota wajib diisi.';
    return errs;
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  async function handlePay() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!window.snap) {
      showToast('Payment system belum siap. Coba lagi sebentar.');
      return;
    }

    setPaying(true);
    try {
      // Get the user's current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cart, shipping: form }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat pesanan.');

      // Open Midtrans Snap popup
      window.snap.pay(data.snap_token, {
        onSuccess: () => router.push('/orders?status=success'),
        onPending: () => router.push('/orders?status=pending'),
        onError:   (err) => {
          console.error('Snap error', err);
          showToast('Pembayaran gagal. Silakan coba lagi.');
          setPaying(false);
        },
        onClose: () => setPaying(false),
      });
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
      setPaying(false);
    }
  }

  const total = cartTotal(cart);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.startsWith('Mid-client-');
  const snapSrc = IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <>
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="checkout-page">
          <div className="checkout-container">
            <div className="checkout-login-gate">
              <ion-icon name="lock-closed-outline" />
              <h2>Silakan masuk terlebih dahulu</h2>
              <p>Kamu perlu login untuk melanjutkan checkout.</p>
              <button className="checkout-login-btn" onClick={openAuthModal}>
                Masuk / Daftar
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Cart empty ───────────────────────────────────────────────────────────
  if (cartLoaded && cart.length === 0) {
    return (
      <>
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="checkout-page">
          <div className="checkout-container">
            <div className="checkout-empty-gate">
              <ion-icon name="cart-outline" />
              <h2>Keranjang masih kosong</h2>
              <p>Tambahkan produk terlebih dahulu sebelum checkout.</p>
              <Link href="/" className="checkout-shop-btn">
                <ion-icon name="arrow-back-outline" />
                Mulai Belanja
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* Load Midtrans Snap.js */}
      <Script
        src={snapSrc}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => setSnapLoaded(true)}
      />

      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {toast && (
        <div className="checkout-toast">
          <ion-icon name="alert-circle-outline" />
          {toast}
        </div>
      )}

      <main className="checkout-page">
        <div className="checkout-container">

          {/* Nav row */}
          <div className="checkout-nav-row">
            <h1 className="checkout-page-title">
              <ion-icon name="card-outline" aria-hidden="true" />
              Checkout
            </h1>
            <button className="checkout-back-btn" onClick={() => router.back()} aria-label="Kembali">
              <ion-icon name="arrow-back-outline" aria-hidden="true" />
            </button>
          </div>

          <div className="checkout-layout">

            {/* ── Left: Shipping address ── */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">
                  <ion-icon name="location-outline" />
                  Alamat Pengiriman
                </h2>
                <p className="checkout-card-subtitle">Pastikan alamat lengkap dan dapat dijangkau kurir.</p>
              </div>

              <form className="checkout-form" onSubmit={e => { e.preventDefault(); handlePay(); }}>
                <div className="checkout-form-grid">

                  <div className="checkout-field">
                    <label htmlFor="co-name">Nama Penerima *</label>
                    <input
                      id="co-name" name="name" type="text"
                      value={form.name} onChange={handleChange}
                      placeholder="Nama lengkap penerima"
                      className={fieldErrors.name ? 'error' : ''}
                    />
                    {fieldErrors.name && <span className="checkout-field-error">{fieldErrors.name}</span>}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="co-phone">Nomor Telepon *</label>
                    <input
                      id="co-phone" name="phone" type="tel"
                      value={form.phone} onChange={handleChange}
                      placeholder="08xxxxxxxxxx"
                      className={fieldErrors.phone ? 'error' : ''}
                    />
                    {fieldErrors.phone && <span className="checkout-field-error">{fieldErrors.phone}</span>}
                  </div>

                  <div className="checkout-field full">
                    <label htmlFor="co-address">Alamat Lengkap *</label>
                    <textarea
                      id="co-address" name="address"
                      value={form.address} onChange={handleChange}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                      rows={3}
                      className={fieldErrors.address ? 'error' : ''}
                    />
                    {fieldErrors.address && <span className="checkout-field-error">{fieldErrors.address}</span>}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="co-city">Kota / Kabupaten *</label>
                    <input
                      id="co-city" name="city" type="text"
                      value={form.city} onChange={handleChange}
                      placeholder="Contoh: Jakarta Selatan"
                      className={fieldErrors.city ? 'error' : ''}
                    />
                    {fieldErrors.city && <span className="checkout-field-error">{fieldErrors.city}</span>}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="co-postal">Kode Pos</label>
                    <input
                      id="co-postal" name="postal" type="text"
                      value={form.postal} onChange={handleChange}
                      placeholder="Contoh: 12345"
                    />
                  </div>

                </div>
              </form>
            </div>

            {/* ── Right: Order summary ── */}
            <aside className="checkout-card checkout-summary">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">
                  <ion-icon name="receipt-outline" />
                  Ringkasan Pesanan
                </h2>
                <p className="checkout-card-subtitle">{itemCount} produk</p>
              </div>

              <div className="checkout-summary-body">
                <div className="checkout-summary-items">
                  {cart.map(item => (
                    <div key={item.id} className="checkout-sum-item">
                      <div className="checkout-sum-img">
                        <img src={item.image || '/images/products/labkimiaproduk.png'} alt={item.name} />
                      </div>
                      <div className="checkout-sum-info">
                        <div className="checkout-sum-name">{item.name}</div>
                        {item.packSize && <div className="checkout-sum-meta">{item.packSize} × {item.qty}</div>}
                        {!item.packSize && <div className="checkout-sum-meta">Qty: {item.qty}</div>}
                      </div>
                      <div className="checkout-sum-price">{formatPrice(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>

                <div className="checkout-sum-sep" />

                <div className="checkout-sum-row">
                  <span>Subtotal ({itemCount} produk)</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="checkout-sum-row">
                  <span>Ongkos kirim</span>
                  <span className="checkout-sum-free">Gratis</span>
                </div>
                <div className="checkout-sum-row total">
                  <span>Total Pembayaran</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <button
                  className="checkout-pay-btn"
                  onClick={handlePay}
                  disabled={paying || !cartLoaded}
                  id="checkout-pay-btn"
                >
                  {paying
                    ? <span className="checkout-spinner" />
                    : (
                      <>
                        <ion-icon name="card-outline" aria-hidden="true" />
                        Bayar Sekarang
                      </>
                    )
                  }
                </button>

                <p className="checkout-secure-note">
                  <ion-icon name="shield-checkmark-outline" />
                  Pembayaran aman melalui Midtrans
                </p>
              </div>
            </aside>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
