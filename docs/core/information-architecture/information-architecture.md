# Arsitektur Informasi (Information Architecture)
## DBSN Centralized Digital Ecosystem — sentradaya.com

**Arsitektur Domain:**  
**Tanggal:** 2026-04-24  
**Berbasis:** PRD v3.0  
**Status:** Final Draft — Siap untuk Tim UI/UX

---

## Ikhtisar

Dokumen Arsitektur Informasi ini mendefinisikan organisasi, pelabelan, navigasi, dan sistem findability untuk ekosistem digital DBSN yang dibangun di atas arsitektur **Hub-and-Spoke**. Semua label menggunakan **Bahasa Indonesia** formal.

### Arsitektur Domain

```
sentradaya.com                    → Hub (Pusat Kepercayaan Korporat)
├── pju.sentradaya.com            → Spoke: PJU - Penerangan Jalan Umum
├── solarcell.sentradaya.com      → Spoke: Panel Surya
├── alatpetir.sentradaya.com      → Spoke: Penangkal Petir
├── baterai.sentradaya.com        → Spoke: Baterai
└── dashboard.sentradaya.com      → Portal Layanan Pelacakan (Autentikasi)
```

### Segmen Pengguna

| Segmen | Persona | Kebutuhan Utama |
|--------|---------|-----------------| 
| **B2G** | PPK, Staf Pengadaan, BUMN | Validasi SNI/TKDN/LKPP → Portofolio → RFQ Formal |
| **B2B** | Procurement, EPC, Facility Manager | Riset Spesifikasi → Datasheet → Artikel → RFQ atau WhatsApp |

---

## Dokumen IA

Arsitektur Informasi terbagi dalam 3 dokumen:

### 1. [Strategi & Sistem Navigasi Global](./ia-strategy-navigation.md)
- Strategi IA dan prinsip desain untuk model Hub-and-Spoke
- Header navigasi: Hub, Spoke, dan Dashboard
- Footer global
- Elemen persisten (WhatsApp CTA, Breadcrumb, Trust Badge)

### 2. [Sitemap Hub, Spoke, & Dashboard](./ia-sitemaps.md)
- **Hub Sitemap** — 9 halaman utama: Beranda, Tentang Kami, Pusat Sertifikasi, Portofolio, Produk, RFQ, Kontak, Artikel, Detail Artikel
- **Spoke Sitemap (Template)** — Kedalaman 3 level: Lini Produk → Sub-kategori → Detail Produk (PDP); plus Portofolio Proyek, Artikel, dan RFQ
- **Dashboard Sitemap** — Portal autentikasi: Login, Pelacakan (tab Proyek/Pesanan), Profil
- Struktur URL dan komponen PDP

### 3. [Alur Pengguna Inti](./ia-user-flows.md)
- **Alur B2G** — Validasi legalitas → Verifikasi portofolio → RFQ formal → Dashboard pelacakan
- **Alur B2B** — Riset produk → Unduh datasheet → Baca Artikel → RFQ/WhatsApp → Dashboard pelacakan
- **Alur Fallback** — Penanganan kegagalan API dengan WhatsApp pre-filled
- Perbandingan touchpoint dan GA4 event mapping

---

## Keputusan IA Kunci

| Keputusan | Detail |
|-----------|--------|
| **Sertifikasi Matriks** | Berdasarkan tipe di Hub, berdasarkan produk di Spoke PDP |
| **Kedalaman Produk** | 3 level: Lini → Sub-kategori → PDP |
| **RFQ Mandiri** | Halaman dedicated `/permintaan-penawaran` dengan pre-fill URL params |
| **Dashboard Phase 1** | Pelacakan status saja (daftar tunggal + tab filter) |
| **Bahasa** | Bahasa Indonesia formal untuk semua label navigasi |
| **Artikel di Hub & Spoke** | Halaman Artikel (`/artikel`) dan Detail Artikel (`/artikel/slug`) tersedia di Hub dan setiap Spoke sebagai kanal konten edukasi organik |
| **Portofolio di Spoke** | Setiap Spoke memiliki halaman Portofolio Proyek (`/portofolio`) dan Detail Proyek (`/portofolio/slug`) kontekstual terhadap produk spoke |

---

*Dokumen ini adalah indeks utama. Baca setiap bagian secara berurutan untuk pemahaman lengkap.*

**Catatan Arsitektur:** Satu aplikasi Next.js 16 dengan pnpm, menggunakan middleware untuk routing subdomain (Hub, Spokes, Dashboard), Prisma ORM dengan Neon Postgres, dan Auth.js v5.

