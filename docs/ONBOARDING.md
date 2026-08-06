# Onboarding Guide: DBSN Centralized Digital Ecosystem

This is a Day-1 checklist. For full architectural detail, defer to [`/CLAUDE.md`](../CLAUDE.md) (authoritative) and the docs linked below — this file intentionally does not restate them.

---

## What This Project Is

A Next.js 16 (React 19) platform consolidating legacy WordPress domains into a single hub-and-spoke architecture, deployed on Cloudflare Pages with Edge Middleware for subdomain routing.

---

## Domain & Routing (Source of Truth)

| Hostname | Route | Purpose |
|---|---|---|
| `dayaberkah.id` | `src/app/(hub)` | Corporate trust center |
| `*.dayaberkah.id` (`pju`, `solarcell`, `alatpetir`, `baterai`) | `src/app/(spokes)` | Product segments |
| `dashboard.dayaberkah.id` | `src/app/dashboard` (flat route) | Client tracking portal |

> Confirm this table against [DNS Cutover Mapping](core/architecture/dns-cutover-mapping.md) if anything here looks stale.

---

## Day-1 Developer Checklist

- [ ] Install `pnpm` and Node.js v20+
- [ ] `pnpm install`
- [ ] Copy `.env.example` → `.env`, fill in Sanity + database credentials (see [Local Setup](core/development/local-setup.md))
- [ ] `pnpm dev` — verify hub loads at `http://lvh.me:3000`
- [ ] Verify at least one spoke loads at `http://pju.lvh.me:3000`
- [ ] Read [System Architecture](core/architecture/architecture.md) — mental model of hub/spoke/dashboard split
- [ ] Read [Middleware & Routing](core/architecture/middleware-routing.md) — Edge routing anti-patterns to avoid
- [ ] Skim [Testing Guide](core/development/testing-guide.md) and run `pnpm test`
- [ ] Read the **ECC Rules** section of [`/CLAUDE.md`](../CLAUDE.md) — these are authoritative and override generic conventions

---

## Key Entry Points

- **Middleware**: `src/middleware.ts` — subdomain routing and redirects
- **Route Groups**: `src/app/(hub)`, `src/app/(spokes)`, `src/app/dashboard`
- **Database Schema**: `prisma/schema.prisma`
- **CMS Client**: `src/lib/api/sanity/client.ts` (see [Sanity CMS Guide](core/development/sanity-cms-guide.md))
- **Environment Config**: `src/lib/config/env.ts`

---

## Directory Map

- `src/app/` → Next.js App Router (grouped by routing role)
- `src/components/` → UI components (`ui/`, `shared/`, `forms/`, `sections/`)
- `src/lib/` → Core logic (`auth/`, `db/`, `middleware/`, `store/`, `utils/`)
- `src/hooks/` → Custom React hooks
- `prisma/` → Database models and migration scripts
- `scripts/` → Utility scripts (GSC, seed data)
- `tests/` → E2E tests (Playwright)
- `src/__tests__/` → Unit and integration tests (Jest)

Full component/route breakdown: [`docs/CODEMAPS/frontend.md`](CODEMAPS/frontend.md) and [`docs/CODEMAPS/backend.md`](CODEMAPS/backend.md).

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

Full command reference, deployment commands, and secrets management: [`/README.md`](../README.md) and [`/CLAUDE.md`](../CLAUDE.md).

---

## Conventions

- **Naming**: kebab-case for files/directories, PascalCase for components
- **Patterns**: Functional components, hooks, Zod for schema validation
- **Error Handling**: `try/catch` in data-fetching and API routes; custom Error Boundaries
- **Git**: Conventional Commits (`feat:`, `fix:`, `chore:`)

---

## Where to Look

| I want to... | Look at... |
|---|---|
| Add a new Spoke | `src/app/(spokes)/` |
| Modify routing logic | `src/middleware.ts` + [Middleware & Routing](core/architecture/middleware-routing.md) |
| Update UI styles | `tailwind.config.ts` or `src/app/globals.css` |
| Add a database model | `prisma/schema.prisma` |
| Update CMS queries | `src/lib/api/sanity/queries.ts` + [Sanity CMS Guide](core/development/sanity-cms-guide.md) |
| Understand deployment | [ADR-0001](adr/0001-migrate-fully-to-cloudflare-pages.md), [ADR-0002](adr/0002-explicit-cloudflare-pages-deploy-command.md), [Cloudflare Deployment Guide](core/development/cloudflare-deployment.md) |
