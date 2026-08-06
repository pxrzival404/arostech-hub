# Arsitektur Informasi — DBSN Digital Ecosystem
## Bagian 1: Strategi IA & Sistem Navigasi Global

**Proyek:** DBSN Centralized Digital Ecosystem — dayaberkah.id  
**Versi:** 1.1  
**Tanggal:** 2026-04-24 (Updated 2026-08-06)  
**Berbasis:** PRD v3.1  
**Status:** Final — Diselaraskan dengan Implementasi Live

---

## 1. Strategi & Prinsip IA

### 1.1 Model Hub-and-Spoke

Arsitektur Informasi ini dibangun di atas model **Hub-and-Spoke** yang melayani dua segmen pengguna utama dengan kebutuhan yang berbeda secara fundamental:

| Aspek | B2G (Pemerintah) | B2B (Swasta) |
|-------|-------------------|--------------| 
| **Mindset** | Trust-first (Validasi Kepatuhan) | Efficiency-first (Riset Spesifikasi) |
| **Prioritas IA** | Sertifikasi & Portofolio di navigasi utama | Akses langsung ke Spoke & PDP |
| **Titik Masuk Utama** | Hub (dayaberkah.id) | Spoke langsung via SEO/kampanye |
| **Konversi** | Formulir RFQ B2G (formal, terstruktur) | Formulir RFQ B2B atau WhatsApp |
| **Pasca-RFQ** | Dashboard Pelacakan Proyek | Dashboard Pelacakan Pesanan |

### 1.2 Prinsip Desain IA

1. **Prominensi Sinyal Kepercayaan** — Sertifikasi dan Portofolio adalah navigasi utama (bukan sub-halaman tersembunyi)
2. **Akses Sertifikasi Matriks** — Diorganisir berdasarkan *tipe* di Hub (untuk validasi B2G), berdasarkan *produk* di Spoke (untuk verifikasi kontekstual)
3. **Template Spoke Skalabel** — Setiap spoke mengikuti struktur IA identik; diferensiasi hanya melalui konten CMS
4. **Kedalaman Produk 3 Level** — Beranda Spoke → Lini Produk → Sub-kategori → Detail Produk (PDP)
5. **Formulir RFQ Terintegrasi** — Form/modal terintegrasi di halaman `/contact` dan PDP produk yang mengirim submisi langsung ke `/api/rfq`
6. **Pelabelan Bahasa Indonesia** — Semua label navigasi menggunakan Bahasa Indonesia formal dan profesional
7. **WhatsApp Non-Blocking** — CTA floating tersedia di semua halaman, tidak menghalangi formulir RFQ di mobile

---

## 2. Sistem Navigasi Global

### 2.1 Header — Hub (dayaberkah.id)

```mermaid
---
config:
  layout: dagre
  theme: neutral
---
flowchart LR
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

 subgraph HEADER_HUB["Header Navigasi: dayaberkah.id (Hub)"]
        H_LOGO["[Logo] DBSN"]
        H_NAV1["Beranda"]
        H_NAV2["Tentang Kami ▼"]
        H_NAV3["Sertifikasi"]
        H_NAV4["Portofolio"]
        H_NAV5["Produk Kami ▼"]
        H_NAV6["Hubungi Kami"]
        H_CTA["[Tombol] Ajukan Penawaran"]
 end
    H_LOGO --- H_NAV1 --- H_NAV2 --- H_NAV3 --- H_NAV4 --- H_NAV5 --- H_NAV6 --- H_CTA
    class H_CTA conversion
```

| Item Navigasi | Tipe | Perilaku |
|---------------|------|----------|
| **Beranda** | Link | → `/` |
| **Tentang Kami** | Dropdown | → Profil Perusahaan (`/about`), Visi & Misi, Tim Manajemen |
| **Sertifikasi** | Link | → `/certifications` (Pusat Sertifikasi & Legalitas) |
| **Portofolio** | Link | → `/portfolio` |
| **Produk Kami** | Mega Menu | Grid kartu spoke: PJU, Panel Surya, Penangkal Petir, Baterai |
| **Hubungi Kami** | Link | → `/contact` |
| **Ajukan Penawaran** | CTA Button (Primary) | → Form RFQ (`/contact` atau Modal RFQ) |

**Mobile:** Hamburger menu → drawer kiri dengan item yang sama, CTA sticky di bawah drawer.

---

### 2.2 Header — Spoke ([produk].dayaberkah.id)

```mermaid
---
config:
  layout: dagre
  theme: neutral
---
flowchart LR
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

 subgraph HEADER_SPOKE["Header Navigasi: pju.dayaberkah.id (Spoke)"]
        S_LOGO["[Logo DBSN] PJU - Penerangan Jalan Umum"]
        S_BACK["⬅ dayaberkah.id"]
        S_NAV1["Beranda"]
        S_NAV2["Katalog ▼"]
        S_NAV3["Portofolio"]
        S_NAV4["Artikel"]
        S_CTA["[Tombol] Ajukan Penawaran"]
 end
    S_LOGO --- S_BACK --- S_NAV1 --- S_NAV2 --- S_NAV3 --- S_NAV4 --- S_CTA
    class S_CTA conversion
```

| Item Navigasi | Tipe | Perilaku |
|---------------|------|----------|
| **← dayaberkah.id** | Back Link | → Hub root domain (navigasi cross-domain) |
| **Beranda** | Link | → `/` (beranda spoke) |
| **Katalog Produk** | Dropdown | → Daftar Lini Produk dengan sub-kategori |
| **Portofolio** | Link | → `/portfolio` (portofolio proyek spoke) |
| **Artikel** | Link | → `/articles` (artikel dan konten spoke) |
| **Ajukan Penawaran** | CTA Button (Primary) | → Form RFQ (`/contact` atau Modal RFQ) |

**Mobile:** Hamburger menu. Back-link ke Hub selalu visible di atas.

---

### 2.3 Header — Dashboard (dashboard.dayaberkah.id)

```mermaid
---
config:
  layout: dagre
  theme: neutral
---
flowchart LR
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

 subgraph HEADER_DASHBOARD["Header Navigasi: dashboard.dayaberkah.id (Bagian 2.3)"]
        DH_LOGO["[Logo DBSN] Layanan Pelacakan"]
        DH_NAV1["Beranda"]
        DH_NAV2["Pelacakan"]
        DH_NAV3["Profil Akun"]
        DH_USER["[Nama User]"]
        DH_LOGOUT["[Aksi] Keluar"]
 end
    DH_LOGO --- DH_NAV1 --- DH_NAV2 --- DH_NAV3 --- DH_USER --- DH_LOGOUT
```

| Item Navigasi | Tipe | Perilaku |
|---------------|------|----------|
| **Beranda** | Link | → `/` (overview dashboard) |
| **Pelacakan** | Link | → `/dashboard` (daftar proyek/pesanan) |
| **Profil Akun** | Link | → `/profile` |
| **Keluar** | Action | Logout → redirect ke halaman login |

> Dashboard **tidak** memiliki navigasi ke Hub atau Spoke. Ini adalah surface operasional tertutup, bukan marketing.

---

### 2.4 Footer Global (Seluruh Platform)

Footer digunakan secara konsisten di Hub dan semua Spoke. Dashboard menggunakan versi minimal.

| Kolom | Konten |
|-------|--------|
| **Tentang DBSN** | Deskripsi singkat perusahaan, logo |
| **Produk Kami** | Link ke semua spoke: PJU, Panel Surya, Penangkal Petir, Baterai |
| **Sertifikasi** | Link langsung: SNI, TKDN, LKPP, ISO |
| **Hubungi Kami** | Alamat, telepon, email, jam operasional |
| **Ikuti Kami** | Ikon media sosial (SVG) |
| **Legal** | Kebijakan Privasi - Syarat & Ketentuan |

---

### 2.5 Elemen Persisten

| Elemen | Lokasi | Perilaku |
|--------|--------|----------|
| **WhatsApp Floating CTA** | Kanan bawah, semua halaman Hub & Spoke | Collapse/reposition saat formulir RFQ aktif di mobile. GA4: whatsapp_click |
| **Breadcrumb** | Di bawah header, semua halaman kecuali Beranda | Format: Beranda > Katalog > Lini > Sub-kategori > Produk |
| **Trust Badge Bar** | Beranda Hub & Beranda Spoke | Strip horizontal: logo SNI, TKDN, LKPP, ISO |
| **CTA Banner Akhir** | Sebelum footer, semua halaman konten | "Butuh penawaran? Ajukan sekarang" → Form RFQ (`/contact` atau Modal RFQ) |

---

> **Dokumen selanjutnya:** [Bagian 2 — Sitemap Hub, Spoke, & Dashboard](./ia-sitemaps.md) dan [Bagian 3 — Alur Pengguna Inti](./ia-user-flows.md)

