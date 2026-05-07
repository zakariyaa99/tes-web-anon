'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import NotificationToast from '@/components/NotificationToast';
import Banner from '@/components/Banner';
import CategoryStrip from '@/components/CategoryStrip';
import Sidebar from '@/components/Sidebar';
import ProductMinimal from '@/components/ProductMinimal';
import ProductFeatured from '@/components/ProductFeatured';
import ProductGrid from '@/components/ProductGrid';
import TestimonialCTAService from '@/components/TestimonialCTAService';
import Blog from '@/components/Blog';
import Footer from '@/components/Footer';

export default function Home() {
  const [modalClosed, setModalClosed] = useState(true);
  const [toastClosed, setToastClosed] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        onMenuOpenForSidebar={() => setSidebarOpen(true)} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <main>
        <Banner />
        {/* <CategoryStrip /> */}

        {/* Product Container: Sidebar + Product Box */}
        <div className="product-container">
          <div className="container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="product-box">
              {/*<ProductMinimal />*/}
              {/*<ProductFeatured />*/}
              <ProductGrid searchQuery={searchQuery} />
            </div>
          </div>
        </div>

        {/*<TestimonialCTAService />*/}
        {/*<Blog />*/}
      </main>

      <Footer />
    </>
  );
}
