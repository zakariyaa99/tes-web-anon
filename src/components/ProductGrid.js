'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';



export default function ProductGrid({ searchQuery = '' }) {
  const [activeTab, setActiveTab] = useState('All Products');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsData, setProductsData] = useState({ 'All Products': [] });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsRef = useRef(null);

  const checkScroll = () => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = tabsRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  // Re-check when tabs change (e.g. after data loads)
  useEffect(() => {
    checkScroll();
  }, [productsData]);

  const scrollTabs = (dir) => {
    const el = tabsRef.current;
    if (el) el.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        
        if (error) {
          throw error;
        }

        const productsArray = Array.isArray(data) ? data : [];

        // Map the fetched Supabase data to match the component's expected structure
        const formattedProducts = productsArray.map(item => {
          let starsArray = [true, true, true, false, false]; // Default stars

          const priceStr = item.harga ? `Rp ${item.harga.toLocaleString()}` : 'Rp 0';

          let rawType = item.product_type || 'Uncategorized';
          let oneWordType = rawType.split(' ')[0];
          let categoryStr = oneWordType.charAt(0).toUpperCase() + oneWordType.slice(1).toLowerCase();

          return {
            img1: '/images/products/labkimiaproduk.png',
            img2: '/images/products/labkimiaproduk.png',
            alt: item.nama_produk || 'Product Image',
            badge: item.stok > 0 ? null : 'sold out',
            badgeClass: item.stok > 0 ? '' : 'angle black',
            category: categoryStr,
            title: item.nama_produk || 'Untitled Product',
            stars: starsArray,
            price: priceStr,
            oldPrice: null,
          };
        });

        const newProductsData = { 'All Products': formattedProducts };
        formattedProducts.forEach(p => {
          if (!newProductsData[p.category]) {
            newProductsData[p.category] = [];
          }
          newProductsData[p.category].push(p);
        });

        setProductsData(newProductsData);
      } catch (err) {
        console.error("Failed to load products from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const TABS = Object.keys(productsData);
  let products = productsData[activeTab] || [];

  if (searchQuery.trim()) {
    const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length >= 1);
    products = products.filter(p => {
      const title = p.title.toLowerCase();
      const category = p.category.toLowerCase();
      return words.some(word => title.includes(word) || category.includes(word));
    });
  }

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;
  const currentProducts = products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const arrowBtnStyle = (visible) => ({
    flexShrink: 0,
    width: 36,
    background: 'var(--white)',
    border: 'none',
    cursor: visible ? 'pointer' : 'default',
    fontSize: 24,
    color: 'var(--sonic-silver)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    padding: 0,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
    transition: 'opacity 0.2s',
  });

  return (
    <div className="product-main" id="product-grid">
      <div className="product-tabs-bar" style={{ display: 'flex', alignItems: 'stretch', padding: 0 }}>
        <button
          onClick={() => scrollTabs(-1)}
          aria-label="Scroll tabs left"
          style={{ ...arrowBtnStyle(canScrollLeft), borderRight: '1px solid var(--cultured)' }}
        >
          ‹
        </button>
        <div className="product-tabs" ref={tabsRef} style={{ flex: 1, minWidth: 0 }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`product-tab-btn${activeTab === tab ? ' active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollTabs(1)}
          aria-label="Scroll tabs right"
          style={{ ...arrowBtnStyle(canScrollRight), borderLeft: '1px solid var(--cultured)' }}
        >
          ›
        </button>
      </div>

      <div className="product-grid">
        {currentProducts.map((p, i) => (
          <div className="showcase" key={i}>
            <div className="showcase-banner">
              <img src={p.img1} alt={p.alt} width="300" className="product-img default" />
              <img src={p.img2} alt={p.alt} width="300" className="product-img hover" />
              {p.badge && <p className={`showcase-badge${p.badgeClass ? ' ' + p.badgeClass : ''}`}>{p.badge}</p>}
              <div className="showcase-actions">
                <button className="btn-action"><ion-icon name="heart-outline"></ion-icon></button>
                <button className="btn-action"><ion-icon name="bag-add-outline"></ion-icon></button>
              </div>
            </div>
            <div className="showcase-content">
              <a href="#" className="showcase-category">{p.category}</a>
              <h3><a href="#" className="showcase-title">{p.title}</a></h3>
              <div className="showcase-rating">
                {p.stars.map((filled, si) => (
                  <ion-icon key={si} name={filled ? 'star' : 'star-outline'}></ion-icon>
                ))}
              </div>
              <div className="price-box">
                <p className="price">{p.price}</p>
                <del>{p.oldPrice}</del>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '40px', gap: '15px' }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="product-tab-btn"
            style={{ padding: '8px 20px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>
          
          <span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--sonic-silver)' }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="product-tab-btn"
            style={{ padding: '8px 20px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
