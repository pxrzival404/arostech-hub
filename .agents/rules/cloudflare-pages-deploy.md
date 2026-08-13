# Cloudflare Pages Deployment & Build Pipeline Governance Rule

> **Rule ID**: `RULE-DEPLOY-001`  
> **Project**: PT Daya Berkah Sentosa Nusantara (DBSN) — `arostech-hub`  
> **Deployment Target**: Cloudflare Pages (NOT Vercel)  
> **Build Tool**: `@cloudflare/next-on-pages` ^1.13.16  
> **Framework**: Next.js 16.2.6 (App Router)  
> **Owner Agent**: `architect` (deployment architecture & pipeline governance)  
> **Primary Authority**: [ADR-0001](file:///d:/dev/arostech-hub/docs/system/adr/0001-migrate-fully-to-cloudflare-pages.md) & [ADR-0002](file:///d:/dev/arostech-hub/docs/system/adr/0002-explicit-cloudflare-pages-deploy-command.md)

---

## 1. File-Matcher Scopes

This rule MUST be enforced whenever an AI agent inspects or modifies files matching:

```
next.config.ts
scripts/pages-build.js
wrangler.toml
.wrangler.toml
wrangler.jsonc
src/lib/utils/pages-host.ts
src/**/middleware*.ts
src/**/middleware*.tsx
vercel.json
**/_routes.json
package.json
.github/workflows/**/*.yml
```

Additionally, any PR that modifies `package.json` build scripts, Cloudflare environment variables, or deployment configuration is **in-scope**.

---

## 2. Pre-Execution Architectural Vector Analysis

Before modifying any deployment configuration or build script, agents MUST evaluate the following 3 vectors:

1. **Vector A — Trade-offs & Isolation Dynamics**:
   - Cloudflare Pages deployments require output adapter compilation via `@cloudflare/next-on-pages`. The target deployment directory is strictly `.vercel/output/static`.
   - Enforce total compressed worker bundle size limit of **25 MB**. Sentry source map generation MUST be conditionally disabled during Cloudflare builds using `isCloudflareBuild`.

2. **Vector B — System Invariants & Spec Compliance**:
   - Build command MUST strictly execute `pnpm pages:build` (which calls `npx @cloudflare/next-on-pages`).
   - Deploy command MUST strictly execute `npx wrangler pages deploy .vercel/output/static --project-name dbsn-website`.
   - Prohibit Vercel-specific runtime imports (`@vercel/analytics`, `@vercel/og`, `@vercel/kv`, `@vercel/blob`) and Vercel environment variables (`VERCEL_URL`, `VERCEL_ENV`).

3. **Vector C — Edge Cases & Verification Strategy**:
   - Verification: Preview deployment domain prefix mapping MUST support `<branch>.dayaberkah.pages.dev` and `<spoke>.<branch>.dayaberkah.pages.dev`.
   - Edge case: Unlinked development artifacts (e.g. `sentry-example-page/`) MUST be purged from production deployments.

---

## 3. Normative Enforcement Rules (RFC 2119)

1. Next.js build configuration **MUST NOT** retain `ignoreBuildErrors: true` or `ignoreDuringBuilds: true` in `next.config.ts`.
2. All Cloudflare Pages deployment artifacts **MUST** be produced under `.vercel/output/static` using `pnpm pages:build`.
3. Sentry source-map bundling **MUST** be toggled off when `isCloudflareBuild` is true to preserve the 25 MB Worker bundle limit.
4. Deployment scripts **MUST** validate that `.vercel/output/static/_worker.js` exists and is **< 25 MiB** uncompressed before completing.
5. Source code **MUST NOT** import `@vercel/analytics`, `@vercel/og`, or rely on `VERCEL_*` environment variables.
6. Middleware files **MUST NOT** import `headers` from `next/headers`; request headers **MUST** be read directly from `NextRequest`.
7. Production deployments **MUST NOT** include unlinked development routes or test endpoints (`/sentry-example-page`).

---

## 4. Exact Build/Deploy Command Sequence

Cloudflare Pages CI executes the following build command:

```bash
npx @cloudflare/next-on-pages
```

The project provides `scripts/pages-build.js` which wraps this with environment validation and size enforcement:

```bash
node scripts/pages-build.js
```

### Build Scripts in `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages",
    "preview": "pnpm pages:build && wrangler pages dev .vercel/output/static",
    "deploy:preview": "pnpm pages:build && wrangler pages deploy .vercel/output/static --project-name dbsn-website --branch preview",
    "deploy:prod": "pnpm pages:build && wrangler pages deploy .vercel/output/static --project-name dbsn-website --branch main"
  }
}
```

### Build Script Internals (`scripts/pages-build.js`)

The script MUST perform these steps in order:
1. **PATH resolution** (Windows only): Locate `Git/bin`, `Git/usr/bin`, and `Git/cmd` via `where.exe git` and `where.exe bash`, prepend to `process.env.PATH`.
2. **Execute build**: Run `npx @cloudflare/next-on-pages` with `stdio: 'inherit'`.
3. **Validate static directory**: Assert `.vercel/output/static` exists.
4. **Validate worker bundle**: Assert `.vercel/output/static/_worker.js` exists and is **< 25 MiB** uncompressed. Exit with code `1` on failure.

```javascript
// scripts/pages-build.js — worker bundle size guard
const workerPath = path.join(staticDir, '_worker.js')
const stats = fs.statSync(workerPath)
const sizeInMB = stats.size / (1024 * 1024)
if (sizeInMB >= 25) {
  console.error(`[pages-build] Error: _worker.js size (${sizeInMB.toFixed(2)} MiB) exceeds 25 MiB limit!`)
  process.exit(1)
}
```

---

## 5. Preview vs Production Domain Patterns

| Pattern | Type | Subdomain | Branch | Description |
|---|---|---|---|---|
| `dayaberkah.pages.dev` | Production | — | — | Hub production site |
| `<branch>.dayaberkah.pages.dev` | Preview | — | `<branch>` | Hub branch preview deployment |
| `<spoke>.dayaberkah.pages.dev` | Production | `<spoke>` | — | Spoke production (pju, solarpanel, penangkalpetir, baterai) |
| `<spoke>.<branch>.dayaberkah.pages.dev` | Preview | `<spoke>` | `<branch>` | Spoke branch preview deployment |
| `dashboard.dayaberkah.pages.dev` | Production | `dashboard` | — | Dashboard production |
| `dashboard.<branch>.dayaberkah.pages.dev` | Preview | `dashboard` | `<branch>` | Dashboard branch preview |

**Base domains**: `dayaberkah.pages.dev`, `dbsn-website.pages.dev`  
**Spoke subdomains**: `pju`, `solarpanel`, `penangkalpetir`, `baterai`  
**Subdomain aliases**: `solarcell` → `solarpanel`, `alatpetir` → `penangkalpetir`  

**Disambiguation Rule**: When the leading label of a 4-part host matches a known spoke or `dashboard`, it is treated as the subdomain (whitelist-first). Otherwise the entire prefix is treated as a branch name resolved as hub preview. Git branch names MUST NOT collide with spoke or dashboard names.

---

## 6. Forbidden Vercel-Specific Imports & Anti-Patterns

### ANTI-1: `@vercel/analytics` and `@vercel/og` Imports
```typescript
// ❌ FORBIDDEN in any file
import { Analytics } from '@vercel/analytics/react'
import { ImageResponse } from '@vercel/og'
```
**Correct Pattern**: Use Cloudflare Web Analytics (`@cloudflare/web-analytics`) or PostHog for analytics. Generate OG images via Cloudflare Workers or standard Web Canvas/SVG endpoints.

---

### ANTI-2: Vercel CLI Commands and `vercel.json`
```json
// ❌ FORBIDDEN: vercel.json must NOT exist at project root
{ "framework": "nextjs", "buildCommand": "next build" }
```
```bash
# ❌ FORBIDDEN CLI calls
vercel --prod
vercel deploy --prebuilt
```
**Correct Pattern**: Use `npx wrangler pages deploy` or Cloudflare Pages Git integration.

---

### ANTI-3: Vercel-Specific Environment Variables
```typescript
// ❌ FORBIDDEN in source code
const url = process.env.VERCEL_URL
const env = process.env.VERCEL_ENV
const branch = process.env.VERCEL_GIT_COMMIT_REF
```
**Correct Pattern**: Use Cloudflare Pages environment variables:

| Vercel (forbidden) | Cloudflare Pages (use instead) |
|---|---|
| `VERCEL_URL` | `CF_PAGES_URL` or `process.env.NEXT_PUBLIC_BASE_URL` |
| `VERCEL_ENV` | `CF_PAGES_BRANCH` (empty string on production) |
| `VERCEL_GIT_COMMIT_REF` | `CF_PAGES_BRANCH` |
| `VERCEL_GIT_COMMIT_SHA` | `CF_PAGES_COMMIT_SHA` |

---

### ANTI-4: `next/headers` in Edge Middleware
```typescript
// ❌ FORBIDDEN in src/middleware.ts
import { headers } from 'next/headers'

export default async function middleware(request: NextRequest) {
  const headersList = await headers() // FORBIDDEN: Unreliable on Cloudflare Edge
}
```
**Correct Pattern**: Read headers directly from `NextRequest`:
```typescript
export default async function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  const cf = request.cf
}
```

---

### ANTI-5: Retaining `ignoreBuildErrors: true` in `next.config.ts`
```typescript
// ❌ FORBIDDEN in next.config.ts
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // FORBIDDEN: Masks type errors in production builds
  },
}
```
**Correct Pattern**: Fix type errors directly; maintain strict type safety during builds.

---

## 7. Approved Canonical Code Patterns

### APPROVED-1: `isCloudflareBuild` Flag for Conditional Sentry Bundling
```typescript
// next.config.ts — APPROVED
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const isCloudflareBuild =
  process.env.CF_PAGES === '1' ||
  process.env.NEXT_ON_PAGES === '1' ||
  process.env.IS_CLOUDFLARE_BUILD === 'true' ||
  process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true, // Cloudflare Pages image setup
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    if (isCloudflareBuild) {
      config.resolve = config.resolve || {}
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@sentry/nextjs': false, // Prevents Sentry from inflating Worker bundle
      }
    }
    return config
  },
}

export default isCloudflareBuild
  ? nextConfig
  : withSentryConfig(nextConfig, { silent: true })
```

---

### APPROVED-2: Canonical Pages Hostname Parsing (`src/lib/utils/pages-host.ts`)
```typescript
// src/lib/utils/pages-host.ts — APPROVED
export const CLOUDFLARE_PAGES_PROJECTS = ['dayaberkah', 'dbsn-website'] as const
export const CLOUDFLARE_PAGES_BASE = 'dayaberkah.pages.dev'
export const CLOUDFLARE_PAGES_BASES = ['dayaberkah.pages.dev', 'dbsn-website.pages.dev'] as const
export const SPOKE_SUBDOMAINS = ['pju', 'solarpanel', 'penangkalpetir', 'baterai'] as const
export const DASHBOARD_SUBDOMAIN = 'dashboard'

export interface PagesHost {
  subdomain: string | null
  previewRoot: string
}

export function parseCloudflarePagesHost(hostname: string): PagesHost | null {
  if (!hostname) return null
  const host = hostname.toLowerCase().split(':')[0]
  
  for (const base of CLOUDFLARE_PAGES_BASES) {
    if (host.endsWith(base)) {
      const prefix = host.slice(0, -base.length - 1)
      if (!prefix) return { subdomain: null, previewRoot: base }
      
      const parts = prefix.split('.')
      if (parts.length === 1) {
        const first = parts[0]
        if (SPOKE_SUBDOMAINS.includes(first as any)) {
          return { subdomain: first, previewRoot: base }
        }
        if (first === DASHBOARD_SUBDOMAIN) {
          return { subdomain: DASHBOARD_SUBDOMAIN, previewRoot: base }
        }
        return { subdomain: null, previewRoot: base }
      }
    }
  }
  return null
}
```

---

### APPROVED-3: `_routes.json` Cloudflare Pages Routing Rules
Generated or static `public/_routes.json` structure MUST follow:

```json
{
  "version": 1,
  "include": [
    "/*"
  ],
  "exclude": [
    "/_next/static/*",
    "/favicon.ico",
    "/images/*",
    "/assets/*"
  ]
}
```

**Rules**:
1. Server Components, Server Actions, and API routes MUST be included.
2. Static assets MUST be excluded to bypass Worker execution.
3. Version MUST be `1` (or `3` depending on generator version).

---

## 8. Build Output Structure

The deployable artifact produced by `@cloudflare/next-on-pages` is located at:

```
.vercel/output/static/
├── _worker.js          # Compiled Worker bundle (MUST be < 25 MiB)
├── _routes.json        # Edge vs static routing rules (auto-generated)
├── _next/              # Next.js client assets
│   └── static/         # Static JS/CSS chunks
├── favicon.ico         # Static files
└── index.html          # Static pages
```

**Invariants**:
1. `.vercel/output/static/` is the deployable directory.
2. `_worker.js` MUST exist at `.vercel/output/static/_worker.js`.
3. `_worker.js` uncompressed size MUST be < 25 MiB.
4. `images.unoptimized: true` MUST be set in `next.config.ts`.

---

## 9. 25 MB Worker Bundle Budget & Reduction Strategies

### Hard Limit
The Cloudflare Pages Worker bundle (`_worker.js`) MUST NOT exceed **25 MiB** uncompressed.

### Priority Reduction Strategies

| Priority | Strategy | Expected Savings |
|---|---|---|
| 1 | Alias `@sentry/nextjs` to `false` when `isCloudflareBuild` is true | 2–5 MiB |
| 2 | Move large dependencies to `serverExternalPackages` | Full package size |
| 3 | Use `optimizePackageImports` in `next.config.ts` for tree-shakeable packages | 30–70% per package |
| 4 | Replace heavy runtime libs (e.g., `lodash` → native) | Full package size |
| 5 | Offload heavy server logic to Node-runtime API routes | Full route size |

---

## 10. Related Rules

- [`cloudflare-edge-runtime.md`](file:///d:/dev/arostech-hub/.agents/rules/cloudflare-edge-runtime.md) — Edge runtime constraints & Node.js module restrictions
- [`monorepo-workspace.md`](file:///d:/dev/arostech-hub/.agents/rules/monorepo-workspace.md) — PNPM workspace configuration & native build filters
