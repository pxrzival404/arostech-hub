---
id: VIS-DBSN-001
title: DBSN System Identity, Vision & Strategic Business Context
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_vision"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L120"
  compatibility_matrix: "file:///d:/dev/arostech-hub/docs/strategy/compatibility-matrix.md#L1-L40"
  routing_lifecycle: "file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L1-L50"
---

# System Identity, Vision, & Business Context

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Cascade`  
> **Authoritative Baseline Reference**: This document defines system identity, product vision, and strategic business context aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L15-L120)).

---

## Section I: System Identity & Core Value

### 1. System Identity & Core Value

The **DBSN Centralized Digital Ecosystem** (`arostech-hub`) is a high-performance web platform engineered to consolidate legacy product verticals into a single, unified Next.js 16 hub-and-spoke architecture operating on **`dayaberkah.id`**.

#### Problem Statement
Legacy setups suffered from fragmented content management, slow page load speeds, high security risk surfaces, and redundant hosting overhead across corporate and product domain segments.

#### Core Value Proposition
- **Unified Infrastructure**: Single Next.js codebase serving Hub (`dayaberkah.id`), Product Spokes (`pju.dayaberkah.id`, `solarcell.dayaberkah.id`, `alatpetir.dayaberkah.id`, `baterai.dayaberkah.id`), and Client Dashboard (`dashboard.dayaberkah.id`).
- **Edge Performance**: 100% Edge hosting on Cloudflare Pages via `@cloudflare/next-on-pages`.
- **Resilient RFQ**: Automated failover quote submission engine guaranteeing zero lost customer leads.

---

### 2. Design Philosophy

- **Convention over Configuration**: Standardized App Router structure and clear naming conventions.
- **Edge-First Architecture**: Dynamic subdomain resolution at the Edge via Next.js Middleware before page execution.
- **Strict Type Safety**: End-to-end TypeScript 5.7+ with Zod schema validations for forms, API routes, and database models.
- **Test-Driven Discipline**: Comprehensive Jest unit tests and Playwright E2E integration test suites.

---

### 3. Runtime Compatibility Matrix

For the complete technical specifications and runtime requirements across all technology layers (Node.js, Next.js, React, Cloudflare Pages, Prisma, Sanity, and Tailwind CSS v4), refer directly to the single authoritative reference:  
👉 [`compatibility-matrix.md`](file:///d:/dev/arostech-hub/docs/strategy/compatibility-matrix.md#L1-L40)

---

### 4. Behavioral Contracts & Requirements

### Requirement: REQ-VIS-001-SYSTEM-IDENTITY
The system MUST function as a single Next.js codebase delivering `dayaberkah.id` and all associated spoke subdomains without maintaining separate application repositories.

#### Scenario: Unified Deployment Validation
- GIVEN a multi-tenant hub-and-spoke request topology
- WHEN requests hit `dayaberkah.id` or any registered product spoke (`pju`, `solarcell`, `alatpetir`, `baterai`, `dashboard`)
- THEN Edge Middleware MUST rewrite requests to the correct route tree while sharing a single application build target.

### Requirement: REQ-VIS-002-GREENFIELD-BRAND-ALIGNMENT
The system SHALL establish all brand positioning and digital assets under `dayaberkah.id` as a pure greenfield build, eliminating dependencies on legacy domain infrastructure.

#### Scenario: Greenfield Domain Route Resolution
- GIVEN an incoming user request to the greenfield hub or spoke network
- WHEN the Edge Middleware resolves host header routing
- THEN the system MUST process the request on `dayaberkah.id` or its direct subdomains without delegating to legacy redirect engines or external domain mapping servers.

---

## Section II: Strategic Intelligence & Business Context Report (Superseded by PRD v4.0.0 Greenfield Architecture Pivot)

> [!IMPORTANT]
> **SUPERSEDED NOTICE — GTM Domain & Greenfield Architecture Pivot (2026-08-12):**  
> Section II contains historical business analysis and GTM recommendations compiled in April 2026. The preliminary domain recommendations in Section 3.2 (`dbsn.co.id` / `dbsnenergy.co.id`), legacy 301 redirect engine proposals, and unverified project volume metrics are **SUPERSEDED** by PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L22-L35)).  
> The target canonical domain is explicitly locked to **`dayaberkah.id`** operating as a pure greenfield build.

# DBSN Strategic Intelligence Report
### AI-Ready Input Document for Website PRD Generation

**Prepared by:** Senior Internal Market Research Consultant  
**Subject:** PT. Daya Berkah Sentosa Nusantara (DBSN) — Full Digital Ecosystem Analysis  
**Source URLs Analyzed:** pjusolarcellindonesia.com · dayaberkah.id (legacy multi-domain footprint consolidated) · alatpenangkalpetir.co.id  
**Date:** April 2026 (Updated August 2026 for Greenfield Baseline)  
**Document Purpose:** Internal Strategic Understanding → Input for AI-Assisted Website PRD  
**Frameworks Applied:** Business Model Canvas · PESTLE & SWOT · VRIO & Value Chain · Lean Canvas & GTM

---

## 1. EXECUTIVE SUMMARY

PT. Daya Berkah Sentosa Nusantara (DBSN) is an Indonesian renewable energy and electrical infrastructure distributor operating across multiple product verticals under a single legal entity.

The strategic decision to consolidate digital operations into a single unified website represents a significant opportunity. The new unified DBSN website MUST serve two co-primary audiences — **Government Procurement Officers** and **B2B Private Sector Clients** — while resolving three identified critical gaps: poor lead conversion architecture, insufficient B2B trust signals, and the complete absence of self-service digital tools.

---

## 2. COMPANY PROFILE

| Field | Detail |
|---|---|
| **Legal Name** | PT. Daya Berkah Sentosa Nusantara |
| **Brand Name** | DBSN |
| **Business Type** | Distributor, System Integrator & Contractor |
| **Industry Sector** | Renewable Energy · Electrical Infrastructure · Lightning Protection |
| **Headquarters** | Komplek Pergudangan Kencana, Jl. Raya Trosobo, Sidoarjo, Jawa Timur 61257 |
| **Branch Office** | Pesona Anggrek Harapan Blok F2 No.4, Bekasi (Greater Jakarta) |
| **Primary Contact** | +62 813 3006 6767 (Surabaya) · +62 815 8086 043 (Jakarta) |
| **Operational Reach** | National (Seluruh Indonesia) |
| **Active Since** | Copyright date on dayaberkah.id consolidated legacy footprint indicates operational presence since at least 2015 |
| **Core Certifications** | SNI (Standar Nasional Indonesia) · TKDN ≥ 40% |
| **Procurement Channel** | e-Catalogue LKPP — eligible for APBD/APBN government procurement |
| **Vision (Stated)** | "Menjadikan Indonesia lebih terang tanpa membebani bumi" |
| **Vision 2030** | To become the leading renewable energy solutions provider in Indonesia |

---

## 3. LEAN CANVAS & GO-TO-MARKET STRATEGY

### Unique Value Proposition
> **"DBSN — Indonesia's Certified Multi-Vertical Renewable Energy Partner. From solar street lighting to power backup and lightning protection: SNI-certified, TKDN-compliant, LKPP-registered, and proven across nationwide infrastructure projects."**

*(Note: Legacy references claiming "200+ projects" have been removed in favor of verified portfolio references.)*

### Go-to-Market Timeline Baseline
The official GTM execution timeline MUST conform to `roadmap.md` ([`roadmap.md`](file:///d:/dev/arostech-hub/docs/strategy/roadmap.md#L14-L95)) and the greenfield target domain `dayaberkah.id`.

---

## 4. GRAPHIFY ANCHORING & REFERENCES

- Knowledge Graph Node ID: `doc:docs/strategy/vision.md`
- Graphify Community: `community_vision`
- System Blueprint Migration Plan: [`SYSTEM_BLUEPRINT_MIGRATION_PLAN_v2.md`](file:///d:/dev/arostech-hub/SYSTEM_BLUEPRINT_MIGRATION_PLAN_v2.md#L1-L100)
