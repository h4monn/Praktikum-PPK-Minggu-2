# DUITku — Expense Tracker Mahasiswa

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_&_Auth-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

**DUITku** adalah aplikasi web manajemen arus kas (*personal financial expense tracker*) yang dirancang untuk memfasilitasi mahasiswa dalam mencatat pemasukan dan pengeluaran harian, memantau posisi saldo secara *real-time*, serta menerapkan tata kelola keuangan pribadi secara terstruktur, terisolasi, dan aman.

Sistem ini dikembangkan menggunakan arsitektur **Next.js 16 (App Router)** dengan integrasi **Supabase SSR**, menerapkan kebijakan **Row Level Security (RLS)** pada basis data PostgreSQL untuk menjamin isolasi data mutlak antar-pengguna, serta memanfaatkan **HTTP Cookies** untuk retensi sesi login dan penyimpanan preferensi tema antarmuka (*Dark/Light Mode*).

---

## Fitur Utama Sistem

### 1. Autentikasi dan Manajemen Sesi (Session Management)
- **Registrasi Akun Mahasiswa**: Pendaftaran akun menggunakan email institusi/pribadi dan kata sandi yang divalidasi.
- **Login Terproteksi**: Pertukaran token JWT dan penyimpanan sesi persisten pada *HTTP-Only secure cookies* menggunakan pustaka `@supabase/ssr`.
- **Route Guarding**: Next.js Middleware/Proxy membatasi akses pada rute terproteksi (`/dashboard`), secara otomatis mengalihkan pengguna tanpa sesi aktif ke rute `/login`.
- **Terminasi Sesi (Logout)**: Pembersihan sesi server dan penghapusan cookie otentikasi secara menyeluruh saat keluar dari sistem.

### 2. Isolasi Data Mutlak (Data Isolation via Row Level Security)
- Penerapan kebijakan PostgreSQL **Row Level Security (RLS)** pada tabel `transactions` (`auth.uid() = user_id`).
- Setiap pengguna **hanya memiliki hak akses baca, tulis, ubah, dan hapus terhadap data miliknya sendiri**.
- Mencegah kebocoran data (*data leakage*) antar-mahasiswa pada tingkat basis data secara independen dari logika aplikasi.

### 3. Dashboard Ringkasan Finansial
- **Saldo Saat Ini (*Current Balance*)**: Kalkulasi agregat otomatis (Total Pemasukan dikurangi Total Pengeluaran).
- **Total Pemasukan (*Total Income*)**: Akumulasi seluruh dana masuk (uang saku, beasiswa, honorarium).
- **Total Pengeluaran (*Total Expense*)**: Akumulasi seluruh pos biaya (konsumsi, tempat tinggal, transportasi, kebutuhan akademik).
- Indikator status visual adaptif (penanda positif untuk surplus, penanda negatif untuk defisit).

### 4. Manajemen Transaksi Komprehensif (CRUD)
- **Pencatatan Transaksi Baru**: Formulir modal interaktif untuk merekam jenis transaksi (*Income* / *Expense*), nilai nominal, klasifikasi kategori, tanggal transaksi, dan catatan keterangan.
- **Riwayat Transaksi**: Tabel data responsif dengan pengurutan kronologis terbalik (*latest date first*).
- **Penyaringan Transaksi (*Filtering*)**: Fitur filter untuk memilah data berdasarkan kategori Semua Transaksi, Pemasukan, atau Pengeluaran.
- **Pembaruan Transaksi (*Edit*)**: Pengubahan nominal atau rincian transaksi dengan pemuatan data awal (*pre-filled form*).
- **Penghapusan Transaksi (*Delete*)**: Penghapusan entri data yang dilengkapi dengan dialog konfirmasi keamanan guna mencegah kesalahan operasional.
- **Notifikasi Sistem (*Toast Notifications*)**: Umpan balik visual langsung atas keberhasilan atau kegagalan setiap mutasi data.

### 5. Preferensi Pengguna Berbasis Cookies (User Preferences)
- Penyimpanan preferensi tema tampilan (*Light Mode* / *Dark Mode*) pada cookie peramban `duitku_theme`.
- Pembacaan cookie di tingkat server (*Server-Side Cookie Reading*) pada root layout guna mencegah efek kedipan antarmuka (*Flash of Unstyled Content / FOUC*).
- Retensi masa berlaku cookie selama 365 hari sehingga preferensi pengguna tetap terjaga saat peramban ditutup atau dibuka kembali.

---

## Arsitektur dan Teknologi

| Komponen Arsitektur | Teknologi | Peran Teknis |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js 16 (Turbopack Engine) | Penyedia Server Components, Server Actions mutasi data, dan App Router. |
| **Pustaka Antarmuka** | React 19 | Pengelolaan state reaktif dan penanganan transisi asinkron (`useTransition`). |
| **Bahasa Pemrograman** | TypeScript 5 | Penegakan *static typing* secara menyeluruh pada model data dan kontrak API. |
| **Sistem Desain & CSS** | Tailwind CSS v4 | Utilitas styling modern dengan dukungan performa tinggi dan variabel tema CSS. |
| **Basis Data & BaaS** | Supabase (PostgreSQL 15+) | Penyimpanan relasional terkelola dan penegak kebijakan keamanan RLS. |
| **Jembatan Sesi SSR** | `@supabase/ssr` & `@supabase/supabase-js` | Pertukaran token dan pengelolaan sesi berbasis *HTTP-Only Cookies*. |

---

## Struktur Direktori Proyek

```text
├── SRS_DUITku.md                  # Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SRS) Induk
├── PEMBAGIAN_TUGAS.md             # Dokumen Spesifikasi dan Alokasi Peran Teknis (P1 & P2)
├── scripts/
│   ├── schema.sql                 # DDL Skema PostgreSQL, Definisi Tabel & Kebijakan RLS
│   └── check-db.mjs               # Utilitas CLI Diagnostik Konektivitas Basis Data
├── src/
│   ├── app/
│   │   ├── (auth)/                # Grup Rute Autentikasi
│   │   │   ├── login/page.tsx     # Halaman Formulir Masuk
│   │   │   └── register/page.tsx  # Halaman Formulir Registrasi Akun
│   │   ├── (dashboard)/           # Grup Rute Dashboard Terproteksi
│   │   │   ├── dashboard/page.tsx # Halaman Utama Dashboard Mahasiswa
│   │   │   └── transactions/actions.ts # Server Actions CRUD Transaksi & Agregasi
│   │   ├── auth/actions.ts        # Server Actions Login, Registrasi, Logout
│   │   ├── layout.tsx             # Root Layout (Inisialisasi Tema Cookie & Navbar)
│   │   ├── page.tsx               # Entry Point (Logika Pengalihan ke /dashboard atau /login)
│   │   └── globals.css            # Definisi Desain Sistem & Konfigurasi Tema Tailwind
│   ├── components/
│   │   ├── dashboard/             # Komponen Antarmuka Dashboard
│   │   │   ├── DashboardClient.tsx# Pengendali State & Filter Riwayat
│   │   │   ├── SummaryCards.tsx   # Kartu Ringkasan Metrik Saldo, Pemasukan, Pengeluaran
│   │   │   └── TransactionList.tsx# Komponen Tabel Riwayat Transaksi
│   │   ├── transactions/          # Komponen Form & Dialog Mutasi Data
│   │   │   ├── TransactionFormModal.tsx # Dialog Tambah & Perbarui Transaksi
│   │   │   └── DeleteConfirmModal.tsx   # Dialog Konfirmasi Penghapusan
│   │   ├── Navbar.tsx             # Header Navigasi, Status Pengguna & Tombol Keluar
│   │   └── ThemeToggle.tsx        # Pengalih Tema Tampilan (Berbasis Cookie)
│   ├── lib/
│   │   ├── cookies.ts             # Utilitas Pembacaan dan Penulisan Cookie Tema
│   │   └── supabase/              # Inisialisasi Klien Supabase
│   │       ├── client.ts          # Klien Browser
│   │       ├── server.ts          # Klien Server Component & Server Action (Cookie Store)
│   │       └── middleware.ts      # Helper Pembaruan Sesi & Route Guarding
│   ├── types/
│   │   └── transaction.ts         # Definisi Tipe Data Transaksi dan Agregasi Keuangan
│   └── middleware.ts              # Next.js Route Guard Middleware
├── package.json
└── tsconfig.json
```

---

## Panduan Memulai (Getting Started)

### 1. Prasyarat Lingkungan
- Node.js versi 18.18.0 atau versi yang lebih tinggi.
- Package manager npm (disertakan bersama instalasi Node.js).
- Proyek aktif pada platform Supabase.

### 2. Kloning Repositori
```bash
git clone https://github.com/h4monn/Praktikum-PPK-Minggu-2.git
cd Praktikum-PPK-Minggu-2
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Lingkungan (`.env`)
Salin berkas konfigurasi acuan `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Lengkapi variabel lingkungan dengan parameter proyek Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres
```

### 5. Inisialisasi Skema Basis Data
Eksekusi pernyataan SQL pada berkas `scripts/schema.sql` melalui SQL Editor pada konsol Supabase untuk membentuk tabel `transactions` dan mengaktifkan kebijakan Row Level Security.

Uji integritas sambungan basis data lokal dengan menjalankan perintah:
```bash
npm run check-db
```

### 6. Menjalankan Server Pengembangan
```bash
npm run dev
```
Akses sistem melalui peramban web pada alamat `http://localhost:3000`.

### 7. Verifikasi dan Kompilasi Produksi
Untuk memastikan keabsahan tipe dan integritas kompilasi aplikasi:
```bash
npm run build
```

---

## Dokumentasi Terkait Proyek
- **[SRS_DUITku.md](SRS_DUITku.md)**: Dokumen formal Spesifikasi Kebutuhan Perangkat Lunak (*Software Requirements Specification*) mencakup matriks kebutuhan fungsional dan non-fungsional, spesifikasi batasan teknis, serta use case alur sistem.
- **[PEMBAGIAN_TUGAS.md](PEMBAGIAN_TUGAS.md)**: Dokumen formal pembagian lingkup kerja teknis (*Task & Domain Allocation*) antara **Programmer 1** (Otentikasi, Manajemen Sesi, Route Guard, Preferensi Tema Cookie) dan **Programmer 2** (Skema Basis Data PostgreSQL RLS, CRUD Transaksi, Dashboard Finansial).

---

## Tim Pengembang
Proyek aplikasi web ini dikembangkan dalam rangka Praktikum Pengembangan Perangkat Keras (PPK) Minggu 2:
- **Programmer 1**: Arsitektur Autentikasi, Manajemen Sesi SSR, Route Guarding Middleware, dan Pengelolaan Preferensi Cookie.
- **Programmer 2**: Perancangan Skema PostgreSQL, Penegakan Kebijakan RLS, Logika Bisnis CRUD Transaksi, dan Visualisasi Dashboard.
