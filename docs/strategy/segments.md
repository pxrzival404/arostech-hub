---
id: SEG-DBSN-001
title: DBSN Customer Segment & Executive Companion PRD
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_strategy"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L104-L186"
  vision: "file:///d:/dev/arostech-hub/docs/strategy/vision.md#L1-L64"
  roadmap: "file:///d:/dev/arostech-hub/docs/strategy/roadmap.md#L1-L95"
---

# Dokumen Persyaratan Produk (PRD)

> **TL;DR**: Authoritative specification and architectural reference for Dokumen Persyaratan Produk (PRD) within the DBSN platform (docs/strategy/segments.md).

## Ekosistem Digital Terpadu DBSN — Pendekatan Berbasis Segmen Pelanggan

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Cascade`  
> **Executive Companion Notice:** This document serves as the executive & segment-focused companion to the technical [**PRD v4.0.0**](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L15-L186).

**Disiapkan untuk:** Manajemen Eksekutif DBSN (CEO, CTO, COO)  
**Tanggal:** 11 Mei 2026 (Updated August 2026 for Greenfield Baseline)  
**Versi:** C-Level Executive Edition v4.0  
**Status:** Final — Siap untuk Keputusan Eksekutif  

---

## DAFTAR ISI

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Segmen A: Strategi Pengadaan Pemerintah (B2G)](#2-segmen-a-strategi-pengadaan-pemerintah-b2g)
3. [Segmen B: Strategi Sektor Swasta (B2B)](#3-segmen-b-strategi-sektor-swasta-b2b)
4. [Fondasi Teknologi Terpadu](#4-fondasi-teknologi-terpadu)
5. [Peta Jalan Implementasi](#5-peta-jalan-implementasi)
6. [Ikhtisar Keuangan](#6-ikhtisar-keuangan)
7. [Graphify Anchoring & References](#7-graphify-anchoring-references)

---

## 1. RINGKASAN EKSEKUTIF

### 1.1 Visi: Satu DBSN, Keberadaan Digital Terpadu

PT Daya Berkah Sentosa Nusantara (DBSN) mengonsolidasikan semua aset digital ke dalam **ekosistem digital terpusat** berbasis arsitektur *Hub-and-Spoke* (`dayaberkah.id`) yang melayani dua segmen pelanggan utama: Pejabat Pengadaan Pemerintah (B2G) dan Pembeli Teknis Sektor Swasta (B2B).

### 1.2 Strategi Dua Jalur Pelanggan

| Dimensi | Segmen B2G (Pemerintah) | Segmen B2B (Swasta) |
|---------|------------------------|---------------------|
| **Mindset Utama** | *Trust-first* — validasi kepatuhan sebelum enggajikan | *Efficiency-first* — riset spesifikasi, akses cepat |
| **Titik Masuk Utama** | Hub root domain (`dayaberkah.id`) | Spoke langsung via SEO/kampanye (`pju`, `solarcell`, `alatpetir`, `baterai`) |
| **Sinyal Kepercayaan Kritis** | Sertifikasi SNI, TKDN, Registrasi LKPP | Portofolio proyek, dokumentasi teknis, datasheet |
| **Jalur Konversi** | Formulir Universal RFQ terstruktur | Universal RFQ atau WhatsApp |
| **Pasca-Konversi** | Dashboard pelacakan proyek (`dashboard.dayaberkah.id`) | Dashboard pelacakan status pesanan (`dashboard.dayaberkah.id`) |

---

## 2. SEGMEN A: STRATEGI PENGADAAN PEMERINTAH (B2G)

### 2.1 Infrastruktur Kepercayaan Wajib

Pejabat Pengadaan Pemerintah memerlukan validasi kepatuhan regulasi sebelum enggajikan dapat dilanjutkan. Platform baru MUST memenuhi kebutuhan ini sebagai *core infrastructure*.

```
Flow: Hub (dayaberkah.id) → Validasi Legalitas (/certifications) → Universal RFQ Form → Sales Qualification → Client Dashboard
```

### 2.2 Persyaratan Operasional & Behavioral Scenarios

### Requirement: REQ-SEG-001-B2G-TRUST
The system MUST provide dedicated certification downloads and verified portfolio filters for government procurement officers.

#### Scenario: B2G Document Verification
- GIVEN a government procurement officer browsing `dayaberkah.id/certifications`
- WHEN selecting SNI/TKDN document filters
- THEN the system MUST render downloadable PDF compliance certificates and verified LKPP registration references.

---

## 3. SEGMEN B: STRATEGI SEKTOR SWASTA (B2B)

### 3.1 Desain Pengalaman Pembeli Teknis

Pembeli sektor swasta (Procurement Manager, EPC Engineer, Facility Manager) membutuhkan akses cepat ke spesifikasi teknis, datasheet PDF, dan jalur inquiry Universal RFQ pada spoke yang relevan:
- **PJU Spoke (`pju.dayaberkah.id`)**: Lampu Jalan Tenaga Surya & Sistem Penerangan Umum.
- **Solarcell Spoke (`solarcell.dayaberkah.id`)**: Panel Surya On-Grid / Off-Grid & Inverter.
- **Alatpetir Spoke (`alatpetir.dayaberkah.id`)**: Penangkal Petir ESE & System Grounding.
- **Baterai Spoke (`baterai.dayaberkah.id`)**: Baterai Industri Deep Cycle & Lithium LiFePO4.

### 3.2 Persyaratan Operasional & Behavioral Scenarios

### Requirement: REQ-SEG-002-B2B-CONVERSION
The system MUST route B2B technical buyers directly from targeted search entry points to specialized product spokes (`pju`, `solarcell`, `alatpetir`, `baterai`) with instant access to technical datasheets and Universal RFQ submission.

#### Scenario: B2B Technical Datasheet Inquiry
- GIVEN an EPC engineer visiting `solarcell.dayaberkah.id`
- WHEN navigating to a specific solar panel product detail page
- THEN the system MUST display downloadable technical specification datasheets and an embedded Universal RFQ Form without requiring upfront account creation.

### Requirement: REQ-SEG-003-SUBDOMAIN-ROUTING
The system SHALL execute middleware-driven host header routing to deliver dedicated subdomain experiences under `dayaberkah.id` while using a single Next.js application codebase.

#### Scenario: Subdomain Host Header Resolution
- GIVEN a user navigating to `pju.dayaberkah.id` or `dashboard.dayaberkah.id`
- WHEN the request reaches Cloudflare Pages Edge Middleware
- THEN the middleware MUST map the request to the corresponding internal route segment without breaking shared design system tokens or session context.

---

## 4. FONDASI TEKNOLOGI TERPADU

### 4.1 Rasio Arsitektur Aplikasi Tunggal

Keputusan teknologi kunci: **satu aplikasi Next.js 16** yang melayani semua domain (Hub, Spokes, Dashboard) melalui *middleware routing*.

### 4.2 Sistem Desain Terpusat & Konsistensi Brand

- Skala warna, tipografi, spacing, dan *border radius* didefinisikan sekali di root monorepo via Tailwind CSS v4.
- Semua Spoke merender identik dari perspektif kepatuhan token.

### 4.3 Unifikasi Data (Leads, Tracking, Analytics)

- Pusat Data Transaksional (Neon Postgres via Prisma ORM): `rfq_submissions`, `rfq_line_items`, `users`.
- Semua submission membawa *source attribution* (`source_domain`, `source_page_path`, UTM parameters).

### 4.4 Peta Jalan Integrasi

| Integrasi | Status | Fungsi | Ketergantungan |
|-----------|--------|--------|----------------|
| **Resend (Email)** | Phase 1 | Email ACK, notifikasi internal, provisioning akun | API `/api/rfq` |
| **Telegram Bot** | Phase 1 | Alert tim penjualan, notifikasi kegagalan | API `/api/rfq` |
| **WhatsApp (Fallback)** | Phase 1 | RFQ fallback pre-filled saat kegagalan API | UI RFQ form |

---

## 5. PETA JALAN IMPLEMENTASI

Peta jalan implementasi untuk ekosistem terpadu `dayaberkah.id` terbagi ke dalam empat fase terstruktur yang diselaraskan dengan Master Engineering Roadmap ([`roadmap.md`](file:///d:/dev/arostech-hub/docs/strategy/roadmap.md#L20-L95)):

### 5.1 Fase 1: Fondasi Arsitektur & Core Setup (Selesai — Mei 2026)
- Inisialisasi monorepo Next.js 16 (App Router), pnpm workspace, dan Tailwind CSS v4.
- Pengaturan basis data Neon Postgres via Prisma ORM dan penyiapan Jest testing suite.
- Pembentukan komponen UI dasar dan token desain terpusat.

### 5.2 Fase 2: Fitur Utama & Universal RFQ Engine (Selesai — Juni 2026)
- Implementasi Edge Middleware untuk pengarahan subdomain (`pju`, `solarcell`, `alatpetir`, `baterai`, `dashboard`).
- Pembangunan API Universal RFQ (`POST /api/rfq`) dengan skema Zod `rfqSubmissionSchema`.
- Integrasi CMS Sanity.io dan alur notifikasi otomatis via Resend Email & Telegram Bot.

### 5.3 Fase 3: Infrastruktur & Portal Pelayanan Klien (Selesai — Juni 2026)
- Peluncuran greenfield ke Cloudflare Pages via `@opennextjs/cloudflare`.
- Pembangunan Portal Pelacakan Klien di `dashboard.dayaberkah.id` menggunakan Auth.js v5.
- Instrumentasi pengoperasian GA4 & Cloudflare Telemetry.

### 5.4 Fase 4: Quality Gates & E2E Validation (Aktif — Q3 2026)
- Pengoptimalan kinerja mobile dengan PageSpeed Insights (PSI) score ≥ 90.
- Penegakan ambang batas pengujian minimum 85.0% coverage (Strict Zero-Regression Gate) dan pengujian E2E Playwright.
- Finalisasi audit keamanan dan kesiapan peluncuran produksi.

---

## 6. IKHTISAR KEUANGAN

### 6.1 Efisiensi Biaya Operasional Greenfield

Dengan mengkonsolidasikan tiga domain terpisah dan sistem terfragmentasi menjadi satu codebase Next.js 16 di Cloudflare Pages dan Neon Postgres, DBSN mencapai efisiensi biaya yang signifikan:

| Komponen Infrastruktur | Model Lama (Multi-Vendor) | Model Greenfield Terpadu (`dayaberkah.id`) | Penghematan Operasional |
|------------------------|---------------------------|--------------------------------------------|--------------------------|
| **Hosting & CDN** | Server Terpisah (cPanel / VPS) | Cloudflare Pages (Serverless Edge) | ~60% Penghematan Hosting |
| **Manajemen Konten** | Lisensi / Plugin WordPress Ganda | Sanity.io Headless CMS (Federated) | Penurunan Overhead Pemeliharaan |
| **Basis Data Lead** | Form WhatsApp Un-tracked | Neon Postgres + Prisma ORM | 0% Lead Loss (Kualitas Lead Naik) |
| **Keamanan & SSL** | Perizinan SSL Terpisah | Cloudflare Automated Universal SSL | Efisiensi Administrasi Security |

### 6.2 Struktur Investasi & ROI Estimasian

- **Target Pengembalian Investasi (ROI)**: Peningkatan konversi inquiry sebesar 25-35% dalam 6 bulan pertama berkat Universal RFQ Engine dan Portal Klien terintegrasi (`dashboard.dayaberkah.id`).
- **Retensi Klien B2G/B2B**: Pengurangan tingkat *churn* inquiry melalui visibilitas proyek transparan di portal pelacakan klien.

---

## 7. GRAPHIFY ANCHORING & REFERENCES

- Knowledge Graph Node ID: `doc:docs/strategy/segments.md`
- Graphify Community: `community_strategy`
- System PRD: [`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L120)
- Master Engineering Roadmap: [`roadmap.md`](file:///d:/dev/arostech-hub/docs/strategy/roadmap.md#L1-L95)
