# DBSN Centralized Digital Ecosystem — Documentation Index

This index is the entry point for both human contributors and AI agents. Start here before opening individual guides.

> **Production Domain Notice:** The production domain is **`dayaberkah.id`** (see [DNS Cutover Mapping](core/architecture/dns-cutover-mapping.md) and [ADR-0001](adr/0001-migrate-fully-to-cloudflare-pages.md)). All documentation files in this repository reflect `dayaberkah.id`.

---

## Start Here

| Audience | Read this first |
|---|---|
| AI agent / Antigravity CLI | [`/AGENTS.md`](../AGENTS.md) — authoritative operating reference & rules |
| New human contributor | [`ONBOARDING.md`](ONBOARDING.md) — Day-1 checklist |
| Repo visitor | [`/README.md`](../README.md) — quick start + system topology |

---

## Architecture & Design

| Doc | Purpose |
|---|---|
| [System Architecture](core/architecture/architecture.md) | Stack, topology, data flows, API contracts |
| [Middleware & Routing](core/architecture/middleware-routing.md) | Edge subdomain resolution, anti-patterns |
| [TDD v1 Specs](core/architecture/tdd-v1.md) | Test-driven build blueprint & E2E contracts |
| [DNS Cutover Mapping](core/architecture/dns-cutover-mapping.md) | Authoritative domain & DNS routing source of truth |

---

## Information Architecture

| Doc | Purpose |
|---|---|
| [IA Index](core/information-architecture/information-architecture.md) | Entry point for Information Architecture docs |
| [Strategy & Navigation](core/information-architecture/ia-strategy-navigation.md) | Navigation systems, header & footer specs |
| [Sitemaps](core/information-architecture/ia-sitemaps.md) | Hub, Spoke, and Dashboard sitemaps |
| [User Flows](core/information-architecture/ia-user-flows.md) | B2G/B2B core user flows & fallback behavior |

> Fitur Request for Quotation (RFQ) diimplementasikan sebagai form/modal terintegrasi pada Halaman Kontak (`/contact`) serta halaman detail produk, yang memproses submisi langsung melalui API endpoint `/api/rfq`.

---

## Product Requirements & Business Context

| Doc | Purpose |
|---|---|
| [PRD v3.1](core/prd/prd-v3.md) | Canonical technical PRD — requirements, API specs, SLAs |
| [PRD — Executive Edition](core/prd/prd-c-level-segment-focus.md) | Executive & segment-focused companion to PRD v3.1 |
| [Business Context Report](core/business-context/DBSN_Bussiness-Context.md) | BMC, PESTLE, SWOT & VRIO analysis informing PRD v3.1 |

---

## Development & Testing

| Doc | Purpose |
|---|---|
| [Local Setup](core/development/local-setup.md) | Subdomain dev environment (`lvh.me` routing) |
| [Cloudflare Deployment](core/development/cloudflare-deployment.md) | Custom domains, env vars & Wrangler deploy workflows |
| [Sanity CMS Guide](core/development/sanity-cms-guide.md) | GROQ queries, cache tags, & ISR revalidation webhooks |
| [Testing Guide](core/development/testing-guide.md) | Jest conventions & coverage targets |
| [Mocking Specs](core/testing/mocking-specs.md) | Prisma, Sanity, Resend & Telegram mock patterns |
| [GSC Setup](core/development/gsc-setup.md) | Search Console verification & sitemap submission |

---

## Code Terrain Maps

| Doc | Purpose |
|---|---|
| [Architecture Codemap](CODEMAPS/architecture.md) | Route structure & middleware execution chain |
| [Backend Codemap](CODEMAPS/backend.md) | API routes, auth layer & notification services |
| [Frontend Codemap](CODEMAPS/frontend.md) | Page tree, component hierarchy & form integrations |
| [Data Codemap](CODEMAPS/data.md) | Sanity schemas, Prisma models & validation schemas |
| [Dependencies Codemap](CODEMAPS/dependencies.md) | Package inventory by architectural concern |

---

## Decisions & Roadmap

| Doc | Purpose |
|---|---|
| [Project Roadmap](core/project-roadmap.md) | Phase status & launch gate checklist |
| [ADR Index](adr/README.md) | All accepted Architecture Decision Records |
| [Archived Design System](archive/design-system.md) | UI Design tokens, OKLCH color palettes & typography |
| [Archived Reviews](archive/reviews/subdomain-middleware-review.md) | Historical code reviews (Sanity CMS, Subdomain Middleware) |
| [Archived: Vercel Deployment](archive/vercel-deployment.md) | Historical reference — superseded by ADR-0001 |
| [Archived: Auth Flow Proposals](archive/specs/2026-06-10-secure-auth-flow-design.md) | Historical proposal — superseded by Edge Subdomain Middleware |
