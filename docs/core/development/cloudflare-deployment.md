# Cloudflare Pages Deployment Guide

This guide details the deployment pipeline, custom domain routing, and environment configurations for the DBSN central Next.js application on Cloudflare Pages.

## Deployment Architecture

The application is built and compiled into a worker and static assets using `@cloudflare/next-on-pages`. It routes requests dynamically at the edge based on hostnames.

```
                  ┌──────────────────────┐
                  │   Cloudflare Edge    │
                  └──────────┬───────────┘
                             │ (Custom Domains CNAME)
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  dayaberkah.id       pju.dayaberkah.id    dashboard.dayaberkah.id
  (Hub Router)          (Spoke Router)     (Secure Tracking Portal)
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
                 ┌───────────────────────┐
                 │ Cloudflare Pages App  │
                 │   (next-on-pages)     │
                 └───────────────────────┘
```

---

## 1. Custom Domains Setup

The hub-and-spoke routing maps 6 domains to a single Cloudflare Pages deployment.

### A. Subdomain Mapping Table

| Subdomain Hostname | Route Group Mapped | Purpose |
|--------------------|--------------------|---------|
| `dayaberkah.id` (apex) | `/(hub)` | Corporate trust hub site |
| `www.dayaberkah.id` | `/(hub)` | Corporate trust hub site alias |
| `pju.dayaberkah.id` | `/(spokes)/pju` | Product spoke for PJU Street Lights |
| `solarcell.dayaberkah.id` | `/(spokes)/solarcell` | Product spoke for Solar Cells |
| `alatpetir.dayaberkah.id` | `/(spokes)/alatpetir` | Product spoke for Lightning Protection |
| `baterai.dayaberkah.id` | `/(spokes)/baterai` | Product spoke for Batteries |
| `dashboard.dayaberkah.id` | `/(dashboard)` | Secure authenticated client portal |

### B. DNS CNAME Configuration

For each subdomain, configure a `CNAME` record in your Cloudflare DNS zone:

1. **Type**: `CNAME`
2. **Name**: (e.g., `pju`, `solarcell`, `dashboard`, or `@` for apex)
3. **Target**: Your Cloudflare Pages URL (e.g., `dayaberkah.pages.dev`)
4. **Proxy status**: **Proxied** (orange cloud enabled) - required for edge middleware headers execution.

---

## 2. Environment Variables & Secrets Configuration

All environments variables from `.env.example` must be set up in Cloudflare to enable build-time and runtime executions.

### Setup Steps in Dashboard:
1. Navigate to **Workers & Pages** > Select your project `dayaberkah`.
2. Go to **Settings** > **Variables and Secrets**.
3. Add the following variables under both **Production** and **Preview** environments:

| Key | Example Value / Setup | Description |
|-----|----------------------|-------------|
| `NEXT_PUBLIC_ROOT_DOMAIN` | `dayaberkah.id` | Root domain for extracting subdomains |
| `NEXTAUTH_URL` | `https://dayaberkah.id` | NextAuth callback base URL |
| `SANITY_PROJECT_ID` | `3h4k8dye` | Sanity project identifier |
| `SANITY_DATASET` | `production` | Active Sanity dataset name |
| `SANITY_API_VERSION` | `v2026-05-21` | Version for queries |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` | Email verified sender |
| `TELEGRAM_CHAT_ID` | `-1001234567890` | Notification chat ID |
| `WHATSAPP_SALES_NUMBER` | `6281234567890` | Dev / fallback whatsapp prefill |

> [!CAUTION]
> **Secrets**: Add the following keys as **Encrypted Secrets** to prevent access or leaks:
> - `DATABASE_URL` (Neon Postgres URL)
> - `NEXTAUTH_SECRET` (JWT Token encoder)
> - `SANITY_API_READ_TOKEN` (Sanity client auth)
> - `RESEND_API_KEY` (Email provider token)
> - `TELEGRAM_BOT_TOKEN` (Telegram alert sender)
> - `SUPABASE_ACCESS_TOKEN` / `SUPABASE_PROJECT_REF`

---

## 3. Local Development & Build Command Workflow

Before shipping changes, build and run previews locally using `wrangler`.

### A. Local Build Step
Compiles Next.js app to Pages-compatible format:
```bash
pnpm pages:build
```
*Outputs compiled assets to `.vercel/output/static`.*

### B. Local Preview Step
Spawns a mock wrangler server simulating Pages edge environment:
```bash
pnpm pages:preview
```
*Served at `http://localhost:8788`. You can test subdomains by editing your local `/etc/hosts` file (e.g. mapping `pju.lvh.me` to `127.0.0.1` and loading `http://pju.lvh.me:8788`).*

### C. Manual Deployment Step
Deploys the static assets directly using wrangler:
```bash
pnpm pages:deploy
```
*Uploads `.vercel/output/static` directly to Cloudflare Pages.*
