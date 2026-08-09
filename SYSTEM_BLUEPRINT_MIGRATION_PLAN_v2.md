# System Blueprint & Migration Plan v2

**Project**: PT Daya Berkah Sentosa Nusantara (DBSN) — `arostech-hub`  
**Branch**: `refactor/reorganize-project-documentation`  
**Platform**: Antigravity AI Agent
**Date**: 2026-08-09  
**Supersedes**: `SYSTEM_BLUEPRINT_MIGRATION_PLAN.md` (v1, 2026-08-07)  
**Classification**: Internal — Engineering Architecture  

---

## 1. Expanded Architecture Audit Matrix

### 1.1 Methodology

Every row below was verified against the live state of the `refactor/reorganize-project-documentation` branch at commit `b8a7239`. Rows inherited from v1 are annotated with their v1 status; new rows added since v1 are marked `[NEW]`. The **Verdict** column reflects the current branch only.

### 1.2 Module-by-Module Comparison: Codebase vs HLA Documentation vs OpenSpec

| # | Modul / Komponen | HLA (`docs/`) | Codebase Aktual | OpenSpec (`openspec/`) | Verdict | v1 Drift? |
|---|---|---|---|---|---|---|
| 1 | **Hub-and-Spoke Middleware Routing** | `execution-lifecycle.md` (97 lines) — accurate anti-patterns, correct chain | Match with enhancements: query param `?subdomain=` preview, redirect loopback with LRU cache (500 entries, 5 min TTL) | No spec | **OK** — Perlu OpenSpec spec | No drift |
| 2 | **Subdomain Topology** | Docs use `solarcell`, `alatpetir` as spoke names | Code uses `solarpanel`, `penangkalpetir` as canonical with aliases `{solarcell→solarpanel, alatpetir→penangkalpetir}` in `pages-host.ts` | No spec | **DOC MISMATCH** | No drift — unchanged |
| 3 | **Dashboard Route Group** | 4 files say `/(dashboard)` route group (`deployment.md`, `dns-cutover.md`, `ai-agent-rules.md`, `extensibility.md`) | Flat `dashboard/` route (no route group). Confirmed by `execution-lifecycle.md` | No spec | **DOC MISMATCH** — 4 files contradict execution-lifecycle.md | **[NEW]** — v1 did not flag this internal doc inconsistency |
| 4 | **Prisma Schema** | Overview.md documents 3 core models (Lead, User, RedirectMap) | 7 models (added: Account, Session, VerificationToken, NotificationJob) + 7 enums. Extras are Auth.js adapter boilerplate + notification queue — legitimate | No spec | **DOC INCOMPLETE** — 4 models undocumented | No drift |
| 5 | **Sanity CMS Studio Schema** | Overview.md lists 5 content types | `studio/schemaTypes/index.ts` registers only 3: `spokeConfig`, `product`, `portfolioEntry`. Missing: `certification`, `page`. Code also queries `article` type (undocumented) | No spec | **CRITICAL** — Studio registration incomplete | No drift |
| 6 | **Sanity CMS Field Gaps** | Overview.md describes product fields including datasheets, SEO | GROQ queries reference fields (`datasheetFile`, `relatedCertifications`, `seoMeta`) not defined in studio schema files | No spec | **HIGH** — Field-level schema divergence | No drift |
| 7 | **Auth.js v5 JWT** | `reference.md`, `overview.md` — JWT strategy, role-based expiry, cookie config | Match. Includes Google OAuth, password reset, auth guards. `runtime = 'edge'` declared with PrismaAdapter eager import | No spec | **OK with RISK** — Edge runtime + PrismaAdapter incompatibility | No drift |
| 8 | **RFQ Pipeline (`POST /api/rfq`)** | `reference.md` shows simple flat schema (6 fields) | Implementation uses composite Zod schemas: `contactInfoSchema`, `rfqMetaSchema`, `rfqCartItemSchema` → `rfqB2BSchema`/`rfqB2GSchema` with cart array + UTM tracking | No spec | **DOC STALE** — reference.md schema is pre-cart version | No drift |
| 9 | **Notification Pipeline** | Resend, Telegram, WhatsApp (wa.me fallback) | Match + exceeds: DB-backed queue, optimistic concurrency, exponential backoff, 3 retries. Missing: provisioning email, revocation audit alert | No spec | **OK** — 2 minor triggers missing | No drift |
| 10 | **ISR Revalidation** | Webhook HMAC-SHA256, tag-based | Match | No spec | **OK** | No drift |
| 11 | **Dashboard Tracking Portal** | Documented in PRD and overview.md with tracking cards, scope filtering | **STUB**: `dashboard/page.tsx` = 11 lines (h1 + p). No tracking API, no cards | No spec | **CRITICAL** — Feature does not exist | Minor — v1 said 9 lines, now 11 (added `runtime = 'edge'`) |
| 12 | **Admin Lead Management** | Documented in overview.md | **MISSING**: No `GET /api/admin/leads`, no `PATCH /api/admin/leads/:id/status` | No spec | **CRITICAL** — 2 endpoints absent | No drift |
| 13 | **SEO (JSON-LD, Sitemap, Robots, Metadata)** | Documented | Implemented | No spec | **OK** | No drift |
| 14 | **Analytics: GA4** | Documented as active | Implemented | No spec | **OK** | No drift |
| 15 | **Analytics: PostHog** | PRD line 97: "Phase 2: Sentry + PostHog" | Fully integrated: `posthog-js` in deps, `src/lib/analytics/posthog.ts`, `useAnalytics` hook | No spec | **PHASE CREEP** — Doc says Phase 2, code says active | No drift |
| 16 | **Error Tracking: Sentry** | PRD: Phase 2 | Fully integrated: `@sentry/nextjs`, 3 config files, `sentry-example-page` route | No spec | **PHASE CREEP** | No drift |
| 17 | **21st SDK Agent Chat** | Not in AGENTS.md, PRD, or roadmap. Brief mention in overview.md codemap | Complete: 4 npm packages, `/api/an-token`, `src/app/chat/page.tsx` (30 lines), Vercel AI SDK | No spec | **HIGH SCOPE CREEP** — Full module undocumented | No drift |
| 18 | **Hardcoded Articles** | Not in HLA | `src/lib/api/articles.ts` = 174 lines of inline HTML in 6 Article objects. Duplicates Sanity `article` type | No spec | **MEDIUM** — Duplicate content source | Minor — v1 said 170 lines, now 174 |
| 19 | **Leaflet Maps** | Not documented | `leaflet` ^1.9.4, `react-leaflet` in deps, 2 map components | No spec | **LOW** — Undocumented dependency | No drift |
| 20 | **Framer Motion** | Not documented | `framer-motion` ^12.40.0 in deps | No spec | **LOW** | No drift |
| 21 | **Embla Carousel** | Not documented | `embla-carousel-react` ^8.6.0 in deps | No spec | **LOW** | No drift |
| 22 | **next-themes** | Not documented | `next-themes` ^0.4.6 in deps, ThemeProvider + ThemeToggle components | No spec | **LOW** | No drift |
| 23 | **sentry-example-page** | Not documented | `src/app/sentry-example-page/page.tsx` exists in production routes | No spec | **MEDIUM** — Dev artifact in production | No drift |
| 24 | **tailwind.config.ts** | Not documented | Exists, 53 lines of theme config. **Dead code** — Tailwind v4 uses CSS-first config | No spec | **MEDIUM** — Dead config file | No drift |
| 25 | **`ignoreBuildErrors: true`** | Not documented | Present with comment: "Run tsc separately; skip during Turbopack build to avoid OOM on Windows" | No spec | **HIGH RISK** — Type errors silently skipped | No drift |
| 26 | **`tsconfig.json` target ES2017** | Not documented | Confirmed ES2017 | No spec | **LOW** — Conservative target | No drift |
| 27 | **`package.json` name 'my-website'** | Not documented | Confirmed | No spec | **LOW** — Template residue | No drift |
| 28 | **Six Custom Rule Files** | Not in HLA | `.agents/rules/` contains `cloudflare-edge-runtime.md`, `cloudflare-pages-deploy.md`, `sanity-cms-federation.md`, `monorepo-workspace.md`, `tailwind-v4.md`, `prisma-neon-edge.md` — all **5 lines each, stub content only** (1 heading + 2 bullet points of generic guidance) | No spec | **HIGH** — Stub rules provide no enforcement | **[NEW]** — v1 planned these as "Custom Additions" but did not track their empty state |
| 29 | **AGENTS.md** | Points to `docs/engineering/governance/ai-agent-rules.md` | Still a thin 17-line pointer. **Not updated** with ECC agent roster, gating rules, or OpenSpec workflow requirements | N/A | **HIGH** — No harness coordination instructions | **[NEW]** — v1's Fase 3 planned an AGENTS.md update that was not executed |
| 30 | **ECC Agents Installed** | Not in HLA | `.agents/agents/` contains 29 agent definitions (architect, code-reviewer, tdd-guide, refactor-cleaner, typescript-reviewer, react-reviewer, planner, e2e-runner, harness-optimizer, + 20 others) | N/A | **OK** — Agents present | **[NEW]** |
| 31 | **ECC Skills Installed** | Not in HLA | `.agents/skills/` contains 35 skill definitions including `react-patterns`, `nextjs-turbopack`, `tdd-workflow` (manually migrated per v1 plan) | N/A | **OK** — Skills present | **[NEW]** |
| 32 | **ECC Common Rules Installed** | Not in HLA | `.agents/rules/` contains 32 rule files: 10 common, 4 typescript, 5 react, 6 web, 6 custom stubs, 1 prompt | N/A | **OK** — Rules present (but 6 stubs) | **[NEW]** |
| 33 | **OpenSpec Skills/Workflows** | Not in HLA | `.agent/skills/` has 12 OpenSpec skills, `.agent/workflows/` has 13 opsx workflows | N/A | **OK** — OpenSpec tooling present | **[NEW]** |
| 34 | **OpenSpec Zombie Change** | N/A | `changes/docs-restructuring-migration/tasks.md` — 56/56 tasks checked `[x]`, still in `changes/` not `archive/` | **ACTIVE** | **MEDIUM** — Violates OpenSpec lifecycle | Minor — v1 said 124 tasks, now 56 (recounted) |
| 35 | **OpenSpec config.yaml** | N/A | Only `schema: spec-driven` active. All `context`, `rules`, `operations` commented out | N/A | **MEDIUM** — No project context for AI agents | No drift |
| 36 | **PRD Domain References** | N/A | `prd.md` contains 5+ references to `dashboard.sentradaya.com` and `*.sentradaya.com` in CSP, plus `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `OPENAI_API_KEY` env vars that are fabricated | N/A | **HIGH** — Stale domain + hallucinated env vars in PRD | **[NEW]** — v1 flagged some sentradaya refs but not the full scope |
| 37 | **API Response Format** | `reference.md` uses `{success, data, error, meta}` envelope | PRD Section 8.1 uses `{data, meta, links}` envelope with pagination. Two incompatible formats across docs | No spec | **MEDIUM** — Inconsistent API contract in docs | **[NEW]** |
| 38 | **Auth Endpoint Pattern** | `reference.md` shows `GET/POST /api/auth/signin` + `callback/[provider]` | PRD Section 8.3 shows `POST /api/auth/login`, `POST /api/auth/client/login` — custom endpoints that don't exist | No spec | **MEDIUM** — PRD auth endpoints are fabricated | **[NEW]** |
| 39 | **Phase Status in Docs** | `overview.md` codemap: Phases 1-3 all "Active" | `roadmap.md`: Phase 3 "COMPLETE", Phase 4 "NOT STARTED" | N/A | **MEDIUM** — Contradictory phase status | **[NEW]** |
| 40 | **Testing/Strategy Doc** | 1,153-line TDD technical design doc | Contains fabricated Redis caching strategy, `dashboard.sentradaya.com` domain, `/404` rewrite anti-pattern, timeline contradicting roadmap.md | N/A | **HIGH** — AI-generated doc with hallucinated content | **[NEW]** |
| 41 | **Security Policy** | 31 lines | Contains 2 unfilled AI placeholder tokens in Indonesian | N/A | **MEDIUM** — Stub with placeholder text | **[NEW]** |
| 42 | **Deployment Runbook** | 110 lines | References Supabase secrets, stale Sanity API version, `RESEND_FROM_EMAIL = onboarding@resend.dev` | N/A | **MEDIUM** — Multiple stale references | **[NEW]** |

### 1.3 Severity Classification

| Severity | Count | Modules (by row #) |
|---|---|---|
| **CRITICAL** | 4 | 5 (Sanity studio gap), 11 (Dashboard stub), 12 (Admin API missing), 7 (Auth Edge risk) |
| **HIGH** | 8 | 17 (21st SDK scope creep), 25 (ignoreBuildErrors), 28 (6 rule files empty), 29 (AGENTS.md not updated), 36 (PRD stale domain + hallucinated env vars), 40 (testing/strategy.md hallucinated), 8 (RFQ reference stale), 2 (Subdomain naming) |
| **MEDIUM** | 13 | 18 (Hardcoded articles), 23 (sentry-example-page), 24 (tailwind.config.ts dead), 34 (OpenSpec zombie), 35 (config.yaml empty), 37 (API response format inconsistency), 38 (Auth endpoint pattern), 39 (Phase status), 41 (Security policy stub), 42 (Deployment runbook stale), 3 (Dashboard route group), 9 (RFQ reference) |
| **LOW** | 7 | 19-22 (Leaflet/Framer/Embla/next-themes), 26 (tsconfig ES2017), 27 (package.json name), 4 (Prisma model count), 6 (Sanity field gaps) |

### 1.4 Hallucinated vs. Scope Creep Classification

| Modul | Kategori | Bukti (verified on branch) | Rekomendasi |
|---|---|---|---|
| **21st SDK Agent Chat** | Scope Creep | 4 npm packages, 2 routes, 1 page; absent from AGENTS.md, PRD, roadmap | Decide: document, branch off, or remove |
| **PostHog Analytics** | Phase Creep | PRD says "Phase 2"; fully integrated in code | Update PRD status to Active |
| **Sentry** | Phase Creep | PRD says "Phase 2"; fully integrated in code | Update PRD status to Active |
| **PRD: Supabase refs** | Hallucinated | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` in PRD Section 11.1; no Supabase in stack | Remove from PRD |
| **PRD: OpenAI ref** | Hallucinated | `OPENAI_API_KEY` in PRD Section 11.1; no OpenAI integration | Remove from PRD |
| **PRD: Custom auth endpoints** | Hallucinated | `POST /api/auth/login`, `/api/auth/client/login` in PRD 8.3; code uses Auth.js catch-all | Remove or align with actual Auth.js pattern |
| **testing/strategy.md: Redis** | Hallucinated | Redis caching strategy (lines 862-875); Redis not in stack | Remove Redis sections |
| **testing/strategy.md: /404 rewrite** | Hallucinated | Rewrites unknown to `/404`; execution-lifecycle.md calls this anti-pattern | Correct to `new NextResponse(null, {status: 404})` |
| **Hardcoded Articles** | Duplicate/Dead Code | 174 lines inline HTML; Sanity `article` type exists in query layer | Migrate to Sanity CMS |
| **vision.md: domain recs** | Stale/Overridden | Recommends `dbsn.co.id` / `dbsnenergy.co.id`; locked to `dayaberkah.id` | Add SUPERSEDED header |

---

## 2. SDD (OpenSpec) x TDD (ECC) Framework Merge Strategy

### 2.1 Nesting Model

OpenSpec's Spec-Driven Development (SDD) lifecycle governs **what** gets built and **why**. ECC's TDD loop governs **how** each atomic unit is implemented and verified. The two frameworks nest as follows:

```
OpenSpec SDD Lifecycle (outer)
│
├── Proposal  ← Architect agent: scope, non-goals, impact
├── Design    ← Architect agent: decisions, alternatives, rollback
├── Spec      ← WHEN/THEN behavioral contracts (≥2 scenarios per requirement)
├── Tasks     ← Atomic, actionable checklist
│   │
│   └── For EACH task (inner cycle):
│       ├── RED:    Write failing test (tdd-guide agent)
│       ├── GREEN:  Minimal implementation to pass (any agent)
│       ├── REFACTOR: Clean up, maintain green (code-reviewer agent)
│       └── VERIFY: lint + typecheck + test + build pipeline
│
├── Apply     ← Execute tasks under TDD inner cycle
├── Verify    ← Full verification pipeline
└── Archive   ← Move to archive/, sync spec deltas
```

**Key constraint**: A task cannot be marked `[x]` in OpenSpec unless its TDD sub-cycle has completed (failing test written, implementation passes, refactor done, full pipeline green). This is enforced by the `verification-loop` skill and the `tdd-guide` agent.

### 2.2 Gate Sequence

| Gate | Trigger | Enforced By | Blocks Until |
|---|---|---|---|
| **Proposal Gate** | New OpenSpec change created | Architect agent | Scope aligned with Fase 0 docs |
| **Spec Completeness Gate** | Spec file saved | OpenSpec config rule (≥2 scenarios/requirement) | Each requirement has testable WHEN/THEN |
| **Task Atomicity Gate** | Tasks saved | Architect agent | Each task is single-responsibility, one TDD cycle |
| **RED Gate** | Task execution begins | tdd-guide agent | Failing test exists and fails for the right reason |
| **GREEN Gate** | Implementation starts | tdd-guide agent | Test passes; no more code than necessary |
| **REFACTOR Gate** | Code review | code-reviewer + typescript-reviewer + react-reviewer agents | No regression, complexity reduced, patterns followed |
| **VERIFY Gate** | Refactor complete | verification-loop skill | `pnpm lint` ✓, `pnpm test --coverage` ✓, `pnpm pages:build` ✓ |
| **Archive Gate** | All tasks `[x]` | OpenSpec workflow | Change moved to `archive/`, spec delta synced |

### 2.3 Rule File Authoring Content Plan

The six custom rule files in `.agents/rules/` are currently **5-line stubs**. Each must be authored to the following specification. The **Owner Agent** is the ECC agent responsible for enforcing the rule during code review. The **Acceptance Criterion** defines done.

#### 2.3.1 `cloudflare-edge-runtime.md`

- **Purpose**: Govern Edge/Node API boundaries for all code running on Cloudflare Workers Edge Runtime.
- **Must Enforce**:
  - No Node.js-only APIs (`fs`, `path`, `child_process`, `net`, `tls`) in files with `export const runtime = 'edge'` or in `src/middleware.ts`.
  - No Prisma Client import in middleware or edge routes — must use API loopback pattern with `AbortController` timeout.
  - Response body streaming required for payloads >1 MB (V8 isolate memory limit).
  - CPU time limit: 30 seconds for Workers, 50 ms for middleware subrequests (Cloudflare Pages constraint).
  - `wrangler.json` configuration patterns for binding KV, D1, R2 if added.
- **Owner Agent**: `typescript-reviewer` (Edge boundary is a type-safety and runtime-compatibility concern) + `code-reviewer` (general enforcement).
- **Acceptance Criterion**: Rule contains ≥5 specific forbidden API patterns with file-matcher scopes, ≥3 approved alternative patterns, and a table of Cloudflare Workers runtime limits applicable to this project.

#### 2.3.2 `cloudflare-pages-deploy.md`

- **Purpose**: Govern Cloudflare Pages deployment pipeline, build output structure, and preview deployment behavior.
- **Must Enforce**:
  - Build command: `pnpm pages:build` producing `.vercel/output/static`.
  - Deploy command: `npx wrangler pages deploy .vercel/output/static --project-name dbsn-website`.
  - No Vercel-specific APIs (`vercel.json`, `@vercel/og`, `vercel-analytics`).
  - Preview deployment domain resolution: `<branch>.dbsn-website.pages.dev` with subdomain prefix support.
  - `_routes.json` inclusion rules for Edge vs static routing.
- **Owner Agent**: `architect` (deployment architecture decisions).
- **Acceptance Criterion**: Rule contains the exact build/deploy command sequence, a table of preview vs production domain patterns, and ≥3 forbidden Vercel-specific imports.

#### 2.3.3 `sanity-cms-federation.md`

- **Purpose**: Govern GROQ query conventions, Sanity content type schema synchronization, and ISR cache tag naming.
- **Must Enforce**:
  - Cache tag format: `sanity:{type}`, `sanity:{type}:{id}`, `sanity:spoke:{subdomain}`, `sanity:all`.
  - GROQ queries must use `defineQuery()` from `next-sanity` — no raw string queries.
  - All query functions must follow null-on-error convention (return `null` on failure, never throw in production).
  - Studio schema types registered in `studio/schemaTypes/index.ts` must match all types queried in `src/lib/api/sanity/queries.ts`.
  - ISR revalidation via `revalidateTag()` only — no `revalidatePath()` for Sanity-driven pages.
  - Stega visual editing toggle: enabled in dev/preview, disabled in production.
- **Owner Agent**: `typescript-reviewer` (query type safety) + `react-reviewer` (RSC data fetching patterns).
- **Acceptance Criterion**: Rule contains the cache tag taxonomy, ≥3 GROQ convention rules, the null-on-error pattern with a code sketch, and a studio/query synchronization checklist.

#### 2.3.4 `monorepo-workspace.md`

- **Purpose**: Govern PNPM workspace structure, cross-package dependency management, and shared configuration.
- **Must Enforce**:
  - Workspace protocol (`workspace:*`) for intra-monorepo dependencies.
  - `pnpm-workspace.yaml` packages list must match actual directories.
  - No circular workspace dependencies.
  - Shared configs (`tsconfig.json`, `tailwind.config.ts`, `eslint.config.mjs`) live at root; workspace packages extend them.
  - Build order: studio (independent) → main app (depends on studio schemas at design-time only).
- **Owner Agent**: `typescript-reviewer` (type-aware dependency management).
- **Acceptance Criterion**: Rule contains the workspace structure diagram, ≥3 forbidden patterns (circular deps, non-workspace cross-references), and the build order specification.

#### 2.3.5 `tailwind-v4.md`

- **Purpose**: Govern Tailwind CSS v4 usage patterns, replacing v3 conventions that no longer apply.
- **Must Enforce**:
  - CSS-first configuration via `@theme` directive in `src/app/globals.css` — no `tailwind.config.ts` usage.
  - OKLCH design tokens for color system.
  - No `@apply` in production component files (allowed in `globals.css` only).
  - Mobile-first responsive design.
  - `@tailwindcss/postcss` as the PostCSS plugin (not `tailwindcss` directly).
- **Owner Agent**: `react-reviewer` (component styling patterns).
- **Acceptance Criterion**: Rule contains the `@theme` directive pattern with an example, a list of v3→v4 migration anti-patterns to avoid, and a reference to the correct PostCSS configuration.

#### 2.3.6 `prisma-neon-edge.md`

- **Purpose**: Govern Prisma ORM usage with Neon Postgres serverless driver, including Edge compatibility patterns.
- **Must Enforce**:
  - Prisma Client must use `@prisma/adapter-neon` for serverless pooled connections.
  - Lazy initialization via Proxy pattern (current `prisma.ts` approach) — no eager singleton in Edge-compatible modules.
  - `DATABASE_URL` for pooled connections, `DIRECT_URL` for migrations only.
  - No Prisma Client import in Edge runtime routes — use API loopback pattern.
  - Seed scripts run via `pnpm prisma db seed` with `DIRECT_URL`; never in Edge context.
  - Schema changes require: `schema.prisma` edit → `prisma generate` → migration → verify type generation.
- **Owner Agent**: `typescript-reviewer` (ORM type safety) + `database-reviewer` (query patterns).
- **Acceptance Criterion**: Rule contains the Proxy lazy-init pattern, the Edge/API-loopback decision matrix, the env var mapping (`DATABASE_URL` vs `DIRECT_URL`), and a schema migration checklist.

### 2.4 AGENTS.md Update Plan

- **File**: `/home/z/my-project/arostech-hub/AGENTS.md` (root)
- **Current State**: 17-line thin pointer to `docs/engineering/governance/ai-agent-rules.md`. No harness coordination instructions.
- **Owner Agent**: `architect` (defines harness structure and agent delegation rules).
- **Acceptance Criterion**: Updated AGENTS.md must contain:
  1. **Agent Roster Table**: Lists all 29 installed agents with their role and when to invoke each.
  2. **Delegation Rules**: Which agents are auto-delegated to (e.g., `.tsx` edits → `react-reviewer`; `.ts` edits → `typescript-reviewer`; new feature → `architect` then `tdd-guide`).
  3. **Gating Rules**: Reference the 6 custom rule files and their scope.
  4. **OpenSpec Workflow Requirement**: Every code change outside `docs/` must have a corresponding OpenSpec task.
  5. **ECC Skill Loading Order**: Which skills are auto-loaded vs on-demand for this project.
  6. **Source of Truth Hierarchy**: `docs/` (HLA) > `openspec/` (LLA) > `.agents/rules/` (enforcement) > code (implementation).

---

## 3. OpenSpec Decomposition Roadmap

### 3.1 Pre-Requisite Hygiene Tasks

These tasks must complete before any wave begins. They have no code impact.

| # | Task | Depends On | Output |
|---|---|---|---|
| 3.PH-1 | Archive zombie change: move `changes/docs-restructuring-migration/` to `changes/archive/docs-restructuring-migration/` with outcome summary | None | Archived change, clean `changes/` directory |
| 3.PH-2 | Populate `openspec/config.yaml` with project context (tech stack, domain), artifact rules (≥2 scenarios/requirement), operation guidance (archive within 24h) | None | Functional config.yaml |
| 3.PH-3 | Author content for 6 custom rule files per Section 2.3 | Fase 2 (rule content plan) | 6 rules with ≥5 enforcement items each |
| 3.PH-4 | Update AGENTS.md per Section 2.4 | Fase 2 (AGENTS.md plan) | Updated root AGENTS.md |

### 3.2 Wave Sequencing (Bottom-Up, Foundation First)

Each wave produces OpenSpec changes that follow the full SDD lifecycle (Proposal → Design → Spec → Tasks). Each task within a change executes the nested TDD sub-cycle from Section 2.1.

#### Wave 1: Foundation — Core Middleware & Edge Runtime
**Depends on**: Fase 0 (doc rewrite complete), Fase 1 (codebase-to-docs audit complete), 3.PH-1 through 3.PH-4

| # | OpenSpec Change | Task Summary | Priority | TDD Trigger |
|---|---|---|---|---|
| 3.1.1 | `middleware-edge-compatibility` | Audit and fix Edge Runtime compatibility in middleware and auth routes. If PrismaAdapter cannot run on Edge, refactor to API loopback. | Critical | Test: middleware chain for all 5 domain classes (hub, spoke, dashboard, unknown, preview) + Edge runtime constraint validation |
| 3.1.2 | `subdomain-naming-alignment` | Resolve `solarcell`/`alatpetir` (docs) vs `solarpanel`/`penangkalpetir` (code) mismatch. Decision: update docs or update code. | High | Test: `SPOKE_SUBDOMAINS` and `SUBDOMAIN_ALIASES` consistent with Fase 0 docs |
| 3.1.3 | `redirect-engine-hardening` | Validate and test LRU cache behavior, loopback timeout, concurrent request handling. | High | Test: Cache hit/miss, timeout at 2s, concurrent requests, fallback behavior |
| 3.1.4 | `build-configuration-hardening` | Set `ignoreBuildErrors: false`, update `tsconfig.json` target, fix resulting type errors, correct `package.json` name. | High | Test: `tsc --noEmit` passes clean, `pnpm pages:build` succeeds |

**Specs to create**: `hub-and-spoke-routing`, `edge-runtime-compatibility`

#### Wave 2: Database, Auth & Missing APIs
**Depends on**: Wave 1 (Edge runtime stable), Fase 0 (PRD auth endpoints corrected), 3.PH-3 (`prisma-neon-edge.md` rule active)

| # | OpenSpec Change | Task Summary | Priority | TDD Trigger |
|---|---|---|---|---|
| 3.2.1 | `dashboard-tracking-api` | Implement `GET /api/dashboard/tracking` with CLIENT role authorization, `linkedLeadId` scope filtering. | Critical | Test: Authorization enforcement (wrong role → 403), scope filtering (only linked leads), error responses |
| 3.2.2 | `admin-leads-api` | Implement `GET /api/admin/leads` (search/filter) and `PATCH /api/admin/leads/:id/status` (status transition). | Critical | Test: Admin-only access, search parameters, status transition validation (RECEIVED→CONTACTED→QUALIFIED/DISQUALIFIED) |
| 3.2.3 | `dashboard-tracking-ui` | Replace dashboard stub with actual tracking cards, project status, auth-gated layout. | Critical | Test: Dashboard renders tracking data, redirects unauthenticated users, respects scope |
| 3.2.4 | `prisma-schema-docs-sync` | Update docs to reflect all 7 Prisma models and 7 enums. | Medium | Test: Schema introspection matches documented model/field names |
| 3.2.5 | `notification-provisioning` | Implement dashboard provisioning email and revocation audit Telegram alert. | Medium | Test: Email sent on access grant, Telegram alert on revocation |

**Specs to create**: `dashboard-api-authorization`, `rfq-api-contract`, `auth-session-management`

#### Wave 3: CMS Federation & Content Layer
**Depends on**: Wave 2 (no code deps, but reduces concurrent change conflict), Fase 0 (PRD RFQ schema corrected), 3.PH-3 (`sanity-cms-federation.md` rule active)

| # | OpenSpec Change | Task Summary | Priority | TDD Trigger |
|---|---|---|---|---|
| 3.3.1 | `sanity-schema-reconciliation` | Audit studio schema vs GROQ queries vs TypeScript types. Add missing types (`certification`, `page`) or confirm they are cloud-managed. | Critical | Test: Every GROQ-queried field has a corresponding studio schema definition or documented cloud-managed exception |
| 3.3.2 | `hardcoded-articles-migration` | Migrate 6 hardcoded articles from `src/lib/api/articles.ts` to Sanity CMS `article` type. | High | Test: Articles fetched from Sanity; graceful empty state when Sanity unavailable; no inline HTML in source |
| 3.3.3 | `api-reference-update` | Rewrite `reference.md` RFQ schema to match composite Zod schema. Align auth endpoints with Auth.js v5 pattern. Standardize response envelope. | High | Test (docs): Cross-reference validation between reference.md and actual route handler signatures |
| 3.3.4 | `sanity-isr-revalidation-spec` | Document and test ISR revalidation webhook. | Medium | Test: HMAC signature verification, tag parsing, revalidateTag invocation, error responses |

**Specs to create**: `sanity-content-federation`, `content-migration`

#### Wave 4: API Surface & Notifications
**Depends on**: Wave 2 (admin APIs needed for notification triggers), Wave 3 (Sanity stable)

| # | OpenSpec Change | Task Summary | Priority | TDD Trigger |
|---|---|---|---|---|
| 3.4.1 | `notification-pipeline-spec` | Document notification pipeline behavioral contract. | Medium | Test: All trigger→channel mappings verified |
| 3.4.2 | `api-surface-contract` | Document all API endpoints with request/response schemas. | Medium | Test (docs): Endpoint inventory matches codebase |
| 3.4.3 | `an-token-decision` | Decide fate of 21st SDK Agent Chat: document as feature, branch off, or remove. | High | Test (if retained): Token endpoint auth + rate limit. Test (if removed): No 21st SDK imports remain |

**Specs to create**: `notification-pipeline`, `api-surface-contract`

#### Wave 5: UI Cleanup & Dashboard Completion
**Depends on**: Wave 2 (dashboard API exists), Wave 3 (content layer stable)

| # | OpenSpec Change | Task Summary | Priority | TDD Trigger |
|---|---|---|---|---|
| 3.5.1 | `scope-creep-cleanup` | Remove `sentry-example-page`, verify and remove `tailwind.config.ts` if confirmed dead code. | High | Test: `pnpm pages:build` succeeds without sentry-example-page; Tailwind classes still apply correctly |
| 3.5.2 | `undocumented-dependencies-audit` | Evaluate Leaflet, Framer Motion, Embla Carousel, next-themes — document or remove. | Medium | Test: Bundle size audit; no unused dependencies |
| 3.5.3 | `dashboard-completion` | Full dashboard tracking portal UI with project status cards. | Critical | Test: E2E flow from login → dashboard → view tracking data |

**Specs to create**: (uses `dashboard-api-authorization` from Wave 2)

#### Wave 6: Documentation & Governance Alignment
**Depends on**: Fase 1 audit findings, all prior waves

| # | OpenSpec Change | Task Summary | Priority | TDD Trigger |
|---|---|---|---|---|
| 3.6.1 | `doc-stale-reference-fixes` | Fix all `sentradaya.com` → `dayaberkah.id`, all `/(dashboard)` → `dashboard/`, all broken relative links. | High | N/A (docs-only change, no TDD) |
| 3.6.2 | `security-policy-completion` | Complete security-policy.md: remove placeholder tokens, add incident response procedure. | Medium | N/A (docs-only) |
| 3.6.3 | `testing-strategy-rewrite` | Rewrite `testing/strategy.md`: remove Redis, fix domains, fix anti-patterns, align timeline with roadmap.md. | High | N/A (docs-only, but verify existing tests still pass after any test code references change) |
| 3.6.4 | `hlf-docs-phase-update` | Update overview.md Phase Status table, PRD PostHog/Sentry status to Active. | Medium | N/A (docs-only) |

---

## 4. TDD & Verification Strategy

### 4.1 Current Test Inventory (verified on branch)

| Category | Count | Location |
|---|---|---|
| Unit/Integration (Jest) | 49 files | `src/__tests__/`, `src/lib/**/__tests__/`, `src/app/api/**/__tests__/` |
| E2E (Playwright) | 5 files | `tests/e2e/` |
| **Total** | **54 files** | |

### 4.2 Coverage Target Matrix

Target: **80%+ overall maintained** (not merely targeted — coverage gates prevent regression below current baseline).

| Domain | Target | Current Test Files | Gaps | Wave That Closes Gap |
|---|---|---|---|---|
| Middleware Routing | 90% | 6 files | Cloudflare Pages preview host resolution, query param subdomain, redirect loopback timeout edge cases | Wave 1 (3.1.1, 3.1.3) |
| RFQ System | 90% | 5 files | API integration test with Prisma mock, notification trigger verification for new triggers | Wave 2 (3.2.5), Wave 4 (3.4.1) |
| Authentication | 85% | 3 files | Edge Runtime compatibility test, JWT expiry by role, Google OAuth flow | Wave 1 (3.1.1) |
| Dashboard Access | 85% | 1 file (implicit) | **CRITICAL GAP**: Dashboard tracking API tests (does not exist yet), `requireDashboardAccess()` tests | Wave 2 (3.2.1, 3.2.2, 3.2.3) |
| Sanity Queries | 80% | 3 files | Null-on-error for all query functions, field-level accuracy after schema reconciliation | Wave 3 (3.3.1) |
| Notifications | 80% | 4 files | Provisioning email, revocation audit alert, cron batch processing | Wave 2 (3.2.5) |
| SEO | 80% | 6 files | Adequate | — |
| Analytics | 70% | 3 files | Event names match HLA spec verification | Wave 6 (3.6.4) |
| UI Components | 70% | 10+ files | A11y tests, RSC/Client boundary verification | Wave 5 (3.5.3) |
| API Routes | 80% | 4 files | Dashboard tracking, admin leads (not yet testable — no implementation) | Wave 2 (3.2.1, 3.2.2) |

### 4.3 Wave-to-Suite Mapping

Each wave maps to specific test suites that must be created or updated. The SDD gate (Section 2.2) ensures these tests are written before implementation.

| Wave | New Jest Test Files Required | New Playwright Specs Required | Existing Suites Updated |
|---|---|---|---|
| Wave 1 | `middleware/edge-compatibility.test.ts`, `middleware/preview-host.test.ts`, `config/tsconfig.test.ts` | — | `middleware.test.ts`, `lib/middleware/__tests__/*` |
| Wave 2 | `api/dashboard/tracking.test.ts`, `api/admin/leads.test.ts`, `api/notifications/provisioning.test.ts`, `dashboard/layout.test.tsx`, `dashboard/page.test.tsx` | `dashboard-tracking.spec.ts`, `admin-leads.spec.ts` | `lib/auth/__tests__/auth-guard.test.ts`, `lib/db/__tests__/prisma.test.ts` |
| Wave 3 | `lib/api/sanity/__tests__/schema-sync.test.ts`, `lib/api/articles.test.ts` | — | `lib/api/sanity/__tests__/queries.test.ts`, `lib/api/sanity/__tests__/client.test.ts` |
| Wave 4 | `api/an-token-decision.test.ts` (if retained or removed) | — | `lib/api/notifications/__tests__/*` |
| Wave 5 | `dashboard/tracking-ui.test.tsx` | `dashboard-full-flow.spec.ts` | All component test files |
| Wave 6 | (Docs-only — no new test files) | — | (Verify existing tests pass after any reference changes) |

### 4.4 Mocking Strategy

| External Service | Mock File | Pattern | Enforced By Rule |
|---|---|---|---|
| Prisma | `src/lib/__mocks__/prisma.ts` | Mock `PrismaClient` constructor; support `$transaction` callback | `prisma-neon-edge.md` (Wave 2+) |
| Sanity.io | `src/lib/__mocks__/sanity.ts` | Mock `createClient` + `groq`/`defineQuery` from `next-sanity`; use `dynamic import()` in tests | `sanity-cms-federation.md` (Wave 3+) |
| Resend | `src/lib/__mocks__/resend.ts` | Mock `Resend` constructor with `emails.send` | Existing pattern |
| Telegram | `src/lib/__mocks__/telegram.ts` | Mock `global.fetch` with structured Telegram API responses | Existing pattern |
| NextAuth | `jest-environment/next-auth-mock.js` | Mock `auth()`, `signIn()`, `signOut()` | Existing pattern |

### 4.5 Verification Pipeline

This pipeline is triggered at three gates. The **SDD VERIFY gate** (Section 2.2) triggers the full pipeline. The **pre-commit** and **pre-merge** gates are CI-enforced variants.

```
pre-commit (local, fast):
  ├── pnpm lint
  ├── pnpm test --changedSince=main
  └── tsc --noEmit

pre-merge (CI, full):
  ├── pnpm lint
  ├── pnpm test --coverage
  ├── pnpm pages:build
  ├── Coverage threshold: 80% (block if below)
  └── playwright tests (critical-path specs only)

post-deploy (production validation):
  ├── Lighthouse CI (PSI mobile 90+ target)
  ├── E2E smoke test (hub, 1 spoke, dashboard login)
  └── Uptime monitoring verification
```

### 4.6 How Verification Ties to the SDD Cycle

The SDD cycle from Section 2.1 makes verification operational at two levels:

1. **Per-task level**: Each OpenSpec task's TDD sub-cycle ends with the **VERIFY gate** — the agent runs `pnpm lint && pnpm test --changedSince=main && tsc --noEmit` after each GREEN/REFACTOR step. If any step fails, the task cannot be marked `[x]`.

2. **Per-change level**: After all tasks in an OpenSpec change are `[x]`, the **SDD Verify step** runs the full pre-merge pipeline (`pnpm test --coverage && pnpm pages:build`). If coverage drops below 80%, the change cannot proceed to Archive.

3. **Per-wave level**: After all changes in a wave are archived, the **post-deploy validation** runs (Lighthouse, E2E smoke). This is the final quality gate before the next wave begins.

---

## 5. Execution Timeline

### 5.1 Fase 0 — Fundamental Alignment

**Rationale**: The team no longer trusts the high-level documentation because it was generated during a period of non-deterministic scope creep and hallucinated architecture. This phase rewrites `docs/` starting from the PRD and cascading through every file, making them internally consistent with each other. Codebase reality is deliberately excluded as an input — Fase 0 produces the doc set that Fase 1 will later audit the code against.

| # | Task | Output | Owner Agent | Duration |
|---|---|---|---|---|
| 0.1 | Rewrite `docs/strategy/prd.md`: remove all `sentradaya.com` → `dayaberkah.id`, remove Supabase/OpenAI/`NEXTAUTH_SECRET` hallucinated env vars (use `configuration-schema.md` as authoritative source), align auth endpoints to Auth.js v5 catch-all pattern, align RFQ schema to composite cart model, align API response envelope to `{success, data, error, meta}` | Corrected PRD | `architect` | 2h |
| 0.2 | Rewrite `docs/strategy/vision.md`: add SUPERSEDED header to Section II (GTM domain recommendations overridden), remove "200+ projects" unverified claim, remove duplicate compatibility matrix (points to `compatibility-matrix.md`) | Corrected vision | `architect` | 1h |
| 0.3 | Rewrite `docs/system/api/reference.md`: replace flat RFQ schema with composite Zod schema, align auth endpoints to Auth.js v5, standardize response envelope | Corrected API reference | `architect` | 1.5h |
| 0.4 | Rewrite `docs/engineering/playbooks/testing/strategy.md`: remove all Redis references, fix `sentradaya.com` → `dayaberkah.id`, fix `/404` rewrite to `new NextResponse(null, {status: 404})`, align middleware code with actual helper pattern (`cleanHostname`, `isHubDomain`), align timeline with `roadmap.md` | Corrected TDD strategy | `tdd-guide` | 3h |
| 0.5 | Rewrite `docs/operations/security/security-policy.md`: remove AI placeholder tokens, add incident response procedure, add CVE disclosure process | Completed security policy | `security-reviewer` | 1h |
| 0.6 | Fix `docs/operations/runbooks/deployment.md`: remove Supabase secrets, fix Sanity API version to `v2025-05-21`, fix dashboard route to `dashboard/` (flat), fix `RESEND_FROM_EMAIL` | Corrected deployment runbook | `architect` | 0.5h |
| 0.7 | Fix all `/(dashboard)` → `dashboard/` in: `dns-cutover.md`, `ai-agent-rules.md`, `extensibility.md` | Consistent dashboard routing across docs | `architect` | 0.5h |
| 0.8 | Fix `docs/strategy/roadmap.md`: align Phase Status (Phase 3 COMPLETE, Phase 4 NOT STARTED), fix date inconsistency | Corrected roadmap | `architect` | 0.5h |
| 0.9 | Fix `docs/system/architecture/overview.md`: update Phase Status table to match roadmap.md | Corrected overview | `architect` | 0.25h |
| 0.10 | Fix `docs/strategy/segments.md`: correct `prd-v3.md` → `prd.md` reference, fix section numbering (4.2 duplicate → 4.3) | Corrected segments | `architect` | 0.25h |
| 0.11 | Fix `docs/engineering/playbooks/quickstart.md`: fix all stale relative paths, fix Method B hosts file from `sentradaya.com` → `dayaberkah.id` | Corrected quickstart | `architect` | 0.5h |
| 0.12 | Cross-reference validation pass: grep all docs for stale paths, verify no broken links remain | Validation report | `architect` | 0.5h |

**Fase 0 Total Estimate**: ~12 hours

### 5.2 Fase 1 — High-Level Alignment: Codebase-to-Docs

**Rationale**: Using the Fase 0 docs as the now-trusted baseline, audit the actual codebase against them. This inverts v1's original Fase 1, which audited assuming docs were already correct.

| # | Task | Output | Owner Agent | Duration |
|---|---|---|---|---|
| 1.1 | Audit middleware implementation against Fase 0 `execution-lifecycle.md`: verify chain, test all 5 domain classes, check for anti-patterns | Middleware conformance report | `code-reviewer` + `typescript-reviewer` | 2h |
| 1.2 | Audit Prisma schema against Fase 0 docs: verify all 7 models and 7 enums are now documented | Schema conformance report | `database-reviewer` | 1h |
| 1.3 | Audit Sanity CMS: verify studio schema registration vs GROQ queries vs TypeScript types. Determine which types are cloud-managed | CMS conformance report | `code-reviewer` | 2h |
| 1.4 | Audit API routes against Fase 0 `reference.md`: verify all endpoints exist, request/response schemas match | API conformance report | `typescript-reviewer` | 1.5h |
| 1.5 | Audit auth implementation against Fase 0 docs: verify JWT strategy, role-based expiry, Edge compatibility | Auth conformance report | `typescript-reviewer` | 1.5h |
| 1.6 | Compile findings into actionable gap list, cross-referenced to Wave assignments in Fase 3 | Gap list (input to Fase 3) | `architect` | 1h |

**Fase 1 Total Estimate**: ~9 hours

### 5.3 Fase 2 — SDD x TDD Collaboration Strategy

**Rationale**: Define and operationalize the merge of OpenSpec SDD and ECC TDD. Author the 6 empty rule files and update AGENTS.md. This phase produces the enforcement infrastructure that Fase 3 and Fase 4 depend on.

| # | Task | Output | Owner Agent | Duration |
|---|---|---|---|---|
| 2.1 | Author `.agents/rules/cloudflare-edge-runtime.md` per Section 2.3.1 | Completed rule file | `typescript-reviewer` | 1.5h |
| 2.2 | Author `.agents/rules/cloudflare-pages-deploy.md` per Section 2.3.2 | Completed rule file | `architect` | 1h |
| 2.3 | Author `.agents/rules/sanity-cms-federation.md` per Section 2.3.3 | Completed rule file | `typescript-reviewer` + `react-reviewer` | 1.5h |
| 2.4 | Author `.agents/rules/monorepo-workspace.md` per Section 2.3.4 | Completed rule file | `typescript-reviewer` | 1h |
| 2.5 | Author `.agents/rules/tailwind-v4.md` per Section 2.3.5 | Completed rule file | `react-reviewer` | 1h |
| 2.6 | Author `.agents/rules/prisma-neon-edge.md` per Section 2.3.6 | Completed rule file | `typescript-reviewer` + `database-reviewer` | 1.5h |
| 2.7 | Update root `AGENTS.md` per Section 2.4 | Updated AGENTS.md | `architect` | 2h |
| 2.8 | Populate `openspec/config.yaml` with project context, artifact rules, operation guidance | Functional config | `architect` | 0.5h |
| 2.9 | Archive zombie OpenSpec change (`docs-restructuring-migration`) | Archived change | `architect` | 0.25h |
| 2.10 | Verify rule file acceptance criteria (each ≥5 enforcement items, owner agent assigned) | Verification report | `code-reviewer` | 1h |

**Fase 2 Total Estimate**: ~11.25 hours

### 5.4 Fase 3 — Low-Level Decomposition (openspec/)

**Rationale**: Review and clean up proposals, designs, and tasks under `openspec/`. Decompose system requirements into atomic, actionable tasks, each one triggering a TDD cycle under the Fase 2 merge strategy.

| # | Task | Output | Owner Agent | Duration |
|---|---|---|---|---|
| 3.0 | Pre-requisite hygiene: 2.PH-1 through 2.PH-4 (from Section 3.1) | Clean OpenSpec state | `architect` | 1h |
| 3.1 | Create OpenSpec changes for Wave 1 (4 changes: `middleware-edge-compatibility`, `subdomain-naming-alignment`, `redirect-engine-hardening`, `build-configuration-hardening`) with full SDD artifacts | 4 proposal.md + 4 design.md + 2 spec.md + 4 tasks.md | `architect` + `tdd-guide` | 4h |
| 3.2 | Create OpenSpec changes for Wave 2 (5 changes) | 5 proposal.md + 5 design.md + 3 spec.md + 5 tasks.md | `architect` + `tdd-guide` + `database-reviewer` | 5h |
| 3.3 | Create OpenSpec changes for Wave 3 (4 changes) | 4 proposal.md + 4 design.md + 2 spec.md + 4 tasks.md | `architect` + `tdd-guide` | 4h |
| 3.4 | Create OpenSpec changes for Wave 4 (3 changes) | 3 proposal.md + 3 design.md + 2 spec.md + 3 tasks.md | `architect` + `tdd-guide` | 3h |
| 3.5 | Create OpenSpec changes for Wave 5 (3 changes) | 3 proposal.md + 3 design.md + 0 new spec.md + 3 tasks.md | `architect` + `tdd-guide` + `react-reviewer` | 3h |
| 3.6 | Create OpenSpec changes for Wave 6 (4 changes) | 4 proposal.md + 4 design.md + 0 new spec.md + 4 tasks.md | `architect` | 3h |

**Fase 3 Total Estimate**: ~23 hours

### 5.5 Fase 4 — Codebase Refactoring (Red-Green-Refactor)

**Rationale**: Execute the decomposed tasks from Fase 3's OpenSpec changes. Each task follows the nested TDD sub-cycle: write a failing test, implement the minimal change to pass it, refactor, then verify via the full lint/test/build pipeline.

| # | Task | Output | Owner Agent | Duration |
|---|---|---|---|---|
| 4.1 | Execute Wave 1 tasks (middleware + build hardening) — 4 OpenSpec changes, ~15 tasks | Green tests, refactored code, archived changes | `tdd-guide` + `typescript-reviewer` | 8h |
| 4.2 | Execute Wave 2 tasks (database + auth + missing APIs) — 5 OpenSpec changes, ~20 tasks | Green tests, refactored code, archived changes | `tdd-guide` + `typescript-reviewer` + `database-reviewer` | 12h |
| 4.3 | Execute Wave 3 tasks (CMS federation) — 4 OpenSpec changes, ~12 tasks | Green tests, refactored code, archived changes | `tdd-guide` + `code-reviewer` | 8h |
| 4.4 | Execute Wave 4 tasks (API surface + notifications) — 3 OpenSpec changes, ~8 tasks | Green tests, refactored code, archived changes | `tdd-guide` + `code-reviewer` | 5h |
| 4.5 | Execute Wave 5 tasks (UI cleanup + dashboard completion) — 3 OpenSpec changes, ~10 tasks | Green tests, refactored code, archived changes | `tdd-guide` + `react-reviewer` + `code-reviewer` | 10h |
| 4.6 | Execute Wave 6 tasks (docs + governance) — 4 OpenSpec changes, ~15 tasks | Updated docs, archived changes | `architect` + `code-reviewer` | 5h |
| 4.7 | Full verification pass: lint + test (80%+) + build + Lighthouse + E2E smoke | Verification report | `e2e-runner` + `code-reviewer` | 3h |

**Fase 4 Total Estimate**: ~51 hours

### 5.6 Risk Register

Carried forward from v1 and updated. v1 risk IDs preserved for traceability.

| ID | Risk | Likelihood | Impact | Mitigation | v1 Mapping | Status on Branch |
|---|---|---|---|---|---|---|
| R1 | Auth Edge Runtime incompatibility — PrismaAdapter import is eager, not Edge-compatible | High | Critical | Wave 1 task 3.1.1 — test on Edge; if fails, refactor to API loopback pattern | v1 R1 | **UNCHANGED** — Still present |
| R2 | Sanity schema managed in cloud, not in repo — studio/schemaTypes/ may not reflect production | High | Medium | Wave 3 task 3.3.1 — audit and document; if cloud-managed, update docs to reflect | v1 R2 | **UNCHANGED** — Still 3/6 types in studio |
| R3 | `ignoreBuildErrors: true` hides type errors that will surface when flipped | High | Medium | Wave 1 task 3.1.4 — fix type errors incrementally before flip | v1 R3 | **UNCHANGED** — Still true, now with comment explaining rationale |
| R4 | 21st SDK agent chat adds undocumented complexity | Medium | Medium | Fase 0 decision + Wave 4 task 3.4.3 | v1 R4 | **UNCHANGED** — Still present, still undocumented |
| R5 | OpenSpec specs for 6+ modules require significant effort before coding | Medium | Low | Fase 3 produces all specs upfront; architect agent handles bulk creation | v1 R5 | **PARTIALLY ADDRESSED** — Fase 3 now explicitly schedules spec creation |
| R6 | ECC Antigravity adapter does not support hooks — scope creep prevention relies on rules alone | Medium | Medium | Kompensated by 6 custom rule files (once authored in Fase 2) and AGENTS.md gating | v1 R6 | **PARTIALLY ADDRESSED** — Rules installed but empty; Fase 2 authors them |
| R7 | Dashboard tracking portal is a large feature, entirely unstarted | High | High | Wave 2 (API) + Wave 5 (UI) — specs first, then incremental implementation | v1 R7 | **UNCHANGED** — Still a stub |
| **R8** | **[NEW]** HLA docs contain hallucinated content (Redis, Supabase, OpenAI, custom auth endpoints, stale domains) that mislead AI agents | **High** | **High** | **Fase 0 rewrites all affected docs before any code audit** | N/A | **Root cause of the Fase 0 addition** |
| **R9** | **[NEW]** 6 custom rule files are stubs (5 lines each) — no enforcement until Fase 2 completes | **Medium** | **Medium** | **Fase 2 authors all 6 files with specific enforcement criteria** | N/A | **New finding on this branch** |
| **R10** | **[NEW]** AGENTS.md has no harness coordination instructions — agents may operate without gating | **Medium** | **Medium** | **Fase 2 task 2.7 updates AGENTS.md with roster, delegation, and gating rules** | N/A | **New finding on this branch** |
| **R11** | **[NEW]** `testing/strategy.md` (1,153 lines) contains fabricated technical content that could pollute agent context | **High** | **Medium** | **Fase 0 task 0.4 rewrites this file** | N/A | **New finding on this branch** |

### 5.7 Success Criteria

Carried forward from v1 and updated.

| ID | Criteria | Target | Metric | v1 Mapping | Status on Branch |
|---|---|---|---|---|---|
| SC1 | Architecture Alignment | 100% modules documented | Every module in Audit Matrix (Section 1) verdict = OK or DOC INCOMPLETE (addressed) | v1 SC1 | **More findings** — 42 rows vs v1's 21 |
| SC2 | OpenSpec Coverage | 10+ behavioral specs | All core modules have WHEN/THEN specs in `openspec/specs/` | v1 SC2 | **Raised from 6 to 10** to cover new specs |
| SC3 | ECC Harness Score | 8+/12 categories | Output from `/harness-audit` after Fase 2 | v1 SC3 | **Now measurable** — agents/skills/rules installed |
| SC4 | Test Coverage | 80%+ maintained | `pnpm test --coverage` never drops below baseline | v1 SC4 | **49 Jest + 5 Playwright** files (v1: 44+5) |
| SC5 | Build Health | 0 type errors | `ignoreBuildErrors: false`, `tsc --noEmit` clean | v1 SC5 | **Not yet achieved** |
| SC6 | PSI Mobile | 90+ | Lighthouse CI after Fase 4 | v1 SC6 | **Not yet measured** |
| SC7 | Documentation Currency | 0 stale references | No `sentradaya.com`, no Supabase, no OpenAI, no broken relative links, consistent dashboard route representation | v1 SC7 | **11 stale domain refs, 6 route group inconsistencies, 5 broken paths** |
| **SC8** | **[NEW]** Rule File Completeness | 6/6 rules authored | Each rule file has ≥5 enforcement items and assigned owner agent | N/A | **0/6 currently** (all stubs) |
| **SC9** | **[NEW]** AGENTS.md Harness Coordination | Contains agent roster, delegation rules, gating rules, OpenSpec workflow requirement | Meets acceptance criteria in Section 2.4 | N/A | **Not met** (thin pointer only) |
| **SC10** | **[NEW]** Fase 0 Doc Trustworthiness | 0 files in "Needs Fase 0 Rewrite" category | All 25 HLA docs pass cross-reference validation | N/A | **5 files need rewrite** (PRD, vision, testing/strategy, security-policy, reference.md) |

---

*End of System Blueprint & Migration Plan v2*
*Next Step: Review and approve Fase 0 scope, then begin doc rewrite*