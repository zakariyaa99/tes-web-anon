'use client';

import { useState, Suspense } from 'react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import NotificationToast from '@/components/NotificationToast';
import Banner from '@/components/Banner';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

export default function Home() {
  const [modalClosed, setModalClosed] = useState(true);
  const [toastClosed, setToastClosed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Overlay (shared) */}
      <div className="overlay"></div>

      {/* Newsletter Modal */}
      {!modalClosed && <Modal onClose={() => setModalClosed(true)} />}

      {/* Notification Toast */}
      {!toastClosed && <NotificationToast onClose={() => setToastClosed(true)} />}

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <main>
        <Banner />

        {/* Product Container */}
        <div className="product-container">
          <div className="container">
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
              <ProductGrid searchQuery={searchQuery} />
            </Suspense>
          </div>
        </div>

        {/*<TestimonialCTAService />*/}
        {/*<Blog />*/}
      </main>

      <Footer />
    </>
  );
}
