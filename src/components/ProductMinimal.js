const newArrivals = [
  [
    { img: '/images/products/labkimiaproduk.png', alt: 'relaxed short full sleeve t-shirt', title: 'Relaxed Short full Sleeve T-Shirt', category: 'Clothes', price: '$45.00', oldPrice: '$12.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'girls pink embro design top', title: 'Girls pnk Embro design Top', category: 'Clothes', price: '$61.00', oldPrice: '$9.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'black floral wrap midi skirt', title: 'Black Floral Wrap Midi Skirt', category: 'Clothes', price: '$76.00', oldPrice: '$25.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'pure garment dyed cotton shirt', title: 'Pure Garment Dyed Cotton Shirt', category: 'Mens Fashion', price: '$68.00', oldPrice: '$31.00' },
  ],
  [
    { img: '/images/products/labkimiaproduk.png', alt: 'men yarn fleece full-zip jacket', title: 'MEN Yarn Fleece Full-Zip Jacket', category: 'Winter wear', price: '$61.00', oldPrice: '$11.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'mens winter leathers jackets', title: 'Mens Winter Leathers Jackets', category: 'Winter wear', price: '$32.00', oldPrice: '$20.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'mens winter leathers jackets', title: 'Mens Winter Leathers Jackets', category: 'Jackets', price: '$50.00', oldPrice: '$25.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'better basics french terry sweatshorts', title: 'Better Basics French Terry Sweatshorts', category: 'Shorts', price: '$20.00', oldPrice: '$10.00' },
  ],
];

const trending = [
  [
    { img: '/images/products/labkimiaproduk.png', alt: 'running & trekking shoes - white', title: 'Running & Trekking Shoes - White', category: 'Sports', price: '$49.00', oldPrice: '$15.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'trekking & running shoes - black', title: 'Trekking & Running Shoes - black', category: 'Sports', price: '$78.00', oldPrice: '$36.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'womens party wear shoes', title: 'Womens Party Wear Shoes', category: 'Party wear', price: '$94.00', oldPrice: '$42.00' },
    { img: '/images/products/labkimiaproduk.png', alt: "sports claw women's shoes", title: "Sports Claw Women's Shoes", category: 'Sports', price: '$54.00', oldPrice: '$65.00' },
  ],
  [
    { img: '/images/products/labkimiaproduk.png', alt: 'air tekking shoes - white', title: 'Air Trekking Shoes - white', category: 'Sports', price: '$52.00', oldPrice: '$55.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'Boot With Suede Detail', title: 'Boot With Suede Detail', category: 'boots', price: '$20.00', oldPrice: '$30.00' },
    { img: '/images/products/labkimiaproduk.png', alt: "men's leather formal wear shoes", title: "Men's Leather Formal Wear shoes", category: 'formal', price: '$56.00', oldPrice: '$78.00' },
    { img: '/images/products/labkimiaproduk.png', alt: "casual men's brown shoes", title: "Casual Men's Brown shoes", category: 'Casual', price: '$50.00', oldPrice: '$55.00' },
  ],
];

const topRated = [
  [
    { img: '/images/products/labkimiaproduk.png', alt: 'pocket watch leather pouch', title: 'Pocket Watch Leather Pouch', category: 'Watches', price: '$50.00', oldPrice: '$34.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'silver deer heart necklace', title: 'Silver Deer Heart Necklace', category: 'Jewellery', price: '$84.00', oldPrice: '$30.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'titan 100 ml womens perfume', title: 'Titan 100 Ml Womens Perfume', category: 'Perfume', price: '$42.00', oldPrice: '$10.00' },
    { img: '/images/products/labkimiaproduk.png', alt: "men's leather reversible belt", title: "Men's Leather Reversible Belt", category: 'Belt', price: '$24.00', oldPrice: '$10.00' },
  ],
  [
    { img: '/images/products/labkimiaproduk.png', alt: 'platinum zircon classic ring', title: 'platinum Zircon Classic Ring', category: 'jewellery', price: '$62.00', oldPrice: '$65.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'smart watche vital plus', title: 'Smart watche Vital Plus', category: 'Watches', price: '$56.00', oldPrice: '$78.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'shampoo conditioner packs', title: 'shampoo conditioner packs', category: 'cosmetics', price: '$20.00', oldPrice: '$30.00' },
    { img: '/images/products/labkimiaproduk.png', alt: 'rose gold peacock earrings', title: 'Rose Gold Peacock Earrings', category: 'jewellery', price: '$20.00', oldPrice: '$30.00' },
  ],
];

function ShowcaseSection({ title, groups }) {
  return (
    <div className="product-showcase">
      <h2 className="title">{title}</h2>
      <div className="showcase-wrapper has-scrollbar">
        {groups.map((group, gi) => (
          <div className="showcase-container" key={gi}>
            {group.map((item, ii) => (
              <div className="showcase" key={ii}>
                <a href="#" className="showcase-img-box">
                  <img src={item.img} alt={item.alt} width="70" className="showcase-img" />
                </a>
                <div className="showcase-content">
                  <a href="#"><h4 className="showcase-title">{item.title}</h4></a>
                  <a href="#" className="showcase-category">{item.category}</a>
                  <div className="price-box">
                    <p className="price">{item.price}</p>
                    <del>{item.oldPrice}</del>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductMinimal() {
  return (
    <div className="product-minimal">
      <ShowcaseSection title="New Arrivals" groups={newArrivals} />
      <ShowcaseSection title="Trending" groups={trending} />
      <ShowcaseSection title="Top Rated" groups={topRated} />
    </div>
  );
}
