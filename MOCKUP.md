# Daftar File Mockup (Untuk Programmer 1)

Dokumen ini mencatat file dan komponen yang dibuat sementara (Mockup) oleh Programmer 2 (P2) agar fitur *Dashboard* dan *CRUD Transaksi* dapat diuji (di-test) meskipun pekerjaan Programmer 1 (P1) mengenai Autentikasi dan Layout belum selesai.

**PERHATIAN UNTUK PROGRAMMER 1:**
Saat Anda menggabungkan (*merge*) atau menyelesaikan pekerjaan Anda, **silakan merombak/mengganti/menimpa (overwrite)** file-file di bawah ini dengan implementasi asli Anda. Tidak perlu khawatir tentang konflik untuk file-file ini karena P2 sudah merelakan file ini untuk ditimpa.

### Daftar File yang Boleh Ditimpa (Mockup):

1. **`src/lib/supabase/server.ts`**
   - **Alasan Mockup**: P2 butuh mengambil Supabase SSR client untuk Server Actions. Karena P1 belum membuat `@supabase/ssr` setup, P2 membuat versi dasar yang melakukan otentikasi palsu (Mock Auth) menggunakan *dummy_user_id*.
   - **Tindakan P1**: Hapus `mockGetUser` dan kembalikan ke fungsi `createServerClient` standar milik Anda.

2. **`src/app/(dashboard)/layout.tsx`**
   - **Alasan Mockup**: P2 butuh layout dasar untuk membungkus halaman `/dashboard` dengan Navbar dan gaya minimalis agar testing CRUD bisa terlihat rapi.
   - **Tindakan P1**: Silakan ganti dengan struktur Layout utama yang mencakup pengecekan status *Theme Cookie* dan logika *Route Guard*.

3. **`src/components/Navbar.tsx`**
   - **Alasan Mockup**: Hanya sekadar *placeholder* Navbar agar layout terlihat seperti aplikasi yang nyata saat P2 menguji halamannya. Tidak ada fungsi *Logout* sungguhan.
   - **Tindakan P1**: Ganti dengan komponen *Navbar* buatan Anda yang memiliki tombol *Logout* asli dan *ThemeToggle*.

---
*Catatan: Programmer 2 menggunakan `dummy_user_id` yaitu `11111111-1111-1111-1111-111111111111` untuk mengetes skema transaksi di database. Anda dapat menghapus data ini dari database Supabase nanti ketika pengujian final.*
