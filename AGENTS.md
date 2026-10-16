---
id: doc:AGENTS.md
title: arostech-hub — AI Agent Operating Rules & Harness Governance
version: 5.0.0
status: authoritative
graphify_community: engineering
authoritative_references:
  - file:///d:/dev/arostech-hub/docs/engineering/governance/0xrizz-workflow.md#L1-L100
  - file:///d:/dev/arostech-hub/docs/engineering/governance/ai-agent-rules.md#L1-L60
---

# arostech-hub — Agent Instructions

## Overview
PT Daya Berkah Sentosa Nusantara (`arostech-hub`) platform built on Next.js 16.2.6 (App Router), Cloudflare Pages Edge Runtime, Sanity CMS (GROQ/ISR), Neon PostgreSQL (Prisma ORM), Auth.js v5, and Tailwind CSS v4. Governed by OpenSpec SDD, TDD, and **Graphify Knowledge Graph** (established as the sole standard memory system for Layer 0 Context Boot and Layer 6 Memory Sync).

## Terminal & Execution Standard
All CLI commands, test suites, and automation scripts executed by AI agents MUST execute within **Git Bash** (`bash` environment with POSIX toolchains). Agents SHALL use POSIX shell syntax, standard pipe/redirection operators (`|`, `&&`, `||`), and forward-slash (`/`) directory paths. PowerShell and `cmd.exe` proprietary syntax MUST NOT be used.

## Quick CLI Reference (Git Bash)

pnpm dev            # Start Next.js development server
pnpm build          # Standard Next.js production build
pnpm generate       # Generate Prisma client bindings
pnpm pages:build    # Compile Cloudflare Pages output (.open-next/assets via @opennextjs/cloudflare)
pnpm pages:preview  # Local Cloudflare Pages preview via Wrangler
pnpm lint           # Run ESLint on critical auth and middleware files
pnpm test           # Run Jest unit/integration test suite

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

## Extended Development Workflow (8-Layer Standard)

All development MUST follow the 8-layer sequence defined in [`.agents/rules/common-extended-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md) and [`0xrizz-workflow.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/0xrizz-workflow.md):

```
L0: Context Boot (graphify query + dirty tree auto-sync) -> L1: HLA Alignment (docs/ 7-Pillars) -> L2: Research & Reuse (Context7 / GitHub) -> L3: SDD Scaffolding (Standard /opsx-propose vs Fast-Track /opsx-ff) -> L4: Agent Routing & Harness Auto-Gating -> L5: TDD Inner Loop (Isolated AAA RED-GREEN-REFACTOR-VERIFY, Spec-to-Test Multiplier >= 4) -> L6: Incremental Memory Sync (graphify update ., sub-second AST) -> L7: Strict Zero-Regression Verification (85.0%+ Branch Coverage, CF Pages Bundle <25MB) -> L8: Commit, PR & Archive (Conventional Commits, /opsx-archive).
```

- **Governing Workflow Rules**:
  - [`0xrizz-workflow.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/0xrizz-workflow.md) — Master 8-Layer Unified Governance & Agent Harness Specification (v5.0.0)
  - [`common-extended-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md) — Unified 8-Layer execution sequence & gate conditions
  - [`ai-friendly-docs.md`](file:///d:/dev/arostech-hub/.agents/rules/ai-friendly-docs.md) — 7-Pillars documentation standard
  - [`graphify.md`](file:///d:/dev/arostech-hub/.agents/rules/graphify.md) — Knowledge Graph boot (Layer 0) & sync protocol (Layer 3/6/8)
  - [`agy-prompt.md`](file:///d:/dev/arostech-hub/.agents/rules/agy-prompt.md) — Isolated prompt-crafting, context-harvesting, and prompt-architecture (Manual)
  - [`agy-deepthinking.md`](file:///d:/dev/arostech-hub/.agents/rules/agy-deepthinking.md) — General in-flight deep-reasoning & pre-execution checklist gate (Manual)

## Domain Glob Routing Matrix (`.agents/rules/`)

| File Target / Glob | Canonical Rule | Key Invariants Enforced |
|---|---|---|
| `**/*.ts` | [`typescript-coding-style.md`](file:///d:/dev/arostech-hub/.agents/rules/typescript-coding-style.md) | Immutability, KISS/DRY/YAGNI, strict types, Zod boundary validation |
| `**/*.tsx` | [`react-coding-style.md`](file:///d:/dev/arostech-hub/.agents/rules/react-coding-style.md) | RSC boundaries (`"use client"`), <200 lines/component, Tailwind v4 OKLCH |
| `src/middleware.ts` | [`cloudflare-edge-runtime.md`](file:///d:/dev/arostech-hub/.agents/rules/cloudflare-edge-runtime.md) | Zero Node OS APIs, 50ms CPU limit, Web Streams |
| `studio/**` | [`sanity-cms-federation.md`](file:///d:/dev/arostech-hub/.agents/rules/sanity-cms-federation.md) | GROQ `defineQuery()`, null-on-error data fetching, ISR revalidation |
| `prisma/**` | [`prisma-neon-edge.md`](file:///d:/dev/arostech-hub/.agents/rules/prisma-neon-edge.md) | Lazy Neon Proxy init, serverless pool connection management |
| `docs/**` | [`ai-friendly-docs.md`](file:///d:/dev/arostech-hub/.agents/rules/ai-friendly-docs.md) | 7-Pillars AI-friendly documentation standard |

## Invariants & Guardrails

- ✅ **Always do:** Execute all commands in **Git Bash** (`bash`) using forward-slash (`/`) paths. Run `graphify query "<task>"` at Layer 0 boot. Derive tests from OpenSpec specs with Spec-to-Test Multiplier >= 4. Enforce 85.0%+ branch test coverage (Strict Zero-Regression Gate). Return new immutable copies. Validate docs with `node .agents/scripts/validate-ai-docs.cjs`.
- ⚠️ **Ask first:** Modifying `prisma/schema.prisma`. Adding new npm dependencies. Altering Auth.js split config. Modifying deployment pipelines.
- 🚫 **Never do:** Commit hardcoded secrets or API keys. Set `ignoreBuildErrors: true` in `next.config.ts`. Use Node OS APIs in Edge middleware. Delete failing unit tests. Exceed 25 MB Worker bundle limit (`_worker.js`). Execute PowerShell or `cmd.exe` proprietary syntax in terminal invocations.

