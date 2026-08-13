---
id: ARCH-LIFECYCLE-001
title: Subdomain Routing & Middleware Execution Lifecycle Architecture
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_architecture"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L110-L170"
  overview: "file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L1-L80"
---

# Subdomain Routing & Middleware Execution Lifecycle Architecture

> **[SUPERSEDED]**  
> The legacy 301 redirect engine, database-driven redirect lookups, and `/api/redirects/lookup` loopback mechanism detailed in prior specification drafts were **PERMANENTLY SUPERSEDED** by Greenfield Native SEO metadata generation (`sitemap.ts`, `robots.ts`) in PRD v3.6/v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L24-L30)).  
> The Next.js Edge Middleware logic SHALL execute pure Edge subdomain resolution without database calls, external loopbacks, or legacy 301 redirect tables.

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Cascade`  
> **Authoritative Baseline Reference**: This document describes the subdomain-based routing architecture for the DBSN platform, mapping request hostnames to internal Next.js App Router route groups on Cloudflare Pages via `@opennextjs/cloudflare`.

---

## ## OpenSpec Delta

- **ADDED**: Strict Edge Runtime execution contracts for Next.js 16 middleware, clean domain resolution, dynamic spoke rewrites, and client dashboard route guards.
- **REMOVED**: Legacy 301 redirect lookup tables (`redirect_map`), middleware database loopbacks, and AbortController fetch timeouts for legacy API endpoints.

---

## Section I: Subdomain Mapping System

PT Daya Berkah Sentosa Nusantara uses a multi-tenant hub-and-spoke domain routing model. The routing logic runs inside the Next.js Middleware (on the Cloudflare Pages Edge Runtime via `@opennextjs/cloudflare`) and maps hostnames to internal Next.js App Router paths as follows:

| Hostname Variation | Clean Domain Class | Target Route Group / Path | Subdomain Header |
| :--- | :--- | :--- | :--- |
| `dayaberkah.id` / `www.dayaberkah.id` | Hub Domain | `(hub)` (Transparent Root) | `hub` |
| `dashboard.dayaberkah.id` | Dashboard Subdomain | `/dashboard` (Dashboard Group) | `dashboard` |
| `[spoke].dayaberkah.id` | Spoke Subdomain | `/(spokes)/[spoke]` (Dynamic Route) | `[spoke]` |

---

## Section II: Route Groups & Directory Structure

The `src/app` directory is structured to isolate domain zones while sharing common UI components, hooks, and type definitions:

```
src/app/
├── (hub)/                  # Transparent route group for the main hub pages
│   ├── page.tsx            # Hub Homepage (dayaberkah.id/)
│   ├── about/              # Hub About (dayaberkah.id/about)
│   ├── contact/            # Hub Contact (dayaberkah.id/contact)
│   ├── products/           # Hub Products
│   ├── certifications/     # Hub Certifications
│   ├── faq/                # Hub FAQ
│   ├── portfolio/          # Hub Portfolio
│   └── articles/           # Hub Articles
├── (spokes)/               # Route group for individual spoke pages
│   └── [spoke]/            # Dynamic route segment matching spoke name (pju, solarcell, alatpetir, baterai)
│       ├── page.tsx        # Spoke Homepage (pju.dayaberkah.id/)
│       ├── products/       # Spoke Products Catalog
│       └── portfolio/      # Spoke Portfolio
├── dashboard/              # Route group for client dashboard pages
│   ├── page.tsx            # Dashboard home (dashboard.dayaberkah.id/)
│   └── login/              # Login pages
├── layout.tsx              # Root HTML layout (shared)
└── globals.css             # Global Tailwind v4 styles
```

---

## Section III: Middleware Chain & Routing Protocol

The Edge Middleware execution flow MUST strictly follow the non-blocking pipeline:

```
Request → src/middleware.ts (Edge Runtime)
  │
  ├─ Short-circuit: /api/*, /_next/*, /*.ext  → NextResponse.next()
  │
  ├─ cleanHostname(host)   → strips port number
  ├─ extractSubdomain(host)→ extracts spoke or dashboard prefix
  │
  ├─ isHubDomain()         → NextResponse.next() with header x-middleware-subdomain: 'hub'
  ├─ isDashboardDomain()   → session check (Auth.js cookie)
  │                          ├── authenticated   → rewrite: /dashboard{pathname}
  │                          └── unauthenticated → redirect: /dashboard/login
  ├─ isSpokeDomain(spoke)  → rewrite: /${spoke}${pathname}
  └─ unknown               → return new NextResponse(null, { status: 404 })
```

---

## Section IV: Cloudflare Pages Edge Constraints & Invariants

1. **Zero Database Imports in Middleware**: The middleware MUST NOT import Prisma Client or database drivers directly. Importing database modules inflates the Edge Function bundle and causes deployment failure.
2. **Transparent Route Group Rewrites**: The middleware MUST NOT rewrite Hub requests explicitly to `/(hub)` directories. Next.js route groups are transparent; explicit rewrites to `/(hub)` cause 404 errors on Cloudflare Pages.
3. **Strict Status 404 Return**: When an unrecognized subdomain or invalid path is requested, the middleware MUST return `new NextResponse(null, { status: 404 })` directly rather than rewriting to `/404`.

---

## Section V: Declarative Middleware Interfaces

```typescript
export interface SubdomainRoutingConfig {
  rootDomain: string;
  spokeSubdomains: readonly ['pju', 'solarcell', 'alatpetir', 'baterai'];
  dashboardSubdomain: 'dashboard';
}

export type CleanDomainClass = 'hub' | 'dashboard' | 'spoke' | 'unknown';

export interface EvaluatedSubdomainContext {
  hostname: string;
  cleanDomain: CleanDomainClass;
  subdomain: string | null;
  pathname: string;
}
```

---

## Section VI: OpenSpec Behavioral Contracts

### Requirement: REQ-ARCH-LIFE-001-SUBDOMAIN-ROUTING
The Edge Middleware SHALL resolve incoming request hostnames dynamically at the Edge and MUST route requests transparently without database dependencies or legacy redirect engine lookups.

#### Scenario: Hub Request Resolution
- GIVEN an incoming HTTP request for `dayaberkah.id/about`
- WHEN Edge Middleware processes the request header
- THEN it SHALL identify the host as a Hub domain
- AND it MUST pass execution to `NextResponse.next()` while attaching `x-middleware-subdomain: hub`.

#### Scenario: Spoke Subdomain Rewrite
- GIVEN an incoming HTTP request for `pju.dayaberkah.id/products`
- WHEN Edge Middleware processes the request header
- THEN it SHALL extract the spoke subdomain `pju`
- AND it MUST rewrite the request internally to `/pju/products` with `x-middleware-subdomain: pju`.

---

## Section VII: Knowledge Graph Anchoring

- **Graphify Node**: `doc:docs/system/architecture/execution-lifecycle.md`
- **Community**: `community_architecture`
- **Authoritative Anchor**: [`overview.md`](file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L1-L80)
