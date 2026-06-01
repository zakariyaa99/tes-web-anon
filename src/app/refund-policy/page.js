'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../legal.css';

export default function RefundPolicyPage() {
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
                <ion-icon name="swap-horizontal-outline"></ion-icon>
                Kebijakan Refund & Retur
              </h1>
              <div className="legal-meta">
                <ion-icon name="time-outline"></ion-icon>
                <span>Terakhir diperbarui: 1 Juni 2026</span>
              </div>
            </div>

            <div className="legal-content">
              <p>
                Di <strong>labkimiaJKT</strong>, kami selalu berkomitmen untuk menyediakan bahan kimia analitik dan alat laboratorium dengan kualitas terbaik. Mengingat sifat bahan kimia yang sangat sensitif terhadap kontaminasi dan keamanan transportasi, kami menerapkan kebijakan pengembalian produk (retur) dan pengembalian dana (refund) yang ketat namun adil demi kebaikan bersama.
              </p>

              <h2>1. Kriteria Pengembalian yang Sah</h2>
              <p>
                Anda berhak mengajukan permohonan retur barang atau refund dana apabila terjadi kondisi-kondisi berikut:
              </p>
              <ul>
                <li><strong>Produk Tidak Sesuai Pesanan:</strong> Jenis bahan kimia, konsentrasi, merk, atau ukuran kemasan yang dikirimkan berbeda dengan yang tertera pada invoice pembelian Anda.</li>
                <li><strong>Kerusakan Fisik yang Signifikan:</strong> Botol bocor, segel rusak sebelum dibuka, kemasan luar pecah, atau isi produk tumpah saat diterima, yang diakibatkan oleh kesalahan pengemasan dari pihak kami.</li>
                <li><strong>Kedaluwarsa (Expired):</strong> Produk yang diterima telah melewati batas masa kedaluwarsa yang ditentukan oleh produsen (kecuali untuk produk diskon khusus cuci gudang yang telah diinformasikan sebelumnya).</li>
              </ul>

              <h2>2. Syarat & Ketentuan Pengajuan Klaim</h2>
              <p>
                Untuk memproses klaim retur atau refund Anda, harap perhatikan syarat-syarat di bawah ini:
              </p>
              <ol>
                <li><strong>Video Unboxing Wajib:</strong> Pembeli wajib menyertakan rekaman video unboxing yang jelas dan utuh (tanpa jeda, tanpa potongan/edit) sejak paket masih tersegel rapi hingga isi barang terlihat dan diperiksa kerusakannya.</li>
                <li><strong>Batas Waktu Klaim:</strong> Laporan kerusakan atau kesalahan kirim wajib diajukan maksimal <strong>2 x 24 jam</strong> sejak status pengiriman pada sistem kurir dinyatakan "Diterima" oleh penerima.</li>
                <li><strong>Kondisi Produk:</strong> Segel tutup botol/wadah utama produk kimia <strong>tidak boleh dirusak atau dibuka</strong>. Produk yang sudah dituangkan, dipakai, atau terkontaminasi oleh lingkungan luar tidak dapat dikembalikan dengan alasan apa pun.</li>
              </ol>

              <div className="legal-callout">
                <p>
                  PENTING: Segala bentuk klaim yang diajukan tanpa bukti video unboxing lengkap sesuai ketentuan di atas, atau diajukan melewati batas waktu 2x24 jam, dengan sangat menyesal tidak dapat kami layani.
                </p>
              </div>

              <h2>3. Mekanisme & Durasi Refund</h2>
              <p>
                Setelah pengajuan klaim disetujui oleh tim kami:
              </p>
              <ul>
                <li><strong>Opsi Penggantian Barang:</strong> Kami akan mengirimkan barang pengganti yang sesuai secara gratis, dan menanggung biaya pengiriman dari toko kami ke alamat Anda.</li>
                <li><strong>Opsi Pengembalian Dana (Refund):</strong> Jika barang pengganti tidak tersedia di gudang kami, kami akan mengembalikan dana Anda senilai harga barang yang rusak/salah kirim (ditambah ongkos kirim awal).</li>
                <li><strong>Waktu Proses:</strong> Dana refund akan ditransfer ke rekening bank pribadi Anda dalam kurun waktu <strong>3 hingga 7 hari kerja</strong> setelah barang retur telah kami terima kembali dan lolos pemeriksaan fisik di lab kami.</li>
              </ul>

              <h2>4. Biaya Pengiriman Retur</h2>
              <p>
                Apabila retur disebabkan oleh kesalahan pengemasan atau kelalaian <strong>labkimiaJKT</strong>, kami akan menanggung sepenuhnya ongkos kirim pengembalian barang dari alamat Anda ke gudang kami. Jika retur dilakukan atas keinginan pribadi pembeli (misalnya salah memilih varian barang saat memesan), maka ongkos kirim pulang-pergi sepenuhnya menjadi tanggung jawab pembeli.
              </p>

              <h2>5. Hubungi Kami untuk Bantuan Klaim</h2>
              <p>
                Jika Anda mendapati masalah pada pesanan Anda, silakan hubungi customer service kami segera:
              </p>
              <ul>
                <li><strong>WhatsApp CS:</strong> +62851 7693 1330</li>
                <li><strong>Email Resmi:</strong> labkimiajkt@gmail.com</li>
                <li><strong>Alamat Retur:</strong> Jl. KH. Hasyim Ashari, RT.003/RW.001, Cipondoh, Kec. Cipondoh, Kota Tangerang, Banten 15148</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
