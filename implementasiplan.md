# Rencana Implementasi Tugas Programmer 1
## Proyek: DUITku — Expense Tracker Mahasiswa
**Programmer:** Programmer 1 (Autentikasi, Sesi, Cookie, App Shell & FR-10 Budget Modal)  
**Dokumen Referensi:** `SRS_DUITku.md` & `PEMBAGIAN_TUGAS.md`

---

## 1. Analisis Status Pekerjaan Programmer 1

### A. Fitur yang Telah Selesai Dikembangkan:
- [x] **FR-01: Registrasi Akun Mahasiswa** (`src/app/(auth)/register/page.tsx` & Server Action `signup`).
- [x] **FR-02: Login & Sesi Pengguna** (`src/app/(auth)/login/page.tsx` & Server Action `login`).
- [x] **FR-08: Preferensi Tema via Cookie** (`src/lib/cookies.ts`, `src/components/ThemeToggle.tsx`, dan penanganan SSR di `src/app/layout.tsx`).
- [x] **FR-09: Logout Pengguna** (Server Action `logout` dan integrasi di Navbar).
- [x] **NFR-02 & NFR-03: Route Guard & Cookie Compliance** (`src/middleware.ts` & `src/lib/supabase/middleware.ts`).
- [x] **Pondasi Supabase SSR**: Helper Klien Browser, Server Component, dan Middleware (`@supabase/ssr`).

### B. Fitur / Pekerjaan yang Belum Selesai (Sisa Tugas):
- [ ] **FR-10: Komponen Form Modal Anggaran Bulanan (`BudgetFormModal.tsx`)**:
  - Belum ada komponen modal input nominal anggaran bulanan mahasiswa.
- [ ] **Integrasi Akses Modal di `Navbar.tsx`**:
  - Belum ada tombol atau pemicu visual ("Atur Anggaran" / icon target finansial) di sebelah profil email untuk membuka modal budget.
- [ ] **Server Actions untuk Anggaran Bulanan (`upsertBudget` & `getCurrentBudget`)**:
  - Diperlukan untuk menyimpan dan memuat nominal anggaran ke tabel `monthly_budgets` di Supabase.
- [ ] **Penyempurnaan Interaktivitas & Asinkron / AJAX (Evaluasi Poin 7)**:
  - Tombol logout di Navbar masih menggunakan submit form standar tanpa transisi status; perlu ditingkatkan dengan `useTransition` agar user feedback jelas (indikator keluar asinkron tanpa kedipan reload).
  - Modal budget harus menggunakan `useTransition` untuk submit form secara mulus tanpa full page reload.

---

## 2. Rencana Eksekusi Langkah Demi Langkah

### Langkah 1: Perbarui Tipe Data Transaksi & Anggaran
- **Berkas:** `src/types/transaction.ts`
- **Tindakan:** Tambahkan interface `MonthlyBudget` yang merepresentasikan model tabel `monthly_budgets` (id, user_id, month_year, amount, created_at, updated_at).

### Langkah 2: Buat Server Actions untuk Anggaran Bulanan
- **Berkas:** `src/app/(dashboard)/transactions/actions.ts`
- **Tindakan:** 
  - Tambahkan fungsi `getCurrentBudget()` untuk mengambil data anggaran bulan aktif (`YYYY-MM`).
  - Tambahkan fungsi `upsertBudget(formData: FormData)` untuk insert/update nominal anggaran bulanan dengan penegakan RLS `auth.uid() = user_id` dan revalidasi cache path `/dashboard`.

### Langkah 3: Buat Komponen `BudgetFormModal.tsx`
- **Berkas:** `src/components/BudgetFormModal.tsx`
- **Tindakan:**
  - Buat komponen modal modern yang responsif (Glassmorphism / Tailwind styling harmonis dengan Dark/Light mode).
  - Sediakan input nominal dengan format angka Rupiah yang mudah dipahami mahasiswa.
  - Implementasikan form handling berbasis `useTransition` (asinkron / AJAX pattern Next.js Server Action).
  - Tampilkan error message dan loading state tombol ("Menyimpan...").

### Langkah 4: Perbarui dan Integrasikan `Navbar.tsx`
- **Berkas:** `src/components/Navbar.tsx`
- **Tindakan:**
  - Ubah `Navbar.tsx` menjadi Client Component (`'use client'`) untuk mengelola modal state secara reaktif.
  - Tambahkan tombol "Atur Anggaran" / icon Target Finansial pada section user terotentikasi.
  - Sempurnakan aksi Logout menggunakan `useTransition` dengan umpan balik visual ("Keluar...").
  - Hubungkan state `isBudgetOpen` dengan `BudgetFormModal`.

### Langkah 5: Pengujian (Testing) & Verifikasi
- **Tindakan:**
  1. Jalankan `npm run build` untuk memverifikasi TypeScript typing dan zero lint error.
  2. Jalankan pengujian visual & fungsional:
     - Alur Login & Route Guard.
     - Penggantian Tema (Light/Dark) dan konsistensi cookie `duitku_theme`.
     - Tombol "Atur Anggaran" di Navbar dan input modal budget.
     - Tombol Logout dan pengalihan ke `/login`.
