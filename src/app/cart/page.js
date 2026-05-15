'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  getCart,
  updateQty,
  removeItem,
  clearCart,
  cartTotal,
  getRemoteCart,
  updateQtyRemote,
  removeItemRemote,
  clearCartRemote,
} from '../../lib/cartUtils';
import './cart.css';

function formatPrice(n) {
  return `Rp ${Number(n).toLocaleString('id-ID')}`;
}

export default function CartPage() {
  const { user, openAuthModal } = useAuth();
  const [cart, setCart]       = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Load cart — remote when logged in, localStorage when guest
  useEffect(() => {
    async function load() {
      if (user) {
        try {
          setCart(await getRemoteCart(user.id));
        } catch {
          setCart(getCart()); // fallback
        }
      } else {
        setCart(getCart());
      }
      setMounted(true);
    }
    load();
  }, [user]);

  // Local event listener keeps guest cart in sync within tab
  useEffect(() => {
    if (user) return; // remote cart doesn't use events
    function onCartUpdated(e) { setCart(e.detail.cart); }
    window.addEventListener('cartUpdated', onCartUpdated);
    return () => window.removeEventListener('cartUpdated', onCartUpdated);
  }, [user]);

  async function handleQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty < 1) return;
    if (user) {
      try {
        await updateQtyRemote(user.id, id, newQty);
        setCart(c => c.map(i => i.id === id ? { ...i, qty: newQty } : i));
      } catch (e) { console.error(e); }
    } else {
      setCart(updateQty(id, newQty));
    }
  }

  async function handleRemove(id) {
    if (user) {
      try {
        await removeItemRemote(user.id, id);
        setCart(c => c.filter(i => i.id !== id));
      } catch (e) { console.error(e); }
    } else {
      setCart(removeItem(id));
    }
  }

  async function handleClear() {
    if (user) {
      try {
        await clearCartRemote(user.id);
        setCart([]);
      } catch (e) { console.error(e); }
    } else {
      clearCart();
      setCart([]);
    }
  }

  const total     = cartTotal(cart);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="cart-page">
        <div className="container">

          {/* Back button + title row */}
          <div className="cart-nav-row">
            <h1 className="cart-page-title">
              <ion-icon name="cart-outline" aria-hidden="true"></ion-icon>
              Keranjang Belanja
            </h1>
            <div className="cart-nav-actions">
              <Link href="/wishlist" className="cart-wishlist-link" aria-label="Lihat wishlist">
                <ion-icon name="heart-outline" aria-hidden="true"></ion-icon>
              </Link>
              <button className="cart-back-btn" onClick={() => router.back()} aria-label="Kembali">
                <ion-icon name="arrow-back-outline" aria-hidden="true"></ion-icon>
              </button>
            </div>
          </div>

          {/* Suppress hydration flash */}
          {!mounted ? null : cart.length === 0 ? (

            /* ── Empty state ── */
            <div className="cart-empty">
              <ion-icon name="cart-outline" className="cart-empty-icon" aria-hidden="true"></ion-icon>
              <h2>Keranjang masih kosong</h2>
              <p>Tambahkan produk ke keranjang untuk mulai berbelanja.</p>
              <Link href="/" className="cart-empty-btn">
                <ion-icon name="arrow-back-outline" aria-hidden="true"></ion-icon>
                Mulai Belanja
              </Link>
            </div>

          ) : (

            /* ── Cart layout ── */
            <div className="cart-layout">

              {/* Item list */}
              <div className="cart-items-panel">
                <div className="cart-items-header">
                  <span className="cart-items-count">{itemCount} produk</span>
                  <button className="cart-clear-btn" onClick={handleClear}>
                    <ion-icon name="trash-outline" aria-hidden="true"></ion-icon>
                    Hapus semua
                  </button>
                </div>

                {cart.map(item => (
                  <div key={item.id} className="cart-item">

                    {/* Thumbnail */}
                    <div className="cart-item-img">
                      <img src={item.image} alt={item.name} />
                    </div>

                    {/* Info */}
                    <div className="cart-item-body">
                      <Link href={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                      {item.packSize && (
                        <div className="cart-item-meta">{item.packSize}</div>
                      )}

                      <div className="cart-item-bottom">
                        {/* Qty control */}
                        <div className="cart-qty-ctrl">
                          <button
                            className="cart-qty-btn"
                            onClick={() => handleQty(item.id, -1)}
                            aria-label="Kurangi"
                          >−</button>
                          <div className="cart-qty-val">{item.qty}</div>
                          <button
                            className="cart-qty-btn"
                            onClick={() => handleQty(item.id, 1)}
                            aria-label="Tambah"
                          >+</button>
                        </div>

                        <span className="cart-item-price">
                          {formatPrice(item.price * item.qty)}
                        </span>

                        <button
                          className="cart-item-remove"
                          onClick={() => handleRemove(item.id)}
                          aria-label="Hapus produk"
                        >
                          <ion-icon name="trash-outline" aria-hidden="true"></ion-icon>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Order summary */}
              <aside className="cart-summary">
                <div className="cart-summary-title">Ringkasan Pesanan</div>

                <div className="cart-summary-body">
                  <div className="cart-summary-row">
                    <span>Subtotal ({itemCount} produk)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Ongkos kirim</span>
                    <span className="cart-summary-free">Gratis</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Diskon</span>
                    <span>Rp 0</span>
                  </div>
                  <div className="cart-summary-row total">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  className="cart-checkout-btn"
                  onClick={() => {
                    if (user) {
                      router.push('/checkout');
                    } else {
                      openAuthModal();
                    }
                  }}
                >
                  <ion-icon name="card-outline" aria-hidden="true"></ion-icon>
                  Bayar Sekarang
                </button>

                <Link href="/" className="cart-continue-link">
                  <ion-icon name="arrow-back-outline" aria-hidden="true"></ion-icon>
                  Lanjut belanja
                </Link>
              </aside>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
