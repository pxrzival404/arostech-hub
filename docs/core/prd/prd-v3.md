# PRD: DBSN Centralized Digital Ecosystem

**Author:** Pramono (Product Owner)
**Date:** 2026-05-13
**Status:** Production Ready
**Version:** 3.1
**Approval:** Pramono, Ibu Mely (Content Approver)
**Taskmaster Optimized:** Yes

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
   - 5.1 [SEO Migration Engine](#51-seo-migration-engine)
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

---

## 1. Problem Statement & System Context

### 1.1 Background / Latar Belakang Masalah

DBSN's digital presence is currently fragmented across three independently operated legacy domains: `pjusolarcellindonesia.com`, `sentradaya.com`, and `alatpenangkalpetir.co.id`. While this multi-domain strategy accumulated meaningful keyword-level SEO coverage, it has created a set of compounding structural problems that now impede qualified conversion.

**Trust Fragmentation.** Government and B2B buyers encountering inconsistent brand footprints across three separate domains cannot form a unified vendor confidence signal. For procurement-critical contexts (B2G, EPC, BUMN), this fragmentation directly undermines vendor shortlisting.

**RFQ Drop-Off.** The dominant conversion path is WhatsApp-only. There is no structured, segmented RFQ form with field-level capture for product category, project scope, procurement timeline, or buyer segment. This limits DBSN's ability to qualify inbound intent and creates invisible drop-off with no recovery mechanism.

**Post-RFQ Visibility Gap.** After successful inquiry submission, clients currently have no secure self-service surface to monitor project or order progression. This creates repeated manual status inquiries, increases operational load on sales/admin teams, and weakens the trust signal for enterprise procurement journeys that expect transparent status tracking.

**Operational Overhead.** Content, lead management, and analytics are siloed per domain. There is no unified dashboard, no cross-domain source attribution, and no single operational surface for the sales team to work from.

**Why Solve This Now.** DBSN has outgrown the multi-site model. SEO migration risk increases non-linearly if not addressed as a structured initiative. Competition in B2B digital channels for renewable and electrical infrastructure is intensifying, and an internal strategic directive has explicitly prioritized trust signal architecture and conversion infrastructure as the next growth unlock.

### 1.2 Target Audience

DBSN's digital platform serves two distinct buyer segments, each with materially different intent signals, compliance requirements, and conversion path expectations.

**Segment A — B2G: Government Procurement Officers**

This segment includes PPK (Pejabat Pembuat Komitmen), Pengadaan staff, and BUMN procurement officers. These users are process-bound: they must validate that DBSN meets regulatory compliance requirements (SNI, TKDN, LKPP registration) before any engagement can proceed. Their primary journey is a trust-verification loop: they arrive looking for credentials, certifications, and structured references. The RFQ they submit is a formal inquiry, not a casual interest signal. Friction in this path — whether due to unavailable documents, non-structured contact flows, or form failures — directly causes disqualification at the vendor shortlisting stage. Once qualified and active, these users also expect visibility into procurement and delivery progress through a controlled tracking portal.

**Segment B — B2B: Private Sector Technical Buyers**

This segment includes procurement managers at private enterprises, EPC (Engineering, Procurement & Construction) project engineers, and facility managers. These users are efficiency-driven: they want to compare technical specifications, access datasheets, and initiate a scoped inquiry as quickly as possible. They are more tolerant of WhatsApp as a parallel channel but respond positively to structured self-service. Friction in this path is experienced as unnecessary form complexity or missing technical documentation — resulting in quiet abandonment. After RFQ qualification, these users require a secure login to track project/order status without relying solely on manual follow-up.

### 1.3 High-Level Architecture

The locked architectural model is a **Hub-and-Spoke Sub-domain Architecture** delivered from a **single Next.js 16 application** with middleware-based subdomain routing. The hub operates on the root domain and functions as the corporate trust center: it hosts the company profile, certifications, cross-sector portfolio, and routing CTAs that direct users to the appropriate product spoke. Each product spoke is a dedicated sub-domain (e.g., `pju.sentradaya.com`, `solarcell.sentradaya.com`, `alatpetir.sentradaya.com`, `baterai.sentradaya.com`) hosting product-cluster content, product pages, and the segmented RFQ entry point.

In Version 3.1, the architecture is extended with a dedicated secure access spoke: **`dashboard.sentradaya.com`**. This sub-domain functions as the client login and tracking services portal (Layanan Pelacakan) for B2B and B2G clients who have successfully progressed through RFQ and qualification workflows. The dashboard is not a public marketing surface; it is an authenticated operational surface linked to client-specific tracking/project identifiers.

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

    Root["🏢 sentradaya.com (Hub)\nCorporate Trust Center\nCertifications · Portfolio · Routing"]
    Root -->|"Middleware Routing"| S1["🌐 pju.sentradaya.com\nPJU / Street Lighting\nSpoke"]
    Root -->|"Middleware Routing"| S2["🌐 solarcell.sentradaya.com\nSolar Cell\nSpoke"]
    Root -->|"Middleware Routing"| S3["🌐 alatpetir.sentradaya.com\nLightning Protection\nSpoke"]
    Root -->|"Middleware Routing"| SN["🌐 baterai.sentradaya.com\nAdditional Spokes\n(extensible)"]
    Root -->|"Secure access"| SD["🔐 dashboard.sentradaya.com\nClient Tracking Services\n(B2B/B2G Login Portal)"]
    subgraph SingleApp ["📦 Single Next.js 16 App"]
        direction TB
        NextJS["App Router + Middleware\n(shared codebase)"]
        DesignSystem["Tailwind CSS + Radix UI\n(shadcn/ui patterns)"]
        SanityFed["Sanity.io CMS\n(content federation)"]
        PrismaORM["Prisma ORM\n(type-safe migrations)"]
    end
    subgraph DataLayer ["🗄️ Data & Integrations Layer"]
        direction TB
        PS[("Neon Postgres\nTransactional DB\nLeads · RFQ · Users · Tracking Links")]
        Auth["Auth.js v5\n(Admin + Client Auth)"]
        Notif["Resend + Telegram Bot\n(Notifications)"]
        GA["GA4 + GSC + Cloudflare Analytics\n(Unified Telemetry)"]
        Mon["Phase 2: Sentry + PostHog\n(Error Tracking · Session Replay)"]
    end
    subgraph EdgeLayer ["⚡ Delivery Layer"]
        CF["Cloudflare Pages\n(Edge Hosting · CDN · Redirect Engine)"]
    end
    S1 & S2 & S3 & SN & SD --> NextJS
    NextJS --> DesignSystem
    NextJS --> SanityFed
    NextJS --> PS
    PS --> Auth
    PS --> Notif
    NextJS --> GA
    NextJS --> Mon
    NextJS --> CF
    Legacy1["pjusolarcellindonesia.com\n(legacy)"] -.->|"301 Redirect"| CF
    Legacy2["sentradaya.com\n(legacy)"] -.->|"301 Redirect"| CF
    Legacy3["alatpenangkalpetir.co.id\n(legacy)"] -.->|"301 Redirect"| CF
    class Legacy1 entry
    class Legacy2 entry
    class Legacy3 entry
```

### 1.4 Success Metrics & KPIs

| # | Goal | Primary Metric | Target | Timeframe | Measurement Method |
|---|------|----------------|--------|-----------|-------------------|
| G1 | Preserve & Consolidate SEO Equity | Post-migration organic traffic retention | ≥ 70% of combined pre-migration baseline | Months 1–6 post-launch | GA4 + GSC + Cloudflare Analytics |
| G2 | Increase Qualified Conversion | Qualified RFQ submissions / month | MoM uplift vs. WhatsApp-only baseline | First 3 months post-launch | Centralized dashboard with source attribution |
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

Two primary user journeys govern the conversion architecture: the **B2G Government Procurement Validation Flow** and the **B2B Private Technical Buyer Flow**. Both journeys must be designed to minimize friction at the qualification and submission stage while enabling a controlled transition to post-submission tracking access for eligible clients.

#### B2G — Government Procurement Validation Flow

The government buyer arrives with a compliance-first mindset. They must verify legal and regulatory credentials before any contact is initiated. The platform must meet them at this intent: surfacing certifications, portfolio references, and a government-labeled RFQ form without requiring them to navigate away from a structured, trustworthy context.

```mermaid
---
config:
  layout: elk
---
flowchart TD
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

    A(["👤 Government Procurement Officer\n(PPK / Pengadaan / BUMN)"])
    A --> B["Landing: Hub Root Domain sentradaya.com"]
    B --> C{"Intent Detection:\nNavigation Choice"}
    C -->|"Certifications / Compliance"| D["📄 Certifications Hub\nSNI · TKDN · LKPP Docs"]
    C -->|"Portfolio / References"| E["🏗️ Project Portfolio\nFiltered by Sector / Type"]
    C -->|"Product Info"| F["🌐 Navigate to Relevant Spoke\ne.g. pju.sentradaya.com"]
    D --> G["Download Document\n(GA4: file_download event)"]
    E --> H["View Project Reference\nLinked to Relevant Spoke"]
    F --> I["Spoke: Product Detail Page\nSpecs · Docs · CTA"]
    G & H & I --> J{"Ready to Engage?"}
    J -->|"Yes"| K["📋 Government RFQ Form\nSegmented: B2G Fields\n(Project name, DIPA ref, quantity,\ntimeline, procurement type)"]
    J -->|"Not yet"| L["Continue Browsing\n(re-entry loop)"]
    K --> M{"Form Submission"}
    M -->|"Success"| N["✅ Confirmation Page\n+ Resend Email ACK\n+ Telegram Alert → Sales"]
    N --> Q{"Qualified / Converted to Active Project?"}
    Q -->|"Yes"| R["🔐 Provision Client Account\nfor dashboard.sentradaya.com"]
    R --> S["📊 Tracking Services Access\n(Project / Order Status)"]
    Q -->|"Not yet"| T["Standard Sales Follow-up\nwithout dashboard access"]
    M -->|"API / DB Failure"| O["⚠️ Fallback Handler\nPre-filled WhatsApp URL\nwith captured form data"]
    O --> P["📱 WhatsApp Handoff\nLead not lost"]
    class A entry
    class K conversion
    class M conversion
    class N conversion
    class O conversion
    class P conversion
    class R conversion
```

#### B2B — Private Technical Buyer Flow

The private sector buyer arrives with a product-research or spec-validation intent. They move through spoke product pages, consume technical documentation, and expect a fast path to inquiry initiation. WhatsApp remains available throughout as a parallel channel but should not be the only structured option.

```mermaid
flowchart TD
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

    A(["👤 B2B Private Buyer\n(Procurement Mgr / EPC Engineer / Facility Mgr)"])
    A --> B{"Entry Point"}
    B -->|"Direct / Campaign"| C["Hub: sentradaya.com\nCompany Overview + Spoke CTAs"]
    B -->|"SEO / Organic"| D["Spoke Landing Page\n(direct to product cluster)"]
    C --> E["🌐 Navigate to Product Spoke\ne.g. solarcell.sentradaya.com"]
    D --> E
    E --> F["Product Catalogue / Category Page\nSpecs · Filters · Comparison"]
    F --> G["📄 Product Detail Page\nSpec sheet · Datasheet · CTA"]
    G --> H{"Conversion Action"}
    H -->|"Structured Inquiry"| I["📋 B2B RFQ Form\nSegmented: Private Fields\n(Product, scope, quantity, timeline, contact)"]
    H -->|"Quick Contact"| J["📱 WhatsApp Click-to-Chat\n(GA4: whatsapp_click event tracked)"]
    H -->|"Download"| K["📥 Datasheet / Technical Doc\n(GA4: file_download event)\nNo mandatory sign-up — Phase 1"]
    I --> L{"Form Submission"}
    L -->|"Success"| M["✅ Confirmation\n+ Resend ACK Email\n+ Telegram Alert → Sales"]
    M --> Q{"Qualified / Converted to Active Project?"}
    Q -->|"Yes"| R["🔐 Provision Client Account\nfor dashboard.sentradaya.com"]
    R --> S["📊 Tracking Services Access\n(Project / Order Status)"]
    Q -->|"Not yet"| T["Standard Sales Follow-up\nwithout dashboard access"]
    L -->|"API / DB Failure"| N["⚠️ Fallback Handler\nPre-filled WhatsApp URL"]
    N --> O["📱 WhatsApp Handoff\nLead not lost"]
    K --> P["Re-engagement CTA\n(RFQ or WhatsApp)"]
    P --> I
    class A entry
    class I conversion
    class J conversion
    class L conversion
    class M conversion
    class N conversion
    class O conversion
    class R conversion
```

### 2.2 Shared Design System

All spokes must render identically from the perspective of design token compliance. Differentiation between spokes is strictly content-driven — never the result of divergent component implementations or style overrides.

The design system is built on **Tailwind CSS** (utility-first styling with a shared token configuration) and **Radix UI** (accessible, headless component primitives). Component configurations — spacing scale, typography scale, color tokens, border radii, breakpoints — are defined once in the monorepo root and consumed by all apps. No spoke may introduce a local `tailwind.config.js` that deviates from the root configuration.

Key shared component categories include: navigation headers, trust-badge blocks, certification card components, product spec tables, RFQ form shells (variant: B2G / B2B), floating CTA wrappers, portfolio grid components, document download cards, secure authentication forms, and tracking status cards for dashboard views.

### 2.3 Mobile-First & Accessibility

DBSN's target audience operates in Indonesia's mobile-dominant usage context. All UX decisions must be made mobile-first, with desktop treated as a progressive enhancement.

**Floating CTA Rule (Critical).** The persistent WhatsApp floating CTA must never obscure RFQ form fields or the form's primary submit action on mobile viewports. On screens where the form is active, the CTA must either collapse, reposition, or render in a non-overlapping fixed zone. This is a hard launch gate requirement validated in QA.

**Mobile Form UX.** RFQ forms must be thumb-navigable: sufficient tap-target sizing (minimum 44px), no horizontally scrolling form containers, native mobile input types (`tel`, `email`, `date`) where applicable, and clear inline validation messaging. Dashboard login forms must follow the same touch and readability standards.

**Performance as Accessibility.** A PSI score of 90+ on key mobile templates is a proxy for accessibility in bandwidth-constrained environments. Large image assets must use `next/image` with proper lazy loading. No unoptimized media may ship to production.

---

## 3. Functional & Non-Functional Requirements

### 3.1 Functional Requirements

#### Must Have (P0) — Critical for Launch

**REQ-001 — Main Hub Trust Platform.** Implement the root-domain hub including company profile, legal credibility content, certifications access, cross-sector portfolio navigation, and routing CTAs to all active spokes. Acceptance: Hub links all active spokes with consistent UX; certifications section supports downloadable files; portfolio section is first-class navigation.

**REQ-002 — Product Spoke Sub-domains.** Each product cluster must operate on a dedicated sub-domain (`pju.`, `solar.`, `lightning.`, etc.) with shared codebase templates and distinct data-driven product content. Acceptance: Sub-domain routing is operational; shared design system applied identically across spokes; content differences are Sanity-driven, not code forks.

**REQ-003 — Certifications Hub.** Centralized document trust center for SNI, TKDN, LKPP, and supporting legal artifacts. Acceptance: Structured metadata per document; download access functional on mobile and desktop; document pages indexable where appropriate.

**REQ-004 — Structured RFQ System (Segmented).** Segmented RFQ forms for Government (B2G) and Private (B2B) pathways with structured fields and server-side validation. Acceptance: Government and private variants are distinct in copy and field schema; captures product category, specs, quantity, timeline, and contact; malformed submissions blocked by validation; submissions persist reliably in Neon Postgres.

**REQ-005 — Persistent WhatsApp Integration (Non-Blocking UX).** Site-wide persistent click-to-chat CTA that does not obstruct RFQ form interactions on mobile. Acceptance: Floating CTA available site-wide; obstruction-safe behavior on RFQ screens; all WhatsApp click events tracked to GA4.

**REQ-006 — Project Portfolio (First-Class Feature).** Portfolio must be a core navigation feature with structured entries, sector filtering, and contextual spoke linking. Acceptance: Minimum 20 structured entries before Phase 1 launch approval; entries include project type, client category, location, scope, and outcome.

**REQ-007 — Centralized Lead & RFQ Data Pipeline.** All inbound RFQs and leads from all hub/spoke entry points must write to a single Neon Postgres transactional database with source attribution. Acceptance: Schema supports full lead lifecycle fields and source tags; all submission endpoints write with retry/error handling; dashboard reflects near-real-time updates.

**REQ-008 — SEO Migration & Redirect System.** Preserve accumulated SEO equity via complete 301 migration mapping from legacy domains to the new architecture. Acceptance: URL mapping table covers all indexed/high-value pages; legacy URLs without direct mapping 301 to nearest parent category — never an unresolved 404 during the migration window; canonical rules implemented on all new pages.

**REQ-009 — Notification Workflow.** New RFQs and leads trigger operational notifications. Acceptance: Transactional email via Resend for RFQ acknowledgment and internal notice; Telegram alert for near-real-time internal follow-up.

**REQ-010 — Authenticated Admin Dashboard.** Centralized dashboard for lead/RFQ management using Auth.js v5. Acceptance: Secure login and protected routes; lead list with filter, search, and source tag columns; segment-based views (Government vs. Private); export-ready data structure.

**REQ-011 — Authenticated Client Tracking Portal (`dashboard.sentradaya.com`).** Implement secure B2B/B2G client login for Tracking Services (Layanan Pelacakan), linked to approved RFQ/project records. Acceptance: dedicated sub-domain routing active; only provisioned client accounts can authenticate; authenticated clients can view only their associated project/order tracking statuses; unauthorized access attempts are denied and logged.

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

**Client Portal Authentication.** `dashboard.sentradaya.com` must use secure authenticated access for provisioned B2B/B2G clients only. Client users must be explicitly linked to lead/project tracking records. Access scope must enforce row-level ownership constraints so clients can only retrieve their own tracking data. Session handling, password policy/reset flow, and login attempt throttling are mandatory.

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

**`leads` table** — `id` (CUID), `created_at`, `updated_at`, `segment` (enum: B2G | B2B), `source_domain`, `source_page_path`, `source_campaign_tag`, `utm_source`, `utm_medium`, `utm_campaign`, `contact_name`, `contact_email`, `contact_phone`, `company_name`, `product_category`, `quantity`, `project_scope`, `timeline`, `procurement_type` (B2G only), `notes`, `submission_status` (enum: received | contacted | qualified | disqualified), `fallback_triggered` (boolean — was WhatsApp fallback activated?), `fallback_wa_url` (if triggered), `tracking_project_id` (nullable, assigned when lead progresses to tracked project/order), `dashboard_access_granted_at` (nullable datetime), `dashboard_access_status` (enum: not_eligible | pending | granted | revoked).

*Indexes Required:* `segment`, `created_at`, `source_domain`, `email` (unique constraint)

**`users` table** — `id`, `email`, `name`, `role` (enum: admin | viewer | client), `created_at`, `linked_lead_id` (nullable FK to `leads.id`), `client_company_name` (nullable), `tracking_scope_type` (nullable enum: project | order), `tracking_scope_ids` (nullable JSON array of authorized tracking/project IDs), `last_login_at` (nullable datetime), `is_active` (boolean default true) — used for internal dashboard authentication and authenticated client tracking access via Auth.js v5.

*Constraints:* `linked_lead_id` ON DELETE SET NULL for soft delete handling

**`redirect_map` table** — `legacy_url`, `target_url`, `spoke` — used by the edge redirect engine to resolve 301 mappings at runtime without code deploys.

### 4.3 Analytics & Telemetry Strategy

All GA4 events must be instrumented at launch. These are mandatory — not optional enhancements.

| Event Name | Trigger | Key Parameters |
|---|---|---|
| `whatsapp_click` | User taps/clicks any WhatsApp CTA | `source_page`, `spoke`, `cta_location` (floating \| inline \| fallback) |
| `rfq_start` | User focuses first field in RFQ form | `form_type` (B2G \| B2B), `spoke`, `source_page` |
| `rfq_submit_attempt` | User clicks submit on RFQ form | `form_type`, `spoke`, `field_count_filled` |
| `rfq_submit_success` | RFQ API returns 200 | `form_type`, `spoke`, `source_domain` |
| `rfq_submit_failure` | RFQ API returns non-200 or network error | `error_code`, `fallback_triggered` (true) |
| `rfq_abandonment` | User exits page after `rfq_start` without `rfq_submit_success` | `last_field_focused`, `form_type`, `spoke` |
| `file_download` | User downloads certification, datasheet, or document | `file_name`, `file_type`, `cert_type`, `spoke` |
| `hub_to_spoke_click` | User clicks a spoke navigation CTA from the hub | `spoke_target`, `cta_label`, `hub_section` |
| `portfolio_view` | User views a portfolio entry detail page | `project_type`, `client_category`, `related_spoke` |
| `certification_view` | User opens a certification detail page | `cert_type`, `cert_title` |
| `dashboard_login_success` | Authorized client successfully logs into `dashboard.sentradaya.com` | `user_role`, `segment`, `linked_lead_id` |
| `dashboard_login_failure` | Client login attempt fails | `failure_reason`, `attempt_source` |
| `tracking_status_view` | Authenticated client opens project/order tracking screen | `tracking_scope_type`, `tracking_id`, `segment` |

---

## 5. Integrations, Routing, & Fallbacks

### 5.1 SEO Migration Engine

The SEO migration is one of the highest-risk elements of this project. The rule is absolute: **no legacy indexed URL may resolve to a 404 during the migration window, under any condition.**

**URL Mapping Strategy.** A complete URL inventory must be produced for all three legacy domains before Sprint 1 ends, covering all pages indexed in Google Search Console, all pages with inbound backlinks, and all high-traffic organic landing pages from GA4. Each URL must be mapped to its target in the new architecture (hub page, spoke page, product page, or portfolio entry).

**Redirect Execution.** 301 redirects are executed at the Cloudflare edge layer using the `redirect_map` table stored in Neon Postgres. This allows redirect rules to be updated without code deploys. Cloudflare Workers handle URL resolution: exact match first, then pattern match, then parent-category fallback.

**Fallback Hierarchy.** For legacy URLs that cannot be mapped to a specific page, the fallback chain is: (1) nearest parent category on the relevant spoke; (2) the spoke homepage; (3) the hub homepage. An unresolved 404 is never the terminal state during the migration window.

**Canonical Implementation.** All new pages must implement `<link rel="canonical">` pointing to their authoritative URL. Cross-domain canonicals must be reviewed and cleared before launch.

### 5.2 Notification Pipeline

New RFQ submissions and lead captures must trigger two parallel notification channels in near-real-time.

**Resend (Email).** Two email sends are triggered per successful RFQ submission: (1) a transactional acknowledgment email to the submitter confirming receipt and setting response-time expectations; (2) an internal notification email to the designated DBSN sales inbox with the full lead details and a link to the dashboard record. Resend templates must be maintained in version control. No raw API keys may be stored client-side.

When a lead is approved for Tracking Services, an additional provisioning email is sent to the designated client contact containing dashboard onboarding instructions and a secure login/reset path for `dashboard.sentradaya.com`.

**Telegram Bot.** An internal Telegram bot sends an alert to the DBSN sales operations channel for every new RFQ submission. The alert payload includes: segment (B2G/B2B), spoke, company name, product category, and a direct dashboard link. The Telegram bot is also configured to alert on submission failures — if the RFQ API returns an error, the sales team is notified that a WhatsApp fallback was triggered. Optional secondary alerting is enabled for client-access provisioning and revocation actions for audit visibility.

### 5.3 Graceful Fallback System

The RFQ submission path must be resilient to API and database failures. No lead may be silently lost due to a technical failure. The graceful fallback system ensures that when the primary submission pipeline fails, the user is transparently transitioned to a pre-filled WhatsApp URL that carries the form data they have already entered.

**Implementation Details:**
- 3-retry exponential backoff queue with increasing delays (1s, 2s, 4s)
- If all retries fail, activate WhatsApp fallback with pre-filled URL
- Admin alert via Telegram if primary channel fails completely
- 0% acceptable lead loss - fallback must work in all failure scenarios

**Fallback UX Requirements.** The fallback state must be clearly communicated to the user — it should not appear as a silent failure. The fallback CTA copy must convey that their information will be carried over: e.g., *"Something went wrong on our end. Tap below to send your request via WhatsApp — your details are pre-filled."* The floating WhatsApp CTA in the fallback state must be elevated to a primary, full-width button, not the standard floating icon.

### 5.4 Integration Error Contracts

**Resend Integration Error Contract:**
- Timeout: 3 retries with exponential backoff
- Persistent failure: Queue for manual review
- Template rendering failure: Fallback to plain text template

**Telegram Bot Integration Error Contract:**
- Rate limiting (429): Backoff 60 seconds
- Server errors (5xx): Retry 2 times
- Invalid bot token: Alert admin via alternative channel
- Message failure: Log to database for manual follow-up

**Sanity CMS Integration Error Contract:**
- API timeout > 10s: Serve stale content with "Content might be outdated" banner
- 404 on document: Return 410 Gone with appropriate message
- 503/502: Show cached content with error state

**Auth.js Integration Error Contract:**
- Invalid JWT: Redirect with session-expired flag
- Provider unavailable: Return 503 Service Unavailable
- Rate limited: Return 429 with Retry-After header

---

## 6. Validation & Release Checkpoints

### 6.1 Design & UX QA

Design QA must be completed before any checkpoint sign-off. The following consistency checks must pass across all hub and spoke templates.

All pages must render correctly on three viewport breakpoints: 375px (mobile S), 768px (tablet), and 1280px (desktop). The shared design system token set — spacing, typography, color, border radius — must be identical across hub and spokes, confirmed via visual regression. No spoke may introduce a locally overridden Tailwind config. The floating WhatsApp CTA must be validated on mobile viewports across all page types to confirm it does not occlude RFQ form fields or the submit button. All RFQ form variants (B2G and B2B) must render without horizontal scroll on 375px viewport. Dashboard login and tracking-status templates must pass the same mobile legibility and touch-target checks.

### 6.2 Tech & Load Testing

**RFQ Fallback Simulation.** A forced-failure test must be executed in the staging environment by deliberately making the Neon Postgres connection unavailable and submitting an RFQ. The expected outcome is: (1) GA4 `rfq_submit_failure` event fires with `fallback_triggered: true`; (2) fallback UI renders with correct pre-filled WhatsApp URL; (3) Telegram failure alert is received by the ops channel. This test is a hard launch gate.

**Sub-domain Routing Verification.** All configured spoke sub-domains, including `dashboard.sentradaya.com`, must be verified to route correctly from Cloudflare to the correct Next.js app router segment. Cross-spoke navigation links from the hub must be tested for correctness in both staging and production DNS environments.

**Dashboard Access & Data Isolation Test.** Validate client onboarding and login lifecycle end-to-end: account provisioning from qualified lead, first login flow, and tracking-status retrieval. Attempt cross-account access to confirm row-level isolation blocks unauthorized project/order visibility. Failed login attempt throttling and audit logging must be verified.

**301 Redirect Coverage Audit.** The complete legacy URL inventory must be run through the redirect engine in staging. Zero unresolved 404s are acceptable. Spot-check coverage must include the top 20 organic pages per legacy domain as identified in GSC.

**Load & Spike Testing.** Simulate realistic campaign spike traffic against the RFQ submission endpoint and hub homepage. Confirm Cloudflare edge caching behavior and Neon Postgres connection pool behavior under concurrent load. Execute additional concurrent-session tests on dashboard login and tracking endpoints to validate stable authenticated performance.

### 6.3 Approval Gates

**End of Sprint 1 Gate.** The following must be demonstrable before Sprint 2 begins: hub and at least one spoke routing operational in staging; 301 mapping framework implemented and partially validated; RFQ pipeline writes successfully to Neon Postgres; certifications hub MVP live in staging.

**Mid Sprint 2 Gate.** Admin dashboard authentication and lead listing are functional; Resend and Telegram notification workflows are operational; WhatsApp integration is tracked via GA4; dashboard sub-domain routing and login shell are operational in staging.

**Pre-Launch Final Gate (Leadership Approval).** A full sprint presentation must be delivered to DBSN leadership before any production deployment. The presentation must demonstrate: minimum 20 portfolio entries; PSI mobile score 90+ on all key templates (including dashboard login/tracking templates); CWV checks passing acceptable thresholds; RFQ fallback validated under forced failure test; dashboard access provisioning and data isolation test pass; SEO migration QA sign-off; and a go/no-go risk summary from the engineering lead. Production deployment is blocked until explicit leadership approval is received.

---

## 7. Acceptance Criteria & Test Cases

### REQ-001: Main Hub Trust Platform

**Given-When-Then Test Cases:**

**Test Case 1: Hub Navigation**
- Given I am on the hub homepage sentradaya.com
- When I click on any spoke navigation link
- Then I am redirected to the correct spoke subdomain
- And the shared design system is applied consistently

**Test Case 2: Certifications Access**
- Given I navigate to the certifications section
- When I click on any certification document
- Then I can download the document successfully
- And the download event is tracked in GA4

**Test Case 3: Portfolio Navigation**
- Given I view the portfolio section
- When I filter by client category or project type
- Then the results update correctly
- And each entry links to its relevant spoke

### REQ-004: Structured RFQ System

**Given-When-Then Test Cases:**

**Test Case 1: B2G Form Validation**
- Given I am viewing the B2G RFQ form
- When I submit an empty required field
- Then I see inline validation messages
- And submission is blocked

**Test Case 2: B2B Form Submission**
- Given I have completed the B2B RFQ form
- When I click submit
- Then the lead is created in Neon Postgres
- And I receive a confirmation page
- And Resend email is triggered
- And Telegram alert is sent to sales team

**Test Case 3: Fallback Trigger**
- Given the RFQ API returns a 500 error
- When I submit the RFQ form
- Then fallback UI is displayed
- And pre-filled WhatsApp URL is generated
- And Telegram failure alert is sent
- And GA4 event `rfq_submit_failure` is tracked

### REQ-011: Client Tracking Portal

**Given-When-Then Test Cases:**

**Test Case 1: Client Authentication**
- Given I am a provisioned client user
- When I attempt to login to dashboard.sentradaya.com
- Then I can authenticate with valid credentials
- And I see only my authorized tracking projects
- And unauthorized access attempts are logged

**Test Case 2: Data Isolation**
- Given I am logged in as Client A
- When I try to access data for Client B's project
- Then I am denied access
- And an audit log entry is created

### REQ-008: SEO Migration Engine

**Given-When-Then Test Cases:**

**Test Case 1: Exact Match Redirect**
- Given I access a mapped legacy URL
- When the request hits the redirect engine
- Then I am 301 redirected to the correct target
- And no 404 occurs

**Test Case 2: Fallback Redirect**
- Given I access a legacy URL with no exact match
- When the request hits the redirect engine
- Then I am redirected to the nearest parent category
- Or to the relevant spoke homepage
- Or to the hub homepage (in that order)

---

## 8. API Specifications

### 8.1 Response Format

All API responses must follow a standardized envelope format:

```json
{
  "data": { /* resource object or array */ },
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  },
  "links": {
    "self": "/api/v1/users?page=1&per_page=20",
    "next": "/api/v1/users?page=2&per_page=20",
    "last": "/api/v1/users?page=5&per_page=20"
  }
}
```

**Error Response:**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "invalid_format"
      }
    ]
  }
}
```

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

**Request Body:**
```json
{
  "segment": "B2G" | "B2B",
  "source_domain": "sentradaya.com",
  "source_page_path": "/pju/products/street-light",
  "contact_name": "John Doe",
  "contact_email": "john@example.com",
  "contact_phone": "+6281234567890",
  "company_name": "PT ABC",
  "product_category": "PJU Solar Cell",
  "quantity": 100,
  "project_scope": "Street lighting for Jakarta area",
  "timeline": "2024-12-31",
  "procurement_type": "Tender Langsung", // B2G only
  "notes": "Additional requirements..."
}
```

**Success Response (201):**
```json
{
  "data": {
    "id": "abc-123-def-456",
    "submission_status": "received",
    "dashboard_access_status": "not_eligible",
    "created_at": "2026-05-13T10:30:00Z"
  }
}
```

**Validation Error (422):**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "contact_email",
        "message": "Must be a valid email address",
        "code": "invalid_format"
      }
    ]
  }
}
```

### 8.3 Authentication Endpoints

**POST /api/auth/login**
- Authenticate admin users
- Return JWT token for subsequent requests
- Rate limited to 10 attempts per 5 minutes per IP

**POST /api/auth/client/login**
- Authenticate B2B/B2G clients
- Return JWT token and session info
- Verify tracking_scope_ids

**POST /api/auth/logout**
- Invalidate JWT token
- Clear session data

**GET /api/auth/me**
- Return current authenticated user's profile
- Verify token validity
- Include permissions and tracking scopes

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
- Ping every 60 seconds
- Alert on 2 consecutive failures
- PagerDuty integration for critical outages

**Error Monitoring:**
- Error rate > 1% over 5 minutes
- Critical errors (5xx) immediately
- Performance errors (slow queries, timeouts)

**RFQ Pipeline Health:**
- Submission success rate < 95%
- Failure rate increase > 10% in 1 hour
- Queue depth > 100 items

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
  connect-src 'self' https://*.sentradaya.com;
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
- No direct SQL queries - use parameterized queries
- User HTML content sanitized with DOMPurify

### 10.2 Privacy & Compliance

**UU PDP Compliance:**
- Data collection limited to necessary information only
- Explicit consent for data processing
- Right to access and deletion (manual approval by Pramono)
- 3-year data retention period
- Regular privacy audits

**Data Handling:**
- No PII logged in analytics (GA4 raw events filtered)
- User data encrypted at rest (Neon Postgres)
- TLS 1.3 for all data transfers
- Regular security vulnerability scans

**Audit Trail:**
- All admin actions logged (90 days retention)
- Client access attempts logged
- Data modification timestamps preserved
- Regular security reviews by Ibu Mely

### 10.3 Authentication & Authorization

**JWT Token Management:**
- Tokens stored in httpOnly cookies (not localStorage)
- Token expiration: 24 hours for clients, 8 hours for admin
- Refresh token mechanism implemented
- Invalid tokens redirect with session-expired flag

**Role-Based Access Control:**
- Admin: Full system access
- Viewer: Read-only access to leads
- Client: Access only to own tracking data

**Row-Level Security:**
- Dashboard users can only see their tracking_scope_ids
- Leads linked to users via linked_lead_id
- Soft delete on lead deletion (ON DELETE SET NULL)

---

## 11. Environment Configuration

### 11.1 Environment Variables

**Required Variables:**
```
# Database (High Sensitivity)
DATABASE_URL="postgresql://user:pass@host/db"
SUPABASE_ACCESS_TOKEN="your-token-here"
SUPABASE_PROJECT_REF="project-ref"

# Authentication (High Sensitivity)
AUTH_SECRET="random-32-char-secret"
NEXTAUTH_URL="https://sentradaya.com"
NEXTAUTH_SECRET="auth-secret-here"

# External APIs (Medium Sensitivity)
RESEND_API_KEY="resend-api-key"
TELEGRAM_BOT_TOKEN="telegram-bot-token"
OPENAI_API_KEY="openai-api-key"

# Analytics (Low Sensitivity)
GA_TRACKING_ID="G-XXXXXXXXXX"
GSC_SERVICE_ACCOUNT_JSON="service-account-json"

# Environment
NODE_ENV=production
BASE_URL="https://sentradaya.com"
```

**Variable Sensitivity Levels:**
- High: Must be encrypted in production
- Medium: Can be stored in environment
- Low: Can be hardcoded in config

### 11.2 Feature Flags

**Gradual Rollout Controls:**
```typescript
// Feature flags configuration
export const featureFlags = {
  // RFQ System
  rfgSystem: {
    enabled: true,
    rolloutPercentage: 100
  },
  // Client Tracking
  clientTracking: {
    enabled: true,
    rolloutPercentage: 80 // Gradual rollout
  },
  // New UI Components
  newDesignSystem: {
    enabled: true,
    rolloutPercentage: 100
  },
  // Performance Optimizations
  imageOptimization: {
    enabled: true,
    rolloutPercentage: 100
  }
}
```

**Feature Flag Rules:**
- Always check feature flags before new functionality
- Use percentage-based rollout for gradual deployment
- Include override for emergency disable
- Document flag usage in code

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

*End of PRD — Version 3.1*

*This document reflects all finalized discovery outputs including locked architecture, technical stack, 1-month compressed timeline, integration priorities, secure tracking-portal expansion, explicit migration, performance, and fallback risk controls, acceptance criteria, SLAs, and rollback procedures.*