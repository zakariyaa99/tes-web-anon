'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../legal.css';

const FAQ_ITEMS = [
  {
    question: 'Apakah semua produk bahan kimia di labkimiaJKT aman dan terstandarisasi?',
    answer: 'Ya, seluruh bahan kimia yang kami sediakan bersumber dari produsen terpercaya dan memiliki standar laboratorium yang jelas. Kami menyediakan dokumen resmi pendukung seperti COA (Certificate of Analysis) dan MSDS (Material Safety Data Sheet) untuk menjamin keamanan dan spesifikasi teknis produk.'
  },
  {
    question: 'Bagaimana cara mendapatkan dokumen COA dan MSDS?',
    answer: 'Dokumen COA dan MSDS akan dikirimkan secara softcopy via email yang terdaftar pada pesanan Anda. Anda juga dapat memintanya langsung melalui Layanan Pelanggan kami di WhatsApp (+62851 7693 1330) dengan melampirkan nomor invoice pembelian.'
  },
  {
    question: 'Bagaimana standar keamanan pengemasan untuk pengiriman bahan kimia cair?',
    answer: 'Keamanan adalah prioritas utama kami. Untuk bahan kimia berbentuk cairan, kami menggunakan botol laboratorium standar industri yang tertutup rapat (double seal), dibungkus bubble wrap tebal, dan dimasukkan ke dalam kardus pelindung khusus. Untuk pengiriman luar kota atau produk yang bersifat korosif/mudah terbakar, kami menyarankan opsi tambahan packing kayu.'
  },
  {
    question: 'Apakah labkimiaJKT melayani pembelian retail (eceran) atau hanya B2B/instansi?',
    answer: 'Kami melayani pembelian retail (eceran) untuk kebutuhan penelitian skala kecil, mahasiswa, praktikum sekolah, maupun pembelian dalam jumlah besar (B2B) untuk instansi pemerintah, swasta, dan universitas. Jika Anda memerlukan Faktur Pajak atau penawaran harga resmi (Quotation), silakan hubungi tim kami.'
  },
  {
    question: 'Berapa lama estimasi waktu pengemasan dan pengiriman pesanan?',
    answer: 'Pesanan Anda akan dikemas dan diserahkan ke kurir logistik dalam waktu 1-2 hari kerja setelah pembayaran terkonfirmasi. Estimasi lama pengiriman tergantung lokasi Anda serta opsi kurir yang dipilih saat checkout.'
  },
  {
    question: 'Metode pembayaran apa saja yang didukung oleh labkimiaJKT?',
    answer: 'Kami mendukung pembayaran otomatis yang aman melalui Payment Gateway iPaymu. Anda dapat membayar menggunakan Virtual Account (BCA, Mandiri, BNI, BRI, CIMB, Permata) serta QRIS (LinkAja, GoPay, ShopeePay, OVO, Dana, dll).'
  },
  {
    question: 'Apakah ada batasan pembelian untuk bahan kimia jenis tertentu?',
    answer: 'Beberapa bahan kimia kategori khusus atau prekursor memerlukan dokumen verifikasi tambahan seperti surat pernyataan penggunaan dari instansi/perusahaan untuk mencegah penyalahgunaan. Tim kami akan menghubungi Anda jika produk yang Anda pesan memerlukan dokumen pendukung tersebut.'
  }
];

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="legal-page">
        <div className="legal-container">
          
          <div className="legal-nav-row">
            <Link href="/" className="legal-back-btn">
              <ion-icon name="arrow-back-outline"></ion-icon>
              Kembali ke Beranda
            </Link>
          </div>

          <div className="legal-card">
            <div className="legal-header">
              <h1 className="legal-title">
                <ion-icon name="help-circle-outline"></ion-icon>
                Pertanyaan Umum (FAQ)
              </h1>
              <div className="legal-meta">
                <ion-icon name="time-outline"></ion-icon>
                <span>Terakhir diperbarui: 1 Juni 2026</span>
              </div>
            </div>

            <div className="legal-content">
              <p>
                Temukan jawaban atas pertanyaan yang paling sering diajukan mengenai produk bahan kimia, 
                proses pengemasan, keamanan pengiriman, dan metode pembayaran di toko online kami.
              </p>
              
              <div className="faq-list" style={{ marginTop: '32px' }}>
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = activeIndex === idx;
                  return (
                    <div key={idx} className={`faq-item ${isOpen ? 'active' : ''}`}>
                      <button 
                        className="faq-trigger" 
                        onClick={() => toggleFAQ(idx)}
                        aria-expanded={isOpen}
                      >
                        <span className="faq-question">{item.question}</span>
                        <span className="faq-icon">
                          <ion-icon name="chevron-down-outline"></ion-icon>
                        </span>
                      </button>
                      
                      <div 
                        className="faq-content"
                        style={{ maxHeight: isOpen ? '300px' : '0' }}
                      >
                        <div className="faq-content-inner">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="legal-callout" style={{ marginTop: '40px' }}>
                <p>
                  Punya pertanyaan lain yang belum terjawab di sini? Tim customer support kami siap melayani Anda melalui WhatsApp di nomor <strong>+62851 7693 1330</strong> atau email ke <strong>labkimiajkt@gmail.com</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
