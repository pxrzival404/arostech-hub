# DBSN Centralized Digital Ecosystem

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-orange?style=flat&logo=cloudflare)](https://pages.cloudflare.com)
[![Next.js Version](https://img.shields.io/badge/Next.js-16.2.6-blue?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![Sanity CMS](https://img.shields.io/badge/CMS-Sanity-red?style=flat&logo=sanity)](https://www.sanity.io/)
[![Database](https://img.shields.io/badge/Database-Neon%20Postgres-00e699?style=flat&logo=postgresql)](https://neon.tech/)

A unified, centralized web platform engineered to consolidate three legacy WordPress domains into a high-performance, single-codebase Next.js 16 hub-and-spoke architecture.

---

## 📌 System Topology

The platform acts as a multi-tenant gateway, serving different sites (hub, spokes, and dashboard) depending on the incoming subdomain or request hostname.

```mermaid
graph TD
    User([Incoming Request]) --> CF[Cloudflare Pages Edge]
    CF --> MW{Next.js Middleware}
    
    %% Hostname Routing
    MW -->|dayaberkah.id| Hub[Hub: PT Daya Berkah Sentosa Nusantara]
    MW -->|pju.dayaberkah.id| Spoke1[Spoke: Penerangan Jalan Umum]
    MW -->|solarcell.dayaberkah.id| Spoke2[Spoke: Solar Cell Systems]
    MW -->|alatpetir.dayaberkah.id| Spoke3[Spoke: Lightning Protection]
    MW -->|baterai.dayaberkah.id| Spoke4[Spoke: Industrial Battery Systems]
    MW -->|dashboard.dayaberkah.id| Dash[Dashboard: Client Portal]

    %% Data Connections
    Hub & Spoke1 & Spoke2 & Spoke3 & Spoke4 -->|Content Fetch| Sanity[(Sanity CMS)]
    Dash -->|Auth & Tracking Data| DB[(Neon Postgres via Prisma)]
```

<!-- AUTO-GENERATED START -->
> **Deployment Platform:** Cloudflare Pages (`dayaberkah.id`) — Unified Production & Staging
> **Architecture:** Next.js 16 Edge Runtime (`@cloudflare/next-on-pages`)
<!-- AUTO-GENERATED END -->

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Hosting Platform** | Cloudflare Pages | 100% Edge hosting on `@cloudflare/next-on-pages` |
| **Runtime & Core** | Next.js 16.2.6 & React 19 | App Router, server components, and Edge middleware routing. |
| **Content CMS** | Sanity.io | Headless CMS for product catalog, portfolios, and custom templates. |
| **Database** | Neon Postgres | Scalable serverless database managed via Prisma ORM. |
| **Authentication** | Auth.js v5 | Secure RBAC sessions (`admin`, `viewer`, `client`). |
| **Styling** | Tailwind CSS v4 & Radix UI | Premium design tokens with accessible UI primitives (shadcn/ui style). |
| **Notifications** | Resend & Telegram Bot API | Double-channel notifications for RFQ forms & system issues. |

---

## 🚀 Key Features

* **Hub-and-Spoke Subdomain Routing:** Solved dynamically at the Edge via middleware before page rendering.
* **Content Federation (Sanity):** Product specifications, case studies, and corporate configurations are fully customizable inside Sanity Studio and synced via Incremental Static Regeneration (ISR).
* **Robust RFQ Fallback Engine:** Form submissions to the Neon DB are protected with automatic retries and fail over to a pre-filled WhatsApp link alongside Telegram failure notifications.
* **Granular Client Access:** Clients can track order status, milestones, and reports specific only to their scope (via PostgreSQL JSON-based Row Level Security tracking-scopes).

---

## 💻 Local Setup & Development

Follow these steps to run the application locally on your machine.

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v20+ recommended)
* `pnpm` (project standard for local development)

### 2. Set Up Local Subdomains (`lvh.me`)
To test subdomain routing locally, we map the hostnames using the `lvh.me` wildcard domain (which points back to `127.0.0.1`):
* Hub: `lvh.me:3000`
* PJU Spoke: `pju.lvh.me:3000`
* Solar Cell Spoke: `solarcell.lvh.me:3000`
* Lightning Spoke: `alatpetir.lvh.me:3000`
* Battery Spoke: `baterai.lvh.me:3000`
* Dashboard: `dashboard.lvh.me:3000`

### 3. Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://user:password@neon-host/dbname?sslmode=require"

# Auth.js
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://lvh.me:3000"

# Sanity CMS
SANITY_PROJECT_ID="your_project_id"
SANITY_API_READ_TOKEN="your_read_token"
SANITY_WRITE_TOKEN="your_write_token"

# Integrations
RESEND_API_KEY="re_..."
TELEGRAM_BOT_TOKEN="bot..."
TELEGRAM_CHAT_ID="..."
```

### 4. Install & Run
```bash
# Install dependencies
pnpm install

# Run the local dev server
pnpm dev
```

---

## 📋 Available Commands

Execute these scripts during development and testing:

* `pnpm dev` — Starts the Next.js development server.
* `pnpm build` — Compiles the Next.js build bundle for production.
* `pnpm pages:build` — Compiles edge bundle for Cloudflare Pages (`@cloudflare/next-on-pages`). *Note for Windows:* Requires `bash` in `PATH` (run via Git Bash, WSL, or ensure `bash.exe` is in `PATH`; Cloudflare Pages CI runs natively on Linux).
* `pnpm pages:preview` — Runs local Wrangler Cloudflare Pages preview server.
* `pnpm pages:deploy` — Deploys project build bundle to Cloudflare Pages.
* `pnpm start` — Runs the compiled production application.
* `pnpm lint` — Runs ESLint code quality checks.
* `pnpm test` — Runs Jest unit and integration tests.
* `pnpm test:watch` — Runs Jest tests in interactive watch mode.
* `pnpm test:coverage` — Generates a Jest code coverage report (target: 80%+).
* `pnpm test:e2e` — Runs Playwright end-to-end integration tests.

---

## 📖 Project Documentation Index

Detailed guides are located inside the `/docs` directory:

### Architecture Reference
* 📐 [System Architecture Guide](file:///docs/core/architecture/architecture.md) — Structural design, domain mappings, and stack decisions.
* 🔀 [Middleware & Routing Manual](file:///docs/core/architecture/middleware-routing.md) — How hostnames resolve at the Edge.
* 🧪 [Test-Driven Development Specs](file:///docs/core/architecture/tdd-v1.md) — Test strategies and mock configurations.

### Developer Playbooks
* 🔧 [Local Setup & Hosts Guide](file:///docs/core/development/local-setup.md) — Detailed instructions on host configurations and env setup.
* 🪵 [Sanity CMS Integration Guide](file:///docs/core/development/sanity-cms-guide.md) — GROQ queries, cache invalidations, and image optimizations.
* 🧪 [Jest & Playwright Testing Guide](file:///docs/core/development/testing-guide.md) — Patterns for unit, integration, and E2E testing.

---

## 🔒 Secrets & Environment Management

For local development, keep environment variables in `.env` (Next.js server-side / build variables) and Cloudflare Pages variables in `.dev.vars` (simulated secrets for wrangler pages dev). Both of these files are ignored by git.

For production deployment on **Cloudflare Pages**, secure environment secrets (such as API keys and connection strings) must be set via Cloudflare's Dashboard under Page Settings > Environment Variables, or via the wrangler CLI.

Use the following commands to upload secrets to Cloudflare:

```bash
# Database URL for Prisma Client
npx wrangler pages secret put DATABASE_URL

# Auth.js / NextAuth Session Secret (min. 32 characters)
npx wrangler pages secret put NEXTAUTH_SECRET

# Google OAuth Credentials
npx wrangler pages secret put GOOGLE_CLIENT_ID
npx wrangler pages secret put GOOGLE_CLIENT_SECRET

# Resend API Key
npx wrangler pages secret put RESEND_API_KEY

# Telegram Notification Bot Token & Chat ID
npx wrangler pages secret put TELEGRAM_BOT_TOKEN
npx wrangler pages secret put TELEGRAM_CHAT_ID

# Admin Default Seed Password
npx wrangler pages secret put ADMIN_DEFAULT_PASSWORD

# Cron Job Auth Validation Token
npx wrangler pages secret put CRON_SECRET
```

