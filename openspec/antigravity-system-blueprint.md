# Antigravity System Blueprint & Migration Plan

**Repository:** pxrzival404/arostech-hub
**Authoring role:** Lead System Architect & Senior Refactoring Engineer (Antigravity)
**Purpose:** Capture a deterministic, audited plan to realign the codebase with the canonical architecture described in `docs/` and the OpenSpec workflow in `openspec/`. This document is the required initial deliverable before any production code changes.

---

## 1) Architecture Audit Matrix

Summary: the matrix compares current repository artifacts against the high-level architecture in `docs/` and low-level specs in `openspec/`. Use this to mark hallucinated/scope-creep areas and to drive precise tasks.

| Module / Concern | Status (Compliant / Deviation) | Evidence (path) | Notes & Recommendation |
|---|---:|---|---|
| Edge Hostname Routing (Hub-and-Spoke middleware) | Partial / Deviation | docs/system/architecture/execution-lifecycle.md, src/middleware, next.config.ts | docs specify Edge middleware solving host routing. Confirm `src/middleware` implementation matches ADR; if middleware contains unrelated features, flag as hallucinated. Prioritize full audit of `src/middleware` and `pages/_middleware`-like artifacts. |
| Sanity CMS Integration (GROQ, ISR, Studio) | Compliant / Needs verification | docs/engineering/playbooks/sanity-cms-guide.md, studio/, src/lib/sanity | Sanity Studio present; verify GROQ queries & caching tags. Add acceptance tests for GROQ responses. |
| Prisma + Neon Postgres Schema & Migrations | Partial / Deviation | prisma/, schema.prisma, openspec/config.yaml | Schema files exist — check for untracked generated queries or redundant models. Enforce single source (prisma/schema.prisma) and regenerate client after changes. |
| Authentication (Auth.js v5 / RBAC) | Deviation | docs mention Auth.js v5; search for next-auth usage in src/ | If `src/auth` contains multiple custom auth variants, narrow to canonical Auth.js v5. Create tasks to replace deviations. |
| RFQ Engine (forms → Neon DB with fallback) | Partial / Deviation | docs/ README (RFQ section), src/api/rfq, scripts/ | Verify reliability code paths, retry, and fallback to WhatsApp/Telegram. Remove any redundant channels that are undocumented. |
| Notifications (Resend, Telegram) | Compliant / Needs verification | docs/README.md, src/lib/notifications | Validate token usage is via secrets and notifications are idempotent. Add instrumentation tests. |
| Edge Runtime (Cloudflare Pages / @cloudflare/next-on-pages) | Compliant | next.config.ts, wrangler.json | Ensure all Edge-only modules use `edge` runtime entrypoints; flag server-only Node APIs used in Edge. |
| UI components & Design system (Tailwind v4, Radix / shadcn) | Partial / Deviation | src/components/, tailwind.config.ts | Component library may contain experimental/hallucinated components. Constrain to atomic set defined in docs/design tokens. |
| Tests (Jest, Playwright) | Partial / Deviation | jest.config.cjs, playwright.config.ts, tests/ | Tests exist — audit for brittle / randomly skipped tests. Establish strict TDD gates. |
| Agent harness / .agent | Deviation (missing formal harness) | .agent/, .agents/, AGENTS.md, skills-lock.json | There are agent-related files but no standardized Antigravity harness config. Provision `.agent/antigravity.yaml` and strict agent rules. |

Notes on hallucinations and scope creep:
- Any source files which implement features not referenced in `docs/` or `openspec/` must be flagged as "hallucinated". Use the Audit Matrix above to list discovered files during Phase 1 and add them to `openspec/changes/` as candidate removals or redesigns.
- Do not delete or modify production code until corresponding OpenSpec Proposal→Design→Spec→Task entry exists.

---

## 2) ECC Toolkit Installation & Harness Configuration Plan

Goal: Install and configure an ECC-based Antigravity harness that enforces deterministic workflows and prevents non-deterministic agent interventions.

Placement: `.agent/antigravity.yaml` (primary), companion files in `.agents/` and `openspec/agents/`.

Minimal components to provision:

- Agents (roles):
  - `architect` — reads `docs/` and `openspec/`, validates architectural compliance, proposes ADRs and OpenSpec proposals.
  - `code-reviewer` — performs static checks, semantic & lexical code searches, enforces coding-standards from `docs/engineering/governance/coding-standards.md`.
  - `tdd-guide` — ensures tests accompany each low-level task, auto-generates test stubs (Jest/Playwright) from Spec when appropriate.
  - `refactor-cleaner` — performs safe AST transformations (TS-Morph) for refactors approved by Design & Tests.

- Skills (capabilities):
  - `tdd-workflow` — implements Red/Green/Refactor lifecycle: generate failing test stubs, run tests, suggest minimal implementation, run tests again, propose refactor step.
  - `search-first` — enforces that all agent recommendations must be accompanied by lexical/semantic search evidence (`lexical-code-search` / `semantic-code-search`).
  - `verification-loop` — runs a verification pipeline after changes: lint -> unit tests -> integration tests -> e2e smoke -> coverage check.

- Rules & gating:
  - Source-of-Truth enforcement: no code change without an approved OpenSpec Task (path: `openspec/specs/<task-id>.md`). Agents must verify that `openspec/specs` contains the task and that it references the matching `docs/` files.
  - Context budget: agents get limited token/context window for repo inspections (configurable in `.agent/antigravity.yaml`) to avoid noisy hallucinations. Default: 8 files / 2,000 tokens per run for suggestions; full repo scans require explicit Architect approval.
  - Test gating: PR merges blocked unless:
    - All new behavior has at least one failing test that turned green as part of the PR's commits.
    - Project-level coverage >= 80% (enforced in CI).
  - CI gating: PR must pass `ci/antigravity-verification` workflow (lint, jest --coverage, playwright:e2e:smoke). Use `.github/workflows/antigravity-ci.yml` (create during ECC Setup phase).
  - Semantic evidence: code-reviewer agent must attach `lexical-code-search` result links and `semantic-code-search` snippets showing where similar patterns occur in repo.

- Hooks & Integrations:
  - Pre-commit hook: `husky` pre-push -> run `pnpm lint` and `pnpm test:unit` (fast subset).
  - Pre-merge GitHub action: `antigravity-verifier` that runs full verification-loop and posts artifacts (coverage, failing tests list, changed OpenSpec references).
  - PR template: include fields `OpenSpec Task ID`, `Design doc link`, `TDD test IDs` — automation rejects PRs without these.

- Files to create (examples but not yet applied):
  - `.agent/antigravity.yaml` — harness config (agents, skills, budgets, allowed file paths).
  - `.agents/roles/architect.yaml` — role definition & permissions.
  - `.github/workflows/antigravity-ci.yml` — verification pipeline.

---

## 3) OpenSpec Decomposition Roadmap (Domain-by-Domain)

Principle: decompose changes into atomic actionable tasks. Each task must have: Proposal -> Design -> Spec -> Task (openspec/specs/<id>.md) with linked tests in `tests/` and PRs referencing the Task ID.

Priority ordering (Phase 2 ordering):

1) Core Edge Middleware & Hostname Routing (Blocker)
   - Why first: central to Hub-and-Spoke behavior; all downstream routing and ISR rely on correct host resolution at the edge.
   - Tasks:
     - OP-EDGE-001: Audit existing middleware to confirm single responsibility (routing only). Produce a Proposal referencing docs/system/architecture/execution-lifecycle.md.
     - OP-EDGE-002: Create failing unit tests for hostname resolution logic (mock CF edge request). Implement minimal fixes.
     - OP-EDGE-003: Move any non-routing logic out of middleware into server components or API routes; create refactor tasks.

2) Database & Prisma (Schema, migrations, and seed data)
   - Why: data contracts (RFQ, client scopes) must be stable before changing API or UI.
   - Tasks:
     - OP-DB-001: Lock current `prisma/schema.prisma` as canonical. Create Design doc for Row-Level Security approach for client scopes.
     - OP-DB-002: Add integration tests using a sandbox Neon instance (or Docker-based Postgres fixture) verifying migrations and query correctness.
     - OP-DB-003: Audit and remove any direct SQL or duplicated models that circumvent Prisma client.

3) Sanity CMS Federation & GROQ (Content contracts)
   - Tasks:
     - OP-SANITY-001: Extract canonical GROQ queries used by spokes into `src/lib/sanity/queries.ts` and add unit tests that mock Sanity responses.
     - OP-SANITY-002: Implement caching tags & ISR verification tests; ensure ISR revalidation endpoints are documented in `docs/`.

4) Authentication & RBAC
   - Tasks:
     - OP-AUTH-001: Ensure Auth.js v5 is the single auth implementation. Replace any legacy or custom session handlers with the canonical config from docs.
     - OP-AUTH-002: Add unit tests for RBAC roles (`admin`, `viewer`, `client`) and integration tests for protected API endpoints.

5) RFQ Flow & Notifications
   - Tasks:
     - OP-RFQ-001: Add tests to simulate RFQ submission failures and confirm fallback to WhatsApp link + Telegram notification is triggered.
     - OP-RFQ-002: Harden retry logic, idempotency tokens, and instrumentation.

6) UI Component Library & Design Tokens
   - Tasks:
     - OP-UI-001: Create atomic component spec and migrate components referenced in `docs/` design tokens.
     - OP-UI-002: Add visual regression snapshots (Playwright snapshot tests) for critical pages.

7) Tests & CI Stabilization
   - Tasks:
     - OP-TEST-001: Convert brittle tests to strictly-scoped unit tests, add integration staging suite.
     - OP-TEST-002: Ensure Playwright E2E smoke tests run in headless pipeline and fail PR if they fail.

8) Cleanup Hallucinated Code
   - Tasks:
     - OP-CLEAN-001: For each file flagged in Phase 1 as hallucinated, create a Proposal in `openspec/changes/` listing why it is removed or redesigned; do not delete code until Task approved and tests in place.

Cross-cutting notes:
- Each task file created in `openspec/specs/` must include: ID, concise description, links to docs anchors, proposed tests (Jest/Playwright), rollback plan, and acceptance criteria.

---

## 4) TDD & Verification Strategy

Goal: Maintain or increase test coverage to >= 80% while moving code via Red-Green-Refactor for each approved task.

Testing layers & mapping:

- Unit tests (Jest): fast, isolated tests for util functions, Prisma client mocks, GROQ query formatting, and component logic where possible. Run in pre-commit and PR quick-check.
- Integration tests (Jest / node environment): database migrations (run against a disposable Neon test DB or Docker Postgres), API route handlers, middleware behavior in a Node simulation of Cloudflare Edge where feasible.
- End-to-end tests (Playwright): critical user flows (hostname routing to hub/spoke landing pages, RFQ submission, login flows). Keep a smoke suite for CI (fast subset) and a nightly full suite.

Enforcement & CI:
- CI pipelines (`.github/workflows/antigravity-ci.yml`) must implement stages:
  1. Lint & static type check (pnpm lint, pnpm build:tsc)
  2. Unit tests (Jest) — run with `--coverage` and upload coverage artifact.
  3. Integration tests — run against ephemeral test DB.
  4. Playwright smoke e2e — run headless on a pages preview or a test server.
  5. Coverage gate — fail if total coverage < 80%.

TDD Workflow per Task:
1. Proposal & Design approved in `openspec/specs/OP-<XXX>.md` referencing the docs anchor.
2. `tdd-guide` agent generates test stubs for the behavior described in Spec (one or more failing tests are committed).
3. Developer implements minimal code to satisfy tests, runs local verification.
4. `refactor-cleaner` suggests AST-level refactors (optional) after tests are green.
5. `code-reviewer` runs final checks and attaches lexical/semantic evidence. PR opened referencing the OpenSpec Task ID.

Verification Loop & Metrics:
- For each PR, produce an artifact package containing: failing→passing test traces (Jest snapshots), coverage delta, list of modified files with links to `docs/`/`openspec/` entries, and `lexical-code-search` evidence used by the agent.
- Maintain test flakiness metric: target <1% flaky test rate (tracked daily). Reflakify tests older than 7 days that fail intermittently.

Rollout & Canary Plan:
- When refactoring middleware or DB-critical code, use staged deployment with feature-flagged rollout (Cloudflare Pages + runtime config). If canary fails e2e smoke, revert via roll-forward or rollback commit published via CI.

---

## Acceptance Criteria for this Deliverable

- This Markdown file is present at `openspec/antigravity-system-blueprint.md`.
- It references canonical docs in `docs/` and low-level config in `openspec/config.yaml`.
- It defines at least one concrete next-step action: create `.agent/antigravity.yaml` and create `openspec/specs/OP-EDGE-001.md` to start Phase 2.

---

## Immediate Next Steps (Phase 1 → Phase 2 handoff)
1. Create `.agent/antigravity.yaml` with minimal agent roles and gating rules (Architect approval required for full repo-scans).
2. Create `openspec/specs/OP-EDGE-001.md` (Proposal) to begin the Edge middleware audit with linked tests (OP-EDGE-001-tests).
3. Run repository-wide lexical/semantic searches for any code paths not referenced in `docs/` and list them under `openspec/changes/op-clean-<N>.md`.

I'll add the `openspec/antigravity-system-blueprint.md` file to the repository now as the canonical first deliverable.
