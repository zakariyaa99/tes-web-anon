'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './search.css';

const PER_PAGE = 12;

/* ─── helpers ─── */
function tokenize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length >= 1);
}

function scoreProduct(product, queryTokens) {
  let score = 0;
  const nameTokens = tokenize(product.nama_produk || '');
  const typeTokens = tokenize(product.product_type || '');
  const allTokens = [...nameTokens, ...typeTokens];
  queryTokens.forEach(qt => {
    allTokens.forEach(nt => {
      if (nt === qt) score += 10;
      else if (nt.startsWith(qt)) score += 6;
      else if (nt.includes(qt)) score += 3;
    });
  });
  return score;
}

function formatPrice(n) {
  return n ? `Rp ${Number(n).toLocaleString('id-ID')}` : 'Rp 0';
}

function HighlightText({ text, query }) {
  if (!query || !query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="sr-highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── Main search content (uses useSearchParams) ─── */
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState('relevan');
  const [viewMode, setViewMode] = useState('grid');
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  // Local search input for the header on this page
  const [localSearchQuery, setLocalSearchQuery] = useState(query);

  // Sync local search with URL param changes
  useEffect(() => {
    setLocalSearchQuery(query);
    setCurrentPage(1);
  }, [query]);

  // Fetch all products from Supabase
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

        setAllProducts(allRows);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Derive categories from products
  const categories = useMemo(() => {
    const cats = new Set();
    allProducts.forEach(p => {
      if (p.product_type) {
        const categoryStr = p.product_type.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        cats.add(categoryStr);
      }
    });
    return Array.from(cats).sort();
  }, [allProducts]);

  // Filter + sort
  const filteredProducts = useMemo(() => {
    const queryTokens = tokenize(query);
    let list = allProducts;

    // Score-based search filter
    if (query.trim()) {
      list = list
        .map(p => ({ ...p, _score: scoreProduct(p, queryTokens) }))
        .filter(p => p._score > 0);
    } else {
      list = list.map(p => ({ ...p, _score: 0 }));
    }

    // Category filter
    if (activeCategories.size > 0) {
      list = list.filter(p => {
        const rawType = p.product_type || '';
        const cat = rawType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        return activeCategories.has(cat);
      });
    }

    // Price filter
    const pMin = parseFloat(minPrice);
    const pMax = parseFloat(maxPrice);
    if (!isNaN(pMin)) list = list.filter(p => (p.harga || 0) >= pMin);
    if (!isNaN(pMax)) list = list.filter(p => (p.harga || 0) <= pMax);

    // Sort
    if (sortMode === 'relevan') list.sort((a, b) => b._score - a._score);
    else if (sortMode === 'termurah') list.sort((a, b) => (a.harga || 0) - (b.harga || 0));
    else if (sortMode === 'termahal') list.sort((a, b) => (b.harga || 0) - (a.harga || 0));

    return list;
  }, [allProducts, query, activeCategories, minPrice, maxPrice, sortMode]);

  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE) || 1;
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategories, minPrice, maxPrice, sortMode]);

  const toggleCategory = useCallback((cat) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }, []);

  const removeCategory = useCallback((cat) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      next.delete(cat);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveCategories(new Set());
    setMinPrice('');
    setMaxPrice('');
  }, []);

  const hasActiveFilters = activeCategories.size > 0 || minPrice || maxPrice;

  const sortTabs = [
    { key: 'relevan', label: 'Relevan' },
    { key: 'termurah', label: 'Termurah' },
    { key: 'termahal', label: 'Termahal' },
  ];

  return (
    <>
      <Header
        searchQuery={localSearchQuery}
        setSearchQuery={setLocalSearchQuery}
      />

      {/* Sidebar overlay and filter menu for mobile — portaled to document.body so they sit above ALL stacking contexts */}
      {isMounted && createPortal(
        <>
          {sidebarOpen && (
            <div className="sr-sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ zIndex: 9998 }} />
          )}
          <aside className={`sr-sidebar${sidebarOpen ? ' open' : ''}`} style={{ zIndex: 9999 }}>
            <div className="sr-sidebar-header">
              <h3>Filter</h3>
              <button className="sr-sidebar-close" onClick={() => setSidebarOpen(false)}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            <div className="sr-sidebar-section">
              <div className="sr-sidebar-title">Kategori</div>
              {categories.map(cat => (
                <label key={cat} className="sr-filter-option">
                  <input
                    type="checkbox"
                    checked={activeCategories.has(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>

            <div className="sr-sidebar-section">
              <div className="sr-sidebar-title">Harga</div>
              <div className="sr-price-inputs">
                <input
                  className="sr-price-input"
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="sr-price-sep">–</span>
                <input
                  className="sr-price-input"
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </aside>
        </>,
        document.body
      )}

      <main className="sr-page">
        <div className="container">


          {/* Result meta */}
          {query.trim() && !loading && (
            <div className="sr-result-meta">
              Menampilkan <span>{filteredProducts.length} produk</span> untuk &quot;<span>{query}</span>&quot;
            </div>
          )}

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="sr-active-filters">
              {Array.from(activeCategories).map(cat => (
                <span key={cat} className="sr-filter-tag">
                  {cat}
                  <button onClick={() => removeCategory(cat)}>×</button>
                </span>
              ))}
              {minPrice && (
                <span className="sr-filter-tag">
                  Min: Rp {Number(minPrice).toLocaleString('id-ID')}
                  <button onClick={() => setMinPrice('')}>×</button>
                </span>
              )}
              {maxPrice && (
                <span className="sr-filter-tag">
                  Max: Rp {Number(maxPrice).toLocaleString('id-ID')}
                  <button onClick={() => setMaxPrice('')}>×</button>
                </span>
              )}
              <button className="sr-clear-all" onClick={clearAllFilters}>Hapus Semua</button>
            </div>
          )}

          <div className="sr-layout">


            {/* Main content */}
            <div className="sr-main">
              {/* Toolbar */}
              <div className="sr-toolbar">
                <div className="sr-toolbar-left">
                  <button
                    className="sr-filter-toggle-btn"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <ion-icon name="options-outline"></ion-icon>
                    Filter
                  </button>
                  <div className="sr-sort-tabs">
                    {sortTabs.map(tab => (
                      <button
                        key={tab.key}
                        className={`sr-sort-tab${sortMode === tab.key ? ' active' : ''}`}
                        onClick={() => setSortMode(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sr-view-toggle">
                  <button
                    className={`sr-view-btn${viewMode === 'grid' ? ' active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <ion-icon name="grid-outline"></ion-icon>
                  </button>
                  <button
                    className={`sr-view-btn${viewMode === 'list' ? ' active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <ion-icon name="list-outline"></ion-icon>
                  </button>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="sr-loading">
                  <div className="sr-spinner"></div>
                  <p>Memuat produk...</p>
                </div>
              )}

              {/* No results */}
              {!loading && pagedProducts.length === 0 && (
                <div className="sr-no-result">
                  <ion-icon name="sad-outline" style={{ fontSize: 48, marginBottom: 12 }}></ion-icon>
                  <p>Produk tidak ditemukan</p>
                  <span>Coba kata kunci lain atau hapus filter</span>
                </div>
              )}

              {/* Product grid / list */}
              {!loading && pagedProducts.length > 0 && (
                <div className={`sr-product-grid${viewMode === 'list' ? ' list-view' : ''}`}>
                  {pagedProducts.map((product) => {
                    const rawType = product.product_type || 'Uncategorized';
                    const category = rawType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                    const isSoldOut = product.stok !== undefined && product.stok <= 0;

                    return (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className={`sr-product-card${viewMode === 'list' ? ' list-view' : ''}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="sr-product-img">
                          <img
                            src="/images/products/labkimiaproduk.png"
                            alt={product.nama_produk || 'Product'}
                            width={300}
                            height={300}
                          />
                          {isSoldOut && (
                            <span className="sr-badge sr-badge-soldout">Habis</span>
                          )}
                        </div>
                        <div className="sr-product-info">
                          <span className="sr-product-category">{category}</span>
                          <h3 className="sr-product-name">
                            <HighlightText text={product.nama_produk || 'Untitled'} query={query} />
                          </h3>
                          <div className="sr-product-price">
                            {formatPrice(product.harga)}
                          </div>
                          {product.stok !== undefined && product.stok > 0 && (
                            <div className="sr-product-stock">
                              Stok: {product.stok}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="sr-pagination">
                  <button
                    className="sr-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`sr-page-btn${currentPage === page ? ' active' : ''}`}
                      onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="sr-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ─── Page wrapper with Suspense ─── */
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Memuat...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
