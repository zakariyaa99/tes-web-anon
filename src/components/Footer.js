import React from 'react';
import Link from 'next/link';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="brand-col">
            <img src="/images/logo/labkimia_header.png" alt="labkimiaJKT" className="brand-logo" />
            <p className="brand-tagline">analytical chemistry and laboratory supply</p>
            <p className="brand-desc">Menyediakan kebutuhan kimia analitik dan perlengkapan laboratorium Anda.</p>
            <div className="socials">
              <a className="social-btn" href="#" aria-label="WhatsApp">
                <ion-icon name="logo-whatsapp" aria-hidden="true"></ion-icon>
              </a>
              <a className="social-btn" href="#" aria-label="Instagram">
                <ion-icon name="logo-instagram" aria-hidden="true"></ion-icon>
              </a>
              <a className="social-btn" href="#" aria-label="LinkedIn">
                <ion-icon name="logo-linkedin" aria-hidden="true"></ion-icon>
              </a>
              <a className="social-btn" href="#" aria-label="Email">
                <ion-icon name="mail-outline" aria-hidden="true"></ion-icon>
              </a>
            </div>
          </div>

          <div>
            <p className="footer-col-title">Katalog</p>
            <ul className="footer-links">
              <li>
                <Link href="/?tab=Reagent#product-grid">
                  <ion-icon name="flask-outline" aria-hidden="true"></ion-icon>
                  Reagent
                </Link>
              </li>
              <li>
                <Link href="/?tab=Solvent#product-grid">
                  <ion-icon name="water-outline" aria-hidden="true"></ion-icon>
                  Solvent
                </Link>
              </li>
              <li>
                <Link href="/?tab=Standard#product-grid">
                  <ion-icon name="ribbon-outline" aria-hidden="true"></ion-icon>
                  Standard Solution
                </Link>
              </li>
              <li>
                <Link href="/?tab=Buffer#product-grid">
                  <ion-icon name="pulse-outline" aria-hidden="true"></ion-icon>
                  Buffer Solution
                </Link>
              </li>
              <li>
                <Link href="/?tab=Consumable#product-grid">
                  <ion-icon name="construct-outline" aria-hidden="true"></ion-icon>
                  Consumable
                </Link>
              </li>
              <li>
                <Link href="/?tab=Semua%20Produk#product-grid">
                  <ion-icon name="cube-outline" aria-hidden="true"></ion-icon>
                  Semua Produk
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer-col-title">Perusahaan</p>
            <ul className="footer-links">
              <li>
                <a href="#">
                  <ion-icon name="information-circle-outline" aria-hidden="true"></ion-icon>
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#">
                  <ion-icon name="business-outline" aria-hidden="true"></ion-icon>
                  Brand Partner
                </a>
              </li>
              <li>
                <a href="#">
                  <ion-icon name="document-text-outline" aria-hidden="true"></ion-icon>
                  Cara Pemesanan
                </a>
              </li>
              <li>
                <a href="#">
                  <ion-icon name="car-outline" aria-hidden="true"></ion-icon>
                  Pengiriman
                </a>
              </li>
              <li>
                <a href="#">
                  <ion-icon name="headset-outline" aria-hidden="true"></ion-icon>
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer-col-title">Hubungi Kami</p>
            <ul className="footer-links">
              <li>
                <a href="tel:+6285176931330">
                  <ion-icon name="call-outline" aria-hidden="true"></ion-icon>
                  +62851 7693 1330
                </a>
              </li>
              <li>
                <a href="mailto:labkimiajkt@gmail.com">
                  <ion-icon name="mail-outline" aria-hidden="true"></ion-icon>
                  labkimiajkt@gmail.com
                </a>
              </li>
            </ul>
            <div className="cert-badge">
              <ion-icon name="shield-checkmark-outline" aria-hidden="true"></ion-icon>
              Produk Terverifikasi
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2026 <span>labkimiaJKT</span>. Hak cipta dilindungi.</p>
          <div className="legal-links">
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Syarat & Ketentuan</a>
            <a href="#">Disclaimer</a>
          </div>
        </div>
      </div>
      <div className="bottom-accent"></div>
    </footer>
  );
}
