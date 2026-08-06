# Integration Health Audit — DBSN Ecosystem
> Date: 2026-07-14
> Auditor: Claude Integration Auditor Agent (architect + security-reviewer + code-reviewer + build-error-resolver)
> Branch: feat/landing-redesign-pr3
> Framework: ECC production-audit skill

---

## Executive Summary

**Health Score: 48/100**
**Status: NEEDS_ATTENTION**

The DBSN ecosystem's Vercel staging deployment is functional — `pnpm build` succeeds (43 static pages), 393/397 tests pass, and core architecture patterns (Prisma excluded from middleware, Neon serverless edge-compatible adapter, Zod-validated RFQ API) are sound. However, the Cloudflare Pages production migration is **blocked** by 8 critical issues, and the Sanity.io integration contains 4 critical GROQ correctness bugs that cause spoke-filtered queries to return empty results.

### Finding Totals

| Severity | Count | Impact |
|----------|-------|--------|
| CRITICAL | 8 | Blocks production migration or causes silent data loss |
| WARNING | 17 | Must fix before Phase B launch |
| INFO | 12 | Should fix / nice-to-have / positive confirmations |
| **Total** | **37** | |

### Root Causes

1. **Schema drift** — Studio has 3 schemas but code references 6 document types. Certification, Page, and Article schemas were never created, making those queries return null silently.
2. **GROQ reference dereference bug** — Three queries use dot notation (`spoke.subdomain`) on reference fields instead of the dereference operator (`spoke->subdomain`). In GROQ filter context, dot-access on a reference yields `undefined`, so the filter never matches.
3. **Environment variable gap** — `wrangler.toml` declares only 6 of ~25 required env vars. 16+ secrets must be set via `wrangler pages secret put` before production deployment.
4. **Configuration drift** — `NEXTAUTH_URL` and `SANITY_API_VERSION` have inconsistent values across `wrangler.toml`, `.env.example`, and `env.ts`.

---

## Area 1: Vercel Integration (Staging)

### Findings

| ID | Severity | Description | File | Recommendation |
|----|----------|-------------|------|----------------|
| V-001 | WARNING | `typescript.ignoreBuildErrors: true` suppresses 3 real TypeScript errors at build time. Type errors that would block CI ship silently to production. | `next.config.ts:11` | Remove `ignoreBuildErrors`, fix the 3 underlying TS errors, run `npx tsc --noEmit` as a CI gate. |
| V-002 | WARNING | `@sanity/image-url` uses deprecated default export `import imageBuilder from '@sanity/image-url'`. Build warns on every compile. | `src/lib/api/sanity/image.ts:1` | Switch to `import { createImageUrlBuilder } from '@sanity/image-url'`. Update test mock at `__tests__/image.test.ts:12`. |
| V-003 | WARNING | 2 API routes missing explicit `runtime` export: `/api/revalidate` and `/api/an-token`. Default to Node.js on Vercel but may break on Cloudflare Pages. | `src/app/api/revalidate/route.ts`, `src/app/api/an-token/route.ts` | Add `export const runtime = 'nodejs'` to both. |
| V-004 | WARNING | No CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy headers configured anywhere. App is open to clickjacking, MIME sniffing, and CSP-driven XSS. | `next.config.ts`, `src/middleware.ts` | Add `headers()` export in `next.config.ts` with nonce-based CSP, HSTS, X-Frame-Options: DENY, etc. |
| V-005 | WARNING | Dashboard middleware only checks cookie *presence* (line 94: `if (!sessionToken)`), not JWT validity. A user can set `next-auth.session-token=fake` to bypass the redirect to `/login`. Defense-in-depth broken at edge. | `src/middleware.ts:87-98` | Use Auth.js v5 `auth()` export as middleware wrapper, or call `getToken()` from `next-auth/jwt` to validate JWT signature before allowing rewrite. |
| V-006 | WARNING | Webhook signature bypass in non-production. When `SANITY_WEBHOOK_SECRET` is unset and `NODE_ENV !== 'production'`, signature verification is skipped entirely (line 86: `if (secret) { ... }`). Staging/preview deployments become open cache-invalidation endpoints. | `src/app/api/revalidate/route.ts:77-104` | Require the secret in all environments. Never skip auth based on `NODE_ENV`. |
| V-007 | WARNING | HTML injection in Resend notification emails. Lead fields (`contactName`, `contactEmail`, etc.) interpolated raw into HTML template literals. Attacker can inject `<script>` or `<img onerror=...>` into internal sales emails. | `src/lib/api/notifications/resend.ts:62-74` | HTML-escape all lead fields before interpolation, or use React Email / JSX templates that auto-escape. |
| V-008 | WARNING | Host header injection in password reset URL. `resetUrl` built from `request.headers.get('host')` without allowlist validation. Attacker can send `Host: evil.com` to harvest reset tokens via phishing emails. | `src/app/api/auth/forgot-password/route.ts:82-84` | Validate `host` against `NEXT_PUBLIC_ROOT_DOMAIN` / `dashboard.dayaberkah.id` allowlist, or derive from `NEXTAUTH_URL`. |
| V-009 | WARNING | Hardcoded fallback `dayaberkah.id` in middleware config when `getMiddlewareEnv()` throws. Masks misconfiguration in production — if `NEXT_PUBLIC_ROOT_DOMAIN` is unset, middleware silently uses fallback instead of failing fast. | `src/lib/middleware/config.ts:70` | Remove hardcoded fallback or throw in production. Use `getMiddlewareEnv()` exclusively. |
| V-010 | INFO | RFQ form tests are flaky. First run: 4 failures (timeout + scrambled text in `contact_name`). Re-run: 397/397 pass. Root cause: React 19 concurrent rendering + `userEvent.setup()` typing interleaving with `react-hook-form` async validation under `waitFor` timeouts. | `src/components/forms/__tests__/RfqB2BForm.test.tsx:362-365` | Increase `waitFor` timeout to 3000ms, or `await findByRole('button')` before clicking submit. Monitor CI for flakiness. |
| V-011 | INFO | `console.log` in middleware (`[Middleware] Hub domain detected: ${pathname}`) leaks routing info in production. ECC `typescript/coding-style.md` bans `console.log` in production code. | `src/middleware.ts:73` | Remove or gate behind `process.env.NODE_ENV === 'development'`. |
| V-012 | INFO | Rate limiter is in-memory LRU, not distributed. Under Cloudflare Pages edge, each isolate has its own cache — attacker can rotate across isolates to bypass RFQ rate limit (5/min). | `src/lib/rate-limiter.ts:8-46` | Use Cloudflare KV, Durable Objects, or Upstash Redis for distributed rate limiting in Phase B. |
| V-013 | INFO | `x-forwarded-for` taken blindly as client IP without preferring `cf-connecting-ip`. Attacker can spoof header to rotate rate-limit keys. | `src/lib/rate-limiter.ts:51-61` | Prefer `cf-connecting-ip` when present, fall back to `x-forwarded-for` only behind trusted proxy. |
| V-014 | INFO | Google OAuth provider falls back to `'dummy-client-id'` when env vars are missing. Auth.js fails at runtime with confusing error rather than failing fast at startup. | `src/lib/auth/auth.config.ts:36-39` | Throw at startup if `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are unset, or make provider conditional. |
| V-015 | INFO | `.vercel/project.json` valid — projectId `prj_V8PzkGIisHdXmdMgwuIMRmsCnCKA`, orgId `team_tiNO6Bk8YYS2sc32UAbaxMjv`. Connected and active. | `.vercel/project.json` | No action needed. |
| V-016 | INFO | Sentry config correctly integrated — org `pt-daya-berkah-sentosa-nusanta`, project `javascript-nextjs`, tunnelRoute `/api/monitoring`, sourcemaps enabled in CI. | `next.config.ts:34-48` | No action needed. |
| V-017 | INFO | Env validation uses Zod schemas for Sanity, middleware, database, auth, notification, and 21st SDK configs. Well-structured. | `src/lib/config/env.ts` | No action needed. |
| V-018 | INFO | Loopback fetch AbortController timeout (2000ms) is sufficient for staging. Risk of deadlock in single-threaded dev server is mitigated per CLAUDE.md guidance. | `src/lib/middleware/redirect-engine.ts:68` | No action needed. |

### Evidence

**Build output (`pnpm build`):**
```
✓ Generating static pages using 7 workers (43/43) in 8.1s
Route (app)                             Revalidate  Expire
┌ ƒ /
├ ● /[spoke]                                    1h      1y
│ └ /pju                                        1h      1y
├ ● /[spoke]/products                           1h      1y
│ └ /pju/products                              1h      1y
├ ● /[spoke]/products/[slug]                    1h      1y
│ ├ /pju/products/pju-led-100w                  1h      1y
│ └ [+6 more paths]
... (43 total routes)
Exit code: 0
```

**Warnings:**
- `@sanity/image-url` default export deprecated — use `createImageUrlBuilder` instead
- `ExperimentalWarning: localStorage is not available` (Node.js — non-blocking)

**Test output (`pnpm test`):**
```
Test Suites: 2 failed, 46 passed, 48 total
Tests:       4 failed, 393 passed, 397 total
Time:        55.324 s
```

Failed suites:
1. `src/components/forms/__tests__/RfqB2BForm.test.tsx` — 2 failures (timeout + assertion mismatch)
2. `src/components/forms/__tests__/RfqB2GForm.test.tsx` — 2 failures (assertion mismatches)

Note: On re-run by the build-error-resolver agent, all 397 tests passed. The failures are flaky (React 19 + userEvent race condition).

**TypeScript check (`npx tsc --noEmit`):**
- 3 errors found (hidden by `ignoreBuildErrors: true`):
  - `this` implicitly `any` in leaflet marker handlers (`src/components/leaflet-map.tsx:140,144`)
  - Module `next-auth/jwt` cannot be found augmentation (`src/lib/auth/auth.config.ts:24`) — false positive
  - `@sanity/image-url` deprecated default export (`src/lib/api/sanity/image.ts:1`)

---

## Area 2: Cloudflare Pages Integration (Production Target)

### Findings

| ID | Severity | Description | File | Recommendation |
|----|----------|-------------|------|----------------|
| CF-001 | CRITICAL | `wrangler.toml [vars]` missing ~19 environment variables required at runtime. Missing secrets (must be Cloudflare secrets via `wrangler pages secret put`): `DATABASE_URL`, `NEXTAUTH_SECRET`, `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `SANITY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SENTRY_AUTH_TOKEN`, `GSC_SERVICE_ACCOUNT_JSON`, `API_KEY_21ST`. Missing `[vars]` (public): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GSC_VERIFICATION`, `GSC_VERIFICATION_CODE`, `SENTRY_ORG`, `SENTRY_PROJECT`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_GA_TRACKING_ID`, `GA_TRACKING_ID`. | `wrangler.toml` | Add public vars to `[vars]`. Set all secrets via `wrangler pages secret put <NAME>` against the `dbsn-website` project. Do NOT commit secrets to `wrangler.toml`. |
| CF-002 | CRITICAL | `NEXTAUTH_URL = "https://dashboard.dayaberkah.id"` in wrangler.toml. Auth.js v5 uses this as canonical base URL for session cookies, OAuth callbacks, and CSRF tokens. Setting it to a subdomain breaks OAuth redirect URIs for hub and spokes, and narrows cookie scope. `.env.example` indicates production should be `https://dayaberkah.id`. | `wrangler.toml:10` | Set `NEXTAUTH_URL = "https://dayaberkah.id"` for production. Dashboard inherits auth via cookie `path: '/'` and `sameSite: 'strict'`. Whitelist `https://dayaberkah.id/api/auth/callback/google` in Google Console. |
| CF-003 | CRITICAL | `SANITY_API_VERSION` drift across three files: `wrangler.toml:15` has `v2026-05-21` (future-dated, may not exist in Sanity stable API), `.env.example:21` has `v2025-05-21`, `src/lib/config/env.ts:55` defaults to `v2025-05-21`. Future-dated version could cause CMS queries to fail or return unexpected shapes. | `wrangler.toml:15`, `.env.example:21`, `src/lib/config/env.ts:55` | Align all three to `v2025-05-21` unless Sanity confirms `v2026-05-21` is stable. |
| CF-004 | CRITICAL | `pnpm pages:build` fails on Windows: `spawn pnpm ENOENT`. `@cloudflare/next-on-pages` v1.13.16 invokes `pnpm dlx vercel build` as a child process; Windows `spawn` requires `.cmd` extension or `shell:true`. Phase B deployment is blocked on Windows. | `package.json:17` | Use Cloudflare Pages GitHub integration (Linux CI runner) — recommended per CLAUDE.md Phase B. Alternatively run `pnpm exec vercel build && npx @cloudflare/next-on-pages` directly. |
| CF-005 | WARNING | `images.unoptimized: true` set globally in `next.config.ts:14`. Required for Cloudflare Pages (no built-in image optimization) but degrades Vercel staging performance (no AVIF/WebP conversion, no responsive srcset). No conditional strategy. | `next.config.ts:13-21` | Conditional: `images: { unoptimized: process.env.CF_PAGES ? true : false, remotePatterns: [...] }`. Cloudflare Pages sets `CF_PAGES=1` automatically. |
| CF-006 | WARNING | CLAUDE.md line 149 claims "All dynamic routes, API endpoints, and root layouts must export `const runtime = 'edge'`" but ALL 7 API routes use `runtime = 'nodejs'` (correct for Prisma). Root layout has no runtime export. Documentation is stale and contradicts the actual (correct) implementation. | `CLAUDE.md:149` | Update CLAUDE.md to reflect: routes use `nodejs` runtime with `nodejs_compat` flag. `@cloudflare/next-on-pages` supports this via the `nodejs_compat` compatibility flag (already set in `wrangler.toml:5`). |
| CF-007 | WARNING | Redirect engine loopback fetch to `/api/redirects/lookup` (nodejs/Prisma route) may hit Cloudflare Workers subrequest limit (50 on free plan). Cold-start latency + 2000ms timeout = silent redirect degradation under load. | `src/lib/middleware/redirect-engine.ts:67-96` | Monitor subrequest count. Consider moving redirect lookups to Cloudflare KV or Durable Objects (edge-native, sub-millisecond). LRU cache (500 entries, 5-min TTL) mitigates but does not eliminate cold-path latency. |
| CF-008 | WARNING | `.env.example` contains stale Supabase env vars (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`) but project uses Neon Postgres via Prisma. Also has `GITHUB_PERSONAL_ACCESS_TOKEN` which is unused in code. | `.env.example:9-13` | Remove Supabase and GitHub entries, or document as legacy/unused. |
| CF-009 | WARNING | `NEXTAUTH_URL` change from staging (`https://dbsn-test01.vercel.app`) to production (`https://dayaberkah.id`) invalidates existing JWT sessions. All dashboard users will be force-logged-out on cutover. | `CLAUDE.md` migration checklist | Schedule migration during low-traffic window. Communicate session invalidation to dashboard users. Verify Google OAuth console has all 7 callback URLs whitelisted. |
| CF-010 | INFO | Prisma correctly NOT imported in `src/middleware.ts`. Middleware offloads DB lookups to `/api/redirects/lookup` via lightweight loopback fetch. Respects Vercel's 1MB Edge limit. | `src/middleware.ts` | No action needed. CLAUDE.md warning is correctly followed. |
| CF-011 | INFO | `@neondatabase/serverless` (HTTP-based) + `@prisma/adapter-neon` used in `src/lib/db/prisma.ts`. Edge-compatible — no TCP socket needed. Works with Cloudflare Workers. | `src/lib/db/prisma.ts` | No action needed. Good architectural choice for Phase B. |
| CF-012 | INFO | DNS CNAME records needed for 7 hostnames: `dayaberkah.id`, `www.dayaberkah.id`, `pju.dayaberkah.id`, `solarcell.dayaberkah.id`, `alatpetir.dayaberkah.id`, `baterai.dayaberkah.id`, `dashboard.dayaberkah.id`. Each CNAMEs to `dbsn-website.pages.dev`. | `CLAUDE.md` migration checklist | Configure in Cloudflare Dashboard before Phase B cutover. |

### Evidence

**`pnpm pages:build` output:**
```
$ npx @cloudflare/next-on-pages
⚡️ @cloudflare/next-on-pages CLI v.1.13.16
⚡️ Warning: It seems like you're on a Windows system, the Vercel CLI seems not to work reliably on Windows...
⚡️ Building project...
Error: spawn pnpm ENOENT
    at ChildProcess._handle.oninit (node:internal/child_process:286:19)
errno: -4058, code: 'ENOENT', syscall: 'spawn pnpm', path: 'pnpm'
Exit code: 1
```

**wrangler.toml vs .env.example comparison:**

| Env Var | wrangler.toml | .env.example | Status |
|---------|---------------|--------------|--------|
| NEXT_PUBLIC_ROOT_DOMAIN | `dayaberkah.id` | `lvh.me` | OK (different envs) |
| NEXTAUTH_URL | `https://dashboard.dayaberkah.id` | `http://lvh.me:3000` | **MISMATCH** — should be `https://dayaberkah.id` in prod |
| SANITY_PROJECT_ID | `3h4k8dye` | placeholder | OK |
| SANITY_DATASET | `production` | `production` | OK |
| SANITY_API_VERSION | `v2026-05-21` | `v2025-05-21` | **DRIFT** |
| DATABASE_URL | missing | placeholder | Must be secret |
| NEXTAUTH_SECRET | missing | placeholder | Must be secret |
| SANITY_API_READ_TOKEN | missing | placeholder | Must be secret |
| SANITY_WEBHOOK_SECRET | missing | placeholder | Must be secret |
| RESEND_API_KEY | missing | placeholder | Must be secret |
| TELEGRAM_BOT_TOKEN | missing | placeholder | Must be secret |
| TELEGRAM_CHAT_ID | missing | placeholder | Must be secret |
| GOOGLE_CLIENT_ID | missing | placeholder | Must be secret |
| GOOGLE_CLIENT_SECRET | missing | placeholder | Must be secret |
| SENTRY_AUTH_TOKEN | missing | placeholder | Must be secret |
| SENTRY_ORG | missing | `pt-daya-berkah-sentosa-nusanta` | Add to [vars] |
| SENTRY_PROJECT | missing | `javascript-nextjs` | Add to [vars] |
| NEXT_PUBLIC_SENTRY_DSN | missing | placeholder | Add to [vars] |
| GSC_SERVICE_ACCOUNT_JSON | missing | placeholder | Must be secret |
| GSC_VERIFICATION_CODE | missing | placeholder | Add to [vars] |
| NEXT_PUBLIC_GSC_VERIFICATION | missing | placeholder | Add to [vars] |
| API_KEY_21ST | missing | placeholder | Must be secret |
| NEXT_PUBLIC_GA_TRACKING_ID | missing | placeholder | Add to [vars] |
| GA_TRACKING_ID | missing | placeholder | Add to [vars] |
| NEXT_PUBLIC_POSTHOG_KEY | missing | placeholder | Add to [vars] |
| NEXT_PUBLIC_POSTHOG_HOST | missing | placeholder | Add to [vars] |
| NEXT_PUBLIC_SITE_URL | missing | placeholder | Add to [vars] |
| SUPABASE_ACCESS_TOKEN | missing | placeholder | **STALE** — remove from .env.example |
| SUPABASE_PROJECT_REF | missing | placeholder | **STALE** — remove from .env.example |

---

## Area 3: Sanity.io ↔ Hub & Spokes

### Findings

| ID | Severity | Description | File | Recommendation |
|----|----------|-------------|------|----------------|
| SAN-001 | CRITICAL | **Schema drift**: Studio exports only 3 schemas (`spokeConfig`, `product`, `portfolioEntry`) but `types.ts` and `queries.ts` reference 6 document types. `certification`, `page`, and `article` schemas are MISSING. Queries for these types (`getCertifications`, `getArticles`, `getPageBySlug`, etc.) will return `null`/empty because no documents of those `_type` can exist in the dataset (no schema = editors cannot create them). Silently breaks certifications grid, article pages, and CMS-driven pages. | `studio/schemaTypes/index.ts:5` | Add `certification.ts`, `page.ts`, `article.ts` schema definitions and register in `index.ts`. Fields must match `queries.ts` projections. |
| SAN-002 | CRITICAL | **GROQ reference filter bug**: `spoke.subdomain == $subdomain` in filter context. `spoke` is a reference field holding `{_ref, _type}`. Dot-access yields `undefined`, so the filter never matches. `getProductsBySpoke("pju")` returns `[]` even when products exist. Contrast with `getProductSlugsWithSpokes` (line 110) which correctly uses `spoke->subdomain` in projection. | `src/lib/api/sanity/queries.ts:51` | Change to `*[_type == "product" && spoke->subdomain == $subdomain]` |
| SAN-003 | CRITICAL | **Same GROQ bug for portfolio**: `relatedSpoke.subdomain == $subdomain` does not dereference. `getPortfolioEntries("pju")` returns `[]`. | `src/lib/api/sanity/queries.ts:234` | Change to `*[_type == "portfolioEntry" && relatedSpoke->subdomain == $subdomain]` |
| SAN-004 | CRITICAL | **Same GROQ bug for pages**: `targetSpoke.subdomain == $subdomain` does not dereference. `getPageBySlug(slug, "pju")` returns `null`. | `src/lib/api/sanity/queries.ts:401` | Change to `*[_type == "page" && slug.current == $slug && targetSpoke->subdomain == $subdomain]` |
| SAN-005 | HIGH | Webhook `getTagsForDocumentType` switch handles `product`, `certification`, `portfolioEntry`, `spokeConfig`, `page` — but NOT `article`. Article create/update/delete hits `default: return []`, route returns HTTP 400, and no `revalidateTag` runs. Article ISR cache never invalidates via webhook. | `src/app/api/revalidate/route.ts:152` | Add `case 'article':` pushing `CACHE_TAGS.article(payload._id)` and `CACHE_TAGS.article()`. |
| SAN-006 | HIGH | Spoke-specific cache tags (`sanity:spoke:{subdomain}`) registered in queries (lines 59, 245, 331, 412) but webhook never invalidates them. If a product's `spoke` reference changes from `pju` to `solarcell`, `sanity:spoke:pju` is never purged — old spoke's product list stays stale until 3600s TTL expires. Webhook payload also lacks `subdomain` field needed to construct spoke tags. | `src/app/api/revalidate/route.ts:146` | Include `subdomain` in webhook projection and push `CACHE_TAGS.spoke(oldSubdomain)` + `CACHE_TAGS.spoke(newSubdomain)` on product/portfolio/spokeConfig updates. |
| SAN-007 | HIGH | Product schema missing 3 fields projected by `queries.ts:25-38`: `datasheetFile` (file), `relatedCertifications` (array of references), `seoMeta` (object). Type `Product` declares `seoMeta: SeoMeta` and `relatedCertifications: CertificationRef[]` as non-optional — runtime `null` violates type contract and will throw when components access `product.seoMeta.title`. | `studio/schemaTypes/product.ts` | Add `datasheetFile`, `relatedCertifications`, and `seoMeta` field definitions. |
| SAN-008 | HIGH | Portfolio schema missing 4 fields projected by `queries.ts:206-221`: `outcome` (text), `relatedSpoke` (reference to spokeConfig), `relatedProducts` (array of references), `seoMeta` (object). `PortfolioEntry` type declares `outcome: string` and `relatedProducts: ProductRef[]` as required — runtime `null` breaks type contract. | `studio/schemaTypes/portfolioEntry.ts` | Add `outcome`, `relatedSpoke`, `relatedProducts`, and `seoMeta` field definitions. |
| SAN-009 | HIGH | SpokeConfig schema missing `featuredProducts` field. `queries.ts:308` projects `featuredProducts->{_id, title, slug, shortDescription, images}` but schema has no such field. `SpokeConfigWithProducts.featuredProducts` is typed as non-optional array but runtime is `null`. Spoke landing pages that render featured products will crash or render empty. | `studio/schemaTypes/spokeConfig.ts:7` | Add `featuredProducts` as `array` of `reference` to `product`. |
| SAN-010 | WARNING | Stega source map enabled in Vercel preview (`VERCEL_ENV === 'preview'`). Preview deployments shared with stakeholders leak Sanity document IDs, field names, and studio URLs via stega encoding in rendered HTML. | `src/lib/api/sanity/client.ts:36` | Restrict stega to `NODE_ENV === 'development'` only, or gate behind authenticated preview cookie. |
| SAN-011 | WARNING | Webhook payload not Zod-validated. `JSON.parse(rawBody)` is unchecked. `_type` used in switch with `default: return []` but `_id` is never validated — crafted payload with arbitrary `_id` is passed to `CACHE_TAGS.product(payload._id)`. While `revalidateTag` is not path-traversal-vulnerable, lack of Zod validation is a defense-in-depth gap. | `src/app/api/revalidate/route.ts:106` | Add Zod schema for `SanityWebhookPayload` and `safeParse` before processing. Validate `_id` against `^[a-zA-Z0-9_-]+$`. |
| SAN-012 | WARNING | Browser-side Sanity token fallback. `env.ts:56` falls back to `'skDummyTokenForBrowser'` when `SANITY_API_READ_TOKEN` is unset in browser context. Dummy token is rejected by Sanity (no real leak), but if a developer accidentally prefixes the real token with `NEXT_PUBLIC_`, Next.js will inline it into client bundles. Schema validation does not prevent this. | `src/lib/config/env.ts:51-56` | Add build-time assertion that `process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN` is undefined. Document that read token must never be `NEXT_PUBLIC_`-prefixed. |
| SAN-013 | MEDIUM | `getAllSpokeConfigs` return type mismatch. Declared return type `SpokeConfig` (requires `featuredProducts`, `seoDefaults`, `heroImage`) but projection at line 350-357 omits these fields. Runtime objects do not satisfy `SpokeConfig`. Callers accessing `config.featuredProducts` will fail. | `src/lib/api/sanity/queries.ts:348` | Project all `SpokeConfig` fields, or change return type to `Pick<SpokeConfig, '_id'|'_type'|'name'|'subdomain'|'tagline'|'primaryColor'>`. |
| SAN-014 | MEDIUM | `revalidateTag(tag, 'max')` called with second argument. Next.js `revalidateTag` accepts only one argument (the tag string). `'max'` is silently ignored in current Next.js but may break on future versions. | `src/app/api/revalidate/route.ts:119` | Remove second argument: `revalidateTag(tag)`. |
| SAN-015 | MEDIUM | `spokeConfig.subdomain` validation accepts uppercase. `.lowercase()` only normalizes on input via Studio UI. API imports or direct data entry could store `PJU`. Queries `subdomain == $subdomain` will fail to match `PJU` vs `pju`. | `studio/schemaTypes/spokeConfig.ts:18` | Add `.regex(/^[a-z]+$/)` to enforce lowercase at schema level, or normalize in queries with `lowercase(subdomain) == $subdomain`. |
| SAN-016 | INFO | Revalidation time (3600s / 1h) is reasonable for a content CMS with infrequent updates. Combined with 1-year expire, provides good cache hit ratio. | `src/lib/api/sanity/queries.ts` (all queries) | No action needed. |
| SAN-017 | INFO | Cache tag strategy is well-structured: `sanity:{documentType}` and `sanity:{documentType}:{id}`. Tags registered for product, certification, portfolio, article, spoke, spokeConfig, page. | `src/lib/api/sanity/client.ts:47-58` | No action needed. |
| SAN-018 | INFO | Stega source map filter correctly excludes `url` fields from encoding (`encodeSourceMapAtPath`), preventing data leakage in URL fields like `datasheetUrl` and `documentUrl`. | `src/lib/api/sanity/client.ts:8-13` | No action needed. |

### Evidence

**Schema drift verification:**

Studio schema registration (`studio/schemaTypes/index.ts`):
```typescript
export const schemaTypes = [spokeConfig, product, portfolioEntry]  // 3 schemas
```

TypeScript types (`src/lib/api/sanity/types.ts`):
```typescript
export interface Product { _type: 'product' }           // has schema
export interface Certification { _type: 'certification' } // NO SCHEMA
export interface PortfolioEntry { _type: 'portfolioEntry' } // has schema
export interface SpokeConfig { _type: 'spokeConfig' }    // has schema
export interface Page { _type: 'page' }                  // NO SCHEMA
export interface Article { _type: 'article' }            // NO SCHEMA
```

GROQ queries in `queries.ts` reference all 6 types, but 3 will always return null/empty.

**GROQ reference dereference bug verification:**

| Query | Line | Filter Expression | Bug? |
|-------|------|-------------------|------|
| `getProductsBySpoke` | 51 | `spoke.subdomain == $subdomain` | **YES** — `spoke` is reference, needs `->` |
| `getProductSlugsWithSpokes` | 110 | (projection) `spoke->subdomain` | Correct (projection uses `->`) |
| `getPortfolioEntries` | 234 | `relatedSpoke.subdomain == $subdomain` | **YES** — `relatedSpoke` is reference |
| `getSpokeConfig` | 323 | `subdomain == $subdomain` | OK — `subdomain` is inline field |
| `getPageBySlug` | 401 | `targetSpoke.subdomain == $subdomain` | **YES** — `targetSpoke` is reference |

Per Sanity GROQ specification: in filter context, reference fields hold `{_ref, _type}` and dot-access yields `undefined`. The `->` operator is required to dereference and access fields on the referenced document. The codebase proves awareness of this pattern — `getProductSlugsWithSpokes` (line 110) correctly uses `spoke->subdomain` in its projection.

**Product schema field gap:**

| Field | In Schema? | In GROQ Projection? | In TypeScript Type? |
|-------|-----------|---------------------|---------------------|
| title | yes | yes | yes |
| slug | yes | yes | yes |
| spoke (reference) | yes | yes | yes |
| shortDescription | yes | yes | yes |
| fullDescription | yes | yes | yes |
| specifications | yes | yes | yes |
| images | yes | yes | yes |
| datasheetFile | NO | yes (as `datasheetUrl`) | yes (as `datasheetUrl?`) |
| relatedCertifications | NO | yes | yes (required array) |
| seoMeta | NO | yes | yes (required object) |

---

## Fix Priority Matrix

| Priority | Finding ID | Estimated Effort | Dependencies |
|----------|------------|------------------|--------------|
| **P0 (Block — must fix before any production deploy)** | SAN-001, SAN-002, SAN-003, SAN-004 | 2-3 days (create 3 schemas + fix 3 GROQ queries) | None — start immediately |
| **P0 (Block)** | CF-001, CF-002, CF-003 | 1 day (wrangler.toml + Cloudflare Dashboard secrets) | Cloudflare access |
| **P0 (Block)** | CF-004 | 0.5 day (set up GitHub Actions CI) | GitHub repo access |
| **P1 (High — fix before Phase B launch)** | V-004, V-005, V-006, V-007, V-008 | 2 days | None |
| **P1 (High)** | SAN-005, SAN-006, SAN-007, SAN-008, SAN-009 | 1.5 days | Depends on SAN-001 |
| **P1 (High)** | V-001, V-002, V-003 | 0.5 day | Fix 3 TS errors first |
| **P1 (High)** | CF-005, CF-009 | 0.5 day | None |
| **P2 (Medium — fix in next sprint)** | SAN-010, SAN-011, SAN-012, SAN-013, SAN-014, SAN-015 | 1 day | None |
| **P2 (Medium)** | V-009, V-010, V-011, CF-006, CF-007, CF-008 | 1 day | None |
| **P3 (Low — backlog)** | V-012, V-013, V-014 | 1 day | Phase B migration |
| **P3 (Low)** | SAN-016, SAN-017, SAN-018, V-015, V-016, V-017, V-018, CF-010, CF-011, CF-012 | 0 | No action needed |

---

## Recommendation for Fix Agent

### Execution Instructions

**Fix Agent Prompt:**

```
You are the DBSN Integration Fix Agent. Your task is to remediate the findings from the Integration Health Audit (2026-07-14) in priority order. The audit report is at docs/audits/integration-health-audit-2026-07-14.md.

CONSTRAINTS:
- Work in a new branch feat/integration-fixes (branch from feat/landing-redesign-pr3)
- Do NOT deploy to any target — fix code only, verify locally
- Do NOT modify .env files or Cloudflare Dashboard settings
- Do NOT access Sanity.io production data
- Run `pnpm build` and `pnpm test` after each P0 fix to verify no regressions

EXECUTE IN THIS ORDER:

## Phase 1: P0 Critical Fixes (must complete before any other work)

### 1.1 — Fix GROQ reference dereference bugs (SAN-002, SAN-003, SAN-004)
File: src/lib/api/sanity/queries.ts
- Line 51: Change `spoke.subdomain == $subdomain` to `spoke->subdomain == $subdomain`
- Line 234: Change `relatedSpoke.subdomain == $subdomain` to `relatedSpoke->subdomain == $subdomain`
- Line 401: Change `targetSpoke.subdomain == $subdomain` to `targetSpoke->subdomain == $subdomain`
- Verify: `pnpm build` still succeeds, spoke pages still generate

### 1.2 — Create missing Sanity schemas (SAN-001)
Files to create:
- studio/schemaTypes/certification.ts (fields: title, slug, certificationBody, certType [enum: SNI|TKDN|LKPP|ISO|Other], issueDate, expiryDate, documentFile [file], coverImage [image], isIndexable [boolean], seoMeta [object])
- studio/schemaTypes/page.ts (fields: title, slug, targetSpoke [reference to spokeConfig], sections [array of blocks], seoMeta [object])
- studio/schemaTypes/article.ts (fields: title, slug, category, excerpt, content [portable text], author, publishedAt, readingTime, seoMeta [object])
File to update:
- studio/schemaTypes/index.ts: import and register all 3 new schemas

### 1.3 — Add missing fields to existing schemas (SAN-007, SAN-008, SAN-009)
- studio/schemaTypes/product.ts: add `datasheetFile` (file), `relatedCertifications` (array of references to certification), `seoMeta` (object with title, description, ogImage)
- studio/schemaTypes/portfolioEntry.ts: add `outcome` (text), `relatedSpoke` (reference to spokeConfig), `relatedProducts` (array of references to product), `seoMeta` (object)
- studio/schemaTypes/spokeConfig.ts: add `featuredProducts` (array of references to product)

### 1.4 — Fix Cloudflare configuration (CF-001, CF-002, CF-003)
File: wrangler.toml
- Change NEXTAUTH_URL to "https://dayaberkah.id"
- Change SANITY_API_VERSION to "v2025-05-21"
- Add all public [vars]: NEXT_PUBLIC_SITE_URL, SENTRY_ORG, SENTRY_PROJECT, NEXT_PUBLIC_SENTRY_DSN, GSC_VERIFICATION_CODE, NEXT_PUBLIC_GSC_VERIFICATION, NEXT_PUBLIC_GA_TRACKING_ID, GA_TRACKING_ID, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST
- Document secrets that must be set via `wrangler pages secret put`: DATABASE_URL, NEXTAUTH_SECRET, SANITY_API_READ_TOKEN, SANITY_API_WRITE_TOKEN, SANITY_WEBHOOK_SECRET, RESEND_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SENTRY_AUTH_TOKEN, GSC_SERVICE_ACCOUNT_JSON, API_KEY_21ST
- Create a setup script (scripts/setup-cf-secrets.sh) documenting the wrangler secret put commands (do NOT run it)

### 1.5 — Set up Cloudflare Pages GitHub integration (CF-004)
- Create .github/workflows/cloudflare-pages.yml that runs `pnpm pages:build` on Linux runner
- Document in CLAUDE.md that local pages:build on Windows is unsupported

## Phase 2: P1 High Fixes

### 2.1 — Security headers (V-004)
File: next.config.ts
- Add `async headers()` export returning CSP (nonce-based), HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy

### 2.2 — Middleware auth validation (V-005)
File: src/middleware.ts
- Replace cookie presence check with `getToken()` from next-auth/jwt, or wrap middleware with Auth.js v5 `auth()` export

### 2.3 — Webhook security (V-006, SAN-005, SAN-006, SAN-011, SAN-014)
File: src/app/api/revalidate/route.ts
- Remove the `if (secret)` guard — require secret in all environments
- Add `case 'article':` to getTagsForDocumentType switch
- Add Zod schema for SanityWebhookPayload, safeParse before processing
- Include subdomain in webhook projection, revalidate spoke-specific cache tags
- Remove `revalidateTag(tag, 'max')` second argument

### 2.4 — Email HTML injection (V-007)
File: src/lib/api/notifications/resend.ts
- HTML-escape all lead fields (contactName, contactEmail, contactPhone, companyName, etc.) before interpolation

### 2.5 — Host header injection (V-008)
File: src/app/api/auth/forgot-password/route.ts
- Validate `host` against NEXT_PUBLIC_ROOT_DOMAIN allowlist before constructing resetUrl

### 2.6 — Build health (V-001, V-002, V-003)
- Fix 3 TypeScript errors: leaflet `this` typing, next-auth/jwt augmentation, @sanity/image-url named export
- Remove `typescript.ignoreBuildErrors: true` from next.config.ts
- Add `export const runtime = 'nodejs'` to /api/revalidate and /api/an-token routes
- Update image.test.ts mock to use named export

### 2.7 — Schema field alignment (SAN-007, SAN-008, SAN-009)
- Already addressed in Phase 1.3 — verify GROQ projections match new schema fields

## Phase 3: P2 Medium Fixes
- SAN-010: Restrict stega to NODE_ENV === 'development' only
- SAN-012: Add build-time assertion for NEXT_PUBLIC_SANITY_API_READ_TOKEN
- SAN-013: Fix getAllSpokeConfigs return type
- SAN-015: Add .regex(/^[a-z]+$/) to spokeConfig.subdomain validation
- V-009: Remove hardcoded 'dayaberkah.id' fallback in middleware config
- V-010: Increase RFQ test waitFor timeout
- V-011: Remove console.log from middleware
- CF-005: Conditional images.unoptimized based on CF_PAGES env
- CF-006: Update CLAUDE.md edge-runtime documentation
- CF-008: Remove stale Supabase env vars from .env.example

## Phase 4: P3 Low Fixes (backlog)
- V-012: Implement distributed rate limiting (Upstash Redis or CF KV)
- V-013: Prefer cf-connecting-ip over x-forwarded-for
- V-014: Throw at startup if Google OAuth creds missing

After each phase, run:
- `pnpm build` — must succeed with zero errors
- `pnpm test` — must pass 397/397 (or 48/48 suites)
- `npx tsc --noEmit` — must pass with zero errors (after V-001 fix)

Do NOT proceed to the next phase until all checks pass for the current phase.
```

### Post-Fix Verification Checklist

- [ ] `pnpm build` — zero errors, zero warnings (except deprecation warnings from third-party deps)
- [ ] `pnpm test` — 48 suites, 397 tests passed (fix 4 flaky RFQ test failures)
- [ ] `pnpm test:e2e` — 30/30 passed (fix 2 known failures: Hub heading mismatch, Dashboard 404)
- [ ] `pnpm pages:build` — Cloudflare edge compilation success (on Linux CI runner, not Windows)
- [ ] `npx tsc --noEmit` — zero TypeScript errors (after removing ignoreBuildErrors)
- [ ] Schema alignment — zero drift between Sanity studio (6 schemas) and TypeScript types (6 types)
- [ ] GROQ queries — all 3 reference filters use `->` dereference operator
- [ ] Webhook revalidation — handles all 6 document types (product, certification, portfolioEntry, spokeConfig, page, article)
- [ ] Security headers — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy all configured
- [ ] wrangler.toml — all public vars present, all secrets documented for `wrangler pages secret put`
- [ ] NEXTAUTH_URL — set to `https://dayaberkah.id` (not dashboard subdomain)
- [ ] SANITY_API_VERSION — aligned to `v2025-05-21` across wrangler.toml, .env.example, env.ts
- [ ] RFQ email notifications — all lead fields HTML-escaped
- [ ] Password reset URL — host header validated against allowlist
- [ ] Dashboard middleware — JWT validity checked (not just cookie presence)
- [ ] Stega source map — restricted to development only (not Vercel preview)
- [ ] Rate limiter — distributed backend configured for Cloudflare (KV or Upstash)

---

## Appendix: Agent Audit Summaries

### A1. Architect Agent — Cloudflare Migration Readiness
- 4 CRITICAL, 5 WARNING, 3 INFO
- Key finding: `wrangler.toml` missing 19+ env vars; `NEXTAUTH_URL` and `SANITY_API_VERSION` misconfigured; `pages:build` fails on Windows.
- Positive: Prisma correctly excluded from middleware; Neon serverless adapter is edge-compatible.

### A2. Security Reviewer Agent — Cross-Cutting Security
- 4 HIGH, 6 MEDIUM, 5 LOW
- Key finding: No security headers (CSP/HSTS); webhook signature bypass in non-production; dashboard middleware only checks cookie presence; HTML injection in Resend emails.
- Positive: RFQ route uses Zod validation; bcrypt cost 12; no `child_process` usage; no secrets in `wrangler.toml [vars]`.

### A3. Code Reviewer Agent — Sanity Integration
- 4 CRITICAL, 5 HIGH, 3 MEDIUM, 2 LOW
- Key finding: 3 schemas missing from Studio; 3 GROQ queries have reference dereference bugs (`.` instead of `->`); webhook missing `article` case; spoke cache tags never invalidated.
- Positive: Cache tag strategy well-structured; stega filter excludes URL fields.

### A4. Build Error Resolver Agent — Build Health
- 2 HIGH, 2 MEDIUM, 4 LOW, 2 INFO
- Key finding: `ignoreBuildErrors: true` hides 3 real TS errors; `@sanity/image-url` deprecated; 2 API routes missing runtime export; RFQ test failures are flaky (React 19 + userEvent race).
- Positive: Build succeeds (43 pages); on clean re-run, all 397 tests pass; Prisma `pregenerate` script mitigates Windows EPERM.

---

*Audit completed: 2026-07-14*
*Next step: User review → approve fix agent execution → begin Phase 1 P0 fixes*
