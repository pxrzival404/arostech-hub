---
id: audit/fase-1-report
title: "Fase 1 Audit Report — Codebase-to-Docs High-Level Alignment"
version: "1.0.0"
status: complete
date: "2026-08-13"
graphify_community: "audit"
authoritative_references:
  - SYSTEM_BLUEPRINT_MIGRATION_PLAN_v2.md Section 5.2
  - docs/audit/middleware-findings.md
  - docs/audit/prisma-findings.md
  - docs/audit/sanity-findings.md
  - docs/audit/api-findings.md
  - docs/audit/auth-findings.md
  - docs/audit/analytics-findings.md
  - docs/audit/sdk-footprint-findings.md
  - docs/audit/dead-code-findings.md
  - docs/system/adr/0006-authjs-v5-cloudflare-edge-runtime-split-config.md
---

# Fase 1 Audit Report — Codebase-to-Docs High-Level Alignment

## Executive Summary

The Fase 1 Audit Squad completed a comprehensive audit of the `arostech-hub` codebase against the trusted Fase 0 documentation baseline (`docs/strategy/`, `docs/system/`, `docs/operations/`, `docs/engineering/`). The audit across Cards 1.1 through 1.8 identified several critical architectural drift items, edge compatibility blockers, missing API endpoints, missing CMS schemas, and scope creep artifacts.

### Key Audit Highlights:
- **Critical Edge Incompatibility**: Eager Prisma / Bcrypt initialization in `auth.config.ts` breaks Cloudflare Edge Runtime. **ADR-0006** (`0006-authjs-v5-cloudflare-edge-runtime-split-config.md`) was produced, establishing Option B (Separate Node-runtime NextAuth handler + Edge JWT middleware).
- **Middleware Architectural Drift**: `src/middleware.ts` contains a 2000ms loopback fetch anti-pattern (`lookupRedirect`) and lacks `preview` domain class declarations.
- **Sanity CMS Schema Violation**: 3 document types queried in `queries.ts` (`certification`, `article`, `page`) are missing from `studio/schemaTypes/`. Repository policy requires creating explicit schema files in Wave 3.
- **API Response Envelope & Contract Drift**: 100% of API routes violate the standard `{success, data, error, meta}` envelope format; composite `rfqSubmissionSchema` is missing from code; 3 admin/tracking endpoints are absent.
- **Scope Creep Purge Recommendation**: 21st SDK (`/chat`, `/api/an-token`, 4 `@21st-sdk/*` packages) is completely disconnected from DBSN business domain and recommended for total removal in Wave 4.
- **Dead Code Cleanup**: `tailwind.config.ts` (Tailwind v4 CSS-first migration) and `sentry-example-page/` are safe to delete immediately. Inline HTML `articles.ts` requires Sanity seeding prior to deletion.

### Audit Finding Severity Totals:
- **CRITICAL**: 3 (Auth Edge Incompatibility, Middleware Loopback Fetch Anti-Pattern, Missing RFQ Composite Schema)
- **HIGH**: 4 (Sanity Missing Types, API Response Envelope Violation, Absent API Endpoints, Google OAuth Role Assignment Mismatch)
- **MEDIUM**: 4 (21st SDK Scope Creep, Subdomain Naming Drift, Inline HTML `articles.ts`, Event Taxonomy Drift)
- **LOW**: 2 (`tailwind.config.ts` Obsolete Config, `sentry-example-page` Unlinked Route)

---

## Card Results

### 1.1 Middleware Audit — [FAIL / PARTIAL GAPS]
- **Findings**:
  - `CleanDomainClass` in `execution-lifecycle.md` L111 defines `'hub' | 'dashboard' | 'spoke' | 'unknown'`, omitting `'preview'`.
  - `src/middleware.ts` L48 executes `lookupRedirect()` on every request via a 2000ms loopback `fetch('/api/redirects/lookup')`, directly violating the Greenfield native SEO policy (zero database/loopback calls rule).
  - LRU cache is present in `redirect-engine.ts` but the entire engine is superseded legacy 301 infrastructure.
  - Query param `?subdomain=preview` routing fails because `preview` resolves to an unhandled domain class.
  - Hot-path `console.log` and `/404` short-circuit rewrite anti-patterns identified in Edge middleware.
- **Wave Assignment**: **Wave 1** (Task 3.1.2 Middleware Refactor & Task 3.1.3 Hostname Resolution).

### 1.2 Prisma Schema Audit — [PASS / GAP IDENTIFIED]
- **Findings**:
  - `schema.prisma` currently contains 7 models (`Lead`, `User`, `Account`, `Session`, `VerificationToken`, `RedirectMap`, `NotificationJob`).
  - Baseline `data-model.md` specifies `RfqSubmission` + `RfqLineItem` composite lead structure, replacing single-table `Lead` and purging `RedirectMap`.
  - All 6 canonical domain enums (`SubmissionStatus`, `DashboardAccessStatus`, `Role`, `TrackingScopeType`, `NotificationType`, `JobStatus`) match docs 1:1. Legacy `Segment` enum remains in code.
  - Auth.js adapter models (`Account`, `Session`, `VerificationToken`) are explicitly flagged as standard adapter boilerplate.
  - `src/lib/db/prisma.ts` Proxy lazy-init pattern for Cloudflare Edge + Neon driver proxy verified 100% compliant.
- **Wave Assignment**: **Wave 2** (Task 3.2.1 Prisma Schema Migration & Task 3.2.2 Neon Edge Client).

### 1.3 Sanity CMS Audit — [POLICY VIOLATION / MISSING SCHEMAS]
- **Findings**:
  - Studio registers 3 types: `spokeConfig`, `product`, `portfolioEntry`.
  - `src/lib/api/sanity/queries.ts` queries 6 types: `product`, `portfolioEntry`, `spokeConfig`, `certification`, `page`, `article`.
  - Missing from repository schema files: `certification`, `page`, `article`. Per policy, explicit `.ts` schema files must be authored in Wave 3.
  - Registered schemas display field drift (`datasheetFile`, `relatedCertifications`, `seoMeta` missing from `product.ts`).
  - 100% of GROQ queries use `defineQuery()`, and all 14 handlers conform to `try/catch` null-on-error convention.
- **Wave Assignment**: **Wave 3** (Task 3.3.1 Sanity Studio Schema Alignment & Task 3.3.2 GROQ Query Hardening).

### 1.4 API Routes Audit — [DRIFT / MISSING ENDPOINTS]
- **Findings**:
  - Inventory completed: 9 route files containing 13 HTTP method handlers in `src/app/api/`.
  - Request/response schemas violate Zod contracts in `reference.md` (code uses `snake_case` instead of `camelCase` and retains top-level `segment` discriminator in `POST /api/rfq`).
  - Confirmed 3 ABSENT endpoints: `GET /api/admin/leads`, `PATCH /api/admin/leads/:id/status`, and `GET /api/dashboard/tracking`.
  - Composite `rfqSubmissionSchema` (`contact`, `meta`, `items`) is missing in code.
  - 100% of custom handlers violate standard `{success, data, error, meta}` response envelope.
- **Wave Assignment**: **Wave 1** (Response Envelope & Schema Alignment) & **Wave 2** (Absent Admin/Tracking Endpoint Creation).

### 1.5 Auth & ADR Audit — [CRITICAL EDGE INCOMPATIBILITY / ADR PRODUCED]
- **Findings**:
  - Eager import of `PrismaAdapter(prisma)` and `bcryptjs` in `src/lib/auth/auth.config.ts` fails in Edge Runtime context.
  - **ADR-0006** (`docs/system/adr/0006-authjs-v5-cloudflare-edge-runtime-split-config.md`) produced: Selected **Option B** (Separate Node-runtime NextAuth handler in `auth.ts` + Edge JWT middleware in `auth.config.ts`).
  - JWT strategy and role-based expiry (`CLIENT`=24h, `ADMIN`=8h, `VIEWER`=8h) verified matching docs.
  - Mismatch: Google OAuth creates users with `role: 'CLIENT'`, whereas docs restrict OAuth to internal staff (`ADMIN`/`VIEWER`).
  - Password reset endpoints (`/api/auth/forgot-password`, `/api/auth/reset-password`) are missing from `reference.md` and currently declare Edge runtime erroneously.
- **Wave Assignment**: **Wave 1** (Task 3.1.1 Auth.js v5 Edge Refactor per ADR-0006).

### 1.6 Analytics Audit — [DRIFT / PRD STATUS UPDATE NEEDED]
- **Findings**:
  - PostHog initialization verified client-side only (`typeof window === 'undefined'`), zero PII in event payloads.
  - Sentry configuration verified: `isCloudflareBuild` in `next.config.ts` disables Sentry bundling during Cloudflare Pages builds to preserve the 25MB worker bundle limit; source maps disabled; sensitive headers sanitized.
  - Event taxonomy drift: PRD §4.3 documents 13 fine-grained events while `gtag.ts` defines 6 consolidated event types.
  - GDPR/LGPD compliance verified: `/dashboard*` routes strictly excluded from GA4 telemetry.
  - Both PostHog & Sentry are active in Phase 1 code; `docs/strategy/prd.md` status must be updated from "Phase 2" to "Active Phase 1".
- **Wave Assignment**: **Wave 4** (Task 3.4.1 PostHog Integration & Task 3.4.2 Sentry Error Tracking).

### 1.7 21st SDK Footprint Audit — [PURGE / REMOVE IN WAVE 4]
- **Findings**:
  - Inventory: 6 files, 195 lines of code (`src/app/chat/page.tsx`, `src/app/chat/theme.json`, `src/app/api/an-token/route.ts`, `src/agents/my-agent/index.ts`, and 2 unit test files).
  - Footprint: 4 experimental npm packages (`@21st-sdk/agent`, `@21st-sdk/nextjs`, `@21st-sdk/node`, `@21st-sdk/react`).
  - `/api/an-token` uses in-memory rate limiting and server-side `API_KEY_21ST` key exchange.
  - Feature renders dummy math chatbot (`my-agent`) completely unrelated to DBSN business domain.
  - Risk assessment: High risk to Cloudflare 25MB Pages worker bundle limit and rate limit bypass across distributed workers.
  - **Recommendation**: Complete purge (`remove`) in Wave 4 task 3.4.3.
- **Wave Assignment**: **Wave 4** (Task 3.4.3 21st SDK Scope Creep Resolution).

### 1.8 Dead Code Audit — [SAFE TO DELETE / MIGRATION PATH]
- **Findings**:
  - `tailwind.config.ts`: Zero code imports found across codebase. Tailwind CSS v4 CSS-first migration complete (`src/app/globals.css`). Marked **SAFE TO DELETE (LOW RISK)**.
  - `sentry-example-page/`: Confirmed unlinked from all navigation menus, sitemaps, and middleware routes. Marked **SAFE TO DELETE (LOW RISK)**.
  - `src/lib/api/articles.ts`: 174 lines of inline HTML articles consumed directly by `ArticlesSection.tsx`. Hub dynamic `/articles` routes already query Sanity CMS (`getArticles()`). Migration path established: Seed 6 inline articles into Sanity CMS as `article` documents, update `ArticlesSection.tsx`, then delete `articles.ts`. Marked **REQUIRES MIGRATION FIRST (MEDIUM RISK)**.
- **Wave Assignment**: **Wave 4** (Task 3.4.4 Dead Code Purge & Article Migration).

---

## Wave Impact Map

| Finding / Issue | Severity | Target Wave | Target OpenSpec Change | Priority |
|---|---|---|---|---|
| Eager Prisma/Bcrypt import in `auth.config.ts` (Edge failure) | CRITICAL | **Wave 1** | `auth-edge-refactor` | P0 |
| Loopback `fetch('/api/redirects/lookup')` inside Edge Middleware | CRITICAL | **Wave 1** | `middleware-greenfield-alignment` | P0 |
| Response Envelope & Schema Mismatch across API Routes | HIGH | **Wave 1** | `api-contract-alignment` | P1 |
| Hostname resolution & `preview` domain class missing | HIGH | **Wave 1** | `middleware-greenfield-alignment` | P1 |
| Single-table `Lead` vs Composite `RfqSubmission` schema drift | CRITICAL | **Wave 2** | `prisma-rfq-schema-migration` | P0 |
| Absent Admin & Tracking Endpoints (`/api/admin/leads`, etc.) | HIGH | **Wave 2** | `admin-tracking-endpoints` | P1 |
| Missing Sanity Schemas (`certification`, `article`, `page`) | HIGH | **Wave 3** | `sanity-schema-alignment` | P1 |
| GROQ Query field drift on registered Studio types | MEDIUM | **Wave 3** | `sanity-schema-alignment` | P2 |
| PostHog & Sentry PRD status update (Phase 2 -> Active Phase 1) | MEDIUM | **Wave 4** | `analytics-prd-sync` | P2 |
| 21st SDK Agent Chat scope creep purge | MEDIUM | **Wave 4** | `sdk-footprint-purge` | P2 |
| Dead code removal (`tailwind.config.ts`, `sentry-example-page`) | LOW | **Wave 4** | `dead-code-purge` | P3 |
| Inline HTML `articles.ts` migration to Sanity CMS | MEDIUM | **Wave 4** | `article-cms-migration` | P2 |

---

## Merge Gate Checklist

- [x] `validate-ai-docs.cjs`: 0 issues
- [x] `graphify update .`: completed
- [x] All 8 card output files exist in `docs/audit/`
- [x] ADR-0006 created at `docs/system/adr/0006-authjs-v5-cloudflare-edge-runtime-split-config.md`
- [x] No `sentradaya.com` references in report
- [x] No hallucinated env var references in report
