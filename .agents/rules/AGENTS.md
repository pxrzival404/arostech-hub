# arostech-hub — AI Agent Operating Rules & Harness Governance

> **Project**: PT Daya Berkah Sentosa Nusantara (DBSN) — `arostech-hub`  
> **Platform**: Antigravity AI Agent (z.ai) + ECC v2.2.0 + OpenSpec SDD  
> **Branch**: `refactor/reorganize-project-documentation`  
> **Supersedes**: All prior AGENTS.md versions  

---

## 1. Core Operating Principles

1. **Docs-First** — Documentation is the single source of truth. Code MUST conform to docs, never the reverse.
2. **Spec-Driven** — Every code change outside `docs/` MUST have a corresponding OpenSpec task. No spec, no code.
3. **Test-Driven** — Write failing tests before implementation (RED-GREEN-REFACTOR). 80%+ test coverage required.
4. **Security-First** — Validate inputs at all boundaries. Zero hardcoded secrets permitted.
5. **Agent-First** — Delegate to domain-specialized agents. Execute independent tasks in parallel.
6. **Immutability** — Always return new object copies; never mutate existing state.
7. **Plan Before Execute** — Architect complex features prior to writing production code.

---

## 2. Source of Truth Hierarchy

| Priority | Layer | Location | Purpose |
|----------|-------|----------|---------|
| 1 (Highest) | **High-Level Architecture (HLA)** | `docs/` | Strategy, system architecture, engineering governance, operations |
| 2 | **Low-Level Architecture (LLA)** | `openspec/` | Spec-driven change proposals, requirements, design, tasks |
| 3 | **Enforcement Rules** | `.agents/rules/` | Platform constraints (Edge Runtime, CMS, Deploy, Workspace, Style, DB) |
| 3.1 | **Squad Orchestration** | `.agents/rules/teamwork-squad-orchestration.md` | Teamwork-Preview, Draft-First, PRD SSOT Cascade, Dynamic Expansion |
| 4 (Lowest) | **Implementation** | `src/`, `studio/`, `prisma/` | Production code — MUST conform to all layers above |

**Conflict Resolution**: When layers disagree, the higher-priority layer wins. Implementation that contradicts docs is a bug in the implementation.

---

### 2.0 Teamwork-Preview & Draft-First Workflow
When performing multi-agent operations or executing `/teamwork-preview`:
1. **Draft-First Alignment**: Always generate a structured Draft Plan / Prompt first for user review before execution.
2. **PRD-First SSOT Cascade**: All document modifications MUST cascade top-down from `docs/strategy/prd.md` (Root SSOT).
3. **Dynamic Task Expansion**: Squad agents have decision autonomy to dynamically add new Kanban work items when gap discovery reveals missing HLA artifacts or schemas.
4. **Merge Gates**: Every updated document MUST pass static 7-Pillars validation (`node .agents/scripts/validate-ai-docs.cjs`) and Knowledge Graph update (`graphify update .`).

---

### 2.1 Documentation Architecture & 7-Pillars Standard (`docs/`)

Documentation under `docs/` is organized into 4 top-level domains:
- **Strategy & Scope**: `docs/strategy/` — PRD, business rules, domain model
- **System Architecture & API**: `docs/system/` — Overview, middleware, API reference, data model
- **Engineering & Governance**: `docs/engineering/` — AI agent rules, testing strategy, tech stack
- **Operations & Security**: `docs/operations/` — Deployment, monitoring, security policies

**AI-Friendly Documentation Invariant (7-Pillars Standard)**:
All documentation created or updated under `docs/` MUST comply with the 7-Pillars standard:
1. **YAML Frontmatter**: Machine-readable metadata (`id`, `title`, `version`, `status`, `graphify_community`, `authoritative_references`).
2. **Behavioral Contracts**: OpenSpec `Requirement:` & `Scenario:` format (GIVEN-WHEN-THEN).
3. **RFC 2119 Precision**: Normative keywords (`SHALL`, `MUST`, `MUST NOT`, `SHOULD`).
4. **Declarative Schemas**: Concrete Zod/Prisma/TypeScript interfaces over vague prose.
5. **Graphify Anchoring**: Node ID mapping (`doc:<path>`) & GraphRAG sub-graph queries.
6. **OpenSpec Lifecycle**: Explicit spec delta headers (`ADDED`, `MODIFIED`, `REMOVED`).
7. **Anchored URIs**: `file:///` URIs with exact line range anchors & zero redundancy.

---

### 2.2 OpenSpec SDD Workflow (`openspec/`)

All code changes follow the OpenSpec SDD lifecycle:
1. **Explore** (`/opsx:explore`) — Analyze requirements and existing code.
2. **Propose** (`/opsx:propose`) — Generate change artifacts: `proposal.md`, `specs/`, `design.md`, `tasks.md`.
3. **Review** — Human approves specs before implementation begins.
4. **Apply** (`/opsx:apply`) — Implement tasks one by one using TDD.
5. **Verify** (`/opsx:verify`) — Confirm implementation matches specs.
6. **Archive** (`/opsx:archive`) — Move completed changes to archive within 24 hours.

---

### 2.3 Custom Platform Rule File Gating (`.agents/rules/`)

Before inspecting or modifying files in any specific domain, agents **MUST** read and comply with the governing platform rule file:

| Rule File | File Matcher Scope | Owner Agent | Key Constraints Enforced | Status |
|-----------|--------------------|-------------|--------------------------|--------|
| [`cloudflare-edge-runtime.md`](file:///d:/dev/arostech-hub/.agents/rules/cloudflare-edge-runtime.md) | `src/middleware.ts`, Edge routes | `typescript-reviewer` | No Node OS APIs on Edge, ADR-0006 split auth config, 50ms middleware CPU limit, Web Streams for >1MB payloads, no loopback fetch | **AUTHORITATIVE — v2.2.0** |
| [`cloudflare-pages-deploy.md`](file:///d:/dev/arostech-hub/.agents/rules/cloudflare-pages-deploy.md) | `next.config.ts`, deploy scripts | `architect` | `pnpm pages:build`, disable Sentry source maps during Cloudflare build (25MB limit), `_routes.json`, `parseCloudflarePagesHost()` | **AUTHORITATIVE — v2.2.0** |
| [`sanity-cms-federation.md`](file:///d:/dev/arostech-hub/.agents/rules/sanity-cms-federation.md) | `studio/**`, `src/lib/sanity/**` | `react-reviewer` | GROQ `defineQuery()` mandatory, 6 local schema types, null-on-error fetching, ISR `revalidateTag()`, env-aware Stega | **AUTHORITATIVE — v2.2.0** |
| [`monorepo-workspace.md`](file:///d:/dev/arostech-hub/.agents/rules/monorepo-workspace.md) | `pnpm-workspace.yaml`, `package.json` | `typescript-reviewer` | PNPM `workspace:*` protocol, purge `@21st-sdk/*`, build order (`studio` -> `web`), no circular dependencies, `package-lock.json` purge | **AUTHORITATIVE — v2.2.0** |
| [`tailwind-v4.md`](file:///d:/dev/arostech-hub/.agents/rules/tailwind-v4.md) | `src/app/globals.css`, `.tsx` | `react-reviewer` | `@theme inline` CSS-first config, delete `tailwind.config.ts`, `@tailwindcss/postcss`, OKLCH tokens, no inline `@apply` in JSX | **AUTHORITATIVE — v2.2.0** |
| [`prisma-neon-edge.md`](file:///d:/dev/arostech-hub/.agents/rules/prisma-neon-edge.md) | `prisma/schema.prisma`, `prisma.ts` | `database-reviewer` | Lazy Proxy init, `@prisma/adapter-neon`, composite RFQ leads, `DATABASE_URL` vs `DIRECT_URL`, Node runtime | **AUTHORITATIVE — v2.2.0** |

---

## 3. Agent Roster & Delegation Rules

### 3.1 Installed Agent Roster (28 Agents)

| # | Agent | Category / Role | When to Invoke |
|---|-------|-----------------|----------------|
| 1 | `architect` | System Design & Governance | High-level system design, AGENTS.md updates, ADR creation, deployment pipelines |
| 2 | `code-architect` | Code Module Architecture | Complex module refactoring, circular dependency resolution, interface bounds |
| 3 | `planner` | Strategic Task Planning | Feature breakdown (3+ files), wave sequencing, multi-file execution plans |
| 4 | `tdd-guide` | TDD Specialist | Authoring Jest/Playwright tests, enforcing RED-GREEN-REFACTOR cycle |
| 5 | `code-reviewer` | Code Quality Auditor | Post-implementation review, maintainability, naming and structure audit |
| 6 | `code-simplifier` | Code Complexity Reduction | Refactoring nested logic, breaking down large components (<200 lines) |
| 7 | `code-explorer` | Codebase Architecture Analyst | Execution path tracing, dependency mapping, impact analysis |
| 8 | `security-reviewer` | Security & Vulnerability Auditor | Pre-commit security scans, Auth.js audits, secret leak detection |
| 9 | `typescript-reviewer` | TypeScript & Edge Specialist | Any `.ts` file edit, type definition check, Edge boundary verification |
| 10 | `react-reviewer` | React RSC & Component Specialist | Any `.tsx` file edit, RSC data fetching patterns, Tailwind v4 styling |
| 11 | `react-build-resolver` | Next.js Build Resolver | Fix React hydration, Server Component boundary, and bundler errors |
| 12 | `spec-miner` | Brownfield Spec Extractor | Extracting OpenSpec behavioral specs from legacy code |
| 13 | `refactor-cleaner` | Scope Creep Purger | Removing unused exports, purging unauthorized packages (`@21st-sdk/*`) |
| 14 | `doc-updater` | Documentation & Graphify Specialist | Updating `docs/`, generating codemaps, maintaining 7-Pillars standard |
| 15 | `docs-lookup` | Documentation Search Specialist | Searching internal `docs/` and external vendor documentation |
| 16 | `e2e-runner` | Playwright E2E Testing Specialist | Subdomain routing verification, auth flow testing, critical path tests |
| 17 | `build-error-resolver` | Build & Compilation Resolver | Fix TypeScript compilation and build failures with minimal diffs |
| 18 | `database-reviewer` | PostgreSQL & Prisma Specialist | `prisma/schema.prisma` edits, Neon proxy optimization, RFQ lead models |
| 19 | `loop-operator` | Autonomous Loop Executor | Managing background task queues, long-running agent workflows |
| 20 | `harness-optimizer` | Harness & Prompt Tuning Agent | Optimizing `.agents/` configuration, hook execution, token budget |
| 21 | `performance-optimizer` | Web Vitals & Edge Analyst | Latency reduction, Web Streams streaming optimization, 25MB bundle size |
| 22 | `a11y-architect` | Accessibility Auditor | ARIA landmark reviews, keyboard navigation, WCAG 2.1 AA color contrast |
| 23 | `seo-specialist` | Search Engine Optimization Specialist | OpenGraph tags, JSON-LD structured data, metadata generation |
| 24 | `comment-analyzer` | JSDoc & Comment Auditor | Cleaning outdated comments, preserving authoritative docstrings |
| 25 | `pr-test-analyzer` | PR Test Suite Auditor | Verifying test coverage thresholds (80%+ target), flaky test detection |
| 26 | `type-design-analyzer` | Advanced Type Designer | Complex generic interface design, Zod schema alignment |
| 27 | `silent-failure-hunter` | Error Handling Auditor | Finding swallowed exceptions, missing catch blocks, silent fallbacks |
| 28 | `agent-evaluator` | AI Agent Performance Evaluator | Benchmarking agent outputs against OpenSpec criteria |

---

### 3.2 Delegation Rules (Auto-Gating Matrix)

```
[ Incoming Task / Edit ]
        │
        ├── Modifying `.tsx` file ─────────► `react-reviewer` ──► `typescript-reviewer`
        ├── Modifying `.ts` file ──────────► `typescript-reviewer`
        ├── Schema / Prisma edit ──────────► `database-reviewer` ──► `typescript-reviewer`
        ├── Auth / Security file ──────────► `security-reviewer`
        ├── Fix build failure ─────────────► `build-error-resolver` / `react-build-resolver`
        ├── Multi-file feature ────────────► `planner` ──► `architect` ──► `tdd-guide`
        └── Documentation edit ────────────► `doc-updater` (verifies 7-Pillars standard)
```

---

### 3.3 Parallel Execution Protocol
Independent operations MUST be executed in parallel:
- Multiple file reads across unrelated domains
- Multiple test suites that don't share state
- Agent reviews on unrelated file sets (e.g. `code-reviewer` + `security-reviewer` simultaneously)

---

## 4. SDD x TDD Execution Workflow

Every OpenSpec task is executed using the nested TDD cycle:

```
OpenSpec Task ──► RED (failing test) ──► GREEN (minimal impl) ──► REFACTOR ──► Coverage Gate (80%+) ──► Next Task
```

### 4.1 Test-Driven Development Rules
1. **RED**: Write failing test first. The test MUST fail before production code is written.
2. **GREEN**: Write minimal code to pass the test.
3. **REFACTOR**: Clean code while maintaining 80%+ test coverage.
4. **MANDATORY**: Never delete failing tests or lower coverage thresholds to pass build gates.

---

## 5. Coding Standards

1. **Immutability**: Always return new object copies; never mutate existing state.
2. **File Scope & Size**: Keep components < 200 lines, modules < 400 lines. Max 800 lines absolute limit.
3. **Error Handling**: Implement structured error handling; use null-on-error for RSC data fetching helpers.
4. **Input Validation**: Validate inputs at all boundaries using Zod schemas.

---

## 6. Security Guidelines

1. **Pre-Commit Scan**: Check for hardcoded API keys, tokens, or passwords before committing.
2. **SQL & XSS Prevention**: Use Prisma ORM parameterized queries; sanitize HTML inputs.
3. **Secret Rotation Protocol**: If a secret is exposed, immediately revoke and rotate via environment variables.

---

## 7. Git Workflow & Conventional Commits

Format: `<type>(<scope>): <subject>`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

---

## 8. Architecture Constraints & Topology

- **Runtime**: Cloudflare Pages (Edge) via `@cloudflare/next-on-pages`
- **Framework**: Next.js 16.2.6 (App Router)
- **CMS**: Sanity (GROQ + ISR + Stega visual editing)
- **Database**: Neon (PostgreSQL) via Prisma ORM (Proxy lazy init)
- **Auth**: Auth.js v5 (JWT strategy, role-based token expiry, ADR-0006 split config)
- **Styling**: Tailwind CSS v4 (CSS-first `@theme inline`, OKLCH tokens)
- **Monorepo**: PNPM Workspaces (`pnpm-workspace.yaml`)
- **Testing**: Jest (unit/integration) + Playwright (E2E)

---

## 9. Verification & Knowledge Graph Sync Protocol

After modifying any rule file, documentation artifact, or production code, agents **MUST**:
1. **Validate Documentation Standard**: `node .agents/scripts/validate-ai-docs.cjs`
2. **Update Knowledge Graph AST**: `graphify update .`

---

## 10. ECC Skill Loading Order (57 Skills)

### Auto-Loaded Skills (Always Active)
- `tdd-workflow`, `verification-loop`, `git-workflow`, `coding-standards`, `react-patterns`, `nextjs-turbopack`, `search-first`, `error-handling`

### On-Demand Skills
- Prisma/DB: `prisma-patterns`, `database-migrations`, `postgres-patterns`
- Security: `the-security-guard`, `security-review`, `security-scan`, `security-bounty-hunter`
- UI/Styling: `frontend-patterns`, `frontend-design-direction`, `design-system`, `motion-foundations`
- Accessibility: `frontend-a11y`, `accessibility`
- Performance: `react-performance`, `web-perf`
- E2E: `e2e-testing`, `react-testing`

---

## 11. Workflow Surface Policy

- `skills/` is the canonical workflow surface for ECC.
- `openspec/` is the canonical spec surface — all change proposals live here.
- Workspace-scoped MCP configurations belong in `.agents/mcp.json` or `.agents/mcp_config.json`.

---

## 12. Context Management Rules

- Avoid using the last 20% of context window for multi-file refactorings.
- Maintain context hygiene by clearing unused state before launching major task waves.

---

## 13. Success Metrics

- All tests pass with 80%+ coverage.
- Zero `ignoreBuildErrors: true` in production builds.
- Worker bundle size strictly < 25 MB (`.vercel/output/static/_worker.js`).
- All 6 custom rule files authored, authoritative, and enforced.
- OpenSpec changes archived within 24 hours of completion.
