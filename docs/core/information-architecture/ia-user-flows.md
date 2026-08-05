# Arsitektur Informasi — DBSN Digital Ecosystem
## Bagian 3: Alur Pengguna Inti (Core User Flows)

**Proyek:** DBSN Centralized Digital Ecosystem  
**Berbasis:** PRD v3.0 + Jawaban Klarifikasi IA  

---

## 6. Alur Pengguna Inti

### 6.1 Alur B2G — Pejabat Pengadaan Pemerintah

**Persona:** PPK / Staf Pengadaan / Pejabat BUMN  
**Tujuan:** Validasi kepatuhan vendor (SNI/TKDN/LKPP), verifikasi referensi proyek, kemudian ajukan RFQ formal.  
**Entry Point Utama:** Hub (sentradaya.com) via pencarian langsung atau referensi LKPP.

```mermaid
---
config:
  layout: elk
---
flowchart TD
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

    START(["Pejabat Pengadaan Pemerintah"])
    START --> ENTRY["Masuk: sentradaya.com Beranda Hub"]
    ENTRY --> INTENT{"Tujuan Utama?"}
    INTENT -->|"Validasi Legalitas"| CERT["Pusat Sertifikasi /sertifikasi"]
    INTENT -->|"Lihat Referensi Proyek"| PORT["Portofolio Proyek /portofolio"]
    INTENT -->|"Cari Info Produk"| SPOKE["Navigasi ke Spoke Produk"]
    CERT --> CTYPE["Pilih Tipe: SNI / TKDN / LKPP / ISO"]
    CTYPE --> CVIEW["Lihat Detail Sertifikat"]
    CVIEW --> CDL["Unduh Dokumen Sertifikat\nGA4: file_download"]
    PORT --> PFILT["Filter: Pemerintah / BUMN"]
    PFILT --> PVIEW["Lihat Detail Proyek Referensi"]
    SPOKE --> SCAT["Katalog Produk di Spoke"]
    SCAT --> SPDP["Detail Produk - PDP"]
    SPDP --> SCERT["Verifikasi TKDN/SNI Terkait Produk"]
    CDL --> READY{"Siap Mengajukan Penawaran?"}
    PVIEW --> READY
    SCERT --> READY
    READY -->|"Ya"| RFQPAGE["Halaman Ajukan Penawaran\n/permintaan-penawaran"]
    READY -->|"Belum"| BROWSE["Lanjut Telusuri - Kembali ke Hub"]
    BROWSE --> INTENT
    RFQPAGE --> SEGMENT["Pilih Segmen: Instansi Pemerintah"]
    SEGMENT --> B2GFORM["Isi Formulir B2G"]
    B2GFORM --> SUBMIT{"Kirim Formulir"}
    SUBMIT -->|"Berhasil"| CONFIRM["Konfirmasi: Email ACK\n+ Telegram Alert ke Sales"]
    SUBMIT -->|"Gagal"| FALLBACK["Fallback: WhatsApp Pre-filled"]
    CONFIRM --> QUALIFY{"Terkualifikasi oleh Sales?"}
    QUALIFY -->|"Ya"| PROVISION["Akun Dashboard Dibuat\ndi dashboard.sentradaya.com"]
    QUALIFY -->|"Belum"| FOLLOWUP["Follow-up Sales Standar"]
    PROVISION --> TRACKING["Akses Pelacakan Status Proyek"]
    class START entry
    class B2GFORM conversion
    class SUBMIT conversion
    class CONFIRM conversion
    class FALLBACK conversion
    class PROVISION conversion
```

**Langkah-langkah Kunci Alur B2G:** (Single-App dengan middleware routing)

| Langkah | Halaman | Aksi Pengguna | GA4 Event |
|---------|---------|---------------|-----------|
| 1 | Hub Beranda | Lihat Trust Badge Bar, pilih tujuan | - |
| 2a | Pusat Sertifikasi | Telusuri per tipe sertifikasi | `certification_view` |
| 2b | Portofolio | Filter proyek per sektor pemerintah | `portfolio_view` |
| 2c | Spoke PDP | Verifikasi TKDN/SNI di halaman produk | `hub_to_spoke_click` |
| 3 | Detail Sertifikat | Unduh dokumen sertifikat | `file_download` |
| 4 | Ajukan Penawaran | Pilih segmen B2G, isi formulir | `rfq_start` |
| 5 | Formulir B2G | Kirim formulir RFQ | `rfq_submit_attempt` → `rfq_submit_success` |
| 6 | Konfirmasi | Terima email acknowledgment | - |
| 7 | Dashboard | Login dan lihat status proyek | `dashboard_login_success` → `tracking_status_view` |

---

### 6.2 Alur B2B — Pembeli Teknis Sektor Swasta

**Persona:** Procurement Manager / EPC Engineer / Facility Manager  
**Tujuan:** Riset spesifikasi produk, unduh datasheet, kemudian ajukan inquiry terstruktur atau hubungi via WhatsApp.  
**Entry Point Utama:** Spoke langsung via SEO organik, atau Hub via kampanye/direct.

```mermaid
---
config:
  layout: elk
---
flowchart TD
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

    START(["Pembeli B2B Sektor Swasta"])
    START --> ENTRY{"Titik Masuk?"}
    ENTRY -->|"SEO / Organik"| SPOKE["Masuk Langsung ke Spoke Produk"]
    ENTRY -->|"Direct / Kampanye"| HUB["Masuk: sentradaya.com Hub"]
    HUB --> HUBCTA["Pilih Produk via Mega Menu atau Grid"]
    HUBCTA --> SPOKE
    SPOKE --> SPHOME["Beranda Spoke: Produk Unggulan"]
    SPHOME --> CATALOG["Katalog Produk /katalog"]
    CATALOG --> LINE["Pilih Lini Produk"]
    LINE --> SUBCAT["Pilih Sub-kategori"]
    SUBCAT --> PDP["Detail Produk - PDP"]
    PDP --> ACTION{"Aksi Konversi?"}
    ACTION -->|"Ajukan Penawaran"| RFQPAGE["Halaman RFQ /permintaan-penawaran\ndengan param produk=slug"]
    ACTION -->|"Kontak Cepat"| WHATSAPP["WhatsApp Click-to-Chat\nGA4: whatsapp_click"]
    ACTION -->|"Unduh Dokumen"| DOWNLOAD["Unduh Datasheet PDF\nGA4: file_download"]
    ACTION -->|"Baca Konten"| ARTIKEL["Artikel Spoke /artikel\nGA4: article_view"]
    ARTIKEL --> ARTDET["Detail Artikel\nKonten Edukasi & Produk Terkait"]
    ARTDET --> REENGAGE2["Re-engagement CTA:\nAjukan Penawaran atau WhatsApp"]
    REENGAGE2 --> RFQPAGE
    DOWNLOAD --> REENGAGE["Re-engagement CTA:\nAjukan Penawaran atau WhatsApp"]
    REENGAGE --> RFQPAGE
    RFQPAGE --> SEGMENT["Pilih Segmen: Perusahaan Swasta"]
    SEGMENT --> B2BFORM["Isi Formulir B2B: Produk pre-filled"]
    B2BFORM --> SUBMIT{"Kirim Formulir"}
    SUBMIT -->|"Berhasil"| CONFIRM["Konfirmasi: Email ACK + Telegram Alert"]
    SUBMIT -->|"Gagal"| FALLBACK["Fallback: WhatsApp Pre-filled"]
    CONFIRM --> QUALIFY{"Terkualifikasi?"}
    QUALIFY -->|"Ya"| PROVISION["Akun Dashboard Dibuat"]
    QUALIFY -->|"Belum"| FOLLOWUP["Follow-up Sales Standar"]
    PROVISION --> TRACKING["Akses Pelacakan Status Pesanan"]
    class START entry
    class WHATSAPP conversion
    class B2BFORM conversion
    class SUBMIT conversion
    class CONFIRM conversion
    class FALLBACK conversion
    class PROVISION conversion
```

**Langkah-langkah Kunci Alur B2B:**

| Langkah | Halaman | Aksi Pengguna | GA4 Event |
|---------|---------|---------------|-----------|
| 1 | Spoke Beranda atau Hub | Masuk via SEO langsung ke spoke, atau via Hub mega menu | `hub_to_spoke_click` (jika via Hub) |
| 2 | Katalog Produk | Telusuri lini produk dan sub-kategori | - |
| 3 | Detail Produk (PDP) | Baca spesifikasi, lihat gambar | - |
| 4a | PDP | Unduh datasheet | `file_download` |
| 4b | PDP | Klik WhatsApp | `whatsapp_click` |
| 4c | Ajukan Penawaran | Klik CTA, formulir pre-filled | `rfq_start` |
| 4d | Artikel Spoke | Baca konten edukasi produk | `article_view` |
| 5 | Detail Artikel | Baca artikel lengkap, klik CTA re-engagement | `article_cta_click` |
| 6 | Formulir B2B | Kirim formulir | `rfq_submit_attempt` → `rfq_submit_success` |
| 7 | Konfirmasi | Terima email acknowledgment | - |
| 8 | Dashboard | Login dan lihat status pesanan | `dashboard_login_success` → `tracking_status_view` |

---

### 6.3 Perbedaan Kunci Antar Alur

| Aspek | Alur B2G | Alur B2B |
|-------|----------|----------|
| **Entry point** | Selalu via Hub | Sering langsung ke Spoke via SEO |
| **Langkah pertama** | Validasi sertifikasi/legalitas | Riset spesifikasi produk |
| **Jumlah touchpoint sebelum RFQ** | 3-5 (sertifikasi + portofolio + produk) | 2-4 (katalog + PDP + artikel opsional) |
| **Field formulir khusus** | Nama Proyek, Ref DIPA, Jenis Pengadaan | Lingkup proyek, timeline |
| **Toleransi WhatsApp** | Rendah (butuh jalur formal) | Tinggi (channel paralel) |
| **Tipe pelacakan** | Proyek (multi-milestone) | Pesanan (status delivery) |

---

### 6.4 Alur Fallback RFQ (Kedua Segmen)

Berlaku identik untuk B2G dan B2B ketika submission API gagal:

```mermaid
---
config:
  layout: elk
---
flowchart TD
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

    SUBMIT["Pengguna Klik Kirim"]
    SUBMIT --> API{"API /api/rfq"}
    API -->|"200 OK"| SUCCESS["Konfirmasi + Email ACK + Telegram"]
    API -->|"422 Validation"| INLINE["Pesan Error Inline\nData Tidak Hilang"]
    API -->|"500 / Timeout"| FAIL["Fallback UI Aktif"]
    INLINE --> SUBMIT
    FAIL --> SERIALIZE["Data Formulir Di-serialize ke URL Params"]
    SERIALIZE --> WABUILD["Bangun URL wa.me Pre-filled"]
    WABUILD --> WAUI["Tampilkan CTA WhatsApp Full-Width"]
    WAUI --> WACLICK["Pengguna Tap WhatsApp\nGA4: whatsapp_click fallback"]
    FAIL --> TGALERT["Telegram Alert:\nSubmission Gagal ke Tim Sales"]
    FAIL --> GA4FAIL["GA4: rfq_submit_failure\ndengan fallback_triggered=true"]
    class SUBMIT conversion
    class SUCCESS conversion
    class FAIL conversion
    class WAUI conversion
    class WACLICK conversion
    class TGALERT conversion
```

---

## Ringkasan Dokumen IA

| Bagian | Dokumen | Isi |
|--------|---------|-----|
| **1** | [ia-strategy-navigation.md](./ia-strategy-navigation.md) | Strategi IA, prinsip desain, sistem navigasi global |
| **2** | [ia-sitemaps.md](./ia-sitemaps.md) | Sitemap Hub, Spoke template, Dashboard |
| **3** | [ia-user-flows.md](./ia-user-flows.md) | Alur B2G, alur B2B, alur fallback |

---

*Dokumen ini siap digunakan oleh tim UI/UX untuk wireframing dan prototyping.*
