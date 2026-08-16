---
trigger: model_decision
description: >
  Unified 8-Layer Development Workflow — Graphify-Anchored, SDD-Governed, TDD-Verified.
  Supersedes: common-development-workflow.md (deleted).
  Authority: docs/engineering/governance/0xrizz-workflow.md (v5.0.0 LOCKED_BASELINE) & AGENTS.md.
supersedes: common-development-workflow.md
version: 5.0.0
---

# Extended Development Workflow (8-Layer)

> **Supersedes**: `common-development-workflow.md` (deleted)
> **Authority**: [`0xrizz-workflow.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/0xrizz-workflow.md#L1-L335) (v5.0.0, `LOCKED_BASELINE`), [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md)
> **Scope**: All feature development, bug fixes, and refactoring in `arostech-hub`

Every development session MUST follow this 8-layer sequence.
**Skipping a layer is a governance violation.** Each layer has explicit gate conditions.

> **Terminal & Shell Standard**: All CLI commands, verification loops, build steps, and automation scripts across all 8 layers MUST be executed within **Git Bash** (`bash`) using POSIX syntax and forward-slash (`/`) path separators. PowerShell and `cmd.exe` proprietary syntax are prohibited.

---

## Sequence Overview

```
L0 Context Boot (Graphify BFS + Stale Cache Auto-Sync)
  └── L1 HLA Alignment (docs/ 7-Pillars)
        └── L2 Research & Reuse (Context7 / GitHub)
              └── L3 SDD Contract Scaffolding (Standard /opsx-propose vs Fast-Track /opsx-ff)
                    └── L4 Agent Routing & Harness Auto-Gating (Domain Glob Matrix)
                          └── L5 TDD Inner Loop [Isolated AAA RED-GREEN-REFACTOR-VERIFY]
                                └── L6 Incremental Memory Sync (graphify update .)
                    └── L7 Strict Zero-Regression Verification (85.0%+ Coverage, CF Build <25MB)
                          └── L8 Commit, PR & Archive
```

---

## LAYER 0: Context Boot (Graphify) — Every Session

**Purpose**: Inject active memory before any work begins. Agent MUST NOT start implementation without this layer.

```bash
# 1. Semantic query for current task
graphify query "<feature/task being worked on>"
# Returns: affected nodes, related specs, existing patterns

# 2. Dependency chain (when touching a specific module)
graphify path "<module A>" "<module B>"
# Returns: dependency chain, impact radius

# 3. Breadth overview (if wiki exists)
# Navigate graphify-out/wiki/index.md — do NOT dump raw files
```

**If Graphify MCP is active** (preferred for multi-agent):
Use `query_graph`, `get_node`, `get_neighbors`, `god_nodes`, `shortest_path` MCP tools directly.

**Gate**: Session CANNOT proceed to L1 until context bubble is established.

**Ponytail Check**: Does this feature already exist in the graph? → **Reuse first**. If node already exists, propose extension, not re-implementation.

---

## LAYER 1: HLA Alignment (docs/)

**Purpose**: Validate that the work is aligned with the High-Level Architecture before committing to a spec.

```
1. Read docs/strategy/prd/00-overview-and-goals.md → Validate feature is in PRD scope
2. Read domain-specific docs/ → Understand HLA constraints
3. Cross-check: docs/ internally consistent? (7-Pillars validation)
```

**Gate**: NO code change without PRD alignment. If feature is not in PRD, stop and propose change to PRD first.

**Ponytail Check (YAGNI)**: If feature is not in PRD, do not implement. Raise a proposal to `docs/strategy/prd/00-overview-and-goals.md` first and wait for approval.

---

## LAYER 2: Research & Reuse

**Purpose**: Prevent reinventing the wheel. Mandatory before any new implementation.

```
1. GitHub search first — gh search code, gh search repos
   → Find existing implementations, templates, patterns
2. Context7 second — library docs (React, Next.js, Prisma, Auth.js, etc.)
   → Confirm API behavior, package usage, version-specific details
3. Package registry — npm, crates.io, etc.
   → Prefer battle-tested libraries over hand-rolled solutions
4. Exa / web search — only when steps 1-3 are insufficient
```

**Gate**: A proven solution that solves ≥80% of the problem MUST be adopted/ported rather than written from scratch.

**Ponytail enforcement**: Adopt or port > write net-new. The simplest solution that actually works wins.

---

## LAYER 3: SDD Proposal (OpenSpec — outer loop start)

**Purpose**: Create behavioral contracts BEFORE writing any implementation code.

```
1. Standard Feature Lane:
   /opsx-propose <change-name>  or  /opsx-new <change-name>
   ├── proposal.md  — scope, non-goals, impact
   ├── design.md    — decisions, alternatives, rollback plan
   ├── specs/*.md   — GIVEN-WHEN-THEN behavioral contracts (≥2 scenarios/requirement)
   └── tasks.md     — atomic checklist (each task = 1 TDD inner loop)

2. Fast-Track Hotfix Lane:
   /opsx-ff hotfix-<name>
   └── Single-file delta spec for 1-line security/typo hotfixes (eliminates governance lockout)

After spec creation:
  graphify update .   # sync new spec nodes to knowledge graph (AST-only, $0.00 cost, T_AST < 500ms)
```

**Gate (Proposal)**: Scope must be aligned with PRD (L1 verified).
**Gate (Spec Completeness)**: Spec-to-Test Multiplier: ≥2 GIVEN-WHEN-THEN scenarios per requirement mapping to ≥4 executable assertions.
**Gate (Task Atomicity)**: Each task in `tasks.md` = single responsibility = exactly one TDD inner loop cycle.
> Human approval of specs is required before proceeding to L4/L5.

---

## LAYER 4: Agent Delegation (Harness — Auto-gating)

**Purpose**: Route each task to the correct domain-specialist agent before TDD execution.

```
[ Incoming Task ]
  │
  ├── .tsx file edit         ──► react-reviewer ──► typescript-reviewer
  ├── .ts file edit          ──► typescript-reviewer
  ├── prisma/ edit           ──► database-reviewer ──► typescript-reviewer
  ├── src/middleware.ts      ──► typescript-reviewer (Edge boundary — read cloudflare-edge-runtime.md)
  ├── studio/** edit         ──► react-reviewer (GROQ + Stega — read sanity-cms-federation.md)
  ├── docs/ edit             ──► doc-updater (7-Pillars compliance check)
  ├── auth / security file   ──► security-reviewer
  ├── multi-file feature     ──► planner ──► architect ──► tdd-guide
  └── build failure          ──► build-error-resolver / react-build-resolver
```

**Domain rule gating**: Before modifying files in a specific domain, read the corresponding rule file from `.agents/rules/`. See [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md) Section 2.3 for the full Platform Rule File Gating table.

**Ponytail model selection**:
- Haiku → lightweight, frequently-invoked agents (worker agents in parallel squads)
- Sonnet → main development work, complex coding tasks
- Opus → complex architectural decisions, maximum reasoning required

**Parallel execution**: Independent tasks in the same wave MUST be executed in parallel. See `common-agents.md` for Delegation Completion Contract.

---

## LAYER 5: TDD Execution (ECC — inner loop, per-task)

**Pre-condition**: An OpenSpec spec file MUST exist with GIVEN-WHEN-THEN for this task (L3 completed). If no spec exists, run `/opsx-propose` first. Do NOT enter TDD without a spec.

For **each task** in `tasks.md`:

### RED Phase (`tdd-guide` agent)
- Derive test cases directly from the spec's WHEN/THEN clauses with Spec-to-Test Multiplier ($\ge 4$ assertions/req)
- Write failing test that MUST fail before production code is written
- Verify test fails for the correct reason (not a configuration error)
- **Gate (RED)**: Test exists and fails correctly

### GREEN Phase
- Write the MINIMAL implementation to pass the test
- No over-engineering. No premature abstraction.
- **Ponytail**: Laziest solution that actually works. Delete speculative code.
- **Gate (GREEN)**: Test passes, no unnecessary code added

### REFACTOR Phase (`code-reviewer` + domain reviewer)
- Clean code while keeping all tests green
- Apply domain rules from `.agents/rules/` (cloudflare-edge-runtime, tailwind-v4, etc.)
- Ponytail review: delete unused exports, speculative abstractions, dead flexibility
- **Gate (REFACTOR)**: No regression, all project patterns followed, no rule violations

### VERIFY Phase (`verification-loop` skill)
```bash
pnpm lint                          # lint gate
pnpm test --changedSince=main      # 85.0%+ branch coverage gate (AAA isolated)
tsc --noEmit                       # type gate
```
- ALL must be green before task is marked `[x]`
- **Gate (VERIFY)**: All green → mark task `[x]` in tasks.md → proceed to L6

---

## LAYER 6: Post-Task Memory Sync (Graphify)

**Purpose**: Keep knowledge graph current after each completed task. Critical for multi-session work and agent handoffs.

```bash
# After each task [x]:
graphify update .    # sync AST changes — no API cost ($0.00, T_AST < 500ms)
```

New module nodes, dependency edges, and spec relationships are updated immediately.
This enables the next agent (or next session) to boot context correctly at L0.

---

## LAYER 7: Change Verification (SDD — outer loop close)

**Purpose**: Verify that the complete change (all tasks [x]) matches the original specs.

```bash
# 1. Verify implementation matches specs
/opsx-verify

# 2. Full pre-merge pipeline (must all pass)
pnpm lint                    # ✓
pnpm test --coverage         # ✓  (≥85.0% branch coverage threshold — hard gate)
rm -rf .open-next && pnpm pages:build # ✓  (Fresh Cloudflare Pages build, <25MB bundle)

# 3. Docs validation (if any docs/ were modified)
node .agents/scripts/validate-ai-docs.cjs
```

**Gate (VERIFY)**: If coverage drops below 85.0% → **BLOCK archive**. Fix coverage first.
**Gate (MERGE)**: 0 residual legacy domain references (`sentradaya.com`). 0 hallucinated env vars.

---

## LAYER 8: Commit, PR & Archive

**Purpose**: Commit, publish, and archive the completed change.

```bash
# 1. Conventional commit
git commit -m "feat(scope): description"
# Types: feat, fix, refactor, docs, test, chore, perf, ci
# See: common-git-workflow.md for full format

# 2. Archive the OpenSpec change
/opsx-archive
# Moves change artifacts to archive/, syncs spec deltas to main specs

# 3. Create GitHub PR
/pr
# Analyzes full commit history, drafts PR summary with test plan

# 4. Final knowledge graph sync
graphify update .    # final AST sync post-archive
```

**Gate (ARCHIVE)**: PR merged → wave checkpoint recorded. OpenSpec changes archived within 24 hours of completion.

---

## Quick Reference Card

```
SESSION START
  └── L0: graphify query "<task>"          ← ALWAYS first
        └── L1: Read docs/ PRD alignment   ← ALWAYS second
              └── L2: Research & reuse     ← Before any custom code

CHANGE LIFECYCLE
  └── L3: /opsx-propose (get human approval)
        └── L4: Route to correct agent(s)
              └── L5: [per task] RED → GREEN → REFACTOR → VERIFY
                    └── L6: graphify update . (after each task [x])
        └── L7: /opsx-verify + full pipeline
              └── L8: commit + /opsx-archive + /pr + graphify update .
```

---

## Cross-References

| Layer | Primary Rule/Skill |
|-------|--------------------|
| L0 | [`graphify.md`](file:///d:/dev/arostech-hub/.agents/rules/graphify.md#L1-L100) — navigation priority + MCP tools |
| L1 | [`ai-friendly-docs.md`](file:///d:/dev/arostech-hub/.agents/rules/ai-friendly-docs.md#L1-L75) — 7-Pillars standard |
| L2 | [`search-first`](file:///d:/dev/arostech-hub/.agents/skills/search-first/SKILL.md#L1-L50) skill |
| L3 | [`openspec-propose`](file:///d:/dev/arostech-hub/.agents/skills/openspec-propose/SKILL.md#L1-L50) skill |
| L4 | [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md) — auto-gating matrix |
| L5 | [`common-testing.md`](file:///d:/dev/arostech-hub/.agents/rules/common-testing.md#L1-L80) + [`typescript-coding-style.md`](file:///d:/dev/arostech-hub/.agents/rules/typescript-coding-style.md#L1-L100) |
| L6 | [`graphify.md`](file:///d:/dev/arostech-hub/.agents/rules/graphify.md#L1-L100) — `graphify update .` ($T_{AST} < 500\text{ms}$) |
| L7 | [`0xrizz-workflow.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/0xrizz-workflow.md#L1-L335) — Strict Zero-Regression Gate ($\ge 85.0\%$) |
| L8 | [`common-git-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-git-workflow.md#L1-L30) — conventional commits |
