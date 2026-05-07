'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const fallbackProductsByTab = {
  'All Products': [
    {
      img1: '/images/products/labkimiaproduk.png',
      img2: '/images/products/labkimiaproduk.png',
      alt: 'Mens Winter Leathers Jackets',
      badge: 'Ready Stock',
      badgeClass: '',
      category: 'jacket',
      title: 'Mens Winter Leathers Jackets',
      stars: [true, true, true, false, false],
      price: '$48.00',
      oldPrice: '$75.00'
    },
    {
      img1: '/images/products/labkimiaproduk.png',
      img2: '/images/products/labkimiaproduk.png',
      alt: 'Pure Garment Dyed Cotton Shirt',
      badge: 'sale',
      badgeClass: 'angle black',
      category: 'shirt',
      title: 'Pure Garment Dyed Cotton Shirt',
      stars: [true, true, true, false, false],
      price: '$45.00',
      oldPrice: '$56.00'
    },
    {
      img1: '/images/products/labkimiaproduk.png',
      img2: '/images/products/labkimiaproduk.png',
      alt: 'MEN Yarn Fleece Full-Zip Jacket',
      badge: null,
      badgeClass: '',
      category: 'Jacket',
      title: 'MEN Yarn Fleece Full-Zip Jacket',
      stars: [true, true, true, false, false],
      price: '$58.00',
      oldPrice: '$65.00'
    },
    {
      img1: '/images/products/labkimiaproduk.png',
      img2: '/images/products/labkimiaproduk.png',
      alt: 'Black Floral Wrap Midi Skirt',
      badge: 'new',
      badgeClass: 'angle pink',
      category: 'skirt',
      title: 'Black Floral Wrap Midi Skirt',
      stars: [true, true, true, true, true],
      price: '$25.00',
      oldPrice: '$35.00'
    },
    {
      img1: '/images/products/labkimiaproduk.png',
      img2: '/images/products/labkimiaproduk.png',
      alt: "Casual Men's Brown shoes",
      badge: null,
      badgeClass: '',
      category: 'casual',
      title: "Casual Men's Brown shoes",
      stars: [true, true, true, true, true],
      price: '$99.00',
      oldPrice: '$105.00'
    },
    {
      img1: '/images/products/labkimiaproduk.png',
      img2: '/images/products/labkimiaproduk.png',
      alt: 'Pocket Watch Leather Pouch',
      badge: 'sale',
      badgeClass: 'angle black',
      category: 'watches',
      title: 'Pocket Watch Leather Pouch',
      stars: [true, true, true, false, false],
      price: '$150.00',
      oldPrice: '$170.00'
    }
  ],
  'Best Sellers': [],
  'Featured': [],
  'On Sale': []
};

const TABS = Object.keys(fallbackProductsByTab);

export default function ProductGrid() {
  const [activeTab, setActiveTab] = useState('All Products');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsData, setProductsData] = useState(fallbackProductsByTab);
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

          return {
            img1: '/images/products/labkimiaproduk.png',
            img2: '/images/products/labkimiaproduk.png',
            alt: item.nama_produk || 'Product Image',
            badge: item.stok > 0 ? null : 'sold out',
            badgeClass: item.stok > 0 ? '' : 'angle black',
            category: item.product_type || 'Uncategorized',
            title: item.nama_produk || 'Untitled Product',
            stars: starsArray,
            price: priceStr,
            oldPrice: null,
          };
        });

        setProductsData(prev => ({
          ...prev,
          'All Products': formattedProducts
        }));
      } catch (err) {
        console.error("Failed to load products from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const products = productsData[activeTab] || [];
  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentProducts = products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="product-main">
      <div className="product-tabs-bar">
        <div className="product-tabs">
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
