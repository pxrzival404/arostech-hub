---
id: STRAT-COMPAT-001
title: System Runtime & Platform Compatibility Matrix
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_strategy"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L120"
  vision: "file:///d:/dev/arostech-hub/docs/strategy/vision.md#L1-L60"
---

# System Runtime & Platform Compatibility Matrix

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Cascade`  
> **Authoritative Baseline Reference**: This document defines the target runtime compatibility matrix and platform bindings for PT Daya Berkah Sentosa Nusantara (`arostech-hub`), fully synchronized with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L120)).

---

## ## OpenSpec Delta

- **ADDED**: Strict compatibility specifications for Next.js 16.2.6, React 19, Tailwind CSS v4, Auth.js v5, and Prisma 6 Neon Proxy adapter.
- **REMOVED**: Legacy Supabase runtime dependencies, Redis cache layer bindings, and legacy 301 redirect map runtime handlers.

---

## Section I: Supported Runtimes & Frameworks

The system SHALL enforce strict runtime version constraints across development, CI/CD, and production environments:

| Layer | Component | Standard Version | Supported Range | Compatibility Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `v20.x` (LTS) | `>= 20.0.0` | Required for local build toolchain (`pnpm dev`). |
| **Package Manager** | pnpm | `v9.x` | `>= 9.0.0` | Enforced package manager; strict workspace resolution. |
| **Framework** | Next.js | `16.2.6` | `16.x` | App Router + Edge Runtime (`@cloudflare/next-on-pages`). |
| **UI Library** | React | `19.x` | `19.x` | React Server Components & Server Actions. |
| **Language** | TypeScript | `5.7.3` | `>= 5.7.0` | Strict mode enabled (`tsconfig.json`). |
| **Styling** | Tailwind CSS | `v4.x` | `v4.x` | PostCSS + design token CSS utilities. |

---

## Section II: Platform & Edge Bindings

The application architecture MUST compile and execute against the following Cloudflare Edge and database bindings:

| Service | Driver / SDK | Version | Target Environment |
| :--- | :--- | :--- | :--- |
| **Edge Hosting** | Cloudflare Pages | `@cloudflare/next-on-pages 1.13.x` | Edge Runtime (`CF_PAGES=1`). Requires `bash` in Windows PATH. |
| **Database** | Neon Serverless Postgres | `@neondatabase/serverless 1.1.x` | Serverless pooled connection with WebSocket fallback. |
| **ORM** | Prisma ORM | `@prisma/client 6.19.x` | Prisma Neon Adapter (`@prisma/adapter-neon 7.8.x`). |
| **CMS** | Sanity CMS | `next-sanity 12.4.x` | GROQ query client, Stega visual editing & ISR handler. |
| **Testing** | Jest + Playwright | `jest 30.x`, `playwright 1.60.x` | Unit/integration testing & E2E browser testing. |

---

## Section III: Browser Support Matrix

The user interface SHALL deliver fully responsive layouts and accessible interactive components across modern desktop and mobile browsers:

| Browser | Supported Versions | Notes |
| :--- | :--- | :--- |
| **Google Chrome** | Latest 2 major versions | Full PWA & Core Web Vitals optimization. |
| **Mozilla Firefox** | Latest 2 major versions | Standard modern JS features. |
| **Apple Safari** | iOS 16+, macOS Safari 16+ | WebKit responsive & touch touchpoint optimization. |
| **Microsoft Edge** | Latest 2 major versions | Chromium engine feature set. |

---

## Section IV: Declarative Runtime Schema

```typescript
import { z } from 'zod';

export const EnvironmentRuntimeSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().default('dayaberkah.id'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  DATABASE_URL: z.string().startsWith('postgres://'),
  SANITY_PROJECT_ID: z.string().min(1),
  SANITY_DATASET: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
});

export type EnvironmentRuntime = z.infer<typeof EnvironmentRuntimeSchema>;
```

---

## Section V: OpenSpec Behavioral Contracts

### Requirement: REQ-STRAT-COMPAT-001-RUNTIME-STACK
The system SHALL execute only on approved runtime versions (Node.js 20+, Next.js 16, React 19, Prisma 6 Neon Proxy) and MUST fail fast if execution environment constraints are violated.

#### Scenario: Runtime Verification
- GIVEN a build or execution trigger in CI or Cloudflare Pages Edge
- WHEN environment startup evaluates node and package dependencies
- THEN the system MUST verify Node.js >= 20.0.0 and Next.js 16.2.6 compatibility
- AND it SHALL prevent startup if unapproved runtime or legacy database drivers are detected.

---

## Section VI: Knowledge Graph Anchoring

- **Graphify Node**: `doc:docs/strategy/compatibility-matrix.md`
- **Community**: `community_strategy`
- **Authoritative Anchor**: [`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L120)
