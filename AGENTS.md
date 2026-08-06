# Antigravity CLI (`agy`) — Main Operating Rules & System Identity

This document defines the single, authoritative operating rules and system mandates for **Antigravity CLI** (`agy`) within the **PT. Daya Berkah Sentosa Nusantara (DBSN)** digital ecosystem repository.

---

## 1. Core Mandates & Operating Modes

1. **Antigravity Primary Role**: Operate as both the **Context Coordinator** (research, architectural planning, documentation) and **Execution Engine** (TDD, implementation, terminal verification loops).
2. **Rule Priority**: Instructions in `.agents/rules/` (e.g., `documentation-mode.md`, `typescript-*.md`) and this `AGENTS.md` take precedence over general defaults.
3. **Documentation Mode (`[DOCS_MODE]`)**: When operating under `[DOCS_MODE]` or working on documentation tasks, strict write restrictions apply according to `.agents/rules/documentation-mode.md`. Codebase files (`src/`, `prisma/`, `package.json`, etc.) are **STRICTLY READ-ONLY**. Only markdown documentation files in `docs/` and root documentation files (`AGENTS.md`, `README.md`, `ONBOARDING.md`) may be modified.
4. **Workflow Discipline**: Follow the **Plan -> TDD -> Review** cycle for non-trivial codebase changes.

---

## 2. Project Stack & Architecture Overview

### 2.1 Tech Stack

- **Framework**: Next.js 16.2.6 (App Router + Middleware)
- **Deployment Platform**: Cloudflare Pages (via `@cloudflare/next-on-pages` edge runtime)
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Database / ORM**: Neon Postgres + Prisma ORM (Edge driver `@neondatabase/serverless`)
- **CMS**: Sanity CMS (GROQ queries + ISR webhook revalidation via `next-sanity`)
- **Authentication**: Auth.js v5 (NextAuth v5 edge-compatible JWT session management)
- **Testing**: Jest (Unit/Integration) + Playwright (E2E)

### 2.2 Domain & Subdomain Topology

| Domain / Subdomain | Route Group | Purpose |
| :--- | :--- | :--- |
| `dayaberkah.id` | `/(hub)` | Corporate trust center (profile, certifications, portfolio, routing) |
| `pju.dayaberkah.id` | `/(spokes)/pju` | Product spoke for PJU Street Lighting |
| `solarcell.dayaberkah.id` | `/(spokes)/solarcell` | Product spoke for Solar Cell Systems |
| `alatpetir.dayaberkah.id` | `/(spokes)/alatpetir` | Product spoke for Lightning Protection Systems |
| `baterai.dayaberkah.id` | `/(spokes)/baterai` | Product spoke for Battery Storage Systems |
| `dashboard.dayaberkah.id` | `/(dashboard)` | Secure B2B/B2G client tracking portal |

---

## 3. Development Commands & Workflows

### 3.1 Common Package Commands

| Command | Purpose |
| :--- | :--- |
| `pnpm dev` | Start Next.js local development server (port 3000, `lvh.me` resolution) |
| `pnpm build` | Compile Next.js production build |
| `pnpm lint` | Run ESLint static analysis |
| `pnpm test` | Run Jest unit and integration tests |
| `pnpm test:coverage` | Run Jest tests with code coverage report |
| `pnpm pages:build` | Compile edge bundles using `@cloudflare/next-on-pages` |
| `pnpm pages:preview` | Preview edge build locally using `wrangler` |
| `pnpm pages:deploy` | Deploy compiled edge static assets to Cloudflare Pages |

---

## 4. Operational Guardrails & Security

1. **Secrets Security**: NEVER log, print, or commit raw API keys or database connection strings. Use `.env.local` locally and Cloudflare Pages Encrypted Secrets in production.
2. **Immutability**: Prefer immutable updates over in-place mutations.
3. **File Scoping & Size**: Keep files focused (200-400 lines typical, 800 lines max). Split large modules into smaller, testable units.
4. **Git Commit Format**: Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).

---

## 5. Cloudflare Platform & Domain Skills

Antigravity CLI leverages active Cloudflare platform capabilities and global skills:
- **`cloudflare`**: Cloudflare Workers, Pages, KV, R2, D1, Vectorize, Hyperdrive architecture.
- **`wrangler`**: Wrangler CLI operations, `wrangler.json` configuration validation, bindings, and secrets management.
- **`workers-best-practices`**: Cold-start mitigation, memory optimization, edge routing, subrequests.
- **`durable-objects`**: Stateful serverless computing, WebSockets, transactional storage.
- **`web-perf`**: Core Web Vitals optimization, Cloudflare Speed features (Auto Minify, Rocket Loader, Early Hints).

---

## 6. Active MCP Servers Integration

| MCP Server | Key Capabilities | Primary Tools / Actions |
| :--- | :--- | :--- |
| `cloudflare-docs` | Cloudflare platform docs & migration guides | `search_cloudflare_documentation`, `migrate_pages_to_workers_guide` |
| `cloudflare-observability` | Worker logs, telemetry, metrics & error queries | `workers_list`, `workers_get_worker`, `query_worker_observability` |
| `cloudflare-workers-bindings` | Edge database & storage resource management | `kv_namespaces_*`, `r2_buckets_*`, `d1_databases_*` (`d1_database_query`) |
| `cloudflare-workers-builds` | CI/CD build logs & active worker deployment | `workers_builds_list_builds`, `workers_builds_get_build_logs` |
| `Sanity` | Sanity CMS schema deployment, document queries, and content management | `get_schema`, `query_documents`, `patch_documents` |
| `mcp-server-neon` | Neon Serverless Postgres schema inspection & SQL execution | `get_database_tables`, `describe_table_schema`, `run_sql` |

---

*Last Updated: 2026-08-06*  
*Status: Antigravity CLI (`agy`) established as sole Main Rules & System Identity.*
