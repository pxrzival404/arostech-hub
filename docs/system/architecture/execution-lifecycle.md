# Subdomain Routing & Middleware Architecture

This document describes the subdomain-based routing architecture for the DBSN platform, how it maps request hostnames to Next.js route groups internally, and the Cloudflare Pages deployment patterns and lessons learned.

---

## 1. Subdomain Mapping System

PT Daya Berkah Sentosa Nusantara uses a multi-tenant hub-and-spoke domain routing model. The routing logic runs inside the Next.js Middleware (on the Edge Runtime via `@cloudflare/next-on-pages`) and maps hostnames to internal Next.js Route Groups as follows:

| Hostname Variation | Clean Domain Class | Target Route Group / Path | Subdomain Header |
|--------------------|--------------------|---------------------------|------------------|
| `dayaberkah.id` / `www.dayaberkah.id` | Hub Domain | `(hub)` (Transparent Root) | `hub` |
| `dashboard.dayaberkah.id` | Dashboard Subdomain | `/dashboard` | `dashboard` |
| `[spoke].dayaberkah.id` | Spoke Subdomain | `/(spokes)/[spoke]` (Dynamic Route) | `[spoke]` |

---

## 2. Route Groups & Folder Structure

The `src/app` directory is structured to isolate these three domain zones while sharing common UI components, hooks, and types:

```
src/app/
├── (hub)/                  # Transparent route group for the main hub pages
│   ├── page.tsx            # Hub Homepage (dayaberkah.id/)
│   ├── about/              # Hub About (dayaberkah.id/about)
│   ├── contact/            # Hub Contact (dayaberkah.id/contact)
│   ├── products/           # Hub Products
│   ├── certifications/     # Hub Certifications
│   ├── faq/                # Hub FAQ
│   ├── portfolio/          # Hub Portfolio
│   └── articles/           # Hub Articles
├── (spokes)/               # Route group for individual spoke pages
│   └── [spoke]/            # Dynamic route segment matching spoke name (e.g. pju, solarcell)
│       ├── page.tsx        # Spoke Homepage (pju.dayaberkah.id/)
│       ├── products/       # Spoke Products Catalog
│       └── portfolio/      # Spoke Portfolio
├── dashboard/              # Route group for admin dashboard pages
│   ├── page.tsx            # Dashboard home (dashboard.dayaberkah.id/)
│   └── login/              # Login pages
├── layout.tsx              # Root HTML layout (shared)
└── globals.css             # Global styles
```

---

## 3. Redirect Engine & Edge Runtime Offloading

To ensure high performance and comply with Cloudflare Pages Edge worker limits:
1. **No Direct Database Queries in Middleware**: Importing the Prisma client in middleware causes the bundler to compile Prisma database engines into the Edge Function bundle, bloating its size and causing Edge deployment errors.
2. **Serverless API Loopback**: We offload all database-driven redirect lookups to a standard serverless route at `/api/redirects/lookup`. The Edge middleware fetches the redirect target from this API route via `fetch()`, keeping the Edge Function bundle size minimal.
3. **Deadlock Prevention (AbortController)**: When running Next.js locally in development mode (which operates single-threaded), a loopback `fetch()` inside the middleware can cause a deadlock. We prevent this by enforcing a **2-second timeout** using `AbortController`:
   ```typescript
   const controller = new AbortController()
   const timeoutId = setTimeout(() => controller.abort(), 2000)
   const response = await fetch(url, { signal: controller.signal })
   clearTimeout(timeoutId)
   ```

---

## 4. Cloudflare Pages Edge Routing Caveats & Anti-Patterns

### ❌ Anti-Pattern: Explicit Rewrites to Transparent Route Groups
Rewriting requests on the Hub domain explicitly to their route group folder (e.g. `NextResponse.rewrite(new URL('/(hub)/about', request.url))`) is an **anti-pattern**.
- **Reason**: Next.js route groups (parentheses directories like `(hub)`) are transparent. During `@cloudflare/next-on-pages` edge compilation, they are compiled away from routing manifests. Explicitly rewriting to `/(hub)` causes Cloudflare Pages edge routing to return a `404 Not Found` in production.
- **Solution**: Return `NextResponse.next()` for Hub domain requests. Next.js will naturally and transparently map the request path (e.g., `/about`) to `(hub)/about/page.tsx`. Custom metadata headers (such as `x-middleware-subdomain`) can be attached directly to the pass-through response.

### ❌ Anti-Pattern: Loose 404 Rewrites
Rewriting directly to `/404` inside the middleware when a nonexistent path or spoke path is requested on the Hub domain (e.g., `dayaberkah.id/pju`) is an **anti-pattern**.
- **Reason**: Because Next.js contains a root-level dynamic route `/[spoke]`, rewriting to `/404` matches the dynamic segment, resolving to `/[spoke]` (with `spoke = '404'`) and returning a `200 OK` page instead of a `404 Not Found` status.
- **Solution**: Return `new NextResponse(null, { status: 404 })` directly from the middleware to short-circuit the routing tree and immediately return a true `404` HTTP status.

---

## 5. Troubleshooting Deployment Issues

### ⚠️ Issue: `ERR_PNPM_OUTDATED_LOCKFILE` during Build
- **Symptom**: Cloudflare Pages build fails with an error message indicating `pnpm-lock.yaml` is not up-to-date with `package.json`.
- **Cause**: Project dependencies were added or updated in `package.json` without updating the lockfile.
- **Resolution**: Run `pnpm install` locally to update the lockfile, verify changes with git, and commit the updated lockfile before pushing.

### 开启 ⚠️ Issue: Cloudflare Edge Worker Size Limit Exceeded
- **Symptom**: Deployment fails at the build stage with an error stating the Edge bundle size limit has been exceeded.
- **Cause**: Standard Node.js packages (specifically Prisma or heavy database/native libraries) are imported inside `src/middleware.ts` or its dependencies.
- **Resolution**: Move all database-centric logic to standard route API handlers (e.g., `/api/redirects/lookup`) and make a loopback `fetch()` from the middleware.

### ⚠️ Issue: Local Development Dev Server Deadlocks
- **Symptom**: Running `pnpm dev` causes the local server to hang indefinitely when loading page routes.
- **Cause**: Next.js development server is single-threaded; calling a local API route using `fetch()` from inside the middleware blocks the single thread, resulting in a deadlock.
- **Resolution**: Enforce a short timeout (maximum 2000ms) on all loopback requests using `AbortController` signal to allow graceful fallback when the target API handler is blocked.

### ⚠️ Issue: 404 Page Not Found on Hub Domain pages in Production
- **Symptom**: The homepage (`/`) or hub pages (`/about`, `/contact`) load correctly locally but return 404 on Cloudflare Pages preview/production domains.
- **Cause**: Middleware is explicitly rewriting the path to the internal route group `/(hub)` (e.g. `NextResponse.rewrite('/(hub)/about')`). Since route groups are transparent, they do not exist in Cloudflare Pages' production routing table.
- **Resolution**: Change the middleware return value to `NextResponse.next()` for the Hub domain. Let Next.js handle the transparent route group mapping naturally.
