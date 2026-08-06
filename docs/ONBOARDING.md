# Onboarding Guide: DBSN Centralized Digital Ecosystem

This is a Day-1 checklist. For full architectural detail, defer to [`/AGENTS.md`](../AGENTS.md) and the docs linked below.

---

## What This Project Is

A Next.js 16 (React 19) platform consolidating legacy WordPress domains into a single hub-and-spoke architecture, deployed on Cloudflare Pages with Edge Middleware for subdomain routing.

---

## Domain & Routing (Source of Truth)

| Hostname | Route | Purpose |
|---|---|---|
| `dayaberkah.id` | `src/app/(hub)` | Corporate trust center |
| `*.dayaberkah.id` (`pju`, `solarcell`, `alatpetir`, `baterai`) | `src/app/(spokes)` | Product segments |
| `dashboard.dayaberkah.id` | `src/app/dashboard` | Client tracking portal |

---

## Day-1 Developer Checklist

- [ ] Install `pnpm` and Node.js v20+
- [ ] `pnpm install`
- [ ] Copy `.env.example` → `.env`, fill in Sanity + database credentials (see [Local Setup](development/local-setup.md))
- [ ] `pnpm dev` — verify hub loads at `http://lvh.me:3000`
- [ ] Verify at least one spoke loads at `http://pju.lvh.me:3000`
- [ ] Read [System Architecture](system/architecture.md) — mental model of hub/spoke/dashboard split
- [ ] Read [Middleware & Routing](system/middleware-routing.md) — Edge routing anti-patterns to avoid
- [ ] Skim [Testing Guide](development/testing-guide.md) and run `pnpm test`
- [ ] Review [Contributing Guidelines](../CONTRIBUTING.md) — branching model & commit standards

---

## Minimal Working Examples (MWE)

- 🚀 [Adding a New Product Spoke](mwe/add-new-spoke.md) — Step-by-step guide for creating product spokes
- ⚡ [Adding a Secure API Endpoint](mwe/add-api-endpoint.md) — Step-by-step guide for building API route handlers

---

## Key Entry Points

- **Middleware**: `src/middleware.ts` — subdomain routing and redirects
- **Route Groups**: `src/app/(hub)`, `src/app/(spokes)`, `src/app/dashboard`
- **Database Schema**: `prisma/schema.prisma`
- **CMS Client**: `src/lib/api/sanity/client.ts`
- **Environment Config**: `src/lib/config/env.ts`

---

## Common Commands

```bash
pnpm dev              # Local dev server (lvh.me:3000)
pnpm build            # Production build (runs prisma generate first)
pnpm pages:build      # Cloudflare Pages edge build (requires bash in PATH on Windows)
pnpm test             # Run Jest suite
pnpm test:e2e         # Run Playwright suite
pnpm exec prisma migrate dev   # Database migration
```
