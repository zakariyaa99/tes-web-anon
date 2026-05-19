'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import '../app/search/search.css';



export default function ProductGrid({ searchQuery = '' }) {
  const searchParams = useSearchParams();
  const urlTab = searchParams ? searchParams.get('tab') : null;

  const [activeTab, setActiveTab] = useState('Semua Produk');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsData, setProductsData] = useState({ 'Semua Produk': [] });
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

  // Sync active tab with URL parameter
  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
      setTimeout(() => {
        const grid = document.getElementById('product-grid');
        if (grid) {
          const headerOffset = 60;
          const offsetPosition = grid.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [urlTab]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const PAGE_SIZE = 1000;
        let offset = 0;
        let allRows = [];

        while (true) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .range(offset, offset + PAGE_SIZE - 1);

          if (error) throw error;
          if (!data || data.length === 0) break;

          allRows = allRows.concat(data);
          if (data.length < PAGE_SIZE) break;
          offset += PAGE_SIZE;
        }

        const productsArray = allRows;

        // Map the fetched Supabase data to match the component's expected structure
        const formattedProducts = productsArray.map(item => {
          let starsArray = [true, true, true, false, false]; // Default stars

          const priceStr = item.harga ? `Rp ${item.harga.toLocaleString()}` : 'Rp 0';

          let rawType = item.product_type || 'Tanpa Kategori';
          let categoryStr = rawType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

          return {
            id: item.id,
            img1: '/images/products/labkimiaproduk.png',
            img2: '/images/products/labkimiaproduk.png',
            alt: item.nama_produk || 'Product Image',
            badge: item.stok > 0 ? null : 'sold out',
            badgeClass: item.stok > 0 ? '' : 'angle black',
            category: categoryStr,
            title: item.nama_produk || 'Produk Tanpa Nama',
            stars: starsArray,
            price: priceStr,
            oldPrice: null,
          };
        });

        const cats = Array.from(new Set(formattedProducts.map(p => p.category))).sort();
        const newProductsData = { 'Semua Produk': formattedProducts };
        cats.forEach(cat => {
          newProductsData[cat] = formattedProducts.filter(p => p.category === cat);
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

  const scrollToGridTop = () => {
    // Use setTimeout to ensure the DOM updates with the new products
    // before we calculate the offset and scroll.
    setTimeout(() => {
      const grid = document.getElementById('product-grid');
      if (grid) {
        const headerOffset = 60;
        const offsetPosition = grid.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }, 50);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    scrollToGridTop();
  };

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
                scrollToGridTop();
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

      {/* Added minHeight to prevent the page from shrinking abruptly on the last page, 
          which would prevent the browser from being able to scroll to the top of the grid */}
      <div className="sr-product-grid" style={{ minHeight: '800px' }}>
        {currentProducts.map((p, i) => (
          <Link href={`/product/${p.id}`} className="sr-product-card" key={i} style={{ textDecoration: 'none' }}>
            <div className="sr-product-img">
              <img src={p.img1} alt={p.alt} width={300} height={300} />
              {p.badge && (
                <span className="sr-badge sr-badge-soldout">Habis</span>
              )}
            </div>
            <div className="sr-product-info">
              <span className="sr-product-category">{p.category}</span>
              <h3 className="sr-product-name">{p.title}</h3>
              <div className="sr-product-price">{p.price}</div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="sr-pagination">
          {/* Prev */}
          <button
            className="sr-page-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            ‹
          </button>

          {/* Windowed page numbers */}
          {(() => {
            const SIBLINGS = 2; // pages shown on each side of current
            const items = [];
            const addPage = (p) => items.push({ type: 'page', value: p });
            const addEllipsis = (key) => items.push({ type: 'ellipsis', key });

            if (totalPages <= 2 * SIBLINGS + 5) {
              // Few enough pages — show them all
              for (let p = 1; p <= totalPages; p++) addPage(p);
            } else {
              const left  = Math.max(2, currentPage - SIBLINGS);
              const right = Math.min(totalPages - 1, currentPage + SIBLINGS);

              addPage(1);
              if (left > 2) addEllipsis('left');
              for (let p = left; p <= right; p++) addPage(p);
              if (right < totalPages - 1) addEllipsis('right');
              addPage(totalPages);
            }

            return items.map((item) =>
              item.type === 'ellipsis' ? (
                <span key={item.key} className="sr-page-ellipsis">…</span>
              ) : (
                <button
                  key={item.value}
                  className={`sr-page-btn${currentPage === item.value ? ' active' : ''}`}
                  onClick={() => handlePageChange(item.value)}
                  aria-label={`Page ${item.value}`}
                  aria-current={currentPage === item.value ? 'page' : undefined}
                >
                  {item.value}
                </button>
              )
            );
          })()}

          {/* Next */}
          <button
            className="sr-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

