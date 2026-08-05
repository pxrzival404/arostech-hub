# Arsitektur Informasi — DBSN Digital Ecosystem
## Bagian 2: Sitemap Hub, Spoke, & Dashboard

**Proyek:** DBSN Centralized Digital Ecosystem  
**Berbasis:** PRD v3.0 + Jawaban Klarifikasi IA  

---

## 3. Sitemap Hub (sentradaya.com)

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
 subgraph ABOUT["Tentang Kami /tentang-kami"]
    direction LR
        A1["Profil Perusahaan /tentang-kami/profil"]
        A2["Visi dan Misi /tentang-kami/visi-misi"]
        A3["Tim Manajemen /tentang-kami/tim"]
  end
 subgraph CERT["Pusat Sertifikasi /sertifikasi"]
    direction LR
        C1["Sertifikat SNI /sertifikasi/sni"]
        C2["Sertifikat TKDN /sertifikasi/tkdn"]
        C3["Registrasi LKPP /sertifikasi/lkpp"]
        C4["Sertifikat ISO /sertifikasi/iso"]
  end
 subgraph PORT["Portofolio Proyek /portofolio"]
    direction LR
        PF["Filter: Pemerintah - BUMN - Swasta - EPC"]
  end
 subgraph PROD["Produk Kami /produk"]
    direction LR
        PR1["PJU -> pju.sentradaya.com"]
        PR2["Panel Surya -> solarcell.sentradaya.com"]
        PR3["Penangkal Petir -> alatpetir.sentradaya.com"]
        PR4["Baterai -> baterai.sentradaya.com"]
  end
 subgraph RFQ["Pengajuan RFQ /rfq"]
    direction LR
        RS["Pemilihan Segmen"]
  end
 subgraph CONTACT["Hubungi Kami /hubungi-kami"]
    direction LR
        CT1["Informasi Kontak"]
        CT2["Formulir Kontak Umum"]
        CT3["Peta Lokasi"]
  end
 subgraph ART["Artikel /artikel"]
    direction LR
        ART1["Hero Section"]
        ART2["Kategori Artikel"]
        ART3["Grid Daftar Artikel"]
  end
 subgraph ART_DETAIL["Detail Artikel /artikel/slug"]
    direction LR
        AD1["Judul & Meta Info"]
        AD2["Konten Artikel"]
        AD3["Artikel Terkait"]
  end
    HUB["HUB sentradaya.com"] --> HOME & ABOUT & CERT & PORT & RFQ & PROD & CONTACT & ART
    CERT --> CD["Detail Sertifikat /sertifikasi/tipe/slug\nMetadata dan Unduh"]
    RFQ --> RG["Formulir B2G: Nama Proyek, Ref DIPA,\nKuantitas, Jadwal, Jenis Pengadaan"]
    RFQ --> RB["Formulir B2B: Produk, Lingkup,\nKuantitas, Jadwal, Kontak"]
    PORT --> PD["Detail Proyek /portofolio/slug"]
    ART --> ART_DETAIL
    class H5 conversion
    class RG conversion
    class RB conversion
```

### Penjelasan Struktur Hub

| Halaman | Tujuan | Target Segmen |
|---------|--------|---------------|
| **Beranda** | Routing utama + sinyal kepercayaan awal | Semua |
| **Tentang Kami** | Profil korporat, visi misi, tim — membangun kredibilitas | B2G (primer) |
| **Pusat Sertifikasi** | Akses matriks sertifikasi berdasarkan tipe (SNI/TKDN/LKPP/ISO) | B2G (kritis) |
| **Portofolio Proyek** | Referensi proyek terstruktur dengan filter sektor | B2G + B2B |
| **Produk Kami** | Mega menu routing ke spoke sub-domain | Semua |
| **Ajukan Penawaran** | Formulir RFQ tersegmentasi (B2G/B2B) | Semua (konversi) |
| **Hubungi Kami** | Kontak, lokasi, formulir umum | Semua |
| **Artikel** | Konten edukasi dan informasi produk untuk penemuan organik | Semua |
| **Detail Artikel** | Artikel lengkap dengan konten dan referensi terkait | Semua |

---

## 4. Sitemap Spoke Representatif ([produk].sentradaya.com)

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
 subgraph SC["Katalog Produk /katalog"]
    direction LR
        S1["Pencarian"]
        S2["Filter: Lini Produk - Kategori"]
  end
 subgraph PDP["Detail Produk /katalog/lini/sub/slug"]
    direction LR
        PDP1["Spesifikasi Teknis: Tabel Key-Value"]
        PDP2["Galeri Gambar Produk"]
        PDP3["Unduh Datasheet PDF"]
        PDP4["Sertifikasi Terkait: Link ke Hub"]
        PDP5["CTA: Ajukan Penawaran dengan param produk=slug"]
        PDP6["WhatsApp CTA Kontekstual"]
  end
 subgraph SR["Ajukan Penawaran /rfq"]
    direction LR
        SRF["Formulir RFQ: Pre-filled dari Spoke dan Produk"]
  end
 subgraph SPORT["Portofolio Proyek /portofolio"]
    direction LR
        SPORT1["Hero Section"]
        SPORT2["Filter Kategori Proyek"]
        SPORT3["Grid Item Proyek"]
        SPORT4["CTA Section"]
  end
 subgraph SPORT_DETAIL["Detail Proyek /portofolio/slug"]
    direction LR
        SPD1["Hero: Judul & Info Klien"]
        SPD2["Spesifikasi Instalasi"]
        SPD3["Galeri Dokumentasi"]
  end
 subgraph ART["Artikel /artikel"]
    direction LR
        ART1["Hero Section"]
        ART2["Kategori Artikel"]
        ART3["Grid Daftar Artikel"]
  end
 subgraph ART_DETAIL["Detail Artikel /artikel/slug"]
    direction LR
        AD1["Judul & Meta Info"]
        AD2["Konten Artikel"]
        AD3["Artikel Terkait"]
  end
    SPOKE["SPOKE [produk].sentradaya.com"] --> SH & SC & SPORT & ART & SR
    SC --> PDP
    SPORT --> SPORT_DETAIL
    ART --> ART_DETAIL
    class SH4 conversion
    class PDP5 conversion
    class PDP6 conversion
    class SRF conversion
```

### 4.2 Struktur URL Spoke (3 Level)

```
[spoke].sentradaya.com/
├── /                                          → Beranda Spoke
├── /katalog                                   → Semua Lini Produk
│   ├── /katalog/[lini-produk]                 → Level 1: Lini Produk
│   │   ├── /katalog/[lini]/[sub-kategori]     → Level 2: Sub-kategori
│   │   │   └── /katalog/[lini]/[sub]/[slug]   → Level 3: Detail Produk (PDP)
├── /portofolio                                → Daftar Portofolio Proyek Spoke
│   └── /portofolio/[slug]                     → Detail Proyek Spoke
├── /artikel                                   → Daftar Artikel Spoke
│   └── /artikel/[slug]                        → Detail Artikel Spoke
├── /rfq                                       → Formulir RFQ (pre-fill)
```

**Routing Single-App:** Struktur URL di atas di-handle oleh middleware Next.js 16 untuk menentukan subdomain yang diminta dan merender komponen yang sesuai secara data-driven dari Sanity CMS.

### 4.3 Komponen PDP (Product Detail Page)

PDP adalah halaman konversi kunci. Setiap PDP harus memiliki:

| Komponen | Deskripsi | Posisi |
|----------|-----------|--------|
| **Breadcrumb** | Beranda > Katalog > Lini > Sub-kategori > Produk | Atas |
| **Judul Produk** | H1 dengan nama produk | Atas |
| **Galeri Gambar** | Carousel gambar produk | Atas (kiri di desktop) |
| **Spesifikasi Teknis** | Tabel key-value dari Sanity | Atas (kanan di desktop) |
| **Deskripsi Lengkap** | Portable text dari CMS | Tengah |
| **Unduh Datasheet** | Tombol download PDF (GA4: file_download) | Tengah |
| **Sertifikasi Terkait** | Kartu link ke TKDN/SNI di Hub | Bawah |
| **CTA Penawaran** | Tombol primary → /permintaan-penawaran?produk=slug | Bawah (sticky mobile) |
| **WhatsApp CTA** | Floating button kontekstual | Fixed kanan bawah |

---

## 5. Sitemap Dashboard (dashboard.sentradaya.com)

Dashboard adalah **surface operasional tertutup** untuk klien B2B/B2G yang telah terkualifikasi. Phase 1 hanya mencakup pelacakan status. Pada Single-App Next.js 16, routing ke `dashboard.sentradaya.com` di-handle oleh middleware yang mengidentifikasi hostname `dashboard` dan merender route group `(auth)`.

### 5.1 Struktur URL Dashboard

```
dbsn-web/app/(auth)/dashboard.sentradaya.com/
├── /login                     → Halaman login (publik)
├── /lupa-kata-sandi           → Reset password (publik)
├── /konfirmasi-reset           → Konfirmasi reset (publik)
├── /beranda                   → Overview dashboard (auth)
├── /pelacakan                 → Daftar pelacakan + filter tab (auth)
│   └── /[id]        → Detail status proyek/pesanan (auth, row-level)
├── /profil                    → Profil dan ubah kata sandi (auth)
└── /keluar                    → Logout action
```

```mermaid
---
config:
  layout: dagre
---
flowchart TD
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

    DASH["dashboard.sentradaya.com\nPortal Layanan Pelacakan"]
    DASH --> PUB["Halaman Publik: Tidak Terautentikasi"]
    DASH --> AUTH["Halaman Terautentikasi"]
    PUB --> LOGIN["Halaman Login /login"]
    PUB --> RESET["Lupa Kata Sandi /lupa-kata-sandi"]
    PUB --> CONFIRM["Konfirmasi Reset /konfirmasi-reset"]
    LOGIN --> AUTHCHECK{"Autentikasi"}
    AUTHCHECK -->|"Berhasil"| OVER["Beranda Dashboard /beranda"]
    AUTHCHECK -->|"Gagal: Throttle"| LOGIN
    AUTH --> OVER
    AUTH --> TRACK["Pelacakan /pelacakan"]
    AUTH --> PROF["Profil Akun /profil"]
    AUTH --> LOGOUT["Keluar /keluar"]
    OVER --> OV1["Ringkasan Status: Jumlah Proyek Aktif"]
    OVER --> OV2["Notifikasi: Update Terbaru"]
    OVER --> OV3["Aksi Cepat: Lihat Pelacakan"]
    TRACK --> TAB1["Tab: Semua"]
    TRACK --> TAB2["Tab: Proyek"]
    TRACK --> TAB3["Tab: Pesanan"]
    TAB1 --> DET["Detail Status /pelacakan/id"]
    TAB2 --> DET
    TAB3 --> DET
    DET --> DET1["Timeline Status: Riwayat Perubahan"]
    DET --> DET2["Status Terkini: Badge Status"]
    DET --> DET3["Informasi Proyek atau Pesanan"]
    PROF --> PRF1["Informasi Akun"]
    PROF --> PRF2["Ubah Kata Sandi"]
```

### 5.1 Struktur URL Dashboard

```
dashboard.sentradaya.com/
├── /login                     → Halaman login (publik)
├── /lupa-kata-sandi           → Reset password (publik)
├── /beranda                   → Overview dashboard (auth)
├── /pelacakan                 → Daftar pelacakan + filter tab (auth)
│   └── /pelacakan/[id]        → Detail status proyek/pesanan (auth, row-level)
├── /profil                    → Profil dan ubah kata sandi (auth)
├── /keluar                    → Logout action
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


> **Phase 2 (ditunda):** Unduh dokumen (faktur, kontrak, surat jalan) dari dalam dashboard. Status di-retrieve dari tabel Neon Postgres melalui Prisma ORM.

**Catatan Arsitektur Single-App:** Single Next.js 16 app dengan middleware-based subdomain routing, Prisma ORM dengan Neon Postgres, dan Auth.js v5. Lihat [architecture.md](../architecture/architecture.md) untuk detail lengkap.

---

> **Dokumen sebelumnya:** [Bagian 1 — Strategi & Navigasi](./ia-strategy-navigation.md)  
> **Dokumen selanjutnya:** [Bagian 3 — Alur Pengguna Inti](./ia-user-flows.md)

**Catatan Arsitektur Single-App:** Single Next.js 16 app dengan middleware-based subdomain routing, Prisma ORM dengan Neon Postgres, dan Auth.js v5. Lihat [architecture.md](../architecture/architecture.md) untuk detail lengkap.
