# System Runtime Compatibility Matrix

> **Scope**: Target state support matrix for PT. Daya Berkah Sentosa Nusantara (DBSN) digital platform (`arostech-hub`).

---

## 1. Supported Runtimes & Frameworks

| Layer | Component | Standard Version | Supported Range | Compatibility Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `v20.x` (LTS) | `>= 20.0.0` | Required for local build toolchain (`pnpm dev`). |
| **Package Manager** | pnpm | `v9.x` | `>= 9.0.0` | Enforced package manager; workspace strict resolution. |
| **Framework** | Next.js | `16.2.6` | `16.x` | App Router + Edge Runtime (`@cloudflare/next-on-pages`). |
| **UI Library** | React | `19.x` | `19.x` | React Server Components & Server Actions. |
| **Language** | TypeScript | `5.7.3` | `>= 5.7.0` | Strict mode enabled (`tsconfig.json`). |
| **Styling** | Tailwind CSS | `v4.x` | `v4.x` | PostCSS + design token CSS utilities. |

---

## 2. Platform & Edge Bindings

| Service | Driver / SDK | Version | Target Environment |
| :--- | :--- | :--- | :--- |
| **Edge Hosting** | Cloudflare Pages | `@cloudflare/next-on-pages 1.13.x` | Edge Runtime (`CF_PAGES=1`). Requires `bash` in Windows PATH. |
| **Database** | Neon Serverless Postgres | `@neondatabase/serverless 1.1.x` | Serverless pooled connection with WebSocket fallback. |
| **ORM** | Prisma ORM | `@prisma/client 6.19.x` | Prisma Neon Adapter (`@prisma/adapter-neon 7.8.x`). |
| **CMS** | Sanity CMS | `next-sanity 12.4.x` | GROQ query client & ISR webhook revalidation handler. |
| **Testing** | Jest + Playwright | `jest 30.x`, `playwright 1.60.x` | Unit/integration testing & E2E browser testing. |

---

## 3. Browser Support Matrix

| Browser | Supported Versions | Notes |
| :--- | :--- | :--- |
| **Google Chrome** | Latest 2 major versions | Full PWA & Core Web Vitals optimization. |
| **Mozilla Firefox** | Latest 2 major versions | Standard modern JS features. |
| **Apple Safari** | iOS 16+, macOS Safari 16+ | WebKit responsive & touch touchpoint optimization. |
| **Microsoft Edge** | Latest 2 major versions | Chromium engine feature set. |
