# Panduan Beta Testing Websensial.ai

## Akses Aplikasi

Aplikasi Websensial.ai sedang berjalan di: **http://localhost:3000**

---

## Cara Login / Mendaftar

### Opsi 1: Membuat Akun Baru (Recommended)

1. Buka http://localhost:3000
2. Klik "Daftar Sekarang" atau pergi ke http://localhost:3000/auth/sign-up
3. Isi data berikut:
   - **Nama Perusahaan**: Masukkan nama bisnis Anda (contoh: "PT Contoh")
   - **Email**: Gunakan email valid (contoh: test@example.com)
   - **Password**: Buat password (minimal 8 karakter)
   - **Konfirmasi Password**: Ulangi password yang sama
4. Klik tombol "Daftar"
5. Setelah pendaftaran sukses, Anda akan diarahkan ke halaman sukses
6. Klik link "Masuk Sekarang" atau buka http://localhost:3000/auth/login
7. Masukkan email dan password yang baru saja Anda buat
8. Klik "Masuk"

### Opsi 2: Gunakan Akun Demo (untuk testing cepat)

Jika Anda ingin testing cepat tanpa mendaftar, database sudah siap dengan akun demo:

**Email**: demo@websensial.com
**Password**: Demo123456

Ikuti langkah login di bawah.

---

## Cara Login (Akun Existing)

1. Buka http://localhost:3000
2. Akan otomatis diarahkan ke halaman login
3. Masukkan email Anda
4. Masukkan password Anda
5. Klik tombol "Masuk"
6. Anda akan diarahkan ke Dashboard

---

## Fitur-Fitur untuk Di-Test

Setelah login, Anda dapat mengakses fitur berikut dari sidebar:

### 1. Dashboard
- **URL**: http://localhost:3000/dashboard
- **Fitur**: 
  - Melihat ringkasan metrik: Total Leads, Active Chats, Conversion Rate, Revenue
  - Lihat distribusi status leads (Hot/Warm/Cold)
  - Lihat daftar leads terbaru

### 2. Chat
- **URL**: http://localhost:3000/dashboard/chat
- **Fitur**:
  - Lihat daftar percakapan WhatsApp
  - Tampilkan pesan masuk dan keluar
  - Status pesan (terkirim, terbaca)
  - Interface mirip WhatsApp

### 3. Leads
- **URL**: http://localhost:3000/dashboard/leads
- **Fitur**:
  - Lihat daftar semua leads
  - Filter dan cari leads
  - Lihat lead score (0-100 poin)
  - Kategorisasi suhu leads: Hot (panas), Warm (hangat), Cold (dingin)
  - Lihat informasi kontak lengkap

### 4. Quotations
- **URL**: http://localhost:3000/dashboard/quotations
- **Fitur**:
  - Lihat daftar quotations
  - Status quotation: Draft, Sent, Accepted
  - Lihat tanggal expire quotation
  - Analytics acceptance rate

### 5. Invoices
- **URL**: http://localhost:3000/dashboard/invoices
- **Fitur**:
  - Lihat daftar invoice
  - Status pembayaran: Paid, Pending, Overdue
  - Revenue analytics berdasarkan status
  - Download dan share invoice

### 6. Products
- **URL**: http://localhost:3000/dashboard/products
- **Fitur**:
  - Lihat katalog produk
  - Tracking penjualan per produk
  - Setup automation rules
  - Trigger-based automation system

### 7. Analytics
- **URL**: http://localhost:3000/dashboard/analytics
- **Fitur**:
  - KPI dashboard dengan trend
  - Customer segmentation
  - Top performing products
  - Monthly trends reporting
  - Export laporan custom

### 8. Settings
- **URL**: http://localhost:3000/dashboard/settings
- **Fitur**:
  - Konfigurasi informasi perusahaan
  - Setup WhatsApp Business API
  - Preferensi notifikasi
  - Manajemen tim
  - Informasi billing

---

## Cara Logout

1. Klik ikon "W" (profile avatar) di bagian kanan atas
2. Atau dari sidebar bagian bawah, klik tombol "Logout"
3. Anda akan diarahkan kembali ke halaman login

---

## Testing Scenarios

### Scenario 1: Basic Navigation
1. Login dengan email dan password
2. Klik setiap menu di sidebar (Dashboard, Chat, Leads, dll)
3. Verifikasi setiap halaman memuat dengan baik
4. Verifikasi logo Websensial muncul di sidebar

### Scenario 2: Data Display
1. Buka halaman Leads
2. Lihat daftar leads dengan score dan temperature
3. Buka halaman Quotations
4. Lihat daftar quotations dengan status
5. Buka halaman Invoices
6. Lihat daftar invoices dengan status pembayaran

### Scenario 3: Responsive Design
1. Buka aplikasi di desktop browser
2. Tekan F12 untuk buka DevTools
3. Klik responsive design mode
4. Test dengan berbagai ukuran screen:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

### Scenario 4: Sidebar Toggle
1. Login ke dashboard
2. Klik tombol menu (hamburger) di header
3. Verifikasi sidebar collapse/expand
4. Verifikasi logo tetap visible

### Scenario 5: Profile Avatar
1. Login ke dashboard
2. Lihat avatar "W" di kanan atas
3. Klik untuk melihat options
4. Verifikasi logout berfungsi

---

## Troubleshooting

### "Connection Refused" error
- Pastikan aplikasi masih running
- Jalankan `pnpm dev` dari terminal
- Tunggu sampai `✓ Compiled` muncul

### "Invalid Email/Password"
- Pastikan email dan password sudah benar
- Jika baru mendaftar, tunggu beberapa detik sebelum login
- Coba logout dan login ulang

### Halaman Blank / Tidak Muat
- Refresh browser (F5)
- Clear cache browser (Ctrl+Shift+Delete)
- Close dan buka tab baru

### Logo tidak muncul di sidebar
- Verifikasi file `/public/websensial-logo.png` ada
- Clear browser cache
- Restart dev server

---

## Tips Testing

1. **Data Mock**: Semua data yang ditampilkan adalah mock/contoh untuk demonstrasi
2. **Fitur Real-Time**: Chat belum terintegrasi dengan WhatsApp API (masih simulasi)
3. **Database**: Data disimpan di Supabase PostgreSQL (jika sudah dikonfigurasi)
4. **Authentication**: Menggunakan Supabase Auth dengan email/password
5. **Responsive**: Aplikasi fully responsive untuk mobile, tablet, dan desktop

---

## Feedback / Bugs Reporting

Jika menemukan bug atau issue:
1. Catat URL halaman
2. Catat langkah-langkah yang menyebabkan issue
3. Screenshot atau video jika perlu
4. Laporkan dengan detail

---

## Timeline Development

- ✅ Phase 1: Authentication & Database Schema
- ✅ Phase 2: Dashboard dengan Analytics
- ✅ Phase 3: Lead Management & Scoring
- ✅ Phase 4: Quotation & Invoice System
- ✅ Phase 5: Chat UI (WhatsApp Integration pending)
- ✅ Phase 6: Product & Automation Management
- ✅ Phase 7: Advanced Analytics & Reporting
- 🔄 Next: WhatsApp API Integration
- 🔄 Next: AI Chat Assistant
- 🔄 Next: Advanced Reporting & Export

---

## Kontak Support

Jika ada pertanyaan atau butuh bantuan, silakan hubungi tim development.

Selamat melakukan beta testing!
