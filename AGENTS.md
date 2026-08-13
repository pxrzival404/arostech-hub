---
id: doc:AGENTS.md
title: arostech-hub — AI Agent Operating Rules & Harness Governance
version: 2.3.0
status: authoritative
graphify_community: engineering
authoritative_references:
  - file:///d:/dev/arostech-hub/docs/engineering/ai-agent-rules.md
---

# arostech-hub — Agent Instructions

## Overview
PT Daya Berkah Sentosa Nusantara (`arostech-hub`) platform built on Next.js 16.2.6 (App Router), Cloudflare Pages Edge Runtime, Sanity CMS (GROQ/ISR), Neon PostgreSQL (Prisma ORM), Auth.js v5, and Tailwind CSS v4. Governed by OpenSpec SDD, TDD, and **Graphify Knowledge Graph** (established as the sole standard memory system for Layer 0 Context Boot and Layer 6 Memory Sync).

## Quick CLI Reference

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

All development MUST follow the 8-layer sequence defined in [`.agents/rules/common-extended-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md):

```
L0: Context Boot (graphify query) -> L1: HLA Alignment (docs/) -> L2: Research & Reuse (Context7) -> L3: SDD Proposal (/opsx-propose) -> L4: Agent Delegation -> L5: TDD Execution (RED-GREEN-REFACTOR) -> L6: Memory Sync (graphify update .) -> L7: Change Verify (/opsx-verify + lint + test + build) -> L8: Commit & Archive (/opsx-archive + /pr).
```

- **Governing Workflow Rules**:
  - [`common-extended-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md) — Unified 8-Layer execution sequence & gate conditions
  - [`teamwork-squad-orchestration.md`](file:///d:/dev/arostech-hub/.agents/rules/teamwork-squad-orchestration.md) — Squad orchestration, Draft-First, PRD cascade
  - [`ai-friendly-docs.md`](file:///d:/dev/arostech-hub/.agents/rules/ai-friendly-docs.md) — 7-Pillars documentation standard
  - [`graphify.md`](file:///d:/dev/arostech-hub/.agents/rules/graphify.md) — Knowledge Graph boot (Layer 0) & sync protocol (Layer 3/6/8)
  - [`prompt-deep-thinking-context.md`](file:///d:/dev/arostech-hub/.agents/rules/prompt-deep-thinking-context.md) — Deep-thinking prompt engineering & context management

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

- ✅ **Always do:** Run `graphify query "<task>"` at Layer 0 boot. Derive tests from OpenSpec specs. Enforce 80%+ test coverage. Return new immutable copies. Validate docs with `node .agents/scripts/validate-ai-docs.cjs`.
- ⚠️ **Ask first:** Modifying `prisma/schema.prisma`. Adding new npm dependencies. Altering Auth.js split config. Modifying deployment pipelines.
- 🚫 **Never do:** Commit hardcoded secrets or API keys. Set `ignoreBuildErrors: true` in `next.config.ts`. Use Node OS APIs in Edge middleware. Delete failing unit tests. Exceed 25 MB Worker bundle limit (`_worker.js`).
