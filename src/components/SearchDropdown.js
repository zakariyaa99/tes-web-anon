'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const RECENT_SEARCHES_KEY = 'anon_recent_searches';
const MAX_RECENT = 5;
const MAX_SUGGESTIONS = 8;

function getRecentSearches() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch { return []; }
}

function saveRecentSearch(query) {
  if (!query.trim()) return;
  const recent = getRecentSearches().filter(s => s !== query.trim());
  recent.unshift(query.trim());
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

function HighlightText({ text, query }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ background: 'var(--salmon-pink)', color: '#fff', borderRadius: 2, padding: '0 2px' }}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchDropdown({ searchQuery, setSearchQuery, isOpen, onClose }) {
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Load recent searches when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const trimmed = searchQuery.trim();
        // Build an OR filter across nama_produk and product_type
        const orFilters = [
          `nama_produk.ilike.%${trimmed}%`,
          `product_type.ilike.%${trimmed}%`,
        ];

        // Also match individual words for multi-word queries
        const words = trimmed.split(/\s+/).filter(w => w.length >= 2);
        words.forEach(word => {
          orFilters.push(`nama_produk.ilike.%${word}%`);
          orFilters.push(`product_type.ilike.%${word}%`);
        });

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(orFilters.join(','))
          .limit(MAX_SUGGESTIONS);

        if (!error && data) {
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // Check if click was on the search input/button (parent handles that)
        const searchContainer = e.target.closest('.header-search-container');
        if (!searchContainer) {
          onClose();
        }
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSelectProduct = useCallback((productName) => {
    setSearchQuery(productName);
    saveRecentSearch(productName);
    onClose();
    // Scroll to grid
    setTimeout(() => {
      const grid = document.getElementById('product-grid');
      if (grid) {
        const headerOffset = 60;
        const offsetPosition = grid.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }, 100);
  }, [setSearchQuery, onClose]);

  const handleSearchAll = useCallback(() => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }
    onClose();
    const grid = document.getElementById('product-grid');
    if (grid) {
      const headerOffset = 60;
      const offsetPosition = grid.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, [searchQuery, onClose]);

  const handleRecentClick = useCallback((term) => {
    setSearchQuery(term);
    onClose();
    setTimeout(() => {
      const grid = document.getElementById('product-grid');
      if (grid) {
        const headerOffset = 60;
        const offsetPosition = grid.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }, 100);
  }, [setSearchQuery, onClose]);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  if (!isOpen) return null;

  const showRecent = !searchQuery.trim() && recentSearches.length > 0;
  const showSuggestions = searchQuery.trim() && suggestions.length > 0;
  const showNoResults = searchQuery.trim() && !loading && suggestions.length === 0;

  const formatPrice = (price) => price ? `Rp ${Number(price).toLocaleString('id-ID')}` : '';

  return (
    <div ref={dropdownRef} className="search-dropdown" style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: '#fff',
      borderRadius: '0 0 12px 12px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      zIndex: 999,
      maxHeight: 420,
      overflowY: 'auto',
      border: '1px solid var(--cultured)',
      borderTop: 'none',
    }}>
      {/* Recent Searches */}
      {showRecent && (
        <div style={{ padding: '12px 16px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sonic-silver)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recent Searches
            </span>
            <button
              onClick={handleClearRecent}
              style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--salmon-pink)', cursor: 'pointer', padding: 0 }}
            >
              Clear All
            </button>
          </div>
          {recentSearches.map((term, i) => (
            <button
              key={i}
              onClick={() => handleRecentClick(term)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 14,
                color: 'var(--eerie-black)',
                borderRadius: 6,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cultured)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <ion-icon name="time-outline" style={{ fontSize: 16, color: 'var(--sonic-silver)', flexShrink: 0 }}></ion-icon>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{term}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {searchQuery.trim() && loading && (
        <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--sonic-silver)', fontSize: 14 }}>
          Searching...
        </div>
      )}

      {/* Product Suggestions */}
      {showSuggestions && (
        <div style={{ padding: '8px 0' }}>
          <div style={{ padding: '4px 16px 8px', fontSize: 12, fontWeight: 600, color: 'var(--sonic-silver)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Products
          </div>
          {suggestions.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelectProduct(product.nama_produk)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cultured)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              {/* Product thumbnail */}
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--cultured)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src="/images/products/labkimiaproduk.png"
                  alt={product.nama_produk}
                  width={44}
                  height={44}
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Product info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--eerie-black)',
                  lineHeight: '1.4',
                }}>
                  <HighlightText text={product.nama_produk || ''} query={searchQuery} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--sonic-silver)', marginTop: 2 }}>
                  {product.product_type || 'Uncategorized'}
                </div>
              </div>


            </button>
          ))}

          {/* See all results */}
          <button
            onClick={handleSearchAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderTop: '1px solid var(--cultured)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--salmon-pink)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cultured)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            See all results for &quot;{searchQuery}&quot;
            <ion-icon name="arrow-forward-outline" style={{ fontSize: 16 }}></ion-icon>
          </button>
        </div>
      )}

      {/* No Results */}
      {showNoResults && (
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--sonic-silver)', marginBottom: 4 }}>
            No products found for
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--eerie-black)' }}>
            &quot;{searchQuery}&quot;
          </div>
        </div>
      )}
    </div>
  );
}
