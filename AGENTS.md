---
id: doc:AGENTS.md
title: arostech-hub — AI Agent Operating Rules & Harness Governance
version: 2.2.0
status: authoritative
graphify_community: engineering
authoritative_references:
  - file:///d:/dev/arostech-hub/docs/engineering/ai-agent-rules.md
---

# arostech-hub — Agent Instructions

## Overview
PT Daya Berkah Sentosa Nusantara (`arostech-hub`) platform built on Next.js 16.2.6 (App Router), Cloudflare Pages Edge Runtime, Sanity CMS (GROQ/ISR), Neon PostgreSQL (Prisma ORM), Auth.js v5, and Tailwind CSS v4. Governed by OpenSpec SDD, TDD, and Graphify Knowledge Graph.

## Build & Run

pnpm dev            # Start Next.js development server
pnpm build          # Standard Next.js production build
pnpm generate       # Generate Prisma client bindings
pnpm pages:build    # Compile Cloudflare Pages output (.open-next/assets via @opennextjs/cloudflare)
pnpm pages:preview  # Local Cloudflare Pages preview via Wrangler
pnpm lint           # Run ESLint on critical auth and middleware files

## Testing

pnpm test                          # Run Jest unit/integration test suite
pnpm test:watch                    # Run Jest in watch mode
pnpm test:coverage                 # Run test suite with 80%+ coverage report
pnpm test:e2e                      # Execute Playwright E2E browser tests
npx jest src/__tests__/rate-limiter.test.ts  # Run specific test file

## Project Structure

src/
├── app/            # Next.js App Router pages, API routes, and layouts
├── lib/            # Shared utilities (auth, db/prisma, edge middleware)
└── __tests__/      # Jest unit and integration test suites
studio/             # Sanity CMS Studio schema configurations
prisma/             # Prisma schema, migrations, and Neon seed scripts
docs/               # HLA Documentation (Strategy, System, Engineering, Ops)
openspec/           # LLA OpenSpec SDD change proposals (proposal, specs, tasks)
.agents/            # Antigravity agent roster, skills, and platform rules

## Extended Development Workflow

All development MUST follow the 8-layer sequence defined in [`.agents/rules/common-extended-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md):

```
L0: Context Boot (graphify query) -> L1: HLA Alignment (docs/) -> L2: Research & Reuse (Context7) -> L3: SDD Proposal (/opsx-propose) -> L4: Agent Delegation -> L5: TDD Execution (RED-GREEN-REFACTOR) -> L6: Memory Sync (graphify update .) -> L7: Change Verify (/opsx-verify + lint + test + build) -> L8: Commit & Archive (/opsx-archive + /pr).
```
- **Governing Rules**:
  - [`common-extended-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md) — Unified 8-Layer execution sequence & gate conditions
  - [`teamwork-squad-orchestration.md`](file:///d:/dev/arostech-hub/.agents/rules/teamwork-squad-orchestration.md) — Squad orchestration, Draft-First, PRD cascade
  - [`ai-friendly-docs.md`](file:///d:/dev/arostech-hub/.agents/rules/ai-friendly-docs.md) — 7-Pillars documentation standard (validated via `node .agents/scripts/validate-ai-docs.cjs`)
  - [`graphify.md`](file:///d:/dev/arostech-hub/.agents/rules/graphify.md) — Knowledge Graph boot (Layer 0) & sync protocol (Layer 3/6/8)
  - [`prompt-deep-thinking-context.md`](file:///d:/dev/arostech-hub/.agents/rules/prompt-deep-thinking-context.md) — Deep-thinking prompt engineering & context management

## Code Style & Platform Standards

- **Core Principles**: Immutability mandatory (return new object copies, never mutate existing state). Component < 200 lines, module < 400 lines, max 800 lines absolute limit.
- **Platform Code Style References**:
  - **Cloudflare Edge Runtime**: Zero Node OS APIs in `src/middleware.ts`; 50ms CPU limit; Web Streams for >1MB payloads. See [`cloudflare-edge-runtime.md`](file:///d:/dev/arostech-hub/.agents/rules/cloudflare-edge-runtime.md).
  - **Cloudflare Deployment**: Compile output to `.open-next/assets` via `pnpm pages:build` (`@opennextjs/cloudflare`); disable Sentry maps to enforce 25MB worker bundle limit. See [`cloudflare-pages-deploy.md`](file:///d:/dev/arostech-hub/.agents/rules/cloudflare-pages-deploy.md).
  - **Next.js & React RSC**: Server Component data fetching with null-on-error helpers; strict hook discipline; zero inline `@apply` in JSX. See [`react-coding-style.md`](file:///d:/dev/arostech-hub/.agents/rules/react-coding-style.md) & [`react-patterns.md`](file:///d:/dev/arostech-hub/.agents/rules/react-patterns.md).
  - **Sanity CMS Federation**: GROQ queries wrapped in `defineQuery()`; null-on-error fetching; ISR `revalidateTag()`. See [`sanity-cms-federation.md`](file:///d:/dev/arostech-hub/.agents/rules/sanity-cms-federation.md).
  - **Prisma & Neon Database**: Lazy Proxy instance init; `@prisma/adapter-neon` serverless pool; composite RFQ lead models. See [`prisma-neon-edge.md`](file:///d:/dev/arostech-hub/.agents/rules/prisma-neon-edge.md).
  - **Tailwind CSS v4**: `@theme inline` CSS-first configuration in `src/app/globals.css`; OKLCH color tokens; delete `tailwind.config.ts`. See [`tailwind-v4.md`](file:///d:/dev/arostech-hub/.agents/rules/tailwind-v4.md).
  - **TypeScript & Monorepo**: Strict type safety; Zod boundary schemas; PNPM `workspace:*` protocol; purge `@21st-sdk/*`. See [`typescript-coding-style.md`](file:///d:/dev/arostech-hub/.agents/rules/typescript-coding-style.md) & [`monorepo-workspace.md`](file:///d:/dev/arostech-hub/.agents/rules/monorepo-workspace.md).

## Boundaries

- ✅ **Always do:** Run `graphify query "<task>"` at Layer 0 boot. Derive tests from OpenSpec specs. Enforce 80%+ test coverage. Return new immutable copies. Validate docs with `node .agents/scripts/validate-ai-docs.cjs`.
- ⚠️ **Ask first:** Modifying `prisma/schema.prisma`. Adding new npm dependencies. Altering Auth.js split config. Modifying deployment pipelines.
- 🚫 **Never do:** Commit hardcoded secrets or API keys. Set `ignoreBuildErrors: true` in `next.config.ts`. Use Node OS APIs in Edge middleware. Delete failing unit tests. Exceed 25 MB Worker bundle limit (`_worker.js`).

## Governance & Rules Reference (`.agents/rules/`)

All development MUST comply with project rules in [`.agents/rules/`](file:///d:/dev/arostech-hub/.agents/rules/) governed by SSOT Hierarchy: HLA (`docs/`) > LLA (`openspec/`) > Enforcement Rules (`.agents/rules/`) > Code (`src/`).

| Rule Domain | Files & Scope | Trigger Mode | Key Invariants Enforced |
|---|---|---|---|
| **Platform & Infra** | [`cloudflare-edge-runtime.md`](file:///d:/dev/arostech-hub/.agents/rules/cloudflare-edge-runtime.md), [`cloudflare-pages-deploy.md`](file:///d:/dev/arostech-hub/.agents/rules/cloudflare-pages-deploy.md), [`sanity-cms-federation.md`](file:///d:/dev/arostech-hub/.agents/rules/sanity-cms-federation.md), [`prisma-neon-edge.md`](file:///d:/dev/arostech-hub/.agents/rules/prisma-neon-edge.md), [`tailwind-v4.md`](file:///d:/dev/arostech-hub/.agents/rules/tailwind-v4.md), [`monorepo-workspace.md`](file:///d:/dev/arostech-hub/.agents/rules/monorepo-workspace.md) | `glob` / `model_decision` | Edge runtime limits, ADR-0006 split auth, 25MB worker bundle limit, GROQ `defineQuery()`, `@theme inline`, Lazy Neon Proxy |
| **Workflow & Squad** | [`common-extended-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md), [`teamwork-squad-orchestration.md`](file:///d:/dev/arostech-hub/.agents/rules/teamwork-squad-orchestration.md), [`ai-friendly-docs.md`](file:///d:/dev/arostech-hub/.agents/rules/ai-friendly-docs.md), [`graphify.md`](file:///d:/dev/arostech-hub/.agents/rules/graphify.md), [`prompt-deep-thinking-context.md`](file:///d:/dev/arostech-hub/.agents/rules/prompt-deep-thinking-context.md) | `model_decision` | 8-Layer execution (L0-L8), Draft-First PRD cascade, 7-Pillars docs standard, Graphify context boot (Layer 0) |
| **Common Standards** | `common-coding-style.md`, `common-patterns.md`, `common-security.md`, `common-testing.md`, `common-code-review.md`, `common-git-workflow.md`, `common-hooks.md`, `common-agents.md`, `common-performance.md` | `model_decision` | Immutability, AAA test structure, zero hardcoded secrets, conventional commits, auto-gating 28 agent roster |
| **React & Web UI** | `react-coding-style.md`, `react-hooks.md`, `react-patterns.md`, `react-security.md`, `react-testing.md`, `web-*.md` | `glob` (`*.tsx`) / `model_decision` | RSC boundaries, hook discipline, Tailwind v4 OKLCH, WCAG 2.1 AA a11y, null-on-error data fetching |
| **TypeScript** | `typescript-coding-style.md`, `typescript-hooks.md`, `typescript-patterns.md`, `typescript-security.md`, `typescript-testing.md` | `glob` (`*.ts`) / `model_decision` | Strict type safety, Zod schema validation, async/await error handling, Edge boundary verification |
