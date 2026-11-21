# Sistem Pendukung Keputusan (SPK) Rekrutmen Karyawan Toko Komputer BOSNIALine Tenjolaya
### Metode Simple Additive Weighting (SAW)

Aplikasi web komprehensif Sistem Pendukung Keputusan (SPK) untuk seleksi dan rekrutmen karyawan pada **Toko Komputer BOSNIALine Tenjolaya, Kabupaten Bogor**, dirancang dengan arsitektur modern, antarmuka responsif, dan komputasi matematis transparan berbasis metode **Simple Additive Weighting (SAW)**.

---

## 🚀 Fitur Utama Sistem

1. **Login & Hak Akses (Multi-Role Authentication & RBAC)**
   - Role Administrator (Pemilik Usaha): Akses menyeluruh ke semua modul, pengaturan kriteria, manajemen akun, dan database.
   - Role HRD / Tim Rekrutmen: Mengelola data pelamar, input nilai tes dan wawancara, komputasi SAW, dan pencetakan laporan.
   - Role Pimpinan Toko (Yusup Supriadi): Meninjau hasil seleksi, persetujuan/override keputusan akhir, serta pengesahan dokumen keputusan.
   - Role Calon Pelamar: Portal pendaftaran online mandiri dan pengecekan status seleksi.
   - **Quick Role Switcher**: Kemudahan berganti peran secara instan di navbar atas untuk presentasi dan pengujian dosen.

2. **Dashboard Interaktif**
   - Kartu statistik real-time: Total Pelamar, Pelamar Dinilai, Rekomendasi Diterima, Skor Tertinggi SAW ($V_i$).
   - Grafik Donat SVG Distribusi Pelamar per Formasi Lowongan (Teknisi Komputer, Kasir, Marketing, Gudang).
   - Grafik Batang Visualisasi Skor Preferensi Top Kandidat.
   - Tabel Top 5 Kandidat Terbaik secara dinamis.

3. **Data Pelamar**
   - Basis data pelamar lengkap dengan profil, NIK, kontak WhatsApp, status berkas, dan histori pendidikan.
   - Fitur pencarian instan dan filter multi-kategori (posisi lowongan & status berkas).
   - Modal detail profil pelamar dengan peninjau berkas CV (Mock PDF preview).
   - Aksi edit, hapus, dan verifikasi berkas.

4. **Kriteria Penilaian SAW**
   - **C1: Tes Praktik & Keahlian Komputer** (Benefit, Bobot 25% / 0.25)
   - **C2: Pengalaman Kerja di Bidang Komputer/Retail** (Benefit, Bobot 20% / 0.20)
   - **C3: Wawancara, Attitude & Komunikasi** (Benefit, Bobot 20% / 0.20)
   - **C4: Pendidikan Terakhir & Kesesuaian Jurusan** (Benefit, Bobot 15% / 0.15)
   - **C5: Ekspektasi Gaji** (Cost, Bobot 10% / 0.10) - *Penerimaan kriteria cost: semakin efisien semakin tinggi nilai preferensinya*
   - **C6: Tes Tertulis & Psikotes Dasar** (Benefit, Bobot 10% / 0.10)
   - Indikator total bobot otomatis 100% dan konfigurasi skala sub-kriteria 1 sampai 5.

5. **Penilaian Pelamar**
   - Matriks evaluasi interaktif seluruh calon pelamar.
   - Form input skor dengan pedoman sub-kriteria.
   - Tombol **"Isi Nilai Demo Cepat"** untuk simulasi presentasi instan.

6. **Perhitungan Metode SAW (Langkah Matematis Lengkap)**
   - **Tahap 1**: Pembentukan Matriks Keputusan ($X$).
   - **Tahap 2**: Penentuan Nilai Ekstrem (Max untuk Benefit, Min untuk Cost).
   - **Tahap 3**: Matriks Ternormalisasi ($R$) dengan rumus:
     $$r_{ij} = \frac{x_{ij}}{\max_i(x_{ij})} \quad (\text{Benefit})$$
     $$r_{ij} = \frac{\min_i(x_{ij})}{x_{ij}} \quad (\text{Cost})$$
   - **Tahap 4**: Perhitungan Nilai Preferensi Terbobot ($V_i$):
     $$V_i = \sum_{j=1}^{n} w_j \cdot r_{ij}$$
   - Fitur **"Rincian Rumus"** interaktif per pelamar yang menguraikan perkalian langkah demi langkah.

7. **Hasil Seleksi dan Laporan Resmi**
   - Perangkingan otomatis dari ranking 1 sampai terakhir.
   - Pengaturan kuota penerimaan dinamis dengan penyesuaian status otomatis (Lolos / Diterima, Cadangan, Tidak Lolos).
   - Hak override status keputusan oleh pimpinan/HRD.
   - **Laporan Resmi**: Dilengkapi Kop Surat resmi Toko Komputer BOSNIALine Tenjolaya, nomor surat keputusan, tanda tangan pimpinan dan HRD, serta dukungan cetak ramah printer (Clean Print CSS) dan ekspor CSV.

8. **Pengaturan Sistem**
   - Profil toko (Nama usaha, slogan, alamat di Tenjolaya, nomor WhatsApp, email).
   - Manajemen user terdaftar.
   - Cadangkan database (Export JSON), pulihkan (Restore JSON), dan reset data pabrik.

9. **Portal Mandiri Calon Pelamar**
   - Pendaftaran online pelamar baru dengan formulir terstruktur.
   - Cek status pengumuman mandiri menggunakan Nomor Registrasi (contoh: `BSN-2026-001`) atau NIK KTP.

---

## 🛠️ Cara Menjalankan Aplikasi

Aplikasi dapat dijalankan langsung melalui browser tanpa memerlukan konfigurasi database server yang rumit:

### Opsi 1: Buka Langsung di Browser
Cukup klik dua kali berkas `index.html` pada File Explorer Anda, atau seret berkas ke Google Chrome / Edge.

### Opsi 2: Menggunakan Node.js / Local Server
Jika ingin menjalankan melalui local web server:
```bash
# Menggunakan npm script yang telah disediakan
npm start
# atau
npx serve -l 3000 .
```
Akses di browser pada: `http://localhost:3000`

---

## 👤 Akun Bawaan (Default Login)
| Peran (Role) | Username | Password |
|---|---|---|
| **Admin (Pemilik Usaha)** | `admin` | `admin123` |
| **HRD / Tim Penilai** | `hrd` | `hrd123` |
| **Pimpinan (Yusup Supriadi)** | `pimpinan` | `pimpinan123` |
| **Calon Pelamar** | `pelamar` | `pelamar123` |

*Catatan: Anda juga dapat menggunakan dropdown "Akses" di sudut kanan atas navbar untuk berganti peran dalam 1 klik saat demonstrasi perkuliahan.*

---

**Toko Komputer BOSNIALine Tenjolaya**  
*Jl. Raya Tenjolaya No. 18, Kec. Tenjolaya, Kab. Bogor, Jawa Barat*
