# 🔗 AduLink — Frontend

Frontend platform pengaduan masyarakat **AduLink** menggunakan **Next.js 14**, **Tailwind CSS**, dan terhubung ke API **Elysia.js**.

---

## 🛠️ Tech Stack

| Teknologi | Keterangan |
|-----------|-----------|
| Next.js 14 (App Router) | Framework React |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| Recharts | Chart & grafik |
| Lucide React | Icon |
| js-cookie | Manajemen token cookie |
| react-hot-toast | Notifikasi |
| date-fns | Format tanggal |

---

## 🚀 Cara Setup

### 1. Pastikan backend sudah berjalan
Backend Elysia.js harus berjalan di `http://localhost:5000`.
Lihat README backend untuk cara menjalankannya.

### 2. Install dependencies

```bash
npm install
# atau
yarn install
# atau
bun install
```

### 3. Konfigurasi environment

```bash
cp .env.example .env.local
```

Isi `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_UPLOAD_URL=http://localhost:5000/uploads/images
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── page.jsx                          # Home — feed publik
│   ├── login/page.jsx                    # Login
│   ├── register/page.jsx                 # Register
│   ├── not-found.jsx                     # 404
│   ├── laporan/
│   │   ├── buat/page.jsx                 # Form buat laporan
│   │   └── [id]/page.jsx                 # Detail laporan publik
│   └── dashboard/
│       ├── layout.jsx                    # Auth guard dashboard
│       ├── admin/page.jsx                # Dashboard admin
│       ├── superadmin/page.jsx           # Dashboard super admin
│       ├── laporan/
│       │   ├── page.jsx                  # List laporan (admin)
│       │   └── [id]/page.jsx             # Detail laporan (admin)
│       ├── users/page.jsx                # Manajemen pengguna
│       ├── kategori/page.jsx             # Manajemen kategori
│       ├── komentar/page.jsx             # Manajemen komentar
│       └── profile/page.jsx             # Profil akun
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx                    # Navbar publik
│   │   ├── Sidebar.jsx                   # Sidebar dashboard
│   │   └── DashboardLayout.jsx           # Layout wrapper dashboard
│   └── ui/
│       └── index.jsx                     # Komponen UI reusable
│
├── context/
│   └── AuthContext.jsx                   # Auth state global
│
├── hooks/
│   └── useLaporan.js                     # Custom hooks
│
├── lib/
│   └/api.js                             # Semua API client
│
└── middleware.js                         # Route protection
```

---

## 🔐 Sistem Role & Akses

| Halaman | User | Admin | Super Admin |
|---------|:----:|:-----:|:-----------:|
| Home feed | ✅ | ✅ | ✅ |
| Detail laporan | ✅ | ✅ | ✅ |
| Buat laporan | ✅ (login) | ✅ | ✅ |
| Dashboard admin | ❌ | ✅ | ✅ |
| Dashboard super admin | ❌ | ❌ | ✅ |
| Kelola users | ❌ | ✅ (read) | ✅ (full) |
| Kelola admin | ❌ | ❌ | ✅ |

---

## 🗂️ Halaman Lengkap

### Publik
| Path | Deskripsi |
|------|-----------|
| `/` | Home — feed laporan seperti sosial media |
| `/login` | Login dengan demo accounts |
| `/register` | Registrasi akun baru |
| `/laporan/[id]` | Detail laporan + komentar + like/dislike |
| `/laporan/buat` | Form buat laporan baru |

### Dashboard Admin
| Path | Deskripsi |
|------|-----------|
| `/dashboard/admin` | Ringkasan statistik + chart |
| `/dashboard/laporan` | CRUD laporan + filter + pagination |
| `/dashboard/laporan/[id]` | Detail + ubah status + balas komentar |
| `/dashboard/users` | Daftar pengguna |
| `/dashboard/kategori` | CRUD kategori |
| `/dashboard/komentar` | Moderasi komentar & balasan |
| `/dashboard/profile` | Edit profil & ubah password |

### Dashboard Super Admin
| Path | Deskripsi |
|------|-----------|
| `/dashboard/superadmin` | Ringkasan + manajemen admin + log aktivitas |
| `/dashboard/users` | CRUD users + assign role |
| *(semua halaman admin)* | Akses penuh |

---

## 🎨 Design System

Warna utama yang digunakan:

```
Teal (primer) : #1D9E75
Blue (sekunder): #185FA5  
Ink (netral)  : #2C2C2A
Amber (warning): #BA7517
Rose (danger)  : #E24B4A
```

---

## 📝 Demo Accounts

Setelah menjalankan `bun db:seed` di backend:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@laporan.com | superadmin123 |
| Admin | admin@laporan.com | admin123 |
| User | user@laporan.com | user123 |
