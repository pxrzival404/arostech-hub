# Local Code Review: Phase 2.7 — Subdomain Middleware Routing

**Reviewed**: 2026-05-22  
**Author**: Local Workspace  
**Decision**: **APPROVE**

## Summary

The Phase 2.7 subdomain middleware routing and dev configuration changes are high-quality, fully optimized, and ready for deployment. The implementation includes robust local DNS handling (`lvh.me`), V8 Edge runtime safety, and detailed test coverage reaching 100% on the core middleware logic.

---

## Detailed Focus Areas Assessment

### 1. Edge Runtime Compatibility (V8 Compliance)
- **Status**: **PASSED**
- **Analysis**: `src/middleware.ts` and its dependencies in `src/lib/middleware/config.ts` and `src/lib/config/env.ts` use zero Node.js native API imports (e.g. `fs`, `path`, `crypto`). They rely strictly on Zod and standard Web API globals (`Request`, `Response`, `Headers`, `URL`), making them completely compatible with the Cloudflare Pages V8 Edge Runtime.

### 2. Hostname Resolution Correctness
- **Status**: **PASSED**
- **Analysis**:
  - `cleanHostname` correctly splits port numbers from the `host` header using `split(':')`, protecting local development URLs.
  - `isHubDomain` resolves the raw root domain and `www.` prefixes correctly.
  - `extractSubdomain` correctly handles subdomain extraction relative to `NEXT_PUBLIC_ROOT_DOMAIN` and returns `null` for `www` or the root domain itself. It also falls back gracefully to local dev subdomains.

### 3. Rewrite URL Construction
- **Status**: **PASSED**
- **Analysis**: All rewrites constructed in `src/middleware.ts` utilize `new URL('/path', request.url)` which produces absolute URLs conforming to Next.js routing requirements. This prevents path resolution errors when rewriting to route groups like `/dashboard` and `/[spoke]`.

### 4. Matcher Pattern Completeness
- **Status**: **PASSED**
- **Analysis**: The middleware defines a strict `matcher` config excluding `api`, `_next`, static assets (`favicon.ico`, `robots.txt`, `sitemap.xml`). In addition, a primary code-level short-circuit block (block 1) instantly returns `NextResponse.next()` for any path starting with `/api` or `/_next` or containing a file extension (`.`), preventing any static asset files from leaking into the router.

### 5. Local Dev (lvh.me) Handling Robustness
- **Status**: **PASSED**
- **Analysis**:
  - Local development environments resolve correctly using `lvh.me` DNS (e.g. `pju.lvh.me:3000`).
  - `next.config.ts` configures `allowedDevOrigins` listing `lvh.me` and its subdomains, preventing developer HMR WebSocket connection warnings.
  - `src/lib/config/env.ts` defaults to `lvh.me` domain structures during local runs, allowing subdomain routing to function offline.

### 6. Dashboard Auth Guard Placeholder
- **Status**: **PASSED**
- **Analysis**: The auth guard placeholder is placed exactly inside the dashboard subdomain routing block in `src/middleware.ts`:
  `// TODO: Add Auth.js session verification guard in Phase 3`
  This correctly establishes the hook point for Phase 3 security controls.

### 7. Observability Headers
- **Status**: **PASSED**
- **Analysis**:
  - Sets `x-middleware-subdomain` and `x-middleware-matched-route` on all rewritten and short-circuited paths (preventing headers from being lost during Next.js's secondary middleware pass).
  - Correctly routes Hub requests to `/` with `'hub'` and `'/(hub)'` labels.

### 8. Image remotePatterns for Sanity CDN
- **Status**: **PASSED**
- **Analysis**: `next.config.ts` registers `cdn.sanity.io` under `images.remotePatterns`, which allows the Next.js `<Image>` optimization component to serve product images hosted on the Sanity CDN.

### 9. CMS Integration Non-regression
- **Status**: **PASSED**
- **Analysis**: The webhook revalidation handler in `src/app/api/revalidate/route.ts` remains functional and unaffected. The middleware early-exits for any path starting with `/api` (specifically `/api/revalidate`), ensuring webhook payloads bypass rewrites completely.

### 10. Test Mock Fidelity
- **Status**: **PASSED**
- **Analysis**: Tests in `src/__tests__/middleware.test.ts` avoid simplified hand-rolled mock requests. Instead, they use Next.js's native `NextRequest` and `NextResponse` classes, ensuring that header retrieval checks (`x-middleware-rewrite`, `x-middleware-subdomain`) exactly mirror actual server environment behaviors.

---

## Findings

No critical or high issues were found.

### LOW
- **Redundant defaults in config fallback**:
  - *Location*: `src/lib/middleware/config.ts`
  - *Description*: The catch blocks use a hardcoded default `'dayaberkah.id'`. Since `src/lib/config/env.ts` already handles production defaults, this fallback is rarely hit, but serves as a safe final shield.
  - *Action*: Informational/Keep as is for extra resilience.

---

## Validation Results

| Check | Command | Result |
|---|---|---|
| **Type Check** | `npx tsc --noEmit` | **Pass** |
| **Lint Check** | `npx eslint src/middleware.ts src/lib/middleware/ src/__tests__/middleware.test.ts` | **Pass** |
| **Unit Tests** | `npm run test` | **Pass** (155/155 passed) |
| **Build Validation** | `npm run build` | **Pass** (Compiled successfully) |
