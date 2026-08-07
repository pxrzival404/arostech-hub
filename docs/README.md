# DBSN Centralized Digital Ecosystem — Documentation Hub Index

This index is the single entry point for both human contributors and AI agents. Start here before opening individual guides.

> **Production Domain Notice:** The production domain is **`dayaberkah.id`** (see [DNS Cutover Mapping](system/dns-cutover-mapping.md) and [ADR-0001](adr/0001-migrate-fully-to-cloudflare-pages.md)).

---

## 🚀 Quick Navigation

| Audience / Purpose | Read First |
|---|---|
| AI agent / Antigravity CLI | [`/AGENTS.md`](../AGENTS.md) — authoritative operating reference & rules |
| New human contributor | [`ONBOARDING.md`](ONBOARDING.md) — Day-1 checklist & setup |
| Repo visitor | [`/README.md`](../README.md) — quick start & system topology |
| Security scanner / reporter | [`/SECURITY.md`](../SECURITY.md) — security disclosure policy |
| Code contributor | [`/CONTRIBUTING.md`](../CONTRIBUTING.md) — Git Flow & commit rules |

---

## 🏛️ 7-Pillar Documentation Structure

### 1. System Identity & Scope (`docs/system/`)
- [Identity & Compatibility Matrix](system/identity-and-scope.md) — System vision, philosophy & compatibility matrix
- [System Architecture](system/architecture.md) — Stack, topology, data flows, API contracts
- [Middleware & Routing](system/middleware-routing.md) — Edge subdomain resolution & execution chain
- [TDD v1 Specs](system/tdd-v1.md) — Test-driven build blueprint & E2E contracts
- [DNS Cutover Mapping](system/dns-cutover-mapping.md) — Authoritative domain & DNS routing source of truth
- [Business Context Report](system/business-context.md) — BMC, PESTLE, SWOT & VRIO analysis
- [Project Roadmap](system/project-roadmap.md) — Launch gates & roadmap milestones

### 2. Quick Start & MWE (`docs/mwe/`)
- [Adding a New Product Spoke](mwe/add-new-spoke.md) — Step-by-step guide for creating product spokes
- [Adding a Secure API Endpoint](mwe/add-api-endpoint.md) — Step-by-step guide for building API route handlers
- [Local Setup Manual](development/local-setup.md) — Subdomain dev environment (`lvh.me` routing)

### 3. Architecture & Core Mechanics (`docs/system/` & `docs/adr/`)
- [Architecture Decision Records Index](adr/README.md) — All accepted ADR records
- [ADR-0001: Cloudflare Pages Migration](adr/0001-migrate-fully-to-cloudflare-pages.md)
- [ADR-0002: Deploy Command Strategy](adr/0002-explicit-cloudflare-pages-deploy-command.md)

### 4. API Reference & Extensibility (`docs/api/`)
- [Public API Reference](api/api-reference.md) — Zod contracts for RFQ, Auth, and Revalidation
- [Environment Configuration Schema](api/env-configuration-schema.md) — Complete environment variables matrix

### 5. Governance & Workflow (`docs/workflow/`)
- [Release Management Guide](workflow/release-management.md) — SemVer & Cloudflare deployment pipeline
- [Coding Standards & Style Guide](workflow/coding-standards.md) — TypeScript 5.7, React 19 & Tailwind v4
- [ECC & OpenSpec Agent Workflow](workflow/ecc-openspec-workflow.md) — AI agent coordination guidelines

### 6. QA & Testing (`docs/testing/` & `docs/development/`)
- [Testing Guide](development/testing-guide.md) — Jest & Playwright conventions & targets
- [Mocking Specs](testing/mocking-specs.md) — Prisma, Sanity, Resend & Telegram mock patterns
- [Cloudflare Deployment](development/cloudflare-deployment.md) — Custom domains, env vars & Wrangler deploy workflows
- [Sanity CMS Guide](development/sanity-cms-guide.md) — GROQ queries, cache tags, & ISR webhooks
- [Google Search Console Setup](development/gsc-setup.md) — Search Console verification & sitemap submission

### 7. Product Requirements & Business Context (`docs/prd/`)
- [PRD v3.1](prd/prd-v3.md) — Canonical technical PRD
- [PRD Executive Edition](prd/prd-c-level-segment-focus.md) — Executive companion to PRD v3.1

### 8. Information Architecture (`docs/ia/`)
- [IA Index](ia/index.md) — Entry point for Information Architecture docs
- [Strategy & Navigation](ia/strategy-navigation.md) — Navigation systems, header & footer specs
- [Sitemaps](ia/sitemaps.md) — Hub, Spoke, and Dashboard sitemaps
- [User Flows](ia/user-flows.md) — B2G/B2B core user flows & fallback behavior

### 9. Code Terrain Maps (`docs/codemaps/`)
- [Architecture Codemap](codemaps/architecture.md) — Route structure & middleware execution chain
- [Backend Codemap](codemaps/backend.md) — API routes, auth layer & notification services
- [Frontend Codemap](codemaps/frontend.md) — Page tree, component hierarchy & forms
- [Data Codemap](codemaps/data.md) — Sanity schemas, Prisma models & validation schemas
- [Dependencies Codemap](codemaps/dependencies.md) — Package inventory by architectural concern

---

## 📜 Legal & Change Management
- [Changelog](../CHANGELOG.md) — Version history & Semantic Versioning log
- [License](../LICENSE) — Software licensing declaration
