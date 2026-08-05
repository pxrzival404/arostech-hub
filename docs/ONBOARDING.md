# Onboarding Guide: DBSN Centralized Digital Ecosystem

## Overview
A high-performance Next.js 16 (React 19) platform consolidating three legacy WordPress domains into a single hub-and-spoke architecture. It features a unified design system, Sanity CMS integration, and a secure client dashboard, all deployed on Cloudflare Pages using Edge Middleware for subdomain routing.

## Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | 5.x |
| Framework | Next.js | 16.2.6 (App Router) |
| Database | Neon Postgres | - |
| ORM | Prisma | 6.19.3 |
| CMS | Sanity.io | - |
| Auth | Auth.js (NextAuth) | 5.0.0-beta.31 |
| Styling | Tailwind CSS | 4.x |
| Testing | Jest + Testing Library + Playwright | - |
| Monitoring | Sentry | 10.56.0 |

## Architecture
- **Hub-and-Spoke**: Single codebase handling multiple domains/subdomains via `middleware.ts`.
- **Edge Runtime**: Optimized for Cloudflare Pages/Workers.
- **Subdomain Routing**:
  - `sentradaya.com` -> `src/app/(hub)`
  - `*.sentradaya.com` -> `src/app/(spokes)`
  - `dashboard.sentradaya.com` -> `src/app/dashboard`

## Key Entry Points
- **Middleware**: `src/middleware.ts` — Handles subdomain routing and redirects.
- **Route Groups**:
  - `src/app/(hub)`: Corporate hub.
  - `src/app/(spokes)`: Product segments (PJU, Solar Cell, etc.).
  - `src/app/dashboard`: Client portal.
- **Database Schema**: `prisma/schema.prisma`.
- **CMS Client**: `src/lib/api/sanity.ts` (implied from package.json).
- **Environment Config**: `src/lib/config/env.ts`.

## Directory Map
- `src/app/` → Next.js App Router (Grouped by routing role).
- `src/components/` → UI components (ui, shared, forms).
- `src/lib/` → Core logic (auth, db, middleware, store, utils).
- `src/hooks/` → Custom React hooks.
- `prisma/` → Database models and migration scripts.
- `scripts/` → Utility scripts (GSC, adaptations).
- `tests/` → E2E tests (Playwright).
- `src/__tests__/` → Unit and integration tests (Jest).

## Request Lifecycle
1. **Entry**: Request hits Cloudflare Edge.
2. **Middleware**: `src/middleware.ts` identifies the subdomain (Hub, Dashboard, or Spoke).
3. **Rewrite**: Middleware rewrites the internal URL to the matching Route Group.
4. **Auth**: `Auth.js` guards restricted routes (Dashboard).
5. **Rendering**: Server Components fetch data from Sanity CMS or Neon Postgres via Prisma.
6. **Response**: Rendered HTML/JSON returned to the user.

## Conventions
- **Naming**: kebab-case for files and directories. PascalCase for Components.
- **Patterns**: Functional components, Hooks, and Zod for schema validation.
- **Error Handling**: `try/catch` blocks in data-fetching and API routes; custom Error Boundaries.
- **Git**: Conventional Commits (`feat:`, `fix:`, `chore:`).

## Common Tasks
- **Run Dev**: `pnpm dev`
- **Build**: `pnpm build`
- **Build for Cloudflare**: `pnpm pages:build`
- **Run Tests**: `pnpm test`
- **Run E2E**: `pnpm test:e2e`
- **Database Migration**: `pnpm exec prisma migrate dev`

## Where to Look
| I want to... | Look at... |
|--------------|-----------|
| Add a new Spoke | `src/app/(spokes)/` |
| Modify routing logic | `src/middleware.ts` |
| Update UI styles | `tailwind.config.ts` or `src/app/globals.css` |
| Add a database model | `prisma/schema.prisma` |
| Update CMS queries | `src/lib/api/` |
