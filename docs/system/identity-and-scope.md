# System Identity, Vision, & Compatibility Matrix

## 1. System Identity & Core Value

The **DBSN Centralized Digital Ecosystem** (`arostech-hub`) is a high-performance web platform engineered to consolidate three legacy WordPress domains into a single, unified Next.js 16 hub-and-spoke architecture.

### Problem Statement
Legacy WordPress setups suffered from fragmented content management, slow page load speeds, high security risk surfaces, and redundant hosting overhead across corporate and product domain segments.

### Core Value Proposition
- **Unified Infrastructure**: Single Next.js codebase serving Hub (`dayaberkah.id`), Product Spokes (`pju`, `solarcell`, `alatpetir`, `baterai`), and Client Dashboard (`dashboard`).
- **Edge Performance**: 100% Edge hosting on Cloudflare Pages via `@cloudflare/next-on-pages`.
- **Resilient RFQ**: Automated failover quote submission engine guaranteeing zero lost customer leads.

---

## 2. Design Philosophy

- **Convention over Configuration**: Standardized App Router route groups (`(hub)`, `(spokes)`) and clear naming conventions.
- **Edge-First Architecture**: Dynamic subdomain resolution at the Edge via Next.js Middleware before page execution.
- **Strict Type Safety**: End-to-end TypeScript 5.7+ with Zod schema validations for forms, API routes, and database models.
- **Test-Driven Discipline**: Comprehensive Jest unit tests and Playwright E2E integration test suites.

---

## 3. Runtime Compatibility Matrix

| Technology Layer | Standard Version | Supported Range | Compatibility Notes |
| :--- | :--- | :--- | :--- |
| **Node.js Runtime** | `v20.x` | Node.js `>= 20.0.0` | Recommended LTS for local `pnpm dev` build toolchain. |
| **Package Manager** | `pnpm v9.x` | `pnpm >= 9.0.0` | Mandatory package manager; strict workspace resolution. |
| **Next.js** | `16.2.6` | Next.js `16.x` | App Router + Edge Runtime compatibility. |
| **React** | `19.x` | React `19.x` | React Server Components (RSC) and Actions. |
| **TypeScript** | `5.7.3` | TS `>= 5.7.0` | Strict mode enabled (`tsconfig.json`). |
| **Cloudflare Pages** | `@cloudflare/next-on-pages` | Latest | Edge runtime bundle compiler. Requires `bash` in Windows `PATH`. |
| **Prisma ORM** | `@prisma/client` | `>= 5.15.0` | Serverless Neon edge driver integration (`@neondatabase/serverless`). |
| **Sanity CMS** | `next-sanity` | `>= 9.0.0` | GROQ queries & ISR webhook revalidation. |
| **Tailwind CSS** | `v4.x` | Tailwind `v4.x` | PostCSS configuration + design token utilities. |
