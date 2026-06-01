'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../legal.css';

export default function TermsAndConditionsPage() {
  const [searchQuery, setSearchQuery] = useState('');

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
                <ion-icon name="document-text-outline"></ion-icon>
                Syarat & Ketentuan Layanan
              </h1>
              <div className="legal-meta">
                <ion-icon name="time-outline"></ion-icon>
                <span>Terakhir diperbarui: 1 Juni 2026</span>
              </div>
            </div>

            <div className="legal-content">
              <p>
                Selamat datang di situs web <strong>labkimiaJKT</strong> (labkimiajkt.store). Syarat dan Ketentuan berikut ini mengatur seluruh akses, penggunaan situs, pembelian produk, dan layanan yang kami sediakan. Dengan mengakses situs ini dan/atau melakukan pemesanan produk, Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan di bawah ini tanpa kecuali.
              </p>

              <h2>1. Ketentuan Pengguna & Akun</h2>
              <ul>
                <li><strong>Batasan Usia:</strong> Layanan pembelian bahan kimia di situs ini hanya diperuntukkan bagi individu yang telah berusia minimal 18 tahun atau berada di bawah bimbingan langsung pengajar, analis, atau tenaga ahli laboratorium profesional yang sah.</li>
                <li><strong>Akurasi Data:</strong> Anda berkewajiban memberikan informasi akun, alamat pengiriman, email, dan nomor telepon yang akurat serta lengkap saat melakukan registrasi atau transaksi pembelian.</li>
                <li><strong>Kerahasiaan Akun:</strong> Anda bertanggung jawab penuh untuk menjaga kerahasiaan password akun Anda dan segala aktivitas yang terjadi di bawah akun tersebut.</li>
              </ul>

              <h2>2. Disclaimer & Ketentuan Penggunaan Bahan Kimia</h2>
              <div className="legal-callout">
                <p>
                  <strong>PERNYATAAN PENTING (DISCLAIMER):</strong> Seluruh produk bahan kimia (reagen, solvent, buffer, standard solution) dan perlengkapan laboratorium yang dijual di labkimiaJKT <strong>hanya diperuntukkan untuk penggunaan analisis laboratorium, penelitian ilmiah, kebutuhan akademis (edukasi), dan keperluan industri yang sah.</strong>
                </p>
              </div>
              <ul>
                <li>Produk kami <strong>TIDAK BOLEH</strong> digunakan untuk konsumsi manusia, hewan, bahan tambahan makanan (food additive), obat-obatan medis, kosmetik langsung, atau disalahgunakan sebagai bahan pembuatan zat berbahaya/ilegal.</li>
                <li>Pembeli dianggap memiliki pengetahuan dasar mengenai penyimpanan, penanganan (handling), pembuangan limbah, dan potensi bahaya keselamatan dari bahan kimia yang dibeli.</li>
                <li><strong>labkimiaJKT</strong> dibebaskan dari segala tuntutan hukum, ganti rugi, atau tanggung jawab atas kerugian fisik maupun material yang diakibatkan oleh kelalaian, ketidaktahuan, kecelakaan kerja, atau penyalahgunaan produk oleh pembeli maupun pihak ketiga.</li>
              </ul>

              <h2>3. Pembelian, Harga, dan Pembayaran</h2>
              <ul>
                <li><strong>Harga Produk:</strong> Semua harga yang tertera di situs bersifat final pada saat pemesanan, dan belum termasuk biaya pengiriman (ongkir) serta biaya asuransi/packing kayu tambahan (apabila ada). Harga dapat berubah sewaktu-waktu tanpa pemberitahuan terlebih dahulu.</li>
                <li><strong>Ketersediaan Stok:</strong> Kami selalu berusaha menyajikan informasi stok yang akurat. Jika karena suatu alasan stok barang tidak tersedia setelah Anda membayar, kami akan segera mengontak Anda untuk opsi penukaran barang atau refund dana penuh.</li>
                <li><strong>Sistem Pembayaran:</strong> Semua transaksi diproses secara otomatis melalui payment gateway iPaymu dengan menggunakan metode transfer Virtual Account perbankan terkemuka serta QRIS. Pembayaran dianggap sah jika sistem kami telah mengeluarkan status sukses/lunas.</li>
              </ul>

              <h2>4. Kebijakan Pengiriman & Resiko</h2>
              <ul>
                <li>Barang hanya akan dikirimkan setelah pembayaran terverifikasi sepenuhnya oleh sistem kami.</li>
                <li>Mengingat regulasi ketat mengenai pengiriman zat kimia (terutama cairan atau bahan mudah terbakar), kami berhak mengganti atau merekomendasikan kurir logistik tertentu demi keamanan paket Anda.</li>
                <li>Tanggung jawab atas kerusakan, kebocoran, atau keterlambatan pengiriman beralih dari toko kami kepada pihak jasa ekspedisi/kurir terhitung sejak barang secara fisik diserahkan kepada pihak ekspedisi. Kami sangat menyarankan pembeli menggunakan opsi asuransi pengiriman untuk transaksi bernilai tinggi.</li>
              </ul>

              <h2>5. Hak Kekayaan Intelektual</h2>
              <p>
                Seluruh konten yang terdapat di situs ini, termasuk namun tidak terbatas pada teks, grafik, logo, ikon gambar, klip audio, unduhan digital, dan kompilasi data adalah milik <strong>labkimiaJKT</strong> atau pemasok konten kami dan dilindungi oleh hukum hak cipta Republik Indonesia.
              </p>

              <h2>6. Hukum yang Berlaku & Penyelesaian Sengketa</h2>
              <p>
                Syarat dan ketentuan ini diatur, ditafsirkan, dan diterapkan berdasarkan hukum yang berlaku di <strong>Negara Kesatuan Republik Indonesia</strong>. Segala perselisihan atau sengketa yang timbul dari penggunaan situs web ini atau pembelian produk akan diselesaikan secara musyawarah untuk mufakat. Apabila kesepakatan tidak tercapai, sengketa akan diselesaikan melalui jalur hukum yang berlaku di Pengadilan Negeri Jakarta Pusat.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
