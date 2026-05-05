const deals = [
  {
    img: '/images/products/labkimiaproduk.png',
    alt: 'shampoo, conditioner & facewash packs',
    title: 'shampoo, conditioner & facewash packs',
    stars: [true, true, true, false, false],
    price: '$150.00',
    oldPrice: '$200.00',
    sold: 20,
    available: 40,
  },
  {
    img: '/images/products/labkimiaproduk.png',
    alt: 'Rose Gold diamonds Earring',
    title: 'Rose Gold diamonds Earring',
    stars: [true, true, true, false, false],
    price: '$1990.00',
    oldPrice: '$2000.00',
    sold: 15,
    available: 40,
  },
];

export default function ProductFeatured() {
  return (
    <div className="product-featured">
      <h2 className="title">Deal of the day</h2>
      <div className="showcase-wrapper has-scrollbar">
        {deals.map((deal) => (
          <div className="showcase-container" key={deal.title}>
            <div className="showcase">
              <div className="showcase-banner">
                <img src={deal.img} alt={deal.alt} className="showcase-img" />
              </div>
              <div className="showcase-content">
                <div className="showcase-rating">
                  {deal.stars.map((filled, i) => (
                    <ion-icon key={i} name={filled ? 'star' : 'star-outline'}></ion-icon>
                  ))}
                </div>
                <a href="#">
                  <h3 className="showcase-title">{deal.title}</h3>
                </a>
                <p className="showcase-desc">
                  Lorem ipsum dolor sit amet consectetur Lorem ipsum dolor dolor sit amet consectetur Lorem ipsum dolor
                </p>
                <div className="price-box">
                  <p className="price">{deal.price}</p>
                  <del>{deal.oldPrice}</del>
                </div>
                <button className="add-cart-btn">add to cart</button>
                <div className="showcase-status">
                  <div className="wrapper">
                    <p>already sold: <b>{deal.sold}</b></p>
                    <p>available: <b>{deal.available}</b></p>
                  </div>
                  <div className="showcase-status-bar"></div>
                </div>
                <div className="countdown-box">
                  <p className="countdown-desc">Hurry Up! Offer ends in:</p>
                  <div className="countdown">
                    {[['360','Days'],['24','Hours'],['59','Min'],['00','Sec']].map(([num, label]) => (
                      <div className="countdown-content" key={label}>
                        <p className="display-number">{num}</p>
                        <p className="display-text">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
