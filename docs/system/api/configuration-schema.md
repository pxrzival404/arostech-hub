---
id: API-CFG-SCHEMA-001
title: Environment Variables & Deployment Configuration Schema Reference
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_api"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md#L1-L100"
  overview: "file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L28-L38"
---

# Environment Variables & Deployment Configuration Schema Reference

> **TL;DR**: Authoritative specification and architectural reference for Environment Variables & Deployment Configuration Schema Reference within the DBSN platform (docs/system/api/configuration-schema.md).


> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Baseline Sync`  
> **Authoritative Baseline Reference**: This document defines the canonical environment variables, data validation schemas, and deployment binding rules for the **DBSN Centralized Digital Ecosystem**, adhering to PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/api/configuration-schema.md`

---

## OpenSpec Delta

- `MODIFIED`: Standardized runtime environment schema with Zod type enforcement for Cloudflare Pages Edge execution.
- `REMOVED`: Eliminated all legacy database tokens, legacy caching credentials, and legacy external API keys.

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-SYS-CFG-001 Deployment Environment Validation
The application runtime SHALL validate all active environment variables at startup using `DeploymentEnvConfigSchema`. If any required secret or parameter is missing or invalid, the build or runtime execution MUST fail immediately with descriptive error logging.

#### Scenario: Valid Production Runtime Environment
- GIVEN a Cloudflare Pages deployment environment with all mandatory secrets bound
- WHEN the Next.js application initializes on the Edge runtime
- THEN `DeploymentEnvConfigSchema.parse()` SHALL return a validated configuration object
- AND the application SHALL handle incoming requests without configuration errors.

#### Scenario: Missing Mandatory Secret
- GIVEN a deployment environment missing `DATABASE_URL` or `NEXTAUTH_SECRET`
- WHEN the application attempts to initialize or process an API route
- THEN the schema validation MUST throw a Zod validation error
- AND the application SHALL reject startup or request execution with HTTP 500 configuration failure.

---

## 2. Declarative Zod Configuration Schema

All environment variables MUST conform to the declarative `DeploymentEnvConfigSchema` TypeScript interface:

```typescript
import { z } from "zod";

export const DeploymentEnvConfigSchema = z.object({
  // Database Connection (Neon Postgres via Prisma ORM)
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid connection string"),

  // Authentication (Auth.js v5)
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url().default("http://lvh.me:3000"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Content Management System (Sanity.io)
  SANITY_PROJECT_ID: z.string().min(1, "SANITY_PROJECT_ID is required"),
  SANITY_DATASET: z.string().default("production"),
  SANITY_API_READ_TOKEN: z.string().min(1, "SANITY_API_READ_TOKEN is required"),
  SANITY_WRITE_TOKEN: z.string().optional(),

  // Transactional Email & Ops Alerting
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
  TELEGRAM_CHAT_ID: z.string().min(1, "TELEGRAM_CHAT_ID is required"),

  // Background Jobs & Security
  CRON_SECRET: z.string().optional(),
});

export type DeploymentEnvConfig = z.infer<typeof DeploymentEnvConfigSchema>;
```

---

## 3. Environment Variable Reference Matrix

All environment variables used across Hub (`dayaberkah.id`), product spokes (`pju`, `solarcell`, `alatpetir`, `baterai`), and Client Tracking Portal (`dashboard.dayaberkah.id`) MUST be configured as follows:

| Variable Name | Description | Data Type | Required? | Default Value | Binding Location |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `DATABASE_URL` | Neon Postgres pooled connection string | `string` | **Yes** | — | `.env.local` / Cloudflare Secret |
| `DIRECT_URL` | Neon Postgres direct non-pooled string | `string` | **Yes** | — | `.env.local` / Cloudflare Secret |
| `NEXTAUTH_SECRET` | Secret key for Auth.js session JWT encryption | `string` | **Yes** | — | Cloudflare Secret (min 32 chars) |
| `NEXTAUTH_URL` | Canonical application base URL | `string` | **Yes** | `http://lvh.me:3000` | `.env.local` / Pages Env |
| `SANITY_PROJECT_ID` | Sanity Studio Project ID | `string` | **Yes** | — | `.env.local` / Pages Env |
| `SANITY_DATASET` | Sanity Studio Dataset name | `string` | **Yes** | `production` | `.env.local` / Pages Env |
| `SANITY_API_READ_TOKEN` | Sanity API token for preview reads | `string` | **Yes** | — | Cloudflare Secret |
| `SANITY_WRITE_TOKEN` | Sanity API token for mutation webhooks | `string` | Optional | — | Cloudflare Secret |
| `RESEND_API_KEY` | Resend transactional email API key | `string` | **Yes** | — | Cloudflare Secret |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot token for RFQ alerts | `string` | **Yes** | — | Cloudflare Secret |
| `TELEGRAM_CHAT_ID` | Telegram Chat ID for issue reporting | `string` | **Yes** | — | Cloudflare Secret |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for Auth.js | `string` | Optional | — | Cloudflare Secret |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `string` | Optional | — | Cloudflare Secret |
| `CRON_SECRET` | Auth bearer token for scheduled jobs | `string` | Optional | — | Cloudflare Secret |

---

## 4. Local Development vs Cloudflare Pages Secrets

### Local Setup (`.env.local` & `.dev.vars`)
- Next.js server-side build reads `.env.local` during local development (`pnpm dev`).
- `wrangler pages dev` local edge preview reads simulated secrets from `.dev.vars`.

### Production Binding via Wrangler CLI
Deployments to Cloudflare Pages MUST have production environment secrets set via the Cloudflare CLI or Dashboard:

```bash
npx wrangler pages secret put DATABASE_URL
npx wrangler pages secret put NEXTAUTH_SECRET
npx wrangler pages secret put RESEND_API_KEY
npx wrangler pages secret put TELEGRAM_BOT_TOKEN
npx wrangler pages secret put TELEGRAM_CHAT_ID
```
