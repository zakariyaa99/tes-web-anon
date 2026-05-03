'use client';

import { useState } from 'react';

const productsByTab = {
  'New Products': [
    { img1: '/images/products/jacket-3.jpg', img2: '/images/products/jacket-4.jpg', alt: 'Mens Winter Leathers Jackets', badge: '15%', badgeClass: '', category: 'jacket', title: 'Mens Winter Leathers Jackets', stars: [true, true, true, false, false], price: '$48.00', oldPrice: '$75.00' },
    { img1: '/images/products/shirt-1.jpg', img2: '/images/products/shirt-2.jpg', alt: 'Pure Garment Dyed Cotton Shirt', badge: 'sale', badgeClass: 'angle black', category: 'shirt', title: 'Pure Garment Dyed Cotton Shirt', stars: [true, true, true, false, false], price: '$45.00', oldPrice: '$56.00' },
    { img1: '/images/products/jacket-5.jpg', img2: '/images/products/jacket-6.jpg', alt: 'MEN Yarn Fleece Full-Zip Jacket', badge: null, badgeClass: '', category: 'Jacket', title: 'MEN Yarn Fleece Full-Zip Jacket', stars: [true, true, true, false, false], price: '$58.00', oldPrice: '$65.00' },
    { img1: '/images/products/clothes-3.jpg', img2: '/images/products/clothes-4.jpg', alt: 'Black Floral Wrap Midi Skirt', badge: 'new', badgeClass: 'angle pink', category: 'skirt', title: 'Black Floral Wrap Midi Skirt', stars: [true, true, true, true, true], price: '$25.00', oldPrice: '$35.00' },
    { img1: '/images/products/shoe-2.jpg', img2: '/images/products/shoe-2_1.jpg', alt: "Casual Men's Brown shoes", badge: null, badgeClass: '', category: 'casual', title: "Casual Men's Brown shoes", stars: [true, true, true, true, true], price: '$99.00', oldPrice: '$105.00' },
    { img1: '/images/products/watch-3.jpg', img2: '/images/products/watch-4.jpg', alt: 'Pocket Watch Leather Pouch', badge: 'sale', badgeClass: 'angle black', category: 'watches', title: 'Pocket Watch Leather Pouch', stars: [true, true, true, false, false], price: '$150.00', oldPrice: '$170.00' },
    { img1: '/images/products/watch-1.jpg', img2: '/images/products/watch-2.jpg', alt: 'Smart Watch Vital Plus', badge: null, badgeClass: '', category: 'watches', title: 'Smart Watch Vital Plus', stars: [true, true, true, true, false], price: '$100.00', oldPrice: '$120.00' },
    { img1: '/images/products/party-wear-1.jpg', img2: '/images/products/party-wear-2.jpg', alt: 'Womens Party Wear Shoes', badge: 'sale', badgeClass: 'angle black', category: 'party wear', title: 'Womens Party Wear Shoes', stars: [true, true, true, false, false], price: '$25.00', oldPrice: '$30.00' },
    { img1: '/images/products/jacket-1.jpg', img2: '/images/products/jacket-2.jpg', alt: 'Mens Winter Leathers Jackets', badge: null, badgeClass: '', category: 'jacket', title: 'Mens Winter Leathers Jackets', stars: [true, true, true, true, false], price: '$32.00', oldPrice: '$45.00' },
    { img1: '/images/products/sports-2.jpg', img2: '/images/products/sports-4.jpg', alt: 'Trekking & Running Shoes - black', badge: 'sale', badgeClass: 'angle black', category: 'sports', title: 'Trekking & Running Shoes - black', stars: [true, true, true, false, false], price: '$58.00', oldPrice: '$64.00' },
    { img1: '/images/products/shoe-1.jpg', img2: '/images/products/shoe-1_1.jpg', alt: "Men's Leather Formal Wear shoes", badge: null, badgeClass: '', category: 'formal', title: "Men's Leather Formal Wear shoes", stars: [true, true, true, true, false], price: '$50.00', oldPrice: '$65.00' },
    { img1: '/images/products/shorts-1.jpg', img2: '/images/products/shorts-2.jpg', alt: 'Better Basics French Terry Sweatshorts', badge: 'sale', badgeClass: 'angle black', category: 'shorts', title: 'Better Basics French Terry Sweatshorts', stars: [true, true, true, false, false], price: '$78.00', oldPrice: '$85.00' },
  ],
  'Best Sellers': [
    { img1: '/images/products/shoe-2.jpg', img2: '/images/products/shoe-2_1.jpg', alt: "Casual Men's Brown shoes", badge: null, badgeClass: '', category: 'casual', title: "Casual Men's Brown shoes", stars: [true, true, true, true, true], price: '$99.00', oldPrice: '$105.00' },
    { img1: '/images/products/watch-3.jpg', img2: '/images/products/watch-4.jpg', alt: 'Pocket Watch Leather Pouch', badge: 'sale', badgeClass: 'angle black', category: 'watches', title: 'Pocket Watch Leather Pouch', stars: [true, true, true, false, false], price: '$150.00', oldPrice: '$170.00' },
    { img1: '/images/products/shirt-1.jpg', img2: '/images/products/shirt-2.jpg', alt: 'Pure Garment Dyed Cotton Shirt', badge: null, badgeClass: '', category: 'shirt', title: 'Pure Garment Dyed Cotton Shirt', stars: [true, true, true, true, true], price: '$45.00', oldPrice: '$56.00' },
    { img1: '/images/products/jacket-1.jpg', img2: '/images/products/jacket-2.jpg', alt: 'Mens Winter Leathers Jackets', badge: null, badgeClass: '', category: 'jacket', title: 'Mens Winter Leathers Jackets', stars: [true, true, true, true, false], price: '$32.00', oldPrice: '$45.00' },
    { img1: '/images/products/clothes-3.jpg', img2: '/images/products/clothes-4.jpg', alt: 'Black Floral Wrap Midi Skirt', badge: 'new', badgeClass: 'angle pink', category: 'skirt', title: 'Black Floral Wrap Midi Skirt', stars: [true, true, true, true, true], price: '$25.00', oldPrice: '$35.00' },
    { img1: '/images/products/sports-2.jpg', img2: '/images/products/sports-4.jpg', alt: 'Trekking & Running Shoes', badge: null, badgeClass: '', category: 'sports', title: 'Trekking & Running Shoes', stars: [true, true, true, true, false], price: '$58.00', oldPrice: '$64.00' },
    { img1: '/images/products/watch-1.jpg', img2: '/images/products/watch-2.jpg', alt: 'Smart Watch Vital Plus', badge: null, badgeClass: '', category: 'watches', title: 'Smart Watch Vital Plus', stars: [true, true, true, true, false], price: '$100.00', oldPrice: '$120.00' },
    { img1: '/images/products/shoe-1.jpg', img2: '/images/products/shoe-1_1.jpg', alt: "Men's Leather Formal Wear shoes", badge: null, badgeClass: '', category: 'formal', title: "Men's Leather Formal Wear shoes", stars: [true, true, true, true, false], price: '$50.00', oldPrice: '$65.00' },
  ],
  'Featured': [
    { img1: '/images/products/jacket-5.jpg', img2: '/images/products/jacket-6.jpg', alt: 'MEN Yarn Fleece Full-Zip Jacket', badge: 'featured', badgeClass: 'angle pink', category: 'Jacket', title: 'MEN Yarn Fleece Full-Zip Jacket', stars: [true, true, true, true, true], price: '$58.00', oldPrice: '$65.00' },
    { img1: '/images/products/watch-1.jpg', img2: '/images/products/watch-2.jpg', alt: 'Smart Watch Vital Plus', badge: 'featured', badgeClass: 'angle pink', category: 'watches', title: 'Smart Watch Vital Plus', stars: [true, true, true, true, false], price: '$100.00', oldPrice: '$120.00' },
    { img1: '/images/products/shirt-1.jpg', img2: '/images/products/shirt-2.jpg', alt: 'Pure Garment Dyed Cotton Shirt', badge: 'featured', badgeClass: 'angle pink', category: 'shirt', title: 'Pure Garment Dyed Cotton Shirt', stars: [true, true, true, false, false], price: '$45.00', oldPrice: '$56.00' },
    { img1: '/images/products/shoe-2.jpg', img2: '/images/products/shoe-2_1.jpg', alt: "Casual Men's Brown shoes", badge: null, badgeClass: '', category: 'casual', title: "Casual Men's Brown shoes", stars: [true, true, true, true, true], price: '$99.00', oldPrice: '$105.00' },
    { img1: '/images/products/shorts-1.jpg', img2: '/images/products/shorts-2.jpg', alt: 'French Terry Sweatshorts', badge: 'featured', badgeClass: 'angle pink', category: 'shorts', title: 'French Terry Sweatshorts', stars: [true, true, true, false, false], price: '$78.00', oldPrice: '$85.00' },
    { img1: '/images/products/party-wear-1.jpg', img2: '/images/products/party-wear-2.jpg', alt: 'Womens Party Wear Shoes', badge: null, badgeClass: '', category: 'party wear', title: 'Womens Party Wear Shoes', stars: [true, true, true, false, false], price: '$25.00', oldPrice: '$30.00' },
  ],
  'On Sale': [
    { img1: '/images/products/jacket-3.jpg', img2: '/images/products/jacket-4.jpg', alt: 'Mens Winter Leathers Jackets', badge: '15%', badgeClass: '', category: 'jacket', title: 'Mens Winter Leathers Jackets', stars: [true, true, true, false, false], price: '$48.00', oldPrice: '$75.00' },
    { img1: '/images/products/shirt-1.jpg', img2: '/images/products/shirt-2.jpg', alt: 'Pure Garment Dyed Cotton Shirt', badge: 'sale', badgeClass: 'angle black', category: 'shirt', title: 'Pure Garment Dyed Cotton Shirt', stars: [true, true, true, false, false], price: '$45.00', oldPrice: '$56.00' },
    { img1: '/images/products/watch-3.jpg', img2: '/images/products/watch-4.jpg', alt: 'Pocket Watch Leather Pouch', badge: 'sale', badgeClass: 'angle black', category: 'watches', title: 'Pocket Watch Leather Pouch', stars: [true, true, true, false, false], price: '$150.00', oldPrice: '$170.00' },
    { img1: '/images/products/party-wear-1.jpg', img2: '/images/products/party-wear-2.jpg', alt: 'Womens Party Wear Shoes', badge: 'sale', badgeClass: 'angle black', category: 'party wear', title: 'Womens Party Wear Shoes', stars: [true, true, true, false, false], price: '$25.00', oldPrice: '$30.00' },
    { img1: '/images/products/sports-2.jpg', img2: '/images/products/sports-4.jpg', alt: 'Trekking & Running Shoes - black', badge: 'sale', badgeClass: 'angle black', category: 'sports', title: 'Trekking & Running Shoes - black', stars: [true, true, true, false, false], price: '$58.00', oldPrice: '$64.00' },
    { img1: '/images/products/shorts-1.jpg', img2: '/images/products/shorts-2.jpg', alt: 'Better Basics French Terry Sweatshorts', badge: 'sale', badgeClass: 'angle black', category: 'shorts', title: 'Better Basics French Terry Sweatshorts', stars: [true, true, true, false, false], price: '$78.00', oldPrice: '$85.00' },
  ],
};

const TABS = Object.keys(productsByTab);

export default function ProductGrid() {
  const [activeTab, setActiveTab] = useState('New Products');
  const products = productsByTab[activeTab];

  return (
    <div className="product-main">
      {/* Sticky Tab Bar */}
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

      {/* Product Grid */}
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
