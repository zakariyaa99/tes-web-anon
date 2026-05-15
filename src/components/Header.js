'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import SearchDropdown from './SearchDropdown';
import { getCart, cartCount, getRemoteCart } from '../lib/cartUtils';
import { getWishlist, wishlistCount, getRemoteWishlist } from '../lib/wishlistUtils';

const staticMobileMenus = [
  {
    label: 'Brands',
    items: ['Merck', 'Loba Chemie', 'Sigma-Aldrich', 'Spectrochem'],
  },
  {
    label: 'Accecories',
    items: ['pH Meters', 'Conductivity Meters', 'Spectrophotometers', 'Chromatography Accessories', 'General Laboratory Equipment'],
  },
  {
    label: 'Lab',
    items: ['Glassware', 'Chemicals', 'Consumables', 'Equipment'],
  },
];

function MobileAccordionItem({ label, items, isOpen, onToggle }) {
  return (
    <li className="menu-category">
      <button className={`accordion-menu${isOpen ? ' active' : ''}`} onClick={onToggle}>
        <p className="menu-title">{label}</p>
        <div>
          <ion-icon name="add-outline" className="add-icon"></ion-icon>
          <ion-icon name="remove-outline" className="remove-icon"></ion-icon>
        </div>
      </button>
      <ul className={`submenu-category-list${isOpen ? ' active' : ''}`}>
        {items.map((item) => (
          <li className="submenu-category" key={item}>
            {label === 'Categories' ? (
              <Link href={`/?tab=${encodeURIComponent(item)}#product-grid`} className="submenu-title" onClick={onToggle}>{item}</Link>
            ) : (
              <Link href={`/search?q=${item}`} className="submenu-title" onClick={onToggle}>{item}</Link>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function Header({ onMenuOpenForSidebar, searchQuery, setSearchQuery }) {
  const router = useRouter();
  const { user, signOut, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState(['Reagent', 'Standard', 'Consumable', 'Buffer', 'Solvent', 'Kit']);
  const [isMounted, setIsMounted] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const accountDropdownRef = useRef(null);

  // Derive display name and initials from the authenticated user
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const displayEmail = user?.email || '';
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load counts — prefer remote when logged in
  useEffect(() => {
    setIsMounted(true);

    async function loadCounts() {
      if (user) {
        try {
          const [remoteCart, remoteWl] = await Promise.all([
            getRemoteCart(user.id),
            getRemoteWishlist(user.id),
          ]);
          setCartItemCount(cartCount(remoteCart));
          setWishlistItemCount(wishlistCount(remoteWl));
        } catch {
          setCartItemCount(cartCount(getCart()));
          setWishlistItemCount(wishlistCount(getWishlist()));
        }
        try {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'pending');
          setPendingOrderCount(count || 0);
        } catch { /* ignore */ }
      } else {
        setCartItemCount(cartCount(getCart()));
        setWishlistItemCount(wishlistCount(getWishlist()));
      }
    }
    loadCounts();

    // Same-tab local events (for guest updates and post-merge clears)
    function onCartUpdated(e) { setCartItemCount(cartCount(e.detail.cart)); }
    function onWishlistUpdated(e) { setWishlistItemCount(wishlistCount(e.detail.wishlist)); }
    function onStorage(e) {
      if (e.key === 'anon_cart')     setCartItemCount(cartCount(getCart()));
      if (e.key === 'anon_wishlist') setWishlistItemCount(wishlistCount(getWishlist()));
    }

    window.addEventListener('cartUpdated', onCartUpdated);
    window.addEventListener('wishlistUpdated', onWishlistUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('cartUpdated', onCartUpdated);
      window.removeEventListener('wishlistUpdated', onWishlistUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [user]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = new Set();
        const PAGE_SIZE = 1000;
        let offset = 0;

        while (true) {
          const { data, error } = await supabase
            .from('products')
            .select('product_type')
            .range(offset, offset + PAGE_SIZE - 1);

          if (error) throw error;
          if (!data || data.length === 0) break;

          data.forEach(item => {
            let rawType = item.product_type || 'Uncategorized';
            let categoryStr = rawType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            cats.add(categoryStr);
          });

          if (data.length < PAGE_SIZE) break;
          offset += PAGE_SIZE;
        }

        setDynamicCategories(Array.from(cats).sort());
      } catch (err) {
        console.error("Failed to load categories for header:", err);
      }
    }
    fetchCategories();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('header-categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const mobileMenus = useMemo(() => {
    const fullCategories = ['All Products', ...dynamicCategories];
    return [
      { label: 'Categories', items: fullCategories },
      ...staticMobileMenus
    ];
  }, [dynamicCategories]);

  const openMobile = () => setMobileMenuOpen(true);
  const closeMobile = () => setMobileMenuOpen(false);

  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const openMobileAccount = () => setMobileAccountOpen(true);
  const closeMobileAccount = () => setMobileAccountOpen(false);

  const toggleAccordion = (i) => setOpenAccordion(openAccordion === i ? null : i);

  const scrollToGrid = useCallback(() => {
    const grid = document.getElementById('product-grid');
    if (grid) {
      const headerOffset = 60;
      const offsetPosition = grid.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  const navigateToSearch = useCallback((q) => {
    const query = (q || searchQuery || '').trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [router, searchQuery]);

  const handleSearchSubmit = useCallback(() => {
    setDropdownOpen(false);
    navigateToSearch();
  }, [navigateToSearch]);

  return (
    <>
      {/* Overlay and Mobile Menu — portaled to document.body so they sit above ALL stacking contexts */}
      {isMounted && createPortal(
        <>
          {mobileMenuOpen && (
            <div className="overlay active" onClick={closeMobile} style={{ zIndex: 9998 }}></div>
          )}
          {mobileAccountOpen && (
            <div className="overlay active" onClick={closeMobileAccount} style={{ zIndex: 9998 }}></div>
          )}
          <nav className={`mobile-navigation-menu has-scrollbar${mobileAccountOpen ? ' active' : ''}`} style={{ zIndex: 9999 }}>
            <div className="menu-top">
              <h2 className="menu-title">{user ? 'Akun Saya' : 'Masuk / Daftar'}</h2>
              <button className="menu-close-btn" onClick={closeMobileAccount}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            {user ? (
              <>
                {/* Profile header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cultured)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600', color: '#185FA5', flexShrink: 0 }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--eerie-black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--sonic-silver)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayEmail}</div>
                  </div>
                </div>

                {/* Order status strip */}
                <div style={{ background: '#f7f9fc', padding: '14px 20px', borderBottom: '1px solid var(--cultured)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--sonic-silver)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Pembelian Saya</div>
                  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    {[
                      { icon: 'time-outline',        label: 'Menunggu\nBayar',  count: pendingOrderCount, status: 'pending'    },
                      { icon: 'cube-outline',         label: 'Dikemas',           count: 0,                 status: 'processing' },
                      { icon: 'car-outline',          label: 'Dikirim',           count: 0,                 status: 'shipped'    },
                      { icon: 'checkmark-outline',    label: 'Selesai',           count: 0,                 status: 'delivered'  },
                    ].map(({ icon, label, count, status }) => (
                      <Link
                        key={status}
                        href={`/orders?filter=${status}`}
                        onClick={closeMobileAccount}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                      >
                        <div style={{ position: 'relative', width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--sonic-silver)', border: '1px solid var(--cultured)' }}>
                          <ion-icon name={icon}></ion-icon>
                          {count > 0 && (
                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '16px', height: '16px', background: '#E24B4A', borderRadius: '50%', fontSize: '10px', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
                          )}
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--sonic-silver)', textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.3 }}>{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Menu group 1 */}
                <div style={{ borderBottom: '1px solid var(--cultured)' }}>
                  {[
                    { href: '/account',  icon: 'person-outline',        label: 'Profil Saya'      },
                    { href: '/wishlist', icon: 'heart-outline',          label: 'Wishlist',        badge: wishlistItemCount },
                    { href: '/account',  icon: 'ticket-outline',         label: 'Voucher Saya'    },
                    { href: '/account',  icon: 'location-outline',       label: 'Alamat Tersimpan' },
                  ].map(({ href, icon, label, badge }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={closeMobileAccount}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 20px', borderBottom: '1px solid var(--cultured)', color: 'var(--eerie-black)', textDecoration: 'none', fontSize: '14px' }}
                    >
                      <ion-icon name={icon} style={{ fontSize: '19px', color: 'var(--sonic-silver)', width: '20px', flexShrink: 0 }}></ion-icon>
                      <span style={{ flex: 1 }}>{label}</span>
                      {badge > 0 && <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>{badge}</span>}
                      <ion-icon name="chevron-forward-outline" style={{ fontSize: '14px', color: 'var(--sonic-silver)' }}></ion-icon>
                    </Link>
                  ))}
                </div>

                {/* Menu group 2 */}
                <div>
                  <Link href="/account" onClick={closeMobileAccount} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 20px', borderBottom: '1px solid var(--cultured)', color: 'var(--eerie-black)', textDecoration: 'none', fontSize: '14px' }}>
                    <ion-icon name="settings-outline" style={{ fontSize: '19px', color: 'var(--sonic-silver)', width: '20px', flexShrink: 0 }}></ion-icon>
                    <span style={{ flex: 1 }}>Pengaturan Akun</span>
                    <ion-icon name="chevron-forward-outline" style={{ fontSize: '14px', color: 'var(--sonic-silver)' }}></ion-icon>
                  </Link>
                  <button
                    onClick={async () => { closeMobileAccount(); await signOut(); router.push('/'); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 20px', color: '#A32D2D', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}
                  >
                    <ion-icon name="log-out-outline" style={{ fontSize: '19px', width: '20px', flexShrink: 0 }}></ion-icon>
                    <span>Keluar</span>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '24px 20px' }}>
                <p style={{ fontSize: '14px', color: 'var(--sonic-silver)', marginBottom: '16px' }}>Masuk untuk menyimpan keranjang dan wishlist kamu.</p>
                <button
                  onClick={() => { closeMobileAccount(); openAuthModal(); }}
                  style={{ display: 'block', width: '100%', textAlign: 'center', padding: '12px', background: '#185FA5', color: '#fff', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Masuk / Daftar
                </button>
              </div>
            )}
          </nav>
          
          <nav className={`mobile-navigation-menu has-scrollbar${mobileMenuOpen ? ' active' : ''}`} style={{ zIndex: 9999 }}>
            <div className="menu-top">
              <h2 className="menu-title">Menu</h2>
              <button className="menu-close-btn" onClick={closeMobile}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            <ul className="mobile-menu-category-list">
              <li className="menu-category">
                <Link href="/" className="menu-title">Home</Link>
              </li>
              {mobileMenus.map((cat, i) => (
                <MobileAccordionItem
                  key={cat.label}
                  label={cat.label}
                  items={cat.items}
                  isOpen={openAccordion === i}
                  onToggle={() => toggleAccordion(i)}
                />
              ))}
            </ul>

            <div className="menu-bottom">
              <ul className="menu-category-list">
                <li className="menu-category">
                  <button className={`accordion-menu${langOpen ? ' active' : ''}`} onClick={() => setLangOpen(!langOpen)}>
                    <p className="menu-title">Language</p>
                    <ion-icon name="caret-back-outline" className="caret-back"></ion-icon>
                  </button>
                  <ul className={`submenu-category-list${langOpen ? ' active' : ''}`}>
                    {['English', 'Español', 'French'].map(l => (
                      <li className="submenu-category" key={l}><a href="#" className="submenu-title">{l}</a></li>
                    ))}
                  </ul>
                </li>
                <li className="menu-category">
                  <button className={`accordion-menu${currOpen ? ' active' : ''}`} onClick={() => setCurrOpen(!currOpen)}>
                    <p className="menu-title">Currency</p>
                    <ion-icon name="caret-back-outline" className="caret-back"></ion-icon>
                  </button>
                  <ul className={`submenu-category-list${currOpen ? ' active' : ''}`}>
                    {['USD $', 'EUR €'].map(c => (
                      <li className="submenu-category" key={c}><a href="#" className="submenu-title">{c}</a></li>
                    ))}
                  </ul>
                </li>
              </ul>

              <ul className="menu-social-container">
                {['logo-facebook', 'logo-twitter', 'logo-instagram', 'logo-linkedin'].map((icon) => (
                  <li key={icon}>
                    <a href="#" className="social-link">
                      <ion-icon name={icon}></ion-icon>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </>,
        document.body
      )}

      {/* HEADER TOP - outside sticky header */}
      <div className="header-top">
        <div className="container">
          <ul className="header-social-container">
            {['logo-facebook', 'logo-twitter', 'logo-instagram', 'logo-linkedin'].map((icon) => (
              <li key={icon}>
                <a href="#" className="social-link">
                  <ion-icon name={icon}></ion-icon>
                </a>
              </li>
            ))}
          </ul>
          <div className="header-alert-news">
            <p><b>Free Shipping</b> This Week Order Over - $55</p>
          </div>
          <div className="header-top-actions">
            <select name="currency">
              <option value="usd">USD $</option>
              <option value="eur">EUR €</option>
            </select>
            <select name="language">
              <option value="en-US">English</option>
              <option value="es-ES">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>

      <header>
        {/* HEADER MAIN */}
        <div className="header-main">
          <div className="container">
            <Link href="/" className={`header-logo${dropdownOpen ? ' hidden-on-mobile' : ''}`}>
              <img src="/images/logo/labkimia_header.png" alt="Labkimia's logo" width="110" height="40" />
            </Link>
            <div className="header-search-container" style={{ position: 'relative' }}>
              <input 
                type="search" 
                name="search" 
                className="search-field" 
                placeholder="Search your chemical products..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDropdownOpen(true);
                  scrollToGrid();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  } else if (e.key === 'Escape') {
                    setDropdownOpen(false);
                  }
                }}
                onFocus={() => {
                  setDropdownOpen(true);
                  scrollToGrid();
                }}
              />
              <button 
                className="search-btn"
                onClick={handleSearchSubmit}
              >
                <ion-icon name="search-outline"></ion-icon>
              </button>
              <SearchDropdown
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isOpen={dropdownOpen}
                onClose={() => setDropdownOpen(false)}
                onNavigateSearch={navigateToSearch}
              />
            </div>
            <div className="header-user-actions">
              <div className="dropdown-wrap" ref={accountDropdownRef}>
                {user ? (
                  <>
                    <button 
                      className="action-btn" 
                      onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                      style={{ background: '#E6F1FB', color: '#185FA5', fontSize: '15px', fontWeight: '600', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >
                      {initials}
                    </button>
                    <div className={`account-dropdown ${accountDropdownOpen ? 'active' : ''}`} style={{ width: '260px' }}>
                      <div className="dd-header">
                        <div className="dd-avatar">{initials}</div>
                        <div>
                          <div className="dd-name">{displayName}</div>
                          <div className="dd-email">{displayEmail}</div>
                        </div>
                      </div>

                      {/* Profil Saya */}
                      <Link href="/account" className="dd-item" onClick={() => setAccountDropdownOpen(false)}>
                        <ion-icon name="person-outline"></ion-icon>
                        <span className="dd-item-label">Profil Saya</span>
                      </Link>

                      {/* Pembelian Saya */}
                      <Link href="/orders" className="dd-item" onClick={() => setAccountDropdownOpen(false)}>
                        <ion-icon name="cube-outline"></ion-icon>
                        <span className="dd-item-label">Pembelian Saya</span>
                        {pendingOrderCount > 0 && (
                          <span className="dd-badge" style={{ background: '#FAECE7', color: '#993C1D' }}>{pendingOrderCount} pending</span>
                        )}
                      </Link>

                      {/* Wishlist */}
                      <Link href="/wishlist" className="dd-item" onClick={() => setAccountDropdownOpen(false)}>
                        <ion-icon name="heart-outline"></ion-icon>
                        <span className="dd-item-label">Wishlist</span>
                        {wishlistItemCount > 0 && <span className="dd-badge">{wishlistItemCount}</span>}
                      </Link>

                      {/* Voucher */}
                      <Link href="/account" className="dd-item" onClick={() => setAccountDropdownOpen(false)}>
                        <ion-icon name="ticket-outline"></ion-icon>
                        <span className="dd-item-label">Voucher Saya</span>
                      </Link>

                      {/* Notifikasi */}
                      <a href="#" className="dd-item" onClick={e => { e.preventDefault(); setAccountDropdownOpen(false); }}>
                        <ion-icon name="notifications-outline"></ion-icon>
                        <span className="dd-item-label">Notifikasi</span>
                      </a>

                      <div className="dd-sep"></div>

                      {/* Alamat */}
                      <Link href="/account" className="dd-item" onClick={() => setAccountDropdownOpen(false)}>
                        <ion-icon name="location-outline"></ion-icon>
                        <span className="dd-item-label">Alamat Tersimpan</span>
                      </Link>

                      {/* Pengaturan */}
                      <Link href="/account" className="dd-item" onClick={() => setAccountDropdownOpen(false)}>
                        <ion-icon name="settings-outline"></ion-icon>
                        <span className="dd-item-label">Pengaturan Akun</span>
                      </Link>

                      <div className="dd-sep"></div>

                      <button
                        className="dd-item dd-logout"
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={async () => { setAccountDropdownOpen(false); await signOut(); router.push('/'); }}
                      >
                        <ion-icon name="log-out-outline"></ion-icon>
                        <span className="dd-item-label">Keluar</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button className="action-btn" onClick={openAuthModal}>
                    <ion-icon name="person-outline"></ion-icon>
                  </button>
                )}
              </div>
              <button className="action-btn">
                <ion-icon name="notifications-outline"></ion-icon>
                <span className="count">0</span>
              </button>
              <Link href="/cart" className="action-btn">
                <ion-icon name="bag-handle-outline"></ion-icon>
                {cartItemCount > 0 && (
                  <span className="count">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <div className="mobile-bottom-navigation">
          <button className="action-btn" onClick={openMobileAccount}>
            <ion-icon name="menu-outline"></ion-icon>
          </button>
          <Link href="/cart" className="action-btn">
            <ion-icon name="bag-handle-outline"></ion-icon>
            {cartItemCount > 0 && (
              <span className="count">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
            )}
          </Link>
          <Link href="/" className="action-btn">
            <ion-icon name="home-outline"></ion-icon>
          </Link>
          <button className="action-btn">
            <ion-icon name="notifications-outline"></ion-icon>
            <span className="count">0</span>
          </button>
          <button className="action-btn" onClick={openMobile}>
            <ion-icon name="grid-outline"></ion-icon>
          </button>
        </div>



      </header>

      {/* DESKTOP NAV - outside sticky header, scrolls away naturally */}
      <nav className="desktop-navigation-menu">
        <div className="container">
          <ul className="desktop-menu-category-list">
            {/*this is menu home*/}
            <li className="menu-category">
              <Link href="/" className="menu-title">Home</Link>
            </li>
            {/*this is menu categories*/}
            <li className="menu-category">
              <a href="#" className="menu-title">Categories</a>
              <ul className="dropdown-list">
                <li className="dropdown-item" key="All Products">
                  <Link href="/?tab=All%20Products#product-grid">All Products</Link>
                </li>
                {dynamicCategories.map(i => (
                  <li className="dropdown-item" key={i}>
                    <Link href={`/?tab=${encodeURIComponent(i)}#product-grid`}>{i}</Link>
                  </li>
                ))}
              </ul>
            </li>
            {/*this is menu Brands*/}
            <li className="menu-category">
              <a href="#" className="menu-title">Brands</a>
              <ul className="dropdown-list">
                {['Merck', 'Loba Chemie', 'Sigma-Aldrich', 'Spectrochem'].map(i => (
                  <li className="dropdown-item" key={i}><a href="#">{i}</a></li>
                ))}
              </ul>
            </li>
            {/*this is menu Accecories*/}
            <li className="menu-category">
              <a href="#" className="menu-title">Accecories</a>
              <ul className="dropdown-list">
                {['pH Meters', 'Conductivity Meters', 'Spectrophotometers', 'Chromatography Accessories', 'General Laboratory Equipment'].map(i => (
                  <li className="dropdown-item" key={i}><a href="#">{i}</a></li>
                ))}
              </ul>
            </li>{/*this is menu Lab*/}
            <li className="menu-category">
              <a href="#" className="menu-title">Lab</a>
              <ul className="dropdown-list">
                {['Glassware', 'Chemicals', 'Consumables', 'Equipment'].map(i => (
                  <li className="dropdown-item" key={i}><a href="#">{i}</a></li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </nav>

    </>
  );
}
