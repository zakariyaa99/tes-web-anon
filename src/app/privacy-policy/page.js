'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../legal.css';

export default function PrivacyPolicyPage() {
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
                <ion-icon name="shield-checkmark-outline"></ion-icon>
                Kebijakan Privasi
              </h1>
              <div className="legal-meta">
                <ion-icon name="time-outline"></ion-icon>
                <span>Terakhir diperbarui: 1 Juni 2026</span>
              </div>
            </div>

            <div className="legal-content">
              <p>
                Di <strong>labkimiaJKT</strong>, kami sangat menghargai privasi dan perlindungan data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan menjaga informasi pribadi Anda ketika Anda mengunjungi website kami (labkimiajkt.store) dan melakukan pembelian produk.
              </p>

              <h2>1. Informasi yang Kami Kumpulkan</h2>
              <p>
                Kami mengumpulkan beberapa jenis informasi untuk kelancaran transaksi dan kenyamanan berbelanja Anda:
              </p>
              <ul>
                <li><strong>Informasi Identitas Diri:</strong> Nama lengkap, alamat email, nomor telepon aktif, dan alamat pengiriman lengkap saat Anda membuat akun atau melakukan checkout.</li>
                <li><strong>Informasi Transaksi:</strong> Detail mengenai produk yang Anda beli, jumlah pembayaran, dan status transaksi. Kami <strong>tidak</strong> menyimpan informasi kartu kredit atau detail pembayaran sensitif lainnya secara langsung; seluruh pembayaran diproses dengan aman oleh gerbang pembayaran mitra kami (iPaymu).</li>
                <li><strong>Informasi Kunjungan:</strong> Alamat IP, jenis browser, halaman yang dikunjungi di website kami, serta data analitik dasar untuk meningkatkan performa situs.</li>
              </ul>

              <h2>2. Cara Kami Menggunakan Informasi Anda</h2>
              <p>
                Informasi yang kami kumpulkan digunakan untuk tujuan-tujuan berikut:
              </p>
              <ol>
                <li>Memproses pesanan, memverifikasi pembayaran, serta mengirimkan produk yang Anda beli ke alamat tujuan.</li>
                <li>Menyediakan layanan dukungan pelanggan (customer support) dan menjawab pertanyaan-pertanyaan Anda terkait produk.</li>
                <li>Mengirimkan informasi penting mengenai transaksi Anda, seperti invoice pembelian dan resi pengiriman kurir.</li>
                <li>Meningkatkan kualitas layanan dan tata letak website agar lebih user-friendly bagi pengunjung.</li>
              </ol>

              <h2>3. Keamanan Data Pribadi</h2>
              <p>
                Kami menerapkan standar pengamanan teknis untuk melindungi data pribadi Anda dari akses yang tidak sah, penyalahgunaan, atau kebocoran data. Halaman checkout dan transaksi kami dilindungi oleh enkripsi SSL (Secure Sockets Layer). Meskipun demikian, perlu diingat bahwa tidak ada metode transmisi internet yang 100% aman, namun kami selalu berupaya memberikan perlindungan terbaik.
              </p>

              <h2>4. Pembagian Informasi dengan Pihak Ketiga</h2>
              <p>
                Kami menjamin tidak akan pernah menjual, menyewakan, atau menyebarluaskan data pribadi Anda kepada pihak lain untuk kepentingan komersial mereka. Kami hanya membagikan data Anda dengan mitra terpercaya kami yang terlibat langsung dalam pemrosesan transaksi, seperti:
              </p>
              <ul>
                <li><strong>Layanan Ekspedisi/Kurir:</strong> Mengirimkan data nama, alamat lengkap, dan nomor telepon Anda agar kurir dapat mengantarkan paket secara tepat.</li>
                <li><strong>Payment Gateway (iPaymu):</strong> Mengirimkan detail nominal transaksi dan nama pembeli untuk verifikasi pembayaran secara real-time.</li>
              </ul>

              <h2>5. Penggunaan Cookie</h2>
              <p>
                Situs web kami menggunakan cookie untuk mengenali preferensi Anda, mengingat barang dalam keranjang belanja Anda, serta menganalisis statistik kunjungan. Anda dapat menonaktifkan cookie melalui pengaturan browser Anda, namun beberapa fungsi website mungkin tidak dapat berjalan secara optimal.
              </p>

              <h2>6. Perubahan Kebijakan Privasi</h2>
              <p>
                Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu sesuai dengan perkembangan layanan kami atau regulasi hukum yang berlaku. Setiap perubahan akan langsung dipublikasikan di halaman ini dengan tanggal pembaruan terbaru.
              </p>

              <h2>7. Hubungi Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan, keluhan, atau kekhawatiran terkait pengelolaan data pribadi Anda, silakan hubungi kami di:
              </p>
              <ul>
                <li><strong>Email:</strong> labkimiajkt@gmail.com</li>
                <li><strong>WhatsApp:</strong> +62851 7693 1330</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
