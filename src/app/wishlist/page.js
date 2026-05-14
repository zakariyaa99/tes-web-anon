'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../lib/AuthContext';
import {
  getWishlist,
  removeFromWishlist,
  wishlistCount,
  getRemoteWishlist,
  removeFromWishlistRemote,
} from '../../lib/wishlistUtils';
import { addToCart, addToCartRemote } from '../../lib/cartUtils';
import './wishlist.css';

function formatPrice(n) {
  return `Rp ${Number(n).toLocaleString('id-ID')}`;
}

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist]   = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted]     = useState(false);
  const [addedIds, setAddedIds]   = useState(new Set());
  const router = useRouter();

  // Load wishlist — remote when logged in, localStorage when guest
  useEffect(() => {
    async function load() {
      if (user) {
        try {
          setWishlist(await getRemoteWishlist(user.id));
        } catch {
          setWishlist(getWishlist()); // fallback
        }
      } else {
        setWishlist(getWishlist());
      }
      setMounted(true);
    }
    load();
  }, [user]);

  // Local event listener keeps guest wishlist in sync within tab
  useEffect(() => {
    if (user) return;
    function onWlUpdated(e) { setWishlist(e.detail.wishlist); }
    function onStorage(e) {
      if (e.key === 'anon_wishlist') setWishlist(getWishlist());
    }
    window.addEventListener('wishlistUpdated', onWlUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('wishlistUpdated', onWlUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [user]);

  async function handleRemove(id) {
    if (user) {
      try {
        await removeFromWishlistRemote(user.id, id);
        setWishlist(wl => wl.filter(i => i.id !== id));
      } catch (e) { console.error(e); }
    } else {
      setWishlist(removeFromWishlist(id));
    }
  }

  async function handleAddToCart(item) {
    if (user) {
      try {
        await addToCartRemote(user.id, {
          id: item.id,
          name: item.name,
          price: item.price,
          packSize: item.packSize,
          image: item.image,
        }, 1);
      } catch (e) { console.error(e); }
    } else {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        packSize: item.packSize,
        image: item.image,
      }, 1);
    }
    setAddedIds(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1500);
  }

  const count = wishlistCount(wishlist);

  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="wl-page">
        <div className="container">

          {/* Nav row */}
          <div className="wl-nav-row">
            <h1 className="wl-page-title">
              <ion-icon name="heart" aria-hidden="true"></ion-icon>
              Wishlist
            </h1>
            <div className="wl-nav-actions">
              <Link href="/cart" className="wl-cart-link" aria-label="Lihat keranjang">
                <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
              </Link>
              <button className="wl-back-btn" onClick={() => router.back()} aria-label="Kembali">
                <ion-icon name="arrow-back-outline" aria-hidden="true"></ion-icon>
              </button>
            </div>
          </div>

          {!mounted ? null : count === 0 ? (

            /* ── Empty state ── */
            <div className="wl-empty">
              <ion-icon name="heart-outline" className="wl-empty-icon" aria-hidden="true"></ion-icon>
              <h2>Wishlist masih kosong</h2>
              <p>Simpan produk favoritmu di sini agar mudah ditemukan nanti.</p>
              <Link href="/" className="wl-empty-btn">
                <ion-icon name="arrow-back-outline" aria-hidden="true"></ion-icon>
                Jelajahi Produk
              </Link>
            </div>

          ) : (
            <>
              <p className="wl-count">{count} produk tersimpan</p>

              <div className="wl-grid">
                {wishlist.map(item => (
                  <div key={item.id} className="wl-card">

                    {/* Remove button */}
                    <button
                      className="wl-remove-btn"
                      onClick={() => handleRemove(item.id)}
                      aria-label="Hapus dari wishlist"
                    >
                      <ion-icon name="close-outline" aria-hidden="true"></ion-icon>
                    </button>

                    {/* Image */}
                    <Link href={`/product/${item.id}`} className="wl-card-img">
                      <img src={item.image} alt={item.name} />
                    </Link>

                    {/* Info */}
                    <div className="wl-card-info">
                      {item.category && (
                        <div className="wl-card-category">{item.category}</div>
                      )}
                      <div className="wl-card-name">{item.name}</div>
                      {item.packSize && (
                        <div className="wl-card-meta">{item.packSize}</div>
                      )}
                      <div className="wl-card-price">{formatPrice(item.price)}</div>
                    </div>

                    {/* Actions */}
                    <div className="wl-card-footer">
                      <button
                        className="wl-add-cart-btn"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ion-icon
                          name={addedIds.has(item.id) ? 'checkmark-outline' : 'cart-outline'}
                          aria-hidden="true"
                        ></ion-icon>
                        {addedIds.has(item.id) ? 'Ditambahkan!' : 'Keranjang'}
                      </button>
                      <Link href={`/product/${item.id}`} className="wl-view-btn" aria-label="Lihat detail">
                        <ion-icon name="eye-outline" aria-hidden="true"></ion-icon>
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
