---
id: PRD-DBSN-001
title: DBSN Centralized Digital Ecosystem PRD
version: 4.0.0
status: LOCKED_BASELINE
architecture: Hub-and-Spoke Greenfield
target_domain: dayaberkah.id
graphify_community: "community_prd"
authoritative_references:
  config_schema: "file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md"
  routing_lifecycle: "file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md"
---

# PRD: DBSN Centralized Digital Ecosystem

**Author:** Pramono (Product Owner)
**Date:** 2026-05-13
**Status:** Production Ready
**Version:** 3.6

**Changelog — v3.6 (2026-08-12, Greenfield Platform Baseline):**
- **Greenfield Architecture Pivot:** Replaced legacy SEO migration/redirect engine requirements with a clean greenfield platform build for `dayaberkah.id` and its product spoke subdomains (`pju.`, `solarcell.`, `alatpetir.`, `baterai.`, `dashboard.`).
- **SEO Engine Removal:** Removed all legacy 301 redirect engine specifications, legacy URL mapping inventories, Cloudflare Edge redirect Workers, `/api/redirects/lookup` endpoint references, and the `redirect_map` database table.
- **Native Greenfield SEO Architecture:** Established native Next.js 16 SEO architecture including `Metadata` API canonical tags, automated dynamic `sitemap.ts`, `robots.ts`, and Schema.org JSON-LD structured data directly on `dayaberkah.id`.
- **Requirements & Test Suite Clean-Up:** Updated REQ-008 to *Greenfield Search Engine Optimization & Canonical Architecture*. Replaced legacy 301 redirect QA tests in §6.2 and §7 with greenfield indexing, canonical tag, and structured data test cases. Realigned KPI G1 to greenfield organic growth.
- **Section 13 Lock:** Documented Decision #7 (*Greenfield Build Strategy — Native SEO Architecture without Legacy Redirect Engine*).

**Changelog — v3.5 (2026-08-12, Unified Universal RFQ Baseline):**
- Universal RFQ Architecture transition: single `rfqSubmissionSchema` without B2B/B2G form branching or `z.discriminatedUnion`. Removed `segment` column from `rfq_submissions` table. Set `companyName` as required (`min(2)`).

**Changelog — v3.4 (2026-08-12, Final Resolved Baseline):**
- Resolved OQ-1 through OQ-5: `meta: { timestamp, requestId, pagination }` without `version`, client-side UTM capture, per-item `timeline`/`projectScope`, required `unitOfMeasure`, optional `unitPriceEstimate`, and `source_campaign_tag`/header `notes` in DB.

---

## Table of Contents

1. [Problem Statement & System Context](#1-problem-statement--system-context)
   - 1.1 [Background / Latar Belakang Masalah](#11-background--latar-belakang-masalah)
   - 1.2 [Target Audience](#12-target-audience)
   - 1.3 [High-Level Architecture](#13-high-level-architecture)
   - 1.4 [Success Metrics & KPIs](#14-success-metrics--kpis)
2. [User Journeys & UI/UX Requirements](#2-user-journeys--uiux-requirements)
   - 2.1 [Core User Flows](#21-core-user-flows)
   - 2.2 [Shared Design System](#22-shared-design-system)
   - 2.3 [Mobile-First & Accessibility](#23-mobile-first--accessibility)
3. [Functional & Non-Functional Requirements](#3-functional--non-functional-requirements)
   - 3.1 [Functional Requirements](#31-functional-requirements)
   - 3.2 [Performance Targets & Core Web Vitals](#32-performance-targets--core-web-vitals)
   - 3.3 [Security & Access](#33-security--access)
   - 3.4 [Non-Functional Requirements](#34-non-functional-requirements)
4. [Data Models & Event Tracking](#4-data-models--event-tracking-telemetry)
   - 4.1 [CMS Schema](#41-cms-schema)
   - 4.2 [Transactional Database](#42-transactional-database)
   - 4.3 [Analytics & Telemetry Strategy](#43-analytics--telemetry-strategy)
5. [Integrations, Routing, & Fallbacks](#5-integrations-routing--fallbacks)
   - 5.1 [Greenfield Search Indexing & Canonical Architecture](#51-greenfield-search-indexing--canonical-architecture)
   - 5.2 [Notification Pipeline](#52-notification-pipeline)
   - 5.3 [Graceful Fallback System](#53-graceful-fallback-system)
   - 5.4 [Integration Error Contracts](#54-integration-error-contracts)
6. [Validation & Release Checkpoints](#6-validation--release-checkpoints)
   - 6.1 [Design & UX QA](#61-design--ux-qa)
   - 6.2 [Tech & Load Testing](#62-tech--load-testing)
   - 6.3 [Approval Gates](#63-approval-gates)
7. [Acceptance Criteria & Test Cases](#7-acceptance-criteria--test-cases)
8. [API Specifications](#8-api-specifications)
   - 8.1 [Response Format](#81-response-format)
   - 8.2 [RFQ API Endpoint](#82-rfq-api-endpoint)
   - 8.3 [Authentication Endpoints](#83-authentication-endpoints)
9. [Performance & SLAs](#9-performance--slas)
   - 9.1 [Technical Performance Targets](#91-technical-performance-targets)
   - 9.2 [Service Level Agreements](#92-service-level-agreements)
   - 9.3 [Monitoring & Alerting](#93-monitoring--alerting)
10. [Security & Compliance](#10-security--compliance)
    - 10.1 [Security Requirements](#101-security-requirements)
    - 10.2 [Privacy & Compliance](#102-privacy--compliance)
    - 10.3 [Authentication & Authorization](#103-authentication--authorization)
11. [Environment Configuration](#11-environment-configuration)
    - 11.1 [Environment Variables](#111-environment-variables)
    - 11.2 [Feature Flags](#112-feature-flags)
12. [Rollback Plan](#12-rollback-plan)
13. [Resolved Architectural Decisions (v3.6 Baseline)](#13-resolved-architectural-decisions-v36-baseline)

---

## 1. Problem Statement & System Context

### 1.1 Background / Latar Belakang Masalah

DBSN's digital presence was previously fragmented across three independently operated legacy websites (`pjusolarcellindonesia.com`, `sentradaya.com`, and `alatpenangkalpetir.co.id`). This legacy multi-domain approach suffered from severe structural shortcomings: fragmented brand trust, lack of structured inquiry capture (WhatsApp-only), complete absence of post-RFQ client tracking, and siloed lead operations.

To eliminate this fragmentation, DBSN is executing a **pure greenfield build** of a new centralized digital platform operating on `dayaberkah.id` and its dedicated product spoke subdomains. Rather than inheriting legacy tech debt, complex redirect mapping tables, or edge redirect lookup overhead, the new platform is designed from the ground up as a modern, high-performance Hub-and-Spoke system with native search engine optimization, unified telemetry, structured RFQ workflows, and authenticated client services.

**Trust Consolidation.** B2G and B2B enterprise buyers encounter a unified, authoritative vendor footprint under `dayaberkah.id`, complete with legal credentials, SNI/TKDN certifications, and a cross-sector portfolio.

**Universal RFQ Capture.** Replaces un-tracked WhatsApp drop-off with a single, high-conversion Universal RFQ Form across all entry points, capturing field-level product specifications, timeline, and project scope.

**Post-RFQ Client Services.** Provides a secure self-service portal (`dashboard.dayaberkah.id`) where qualified clients can track order and project progression transparently.

**Operational Unification.** Consolidates all inbound inquiries, lead pipelines, and analytics into a single transactional Neon Postgres database and Admin Dashboard.

### 1.2 Target Audience

DBSN's digital platform serves two primary buyer segments — **Government Procurement Officers (B2G)** and **Private Sector Technical Buyers (B2B)** — through a unified, friction-free conversion surface.

Instead of forcing buyers to self-identify upfront via separate form branches, the platform provides a **Universal RFQ Form** (`rfqSubmissionSchema`). Both segments complete the same streamlined contact and cart submission interface. Government-specific metadata (such as `procurementType`) is optional for all users, enabling process-bound B2G buyers to specify procurement details without imposing cognitive load or form abandonment on B2B or preliminary inquiries. Post-submission lead classification occurs automatically or via sales operations in the Admin Dashboard.

### 1.3 High-Level Architecture

The locked architectural model is a **Greenfield Hub-and-Spoke Sub-domain Architecture** delivered from a **single Next.js 16 application** with middleware-based subdomain routing. The hub operates on the root domain (`dayaberkah.id`) and functions as the corporate trust center: it hosts the company profile, certifications, cross-sector portfolio, and routing CTAs that direct users to the appropriate product spoke. Each product spoke is a dedicated sub-domain (e.g., `pju.dayaberkah.id`, `solarcell.dayaberkah.id`, `alatpetir.dayaberkah.id`, `baterai.dayaberkah.id`) hosting product-cluster content, product pages, and the Universal RFQ entry point.

The architecture includes a dedicated secure access spoke: **`dashboard.dayaberkah.id`**. This sub-domain functions as the client login and tracking services portal (Layanan Pelacakan) for B2B and B2G clients who have successfully progressed through RFQ and qualification workflows. The dashboard is not a public marketing surface; it is an authenticated operational surface linked to client-specific tracking/project identifiers.

All subdomains (hub, spokes, dashboard) are served from a **single unified Next.js codebase** with a shared design system (Tailwind CSS + Radix UI via shadcn/ui patterns) and a unified data pipeline (Sanity CMS + Neon Postgres via Prisma ORM). There are no divergent code forks between subdomains — all differentiation is handled by middleware routing and data-driven content via Sanity schemas and role/access controls.

**Locked Stack:** Next.js 16 (App Router) · pnpm · Sanity.io · Tailwind CSS + Radix UI · Neon Postgres + Prisma ORM · Auth.js v5 · Cloudflare Pages · Resend + Telegram Bot · GA4 + GSC + Cloudflare Analytics · Phase 2: Sentry + PostHog

```mermaid
---
config:
  layout: dagre
---
flowchart TD
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

    Root["🏢 dayaberkah.id (Hub)\nCorporate Trust Center\nCertifications · Portfolio · Routing"]
    Root -->|"Middleware Subdomain Routing"| S1["🌐 pju.dayaberkah.id\nPJU / Street Lighting\nSpoke"]
    Root -->|"Middleware Subdomain Routing"| S2["🌐 solarcell.dayaberkah.id\nSolar Cell\nSpoke"]
    Root -->|"Middleware Subdomain Routing"| S3["🌐 alatpetir.dayaberkah.id\nLightning Protection\nSpoke"]
    Root -->|"Middleware Subdomain Routing"| SN["🌐 baterai.dayaberkah.id\nAdditional Spokes\n(extensible)"]
    Root -->|"Secure access"| SD["🔐 dashboard.dayaberkah.id\nClient Tracking Services\n(B2B/B2G Login Portal)"]

    subgraph SingleApp ["📦 Single Next.js 16 App (Greenfield Build)"]
        direction TB
        NextJS["App Router + Middleware\n(shared codebase)"]
        DesignSystem["Tailwind CSS + Radix UI\n(shadcn/ui patterns)"]
        SanityFed["Sanity.io CMS\n(content federation)"]
        PrismaORM["Prisma ORM\n(type-safe migrations)"]
        SEOEngine["Native SEO & Canonical Engine\nMetadata API · sitemap.ts · JSON-LD"]
    end

    subgraph DataLayer ["🗄️ Data & Integrations Layer"]
        direction TB
        PS[("Neon Postgres\nTransactional DB\nRFQ Submissions · Line Items · Users")]
        Auth["Auth.js v5\n(Admin + Client Auth)"]
        Notif["Resend + Telegram Bot\n(Notifications)"]
        GA["GA4 + GSC + Cloudflare Analytics\n(Unified Telemetry)"]
        Mon["Phase 2: Sentry + PostHog\n(Error Tracking · Session Replay)"]
    end

    subgraph EdgeLayer ["⚡ Delivery Layer"]
        CF["Cloudflare Pages\n(Edge Hosting · Global CDN)"]
    end

    S1 & S2 & S3 & SN & SD --> NextJS
    NextJS --> DesignSystem
    NextJS --> SanityFed
    NextJS --> SEOEngine
    NextJS --> PS
    PS --> Auth
    PS --> Notif
    NextJS --> GA
    NextJS --> Mon
    NextJS --> CF

    class Root entry
    class SD conversion
```

### 1.4 Success Metrics & KPIs

| # | Goal | Primary Metric | Target | Timeframe | Measurement Method |
|---|------|----------------|--------|-----------|-------------------|
| G1 | Establish Greenfield Search Engine Visibility | Organic impressions & indexed pages on `dayaberkah.id` | Continuous MoM growth; 100% indexation of target pages | Months 1–6 post-launch | GSC + GA4 + Cloudflare Analytics |
| G2 | Increase Qualified Conversion | Qualified RFQ submissions / month | MoM uplift vs. legacy WhatsApp baseline | First 3 months post-launch | Centralized dashboard with source attribution |
| G3 | Improve Procurement Trust Engagement | Certification & datasheet download rate | Continuous growth trend | Months 1–3 post-launch | GA4 file events + CMS analytics |
| G4 | Improve Conversion Efficiency by Entry Context | Product page → RFQ/WhatsApp conversion rate | Measurable lift per spoke | First 90 days | GA4 funnel events + CRM tagging |
| G5 | Lead Operations Unification | Lead centralization completeness | 100% of leads captured with source tags | At launch | Dashboard audit |
| G6 | Capture Government Procurement Fit | LKPP-qualified inquiry rate | Establish & grow stable qualified baseline | Months 1–3 post-launch | RFQ form qualifiers + sales validation |
| G7 | Mobile-First Performance Excellence | PageSpeed Insights mobile score | 90+ on key templates | At launch & maintained | PSI + Lighthouse CI |
| G8 | Optimize Hub-to-Spoke Journey | Hub-to-Spoke CTR & journey completion | Strong routing efficiency per segment path | Months 1–2 post-launch | GA4 pathing + event instrumentation |
| G9 | Establish Client Tracking Adoption | Qualified clients with active dashboard access and first tracking view | ≥ 80% of eligible clients onboarded | First 3 months post-launch | Dashboard auth logs + GA4 tracking events |

---

## 2. User Journeys & UI/UX Requirements

### 2.1 Core User Flows

The platform governs conversion through a single, streamlined **Universal RFQ User Flow**. Whether a user is a Government Procurement Officer (B2G) verifying compliance or a Private Technical Buyer (B2B) validating product specs, they enter the same friction-free RFQ interface across hub and spoke entry points.

```mermaid
---
config:
  layout: elk
---
flowchart TD
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

    A(["👤 Buyer Entry\n(B2G Government Officer or B2B Technical Buyer)"])
    A --> B{"Entry Surface"}
    B -->|"Hub Root"| C["Hub: dayaberkah.id\nTrust Center · Certifications · Portfolio"]
    B -->|"Spoke Direct / Organic"| D["Spoke Subdomain\ne.g. pju.dayaberkah.id"]
    C --> D
    D --> E["Product Detail / Spoke Landing\nTechnical Specs · Datasheets · CTAs"]
    E --> F{"Conversion Choice"}
    F -->|"Structured RFQ"| G["📋 Universal RFQ Form\n(Single Form: Contact + Meta + Cart Items)"]
    F -->|"Quick Contact"| H["📱 WhatsApp Click-to-Chat\n(GA4: whatsapp_click event)"]
    F -->|"Download Asset"| I["📥 Certifications / Datasheet Download\n(GA4: file_download event)"]
    G --> J{"Form Submission\n(POST /api/rfq)"}
    J -->|"Success (201)"| K["✅ Confirmation Page\n+ Resend ACK Email\n+ Telegram Alert → Sales Ops"]
    J -->|"API / DB Failure"| L["⚠️ Fallback Handler\nPre-filled WhatsApp URL\n(0% Lead Loss)"]
    K --> M{"Sales Ops Qualification\n(Admin Dashboard)"}
    M -->|"Qualified Client"| N["🔐 Provision Client Account\nfor dashboard.dayaberkah.id"]
    N --> O["📊 Client Tracking Portal\n(Project / Order Status)"]
    M -->|"Standard Lead"| P["Standard Sales Follow-up\nwithout tracking access"]
    L --> Q["📱 WhatsApp Handoff"]
    class A entry
    class G conversion
    class J conversion
    class K conversion
    class L conversion
    class N conversion
```

### 2.2 Shared Design System

All spokes must render identically from the perspective of design token compliance. Differentiation between spokes is strictly content-driven — never the result of divergent component implementations or style overrides.

The design system is built on **Tailwind CSS** (utility-first styling with a shared token configuration) and **Radix UI** (accessible, headless component primitives). Component configurations — spacing scale, typography scale, color tokens, border radii, breakpoints — are defined once in the monorepo root and consumed by all apps. No spoke may introduce a local `tailwind.config.js` that deviates from the root configuration.

Key shared component categories include: navigation headers, trust-badge blocks, certification card components, product spec tables, Universal RFQ form shells, floating CTA wrappers, portfolio grid components, document download cards, secure authentication forms, and tracking status cards for dashboard views.

### 2.3 Mobile-First & Accessibility

DBSN's target audience operates in Indonesia's mobile-dominant usage context. All UX decisions must be made mobile-first, with desktop treated as a progressive enhancement.

**Floating CTA Rule (Critical).** The persistent WhatsApp floating CTA must never obscure RFQ form fields or the form's primary submit action on mobile viewports. On screens where the form is active, the CTA must either collapse, reposition, or render in a non-overlapping fixed zone. This is a hard launch gate requirement validated in QA.

**Mobile Form UX.** Universal RFQ forms must be thumb-navigable: sufficient tap-target sizing (minimum 44px), no horizontally scrolling form containers, native mobile input types (`tel`, `email`, `date`) where applicable, and clear inline validation messaging. Dashboard login forms must follow the same touch and readability standards.

**Performance as Accessibility.** A PSI score of 90+ on key mobile templates is a proxy for accessibility in bandwidth-constrained environments. Large image assets must use `next/image` with proper lazy loading. No unoptimized media may ship to production.

---

## 3. Functional & Non-Functional Requirements

### 3.1 Functional Requirements

#### Must Have (P0) — Critical for Launch

**REQ-001 — Main Hub Trust Platform.** Implement the root-domain hub including company profile, legal credibility content, certifications access, cross-sector portfolio navigation, and routing CTAs to all active spokes. Acceptance: Hub links all active spokes with consistent UX; certifications section supports downloadable files; portfolio section is first-class navigation.

**REQ-002 — Product Spoke Sub-domains.** Each product cluster must operate on a dedicated sub-domain (`pju.`, `solarcell.`, `alatpetir.`, `baterai.`) with shared codebase templates and distinct data-driven product content. Acceptance: Sub-domain routing is operational; shared design system applied identically across spokes; content differences are Sanity-driven, not code forks.

**REQ-003 — Certifications Hub.** Centralized document trust center for SNI, TKDN, LKPP, and supporting legal artifacts. Acceptance: Structured metadata per document; download access functional on mobile and desktop; document pages indexable where appropriate.

**REQ-004 — Structured RFQ System (Universal Multi-Item Cart).** Implement a single Universal RFQ Form across all hub and spoke entry points using a unified Zod validation schema (`rfqSubmissionSchema`). Acceptance: A single form serves both B2B and B2G buyers without upfront segmentation or top-level `segment` discriminators; a single submission carries contact details, optional procurement/UTM metadata, and one or more cart line items; malformed submissions are blocked by validation; submissions persist reliably in Neon Postgres as a header row (`rfq_submissions`) plus one or more line-item rows (`rfq_line_items`).

**REQ-005 — Persistent WhatsApp Integration (Non-Blocking UX).** Site-wide persistent click-to-chat CTA that does not obstruct RFQ form interactions on mobile. Acceptance: Floating CTA available site-wide; obstruction-safe behavior on RFQ screens; all WhatsApp click events tracked to GA4.

**REQ-006 — Project Portfolio (First-Class Feature).** Portfolio must be a core navigation feature with structured entries, sector filtering, and contextual spoke linking. Acceptance: Minimum 20 structured entries before Phase 1 launch approval; entries include project type, client category, location, scope, and outcome.

**REQ-007 — Centralized Lead & RFQ Data Pipeline.** All inbound RFQs and leads from all hub/spoke entry points must write to a single Neon Postgres transactional database with source attribution. Acceptance: Schema supports full lead lifecycle fields and source tags; all submission endpoints write with retry/error handling; dashboard reflects near-real-time updates.

**REQ-008 — Greenfield Search Engine Optimization & Canonical Architecture.** Establish native search engine indexation, canonical URL structure, XML sitemaps, and Schema.org structured data directly on `dayaberkah.id` and its spoke subdomains. Acceptance: Every page implements `<link rel="canonical">` via Next.js `Metadata` API; dynamic `sitemap.ts` and `robots.ts` generate valid index maps for search crawlers; Schema.org JSON-LD (Organization, Product, BreadcrumbList, CorporateContact) is embedded on all target pages; zero依赖 on legacy 301 redirect tables or edge lookup middleware.

**REQ-009 — Notification Workflow.** New RFQs and leads trigger operational notifications. Acceptance: Transactional email via Resend for RFQ acknowledgment and internal notice; Telegram alert for near-real-time internal follow-up.

**REQ-010 — Authenticated Admin Dashboard.** Centralized dashboard for lead/RFQ management using Auth.js v5. Acceptance: Secure login and protected routes; lead list with filter, search, and source tag columns; post-submission segment tagging (Government vs. Private) derived from `procurement_type` and company metadata; export-ready data structure.

**REQ-011 — Authenticated Client Tracking Portal (`dashboard.dayaberkah.id`).** Implement secure B2B/B2G client login for Tracking Services (Layanan Pelacakan), linked to approved RFQ/project records. Acceptance: dedicated sub-domain routing active; only provisioned client accounts can authenticate; authenticated clients can view only their associated project/order tracking statuses; unauthorized access attempts are denied and logged.

#### Should Have (P1)

**REQ-012 — Documentation Library Expansion.** Richer technical library including datasheets, installation guides, and compliance references with indexing and category filtering beyond the Phase 1 certifications hub scope.

**REQ-013 — Product Comparison Tool.** Basic side-by-side comparison functionality for selected product categories within a spoke.

#### Nice to Have (P2)

**REQ-014 — ROI Calculator & IoT Showcase.** Advanced pre-sales tooling (ROI/payback calculator) and smart-city capability presentation surface. Deferred to Phase 2/3.

### 3.2 Performance Targets & Core Web Vitals

The performance floor for the DBSN platform is defined by PSI (PageSpeed Insights) mobile scores and Core Web Vitals thresholds. These are not aspirational targets — they are launch gate requirements.

**PageSpeed Insights.** All key page templates (hub home, spoke landing, product detail, RFQ page, client dashboard login, and tracking status overview) must achieve a mobile PSI score of **90 or above**. Benchmarks will be captured at the start of Sprint 1 against current legacy pages to establish a baseline.

**Core Web Vitals.** All key templates must pass CWV acceptable thresholds: LCP (Largest Contentful Paint), FID/INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift). Zero tolerance for unresolved layout shifts from late-loading assets, fonts, or dynamic CTA components.

**Asset Discipline.** All images must be served via `next/image` with WebP/AVIF output and lazy loading. Document/PDF assets must be served from Sanity CDN without triggering layout shifts. Hero sections and above-the-fold areas must not contain unoptimized media.

### 3.3 Security & Access

**Admin Authentication.** The internal dashboard and all protected API routes must be gated by Auth.js v5 with a least-privilege role model. Unauthenticated requests to protected endpoints must return 401/403 — never silently fail or expose lead data.

**Client Portal Authentication.** `dashboard.dayaberkah.id` must use secure authenticated access for provisioned B2B/B2G clients only, via the same Auth.js v5 catch-all route (`/api/auth/[...nextauth]`) used for admin OAuth — clients authenticate through a Credentials provider on that route rather than a separate endpoint, with `role: "client"` on the session object gating access. Client users must be explicitly linked to their `rfq_submissions` record via `linked_rfq_submission_id`. Access scope must enforce row-level ownership constraints so clients can only retrieve their own tracking data. Session handling, password policy/reset flow, and login attempt throttling are mandatory and are implemented as part of the Credentials provider's `authorize()` callback and Auth.js session/JWT config — not a bespoke auth stack.

**Input Validation & Anti-Spam.** All RFQ submission endpoints must implement server-side input sanitization and anti-spam measures (e.g., honeypot fields, rate limiting). Legacy WordPress content ingested into Sanity must be sanitized to remove malformed HTML, shortcodes, and script injections before being published via Next.js rendering.

**Data Handling.** All lead, RFQ, user, and tracking-link records must be stored under TLS-enforced connections. Neon Postgres access credentials must follow the principle of least privilege. No lead/client PII is logged in Cloudflare Analytics or GA4 raw event payloads.

### 3.4 Non-Functional Requirements

**Uptime & Reliability.** The platform must maintain 99.5% uptime with automatic failover for critical components. Cloudflare Pages edge delivery must support graceful degradation during partial outages.

**Data Backup & Recovery.** All transactional data must be backed up with 30-day retention. Recovery procedures must be documented and tested in staging.

**Rate Limiting.** Implement IP-based rate limiting:
- RFQ submissions: 5 requests per minute per IP
- Login attempts: 10 attempts per 5 minutes per IP
- API endpoints: 100 requests per minute per authenticated user

**File Handling.** Implement strict file upload policies:
- PDF documents: Maximum 10MB (5MB for uploads)
- Images: Maximum 2MB, WebP/AVIF preferred
- All files: Hash-based cache busting, CDN caching (documents: 1 year, images: 30 days)

**SEO Metadata.** All pages must include:
- Meta title: Maximum 60 characters
- Meta description: Maximum 160 characters
- Open Graph tags with 1200x630px image (<500KB)
- Structured data: Product, Organization, BreadcrumbList, CorporateContact
- hreflang="id" for Indonesian audience

---

## 4. Data Models & Event Tracking (Telemetry)

### 4.1 CMS Schema

All content for hub and spokes is managed in **Sanity.io** as the single source of truth. The following document types are required at launch.

**Product** — Fields: `title`, `slug`, `spoke` (reference to spoke config), `shortDescription`, `fullDescription` (portable text), `specifications` (array of key-value pairs), `images` (array), `datasheetFile` (file asset), `relatedCertifications` (array of references), `seoMeta` (title, description, OG image).

**Certification** — Fields: `title`, `slug`, `certificationBody`, `certType` (enum: SNI | TKDN | LKPP | ISO | Other), `issueDate`, `expiryDate`, `documentFile` (file asset), `coverImage`, `isIndexable` (boolean), `seoMeta`.

**PortfolioEntry** — Fields: `title`, `slug`, `projectType`, `clientCategory` (enum: Government | BUMN | Private | EPC), `location`, `completionYear`, `scopeDescription` (portable text), `outcome`, `images` (array), `relatedSpoke` (reference), `relatedProducts` (array of references).

**SpokeConfig** — Fields: `name`, `subdomain`, `tagline`, `heroImage`, `primaryColor` (token), `featuredProducts` (array of references), `seoDefaults`.

**Page** (generic) — Fields: `title`, `slug`, `targetSpoke` (null = hub), `sections` (array of portable text / content blocks), `seoMeta`.

### 4.2 Transactional Database

All transactional lead and user data is stored in **Neon Postgres**. The following table structure (via Prisma ORM) is required at launch.

> **Two-table model:** The composite cart API (§8.2) accepts one or more line items per submission. The database matches this structure with a submission header table (`rfq_submissions`) and a child line-items table (`rfq_line_items`). The `segment` column is completely removed from `rfq_submissions`; lead classification occurs dynamically in queries and dashboard views. No legacy `redirect_map` table is required.

**`rfq_submissions` table** (submission header — one row per cart checkout):
- `id` (CUID), `created_at`, `updated_at`
- `source_domain`, `source_page_path`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` (nullable strings — captured client-side from query string on first landing, persisted in `sessionStorage`, and submitted in payload)
- `contact_name`, `contact_email`, `contact_phone`, `company_name` (string — required)
- `procurement_type` (nullable string — optional for all users; when populated, signals government procurement intent)
- `submission_status` (enum: received | contacted | qualified | disqualified)
- `notes` (nullable string — general buyer context at submission header level, e.g., overall project budget/timeline, coexisting with line-item technical notes)
- `source_campaign_tag` (nullable string — internal-only column for sales ops, omitted from public API payload)
- `fallback_triggered` (boolean), `fallback_wa_url` (nullable string)
- `tracking_project_id` (nullable string, assigned when submission progresses to tracked project/order)
- `dashboard_access_granted_at` (nullable datetime), `dashboard_access_status` (enum: not_eligible | pending | granted | revoked)

*Indexes Required:* `created_at`, `source_domain`, `contact_email`

**`rfq_line_items` table** (cart items — one-to-many child of `rfq_submissions`):
- `id` (CUID)
- `rfq_submission_id` (FK → `rfq_submissions.id`, `ON DELETE CASCADE`)
- `spoke_segment` (enum: pju | solarcell | alatpetir | baterai)
- `product_category` (string)
- `quantity` (integer, > 0)
- `unit_of_measure` (string — required, e.g. "unit", "set", "pcs", "meter")
- `unit_price_estimate` (nullable decimal — buyer-supplied budget indication, optional)
- `project_scope` (string, min 10 chars — per line item)
- `timeline` (nullable string — per line item)
- `notes` (nullable string — technical specs per product)

*Indexes Required:* `rfq_submission_id`, `spoke_segment`

*Constraint:* A submission must have at least one line item (enforced at application layer on write).

**`users` table**:
- `id`, `email`, `name`, `role` (enum: admin | viewer | client), `created_at`
- `linked_rfq_submission_id` (nullable FK to `rfq_submissions.id`, ON DELETE SET NULL)
- `client_company_name` (nullable)
- `tracking_scope_type` (nullable enum: project | order)
- `tracking_scope_ids` (nullable JSON array of authorized tracking/project IDs)
- `last_login_at` (nullable datetime)
- `is_active` (boolean default true)

Both `admin`/`viewer` (Google OAuth) and `client` (Credentials) roles authenticate through the single Auth.js v5 catch-all route — see §8.3; `role` is the sole gate distinguishing internal staff from provisioned clients.

### 4.3 Analytics & Telemetry Strategy

All GA4 events must be instrumented at launch. These are mandatory — not optional enhancements.

| Event Name | Trigger | Key Parameters |
|---|---|---|
| `whatsapp_click` | User taps/clicks any WhatsApp CTA | `source_page`, `spoke`, `cta_location` (floating \| inline \| fallback) |
| `rfq_start` | User focuses first field in RFQ form | `form_type` ("universal"), `spoke`, `source_page` |
| `rfq_submit_attempt` | User clicks submit on RFQ form | `form_type` ("universal"), `spoke`, `field_count_filled` |
| `rfq_submit_success` | RFQ API returns 201 | `form_type` ("universal"), `spoke`, `source_domain` |
| `rfq_submit_failure` | RFQ API returns non-2xx or network error | `error_code`, `fallback_triggered` (true) |
| `rfq_abandonment` | User exits page after `rfq_start` without `rfq_submit_success` | `last_field_focused`, `form_type` ("universal"), `spoke` |
| `file_download` | User downloads certification, datasheet, or document | `file_name`, `file_type`, `cert_type`, `spoke` |
| `hub_to_spoke_click` | User clicks a spoke navigation CTA from the hub | `spoke_target`, `cta_label`, `hub_section` |
| `portfolio_view` | User views a portfolio entry detail page | `project_type`, `client_category`, `related_spoke` |
| `certification_view` | User opens a certification detail page | `cert_type`, `cert_title` |
| `dashboard_login_success` | Authorized client successfully logs into `dashboard.dayaberkah.id` | `user_role`, `linked_rfq_submission_id` |
| `dashboard_login_failure` | Client login attempt fails | `failure_reason`, `attempt_source` |
| `tracking_status_view` | Authenticated client opens project/order tracking screen | `tracking_scope_type`, `tracking_id` |

---

## 5. Integrations, Routing, & Fallbacks

### 5.1 Greenfield Search Indexing & Canonical Architecture

As a greenfield platform build, `dayaberkah.id` establishes native search engine indexing, clean canonical URL structures, and structured data natively through Next.js 16 App Router capabilities without legacy redirect engine overhead.

**Canonical URL Engine.** Every route across hub (`dayaberkah.id`) and spokes (`*.dayaberkah.id`) declares its canonical URL using Next.js `metadata.alternates.canonical`. Cross-subdomain canonical mappings point to the authoritative spoke or hub root. Duplicate content risks between spokes are eliminated by explicit canonical declarations.

**Dynamic Sitemap Architecture.** XML sitemaps are generated dynamically per subdomain using Next.js App Router `sitemap.ts` files:
- `dayaberkah.id/sitemap.xml`: Hub pages, corporate portfolio, certifications hub, legal pages.
- `pju.dayaberkah.id/sitemap.xml`: PJU product catalog, category landing pages, spoke articles.
- `solarcell.dayaberkah.id/sitemap.xml`: Solar cell product catalog, category pages.
- `alatpetir.dayaberkah.id/sitemap.xml`: Lightning protection product catalog, category pages.
- `baterai.dayaberkah.id/sitemap.xml`: Industrial battery product catalog, category pages.

**Robots Policy.** `robots.txt` is generated dynamically via `robots.ts` per subdomain:
- Public marketing surfaces (hub & product spokes): Allow indexing of all public product, portfolio, and certification pages; block `/api/*` internal endpoints.
- Secure operational portal (`dashboard.dayaberkah.id`): `Disallow: /` across all search engines; include `X-Robots-Tag: noindex, nofollow` HTTP headers on all dashboard routes.

**Schema.org Structured Data.** Rich JSON-LD markup is embedded directly into layout and page components using Sanity CMS data:
- `Organization` & `CorporateContact` on hub root.
- `Product` & `Offer` on all spoke product detail pages (including specifications and datasheet references).
- `BreadcrumbList` on all category and sub-domain pages.
- `GovernmentOrganization` / `B2B` context tags on portfolio entries.

### 5.2 Notification Pipeline

New RFQ submissions and lead captures must trigger two parallel notification channels in near-real-time.

**Resend (Email).** Two email sends are triggered per successful RFQ submission: (1) a transactional acknowledgment email to the submitter confirming receipt and setting response-time expectations; (2) an internal notification email to the designated DBSN sales inbox with the full lead details and a link to the dashboard record. Resend templates must be maintained in version control. No raw API keys may be stored client-side.

When a lead is approved for Tracking Services, an additional provisioning email is sent to the designated client contact containing dashboard onboarding instructions and a secure login/reset path for `dashboard.dayaberkah.id`.

**Telegram Bot.** An internal Telegram bot sends an alert to the DBSN sales operations channel for every new RFQ submission. The alert payload includes: spoke, company name, product category, procurement type (if specified), and a direct dashboard link. The Telegram bot is also configured to alert on submission failures — if the RFQ API returns an error, the sales team is notified that a WhatsApp fallback was triggered. Optional secondary alerting is enabled for client-access provisioning and revocation actions for audit visibility.

### 5.3 Graceful Fallback System

The RFQ submission path must be resilient to API and database failures. No lead may be silently lost due to a technical failure. The graceful fallback system ensures that when the primary submission pipeline fails, the user is transparently transitioned to a pre-filled WhatsApp URL that carries the form data they have already entered.

**Implementation Details:**
- 3-retry exponential backoff queue with increasing delays (1s, 2s, 4s)
- If all retries fail, activate WhatsApp fallback with pre-filled URL
- Admin alert via Telegram if primary channel fails completely
- 0% acceptable lead loss — fallback must work in all failure scenarios

**Fallback UX Requirements.** The fallback state must be clearly communicated to the user — it should not appear as a silent failure. The fallback CTA copy must convey that their information will be carried over: e.g., *"Something went wrong on our end. Tap below to send your request via WhatsApp — your details are pre-filled."* The floating WhatsApp CTA in the fallback state must be elevated to a primary, full-width button, not the standard floating icon.

### 5.4 Integration Error Contracts

**Resend:** 3 retries with exponential backoff → queue for manual review on persistent failure; fallback to plain text template on rendering failure.

**Telegram Bot:** Rate limit (429) → backoff 60s; 5xx → retry twice; invalid token → alert admin via alternative channel.

**Sanity CMS:** Timeout > 10s → stale content with "Content might be outdated" banner; 404 → 410 Gone; 5xx → cached content with error state.

**Auth.js:** Invalid JWT → redirect with session-expired flag; provider unavailable → 503 Service Unavailable; rate limited → 429 with Retry-After.

---

## 6. Validation & Release Checkpoints

### 6.1 Design & UX QA

Design QA must be completed before any checkpoint sign-off. The following consistency checks must pass across all hub and spoke templates.

All pages must render correctly on three viewport breakpoints: 375px (mobile S), 768px (tablet), and 1280px (desktop). The shared design system token set — spacing, typography, color, border radius — must be identical across hub and spokes, confirmed via visual regression. No spoke may introduce a locally overridden Tailwind config. The floating WhatsApp CTA must be validated on mobile viewports across all page types to confirm it does not occlude RFQ form fields or the submit button. Universal RFQ form shells must render without horizontal scroll on 375px viewport. Dashboard login and tracking-status templates must pass the same mobile legibility and touch-target checks.

### 6.2 Tech & Load Testing

**RFQ Fallback Simulation.** A forced-failure test must be executed in the staging environment by deliberately making the Neon Postgres connection unavailable and submitting an RFQ. The expected outcome is: (1) GA4 `rfq_submit_failure` event fires with `fallback_triggered: true`; (2) fallback UI renders with correct pre-filled WhatsApp URL; (3) Telegram failure alert is received by the ops channel. This test is a hard launch gate.

**Sub-domain Routing Verification.** All configured spoke sub-domains, including `dashboard.dayaberkah.id`, must be verified to route correctly from Cloudflare to the correct Next.js app router segment.

**Dashboard Access & Data Isolation Test.** Validate client onboarding and login lifecycle end-to-end: account provisioning from qualified lead, first login flow, and tracking-status retrieval. Attempt cross-account access to confirm row-level isolation blocks unauthorized project/order visibility.

**Greenfield SEO & Canonical Audit.** Validate search engine readiness: (1) XML sitemaps render correctly on all subdomains; (2) canonical tags are present and accurate on all routes; (3) `robots.txt` permits public indexing while restricting `/api/*` and `dashboard.dayaberkah.id`; (4) Schema.org JSON-LD structured data parses cleanly without errors in Google Rich Results test.

**Load & Spike Testing.** Simulate realistic campaign spike traffic against the RFQ submission endpoint and hub homepage. Confirm Cloudflare edge caching behavior and Neon Postgres connection pool behavior under concurrent load.

### 6.3 Approval Gates

**End of Sprint 1 Gate.** Hub and at least one spoke routing operational in staging; greenfield SEO framework (canonical tags, `sitemap.ts`) active; RFQ pipeline writes successfully to Neon Postgres; certifications hub MVP live in staging.

**Mid Sprint 2 Gate.** Admin dashboard authentication and lead listing functional; Resend and Telegram notification workflows operational; WhatsApp integration tracked via GA4; dashboard sub-domain routing and login shell operational in staging.

**Pre-Launch Final Gate (Leadership Approval).** Full sprint presentation: minimum 20 portfolio entries; PSI mobile score 90+ on all key templates; CWV checks passing; RFQ fallback validated under forced failure test; dashboard access provisioning and data isolation test pass; greenfield SEO audit sign-off; go/no-go risk summary. Production deployment is blocked until explicit leadership approval is received.

---

## 7. Acceptance Criteria & Test Cases

### REQ-001: Main Hub Trust Platform

**Test Case 1: Hub Navigation**
- Given I am on the hub homepage dayaberkah.id
- When I click on any spoke navigation link
- Then I am redirected to the correct spoke subdomain
- And the shared design system is applied consistently

**Test Case 2: Certifications Access**
- Given I navigate to the certifications section
- When I click on any certification document
- Then I can download the document successfully
- And the download event is tracked in GA4

### REQ-004: Universal RFQ System

**Test Case 1: Universal Form Validation**
- Given I am viewing the Universal RFQ form
- When I submit an empty required field (e.g. fullName, email, phone, companyName, or item unitOfMeasure)
- Then I see inline validation messages and submission is blocked

**Test Case 2: Form Submission & Storage**
- Given I have completed the Universal RFQ form with contact details, companyName, cart items, and optional procurementType
- When I click submit
- Then one `rfq_submissions` header row and one or more `rfq_line_items` rows are created in Neon Postgres
- And I receive a confirmation page
- And Resend email is triggered and Telegram alert is sent to sales team

**Test Case 3: Fallback Trigger**
- Given the RFQ API returns a 500 error
- When I submit the RFQ form
- Then fallback UI is displayed with pre-filled WhatsApp URL
- And Telegram failure alert is sent
- And GA4 event `rfq_submit_failure` is tracked with `fallback_triggered: true`

### REQ-011: Client Tracking Portal

**Test Case 1: Client Authentication**
- Given I am a provisioned client user
- When I attempt to login to dashboard.dayaberkah.id via Auth.js v5 Credentials provider
- Then I can authenticate with valid credentials
- And I see only my authorized tracking projects (scoped by `tracking_scope_ids`)
- And unauthorized access attempts are logged

**Test Case 2: Data Isolation**
- Given I am logged in as Client A
- When I try to access data for Client B's project
- Then I am denied access and an audit log entry is created

### REQ-008: Greenfield Search Indexing & Canonical Architecture

**Test Case 1: Canonical Tag Verification**
- Given I access any page on dayaberkah.id or a spoke subdomain
- When I inspect the HTML head element
- Then a valid `<link rel="canonical" href="...">` tag points to the authoritative URL
- And no duplicate cross-subdomain canonical conflicts exist

**Test Case 2: Sitemap & Robots Verification**
- Given a search engine crawler accesses `/sitemap.xml` or `/robots.txt`
- Then `sitemap.xml` returns a valid list of public URLs for that subdomain
- And `robots.txt` permits public indexing while blocking `/api/*` and `dashboard.dayaberkah.id`

---

## 8. API Specifications

> **Note on `reference.md` alignment:** `docs/system/api/reference.md` documents a v0 schema (`{success, message, data}` envelope; flat `rfqSchema`). Both source drafts adopt a newer envelope and composite cart schema. The `reference.md` file requires a dedicated sync task to align with this PRD — that task is out of scope for this reconciliation. Until that sync is complete, this PRD is the authoritative specification for §8.

### 8.1 Response Format

All API responses must follow a single, strict envelope shape — every field is always present, `data` and `error` are mutually exclusive (whichever does not apply is `null`):

```json
{
  "success": true,
  "data": { },
  "error": null,
  "meta": {
    "timestamp": "2026-08-12T04:20:00.000Z",
    "requestId": "req_clx123abc456",
    "pagination": null
  }
}
```

`meta.pagination` is `null` for non-list endpoints and populated for list endpoints:

```json
"pagination": { "page": 1, "perPage": 20, "total": 100, "totalPages": 5 }
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      { "field": "contact.email", "message": "Must be a valid email address", "code": "invalid_format" }
    ]
  },
  "meta": {
    "timestamp": "2026-08-12T04:20:00.000Z",
    "requestId": "req_clx123abc456",
    "pagination": null
  }
}
```

> **Meta envelope specification (OQ-1 Resolved):** The envelope exhibits `meta: { timestamp, requestId, pagination }` without a `version` field. Because flat paths (`/api/rfq`) are used without URL versioning (`/api/v1/...`), injecting version strings into every response payload is unnecessary overhead.

**HTTP Status Codes:**
- 200 OK: Successful GET, PUT, PATCH (with response body)
- 201 Created: Successful POST (include Location header)
- 204 No Content: Successful DELETE
- 400 Bad Request: malformed JSON, invalid request
- 401 Unauthorized: missing or invalid authentication
- 403 Forbidden: authenticated but not authorized
- 404 Not Found: resource does not exist
- 409 Conflict: duplicate entry, state conflict
- 422 Unprocessable Entity: semantic validation error
- 429 Too Many Requests: rate limit exceeded
- 500 Internal Server Error: unexpected failure
- 503 Service Unavailable: upstream service failed

### 8.2 RFQ API Endpoint

**POST /api/rfq**

The request body is a single, unified composite cart payload (`rfqSubmissionSchema`) containing contact details, submission metadata (with optional `procurementType` and client-captured UTM attribution), and one or more cart line items. No top-level `segment` discriminator or `z.discriminatedUnion` is used.

```typescript
const contactInfoSchema = z.object({
  fullName:    z.string().min(2, "Nama minimal 2 karakter"),
  email:       z.string().email("Format email tidak valid"),
  phone:       z.string().min(10, "Nomor telepon minimal 10 digit"),
  companyName: z.string().min(2, "Nama perusahaan minimal 2 karakter"), // required field
});

const rfqMetaSchema = z.object({
  sourceDomain:    z.string(),
  sourcePagePath:  z.string(),
  procurementType: z.string().optional(), // optional for all submissions; presence signals B2G intent
  utmSource:       z.string().optional(),
  utmMedium:       z.string().optional(),
  utmCampaign:     z.string().optional(),
  utmTerm:         z.string().optional(),
  utmContent:      z.string().optional(),
});

const rfqCartItemSchema = z.object({
  spokeSegment:      z.enum(["pju", "solarcell", "alatpetir", "baterai"]),
  productCategory:   z.string(),
  quantity:          z.number().int().positive(),
  unitOfMeasure:     z.string().min(1, "Satuan unit wajib diisi"), // required field (OQ-4c)
  unitPriceEstimate: z.number().nonnegative().optional(), // optional buyer budget (OQ-4c)
  projectScope:      z.string().min(10, "Rincian proyek minimal 10 karakter"), // per line item (OQ-4b)
  timeline:          z.string().optional(), // per line item (OQ-4a)
  notes:             z.string().optional(), // per line item technical specs
});

// Single Universal RFQ Schema for all submissions
const rfqSubmissionSchema = z.object({
  contact: contactInfoSchema,
  meta:    rfqMetaSchema,
  items:   z.array(rfqCartItemSchema).min(1, "Minimal 1 barang dalam keranjang RFQ"),
});
```

**Example Request Body:**
```json
{
  "contact": {
    "fullName": "Budi Santoso",
    "email": "budi@pemkot.go.id",
    "phone": "+6281234567890",
    "companyName": "Dinas PU Kota Bandung"
  },
  "meta": {
    "sourceDomain": "pju.dayaberkah.id",
    "sourcePagePath": "/products/street-light",
    "procurementType": "Tender Langsung",
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "pju-2026-q3"
  },
  "items": [
    {
      "spokeSegment": "pju",
      "productCategory": "PJU Solar Cell All-in-One",
      "quantity": 200,
      "unitOfMeasure": "unit",
      "unitPriceEstimate": 4500000,
      "projectScope": "Street lighting for Kota Bandung area, APBD 2026",
      "timeline": "2026-12-31",
      "notes": "Termasuk instalasi & tiang 7m"
    }
  ]
}
```

**Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "rfq_clx123abc456",
    "submissionStatus": "received",
    "dashboardAccessStatus": "not_eligible",
    "itemCount": 1,
    "createdAt": "2026-08-12T04:20:00.000Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2026-08-12T04:20:00.000Z",
    "requestId": "req_clx789ghi012",
    "pagination": null
  }
}
```

**Validation Error (`422 Unprocessable Entity`):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      { "field": "contact.email", "message": "Must be a valid email address", "code": "invalid_format" },
      { "field": "items", "message": "Minimal 1 barang dalam keranjang RFQ", "code": "too_small" }
    ]
  },
  "meta": {
    "timestamp": "2026-08-12T04:20:00.000Z",
    "requestId": "req_clx789ghi012",
    "pagination": null
  }
}
```

### 8.3 Authentication Endpoints

Managed by **Auth.js v5** (edge-runtime JWT adapter) through the single catch-all route. There is no separate `/api/auth/login`, `/api/auth/client/login`, or custom auth endpoint.

- `GET/POST /api/auth/[...nextauth]` — handles all sign-in, callback, session, and sign-out flows for both roles.
  - **Admin/Viewer** (`role: "admin" | "viewer"`): Google OAuth — `GET/POST /api/auth/callback/google`.
  - **Client** (`role: "client"`): Credentials provider — `POST /api/auth/callback/credentials`, with `authorize()` validating against the `users` table (`role = "client"`, `is_active = true`) and rate-limiting failed attempts per email + IP.
  - `GET /api/auth/session` — resolves the current JWT session; `role` is the sole authorization gate.
  - `POST /api/auth/signout` — invalidates the session.

**Auth Session Object (Admin/Viewer):**
```json
{
  "user": {
    "id": "usr_clx123abc456",
    "name": "Admin DBSN",
    "email": "admin@dayaberkah.id",
    "image": "https://lh3.googleusercontent.com/a/...",
    "role": "admin",
    "trackingScopeIds": null
  },
  "expires": "2026-09-07T04:20:00.000Z"
}
```

**Auth Session Object (Client):**

For `role: "client"` sessions, `trackingScopeIds` is populated from `users.tracking_scope_ids` and is enforced server-side on every tracking-status read as a row-level ownership filter — never trusted from the client.

```json
{
  "user": {
    "id": "usr_clx789ghi012",
    "name": "Budi Santoso",
    "email": "budi@pemkot.go.id",
    "image": null,
    "role": "client",
    "trackingScopeIds": ["proj_abc123", "proj_def456"]
  },
  "expires": "2026-09-07T04:20:00.000Z"
}
```

**Rate Limiting:** 10 login attempts per 5 minutes per IP, enforced at middleware level before reaching Auth.js handlers.

---

## 9. Performance & SLAs

### 9.1 Technical Performance Targets

**Response Time:**
- TTFB (Time to First Byte): < 500ms (server), < 800ms (API)
- API endpoint response time: < 200ms (95th percentile)
- Database query time: < 50ms (with 10k records)

**Concurrency:**
- Concurrent users: 50 concurrent active sessions
- RFQ throughput: 10 submissions per second peak
- Connection pool: 10 connections for Neon Postgres

**File Handling:**
- Upload limits: PDF 10MB, images 2MB
- CDN cache: Documents 1 year, images 30 days
- Preload: Hero image and primary font only

### 9.2 Service Level Agreements

**Uptime:** 99.5% monthly uptime
- Downtime budget: 21.9 minutes per month
- Maintenance window: Scheduled 2-hour windows (max 1 per month)

**Performance:**
- Page load time: < 3 seconds for key pages
- API response time: < 500ms for 95% of requests
- Database query time: < 100ms for 99% of queries

**Data Retention:**
- Backup retention: 30 days
- Audit logs: 90 days (prod), 30 days (staging)
- User data retention: 3 years (per UU PDP compliance)

### 9.3 Monitoring & Alerting

**Uptime Monitoring:**
- Ping every 60 seconds; alert on 2 consecutive failures; PagerDuty integration

**Error Monitoring:**
- Error rate > 1% over 5 minutes; critical 5xx errors immediately

**RFQ Pipeline Health:**
- Submission success rate < 95%; failure rate increase > 10% in 1 hour; queue depth > 100

**Alerting Tiers:**
- P1 (Critical): PagerDuty + SMS (5 min response)
- P2 (High): Slack + Email (15 min response)
- P3 (Medium): Slack (2 hour response)
- P4 (Low): Daily summary email

---

## 10. Security & Compliance

### 10.1 Security Requirements

**Content Security Policy (CSP):**
```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.dayaberkah.id;
  frame-src 'none';
  object-src 'none';
```

**Security Headers:**
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

**Input Sanitization:**
- All user inputs must be validated with Zod schemas
- File uploads restricted by size, type, and extension
- No direct SQL queries — use parameterized queries via Prisma
- User HTML content sanitized with DOMPurify

### 10.2 Privacy & Compliance

**UU PDP Compliance:**
- Data collection limited to necessary information only
- Explicit consent for data processing
- Right to access and deletion (manual approval by Pramono)
- 3-year data retention period; regular privacy audits

**Data Handling:**
- No PII logged in analytics (GA4 raw events filtered)
- User data encrypted at rest (Neon Postgres)
- TLS 1.3 for all data transfers
- Regular security vulnerability scans

**Audit Trail:**
- All admin actions logged (90 days retention)
- Client access attempts logged; data modification timestamps preserved
- Regular security reviews by Ibu Mely

### 10.3 Authentication & Authorization

Authentication is managed entirely by **Auth.js v5** through the catch-all route `/api/auth/[...nextauth]`. No custom auth stack or separate login endpoints exist. See §8.3 for the full endpoint description.

**JWT Token Management (via Auth.js v5):**
- Tokens stored in httpOnly cookies (not localStorage)
- Token expiration: 24 hours for clients, 8 hours for admin
- Refresh token mechanism implemented via Auth.js session config
- Invalid tokens redirect with session-expired flag

**Role-Based Access Control:**
- Admin: Full system access
- Viewer: Read-only access to leads
- Client: Access only to own tracking data (scoped by `tracking_scope_ids`)

**Row-Level Security:**
- Dashboard users can only see their `tracking_scope_ids`
- Users linked to their `rfq_submissions` record via `linked_rfq_submission_id`
- Soft delete on submission deletion (ON DELETE SET NULL)

---

## 11. Environment Configuration

### 11.1 Environment Variables

This list is authoritative-by-reference to [configuration-schema.md](file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md). No variable may appear here that is not listed there, and every variable listed there appears here. The exact variable names from `configuration-schema.md` are used without modification.

**Required Variables:**
```bash
# Database (High Sensitivity)
DATABASE_URL="postgresql://user:pass@host/db"          # Neon Postgres pooled connection string
DIRECT_URL="postgresql://user:pass@host/db"             # Neon Postgres direct non-pooled string

# Authentication (High Sensitivity)
NEXTAUTH_SECRET="auth-secret-here"                       # min 32 chars — Auth.js session JWT key
NEXTAUTH_URL="https://dayaberkah.id"                     # Canonical app URL

# Content (High Sensitivity)
SANITY_PROJECT_ID="your-project-id"
SANITY_DATASET="production"
SANITY_API_READ_TOKEN="sanity-read-token"

# Notifications (High Sensitivity)
RESEND_API_KEY="resend-api-key"
TELEGRAM_BOT_TOKEN="telegram-bot-token"
TELEGRAM_CHAT_ID="telegram-chat-id"
```

**Optional Variables:**
```bash
SANITY_WRITE_TOKEN="sanity-write-token"                  # mutation webhooks only
GOOGLE_CLIENT_ID="google-oauth-client-id"                # Auth.js Google provider (admin/viewer OAuth)
GOOGLE_CLIENT_SECRET="google-oauth-client-secret"
CRON_SECRET="cron-bearer-token"                          # auth bearer for scheduled jobs
```

**Production Secrets — Cloudflare Pages (via Wrangler):**
```bash
npx wrangler pages secret put DATABASE_URL
npx wrangler pages secret put NEXTAUTH_SECRET
npx wrangler pages secret put RESEND_API_KEY
npx wrangler pages secret put TELEGRAM_BOT_TOKEN
npx wrangler pages secret put TELEGRAM_CHAT_ID
```

> **Note — GSC/GA variables are intentionally excluded here.** `GA_TRACKING_ID`, `GSC_SERVICE_ACCOUNT_JSON`, `GSC_VERIFICATION_CODE`, and `NEXT_PUBLIC_GSC_VERIFICATION` are real, in-use variables (see `docs/engineering/playbooks/gsc-setup.md`) but are not part of `configuration-schema.md`'s core-runtime matrix. Follow-up needed: either extend `configuration-schema.md` with an "Analytics & Indexing" section, or document them solely in the GSC playbook — this PRD reconciliation does not decide that split.

### 11.2 Feature Flags

```typescript
export const featureFlags = {
  rfqSystem:        { enabled: true,  rolloutPercentage: 100 },
  clientTracking:   { enabled: true,  rolloutPercentage: 80 },  // Gradual rollout
  newDesignSystem:  { enabled: true,  rolloutPercentage: 100 },
  imageOptimization:{ enabled: true,  rolloutPercentage: 100 },
}
```

Rules: always check feature flags before new functionality; use percentage-based rollout; include override for emergency disable; document flag usage in code.

---

## 12. Rollback Plan

**Rollback Trigger Conditions:**
1. Production uptime < 99.5% for 1 hour
2. >20% of requests return 404 errors
3. Critical failure in RFQ pipeline > 1 hour
4. Security incident confirmed
5. Performance degradation > 50%

**Rollback Execution:**
- Authority: Pramono (must be executed within 4 hours)
- Procedure: Cloudflare deployment rollback to previous stable version
- Communications: Notify sales team via Telegram immediately
- Testing: Verify rollback in staging before production deployment

**Post-Rollback Actions:**
1. Notify all stakeholders (Pramono, Ibu Mely, sales team)
2. Conduct post-mortem analysis
3. Implement fixes
4. Schedule relaunch with additional monitoring
5. Update rollback triggers if needed

**Rollback Checklist:**
- [ ] Verify backup availability and integrity
- [ ] Prepare rollback command/script
- [ ] Confirm Pramono availability for execution
- [ ] Setup monitoring for rollback success
- [ ] Prepare stakeholder communication plan

---

## 13. Resolved Architectural Decisions (v3.6 Baseline)

All architectural decisions from Phase 0 discovery through v3.6 realignment are locked against system requirements and business constraints. The decisions and rationales below constitute the baseline for implementation.

---

### Decision #1 (OQ-1) — Meta Envelope Shape

- **Decision:** Adopt Draft B envelope structure (`meta: { timestamp, requestId, pagination }`, omitting `version`).
- **Rationale:** Flat route architecture (`/api/rfq`) operates without URL versioning (`/api/v1/...`). Injecting `version` strings into every response payload creates unnecessary overhead without consumers.
- **Implementation Impact:** Applied uniformly across all success and error examples (§8.1, §8.2).

---

### Decision #2 (OQ-2) — Nested Payload Structure

- **Decision:** Adopt nested payload structure (`{ contact: {...}, meta: {...}, items: [...] }`).
- **Rationale:** Maps 1:1 to database tables (`rfq_submissions` header & `rfq_line_items` children), eliminating manual destructuring and preventing field name collisions.

---

### Decision #3 (OQ-3) — UTM Attribution Handling

- **Decision:** Include client-captured UTM parameters (`utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`) as optional fields in `rfqMetaSchema`.
- **Rationale:** GA4 `_ga` cookies are unstable for backend parsing, and `Referer` headers are frequently stripped by modern browser policies. Client captures query parameters on first landing, persists in `sessionStorage`, and submits in payload.
- **Implementation Impact:** Stored in `rfq_submissions` header table columns.

---

### Decision #4 (OQ-4) — Cart Item Fields & Timeline Placement

- **Decision:** Position `timeline` and `projectScope` per line-item in `rfqCartItemSchema`; set `unitOfMeasure` as a required field; set `unitPriceEstimate` as an optional field.
- **Rationale:** Accommodates multi-spoke carts with divergent schedules and prevents buyer friction/abandonment.

---

### Decision #5 (OQ-5) — Header vs Line-Item Columns

- **Decision:** Add `source_campaign_tag` (nullable internal column) and submission-level `notes` (general buyer context) to `rfq_submissions` header table, coexisting with per-item technical `notes` in `rfq_line_items`.
- **Rationale:** Fills operational cross-domain source attribution requirements while keeping general context distinct from product technical specs.

---

### Decision #6 (OQ-6) — Universal RFQ Architecture Transition (v3.5)

- **Decision:** Transition the RFQ system from dual segmented schemas (`rfqB2BSchema` & `rfqB2GSchema`) into a single **Universal RFQ Form** (`rfqSubmissionSchema`) across all hub and spoke entry points. Completely remove the `segment` column from the `rfq_submissions` database table. Set `companyName` as a required field (`min(2)`).
- **Rationale:** Eliminates buyer cognitive load and form abandonment caused by forcing users to self-identify upfront as B2B or B2G. Segment classification occurs dynamically in reporting queries and Admin Dashboard views based on `procurementType` presence and user/company metadata.
- **Technical Invariants:**
  1. No `segment` field exists in Zod request schemas or database tables.
  2. No `z.discriminatedUnion` or backend segment discrimination code exists in API route handlers.
  3. `companyName` is required in the contact block (`z.string().min(2, "Nama perusahaan minimal 2 karakter")`); `procurementType` is optional in the meta block across all submissions.
  4. Lead segment classification (B2B vs B2G) is derived post-submission in the Admin Dashboard without blocking client conversion.

---

### Decision #7 — Greenfield Build Strategy — Native SEO Architecture (v3.6)

- **Decision:** Build `dayaberkah.id` and its spoke subdomains as a pure **greenfield platform** from scratch, completely removing legacy 301 redirect engine infrastructure, legacy URL mapping inventories, Cloudflare Edge redirect Workers, `/api/redirects/lookup` endpoints, and the `redirect_map` database table.
- **Rationale:** PT Daya Berkah Sentosa Nusantara is launching a modern, unified platform built from scratch. Eliminating legacy redirect runtime overhead prevents edge bundle bloat, eliminates database lookup latency, and avoids maintaining legacy URL debt.
- **Technical Invariants:**
  1. Search engine optimization is handled purely natively via Next.js 16 `Metadata` API canonical tags, dynamic `sitemap.ts`, `robots.ts`, and Schema.org JSON-LD structured data.
  2. Zero 301 redirect tables (`redirect_map`) exist in Neon Postgres or Prisma schema.
  3. Zero redirect lookup routes (`/api/redirects/lookup`) or Cloudflare Edge redirect Workers exist in the codebase.
  4. Testing suites evaluate greenfield indexability, canonical tag accuracy, and JSON-LD schema validity rather than legacy URL redirects.

---

*End of PRD — Version 3.6*

*This document represents the Greenfield Platform Baseline (v3.6) for the DBSN Centralized Digital Ecosystem. All architectural decisions are locked against authoritative environment specs (`configuration-schema.md`, `reference.md`, and `execution-lifecycle.md`).*
