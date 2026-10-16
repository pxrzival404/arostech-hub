---
id: ADR-0003
title: "ADR-0003: Greenfield Hub-and-Spoke Subdomain Routing Architecture over Legacy 301 Redirect Engine"
version: 4.0.0
status: ACCEPTED
target_domain: dayaberkah.id
graphify_community: "community_adr"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L22-L28"
  overview: "file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L40-L60"
  data_model: "file:///d:/dev/arostech-hub/docs/system/data-model/00-overview.md#L22-L30"
---

# ADR-0003: Greenfield Hub-and-Spoke Subdomain Routing Architecture over Legacy 301 Redirect Engine

> **TL;DR**: Authoritative specification and architectural reference for ADR-0003: Greenfield Hub-and-Spoke Subdomain Routing Architecture over Legacy 301 Redirect Engine within the DBSN platform (docs/system/adr/0003-greenfield-hub-and-spoke-subdomain-routing.md).


> **OpenSpec SDD Lifecycle Mapping**: `ADDED: 2026-08-12 PRD v4.0.0 Decision #7 Implementation`  
> **Authoritative Baseline Reference**: Architectural Decision Record formalizing Decision #7 from PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L22-L28)), establishing a greenfield build strategy for `dayaberkah.id` and its product spokes via Next.js 16 Edge Subdomain Middleware, completely superseding legacy redirect engines.
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/adr/0003-greenfield-hub-and-spoke-subdomain-routing.md`

---

## OpenSpec Delta

- `ADDED`: Established Greenfield Hub-and-Spoke Subdomain Routing Architecture executed within Next.js 16 App Router Edge Middleware.
- `REMOVED`: Eliminated all legacy 301 redirect engine specifications, legacy URL mapping lookups, Cloudflare Edge redirect Workers, redirect API lookup endpoints, and `redirect_map` database tables.

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-ADR-0003 Greenfield Subdomain Edge Routing
The system MUST execute native subdomain routing inside Next.js 16 Edge Middleware (`src/middleware.ts`). Subdomain requests for `dayaberkah.id` (Hub), product spokes (`pju`, `solarcell`, `alatpetir`, `baterai`), and Client Tracking Portal (`dashboard`) SHALL be rewritten to dedicated internal App Router route groups without external HTTP redirects or database lookup tables.

#### Scenario: Hub Domain Request Handling
- GIVEN an incoming request for `https://dayaberkah.id/`
- WHEN Edge Middleware inspects the `Host` header
- THEN middleware SHALL identify the request as the primary Hub domain
- AND the system MUST serve content from `src/app/(hub)/page.tsx` without URL rewrites.

#### Scenario: Product Spoke Subdomain Rewrite
- GIVEN an incoming request for `https://pju.dayaberkah.id/katalog`
- WHEN Edge Middleware resolves host `pju.dayaberkah.id`
- THEN middleware MUST rewrite the internal URL path to `src/app/(spokes)/pju/katalog`
- AND the browser location bar SHALL preserve `https://pju.dayaberkah.id/katalog`.

#### Scenario: Client Tracking Portal Routing
- GIVEN an incoming request for `https://dashboard.dayaberkah.id/tracking`
- WHEN Edge Middleware evaluates the `dashboard` subdomain prefix
- THEN middleware MUST rewrite request to `src/app/client-portal/tracking`
- AND access SHALL be gated by Auth.js v5 session verification.

---

## 2. Context & Problem Statement

Initial architectural iterations considered building complex legacy 301 redirect engines and maintaining Cloudflare Workers lookup tables to handle legacy domain URL migrations. However, maintaining legacy redirect tables introduced significant database rot, operational overhead, and latency overhead on edge lookups. PRD v4.0.0 Decision #7 established a clean **Greenfield Build Strategy** for `dayaberkah.id`.

---

## 3. Decision & Declarative Routing Schemas

We SHALL execute a Greenfield Hub-and-Spoke architecture directly within Next.js 16 App Router. SEO management MUST rely natively on Next.js 16 `Metadata` API, `sitemap.ts`, `robots.ts`, and Schema.org JSON-LD structured data.

### Declarative Subdomain Routing Schema

```typescript
import { z } from "zod";

export const SubdomainEnum = z.enum([
  "hub",
  "pju",
  "solarcell",
  "alatpetir",
  "baterai",
  "dashboard",
]);

export const SubdomainConfigSchema = z.object({
  subdomain: SubdomainEnum,
  hostPattern: z.string(),
  internalRoutePrefix: z.string(),
  authRequired: z.boolean().default(false),
  canonicalDomain: z.string().url(),
});

export type SubdomainType = z.infer<typeof SubdomainEnum>;
export type SubdomainConfig = z.infer<typeof SubdomainConfigSchema>;
```

### Edge Subdomain Routing Matrix

| Host Header | Subdomain Type | Internal App Router Path | Auth Requirement |
| :--- | :---: | :--- | :---: |
| `dayaberkah.id` | `hub` | `src/app/(hub)/*` | Public |
| `pju.dayaberkah.id` | `pju` | `src/app/(spokes)/pju/*` | Public |
| `solarcell.dayaberkah.id` | `solarcell` | `src/app/(spokes)/solarcell/*` | Public |
| `alatpetir.dayaberkah.id` | `alatpetir` | `src/app/(spokes)/alatpetir/*` | Public |
| `baterai.dayaberkah.id` | `baterai` | `src/app/(spokes)/baterai/*` | Public |
| `dashboard.dayaberkah.id` | `dashboard` | `src/app/client-portal/*` | Session Token Required |

---

## 4. Alternatives Considered

### Alternative 1: Edge Worker 301 Redirect Engine with Database Lookups
- **Pros**: Retains historical legacy URL paths.
- **Cons**: Requires persistent database query overhead on every request, creates complex lookup table maintenance, and introduces high edge latency.
- **Why not**: Legacy redirect engines add unnecessary table rot and complexity for a greenfield platform launch.

### Alternative 2: Separate Next.js Applications per Subdomain
- **Pros**: Full physical isolation per subdomain.
- **Cons**: High build complexity, duplicated codebases, fragmented deployment pipelines, and shared component rot.
- **Why not**: Single Next.js 16 app with Edge Subdomain Middleware provides far superior developer ergonomics, atomic deployments, and code sharing.

---

## 5. Consequences & Impact Analysis

### Positive
- Zero database query overhead for routing decisions; rewrites are evaluated in sub-millisecond time at Cloudflare Edge.
- Single codebase deployment to Cloudflare Pages via `@opennextjs/cloudflare`.
- Clean, maintainable SEO architecture utilizing Next.js 16 native Metadata API and dynamic XML sitemaps.

### Negative & Mitigations
- All subdomains MUST point CNAME DNS records to `dayaberkah.pages.dev` in Cloudflare Dashboard.
- **Mitigation**: CNAME wildcard records (`*.dayaberkah.id`) streamline DNS provisioning.
