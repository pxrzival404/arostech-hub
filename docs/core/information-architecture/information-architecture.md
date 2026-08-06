# Arsitektur Informasi (Information Architecture)
## DBSN Centralized Digital Ecosystem — dayaberkah.id

**Arsitektur Domain:**  
**Tanggal:** 2026-04-24 (Updated 2026-08-06)  
**Berbasis:** PRD v3.1  
**Status:** Final — Diselaraskan dengan Implementasi Live

---

## Ikhtisar

Dokumen Arsitektur Informasi ini mendefinisikan organisasi, pelabelan, navigasi, dan sistem findability untuk ekosistem digital DBSN yang dibangun di atas arsitektur **Hub-and-Spoke**. Semua label menggunakan **Bahasa Indonesia** formal.

### Arsitektur Domain

```
dayaberkah.id                    → Hub (Pusat Kepercayaan Korporat)
├── pju.dayaberkah.id            → Spoke: PJU - Penerangan Jalan Umum
├── solarcell.dayaberkah.id      → Spoke: Panel Surya
├── alatpetir.dayaberkah.id      → Spoke: Penangkal Petir
├── baterai.dayaberkah.id        → Spoke: Baterai
└── dashboard.dayaberkah.id      → Portal Layanan Pelacakan (Autentikasi)
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
- **Hub Sitemap** — Halaman utama: Beranda, Tentang Kami, Pusat Sertifikasi, Portofolio, Produk, Kontak (dengan Form RFQ), Artikel, Detail Artikel
- **Spoke Sitemap (Template)** — Kedalaman 3 level: Lini Produk → Sub-kategori → Detail Produk (PDP); plus Portofolio Proyek, Artikel, dan Form RFQ
- **Dashboard Sitemap** — Portal autentikasi: Login, Pelacakan (tab Proyek/Pesanan), Profil
- Struktur URL dan komponen PDP

### 3. [Alur Pengguna Inti](./ia-user-flows.md)
- **Alur B2G** — Validasi legalitas → Verifikasi portofolio → Form RFQ (`/contact` atau PDP) → Submisi `/api/rfq` → Dashboard pelacakan
- **Alur B2B** — Riset produk → Unduh datasheet → Baca Artikel → Form RFQ/WhatsApp → Dashboard pelacakan
- **Alur Fallback** — Penanganan kegagalan API dengan WhatsApp pre-filled
- Perbandingan touchpoint dan GA4 event mapping

---

## Keputusan IA Kunci

| Keputusan | Detail |
|-----------|--------|
| **Sertifikasi Matriks** | Berdasarkan tipe di Hub, berdasarkan produk di Spoke PDP |
| **Kedalaman Produk** | 3 level: Lini → Sub-kategori → PDP |
| **RFQ Form Terintegrasi** | Form/modal di halaman `/contact` dan PDP produk yang mengirim data langsung ke `/api/rfq` |
| **Dashboard Phase 1** | Pelacakan status saja (daftar tunggal + tab filter) |
| **Bahasa** | Bahasa Indonesia formal untuk semua label navigasi |
| **Artikel di Hub & Spoke** | Halaman Artikel (`/articles`) dan Detail Artikel (`/articles/slug`) tersedia di Hub dan setiap Spoke |
| **Portofolio di Spoke** | Setiap Spoke memiliki halaman Portofolio Proyek (`/portfolio`) dan Detail Proyek kontekstual terhadap produk spoke |

---

*Dokumen ini adalah indeks utama. Baca setiap bagian secara berurutan untuk pemahaman lengkap.*

**Catatan Arsitektur:** Satu aplikasi Next.js 16 dengan pnpm, menggunakan middleware untuk routing subdomain (Hub, Spokes, Dashboard), Prisma ORM dengan Neon Postgres, dan Auth.js v5.

