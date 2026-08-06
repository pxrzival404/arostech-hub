# Architecture Codemap

<!-- Generated: 2026-07-22 | Files scanned: 90+ | Token estimate: ~750 -->

## Project Type
**Single App** — Next.js 16.2.6 App Router, multi-tenant subdomain routing via Edge Middleware

## System Topology

```
┌──────────────────────────────────────────────────────────────┐
│                       Cloudflare Edge                        │
│  Hub: dayaberkah.id | Spokes: pju/solar/etc | Dashboard      │
└──────────────────────────────────────────────────────────────┘
                               │
                               ↓
┌──────────────────────────────────────────────────────────────┐
│              Next.js 16.2.6 App Router (Edge Middleware)     │
│  src/middleware.ts → cleanHostname() → domain routing        │
│  Route Groups: (hub), (spokes)   Flat routes: dashboard/     │
└──────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ↓             ↓             ↓
┌──────────────────────┐ ┌─────────┐ ┌─────────────────────────┐
│  Sanity.io CMS       │ │ Prisma  │ │   Notifications Layer   │
│  @sanity/client ^7   │ │  Client │ │  Resend | Telegram Bot  │
│  next-sanity ^12     │ └────┬────┘ │  WhatsApp Fallback URL  │
│  GROQ queries        │      │      └─────────────────────────┘
│  ISR + cache tags    │      ↓
└──────────────────────┘ ┌─────────┐
                         │  Neon   │
                         │Postgres │
                         └─────────┘
```

## Route Structure

| Route | Type | Domain | Notes |
|-------|------|---------|-------|
| `(hub)/` | Route Group | dayaberkah.id | Hub homepage + sub-pages |
| `(hub)/about` | Sub-page | dayaberkah.id | |
| `(hub)/articles` | Sub-page | dayaberkah.id | + `[slug]` |
| `(hub)/certifications` | Sub-page | dayaberkah.id | |
| `(hub)/contact` | Sub-page | dayaberkah.id | |
| `(hub)/faq` | Sub-page | dayaberkah.id | |
| `(hub)/portfolio` | Sub-page | dayaberkah.id | |
| `(hub)/products` | Sub-page | dayaberkah.id | |
| `chat/` | Flat route | dayaberkah.id | Agent chat interface (21st SDK) |
| `dashboard/` | Flat route | dashboard.dayaberkah.id | Rewritten by middleware |
| `(spokes)/pju/` | Route Group | pju.dayaberkah.id | |
| `(spokes)/[spoke]/` | Route Group | *.dayaberkah.id | Dynamic spokes |
| `api/revalidate/` | API route | any | Sanity webhook ISR |
| `api/rfq/` | API route | any | POST ingest multi-product RFQ / GET healthcheck |
| `api/auth/[...nextauth]` | API route | any | NextAuth.js v5 route handler (GET/POST) |
| `api/auth/forgot-password` | API route | any | Password reset request initiation |
| `api/auth/reset-password` | API route | any | Password reset completion |
| `api/admin/redirects` | API route | any | Admin redirect map CRUD + hit tracking |
| `api/redirects/lookup` | API route | any | Lightweight redirect lookup (middleware loopback) |
| `api/an-token` | API route | any | 21st SDK agent chat token handler |
| `api/cron/notifications` | API route | any | Notification queue processor (cron endpoint) |

## Middleware Routing Logic

```
Request → src/middleware.ts
  cleanHostname(host)
  ├── isHubDomain()     → (hub) route group (transparent)
  ├── isDashboardDomain() → rewrite /dashboard/*
  ├── isSpokeDomain()   → rewrite /[spoke]/*
  └── unknown domain    → rewrite /404
```

## Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/middleware.ts` | Edge subdomain routing | 114 |
| `src/lib/middleware/config.ts` | Domain helpers (cleanHostname, isHubDomain, etc.) | 110 |
| `src/lib/config/env.ts` | Zod env validation (Sanity, Middleware, DB, Auth, Notifications) | 294 |
| `src/app/(hub)/page.tsx` | Hub homepage | ~95 |
| `src/app/dashboard/layout.tsx` | Dashboard shell | ~30 |
| `src/lib/api/sanity/client.ts` | Sanity client + CACHE_TAGS + ISR | 88 |
| `src/lib/store/rfq-cart-store.ts` | Zustand RFQ cart persist store | 143 |
| `src/hooks/use-rfq-cart.ts` | Zustand hydration hooks & selectors | 57 |
| `src/app/api/rfq/route.ts` | REST API for B2B/B2G RFQ ingestion | 173 |
| `prisma/schema.prisma` | Database schema config for Prisma ORM | 162 |
| `src/lib/db/prisma.ts` | Prisma Client singleton client | 12 |
| `src/lib/auth/auth.config.ts` | NextAuth.js v5 core setup and callbacks | 147 |
| `src/lib/auth/auth-guard.ts` | Route protection and database access verification | 75 |
| `src/app/api/auth/[...nextauth]/route.ts` | API handlers route mapping for NextAuth | 3 |
| `src/lib/api/notifications/resend.ts` | Email quotation ACK and sales alert service | 84 |
| `src/lib/api/notifications/telegram.ts` | Telegram push alerts for RFQ submissions and failures | 77 |
| `src/lib/api/notifications/whatsapp.ts` | Prefilled client WhatsApp fallback redirect URL helper | 53 |

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| 1 | **Active** | UI components, routing, Sanity CMS, articles, RFQ schemas |
| 2 | **Active** | Neon Postgres database, Auth.js v5 authentication, notifications, RFQ ingestion |
| 3 | **Active** | Cloudflare Pages hosting, GA4 tracking, 301 redirect engine, agent chat integration |