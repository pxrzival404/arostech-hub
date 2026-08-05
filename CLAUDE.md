# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DBSN Centralized Digital Ecosystem** — A Next.js 16.2.6 (React 19) hub-and-spoke platform consolidating three legacy WordPress domains into a single codebase with unified design system, CMS, transactional database, and authenticated client tracking portal.

---

## High-Level Architecture

### System Topology

One Next.js codebase serves five hostnames. Edge middleware resolves the subdomain before routing to one of three route groups:

| Hostname | Route Group | Purpose |
|----------|-------------|---------|
| `dayaberkah.id` | `(hub)` | Corporate trust site |
| `pju.dayaberkah.id` | `(spokes)` | Penerangan Jalan Umum (street lighting) |
| `solarcell.dayaberkah.id` | `(spokes)` | Solar cell systems |
| `alatpetir.dayaberkah.id` | `(spokes)` | Lightning protection |
| `baterai.dayaberkah.id` | `(spokes)` | Industrial battery systems |
| `dashboard.dayaberkah.id` | `(dashboard)` | Authenticated client tracking portal |

Spokes share route structure and UI components — differentiation is content-driven via Sanity CMS, not via code forks.

### Tech Stack

| Layer | Technology | Purpose |
|--------|-----------|---------|
| Runtime | Next.js 16.2.6, React 19.2.4 | Application framework, App Router, server components |
| Package Manager | pnpm | Dependency management |
| Content CMS | Sanity.io | Headless CMS, product/portfolio data, content federation |
| Transactional DB | Neon Postgres via Prisma 6.19.3 | Leads, users, tracking data, redirect mappings |
| Authentication | Auth.js v5 (5.0.0-beta.31) | Session management, RBAC (`admin`, `viewer`, `client`) |
| UI System | Tailwind CSS v4 + Radix UI | Shared design tokens, accessible components (shadcn/ui patterns) |
| Agent Chat | @21st-sdk/nextjs, @ai-sdk/react | Intelligent agent chat interface integration |
| State Management | Zustand 5 (persist middleware) | Client-side state persistence (RFQ cart) |
| Monitoring | Sentry 10.56.0 | Error tracking |
| Hosting | Cloudflare Pages (Unified) | Staging & Production on Cloudflare Pages (see [ADR-0001](file:///d:/CLAUDE-PROJECT/website/docs/adr/0001-migrate-fully-to-cloudflare-pages.md), [ADR-0002](file:///d:/CLAUDE-PROJECT/website/docs/adr/0002-explicit-wrangler-pages-deploy-for-pnpm-monorepo.md)) |
| Notifications | Resend (email) + Telegram Bot API | RFQ alerts, failure notifications |
| Analytics | GA4 + GSC + Cloudflare Analytics | Unified telemetry |

---

## Development Workflow

### Build & Development
```bash
# Install dependencies
pnpm install

# Development server (subdomain routing via lvh.me:3000)
pnpm dev

# Production build — runs prisma generate first
pnpm build

# Bypass prisma generate (iterating on UI only — avoids Windows EPERM on the prisma DLL)
npx next build

# Compile Next.js edge build for Cloudflare Pages (requires bash in PATH on Windows, e.g. via Git Bash or WSL)
pnpm pages:build

# Local preview of Cloudflare Pages build
pnpm pages:preview

# Deploy to Cloudflare Pages production (see ADR-0002)
pnpm pages:deploy
```

> **Windows Local Development Note (`pnpm pages:build`):** `@cloudflare/next-on-pages` CLI v1.13.16 spawns `bash` internally during compilation. On native Windows PowerShell/CMD without `bash` in `PATH`, running `pnpm pages:build` will fail with `Error: spawn bash ENOENT`. To build locally on Windows, execute the command in Git Bash, WSL, or ensure `bash.exe` (e.g. from Git for Windows) is in your system `PATH`. Note that Cloudflare Pages CI runs natively on Linux runners where `bash` is present by default.

### Database & Seed Scripts
```bash
pnpm db:seed:users                       # Seed auth users (admin/viewer/client)
pnpm exec tsx prisma/seed-redirects.ts   # Seed 301 redirect map
pnpm exec tsx scripts/gsc-submit-sitemap.ts  # Submit sitemap (requires GSC_SERVICE_ACCOUNT_JSON with Owner permission)
```

### Testing
```bash
# Unit/Integration tests (Jest + Testing Library)
pnpm test              # Run all tests
pnpm test:watch        # Interactive watch mode
pnpm test:coverage     # Generate coverage report (target: 80%+)
pnpm test src/__tests__/api/rfq/route.test.ts  # Run a single test file
pnpm test -t "rejects invalid input"           # Run tests matching a name pattern

# E2E tests (Playwright)
pnpm test:e2e                              # Run all E2E tests
pnpm exec playwright test tests/e2e/subdomain-routing.spec.ts  # Single spec
```

### Linting & Code Quality

`pnpm lint` runs ESLint against a **curated list of files** (see `package.json` `lint` script), not the whole project. The list covers security-sensitive code (auth config, middleware, rate limiter, password reset) plus the redirect engine and chat route. To lint new files, either add them to the script in `package.json` or invoke `npx eslint <path>` directly.

---

## Component Structure

```
src/
├── app/
│   ├── (hub)/         # Hub root pages (dayaberkah.id)
│   ├── (spokes)/       # Product spoke pages (*.dayaberkah.id)
│   └── (dashboard)/    # Client tracking portal (dashboard.dayaberkah.id)
├── components/
│   ├── ui/            # Radix UI primitives (Button, Dialog, etc.)
│   ├── forms/          # RFQ forms (B2G, B2B variants with multi-product cart)
│   ├── sections/      # Landing page sections (AboutSection, ProductsSection, ...)
│   │   └── _components/  # Section-local primitives (inline SVG illustrations, featured cards)
│   └── shared/        # Reusable patterns, utilities (ScrollReveal, Tooltip)
├── lib/
│   ├── api/            # API clients (Sanity, auth, notifications)
│   ├── db/             # Prisma ORM clients
│   ├── config/          # Environment variables, feature flags
│   ├── schema/         # Zod validation schemas (rfq-schemas.ts)
│   ├── store/          # Zustand stores (rfq-cart-store.ts)
│   └── middleware/     # Redirect engine, middleware utilities
└── styles/
    └── globals.css    # Shared Tailwind config (root-level, no local overrides)
```

---

## Deployment Configuration

All environments (Staging & Production) are hosted on Cloudflare Pages to maintain consistency and bypass Vercel Free tier limitations (see [ADR-0001](docs/adr/0001-migrate-fully-to-cloudflare-pages.md)).

### Staging / Preview
- **Host**: Cloudflare Pages branch deployments (e.g. `<branch>.dbsn-website.pages.dev`)
- **Commands**: `pnpm pages:build` followed by automatic deployment on commit, or manual preview: `pnpm pages:preview`

### Production
- **Host**: Cloudflare Pages production (`dayaberkah.id`)
- **Commands**: `pnpm pages:build` and `pnpm pages:deploy`
## Cloudflare Pages Deployment

All environments (Staging & Production) are hosted on Cloudflare Pages to maintain consistency and bypass Vercel Free tier limitations (see [ADR-0001](file:///d:/CLAUDE-PROJECT/website/docs/adr/0001-migrate-fully-to-cloudflare-pages.md), [ADR-0002](file:///d:/CLAUDE-PROJECT/website/docs/adr/0002-explicit-wrangler-pages-deploy-for-pnpm-monorepo.md)).

### Environments
- **Production**: `dayaberkah.id` — deploy via `pnpm pages:build && pnpm pages:deploy`
- **Staging / Preview**: `<branch>.dayaberkah.pages.dev` — Cloudflare Pages branch deployments
- **Local preview**: `pnpm pages:preview` (after `pnpm pages:build`)

### Configuration
- **Wrangler Config**: defines project (`dayaberkah`), compatibility flags (`nodejs_compat`), and environment variables.
- **Edge Compilation**: `@cloudflare/next-on-pages` writes to `.vercel/output/static`.
- **Edge Runtime**: All dynamic routes, API endpoints, and root layouts must export `const runtime = 'edge'`.

### Pages Hostname Parsing
- **Parser**: `src/lib/utils/pages-host.ts` recognizes `*.pages.dev` URLs.
- **Patterns**: `dayaberkah.pages.dev` (hub), `<branch>.dayaberkah.pages.dev` (branch preview), `<spoke>.dayaberkah.pages.dev` (spoke prod), `<spoke>.<branch>.dayaberkah.pages.dev` (spoke preview).
- **Disambiguation**: Leading label treated as spoke/dashboard if it matches whitelist (`pju`, `solarcell`, `alatpetir`, `baterai`, `dashboard`); otherwise treated as branch name.
- **Middleware integration**: `src/middleware.ts` uses `parseCloudflarePagesHost()` to extract subdomain from preview URLs.

### Routing Constraints
- **Hub subdomain**: Return `NextResponse.next()` with custom headers (`x-middleware-subdomain: hub`, `x-middleware-matched-route`) instead of rewriting to `/(hub)`. `@cloudflare/next-on-pages` compiles away route groups in production; rewriting to `/(hub)/path` triggers 404.
- **Negative testing**: Block spoke sub-pages on Hub domain (e.g., `dayaberkah.id/pju`) via `new NextResponse(null, { status: 404 })` in middleware.

### Edge Function Constraints
- **CRITICAL — no Prisma in middleware**: Do NOT dynamically import `prisma` inside Edge middleware (`src/middleware.ts`). Database binaries exceed the Cloudflare Workers 1 MB compressed limit, causing deployment failures. Offload DB lookups to `/api/redirects/lookup` and use lightweight loopback `fetch()` in middleware.
- **Dev server deadlock prevention**: Single-threaded dev servers deadlock on loopback `fetch()` in middleware. Wrap with `AbortController` timeout (2000ms) for fast failure.

### PNPM Monorepo Deployment (ADR-0002)
- **Explicit wrangler deploy**: Use `pnpm pages:build && pnpm pages:deploy` instead of Git-integrated Cloudflare Pages build. Framework auto-detection conflicts with PNPM workspaces containing multiple Next.js packages.
- **Windows EPERM workaround**: `pnpm build` runs `pregenerate` to clear `node_modules/.prisma` before `prisma generate` (file locking on Windows). Use `npx next build` to bypass when iterating on UI only.

---

## Architecture Key Patterns

### Hub-and-Spoke Routing
- Subdomain resolution in `src/middleware.ts` before Next.js routing.
- Route groups: `(hub)`, `(spokes)`, `(dashboard)`.
- Spokes share route structure and UI components.
- Dashboard uses separate route group with authentication guards.

### Multi-Segment RFQ & Informational Routing
- Navigation: smooth-scroll on `/` home page, normal transition elsewhere.
- Products catalog (`/products`): aggregates 4 segments (PJUTS, Solar Cell, Lightning Protection, Battery Storage).
- Dynamic subdomain routing via `buildSpokeUrl` in `src/lib/utils/url.ts`.
- Portfolios (`/portfolio`) and Articles (`/articles`) use Sanity CMS + `<PortableText />`.
- Certifications grid with Radix-based modal viewer (PDF/Image).

### Content Federation (Sanity)
- All product/portfolio data in Sanity CMS.
- Sanity client (separate from Prisma) queries CMS for spoke pages. Prisma handles only transactional database operations (leads, users, redirects).
- Webhook-based cache invalidation on content changes.

### Multi-Tenant Data Access
- Row-level security via `users.tracking_scope_ids` (JSON array).
- `role=client` users see only rows where their ID is in `tracking_scope_ids`.
- `role=admin` / `role=viewer` have full access.

### RFQ Cart System
- **Store**: `src/lib/store/rfq-cart-store.ts` (Zustand with persist, key: `dbsn-rfq-cart`).
- **Mutators**: `addItem`, `removeItem`, `updateQuantity`, `updateItemNotes`, `clearCart`.
- **Selectors**: `selectItemCount`, `selectTotalQuantity`, `selectHasItem`, `selectCartItems`.
- **Hydration Guard**: `src/hooks/use-rfq-cart.ts` exports `useRfqCartHydrated()` to prevent SSR mismatches.
- **Forms**: `src/components/forms/RfqB2BForm.tsx`, `RfqB2GForm.tsx` use `react-hook-form` + `useFieldArray`.

### RFQ Submission Flow
- **Endpoint**: POST `/api/rfq` validates against `rfqB2BSchema` / `rfqB2GSchema` in `src/lib/schema/rfq-schemas.ts`.
- **Success**: Create lead in Postgres, enqueue notifications (`EMAIL_ACK`, `EMAIL_INTERNAL`, `TELEGRAM`).
- **Failure**: Return WhatsApp fallback URL + alert devs via Telegram.

### Authentication Flow
- **Config**: `src/lib/auth/auth.config.ts` (credentials provider, JWT session storage).
- **Middleware**: Matches sessions via cookie tokens, blocks unauthorized access.
- **Server Guards**: `src/lib/auth/auth-guard.ts` exports `getServerSession()`, `requireAuth()`, `requireDashboardAccess()`.
- **Route Handler**: `src/app/api/auth/[...nextauth]/route.ts`.

### 301 Redirect Engine
- **Engine**: `src/lib/middleware/redirect-engine.ts` exports `lookupRedirect(pathname, spoke)`.
- **Model**: `RedirectMap` in Prisma schema (fields: `legacyUrl`, `targetUrl`, `spoke`, `hitCount`).
- **Caching**: LRU cache (500 entries, 5-minute TTL) with negative caching.
- **Async Tracking**: Increments `hitCount` without blocking response.
- **Admin API**: `/api/admin/redirects` secured with `requireAuth('ADMIN')`.

### Google Search Console (GSC)
- **Verification**: DNS TXT record for domain property; dynamic `public/google{code}.html` for URL-prefix.
- **Sitemap Submit**: `scripts/gsc-submit-sitemap.ts` uses Node.js `crypto` for OAuth2 JWT assertions (runs in Node.js context, not Edge).
- **Run**: `pnpm exec tsx scripts/gsc-submit-sitemap.ts`.

### Motion & Animation
- **Wrapper**: `src/components/shared/ScrollReveal.tsx` — Framer Motion fade-up/scale-in on viewport entry (once: true). Use this for all scroll-triggered reveals rather than rolling bespoke `useInView` logic.
- **Reduced-motion discipline**: every animation must respect `prefers-reduced-motion`. Two accepted patterns:
  - Inline `style={{ animation: reduceMotion ? undefined : "..." }}` with `useReducedMotion()` from `framer-motion` (see `CTABanner.tsx` particles).
  - Tailwind `motion-safe:` prefix for CSS-class-based animations (e.g., `motion-safe:float-animation`).
- **Global gate**: `globals.css` already disables `animation/transition` on `.float-animation`, `.float-animation-delay`, `.pulse-dot`, `.shimmer`, `.bounce-down`, `.scroll-hint-line`, `.hero-gradient` under `@media (prefers-reduced-motion: reduce)`. Use these classes freely.
- **Scroll-linked progress**: for timeline/progress bars tied to scroll position, use `useScroll({ target: ref, offset: [...] })` + `useTransform(scrollYProgress, [0,1], [from, to])`. Always gate with `useReducedMotion()` and fall back to a static full-state render (see `ProcessSection.tsx` desktop timeline).
- **JSX member-expression caveat**: TypeScript/JSX rejects `<arr[0].Component />`. Alias to a local identifier first: `const Featured = arr[0];` then `<Featured.Component />`.

---

## Environment Variables

All variables below are validated at runtime in `src/lib/config/env.ts` unless marked otherwise.

| Variable | Description | Sensitivity |
|---------|-----------|----------|
| DATABASE_URL | Neon Postgres connection string | High |
| NEXTAUTH_SECRET | Auth.js v5 JWT signing secret (min 32 chars) | High |
| NEXTAUTH_URL | Auth.js v5 provider URL | High |
| SANITY_PROJECT_ID | Sanity CMS project ID (lowercase alphanumeric) | High |
| SANITY_DATASET | Sanity CMS dataset name (default: `production`) | High |
| SANITY_API_VERSION | Sanity CMS API version (`vYYYY-MM-DD`) | High |
| SANITY_API_READ_TOKEN | Sanity CMS read token (starts with `sk`) | High |
| SANITY_API_WRITE_TOKEN | Sanity CMS write token (optional, starts with `sk`) | High |
| SANITY_WEBHOOK_SECRET | Sanity CMS webhook secret (production) | High |
| NEXT_PUBLIC_ROOT_DOMAIN | Root domain for routing (`dayaberkah.id`) | Medium |
| NEXT_PUBLIC_SITE_URL | Full site URL (`https://dayaberkah.id`) | Medium |
| RESEND_API_KEY | Resend email API key | High |
| RESEND_FROM_EMAIL | Resend from-email address | High |
| TELEGRAM_BOT_TOKEN | Telegram bot API token | High |
| TELEGRAM_CHAT_ID | Telegram chat ID for notifications | High |
| WHATSAPP_SALES_NUMBER | WhatsApp sales number for RFQ fallback | High |
| API_KEY_21ST | 21st SDK authentication token (starts with `21st_`) | High |
| GA_TRACKING_ID | Google Analytics 4 tracking ID — *doc-only, not in env.ts schema* | Medium |
| GSC_SERVICE_ACCOUNT_JSON | Google Search Console service account JSON — *doc-only, not in env.ts schema* | Medium |
| NODE_ENV | Environment (development/staging/production) — *referenced in env.ts but no explicit schema* | Medium |

---

## Documentation Index

Detailed guides in `/docs`:
- `docs/ONBOARDING.md` — Architectural deep-dive and first-day guide
- `docs/core/architecture/architecture.md` — System architecture and domain mappings
- `docs/core/architecture/middleware-routing.md` — Edge routing and subdomain resolution
- `docs/core/development/local-setup.md` — Local development environment setup
- `docs/core/development/testing-guide.md` — Jest and Playwright testing patterns
- `docs/core/development/sanity-cms-guide.md` — Sanity CMS integration and GROQ queries
- `docs/audits/` — Structured UX/security/code audit reports (e.g., `landing-page-ux-audit-2026-07-09.md`)
- `docs/CODEMAPS/` — High-level code terrain maps for navigating the codebase

## Architecture Decision Records (ADRs)

Formal records in `/docs/adr/`. Read before changing infrastructure or deployment config:

- **[ADR-0001](file:///d:/CLAUDE-PROJECT/website/docs/adr/0001-migrate-fully-to-cloudflare-pages.md)** — Migrate fully to Cloudflare Pages, deprecate Vercel (2026-07-20). Unifies hosting, CDN, DNS, SSL under one provider; resolves Vercel free tier concurrency limits.
- **[ADR-0002](file:///d:/CLAUDE-PROJECT/website/docs/adr/0002-explicit-wrangler-pages-deploy-for-pnpm-monorepo.md)** — Use explicit `wrangler pages deploy` for PNPM monorepo (2026-07-21). Fixes CI failures from framework auto-detection conflicts in PNPM workspaces containing multiple Next.js packages.

When proposing infrastructure changes, write an ADR first and reference it in commit messages.

## ECC Rules (`.claude/rules/ecc/`)

Project-local rules automatically loaded by Claude Code when working in this repo. They override defaults for:
- **common/**: security, patterns (repository/API envelope), development workflow, git workflow (conventional commits, attribution disabled globally), testing (80%+ coverage, AAA pattern)
- **typescript/**: coding style (explicit public types, `unknown` over `any`, Zod validation), patterns (custom hooks, repository), security (env vars), testing (Playwright E2E)
- **web/**: coding style (CSS custom properties, animation-friendly properties, semantic HTML), patterns (compound components, state management separation, URL-as-state), security (CSP, XSS, CSRF, HTTPS headers), performance (Core Web Vitals targets, bundle budgets), testing (visual regression priority)

These rules are **authoritative** — when in conflict with generic guidance, the ECC rule wins.

---

## Integration Patterns

When integrating new features or third-party services:

1. **CMS Integration**: Use Sanity client with proper GROQ queries. Sanity and Prisma are separate — Sanity for content, Prisma for transactional data.
2. **API Integration**: Implement error handling and retry logic. Envelope responses per `common/patterns.md` (`{ success, data, error, meta }`).
3. **Analytics (GA4)**: Use standardized event taxonomy:
   - `RFQ_SUBMIT` — Successful RFQ submission (`segment`, `spoke`, `item_count`)
   - `RFQ_FALLBACK_WHATSAPP` — WhatsApp fallback after failed RFQ (`spoke`)
   - `PRODUCT_VIEW` — Product page viewed (`product_name`, `spoke`)
   - `FILE_DOWNLOAD` — Datasheet download (`file_name`, `file_type`)
   - `CONTACT_CLICK` — Contact/WhatsApp CTA clicked (`contact_type`, `location`)
   - `SPOKE_NAVIGATION` — Hub ↔ Spoke navigation (`spoke`, `source`)
4. **Notification Integration**: Use `NotificationQueue` in `src/lib/api/notifications/queue.ts` for resilient delivery with exponential backoff.
5. **Authentication**: Wire NextAuth handlers with proper RBAC enforcement (`admin`, `viewer`, `client`).
6. **Monitoring**: Integrate Sentry for error tracking.

---

## Notes

- **Hub-and-Spoke**: All subdomains run from a single Next.js codebase.
- **No Code Forks**: Differentiation is content-driven via Sanity CMS and routing.
- **Shared Design System**: Tailwind config at repo root is the single source of truth.
- **Mobile-First**: All UI tested on 375px minimum viewport.
- **Performance Target**: PSI mobile score 90+ on all key pages is a launch gate requirement.
- **File Naming**: `kebab-case` for files/folders, PascalCase for components.
- **TDD Approach**: 80%+ test coverage goal.
- **Error Handling**: `try/catch` with descriptive errors; Zod for input validation.

---

*Generated: 2026-06-11 · Updated: 2026-07-22*
*Status: Production Ready — Phase 3 features (Notification Queue, Cloudflare Pages Deployment per ADR-0001/ADR-0002, 301 Redirect Engine, SEO Migration, GA4 event tracking, GSC verification, Sentry monitoring) completed and fully documented*
