---
id: doc:analytics-audit-findings
title: Card 1.6 Analytics & Telemetry Audit Findings
version: 1.0.0
status: APPROVED
graphify_community: 30
authoritative_references:
  - file:///D:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md
  - file:///D:/dev/arostech-hub/src/lib/analytics/gtag.ts
  - file:///D:/dev/arostech-hub/src/lib/analytics/posthog.ts
  - file:///D:/dev/arostech-hub/src/hooks/use-analytics.ts
  - file:///D:/dev/arostech-hub/sentry.client.config.ts
  - file:///D:/dev/arostech-hub/next.config.ts
---

# Card 1.6 Analytics & Telemetry Audit Findings

> **TL;DR**: Authoritative specification and architectural reference for Card 1.6 Analytics & Telemetry Audit Findings within the DBSN platform (docs/operations/audits/phase-1-findings/analytics-findings.md).


> **Project**: PT Daya Berkah Sentosa Nusantara (DBSN) — `arostech-hub`  
> **Audit Target**: Analytics & Telemetry Implementation (`GA4`, `PostHog`, `Sentry`)  
> **Branch**: `refactor/reorganize-project-documentation`  
> **Date**: 2026-08-13  
> **Auditor**: Card 1.6 Analytics Audit Agent  

---

## 1. Executive Summary

This audit evaluates the analytics and telemetry infrastructure of `arostech-hub` across `src/lib/analytics/`, `src/hooks/use-analytics.ts`, `src/app/layout.tsx`, Sentry configurations, and `next.config.ts`. The implementation was compared against `docs/strategy/prd/00-overview-and-goals.md` (§4.3 Analytics & Telemetry Strategy).

### Core Findings Key Table
| Audit Dimension | Status | Key Observation | Action Required |
|---|---|---|---|
| **PostHog Integration** | **PASS (Secure)** | Client-only init enforced; zero PII in event payloads; input masking active. | Maintain current client isolation patterns. |
| **Sentry Integration** | **PASS (Secure)** | Stripped in Cloudflare production builds to respect 25MB limit; source maps disabled. | No source map leaks detected. |
| **GDPR / LGPD Compliance** | **PASS** | No PII tracked; `/dashboard*` explicitly excluded from GA4 telemetry. | Verified compliant. |
| **Event Taxonomy** | **DRIFT (Medium)** | Code uses consolidated 6-enum set (`AnalyticsEvent`); PRD §4.3 documents 13 fine-grained events. | Align PRD §4.3 and code event taxonomy. |
| **PRD Lifecycle Status** | **PHASE CREEP** | Code has fully integrated PostHog & Sentry; PRD lists both as "Phase 2". | Reconcile PRD status from "Phase 2" to "Active Phase 1". |

---

## 2. Scope & Files Inspected

- [`src/lib/analytics/gtag.ts`](file:///D:/dev/arostech-hub/src/lib/analytics/gtag.ts) — GA4 pageview & event dispatch
- [`src/lib/analytics/posthog.ts`](file:///D:/dev/arostech-hub/src/lib/analytics/posthog.ts) — PostHog SDK wrapper & privacy controls
- [`src/hooks/use-analytics.ts`](file:///D:/dev/arostech-hub/src/hooks/use-analytics.ts) — Dual-dispatch tracking hook (`useTrackEvent`)
- [`src/app/layout.tsx`](file:///D:/dev/arostech-hub/src/app/layout.tsx) — `GoogleAnalytics` layout mount
- [`src/components/shared/GoogleAnalytics.tsx`](file:///D:/dev/arostech-hub/src/components/shared/GoogleAnalytics.tsx) — Route change listener & GTAG script wrapper
- [`sentry.client.config.ts`](file:///D:/dev/arostech-hub/sentry.client.config.ts) — Client Sentry setup & privacy filtering
- [`sentry.server.config.ts`](file:///D:/dev/arostech-hub/sentry.server.config.ts) — Server Sentry setup & header stripping
- [`sentry.edge.config.ts`](file:///D:/dev/arostech-hub/sentry.edge.config.ts) — Edge Sentry initialization
- [`next.config.ts`](file:///D:/dev/arostech-hub/next.config.ts) — Webpack alias & Sentry build wrapper toggle
- [`docs/strategy/prd/00-overview-and-goals.md`](file:///D:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md) — PRD telemetry specification

---

## 3. Detailed Audit Findings

### 3.1 Verification (a): PostHog Initialization & Privacy Control

**Status**: `VERIFIED PASS`

1. **Client-Side Only Initialization**:
   In [`src/lib/analytics/posthog.ts:6-22`](file:///D:/dev/arostech-hub/src/lib/analytics/posthog.ts#L6-L22), `initPostHog()` evaluates `typeof window === 'undefined' || typeof window.document === 'undefined' || !POSTHOG_KEY` before calling `posthog.init()`. This guarantees that PostHog NEVER executes during SSR or Edge rendering.
2. **Privacy Configurations Active**:
   - `autocapture: false` — Explicitly disables automatic DOM click/input capture to prevent unintended form scraping.
   - `session_recording.maskAllInputs: true` — Masks all text inputs during session recordings.
   - `capture_pageview: false` — Pageviews are managed deterministically.
   - `persistence: 'localStorage'` — Uses explicit local storage for session state.
3. **Payload Inspection & PII Verification**:
   All call sites consuming `useTrackEvent()` pass strictly non-PII parameters:
   - `RfqB2BForm.tsx` & `RfqB2GForm.tsx`: `{ segment: 'B2B'|'B2G', spoke, item_count }`
   - `AnalyticsDownloadLink.tsx`: `{ file_name, file_type }`
   - `AnalyticsLink.tsx`: `{ spoke, source }`
   - `ProductViewTracker.tsx`: `{ product_name, spoke }`
   - `ContactSection.tsx`, `Footer.tsx`, `Navbar.tsx`, `contact-client.tsx`: `{ contact_type, location }`
   
   > [!NOTE]
   > `identifyUser()` is defined in `posthog.ts` for future authenticated identity mapping, but is currently NOT invoked anywhere in production client code (verified via AST grep). Unit tests in [`src/__tests__/lib/analytics/posthog.test.ts`](file:///D:/dev/arostech-hub/src/__tests__/lib/analytics/posthog.test.ts#L109) cover `identifyUser` behavior in isolation.

---

### 3.2 Verification (b): Sentry Initialization & Source Map Protection

**Status**: `VERIFIED PASS`

1. **Production Worker Size Protection**:
   Cloudflare Pages enforces a strict 25MB worker bundle limit. In [`next.config.ts:9-68`](file:///D:/dev/arostech-hub/next.config.ts#L9-L68), `isCloudflareBuild` evaluates `true` when `process.env.CF_PAGES === "1" || process.env.NEXT_ON_PAGES === "1" || process.env.NODE_ENV === "production"`. When `isCloudflareBuild` is true:
   ```ts
   config.resolve.alias = {
     ...(config.resolve.alias || {}),
     "@sentry/nextjs": false,
   };
   ```
   Furthermore, `withSentryConfig` is bypassed during production Cloudflare builds ([`next.config.ts:84-85`](file:///D:/dev/arostech-hub/next.config.ts#L84-L85)), eliminating bundle overhead and guaranteeing compliance with Cloudflare Pages worker limits.

2. **Zero Production Source Map Leaks**:
   When `withSentryConfig` is evaluated in development/staging environments, `sourcemaps: { disable: true }` is explicitly set ([`next.config.ts:93-95`](file:///D:/dev/arostech-hub/next.config.ts#L93-L95)). Public source maps are stripped from production builds.

3. **Sensitive Header & Secret Filtering**:
   Both [`sentry.client.config.ts:15-23`](file:///D:/dev/arostech-hub/sentry.client.config.ts#L15-L23) and [`sentry.server.config.ts:7-15`](file:///D:/dev/arostech-hub/sentry.server.config.ts#L7-L15) implement `beforeSend` sanitization:
   ```ts
   beforeSend(event) {
     if (event.request?.headers) {
       delete event.request.headers['cookie'];
       delete event.request.headers['authorization'];
       delete event.request.headers['x-auth-token'];
     }
     return event;
   }
   ```
   Cookies and authorization tokens are stripped prior to event transmission.

---

### 3.3 Verification (c): Event Name Taxonomy vs PRD §4.3

**Status**: `DRIFT DETECTED (MEDIUM)`

The codebase defines a consolidated set of 6 event enum values in [`src/lib/analytics/gtag.ts:11-18`](file:///D:/dev/arostech-hub/src/lib/analytics/gtag.ts#L11-L18):

```ts
export enum AnalyticsEvent {
  RFQ_SUBMIT = 'rfq_submit',
  RFQ_FALLBACK_WHATSAPP = 'rfq_fallback_whatsapp',
  PRODUCT_VIEW = 'product_view',
  FILE_DOWNLOAD = 'file_download',
  CONTACT_CLICK = 'contact_click',
  SPOKE_NAVIGATION = 'spoke_navigation'
}
```

However, [`docs/strategy/prd/00-overview-and-goals.md` §4.3](file:///D:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L396) specifies a 13-event fine-grained taxonomy:

| PRD §4.3 Event Name | Code Implementation Status | Code Enum Equivalent | Remarks |
|---|---|---|---|
| `whatsapp_click` | Partial | `CONTACT_CLICK` | Tracked via `contact_type: 'whatsapp'` |
| `rfq_start` | Missing | N/A | Form focus event not currently instrumented |
| `rfq_submit_attempt` | Missing | N/A | Submit click event not instrumented |
| `rfq_submit_success` | Implemented | `RFQ_SUBMIT` | Code uses `rfq_submit` on success |
| `rfq_submit_failure` | Missing | N/A | Error catch block does not log telemetry |
| `rfq_abandonment` | Missing | N/A | Page unload/exit listener not implemented |
| `file_download` | Implemented | `FILE_DOWNLOAD` | Fully matched via `AnalyticsDownloadLink` |
| `hub_to_spoke_click` | Implemented | `SPOKE_NAVIGATION` | Code uses `spoke_navigation` |
| `portfolio_view` | Missing | N/A | Portfolio detail view not instrumented |
| `certification_view` | Missing | N/A | Certification view not instrumented |
| `dashboard_login_success` | Missing | N/A | Auth success event not instrumented |
| `dashboard_login_failure` | Missing | N/A | Auth failure event not instrumented |
| `tracking_status_view` | Missing | N/A | Tracking view not instrumented |
| *N/A (Code addition)* | Implemented | `RFQ_FALLBACK_WHATSAPP` | Triggered on RFQ fallback |
| *N/A (Code addition)* | Implemented | `PRODUCT_VIEW` | Triggered via `ProductViewTracker` |

> [!RECOMMENDATION]
> Update `AnalyticsEvent` enum in `gtag.ts` or reconcile PRD §4.3 to reflect the production telemetry scope (or expand `AnalyticsEvent` to include `rfq_start` / `rfq_submit_failure` in a future wave).

---

### 3.4 Verification (d): GDPR & LGPD Compliance

**Status**: `VERIFIED PASS`

1. **Dashboard Route Exclusion**:
   In [`src/components/shared/GoogleAnalytics.tsx:15-18`](file:///D:/dev/arostech-hub/src/components/shared/GoogleAnalytics.tsx#L15-L18), the route change listener explicitly suppresses tracking on authenticated client pages:
   ```ts
   if (pathname && pathname.startsWith('/dashboard')) {
     return
   }
   ```
   This prevents tracking internal portal activities, protecting client operational privacy.

2. **Data Minimization & Consent**:
   - Telemetry payloads transmit zero personal data (names, emails, phone numbers, addresses, or credentials).
   - Form inputs are excluded from event properties.
   - Sentry session replay masks text inputs (`maskAllText: true`) and blocks media assets (`blockAllMedia: true`).
   - Transport is enforced via HTTPS/TLS endpoints.

---

### 3.5 Verification (e): Intentional Phase-1-Active Status & PRD Status Reconciliation

**Status**: `PHASE CREEP CONFIRMED — PRD UPDATE REQUIRED`

- **Code Base State**:
  - `posthog-js` (v1.379.2) and `@sentry/nextjs` (v10.56.0) are declared in `package.json`.
  - PostHog is initialized on mount in `useTrackEvent()` hook.
  - Sentry configuration files exist across client, server, and edge targets.
- **PRD Document State**:
  - [`docs/strategy/prd/00-overview-and-goals.md:117`](file:///D:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L117): Listed as `"Phase 2: Sentry + PostHog"`.
  - [`docs/strategy/prd/00-overview-and-goals.md:150`](file:///D:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L150): Flowchart node labeled `"Phase 2: Sentry + PostHog\n(Error Tracking · Session Replay)"`.
  - [`docs/system/architecture/overview.md`](file:///D:/dev/arostech-hub/docs/system/architecture/overview.md): Omits PostHog/Sentry from Active Telemetry matrix.

**Conclusion**: PostHog and Sentry are intentionally active in Phase 1 code. PRD documentation must be updated from "Phase 2" to "Active Phase 1" to eliminate documentation drift.

---

## 4. Test Verification Evidence

All 3 unit test suites covering analytics utilities and hooks passed cleanly:

```bash
$ pnpm test src/__tests__/lib/analytics src/__tests__/hooks/use-analytics.test.ts

PASS src/__tests__/lib/analytics/posthog.test.ts
PASS src/__tests__/lib/analytics/gtag.test.ts
PASS src/__tests__/hooks/use-analytics.test.ts

Test Suites: 3 passed, 3 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        5.854 s
```

---

## 5. Summary of Recommended Action Items

1. **PRD & Architecture Document Reconciliation**:
   - Update [`docs/strategy/prd/00-overview-and-goals.md`](file:///D:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md) line 117 & line 150: Change `Phase 2: Sentry + PostHog` to `Active Phase 1: Sentry + PostHog (Error Tracking & Session Replay)`.
   - Update [`docs/system/architecture/overview.md`](file:///D:/dev/arostech-hub/docs/system/architecture/overview.md) telemetry section to list PostHog and Sentry as active stack components.
2. **Event Taxonomy Harmonization**:
   - Reconcile `AnalyticsEvent` enum in [`src/lib/analytics/gtag.ts`](file:///D:/dev/arostech-hub/src/lib/analytics/gtag.ts) with PRD §4.3 table (or add missing event aliases like `rfq_submit_success`).
3. **Dead Code Cleanup (Related)**:
   - Note for `refactor-cleaner`: [`src/app/sentry-example-page/page.tsx`](file:///D:/dev/arostech-hub/src/app/sentry-example-page/page.tsx) remains in production routes as a test artifact and should be pruned (tracked under Card 1.8).
