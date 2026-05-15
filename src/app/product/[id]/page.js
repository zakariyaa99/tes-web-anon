'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../lib/AuthContext';
import { addToCart, addToCartRemote } from '../../../lib/cartUtils';
import { toggleWishlist, isWishlisted, toggleWishlistRemote, isWishlistedRemote } from '../../../lib/wishlistUtils';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import '../product-detail.css';

function formatPrice(n) {
  return n ? `Rp ${Number(n).toLocaleString('id-ID')}` : 'Rp 0';
}

function formatCategory(raw) {
  if (!raw) return 'Uncategorized';
  return raw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/* ─── Inner content — uses the resolved product id ─── */
function ProductDetailContent({ id }) {
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [toast, setToast] = useState('');
  const [cartModal, setCartModal] = useState(false);
  const [toastTimer, setToastTimer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);

        // Fetch related products in same category
        if (data?.product_type) {
          const { data: related } = await supabase
            .from('products')
            .select('*')
            .eq('product_type', data.product_type)
            .neq('id', id)
            .limit(8);

          setRelatedProducts(related || []);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Hydrate wished state — remote when logged in, localStorage when guest
  useEffect(() => {
    if (!product?.id) return;
    if (user) {
      isWishlistedRemote(user.id, product.id).then(setWished);
    } else {
      setWished(isWishlisted(product.id));
    }
  }, [product, user]);

  function showToast(msg) {
    setToast(msg);
    if (toastTimer) clearTimeout(toastTimer);
    const t = setTimeout(() => setToast(''), 2500);
    setToastTimer(t);
  }

  function changeQty(delta) {
    const maxQty = product?.stok > 0 ? Math.min(product.stok, 99) : 99;
    setQty(prev => Math.max(1, Math.min(maxQty, prev + delta)));
  }

  if (loading) {
    return (
      <>
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="pd-page">
          <div className="container">
            <div className="pd-loading">
              <div className="pd-spinner"></div>
              <p>Memuat produk...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="pd-page">
          <div className="container">
            <div className="pd-not-found">
              <ion-icon name="sad-outline"></ion-icon>
              <h2>Produk tidak ditemukan</h2>
              <p>Produk yang kamu cari tidak tersedia atau telah dihapus.</p>
              <Link href="/">Kembali ke Beranda</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const category = formatCategory(product.product_type);
  const price = product.harga || 0;
  const isSoldOut = product.stok !== undefined && product.stok <= 0;
  const isLowStock = product.stok > 0 && product.stok <= 5;
  const subtotal = formatPrice(price * qty);

  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="pd-page">
        <div className="container">

          {/* Breadcrumb + Back button row */}
          <div className="pd-nav-row">
            <nav className="pd-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Beranda</Link>
              <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
              <Link href={`/?tab=${encodeURIComponent(category)}#product-grid`}>{category}</Link>
              <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
              <span className="pd-bc-current">{product.nama_produk}</span>
            </nav>
            <button className="pd-back-btn" onClick={() => router.back()} aria-label="Kembali">
              <ion-icon name="arrow-back-outline" aria-hidden="true"></ion-icon>
            </button>
          </div>

          {/* Toast notification */}
          {toast && <div className="pd-toast">{toast}</div>}

          {/* Main layout: gallery + buy panel */}
          <div className="pd-main-layout">

            {/* Gallery */}
            <div className="pd-gallery">
              <div className="pd-main-img">
                {isLowStock && <span className="pd-img-badge">Stok terbatas</span>}
                {isSoldOut && <span className="pd-img-badge" style={{ background: '#ffebee', color: '#c62828' }}>Habis</span>}
                <img
                  src="/images/products/labkimiaproduk.png"
                  alt={product.nama_produk || 'Product image'}
                />
              </div>
              <div className="pd-thumb-row">
                {[1, 2, 3, 4].map((_, i) => (
                  <div
                    key={i}
                    className={`pd-thumb${i === 0 ? ' active' : ''}`}
                    onClick={(e) => {
                      document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
                      e.currentTarget.classList.add('active');
                    }}
                  >
                    <img src="/images/products/labkimiaproduk.png" alt={`View ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Buy Panel */}
            <div className="pd-buy-panel">
              <div className="pd-prod-name">{product.nama_produk}</div>

              <div className="pd-rating-row">
                <span className="pd-stars">★★★★☆</span>
                <span className="pd-rating-num">4.2</span>
                <span className="pd-rating-count">(87 ulasan)</span>
                <span className="pd-sold-count">124 terjual</span>
              </div>

              <div className="pd-price-box">
                <div>
                  <span className="pd-price-main">{formatPrice(price)}</span>
                </div>
              </div>

              <div className="pd-divider"></div>

              <div className="pd-stock-row">
                <div className={`pd-stock-dot${isSoldOut || isLowStock ? ' low' : ''}`}></div>
                <span className="pd-stock-label">Stok:</span>
                {isSoldOut ? (
                  <span className="pd-stock-num low">Habis</span>
                ) : isLowStock ? (
                  <span className="pd-stock-num low">Sisa {product.stok} lagi!</span>
                ) : (
                  <span className="pd-stock-num">{product.stok} tersedia</span>
                )}
              </div>

              {!isSoldOut && (
                <div className="pd-qty-row">
                  <span className="pd-qty-label">Jumlah</span>
                  <div className="pd-qty-ctrl">
                    <button className="pd-qty-btn" onClick={() => changeQty(-1)} aria-label="Kurang">−</button>
                    <div className="pd-qty-val">{qty}</div>
                    <button className="pd-qty-btn" onClick={() => changeQty(1)} aria-label="Tambah">+</button>
                  </div>
                  <span className="pd-subtotal">Total: <span>{subtotal}</span></span>
                </div>
              )}

              <div className="pd-cta-row">
                <button
                  className="pd-btn-buy"
                  disabled={isSoldOut}
                  style={isSoldOut ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  onClick={async () => {
                    if (isSoldOut) return;
                    const cartItem = {
                      id: product.id,
                      name: product.nama_produk,
                      price: price,
                      packSize: [product.pack_size, product.unit].filter(Boolean).join(' '),
                      image: '/images/products/labkimiaproduk.png',
                    };
                    if (user) {
                      try { await addToCartRemote(user.id, cartItem, qty); } catch(e) { console.error(e); }
                    } else {
                      addToCart(cartItem, qty);
                    }
                    router.push('/checkout');
                  }}
                >
                  Beli sekarang
                </button>
                <button
                  className="pd-btn-cart"
                  disabled={isSoldOut}
                  style={isSoldOut ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  onClick={async () => {
                    if (isSoldOut) return;
                    const cartItem = {
                      id: product.id,
                      name: product.nama_produk,
                      price: price,
                      packSize: [product.pack_size, product.unit].filter(Boolean).join(' '),
                      image: '/images/products/labkimiaproduk.png',
                    };
                    if (user) {
                      try { await addToCartRemote(user.id, cartItem, qty); } catch(e) { console.error(e); }
                    } else {
                      addToCart(cartItem, qty);
                    }
                    setCartModal(true);
                  }}
                >
                  <ion-icon name="cart-outline" aria-hidden="true"></ion-icon>
                  Keranjang
                </button>
                <button
                  className={`pd-btn-wish${wished ? ' active' : ''}`}
                  aria-label="Tambah ke wishlist"
                  onClick={async () => {
                    const wlProduct = {
                      id: product.id,
                      name: product.nama_produk,
                      price: price,
                      packSize: [product.pack_size, product.unit].filter(Boolean).join(' '),
                      image: '/images/products/labkimiaproduk.png',
                      category,
                    };
                    if (user) {
                      try {
                        const { added } = await toggleWishlistRemote(user.id, wlProduct);
                        setWished(added);
                        showToast(added ? 'Ditambahkan ke wishlist!' : 'Dihapus dari wishlist');
                      } catch(e) { console.error(e); }
                    } else {
                      const { added } = toggleWishlist(wlProduct);
                      setWished(added);
                      showToast(added ? 'Ditambahkan ke wishlist!' : 'Dihapus dari wishlist');
                    }
                  }}
                >
                  <ion-icon name={wished ? 'heart' : 'heart-outline'} aria-hidden="true"></ion-icon>
                </button>
              </div>
            </div>
          </div>

          {/* Shipping info */}
          <div className="pd-ship-box">
            <div className="pd-ship-title">
              <ion-icon name="car-outline" aria-hidden="true"></ion-icon>
              Pengiriman &amp; toko
            </div>
            <div className="pd-ship-row">
              <ion-icon name="location-outline" aria-hidden="true"></ion-icon>
              <span className="pd-ship-label">Dikirim dari</span>
              <span className="pd-ship-val">Jakarta Selatan</span>
            </div>
            <div className="pd-ship-row">
              <ion-icon name="cube-outline" aria-hidden="true"></ion-icon>
              <span className="pd-ship-label">Estimasi</span>
              <span className="pd-ship-val">Tiba dalam <strong>2–3 hari kerja</strong></span>
            </div>
            <div className="pd-ship-row">
              <ion-icon name="receipt-outline" aria-hidden="true"></ion-icon>
              <span className="pd-ship-label">Ongkir</span>
              <span className="pd-ship-val green">
                <ion-icon name="checkmark-outline" aria-hidden="true"></ion-icon>
                Gratis ongkir
              </span>
            </div>
            <div className="pd-ship-row">
              <ion-icon name="return-down-back-outline" aria-hidden="true"></ion-icon>
              <span className="pd-ship-label">Retur</span>
              <span className="pd-ship-val">Gratis retur dalam 7 hari</span>
            </div>
          </div>

          {/* Description + Specs */}
          <div className="pd-section-card">
            <div className="pd-section-title">
              <ion-icon name="document-text-outline" aria-hidden="true"></ion-icon>
              Deskripsi produk
            </div>
            <div className="pd-desc-text">
              <p>Produk berkualitas dari kategori {category}. Tersedia dengan stok terbatas.</p>
              <p>Pastikan kamu memesan sebelum kehabisan. Produk dikirim langsung dari gudang kami dengan pengemasan yang aman.</p>
            </div>
            <div className="pd-specs">
              <div className="pd-spec-row">
                <span className="pd-spec-key">Kategori</span>
                <span className="pd-spec-val">{category}</span>
              </div>
              {(product.pack_size || product.unit) && (
                <div className="pd-spec-row">
                  <span className="pd-spec-key">Pack Size</span>
                  <span className="pd-spec-val">
                    {[product.pack_size, product.unit].filter(Boolean).join(' ')}
                  </span>
                </div>
              )}
              {product.stok !== undefined && (
                <div className="pd-spec-row">
                  <span className="pd-spec-key">Stok tersedia</span>
                  <span className="pd-spec-val">{product.stok} unit</span>
                </div>
              )}
              <div className="pd-spec-row">
                <span className="pd-spec-key">Kondisi</span>
                <span className="pd-spec-val">Baru</span>
              </div>
              <div className="pd-spec-row">
                <span className="pd-spec-key">Garansi</span>
                <span className="pd-spec-val">30 hari garansi produk</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="pd-section-card">
            <div className="pd-section-title">
              <ion-icon name="star-outline" aria-hidden="true"></ion-icon>
              Ulasan pembeli
            </div>
            <div className="pd-review-summary">
              <div className="pd-rev-score">
                <div className="pd-rev-score-num">4.2</div>
                <div className="pd-rev-score-stars">★★★★☆</div>
                <div className="pd-rev-score-count">87 ulasan</div>
              </div>
              <div className="pd-rev-bars">
                {[[5, 60], [4, 20], [3, 12], [2, 5], [1, 3]].map(([star, pct]) => (
                  <div key={star} className="pd-rev-bar-row">
                    <span className="pd-rev-bar-label">{star}</span>
                    <div className="pd-rev-bar-track">
                      <div className="pd-rev-bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="pd-rev-bar-num">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pd-review-item">
              <div className="pd-rev-header">
                <div className="pd-rev-avatar">BS</div>
                <div>
                  <div className="pd-rev-name">Budi S.</div>
                  <div className="pd-rev-stars">★★★★★</div>
                </div>
                <span className="pd-rev-date">3 hari lalu</span>
              </div>
              <div className="pd-rev-text">Kualitas bagus untuk harganya! Pengiriman cepat dan packing aman. Sangat direkomendasikan.</div>
            </div>

            <div className="pd-review-item">
              <div className="pd-rev-header">
                <div className="pd-rev-avatar" style={{ background: '#E1F5EE', color: '#085041' }}>RA</div>
                <div>
                  <div className="pd-rev-name">Rina A.</div>
                  <div className="pd-rev-stars">★★★★☆</div>
                </div>
                <span className="pd-rev-date">1 minggu lalu</span>
              </div>
              <div className="pd-rev-text">Produk sesuai deskripsi. Pelayanan toko ramah dan responsif.</div>
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="pd-section-card">
              <div className="pd-section-title">
                <ion-icon name="grid-outline" aria-hidden="true"></ion-icon>
                Produk serupa
              </div>
              <div className="pd-rec-grid">
                {relatedProducts.map(rp => (
                  <Link key={rp.id} href={`/product/${rp.id}`} className="pd-rec-card">
                    <div className="pd-rec-img">
                      <img src="/images/products/labkimiaproduk.png" alt={rp.nama_produk || 'Product'} />
                    </div>
                    <div className="pd-rec-info">
                      <div className="pd-rec-category">{formatCategory(rp.product_type)}</div>
                      <div className="pd-rec-name">{rp.nama_produk}</div>
                      <div className="pd-rec-price">{formatPrice(rp.harga)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Cart Modal */}
      {cartModal && (
        <div className="pd-cm-overlay" onClick={() => setCartModal(false)}>
          <div className="pd-cm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Keranjang">

            {/* Header */}
            <div className="pd-cm-header">
              <div className="pd-cm-header-title">
                <div className="pd-cm-check">
                  <ion-icon name="checkmark-outline" aria-hidden="true"></ion-icon>
                </div>
                Ditambahkan ke Keranjang
              </div>
              <button className="pd-cm-close" onClick={() => setCartModal(false)} aria-label="Tutup">
                <ion-icon name="close-outline" aria-hidden="true"></ion-icon>
              </button>
            </div>

            {/* Product row */}
            <div className="pd-cm-product">
              <div className="pd-cm-img">
                <img src="/images/products/labkimiaproduk.png" alt={product.nama_produk} />
              </div>
              <div className="pd-cm-info">
                <div className="pd-cm-name">{product.nama_produk}</div>
                {(product.pack_size || product.unit) && (
                  <div className="pd-cm-meta">
                    {[product.pack_size, product.unit].filter(Boolean).join(' ')}
                  </div>
                )}
                <div className="pd-cm-row">
                  <span className="pd-cm-qty-label">Qty: <strong>{qty}</strong></span>
                  <span className="pd-cm-price">{formatPrice(price)}</span>
                </div>
              </div>
            </div>

            {/* Subtotal */}
            <div className="pd-cm-subtotal">
              <span>Subtotal</span>
              <span className="pd-cm-subtotal-val">{subtotal}</span>
            </div>

            {/* Actions */}
            <div className="pd-cm-actions">
              <button className="pd-cm-btn-continue" onClick={() => setCartModal(false)}>
                Lanjut Belanja
              </button>
              <Link href="/cart" className="pd-cm-btn-view">
                <ion-icon name="cart-outline" aria-hidden="true"></ion-icon>
                Lihat Keranjang
              </Link>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

/* ─── Page wrapper — unwraps params promise using React.use() per Next.js 16 convention ─── */
export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Memuat...</p>
      </div>
    }>
      <ProductDetailContent id={id} />
    </Suspense>
  );
}
