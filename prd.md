PRD: Sistem Manajemen Stok (Inventory) Ayam Geprek
Status: Draft / In-Review

PIC: Mae

Target Rilis: [Input Tanggal]

1. Ringkasan Eksekutif (Overview)
Tujuan: Mengotomatiskan pencatatan stok bahan baku untuk meminimalisir kehilangan barang (shrinkage) dan menghindari kehabisan stok di jam operasional sibuk.

Masalah: Pencatatan manual seringkali tidak akurat, sulit memantau sisa stok ayam segar secara real-time, dan sulit melacak penggunaan bahan pelengkap seperti cabai yang harganya fluktuatif.

2. Target Pengguna (User Persona)
Admin/Owner: Memantau laporan stok, harga beli rata-rata, dan sisa aset.

Staf Dapur/Gudang: Mencatat barang masuk dari supplier dan barang keluar saat mulai produksi.

3. Alur Kerja (User Flow)
Barang Masuk: Supplier datang → Staf input jumlah & harga → Stok bertambah otomatis.

Barang Keluar: Produksi dimulai (misal: potong ayam) → Staf input jumlah pemakaian → Stok berkurang otomatis.

Opname: Pencocokan stok fisik mingguan/bulanan dengan data di aplikasi.

4. Kebutuhan Fungsional (Fitur Utama)
A. Manajemen Master Barang
Daftar bahan baku (Ayam, Cabai, Bawang, Minyak Goreng, Tepung, Kemasan, dll).

Satuan barang (Kg, Liter, Pcs, Karung).

Setting Minimum Stock Alert (Notifikasi jika stok di bawah batas aman).

B. Transaksi Stok Masuk (Inbound)
Input tanggal masuk dan nama supplier.

Input harga beli (untuk menghitung modal/HPP).

Foto nota pembelian (sebagai bukti digital).

C. Transaksi Stok Keluar (Outbound)
Pencatatan bahan yang keluar untuk dimasak.

Fitur "Waste" (Barang rusak/basi) dengan alasan yang jelas.

D. Laporan & Dashboard
Dashboard sisa stok real-time.

Laporan riwayat keluar masuk barang harian/mingguan.

Estimasi sisa hari (Sistem memprediksi kapan stok habis berdasarkan pemakaian rata-rata).

5. Kebutuhan Non-Fungsional
Mobile Friendly: Harus mudah dibuka lewat HP di area dapur yang panas/sibuk.

Offline Capability: Bisa input data dulu meski sinyal internet di gudang tidak stabil.

Kecepatan: Proses input tidak boleh lebih dari 10 detik agar tidak mengganggu operasional.

6. Struktur Data (Rencana Database)
items: id, name, category, unit, min_stock.

stock_transactions: id, item_id, type (in/out), quantity, price, timestamp, notes.