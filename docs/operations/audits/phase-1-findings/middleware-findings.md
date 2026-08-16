---
id: AUDIT-MW-CARD1.1-001
title: Card 1.1 Edge Middleware Execution & Subdomain Routing Audit
version: 1.0.0
status: IN_PROGRESS
target_domain: dayaberkah.id
graphify_community: "community_audits"
authoritative_references:
  execution_lifecycle: "file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L1-L147"
  middleware: "file:///d:/dev/arostech-hub/src/middleware.ts#L1-L146"
  config: "file:///d:/dev/arostech-hub/src/lib/middleware/config.ts#L1-L127"
  pages_host: "file:///d:/dev/arostech-hub/src/lib/utils/pages-host.ts#L1-L109"
  redirect_engine: "file:///d:/dev/arostech-hub/src/lib/middleware/redirect-engine.ts#L1-L106"
---

# Card 1.1 Edge Middleware Execution & Subdomain Routing Audit

> **TL;DR**: Authoritative specification and architectural reference for Card 1.1 Edge Middleware Execution & Subdomain Routing Audit within the DBSN platform (docs/operations/audits/phase-1-findings/middleware-findings.md).


> **Audit Execution Date**: 2026-08-13  
> **Target Repository**: `d:/dev/arostech-hub`  
> **Target Branch**: `refactor/reorganize-project-documentation`  
> **Auditor**: Card 1.1 Middleware Audit Agent  

---

## Executive Summary

This audit evaluates the current implementation of Next.js Edge Middleware (`src/middleware.ts`), middleware configuration (`src/lib/middleware/config.ts`), and legacy redirect engine (`src/lib/middleware/redirect-engine.ts`) against the authoritative High-Level Architecture defined in [`docs/system/architecture/execution-lifecycle.md`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L1-L147).

The implementation demonstrates a functional hub-and-spoke subdomain rewrite system for production and local development (`lvh.me`). However, critical architectural violations, specification drifts, unhandled query parameters, and superseded legacy components exist that must be remediated.

---

## Verification Summary Matrix

| Verification Target | Requirement Status | Finding Summary | Remediation Wave |
| :--- | :--- | :--- | :--- |
| **(a) 5 Domain Classes Present & Verified** | **PARTIAL / FAIL** | `hub`, `spoke`, `dashboard`, `unknown` present in spec; `preview` missing from `CleanDomainClass` type definition; Section V types absent in `config.ts`. | **Wave 1** |
| **(b) Short-Circuit Order** | **FAIL** | Middleware executes superseded legacy 301 `lookupRedirect()` loopback fetch BEFORE completing subdomain routing. | **Wave 1** |
| **(c) LRU Cache Configuration** | **PRESENT / OBSOLETE** | `Map`-based LRU cache (size 500, TTL 5m) works in JS, but resides inside `redirect-engine.ts` which was permanently superseded by PRD v4.0.0. | **Wave 1** |
| **(d) Query Param `?subdomain=preview`** | **FAIL** | `?subdomain=preview` is ignored by subdomain routing logic and defaults to Hub or 404. | **Wave 1** |
| **(e) Anti-Patterns Audit** | **FAIL** | Found: `/404` short-circuit check, loopback `fetch()` inside Edge middleware, hot-path `console.log`, spoke name drift between docs and code. | **Wave 1 & 2** |

---

## Detailed Findings & Evidence

### Verification (a): 5 Domain Classes Present and Verified

#### Objective
Verify that all 5 domain classes (`hub`, `spoke`, `dashboard`, `unknown`, `preview`) are defined, handled, and verified in middleware types and execution flow.

#### Findings & Line Anchors
1. **Missing `preview` in Architecture Specification**:
   - In [`execution-lifecycle.md:L111`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L111):
     ```typescript
     export type CleanDomainClass = 'hub' | 'dashboard' | 'spoke' | 'unknown';
     ```
     `preview` is **NOT** included in the `CleanDomainClass` type union defined in the architecture specification.
2. **Missing Declarative Types in Codebase**:
   - Section V of [`execution-lifecycle.md:L104-L119`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L104-L119) requires `SubdomainRoutingConfig`, `CleanDomainClass`, and `EvaluatedSubdomainContext` to be exported.
   - None of these interfaces or types exist in [`src/lib/middleware/config.ts`](file:///d:/dev/arostech-hub/src/lib/middleware/config.ts#L1-L127).
3. **Header Classification in Middleware**:
   - In [`src/middleware.ts:L72-L81`](file:///d:/dev/arostech-hub/src/middleware.ts#L72-L81):
     `x-middleware-subdomain` header only ever outputs `'hub'`, `'dashboard'`, or `spoke`. There is no execution path setting `x-middleware-subdomain: preview` or handling a distinct `preview` domain class.

---

### Verification (b): Short-Circuit Execution Order

#### Objective
Verify that the short-circuit evaluation order matches the non-blocking Edge pipeline defined in [`execution-lifecycle.md:L76-L90`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L76-L90).

#### Expected Pipeline ([`execution-lifecycle.md:L76-L90`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L76-L90))
```
Request → src/middleware.ts (Edge Runtime)
  │
  ├─ Short-circuit: /api/*, /_next/*, /*.ext  → NextResponse.next()
  ├─ cleanHostname(host)   → strips port number
  ├─ extractSubdomain(host)→ extracts spoke or dashboard prefix
  ├─ isHubDomain()         → NextResponse.next() with header x-middleware-subdomain: 'hub'
  ├─ isDashboardDomain()   → session check (Auth.js cookie)
  ├─ isSpokeDomain(spoke)  → rewrite: /${spoke}${pathname}
  └─ unknown               → return new NextResponse(null, { status: 404 })
```

#### Actual Pipeline ([`src/middleware.ts:L26-L136`](file:///d:/dev/arostech-hub/src/middleware.ts#L26-L136))
1. **Line 26–32**: Short-circuit for `/api`, `/_next`, and files with extensions. *(Compliant)*
2. **Line 34–44**: Hostname cleaning and query param extraction. *(Compliant)*
3. **Line 47–51**: **CRITICAL VIOLATION** — Calls `lookupRedirect(pathname, spoke, request.nextUrl.origin)`.
   - Executing `lookupRedirect()` makes an HTTP `fetch('/api/redirects/lookup')` loopback request with a 2-second timeout.
   - [`execution-lifecycle.md:L15-L18`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L15-L18) explicitly marks legacy 301 redirect engine as **PERMANENTLY SUPERSEDED** by Greenfield native SEO metadata (`sitemap.ts`, `robots.ts`) in PRD v4.0.0.
   - [`execution-lifecycle.md:L26-L27`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L26-L27) explicitly lists **REMOVED: Legacy 301 redirect lookup tables, middleware database loopbacks, and AbortController fetch timeouts**.
4. **Line 65–83**: Rewritten path short-circuit (includes `/404` check).
5. **Line 86–97**: Hub Domain Routing.
6. **Line 100–124**: Dashboard Domain Routing & Auth Guard.
7. **Line 127–133**: Spoke Domain Routing.
8. **Line 136**: Fallback 404.

---

### Verification (c): LRU Cache Configuration & Status

#### Objective
Verify that the LRU cache is present, correctly configured (eviction and TTL), and evaluated for Edge Runtime compatibility.

#### Findings & Line Anchors
1. **Implementation Details**:
   - Location: [`src/lib/middleware/redirect-engine.ts:L6-L45`](file:///d:/dev/arostech-hub/src/lib/middleware/redirect-engine.ts#L6-L45).
   - Capacity: `MAX_CACHE_SIZE = 500` ([`redirect-engine.ts:L7`](file:///d:/dev/arostech-hub/src/lib/middleware/redirect-engine.ts#L7)).
   - TTL: `CACHE_TTL = 5 * 60 * 1000` (5 minutes) ([`redirect-engine.ts:L8`](file:///d:/dev/arostech-hub/src/lib/middleware/redirect-engine.ts#L8)).
   - Eviction Mechanism: JavaScript `Map` key insertion order. `getFromCache()` re-inserts requested keys to refresh LRU position ([`redirect-engine.ts:L24-L25`](file:///d:/dev/arostech-hub/src/lib/middleware/redirect-engine.ts#L24-L25)). `setToCache()` evicts `cache.keys().next().value` when size exceeds 500 ([`redirect-engine.ts:L35-L38`](file:///d:/dev/arostech-hub/src/lib/middleware/redirect-engine.ts#L35-L38)).
2. **Architectural Assessment**:
   - Technically, the LRU algorithm is correctly written for single-isolate execution.
   - Architecturally, because `redirect-engine.ts` is part of the superseded 301 redirect mechanism ([`execution-lifecycle.md:L15-L18`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L15-L18)), the LRU cache is obsolete dead code that adds overhead on V8 Edge isolates.

---

### Verification (d): Query Parameter `?subdomain=preview` Routing

#### Objective
Verify whether `?subdomain=preview` works as expected for single-domain preview deployments.

#### Findings & Line Anchors
1. **Query Subdomain Resolution Logic**:
   - In [`src/middleware.ts:L38-L44`](file:///d:/dev/arostech-hub/src/middleware.ts#L38-L44):
     ```typescript
     const querySubdomainRaw = request.nextUrl.searchParams.get('subdomain')?.toLowerCase()
     if (querySubdomainRaw) {
       const resolvedQuerySubdomain = resolveSubdomainAlias(querySubdomainRaw)
       if ((SPOKE_SUBDOMAINS as readonly string[]).includes(resolvedQuerySubdomain)) {
         spoke = resolvedQuerySubdomain
       }
     }
     ```
   - In [`src/middleware.ts:L55-L63`](file:///d:/dev/arostech-hub/src/middleware.ts#L55-L63):
     ```typescript
     if (querySubdomainRaw) {
       const resolvedQuerySubdomain = resolveSubdomainAlias(querySubdomainRaw)
       if (resolvedQuerySubdomain === 'dashboard') {
         isDash = true
         spoke = null
       } else if ((SPOKE_SUBDOMAINS as readonly string[]).includes(resolvedQuerySubdomain)) {
         isDash = false
       }
     }
     ```
2. **Failure Analysis**:
   - When a request includes `?subdomain=preview`, `resolvedQuerySubdomain` evaluates to `'preview'`.
   - `'preview'` is **NOT** present in `SPOKE_SUBDOMAINS` (`['pju', 'solarpanel', 'penangkalpetir', 'baterai']`).
   - `'preview'` is **NOT** equal to `'dashboard'`.
   - Therefore, `?subdomain=preview` is completely ignored. The request falls through to standard Hub domain routing (attaching `x-middleware-subdomain: hub`) or returns 404 for non-hub hosts.
   - **Result**: `?subdomain=preview` fails to trigger preview routing or attach `x-middleware-subdomain: preview`.

---

### Verification (e): Anti-Patterns Audit

#### 1. `/404` Short-Circuit Anti-Pattern
- **Location**: [`src/middleware.ts:L68`](file:///d:/dev/arostech-hub/src/middleware.ts#L68).
- **Violation**: [`execution-lifecycle.md:L98`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L98) (Section IV Rule 3) explicitly states: *"When an unrecognized subdomain or invalid path is requested, the middleware MUST return `new NextResponse(null, { status: 404 })` directly rather than rewriting to `/404`."* Checking `pathname.startsWith('/404')` preserves legacy rewrite patterns.

#### 2. Loopback Fetch Anti-Pattern inside Edge Middleware
- **Location**: [`src/lib/middleware/redirect-engine.ts:L79`](file:///d:/dev/arostech-hub/src/lib/middleware/redirect-engine.ts#L79).
- **Violation**: Performing `fetch(url.toString(), { signal: controller.signal })` to `/api/redirects/lookup` inside middleware introduces up to 2000ms latency, increases Cloudflare Edge sub-request counts, and violates Section IV Rule 1 (Zero database/loopback calls).

#### 3. Unfiltered Hot-Path Console Logging
- **Location**: [`src/middleware.ts:L92`](file:///d:/dev/arostech-hub/src/middleware.ts#L92).
- **Violation**: `console.log('[Middleware] Hub domain detected: ...')` executes on every Hub request in production Edge isolates, degrading execution performance and polluting log outputs.

#### 4. Subdomain Naming Mismatch & Specification Drift
- **Location**: [`docs/system/architecture/execution-lifecycle.md:L107`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L107) vs [`src/lib/utils/pages-host.ts:L29`](file:///d:/dev/arostech-hub/src/lib/utils/pages-host.ts#L29).
- **Violation**: `execution-lifecycle.md` specifies `['pju', 'solarcell', 'alatpetir', 'baterai']` as canonical spoke subdomains. Code defines `['pju', 'solarpanel', 'penangkalpetir', 'baterai']` as canonical and treats `solarcell`/`alatpetir` as aliases. (Recorded in [`AGENTS.md:L280-L281`](file:///d:/dev/arostech-hub/AGENTS.md#L280-L281)).

#### 5. Direct Hub Path Access to `/dashboard`
- **Location**: [`src/middleware.ts:L86-L97`](file:///d:/dev/arostech-hub/src/middleware.ts#L86-L97).
- **Violation**: Requesting `dayaberkah.id/dashboard` passes through Hub routing because `/dashboard` is not listed in `SPOKE_SUBDOMAINS` (L88). This allows accessing dashboard pages directly under the Hub domain without `x-middleware-subdomain: dashboard` header isolation.

---

## Action Plan & Wave Assignments

### Wave 1: Immediate Critical Fixes (Spec Alignment & Security/Performance)
1. **Remove Superseded Legacy Redirect Engine**:
   - Delete call to `lookupRedirect()` from [`src/middleware.ts:L47-L51`](file:///d:/dev/arostech-hub/src/middleware.ts#L47-L51).
   - Deprecate or remove [`src/lib/middleware/redirect-engine.ts`](file:///d:/dev/arostech-hub/src/lib/middleware/redirect-engine.ts#L1-L106).
   - Update integration tests in `src/__tests__/middleware.test.ts`.
2. **Implement `preview` Domain Class & `?subdomain=preview` Handling**:
   - Add `'preview'` to `CleanDomainClass` in [`execution-lifecycle.md:L111`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L111).
   - Export `SubdomainRoutingConfig`, `CleanDomainClass`, and `EvaluatedSubdomainContext` from [`src/lib/middleware/config.ts`](file:///d:/dev/arostech-hub/src/lib/middleware/config.ts).
   - Update [`src/middleware.ts`](file:///d:/dev/arostech-hub/src/middleware.ts) to handle `?subdomain=preview`, setting `x-middleware-subdomain: preview`.
3. **Remove `/404` Short-Circuit Check & Hot-Path Logging**:
   - Remove `pathname.startsWith('/404')` from [`src/middleware.ts:L68`](file:///d:/dev/arostech-hub/src/middleware.ts#L68).
   - Remove `console.log` from [`src/middleware.ts:L92`](file:///d:/dev/arostech-hub/src/middleware.ts#L92).

### Wave 2: Architectural Standardization & Governance
1. **Reconcile Subdomain Naming Drift**:
   - Synchronize [`execution-lifecycle.md`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md) and [`src/lib/utils/pages-host.ts`](file:///d:/dev/arostech-hub/src/lib/utils/pages-host.ts) regarding canonical spoke names (`solarcell`/`alatpetir` vs `solarpanel`/`penangkalpetir`).
2. **Enforce Dashboard Path Isolation**:
   - Add explicit check in Hub domain handler to reject direct access to `/dashboard` paths on Hub domain, returning 404 or redirecting to `dashboard.dayaberkah.id`.

---

## OpenSpec Behavioral Scenarios for Remediation

### Scenario: Pure Edge Middleware Execution (No Loopback Fetch)
```gherkin
GIVEN an incoming request for "pju.dayaberkah.id/products"
WHEN Edge Middleware executes on Cloudflare Pages
THEN it MUST NOT invoke external fetch calls to "/api/redirects/lookup"
AND it SHALL rewrite the request directly to "/pju/products" with header "x-middleware-subdomain: pju".
```

### Scenario: Preview Subdomain Query Parameter Handling
```gherkin
GIVEN an incoming request for "dayaberkah.id/about?subdomain=preview"
WHEN Edge Middleware processes the request query parameter
THEN it SHALL identify the target domain class as "preview"
AND it MUST attach header "x-middleware-subdomain: preview".
```

---

## Knowledge Graph Anchoring

- **Graphify Node**: `doc:docs/operations/audits/phase-1-findings/middleware-findings.md`
- **Community**: `community_architecture`
- **Authoritative Anchor**: [`execution-lifecycle.md`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L1-L147)
