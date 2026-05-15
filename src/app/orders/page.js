'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import './orders.css';

function formatPrice(n) {
  return `Rp ${Number(n).toLocaleString('id-ID')}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_LABEL = {
  pending:    'Menunggu Pembayaran',
  paid:       'Dibayar',
  processing: 'Diproses',
  shipped:    'Dikirim',
  delivered:  'Selesai',
  cancelled:  'Dibatalkan',
};

const STATUS_ICON = {
  pending:    'time-outline',
  paid:       'checkmark-circle-outline',
  processing: 'settings-outline',
  shipped:    'car-outline',
  delivered:  'bag-check-outline',
  cancelled:  'close-circle-outline',
};

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  async function toggleOpen() {
    if (!open && items === null) {
      setLoadingItems(true);
      const { data } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
      setItems(data || []);
      setLoadingItems(false);
    }
    setOpen(o => !o);
  }

  const statusClass = order.status || 'pending';

  return (
    <div className="order-card">
      <div className="order-card-header" onClick={toggleOpen} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && toggleOpen()}>
        <div className="order-card-left">
          <div className="order-id">#{order.midtrans_order_id?.split('-').slice(-1)[0] || order.id.slice(0, 8).toUpperCase()}</div>
          <div className="order-date">{formatDate(order.created_at)}</div>
        </div>
        <div className="order-card-right">
          <div className="order-total">{formatPrice(order.total_amount)}</div>
          <span className={`order-status-badge ${statusClass}`}>
            <ion-icon name={STATUS_ICON[statusClass] || 'ellipse-outline'} />
            {STATUS_LABEL[statusClass] || statusClass}
          </span>
          <ion-icon
            name="chevron-down-outline"
            className={`order-chevron${open ? ' open' : ''}`}
          />
        </div>
      </div>

      {open && (
        <div className="order-card-body">
          {loadingItems ? (
            <div style={{ textAlign: 'center', color: 'var(--sonic-silver)', padding: '8px 0', fontSize: '14px' }}>
              Memuat detail...
            </div>
          ) : items?.length > 0 ? (
            <>
              {items.map(item => (
                <div key={item.id} className="order-item-row">
                  <div className="order-item-img">
                    <img src={item.image || '/images/products/labkimiaproduk.png'} alt={item.name} />
                  </div>
                  <div className="order-item-info">
                    <div className="order-item-name">{item.name}</div>
                    <div className="order-item-meta">Qty: {item.qty}</div>
                  </div>
                  <div className="order-item-price">{formatPrice(item.price * item.qty)}</div>
                </div>
              ))}

              {/* Shipping address */}
              {order.shipping_address && (
                <div className="order-shipping-row">
                  <div className="order-shipping-label">Dikirim ke</div>
                  <div className="order-shipping-val">
                    {order.shipping_name} · {order.shipping_phone}
                  </div>
                  <div className="order-shipping-val">
                    {[order.shipping_address, order.shipping_city, order.shipping_postal]
                      .filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--sonic-silver)', fontSize: '14px', margin: 0 }}>
              Detail produk tidak tersedia.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, openAuthModal } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const statusParam = searchParams.get('status'); // 'success' | 'pending'

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      openAuthModal();
    }
  }, [user, authLoading, router, openAuthModal]);

  // Fetch orders
  useEffect(() => {
    if (!user) return;
    async function loadOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setOrders(data || []);
      setLoading(false);
    }
    loadOrders();
  }, [user]);

  if (authLoading || (!user && loading)) {
    return (
      <>
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="orders-page">
          <div className="orders-container">
            <div className="orders-skeleton">
              {[1, 2, 3].map(i => (
                <div key={i} className="orders-skel-card">
                  <div className="skel h16 w60" />
                  <div className="skel h12 w40" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="orders-page">
        <div className="orders-container">

          {/* Nav row */}
          <div className="orders-nav-row">
            <h1 className="orders-page-title">
              <ion-icon name="receipt-outline" aria-hidden="true" />
              Pesanan Saya
            </h1>
            <button className="orders-back-btn" onClick={() => router.back()} aria-label="Kembali">
              <ion-icon name="arrow-back-outline" aria-hidden="true" />
            </button>
          </div>

          {/* Success / Pending banner */}
          {statusParam === 'success' && (
            <div className="orders-status-banner success">
              <ion-icon name="checkmark-circle-outline" />
              Pembayaran berhasil! Pesanan kamu sedang diproses.
            </div>
          )}
          {statusParam === 'pending' && (
            <div className="orders-status-banner pending">
              <ion-icon name="time-outline" />
              Pembayaran dalam proses. Selesaikan pembayaran sesuai instruksi.
            </div>
          )}

          {/* Orders list */}
          {loading ? (
            <div className="orders-skeleton">
              {[1, 2, 3].map(i => (
                <div key={i} className="orders-skel-card">
                  <div className="skel h16 w60" />
                  <div className="skel h12 w40" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <ion-icon name="receipt-outline" />
              <h2>Belum ada pesanan</h2>
              <p>Kamu belum pernah melakukan pembelian.</p>
              <Link href="/" className="orders-shop-btn">
                <ion-icon name="bag-handle-outline" />
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <OrdersContent />
    </Suspense>
  );
}
