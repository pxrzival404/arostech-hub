---
id: RUN-DEP-001
title: Greenfield Cloudflare Pages Deployment Runbook
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_ops"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L35"
  security_policy: "file:///d:/dev/arostech-hub/docs/operations/security/security-policy.md#L1-L35"
  dns_cutover: "file:///d:/dev/arostech-hub/docs/operations/runbooks/dns-cutover.md#L1-L35"
---

# Greenfield Cloudflare Pages Deployment Runbook

> **Authoritative Baseline Reference**: This runbook documents build commands, environment variable schemas, edge configuration, and deployment pipelines for the **DBSN Centralized Digital Ecosystem** on Cloudflare Pages, adhering strictly to PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L35)).

---

## OpenSpec Delta (M3 / SQ-OPS)

### [ADDED]
- Declarative Zod schema (`DeploymentEnvConfigSchema`) for production environment variables and encrypted secret validation.
- Mandatory Edge runtime verification step using `wrangler pages dev` preview isolate.
- OpenSpec Behavioral Contracts (`REQ-DEP-001-BUILD-PIPELINE`, `REQ-DEP-002-ENVIRONMENT-BINDINGS`, `REQ-DEP-003-PREVIEW-VERIFICATION`).

### [MODIFIED]
- Locked build pipeline strictly to `@cloudflare/next-on-pages` with static output targeted to `.vercel/output/static`.
- Updated domain mapping to 7 canonical hostnames anchored to Cloudflare Pages `dayaberkah.pages.dev`.

### [REMOVED]
- Eliminated all legacy database, in-memory caching, and redirect engine migration notes.

---

## 1. Deployment Architecture & Domain Topology

The greenfield platform compiles a single Next.js 16 application via `@cloudflare/next-on-pages` and deploys it to Cloudflare Pages edge network. Incoming HTTP requests SHALL be processed by Edge Middleware and routed across 7 canonical hostnames.

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

### Domain & Route Mapping Table

| Subdomain Hostname | App Router Mapping | Surface Type |
|--------------------|--------------------|--------------|
| `dayaberkah.id` (apex) | `(hub)` | Corporate trust hub site |
| `www.dayaberkah.id` | `(hub)` | Apex alias |
| `pju.dayaberkah.id` | `(spokes)/pju` | Product spoke: Street Lighting |
| `solarcell.dayaberkah.id` | `(spokes)/solarcell` | Product spoke: Solar Cell Systems |
| `alatpetir.dayaberkah.id` | `(spokes)/alatpetir` | Product spoke: Lightning Protection |
| `baterai.dayaberkah.id` | `(spokes)/baterai` | Product spoke: Energy Storage |
| `dashboard.dayaberkah.id` | `dashboard/` | Flat route: Client Tracking Portal |

---

## 2. Environment Variable Schema & Encrypted Secrets

### Requirement: REQ-DEP-002-ENVIRONMENT-BINDINGS
All production environment variables MUST conform to `DeploymentEnvConfigSchema` and SHALL be configured in Cloudflare Dashboard under **Workers & Pages > Settings > Variables and Secrets**.

#### Scenario: Production Variable and Secret Injection
- GIVEN a new Cloudflare Pages deployment environment
- WHEN configuring environment bindings
- THEN all required public variables and encrypted secrets MUST validate against `DeploymentEnvConfigSchema` before execution.

### Declarative Environment Schema

```typescript
import { z } from 'zod';

export const DeploymentEnvConfigSchema = z.object({
  // Public Variables
  NEXT_PUBLIC_ROOT_DOMAIN: z.literal('dayaberkah.id'),
  NEXTAUTH_URL: z.string().url().default('https://dayaberkah.id'),
  SANITY_PROJECT_ID: z.string().min(1),
  SANITY_DATASET: z.string().default('production'),
  SANITY_API_VERSION: z.string().default('v2025-05-21'),
  RESEND_FROM_EMAIL: z.string().email(),
  TELEGRAM_CHAT_ID: z.string(),
  WHATSAPP_SALES_NUMBER: z.string(),

  // Encrypted Production Secrets
  DATABASE_URL: z.string().startsWith('postgresql://'),
  DIRECT_URL: z.string().startsWith('postgresql://'),
  NEXTAUTH_SECRET: z.string().min(32),
  SANITY_API_READ_TOKEN: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
});

export type DeploymentEnvConfig = z.infer<typeof DeploymentEnvConfigSchema>;
```

### Public & Standard Variables
| Key | Mandatory Value | Description |
|-----|-----------------|-------------|
| `NEXT_PUBLIC_ROOT_DOMAIN` | `dayaberkah.id` | Root domain for subdomain extraction |
| `NEXTAUTH_URL` | `https://dayaberkah.id` | Auth.js callback base URL |
| `SANITY_PROJECT_ID` | `3h4k8dye` | Sanity CMS project identifier |
| `SANITY_DATASET` | `production` | Active Sanity dataset |
| `SANITY_API_VERSION` | `v2025-05-21` | Locked Sanity API version |
| `RESEND_FROM_EMAIL` | `noreply@dayaberkah.id` | Verified transactional email sender |
| `TELEGRAM_CHAT_ID` | `-1001234567890` | Internal sales alerts channel ID |
| `WHATSAPP_SALES_NUMBER` | `6281330066767` | Fallback WhatsApp contact |

### Encrypted Production Secrets
The following credentials MUST be injected exclusively as **Encrypted Secrets** via Wrangler CLI or Cloudflare UI:
- `DATABASE_URL` (Neon Postgres pooled connection string)
- `DIRECT_URL` (Neon Postgres direct connection string for migrations)
- `NEXTAUTH_SECRET` (JWT encryption secret)
- `SANITY_API_READ_TOKEN` (Sanity content reader token)
- `RESEND_API_KEY` (Resend email API key)
- `TELEGRAM_BOT_TOKEN` (Telegram alert bot token)

---

## 3. Build & Deployment Commands

### Requirement: REQ-DEP-001-BUILD-PIPELINE
The deployment pipeline SHALL build the Next.js application using `@cloudflare/next-on-pages` and output static assets to `.vercel/output/static`.

#### Scenario: Production Build & Deploy Execution
- GIVEN a clean working directory on `refactor/reorganize-project-documentation`
- WHEN executing the build command `pnpm pages:build` followed by `pnpm pages:deploy`
- THEN the static assets MUST compile without type errors and deploy to Cloudflare Pages.

### Requirement: REQ-DEP-003-PREVIEW-VERIFICATION
The engineering team MUST verify edge compilation locally using Wrangler preview before promoting builds to production.

#### Scenario: Local Edge Preview Verification
- GIVEN a completed local build in `.vercel/output/static`
- WHEN running `pnpm pages:preview`
- THEN the application MUST serve locally via Wrangler edge isolate without throwing unhandled runtime exceptions.

```bash
# 1. Local Type Check & Build
pnpm pages:build

# 2. Local Preview Verification (Simulates Cloudflare Edge)
pnpm pages:preview

# 3. Production Deploy to Cloudflare Pages
npx wrangler pages deploy .vercel/output/static --project-name dayaberkah
```

---

## 4. GRAPHIFY ANCHORING & REFERENCES

- Knowledge Graph Node ID: `doc:docs/operations/runbooks/deployment.md`
- Graphify Community: `community_ops`
- Security Policy: [`security-policy.md`](file:///d:/dev/arostech-hub/docs/operations/security/security-policy.md#L1-L35)
- DNS Cutover Runbook: [`dns-cutover.md`](file:///d:/dev/arostech-hub/docs/operations/runbooks/dns-cutover.md#L1-L35)
