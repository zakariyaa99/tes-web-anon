'use client';

import { useState } from 'react';

const productsByTab = {
  'New Products': [
    { 
      img1: '/images/products/labkimiaproduk.png', 
      img2: '/images/products/labkimiaproduk.png', 
      alt: 'Mens Winter Leathers Jackets', 
      badge: '15%', 
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

const TABS = Object.keys(productsByTab);

export default function ProductGrid() {
  const [activeTab, setActiveTab] = useState('New Products');
  const products = productsByTab[activeTab] || [];

  return (
    <div className="product-main">
      <div className="product-tabs-bar">
        <div className="product-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`product-tab-btn${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {products.map((p, i) => (
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
    </div>
  );
}
