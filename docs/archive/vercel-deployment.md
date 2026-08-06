> [!CAUTION]
> **Archived 2026-07-21.** Vercel deployment is deprecated per [ADR-0001](../adr/0001-migrate-fully-to-cloudflare-pages.md). Staging and production both run on Cloudflare Pages. This document is retained for historical reference only — the runtime, env vars, and routing behavior described here no longer apply. See [../core/development/cloudflare-deployment.md](../core/development/cloudflare-deployment.md) for the active guide.

# Vercel Deployment Guide (Testing Phase)

**Purpose:** Deployment reference for the Vercel testing phase
**Status:** Active — Current deployment at `dbsn-test01.vercel.app`
**Phase:** Development Phase A (pre-production)

---

## Overview

The DBSN website is currently deployed on Vercel for testing and preview
purposes. This is a temporary deployment before migrating to the production
target: Cloudflare Pages at `dayaberkah.id`.

### Why Vercel First?
- Faster iteration during development
- Native Next.js support without adapter (`@cloudflare/next-on-pages`)
- Free preview deployments on every git push
- No custom domain or DNS configuration needed for Hub testing

---

## Deployment URL

| Environment | URL | Purpose |
|---|---|---|
| Production Preview | `dbsn-test01.vercel.app` | Hub website testing |
| Branch Previews | `{branch}-{hash}.vercel.app` | Per-branch previews |
| Local Development | `localhost:3000` | Local dev server |
| Local Subdomains | `lvh.me:3000` | Subdomain routing testing |

---

## How to Deploy

### Automatic (Recommended)
1. Push to the `main` branch: `git push origin main`
2. Vercel auto-deploys from the GitHub repository.
3. Preview at `dbsn-test01.vercel.app`.

### Manual (Vercel CLI)
```bash
pnpm exec vercel --prod
```

---

## Environment Variables

Set these in the Vercel Dashboard under
**Settings > Environment Variables**:

| Variable | Required | Example | Notes |
|---|---|---|---|
| `SANITY_PROJECT_ID` | Yes | `3h4k8dye` | Sanity CMS project |
| `SANITY_DATASET` | Yes | `production` | Sanity dataset |
| `SANITY_API_VERSION` | Yes | `v2026-05-21` | API version |
| `SANITY_API_READ_TOKEN` | Yes | `sk...` | **Encrypted** |
| `DATABASE_URL` | Optional | `postgresql://...` | Neon Postgres (for redirects) |
| `NEXTAUTH_SECRET` | Optional | `...` | JWT encoder (for dashboard) |
| `NEXTAUTH_URL` | Optional | `https://dbsn-test01.vercel.app` | Auth callback |
| `SENTRY_AUTH_TOKEN` | Optional | `...` | Error tracking |
| `SENTRY_ORG` | Optional | `pt-daya-berkah-sentosa-nusanta` | Sentry org |
| `SENTRY_PROJECT` | Optional | `javascript-nextjs` | Sentry project |

> **Note:** Variables marked "Optional" are for features not yet
> active in the testing phase. The website will function without them.

---

## Known Limitations (vs. Production)

| Feature | Vercel Testing | Cloudflare Production |
|---|---|---|
| Hub pages | ✅ Works | ✅ Will work |
| Spoke subdomains | ❌ Requires custom domain | ✅ Via CNAME records |
| Dashboard | ❌ Requires custom domain | ✅ Via CNAME records |
| 301 Redirects | ⚠️ Requires DATABASE_URL | ✅ Full support |
| Edge Runtime | ⚠️ Partial (see Known Issues) | ✅ Native Workers |
| Custom domain | ❌ Not configured | ✅ dayaberkah.id |

---

## Known Issues

### Only 1 Page Displays
The Hub currently shows only the homepage. Clicking navigation links
results in blank pages or errors. See the troubleshooting section in
[local-setup.md](../core/development/local-setup.md#troubleshooting) for root
cause analysis and fix instructions.

---

## Relationship to Cloudflare Deployment

This guide is for the **testing phase only**. The production deployment
target is Cloudflare Pages. See [cloudflare-deployment.md](../core/development/cloudflare-deployment.md)
for the production deployment guide.

**Migration checklist** (for when Vercel → Cloudflare migration happens):
- [ ] All Phase 4 Quality Gates passed
- [ ] Custom domain `sentradaya.com` configured on Cloudflare
- [ ] DNS CNAME records for all subdomains
- [ ] Environment variables migrated to Cloudflare Dashboard
- [ ] `pnpm pages:build` succeeds with `@cloudflare/next-on-pages`
- [ ] Edge Runtime compatibility verified

---

*Last modified: 2026-06-10*