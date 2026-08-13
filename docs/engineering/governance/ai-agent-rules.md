---
id: GOV-AGENT-001
title: Antigravity AI Agent Rules & System Governance
version: 4.0.0
status: LOCKED_BASELINE
graphify_community: "community_governance"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100"
  agents_root: "file:///d:/dev/arostech-hub/AGENTS.md#L1-L100"
---

# Antigravity AI Agent Rules & System Governance

> **Authoritative Baseline Reference**: Operating rules, system mandates, and domain topology for AI agent execution in the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100)) and [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md#L1-L100).

---

## 1. Core Mandates & Operating Modes

1. **Agent Primary Role**: Operate as both Context Coordinator (research, architectural planning, documentation) and Execution Engine (TDD, implementation, terminal verification loops).
2. **Rule Hierarchy & Priority**: Instructions in `.agents/rules/` and [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md#L1-L100) MUST take precedence over default LLM behaviors.
3. **Documentation Mode (`[DOCS_MODE]`)**: When operating under documentation tasks, strict write restrictions apply according to `.agents/rules/documentation-mode.md`. Codebase files (`src/`, `prisma/`, `package.json`) SHALL remain strictly read-only. Only markdown documentation files under `docs/`, `openspec/`, and root documentation files MAY be modified.
4. **Workflow Discipline**: Agents MUST follow the **Plan -> TDD -> Review** cycle for non-trivial changes.

---

## 2. Project Stack & Domain Topology

### 2.1 Tech Stack
- **Framework**: Next.js 16.2.6 (App Router + Edge Middleware)
- **Deployment Platform**: Cloudflare Pages (via `@opennextjs/cloudflare` edge runtime)
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS v4 + Design Tokens
- **Database / ORM**: Neon Postgres + Prisma ORM (Edge driver `@neondatabase/serverless`)
- **CMS**: Sanity CMS (GROQ queries + ISR webhook revalidation via `next-sanity`)
- **Authentication**: Auth.js v5 (NextAuth v5 edge-compatible JWT session management)
- **Testing**: Jest (Unit/Integration) + Playwright (E2E)

### 2.2 Domain & Subdomain Topology

| Domain / Subdomain | App Router Mapping | Surface Purpose |
| :--- | :--- | :--- |
| `dayaberkah.id` | `(hub)` | Corporate trust center (profile, certifications, portfolio, routing) |
| `pju.dayaberkah.id` | `(spokes)/pju` | Product spoke for PJU Street Lighting |
| `solarcell.dayaberkah.id` | `(spokes)/solarcell` | Product spoke for Solar Cell Systems |
| `alatpetir.dayaberkah.id` | `(spokes)/alatpetir` | Product spoke for Lightning Protection Systems |
| `baterai.dayaberkah.id` | `(spokes)/baterai` | Product spoke for Battery Storage Systems |
| `dashboard.dayaberkah.id` | `dashboard/` | Flat route: Secure B2B/B2G client tracking portal |

---

## 3. Operational Guardrails & Security

1. **Secrets Security**: Agents SHALL NEVER log, print, or commit raw API keys or database connection strings. Use `.env.local` locally and Cloudflare Pages Encrypted Secrets in production.
2. **Immutability Invariant**: Code modifications MUST favor immutable object copies over in-place mutations.
3. **File Scoping & Size**: Files SHOULD be kept focused (200–400 lines typical, 800 lines maximum).
4. **Git Commit Standard**: Commit messages MUST follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).

---

## 4. OpenSpec Behavioral Requirements

### Requirement: REQ-GOV-AGENT-001-MODE-SAFETY
When operating under documentation mode (`[DOCS_MODE]`), AI agents SHALL NOT mutate production application code outside markdown documentation boundaries.

#### Scenario: Documentation Task Execution
- GIVEN an AI agent executing a documentation task or playbook update
- WHEN operating under documentation mode
- THEN write tool calls MUST be restricted exclusively to `.md` files in `docs/`, `openspec/`, and root indices.

---

## 5. OpenSpec Delta

## ADDED Requirements
- REQ-GOV-AGENT-001-MODE-SAFETY: Explicit documentation mode write boundary enforcement.

## MODIFIED Requirements
- Aligned baseline stack definitions with Next.js 16.2.6, Tailwind v4, and Auth.js v5.

## REMOVED Requirements
- Legacy Vercel staging deployment references.

---

## 6. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/engineering/governance/ai-agent-rules.md`
- Graphify Community: `community_governance`
- Master Governance File: [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md#L1-L100)
