# Arsitektur Informasi — DBSN Digital Ecosystem
## Bagian 2: Sitemap Hub, Spoke, & Dashboard

**Proyek:** DBSN Centralized Digital Ecosystem — dayaberkah.id  
**Berbasis:** PRD v3.1  
**Tanggal Update:** 2026-08-06  

---

## 3. Sitemap Hub (dayaberkah.id)

Hub berfungsi sebagai **Pusat Kepercayaan Korporat** — tempat utama untuk validasi legalitas, portofolio, dan routing ke spoke produk.

```mermaid
---
config:
  layout: dagre
---
flowchart TB
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

 subgraph HOME["Beranda /"]
    direction LR
        H1["Hero + Routing CTA"]
        H2["Trust Badge Bar: SNI TKDN LKPP ISO"]
        H3["Grid Navigasi ke Spoke"]
        H4["Highlight Portofolio Unggulan"]
        H5["CTA Akhir: Ajukan Penawaran"]
  end
 subgraph ABOUT["Tentang Kami /about"]
    direction LR
        A1["Profil Perusahaan"]
        A2["Visi dan Misi"]
        A3["Tim Manajemen"]
  end
 subgraph CERT["Pusat Sertifikasi /certifications"]
    direction LR
        C1["Sertifikat SNI"]
        C2["Sertifikat TKDN"]
        C3["Registrasi LKPP"]
        C4["Sertifikat ISO"]
  end
 subgraph PORT["Portofolio Proyek /portfolio"]
    direction LR
        PF["Filter: Pemerintah - BUMN - Swasta - EPC"]
  end
 subgraph PROD["Produk Kami /products"]
    direction LR
        PR1["PJU -> pju.dayaberkah.id"]
        PR2["Panel Surya -> solarcell.dayaberkah.id"]
        PR3["Penangkal Petir -> alatpetir.dayaberkah.id"]
        PR4["Baterai -> baterai.dayaberkah.id"]
  end
 subgraph CONTACT["Hubungi Kami /contact"]
    direction LR
        CT1["Informasi Kontak"]
        CT2["Formulir RFQ B2G / B2B (Posting ke /api/rfq)"]
        CT3["Peta Lokasi"]
  end
 subgraph ART["Artikel /articles"]
    direction LR
        ART1["Hero Section"]
        ART2["Kategori Artikel"]
        ART3["Grid Daftar Artikel"]
  end
 subgraph ART_DETAIL["Detail Artikel /articles/slug"]
    direction LR
        AD1["Judul & Meta Info"]
        AD2["Konten Artikel"]
        AD3["Artikel Terkait"]
  end
    HUB["HUB dayaberkah.id"] --> HOME & ABOUT & CERT & PORT & PROD & CONTACT & ART
    CERT --> CD["Detail Sertifikat /certifications/slug\nMetadata dan Unduh"]
    CONTACT --> RG["Formulir B2G: Nama Proyek, Ref DIPA,\nKuantitas, Jadwal, Jenis Pengadaan"]
    CONTACT --> RB["Formulir B2B: Produk, Lingkup,\nKuantitas, Jadwal, Kontak"]
    PORT --> PD["Detail Proyek /portfolio/slug"]
    ART --> ART_DETAIL
    class H5 conversion
    class RG conversion
    class RB conversion
```

### Penjelasan Struktur Hub

| Halaman | Tujuan | Target Segmen |
|---------|--------|---------------|
| **Beranda** | Routing utama + sinyal kepercayaan awal | Semua |
| **Tentang Kami** (`/about`) | Profil korporat, visi misi, tim — membangun kredibilitas | B2G (primer) |
| **Pusat Sertifikasi** (`/certifications`) | Akses matriks sertifikasi berdasarkan tipe (SNI/TKDN/LKPP/ISO) | B2G (kritis) |
| **Portofolio Proyek** (`/portfolio`) | Referensi proyek terstruktur dengan filter sektor | B2G + B2B |
| **Produk Kami** (`/products`) | Showcase produk & mega menu routing ke spoke sub-domain | Semua |
| **Hubungi Kami & RFQ** (`/contact`) | Kontak, lokasi, serta Formulir RFQ tersegmentasi (B2G/B2B) | Semua (konversi) |
| **Artikel** (`/articles`) | Konten edukasi dan informasi produk untuk penemuan organik | Semua |
| **Detail Artikel** (`/articles/[slug]`) | Artikel lengkap dengan konten dan referensi terkait | Semua |

---

## 4. Sitemap Spoke Representatif ([produk].dayaberkah.id)

Template spoke ini berlaku untuk **semua klaster produk** (PJU, Panel Surya, Penangkal Petir, Baterai, dan spoke masa depan). Contoh menggunakan PJU.

### 4.1 Hirarki Halaman Spoke

```mermaid
---
config:
  layout: dagre
---
flowchart TB
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

 subgraph SH["Beranda Spoke /"]
    direction LR
        SH1["Hero: Tagline Produk + CTA Utama"]
        SH2["Produk Unggulan: 3-6 Produk Pilihan"]
        SH3["Badge Sertifikasi: SNI dan TKDN Terkait"]
        SH4["CTA Akhir: Ajukan Penawaran"]
  end
 subgraph SC["Katalog Produk /products"]
    direction LR
        S1["Pencarian"]
        S2["Filter: Lini Produk - Kategori"]
  end
 subgraph PDP["Detail Produk /products/[slug]"]
    direction LR
        PDP1["Spesifikasi Teknis: Tabel Key-Value"]
        PDP2["Galeri Gambar Produk"]
        PDP3["Unduh Datasheet PDF"]
        PDP4["Sertifikasi Terkait: Link ke Hub"]
        PDP5["CTA: Form/Modal RFQ"]
        PDP6["WhatsApp CTA Kontekstual"]
  end
 subgraph SPORT["Portofolio Proyek /portfolio"]
    direction LR
        SPORT1["Hero Section"]
        SPORT2["Filter Kategori Proyek"]
        SPORT3["Grid Item Proyek"]
        SPORT4["CTA Section"]
  end
 subgraph SPORT_DETAIL["Detail Proyek /portfolio/[slug]"]
    direction LR
        SPD1["Hero: Judul & Info Klien"]
        SPD2["Spesifikasi Instalasi"]
        SPD3["Galeri Dokumentasi"]
  end
 subgraph ART["Artikel /articles"]
    direction LR
        ART1["Hero Section"]
        ART2["Kategori Artikel"]
        ART3["Grid Daftar Artikel"]
  end
 subgraph ART_DETAIL["Detail Artikel /articles/[slug]"]
    direction LR
        AD1["Judul & Meta Info"]
        AD2["Konten Artikel"]
        AD3["Artikel Terkait"]
  end
    SPOKE["SPOKE [produk].dayaberkah.id"] --> SH & SC & SPORT & ART
    SC --> PDP
    SPORT --> SPORT_DETAIL
    ART --> ART_DETAIL
    class SH4 conversion
    class PDP5 conversion
    class PDP6 conversion
```

### 4.2 Struktur URL Spoke

```
[spoke].dayaberkah.id/
├── /                                          → Beranda Spoke
├── /products                                  → Katalog & Listing Produk Spoke
│   └── /products/[slug]                       → Detail Produk (PDP)
├── /portfolio                                 → Daftar Portofolio Proyek Spoke
│   └── /portfolio/[slug]                      → Detail Proyek Spoke
├── /articles                                  → Daftar Artikel Spoke
│   └── /articles/[slug]                       → Detail Artikel Spoke
```

**Routing Single-App:** Struktur URL di atas di-handle oleh middleware Next.js 16 untuk menentukan subdomain yang diminta dan merender komponen yang sesuai secara data-driven dari Sanity CMS.

### 4.3 Komponen PDP (Product Detail Page)

PDP adalah halaman konversi kunci. Setiap PDP memiliki:

| Komponen | Deskripsi | Posisi |
|----------|-----------|--------|
| **Breadcrumb** | Beranda > Produk > Detail Produk | Atas |
| **Judul Produk** | H1 dengan nama produk | Atas |
| **Galeri Gambar** | Carousel gambar produk | Atas (kiri di desktop) |
| **Spesifikasi Teknis** | Tabel key-value dari Sanity | Atas (kanan di desktop) |
| **Deskripsi Lengkap** | Portable text dari CMS | Tengah |
| **Unduh Datasheet** | Tombol download PDF (GA4: file_download) | Tengah |
| **Sertifikasi Terkait** | Kartu link ke TKDN/SNI di Hub | Bawah |
| **CTA Penawaran** | Tombol primary → Modal/Form RFQ terintegrasi | Bawah (sticky mobile) |
| **WhatsApp CTA** | Floating button kontekstual | Fixed kanan bawah |

---

## 5. Sitemap Dashboard (dashboard.dayaberkah.id)

Dashboard adalah **surface operasional tertutup** untuk klien B2B/B2G yang telah terkualifikasi. Phase 1 mencakup pelacakan status. Pada Single-App Next.js 16, routing ke `dashboard.dayaberkah.id` di-handle oleh middleware yang mengidentifikasi hostname `dashboard` dan merender route group `dashboard`.

### 5.1 Struktur URL Dashboard

```
dashboard.dayaberkah.id/
├── /login                     → Halaman login (publik)
├── /lupa-kata-sandi           → Reset password (publik)
├── /konfirmasi-reset           → Konfirmasi reset (publik)
├── /                           → Overview dashboard (auth)
├── /dashboard                 → Daftar pelacakan + filter tab (auth)
│   └── /[id]                  → Detail status proyek/pesanan (auth, row-level)
├── /profile                   → Profil dan ubah kata sandi (auth)
└── /logout                    → Logout action
```

```mermaid
---
config:
  layout: dagre
---
flowchart TD
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

    DASH["dashboard.dayaberkah.id\nPortal Layanan Pelacakan"]
    DASH --> PUB["Halaman Publik: Tidak Terautentikasi"]
    DASH --> AUTH["Halaman Terautentikasi"]
    PUB --> LOGIN["Halaman Login /login"]
    PUB --> RESET["Lupa Kata Sandi /lupa-kata-sandi"]
    PUB --> CONFIRM["Konfirmasi Reset /konfirmasi-reset"]
    LOGIN --> AUTHCHECK{"Autentikasi"}
    AUTHCHECK -->|"Berhasil"| OVER["Overview Dashboard /"]
    AUTHCHECK -->|"Gagal: Throttle"| LOGIN
    AUTH --> OVER
    AUTH --> TRACK["Pelacakan /dashboard"]
    AUTH --> PROF["Profil Akun /profile"]
    AUTH --> LOGOUT["Keluar /logout"]
    OVER --> OV1["Ringkasan Status: Jumlah Proyek Aktif"]
    OVER --> OV2["Notifikasi: Update Terbaru"]
    OVER --> OV3["Aksi Cepat: Lihat Pelacakan"]
    TRACK --> TAB1["Tab: Semua"]
    TRACK --> TAB2["Tab: Proyek"]
    TRACK --> TAB3["Tab: Pesanan"]
    TAB1 --> DET["Detail Status /dashboard/[id]"]
    TAB2 --> DET
    TAB3 --> DET
    DET --> DET1["Timeline Status: Riwayat Perubahan"]
    DET --> DET2["Status Terkini: Badge Status"]
    DET --> DET3["Informasi Proyek atau Pesanan"]
    PROF --> PRF1["Informasi Akun"]
    PROF --> PRF2["Ubah Kata Sandi"]
```

### 5.2 Status Pelacakan (Phase 1)

| Status | Deskripsi | Warna Badge |
|--------|-----------|-------------|
| **Diterima** | RFQ/pesanan diterima | Abu-abu |
| **Diproses** | Sedang diproses tim internal | Biru |
| **Produksi** | Dalam tahap produksi | Kuning |
| **Pengiriman** | Dalam pengiriman | Oranye |
| **Selesai** | Proyek/pesanan selesai | Hijau |
| **Ditunda** | Ditunda sementara | Merah |

---

> **Dokumen sebelumnya:** [Bagian 1 — Strategi & Navigasi](./ia-strategy-navigation.md)  
> **Dokumen selanjutnya:** [Bagian 3 — Alur Pengguna Inti](./ia-user-flows.md)
