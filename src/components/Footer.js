export default function Footer() {
  return (
    <footer>
      <div className="footer-category">
        <div className="container">
          <h2 className="footer-category-title">Brand directory</h2>

          <div className="footer-category-box">
            <h3 className="category-box-title">Fashion :</h3>
            {['T-shirt','Shirts','shorts & jeans','jacket','dress & frock','innerwear','hosiery'].map(l => (
              <a href="#" className="footer-category-link" key={l}>{l}</a>
            ))}
          </div>

          <div className="footer-category-box">
            <h3 className="category-box-title">footwear :</h3>
            {['sport','formal','Boots','casual','cowboy shoes','safety shoes','Party wear shoes','Branded','Firstcopy','Long shoes'].map(l => (
              <a href="#" className="footer-category-link" key={l}>{l}</a>
            ))}
          </div>

          <div className="footer-category-box">
            <h3 className="category-box-title">jewellery :</h3>
            {['Necklace','Earrings','Couple rings','Pendants','Crystal','Bangles','bracelets','nosepin','chain'].map(l => (
              <a href="#" className="footer-category-link" key={l}>{l}</a>
            ))}
          </div>

          <div className="footer-category-box">
            <h3 className="category-box-title">cosmetics :</h3>
            {['Shampoo','Bodywash','Facewash','makeup kit','liner','lipstick','prefume','Body soap','scrub','hair gel','hair colors','hair dye','sunscreen','skin loson'].map(l => (
              <a href="#" className="footer-category-link" key={l}>{l}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-nav">
        <div className="container">

          <ul className="footer-nav-list">
            <li className="footer-nav-item"><h2 className="nav-title">Popular Categories</h2></li>
            {['Fashion','Electronic','Cosmetic','Health','Watches'].map(l => (
              <li className="footer-nav-item" key={l}><a href="#" className="footer-nav-link">{l}</a></li>
            ))}
          </ul>

          <ul className="footer-nav-list">
            <li className="footer-nav-item"><h2 className="nav-title">Products</h2></li>
            {['Prices drop','All products','Best sales','Contact us','Sitemap'].map(l => (
              <li className="footer-nav-item" key={l}><a href="#" className="footer-nav-link">{l}</a></li>
            ))}
          </ul>

          <ul className="footer-nav-list">
            <li className="footer-nav-item"><h2 className="nav-title">Our Company</h2></li>
            {['Delivery','Legal Notice','Terms and conditions','About us','Secure payment'].map(l => (
              <li className="footer-nav-item" key={l}><a href="#" className="footer-nav-link">{l}</a></li>
            ))}
          </ul>

          <ul className="footer-nav-list">
            <li className="footer-nav-item"><h2 className="nav-title">Services</h2></li>
            {['Prices drop','All products','Best sales','Contact us','Sitemap'].map(l => (
              <li className="footer-nav-item" key={l}><a href="#" className="footer-nav-link">{l}</a></li>
            ))}
          </ul>

          <ul className="footer-nav-list">
            <li className="footer-nav-item"><h2 className="nav-title">Contact</h2></li>
            <li className="footer-nav-item flex">
              <div className="icon-box"><ion-icon name="location-outline"></ion-icon></div>
              <address className="content">419 State 414 Rte Beaver Dams, New York(NY), 14812, USA</address>
            </li>
            <li className="footer-nav-item flex">
              <div className="icon-box"><ion-icon name="call-outline"></ion-icon></div>
              <a href="tel:+607936-8058" className="footer-nav-link">(607) 936-8058</a>
            </li>
            <li className="footer-nav-item flex">
              <div className="icon-box"><ion-icon name="mail-outline"></ion-icon></div>
              <a href="mailto:example@gmail.com" className="footer-nav-link">example@gmail.com</a>
            </li>
          </ul>

          <ul className="footer-nav-list">
            <li className="footer-nav-item"><h2 className="nav-title">Follow Us</h2></li>
            <li>
              <ul className="social-link">
                {[['logo-facebook','Facebook'],['logo-twitter','Twitter'],['logo-linkedin','LinkedIn'],['logo-instagram','Instagram']].map(([icon, label]) => (
                  <li className="footer-nav-item" key={icon}>
                    <a href="#" className="footer-nav-link">
                      <ion-icon name={icon}></ion-icon>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <img src="/images/payment.png" alt="payment method" className="payment-img" />
          <p className="copyright">
            Copyright &copy; <a href="#">Anon</a> all rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
