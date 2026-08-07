# System Architecture & Code Terrain Map Overview

## Section I: System Topology & Component Mechanics

> *Merged from docs/system/architecture.md*

# System Architecture: DBSN Centralized Digital Ecosystem

## 1. Architecture Overview

### Core Tech Stack Summary

- **Application Runtime:** Next.js 16 (App Router, Route Handlers, Server Components, enhanced caching)
- **Repository Strategy:** Single Next.js 16 app with pnpm package manager
- **Content Layer:** Sanity.io (headless CMS, schema-driven content federation)
- **UI System:** Tailwind CSS + Radix UI with shadcn/ui patterns (shared tokenized design system)
- **Transactional Data Layer:** Neon Postgres via Prisma ORM (type-safe migrations)
- **Authentication:** Auth.js v5 (role-based access: `admin`, `viewer`, `client`)
- **Hosting / Edge:** Cloudflare Pages (+ Cloudflare middleware-based subdomain routing, edge redirect handling)
- **Notifications:** Resend (email), Telegram Bot API (internal ops alerting)
- **Telemetry:** GA4 + GSC + Cloudflare Analytics
- **Phase 2 Monitoring:** Sentry (error tracking) + PostHog (session replay)
- **Messaging Fallback:** WhatsApp `wa.me` pre-filled fallback for RFQ failure path

### High-Level System Topology (Hub-and-Spoke)

```mermaid
---
config:
  layout: dagre
---
flowchart TD
    classDef entry fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef conversion fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412

    U["Users\nB2G Procurement / B2B Technical Buyers / Internal Admin"]
    subgraph DNS["Public Domains"]
        HUB["dayaberkah.id\nHub (Corporate Trust Center)"]
        PJU["pju.dayaberkah.id\nProduct Spoke"]
        SOL["solarcell.dayaberkah.id\nProduct Spoke"]
        LGT["alatpetir.dayaberkah.id\nProduct Spoke"]
        BAT["baterai.dayaberkah.id\nProduct Spoke (Extensible)"]
        DASH["dashboard.dayaberkah.id\nSecure Tracking Portal"]
    end
    subgraph EDGE["Cloudflare Edge"]
        CF["Cloudflare Pages\nCDN + TLS + Hosting"]
        REDIR["Redirect Resolver\n(redirect_map-driven 301)"]
        MW["Middleware\nSubdomain Router"]
    end
    subgraph APP["Single Next.js 16 App"]
        WEB["Unified Web App\nApp Router + Middleware"]
        API["Route Handlers\n/api/rfq, /api/tracking, /api/admin/*"]
        AUTH["Auth.js v5\nSession + RBAC"]
        UI["Shared UI (shadcn/ui)\nTailwind + Radix"]
        PRS["Prisma ORM\nType-safe migrations"]
    end
    subgraph DATA["Data & Integrations"]
        SANITY["Sanity CMS\nProduct/Certification/Portfolio/Page/SpokeConfig"]
        PS[("Neon Postgres\nleads, users, redirect_map")]
        RESEND["Resend Email API"]
        TG["Telegram Bot API"]
        GA["GA4 + GSC + Cloudflare Analytics"]
        WA["WhatsApp wa.me Fallback"]
        PH2["Phase 2: Sentry + PostHog"]
    end
    subgraph LEGACY["Legacy Domains"]
        L1["pjusolarcellindonesia.com"]
        L2["sentradaya.com (legacy)"]
        L3["alatpenangkalpetir.co.id"]
    end
    U --> HUB
    U --> PJU
    U --> SOL
    U --> LGT
    U --> BAT
    U --> DASH
    HUB --> CF
    PJU --> CF
    SOL --> CF
    LGT --> CF
    BAT --> CF
    DASH --> CF
    L1 -.-> REDIR
    L2 -.-> REDIR
    L3 -.-> REDIR
    REDIR --> CF
    CF --> WEB
    WEB --> UI
    WEB --> SANITY
    WEB --> API
    API --> PS
    API --> RESEND
    API --> TG
    API --> AUTH
    AUTH --> PS
    WEB --> GA
    API --> WA
    class U entry
    class L1 entry
    class L2 entry
    class L3 entry
    class WA conversion
```

## 2. Component Breakdown

### Frontend

- **Runtime + Routing:** Next.js 16 App Router with middleware-based subdomain routing; route segmentation by host/subdomain and route groups.
- **Domain Surfaces:**
  - Hub: corporate trust center (`dayaberkah.id`)
  - Product spokes: product content + RFQ entry (`pju`, `solarcell`, `alatpetir`, `baterai`)
  - Dashboard spoke: authenticated client tracking (`dashboard.dayaberkah.id`)
  - *Testing/Preview Domains:* Hostnames ending with `.pages.dev` (e.g., `<branch>.dbsn-website.pages.dev`) are dynamically resolved as root domains by the middleware. This allows full hub-and-spoke testing (e.g., `pju.<branch>.dbsn-website.pages.dev`) and preview routing on Cloudflare Pages before deploying to `dayaberkah.id`.
- **UI Architecture:**
  - Single unified app with shadcn/ui patterns (Radix UI primitives)
  - Shared Tailwind token config at repo root (no spoke-local divergence)
  - Shared primitives: navigation, trust badges, certification cards, product spec tables, RFQ form shells, auth forms, tracking status cards
- **Rendering Strategy:**
  - CMS-driven static/ISR where content is stable (hub/spokes content pages)
  - Server-side protected render for dashboard tracking views
- **Mobile-first enforcement:**
  - RFQ and login forms with minimum 44px touch targets
  - Floating WhatsApp CTA collision prevention on form pages

### Backend

- **Edge-facing app backend:** Next.js 16 Route Handlers under `/api/*`.
- **Core service domains:**
  1. RFQ ingestion (validation, persistence, notification, fallback orchestration)
  2. Authentication/session issuance (Auth.js v5)
  3. Admin lead operations (query/filter/update lifecycle)
  4. Client tracking retrieval (authorized status read by `tracking_scope_ids` / `linked_lead_id`)
- **Validation controls:**
  - Server-side input sanitization via Prisma ORM
  - Anti-spam controls (honeypot + rate limiting)
  - Strict 4xx/5xx response semantics
- **Authorization model:**
  - `admin`/`viewer`: internal dashboard access
  - `client`: dashboard tracking access only
  - Ownership guard: client can read only rows bound to their lead/tracking scope

### Infrastructure/DevOps

- **Hosting:** Cloudflare Pages for single Next.js 16 app with middleware-based subdomain routing.
- **Routing model:** Hostname-based middleware routing into single deployment target.
- **Redirect engine:**
  - Data source: Neon Postgres `redirect_map`
  - Resolution order: exact match → pattern match → parent category fallback → spoke home → hub home
  - Hard rule: no unresolved legacy 404 during migration window
- **Database:** Neon Postgres with Prisma ORM, TLS-enforced connections, least-privilege credentials, generous free tier.
- **Operational integrations:** Resend + Telegram for RFQ and failure alerting; optional client access lifecycle alerts.
- **Telemetry pipeline:** event instrumentation to GA4, search visibility via GSC, infra analytics via Cloudflare.
- **Phase 2 monitoring:** Sentry for error tracking + PostHog for session replay and user behavior analytics.

## 3. Data Architecture & Schema

### Entity-Relationship Diagram (CMS + Transactional)

```mermaid
erDiagram
    SPOKE_CONFIG ||--o{ PRODUCT : "contains"
    SPOKE_CONFIG ||--o{ PORTFOLIO_ENTRY : "references"
    PRODUCT }o--o{ CERTIFICATION : "related to"
    LEADS ||--o| USERS : "linked to"
    SPOKE_CONFIG {
      string id PK
      string name
      string subdomain
      string tagline
      string heroImage
      string primaryColor
      json featuredProducts
      json seoDefaults
    }
    PRODUCT {
      string id PK
      string title
      string slug
      string spoke_ref FK
      string shortDescription
      text fullDescription
      json specifications
      json images
      string datasheetFile
      json relatedCertifications
      json seoMeta
    }
    CERTIFICATION {
      string id PK
      string title
      string slug
      string certificationBody
      enum certType
      date issueDate
      date expiryDate
      string documentFile
      string coverImage
      boolean isIndexable
      json seoMeta
    }
    PORTFOLIO_ENTRY {
      string id PK
      string title
      string slug
      string projectType
      enum clientCategory
      string location
      int completionYear
      text scopeDescription
      string outcome
      json images
      string relatedSpoke FK
      json relatedProducts
    }
    PAGE {
      string id PK
      string title
      string slug
      string targetSpoke
      json sections
      json seoMeta
    }
    LEADS {
      string id PK
      datetime created_at
      datetime updated_at
      enum segment
      string source_domain
      string source_page_path
      string source_campaign_tag
      string utm_source
      string utm_medium
      string utm_campaign
      string contact_name
      string contact_email
      string contact_phone
      string company_name
      string product_category
      int quantity
      text project_scope
      string timeline
      string procurement_type
      text notes
      enum submission_status
      boolean fallback_triggered
      text fallback_wa_url
      string tracking_project_id
      datetime dashboard_access_granted_at
      enum dashboard_access_status
    }
    USERS {
      string id PK
      string email
      string name
      enum role
      datetime created_at
      string linked_lead_id FK
      string client_company_name
      enum tracking_scope_type
      json tracking_scope_ids
      datetime last_login_at
      boolean is_active
    }
    REDIRECT_MAP {
      string legacy_url PK
      string target_url
      string spoke
    }
```

### Detailed Schema Definitions

#### Sanity CMS Schemas

1. **Product**
   - `title: string`
   - `slug: slug`
   - `spoke: reference(SpokeConfig)`
   - `shortDescription: string`
   - `fullDescription: portableText`
   - `specifications: array<{ key: string; value: string }>`
   - `images: array<image>`
   - `datasheetFile: file`
   - `relatedCertifications: array<reference(Certification)>`
   - `seoMeta: { title: string; description: string; ogImage: image }`

2. **Certification**
   - `title: string`
   - `slug: slug`
   - `certificationBody: string`
   - `certType: enum('SNI'|'TKDN'|'LKPP'|'ISO'|'Other')`
   - `issueDate: date`
   - `expiryDate: date`
   - `documentFile: file`
   - `coverImage: image`
   - `isIndexable: boolean`
   - `seoMeta: object`

3. **PortfolioEntry**
   - `title: string`
   - `slug: slug`
   - `projectType: string`
   - `clientCategory: enum('Government'|'BUMN'|'Private'|'EPC')`
   - `location: string`
   - `completionYear: number`
   - `scopeDescription: portableText`
   - `outcome: string`
   - `images: array<image>`
   - `relatedSpoke: reference(SpokeConfig)`
   - `relatedProducts: array<reference(Product)>`

4. **SpokeConfig**
   - `name: string`
   - `subdomain: string`
   - `tagline: string`
   - `heroImage: image`
   - `primaryColor: string (design token)`
   - `featuredProducts: array<reference(Product)>`
   - `seoDefaults: object`

5. **Page**
   - `title: string`
   - `slug: slug`
   - `targetSpoke: reference(SpokeConfig) | null`
   - `sections: array<portableText|customBlock>`
   - `seoMeta: object`

#### Neon Postgres Transactional Schemas (via Prisma ORM)

1. **`leads`** (Prisma model)
   - `id STRING @id @default(cuid()) PRIMARY KEY`
   - `created_at DATETIME @default(now()) NOT NULL`
   - `updated_at DATETIME @updatedAt NOT NULL`
   - `segment SEGMENT('B2G','B2B') NOT NULL`
   - `source_domain STRING(255) NOT NULL`
   - `source_page_path STRING(512) NOT NULL`
   - `source_campaign_tag STRING(255) NULL`
   - `utm_source STRING(255) NULL`
   - `utm_medium STRING(255) NULL`
   - `utm_campaign STRING(255) NULL`
   - `contact_name STRING(255) NOT NULL`
   - `contact_email STRING(255) NOT NULL`
   - `contact_phone STRING(50) NOT NULL`
   - `company_name STRING(255) NOT NULL`
   - `product_category STRING(255) NOT NULL`
   - `quantity Int NULL`
   - `project_scope String NULL`
   - `timeline STRING(255) NULL`
   - `procurement_type STRING(255) NULL` (B2G only)
   - `notes String NULL`
   - `submission_status SUBMISSION_STATUS('received','contacted','qualified','disqualified') @default(RECEIVED) NOT NULL`
   - `fallback_triggered Boolean @default(false) NOT NULL`
   - `fallback_wa_url String NULL`
   - `tracking_project_id STRING(255) NULL`
   - `dashboard_access_granted_at DateTime NULL`
   - `dashboard_access_status DASHBOARD_STATUS('not_eligible','pending','granted','revoked') @default(NOT_ELIGIBLE) NOT NULL`

2. **`users`** (Prisma model)
   - `id STRING @id @default(cuid()) PRIMARY KEY`
   - `email String(255) @unique NOT NULL`
   - `name String(255) NOT NULL`
   - `role ROLE('ADMIN','VIEWER','CLIENT') NOT NULL`
   - `created_at DateTime @default(now()) NOT NULL`
   - `linked_lead_id String @relation(fields: [linked_lead], references: [id]) NULL`
   - `client_company_name String(255) NULL`
   - `tracking_scope_type TRACKING_SCOPE_TYPE('PROJECT','ORDER') NULL`
   - `tracking_scope_ids Json NULL`
   - `last_login_at DateTime NULL`
   - `is_active Boolean @default(true) NOT NULL`

3. **`redirect_map`** (Prisma model)
   - `legacy_url String(1024) PRIMARY KEY`
   - `target_url String(1024) NOT NULL`
   - `spoke String(100) NOT NULL`

## 4. API & Integration Strategy

### Internal API Endpoints

1. `POST /api/rfq`
   - Purpose: ingest segmented RFQ (`B2G`/`B2B`)
   - Input: validated form payload + source attribution + UTM
   - Writes: `leads` via Prisma ORM
   - Side-effects: Resend ACK + internal email, Telegram alert
   - Failure behavior: returns `500|timeout` and provides fallback contract for WhatsApp pre-fill

2. `GET|POST /api/auth/[...nextauth]`
   - Purpose: Auth.js v5 session lifecycle
   - Roles: `ADMIN`, `VIEWER`, `CLIENT`
   - Enforces protected route access and session integrity

3. `GET /api/dashboard/tracking`
   - Auth: required, `role=CLIENT`
   - Input: implied from authenticated user (`linked_lead_id`, `tracking_scope_ids`)
   - Output: authorized project/order tracking statuses only
   - Deny behavior: `401` (unauthenticated), `403` (scope violation), logged event

4. `GET /api/admin/leads`
   - Auth: required, `role in ('ADMIN','VIEWER')`
   - Supports: search/filter by segment/source/submission status
   - ORM: Prisma query with type safety

5. `PATCH /api/admin/leads/:id/status`
   - Auth: required, `role=ADMIN`
   - Updates: `submission_status`, `dashboard_access_status`, `dashboard_access_granted_at`, `tracking_project_id`
   - Optional side-effects: provisioning email + Telegram audit message

### Third-Party Integrations

1. **Resend**
   - Trigger A: successful RFQ submit → customer ACK email
   - Trigger B: successful RFQ submit → internal notification email
   - Trigger C: dashboard access grant → provisioning email with secure login/reset path

2. **Telegram Bot API**
   - Trigger A: RFQ success notification to sales ops channel
   - Trigger B: RFQ failure/fallback trigger alert
   - Trigger C (optional per PRD): client access provisioning/revocation audit alerts

3. **WhatsApp (wa.me fallback)**
   - Trigger: RFQ API/database failure
   - Mechanism: serialized captured RFQ payload into pre-filled URL parameters
   - UX requirement: explicit failure messaging and primary fallback CTA

4. **Phase 2: Sentry + PostHog (Planned)**
   - Sentry: Error tracking, performance monitoring, release tracking
   - PostHog: Session replay, user behavior analytics, product insights
   - Both instruments to be added after Phase 1 stabilization

## 5. Key Architectural Flows

### Legacy Single-Item to Multi-Product RFQ Transition

Previously, the system supported only a single-item RFQ submission where the user submitted an RFQ from a single product detail page. The submission payload had flat fields like `product_category` and `quantity`.

With the introduction of the unified **RFQ Cart** feature:
1. **Multi-Product Aggregation**: Users can browse the catalog across different subdomains, add multiple products (with varying quantities and custom specs/variants) to a persistent cart, and submit them all at once.
2. **Schema Generalization**: The data structure has transitioned from flat single-product fields to a unified composite layout, where line-items are represented as an array (`items: RfqCartItem[]`).
3. **Data Backwards Compatibility**: Legacy fields in type/schema definitions are deprecated but preserved (`sharedRfqFieldsSchema`) to prevent breaking existing integrations.

### RFQ Cart Lifecycle & Data Flow

The multi-product RFQ Cart architecture coordinates client-side persistence, React state synchronization, and server-side Zod validation. The complete pipeline runs as follows:

```mermaid
sequenceDiagram
    actor User
    participant Page as Product Page / Catalog
    participant Store as Zustand Persist Store (LocalStorage)
    participant Form as RFQ Form (react-hook-form + useFieldArray)
    participant Route as POST /api/rfq (Next.js Route)

    User->>Page: Click "Add to Cart"
    Page->>Store: addItem(newItem)
    Note over Store: Validates with rfqCartItemSchema;<br/>Merges duplicate product_id + variant;<br/>Clamps quantity [1, 100000];<br/>Persists to dbsn-rfq-cart in localStorage

    User->>Form: Navigate to RFQ checkout page
    Note over Form: useRfqCartHydrated() checks hydration status;<br/>Renders skeleton if false;<br/>Renders Empty Cart View if items.length === 0
    Store-->>Form: Hydrates default values (items[])
    Form->>Form: Binds items[] to useFieldArray

    User->>Form: Mutate item (change qty / add notes / delete)
    Form->>Store: updateQuantity() / updateItemNotes() / removeItem()
    Note over Store: Updates localStorage in real-time

    User->>Form: Submit Form
    Form->>Form: Appends attribution/UTM metadata
    Form->>Route: POST flat JSON payload (includes items[] array)
    Note over Route: safeParse against rfqB2BSchema / rfqB2GSchema;<br/>Maps errors to business-friendly codes
    Route-->>Form: 201 Created (with generated lead ID)
```

### RFQ Submission + Fallback Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Spoke RFQ Form (Next.js)
    participant API as POST /api/rfq
    participant DB as Neon Postgres (leads)
    participant Resend as Resend API
    participant TG as Telegram Bot API
    participant WA as WhatsApp wa.me
    participant GA as GA4
    User->>UI: Fill RFQ fields (B2G/B2B)
    UI->>GA: rfq_start
    User->>UI: Submit form
    UI->>GA: rfq_submit_attempt
    UI->>API: JSON payload + attribution + UTM
    alt Valid + DB available
        API->>API: Validate, sanitize, anti-spam checks
        API->>DB: INSERT leads row
        DB-->>API: lead_id
        API->>Resend: ACK email + internal email
        API->>TG: New RFQ alert
        API-->>UI: 200 {success:true, lead_id}
        UI->>GA: rfq_submit_success
        UI-->>User: Confirmation state
    else Validation failure
        API-->>UI: 422 {field_errors}
        UI-->>User: Inline correction prompts
    else Infrastructure failure
        API-->>UI: 500/timeout
        UI->>GA: rfq_submit_failure {fallback_triggered:true}
        UI->>WA: Build pre-filled wa.me URL
        UI-->>User: Fallback prompt + primary WhatsApp CTA
        User->>WA: Open WhatsApp handoff
        UI->>GA: whatsapp_click {cta_location:"fallback"}
        API->>TG: Failure alert
    end
```

### Authentication + Tracking Dashboard Flow

```mermaid
sequenceDiagram
    actor Client as B2B/B2G Client User
    participant Dash as dashboard.dayaberkah.id
    participant Auth as NextAuth.js
    participant DB as Neon Postgres (users, leads)
    participant TrackAPI as GET /api/dashboard/tracking
    participant GA as GA4
    Client->>Dash: Open login page
    Client->>Auth: Submit credentials
    Auth->>DB: Lookup user by email
    alt Active client account + valid credentials
        DB-->>Auth: user(role=client, linked_lead_id, tracking_scope_ids, is_active=true)
        Auth->>DB: Update last_login_at
        Auth-->>Dash: Issue authenticated session
        Dash->>GA: dashboard_login_success
        Dash->>TrackAPI: Request tracking data (session-bound)
        TrackAPI->>DB: Resolve lead + authorized tracking scopes
        DB-->>TrackAPI: Tracking status rows
        TrackAPI-->>Dash: 200 authorized tracking payload
        Dash->>GA: tracking_status_view
        Dash-->>Client: Render project/order status
    else Invalid credentials or inactive/revoked account
        Auth-->>Dash: 401/403
        Dash->>GA: dashboard_login_failure
        Dash-->>Client: Access denied message
    else Authenticated but scope violation
        TrackAPI-->>Dash: 403 forbidden
        Dash-->>Client: Unauthorized tracking scope
    end
```

## 6. Technical Constraints & Security

1. **Authentication (AuthN):**
   - NextAuth.js mandatory for all protected surfaces.
   - Dashboard routes must reject unauthenticated requests with `401`.

2. **Authorization (AuthZ):**
   - Role model fixed: `admin`, `viewer`, `client`.
   - Client tracking endpoint must enforce ownership checks using `linked_lead_id` + `tracking_scope_ids`.
   - Scope violations must return `403` and be auditable.

3. **Input Security + Anti-Abuse:**
   - RFQ endpoint requires server-side sanitization, honeypot, and rate limiting.
   - No trust in client-submitted role/segment flags without server validation.

4. **Data Security:**
   - TLS-only DB transport.
   - Principle of least privilege for DB credentials and API keys.
   - No PII in GA4 or Cloudflare raw telemetry payloads.

5. **Operational Resilience:**
   - RFQ fallback to WhatsApp is mandatory on API/DB failure.
   - Telegram failure alerts are mandatory in fallback scenarios.

6. **Performance Constraints:**
   - Mobile PSI target: **>= 90** on hub, spoke, RFQ, dashboard login, tracking pages.
   - TTFB target: sub-second via Cloudflare edge.
   - Core Web Vitals must pass acceptable thresholds (LCP, INP/FID, CLS).
   - `next/image` mandatory for image optimization.

7. **Routing/SEO Constraints:**
   - Legacy URL migration must never terminate in unresolved 404 during migration window.
   - Canonical tags required on all authority pages.

## 7. AI Implementation Handoff (Build Order)

1. **Initialize Project Foundations**
   1.1 Configure shared packages (`ui`, `config`, `types`) within single Next.js 16 app.
   1.2 Scaffold Next.js 16 app structure with App Router and host-aware routing utilities.
   1.3 Implement shared Tailwind + Radix baseline tokens at root.

2. **Implement Domain Routing + Edge Topology**
   2.1 Bind hub and spoke hostnames to Cloudflare Pages.
   2.2 Implement hostname resolution middleware/utilities for hub, product spokes, and dashboard spoke.
   2.3 Add legacy redirect resolver integration contract (backed by `redirect_map`).

3. **Build CMS Contracts**
   3.1 Define Sanity schemas: `Product`, `Certification`, `PortfolioEntry`, `SpokeConfig`, `Page`.
   3.2 Implement GROQ query layer for spoke-aware data retrieval.
   3.3 Validate spoke rendering is data-driven with zero code forks.

4. **Provision Transactional Data Layer**
   4.1 Create Neon Postgres schema: `leads`, `users`, `redirect_map` exactly per PRD v3 fields.
   4.2 Add indexes for lead lifecycle filters, source attribution, and linked client lookup.
   4.3 Add migration validation for enum coverage and nullable constraints.

5. **Implement Authentication + Authorization**
   5.1 Integrate NextAuth route handlers.
   5.2 Implement role model (`admin`, `viewer`, `client`) and route guards.
   5.3 Enforce client row-level tracking authorization via `linked_lead_id` + `tracking_scope_ids`.

6. **Implement RFQ Pipeline**
   6.1 Build segmented RFQ API (`/api/rfq`) with strict server-side validation.
   6.2 Persist leads with source attribution + UTM.
   6.3 Implement deterministic success/failure response contracts.

7. **Implement Notification Integrations**
   7.1 Wire Resend for ACK + internal lead email templates.
   7.2 Wire Telegram alerts for RFQ success and fallback failures.
   7.3 Implement dashboard provisioning notification on access grant.

8. **Implement WhatsApp Fallback Engine**
   8.1 Serialize captured RFQ fields to wa.me prefill format.
   8.2 Render explicit fallback UI and elevated primary CTA.
   8.3 Emit fallback telemetry (`rfq_submit_failure`, fallback `whatsapp_click`).

9. **Implement Admin Dashboard**
   9.1 Build protected lead listing with filter/search/source tags.
   9.2 Implement lifecycle updates (`submission_status`, `dashboard_access_status`, `tracking_project_id`).
   9.3 Add export-ready query/model structure.

10. **Implement Client Tracking Dashboard (`dashboard.dayaberkah.id`)**
    10.1 Build login + session-protected routes.
    10.2 Build tracking status API bound to authorized scope.
    10.3 Build tracking UI cards/list with mobile-first behavior.

11. **Instrumentation + Telemetry Completion**
    11.1 Implement mandatory GA4 events from PRD (RFQ, WhatsApp, file, hub-spoke, dashboard login, tracking view).
    11.2 Validate no PII leakage in event payloads.
    11.3 Integrate Cloudflare + GSC verification.

12. **Quality Gates and Release Validation**
    12.1 Execute forced RFQ failure test and verify fallback + Telegram alert.
    12.2 Execute dashboard access/data-isolation tests (including forbidden cross-account access).
    12.3 Validate subdomain routing, redirect coverage, CWV/PSI thresholds, and launch gate checklist.


---

## Section II: Architecture Code Terrain Map

> *Merged from docs/CODEMAPS/architecture.md*

# Architecture Codemap

<!-- Generated: 2026-07-22 | Files scanned: 90+ | Token estimate: ~750 -->

## Project Type
**Single App** — Next.js 16.2.6 App Router, multi-tenant subdomain routing via Edge Middleware

## System Topology

```
┌──────────────────────────────────────────────────────────────┐
│                       Cloudflare Edge                        │
│  Hub: dayaberkah.id | Spokes: pju/solar/etc | Dashboard      │
└──────────────────────────────────────────────────────────────┘
                               │
                               ↓
┌──────────────────────────────────────────────────────────────┐
│              Next.js 16.2.6 App Router (Edge Middleware)     │
│  src/middleware.ts → cleanHostname() → domain routing        │
│  Route Groups: (hub), (spokes)   Flat routes: dashboard/     │
└──────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ↓             ↓             ↓
┌──────────────────────┐ ┌─────────┐ ┌─────────────────────────┐
│  Sanity.io CMS       │ │ Prisma  │ │   Notifications Layer   │
│  @sanity/client ^7   │ │  Client │ │  Resend | Telegram Bot  │
│  next-sanity ^12     │ └────┬────┘ │  WhatsApp Fallback URL  │
│  GROQ queries        │      │      └─────────────────────────┘
│  ISR + cache tags    │      ↓
└──────────────────────┘ ┌─────────┐
                         │  Neon   │
                         │Postgres │
                         └─────────┘
```

## Route Structure

| Route | Type | Domain | Notes |
|-------|------|---------|-------|
| `(hub)/` | Route Group | dayaberkah.id | Hub homepage + sub-pages |
| `(hub)/about` | Sub-page | dayaberkah.id | |
| `(hub)/articles` | Sub-page | dayaberkah.id | + `[slug]` |
| `(hub)/certifications` | Sub-page | dayaberkah.id | |
| `(hub)/contact` | Sub-page | dayaberkah.id | |
| `(hub)/faq` | Sub-page | dayaberkah.id | |
| `(hub)/portfolio` | Sub-page | dayaberkah.id | |
| `(hub)/products` | Sub-page | dayaberkah.id | |
| `chat/` | Flat route | dayaberkah.id | Agent chat interface (21st SDK) |
| `dashboard/` | Flat route | dashboard.dayaberkah.id | Rewritten by middleware |
| `(spokes)/pju/` | Route Group | pju.dayaberkah.id | |
| `(spokes)/[spoke]/` | Route Group | *.dayaberkah.id | Dynamic spokes |
| `api/revalidate/` | API route | any | Sanity webhook ISR |
| `api/rfq/` | API route | any | POST ingest multi-product RFQ / GET healthcheck |
| `api/auth/[...nextauth]` | API route | any | NextAuth.js v5 route handler (GET/POST) |
| `api/auth/forgot-password` | API route | any | Password reset request initiation |
| `api/auth/reset-password` | API route | any | Password reset completion |
| `api/admin/redirects` | API route | any | Admin redirect map CRUD + hit tracking |
| `api/redirects/lookup` | API route | any | Lightweight redirect lookup (middleware loopback) |
| `api/an-token` | API route | any | 21st SDK agent chat token handler |
| `api/cron/notifications` | API route | any | Notification queue processor (cron endpoint) |

## Middleware Routing Logic

```
Request → src/middleware.ts
  cleanHostname(host)
  ├── isHubDomain()     → (hub) route group (transparent)
  ├── isDashboardDomain() → rewrite /dashboard/*
  ├── isSpokeDomain()   → rewrite /[spoke]/*
  └── unknown domain    → rewrite /404
```

## Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/middleware.ts` | Edge subdomain routing | 114 |
| `src/lib/middleware/config.ts` | Domain helpers (cleanHostname, isHubDomain, etc.) | 110 |
| `src/lib/config/env.ts` | Zod env validation (Sanity, Middleware, DB, Auth, Notifications) | 294 |
| `src/app/(hub)/page.tsx` | Hub homepage | ~95 |
| `src/app/dashboard/layout.tsx` | Dashboard shell | ~30 |
| `src/lib/api/sanity/client.ts` | Sanity client + CACHE_TAGS + ISR | 88 |
| `src/lib/store/rfq-cart-store.ts` | Zustand RFQ cart persist store | 143 |
| `src/hooks/use-rfq-cart.ts` | Zustand hydration hooks & selectors | 57 |
| `src/app/api/rfq/route.ts` | REST API for B2B/B2G RFQ ingestion | 173 |
| `prisma/schema.prisma` | Database schema config for Prisma ORM | 162 |
| `src/lib/db/prisma.ts` | Prisma Client singleton client | 12 |
| `src/lib/auth/auth.config.ts` | NextAuth.js v5 core setup and callbacks | 147 |
| `src/lib/auth/auth-guard.ts` | Route protection and database access verification | 75 |
| `src/app/api/auth/[...nextauth]/route.ts` | API handlers route mapping for NextAuth | 3 |
| `src/lib/api/notifications/resend.ts` | Email quotation ACK and sales alert service | 84 |
| `src/lib/api/notifications/telegram.ts` | Telegram push alerts for RFQ submissions and failures | 77 |
| `src/lib/api/notifications/whatsapp.ts` | Prefilled client WhatsApp fallback redirect URL helper | 53 |

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| 1 | **Active** | UI components, routing, Sanity CMS, articles, RFQ schemas |
| 2 | **Active** | Neon Postgres database, Auth.js v5 authentication, notifications, RFQ ingestion |
| 3 | **Active** | Cloudflare Pages hosting, GA4 tracking, 301 redirect engine, agent chat integration |