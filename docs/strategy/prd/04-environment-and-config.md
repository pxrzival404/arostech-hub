---
id: PRD-MOD-04
title: "PRD Module 04: Environment Configuration, SEO Engine & Resilience"
version: 4.0.0
status: LOCKED_BASELINE
architecture: Hub-and-Spoke Greenfield
target_domain: dayaberkah.id
graphify_community: "community_prd"
authoritative_references:
  config_schema: "file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md"
  runbook_deploy: "file:///d:/dev/arostech-hub/docs/operations/runbooks/deployment.md"
---

# PRD Module 04: Environment Configuration, SEO Engine & Resilience

> **TL;DR**: Defines runtime environment variables, Cloudflare Pages Wrangler secrets, feature flags, native Greenfield SEO architecture, notification pipelines, and emergency rollback procedures.

---

## 1. Environment Variables & Runtime Secrets

All configuration MUST align with [`configuration-schema.md`](file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md).

### 1.1 Required Runtime Variables
```bash
# Neon Postgres Database
DATABASE_URL="postgresql://user:pass@host/db"
DIRECT_URL="postgresql://user:pass@host/db"

# Auth.js v5 Session Secrets
NEXTAUTH_SECRET="min-32-character-secret"
NEXTAUTH_URL="https://dayaberkah.id"

# Sanity.io CMS
SANITY_PROJECT_ID="your-project-id"
SANITY_DATASET="production"
SANITY_API_READ_TOKEN="sanity-read-token"

# Operational Notifications
RESEND_API_KEY="resend-api-key"
TELEGRAM_BOT_TOKEN="telegram-bot-token"
TELEGRAM_CHAT_ID="telegram-chat-id"
```

### 1.2 Cloudflare Pages Secret Binding
```bash
npx wrangler pages secret put DATABASE_URL
npx wrangler pages secret put NEXTAUTH_SECRET
npx wrangler pages secret put RESEND_API_KEY
npx wrangler pages secret put TELEGRAM_BOT_TOKEN
npx wrangler pages secret put TELEGRAM_CHAT_ID
```

---

## 2. Greenfield Search Engine Architecture

The platform SHALL operate without legacy 301 redirect tables, using Next.js 16 native features:
- **Canonical URLs**: Generated per page via `metadata.alternates.canonical`.
- **Dynamic XML Sitemaps**: Rendered by `sitemap.ts` for root domain and each spoke subdomain.
- **Robots Directives**: Rendered by `robots.ts` — allows indexing of marketing pages while blocking `/api/*` and disallowing `dashboard.dayaberkah.id`.
- **Schema.org Structured Data**: Embeds JSON-LD for Organization, Product, Offer, and BreadcrumbList.

---

## 3. Graceful Fallback & Resilience

When Neon Postgres or network outages interrupt RFQ submission:
1. Retry with exponential backoff up to 3 times.
2. If retries fail, render the **Graceful Fallback UI** presenting a pre-filled WhatsApp click-to-chat URL carrying the user's form inputs.
3. Dispatch a background failure alert to the sales Telegram channel.
4. Target: 0% unrecoverable lead loss.

---

## 4. Rollback Plan

### 4.1 Trigger Conditions
- Production uptime < 99.5% for > 1 hour.
- 5xx error rate > 5% on critical conversion routes.
- Severe security breach or data isolation failure.

### 4.2 Rollback Execution
- **Authority**: Pramono (Product Owner).
- **Execution**: Instant rollback via Cloudflare Pages deployment history or `wrangler pages deployment rollback`.

---

## 5. OpenSpec Behavioral Contracts

### Requirement: REQ-CONFIG-001-ZERO-UNAUTHENTICATED-SECRETS
No sensitive API keys or credentials SHALL be exposed in client-side bundles or repository source control.

#### Scenario: Client bundle security inspection
- GIVEN a Next.js production build output
- WHEN inspecting client JS bundles
- THEN no instances of `DATABASE_URL`, `NEXTAUTH_SECRET`, or `RESEND_API_KEY` MUST be present.
