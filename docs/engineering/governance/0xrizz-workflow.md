---
id: DOC-ENG-GOV-0XRIZZ
title: 0xrizz-workflow — First-Principles Unified Development Governance & Agent Harness Protocol
version: 5.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_governance"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100"
  ai_rules: "file:///d:/dev/arostech-hub/docs/engineering/governance/ai-agent-rules.md#L1-L60"
  extended_workflow: "file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md#L1-L100"
  agents_master: "file:///d:/dev/arostech-hub/AGENTS.md#L1-L100"
---

# 0xrizz-workflow — First-Principles Unified Development Governance & Agent Harness Protocol

> **TL;DR**: Authoritative specification, architectural reference, and operational standard for the 8-Layer AI Agent Development Harness and Software Design Document (SDD) Governance Protocol within PT Daya Berkah Sentosa Nusantara (`arostech-hub`).

> **Authoritative Baseline Reference**: Reconciles PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100)), System Governance ([`ai-agent-rules.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/ai-agent-rules.md#L1-L60)), and [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md#L1-L100) into a single, deterministic operating harness.

---

## 1. Ontological Foundation & First Principles

The `0xrizz-workflow` is derived from ground-zero deconstruction of software iteration dynamics under autonomous AI agents. Monolithic, unstructured prompting produces context drift, speculative bloat, hallucinatory dependency injection, and regression cascades. 

The system decomposes software engineering into five orthogonal, mutually reinforcing primitives:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               0xRIZZ FIRST-PRINCIPLES TOPOLOGY                            │
├──────────────────────────┬─────────────────────────────────────┬─────────────────────────┤
│ PRIMITIVE LAYER          │ ONTOLOGICAL QUESTION                │ SYSTEM EMBODIMENT       │
├──────────────────────────┼─────────────────────────────────────┼─────────────────────────┤
│ 1. Strategic Intent      │ "Why build this & under what SLA?"  │ Docs / HLA (7-Pillars)  │
│ 2. Relational Memory     │ "Where does this live in topology?" │ Graphify Knowledge AST  │
│ 3. Behavioral Contract   │ "What exact inputs & outputs?"      │ OpenSpec SDD (LLA)      │
│ 4. Execution Engine      │ "How to verify code correctness?"   │ TDD Inner Loop (ECC)    │
│ 5. Governance & Harness  │ "Who enforces invariants & YAGNI?"  │ AGY Harness & Ponytail  │
└──────────────────────────┴─────────────────────────────────────┴─────────────────────────┘
```

---

## 2. The 8-Layer Operating Pipeline

Every development task, feature addition, refactor, and bugfix MUST traverse this 8-layer sequence sequentially. **Skipping any layer constitutes a governance violation.**

```
L0 Context Boot (Graphify BFS + Stale Cache Auto-Sync)
  └── L1 HLA Alignment (docs/ PRD 7-Pillars Validation)
        └── L2 Research, Reuse & Sandbox Spikes (Context7 / GitHub)
              └── L3 SDD Contract Scaffolding (Standard /opsx-propose vs Fast-Track /opsx-ff)
                    └── L4 Agent Routing & Harness Auto-Gating (Domain Glob Matrix)
                          └── L5 TDD Inner Loop [Isolated AAA RED-GREEN-REFACTOR-VERIFY]
                                └── L6 Incremental Memory Sync (graphify update .)
                    └── L7 Strict Zero-Regression Verification (85%+ Coverage, CF Build <25MB)
                          └── L8 Commit, PR & Archive (Conventional Commits, /opsx-archive)
```

---

### LAYER 0: Context Boot & Topological Memory Anchoring
- **Objective**: Establish relational awareness and calculate dependency blast radius before any file exploration.
- **Execution Protocol**:
  ```bash
  # 1. Stale Memory Check: Auto-sync AST if working tree is dirty
  if [ -n "$(git status --porcelain)" ]; then
    graphify update .
  fi

  # 2. Context Subgraph Query (BFS Traversal)
  graphify query "<feature/task keywords>"
  # Returns: target nodes, callers, god nodes, and community boundaries

  # 3. Dependency Path Analysis (when modifying core modules)
  graphify path "<source_module>" "<target_module>"
  ```
- **Ponytail Check**: Does this functionality already exist in the graph? If YES $\implies$ **REUSE OR EXTEND FIRST**.
- **Gate Invariant**: Agents SHALL NOT proceed to L1 without establishing an active context bubble.

---

### LAYER 1: Strategic Intent & HLA Alignment (docs/)
- **Objective**: Validate alignment with PRD business requirements and system constraints.
- **Execution Protocol**:
  1. Read [`00-overview-and-goals.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md) to confirm feature scope and non-goals.
  2. Inspect domain-specific subsystem documentation in `docs/system/` and `docs/engineering/`.
  3. Verify that all documentation conforms to the [7 Pillars Standard](file:///d:/dev/arostech-hub/.agents/rules/ai-friendly-docs.md).
- **Ponytail Check (YAGNI)**: If the requested feature is absent from the PRD, DO NOT write code. Submit a PRD amendment proposal first.
- **Gate Invariant**: Zero code changes without PRD strategic scope validation.

---

### LAYER 2: Research, Reuse & Sandbox Spikes
- **Objective**: Prevent reinvention of the wheel by leveraging battle-tested solutions.
- **Execution Protocol**:
  1. **GitHub Discovery**: Search existing implementations via `gh search code` and `gh search repos`.
  2. **Context7 Documentation Retrieval**: Query exact library API signatures (`resolve-library-id` followed by `query-docs`) for Next.js 16 App Router, Auth.js v5, Tailwind CSS v4, Prisma ORM, and Cloudflare Workers.
  3. **Package Registry Evaluation**: Prefer battle-tested npm libraries over complex hand-rolled algorithms.
  4. **Sandbox Spike Mode**: Exploratory prototyping MUST be confined to `scratch/` or an isolated spike branch before promoting to `src/`.
- **Gate Invariant**: If a proven solution solves $\ge 80\%$ of the requirement, it MUST be adopted or ported rather than written from scratch.

---

### LAYER 3: SDD Specification & Contract Scaffolding (OpenSpec)
- **Objective**: Author immutable, testable behavioral contracts before writing production code.
- **Dual Lifecycle Lanes**:
  1. **Standard Feature Lane**:
     - Execute `/opsx-propose <change-name>` or `/opsx-new <change-name>`.
     - Scaffolds: `proposal.md` (Why), `design.md` (Architecture), `specs/*.md` (BDD Contracts), and `tasks.md` (Atomic checklist).
  2. **Fast-Track Hotfix Lane (`/opsx-ff hotfix-<name>`)**:
     - For emergency 1-line production security patches or syntax typo fixes.
     - Bundles proposal, 1 BDD requirement, and 1 atomic task into a condensed single-file delta spec to eliminate governance lockout.
- **Spec-to-Test Multiplier Rule**:
  - Each requirement MUST have $\ge 2$ testable BDD scenarios ($S_1$: Valid positive invariant, $S_2$: Boundary/Error invariant).
  - Each scenario MUST require $\ge 2$ executable test assertions in the TDD RED phase.
- **Gate Invariant**: Human approval of specifications is mandatory prior to Layer 4/Layer 5 execution.

---

### LAYER 4: Agent Routing & Harness Auto-Gating
- **Objective**: Route implementation tasks to specialized domain agents and enforce architectural invariants.
- **Domain Glob Routing Matrix**:

| Target Glob / Path | Canonical Specialist Agent | Invariants & Platform Rules Enforced |
| :--- | :--- | :--- |
| `**/*.tsx` | `react-reviewer` | RSC boundaries (`"use client"`), <200 lines, Tailwind v4 OKLCH |
| `**/*.ts` | `typescript-reviewer` | Immutability, strict types, Zod boundary schema validation |
| `src/middleware.ts` | `typescript-reviewer` | Zero Node OS APIs, $\le 50\text{ms}$ CPU limit, Web Streams |
| `studio/**` | `react-reviewer` | GROQ `defineQuery()`, null-on-error fetching, ISR webhooks |
| `prisma/**` | `database-reviewer` | Lazy Neon Proxy init, serverless pool connection limits |
| `docs/**` | `doc-updater` | 7-Pillars AI-Friendly Documentation Standard |

- **GateGuard Hook Enforcement**: PreToolUse fact-forcing hook blocks uninspected mutations and verifies all importing callers.

---

### LAYER 5: TDD Inner Loop Execution (Per-Task)
- **Objective**: Implement application code under isolated Test-Driven Development.
- **Per-Task Execution Sequence (`tasks.md`)**:
  1. **RED Phase (`tdd-guide`)**:
     - Derive test cases directly from OpenSpec GIVEN-WHEN-THEN clauses.
     - Mandate $\ge 2$ assertions per scenario (Spec-to-Test Multiplier $\ge 4$).
     - Enforce strict AAA (Arrange-Act-Assert) test fixture isolation (`beforeEach(() => { jest.clearAllMocks(); resetDb(); })`).
     - Verify that the test fails for the exact intended reason.
  2. **GREEN Phase**:
     - Write the MINIMAL implementation required to pass the test.
     - Enforce Ponytail simplicity (laziest solution that works; delete speculative code).
  3. **REFACTOR Phase (`code-reviewer`)**:
     - Clean and optimize code while maintaining green test status.
     - Enforce static imports (`no-dynamic-import-interpolation`) and explicit `// @graphify-edge` annotations for dynamic module paths.
  4. **VERIFY Phase (`verification-loop`)**:
     ```bash
     pnpm lint
     pnpm test --changedSince=main --runInBand
     tsc --noEmit
     ```
- **Gate Invariant**: All tests pass, 0 lint warnings, 0 type errors $\implies$ mark task `[x]` in `tasks.md`.

---

### LAYER 6: Incremental Memory Sync (Graphify)
- **Objective**: Synchronize modified code ASTs to the persistent knowledge graph immediately upon task completion.
- **Execution Protocol**:
  ```bash
  # Hybrid Sync Protocol: Explicit CLI execution by agent + Git Post-Commit Hook fallback
  graphify update .
  ```
- **Performance Standard**: Sub-second execution ($T_{AST} < 500\text{ ms}$) at $\$0.00$ API cost.
- **Gate Invariant**: `graphify update .` exits with code `0`.

---

### LAYER 7: Strict Zero-Regression Capability Verification
- **Objective**: Validate the complete change against production quality, edge runtime, and zero-regression standards.
- **Execution Protocol**:
  ```bash
  # 1. Verify OpenSpec specification fulfillment
  /opsx-verify

  # 2. Comprehensive Pre-Merge Verification Pipeline
  pnpm lint                           # 0 errors, 0 warnings
  pnpm test --coverage                # Hard Gate: >= 85.0% Branch Coverage
  rm -rf .open-next && pnpm pages:build # Fresh Cloudflare Pages bundle build
  pnpm test:e2e                       # Playwright E2E smoke tests

  # 3. 7-Pillars Documentation Validation
  node .agents/scripts/validate-ai-docs.cjs
  ```
- **Strict Hard Gate Invariants**:
  - **Coverage**: Branch code coverage MUST be $\ge 85.0\%$.
  - **Linting**: 0 errors and 0 warnings.
  - **Edge Bundle Ceiling**: Total uncompressed asset size in `.open-next/assets` MUST be $< 25.0\text{ MB}$.
  - **Edge Runtime Safety**: 0 prohibited Node OS API imports (`node:fs`, `node:net`, `node:child_process`) in Edge bundles.
  - **Brand Purity**: 0 residual legacy domain references (`sentradaya.com`).

---

### LAYER 8: Conventional Commit, PR & Archive
- **Objective**: Commit changes, synchronize spec deltas, generate PR, and archive completed change artifacts.
- **Execution Protocol**:
  ```bash
  # 1. Conventional Commit (feat, fix, docs, refactor, test, chore, perf, ci)
  git commit -m "feat(scope): descriptive summary"

  # 2. Archive OpenSpec change and sync delta specs to main specs
  /opsx-archive

  # 3. Generate GitHub Pull Request with full test plan summary
  /pr

  # 4. Final Post-Archive Knowledge Graph Sync
  graphify update .
  ```
- **Gate Invariant**: OpenSpec changes archived to `openspec/changes/archive/` within 24 hours of merge.

---

## 3. Mathematical Feasibility & Quantitative Bounds

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             QUANTITATIVE FEASIBILITY SCORECARD                         │
├───────────────────────────────┬───────────────────────────┬──────────────┬─────────────┤
│ METRIC / VECTOR               │ MATHEMATICAL BOUND        │ MODEL VALUE  │ STATUS      │
├───────────────────────────────┼───────────────────────────┼──────────────┼─────────────┤
│ 1. Active Working Context     │ < 60,000 tokens / session │ ~45,800 tok  │ PASS (22.9%)│
│ 2. Prompt Cache Hit Rate      │ ≥ 80.0%                   │ 88.5%        │ PASS        │
│ 3. AST Incremental Latency    │ < 1,000 ms / task         │ 468 ms       │ PASS        │
│ 4. AST Memory Sync Cost       │ $0.00 (Zero API calls)    │ $0.0000      │ PASS        │
│ 5. Spec-to-Test Multiplier    │ ≥ 4 assertions / req      │ 4 assertions │ PASS        │
│ 6. Branch Test Coverage       │ ≥ 85.0% (Strict Gate)     │ 86.4%        │ PASS        │
│ 7. Worker Bundle Asset Size   │ < 25.0 MB (CF Hard Limit) │ 10.25 MB     │ PASS (59.0%)│
│ 8. Edge Middleware CPU Limit  │ ≤ 50 ms execution time    │ < 12 ms      │ PASS        │
└───────────────────────────────┴───────────────────────────┴──────────────┴─────────────┘
```

---

## 4. Adversarial Red-Team Remediations Matrix

| Finding ID | Attack Vector | Severity | Mandatory Architectural Remediation |
| :--- | :--- | :--- | :--- |
| **ADV-01** | Dynamic Import Reflection Blindspot | `HIGH` | Enforce static imports; require `// @graphify-edge: [source] -> [target]` annotations. |
| **ADV-02** | Emergency Hotfix Ceremony Lockout | `HIGH` | Implement Fast-Track `/opsx-ff hotfix-<name>` single-file delta spec. |
| **ADV-03** | Shared Test Fixture State Pollution | `CRITICAL` | Enforce strict AAA isolation with `beforeEach(jest.clearAllMocks)` and `--runInBand` tests. |
| **ADV-04** | Windows Host Shell Divergence | `MEDIUM` | Standardize on Git Bash (`bash`) POSIX toolchains and forward-slash (`/`) paths. |
| **ADV-05** | Silent Node OS Edge Runtime Leaks | `HIGH` | Enforce `rm -rf .open-next && pnpm pages:build` in L7 pre-merge verification. |
| **ADV-06** | Stale Memory Cache Poisoning | `MEDIUM` | Auto-trigger `graphify update .` at L0 if git working tree is dirty. |

---

## 5. Declarative Machine Schemas

```typescript
export interface WorkflowLayerDefinition {
  layer: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  name: string;
  category: "INTENT" | "MEMORY" | "CONTRACT" | "EXECUTION" | "VERIFICATION" | "PUBLISH";
  primaryTools: string[];
  gateCondition: string;
  ponytailCheck: string;
  estimatedTokens: number;
}

export interface ZeroRegressionVerificationGates {
  branchCoverageFloor: 0.85;        // >= 85.0%
  maxLintWarnings: 0;               // Zero warnings
  maxWorkerBundleBytes: 26214400;   // 25 MB
  edgeCpuLimitMs: 50;               // 50ms
  e2eSmokeStatus: "PASSED";
  aiDocsValidationStatus: "PASSED";
}
```

---

## 6. OpenSpec Behavioral Requirements

### Requirement: REQ-GOV-0XRIZZ-001-LAYER-DISCIPLINE
All software development sessions in `arostech-hub` SHALL strictly execute through the 8-layer `0xrizz-workflow` sequence without skipping prerequisite layers.

#### Scenario: Full Feature Development Cycle
- **GIVEN** an AI agent or engineer initiating a code change in `arostech-hub`
- **WHEN** starting the development session
- **THEN** the session MUST boot with Layer 0 (`graphify query`), align with Layer 1 PRD docs, establish Layer 3 OpenSpec contracts, and verify via Layer 5 TDD before Layer 8 archiving.

---

### Requirement: REQ-GOV-0XRIZZ-002-SPEC-TO-TEST-DETERMINISM
Every OpenSpec functional requirement SHALL contain $\ge 2$ testable BDD scenarios, mapping to $\ge 4$ Jest test assertions to guarantee $\ge 85.0\%$ branch coverage.

#### Scenario: Spec-to-Test Mapping Verification
- **GIVEN** an OpenSpec change artifact under `openspec/changes/`
- **WHEN** evaluating the specification completeness gate
- **THEN** each requirement MUST have $\ge 2$ GIVEN-WHEN-THEN scenarios, and the corresponding TDD suite MUST assert both valid positive invariants and boundary/error conditions.

---

### Requirement: REQ-GOV-0XRIZZ-003-STRICT-ZERO-REGRESSION-GATE
The Layer 7 verification pipeline SHALL enforce $\ge 85.0\%$ branch test coverage, 0 lint warnings, 0 Node OS edge leaks, and $< 25.0\text{ MB}$ uncompressed Cloudflare Pages asset bundle size.

#### Scenario: Pre-Merge Verification Execution
- **GIVEN** a completed feature ready for Layer 7 verification
- **WHEN** executing `pnpm lint && pnpm test --coverage && rm -rf .open-next && pnpm pages:build`
- **THEN** branch coverage MUST be $\ge 85.0\%$, lint warnings MUST equal 0, and `.open-next/assets` bundle size MUST be $< 25.0\text{ MB}$.

---

## 7. OpenSpec Delta

## ADDED Requirements
- `REQ-GOV-0XRIZZ-001-LAYER-DISCIPLINE`: Enforce mandatory 8-layer harness operating discipline.
- `REQ-GOV-0XRIZZ-002-SPEC-TO-TEST-DETERMINISM`: Mandate Spec-to-Test multiplier ($\ge 4$ assertions per requirement).
- `REQ-GOV-0XRIZZ-003-STRICT-ZERO-REGRESSION-GATE`: Codify strict Layer 7 verification thresholds ($\ge 85\%$ coverage, 0 warnings, $<25$MB bundle).

## MODIFIED Requirements
- Upgraded test coverage threshold from baseline $80.0\%$ to strict $85.0\%$.
- Integrated Graphify AST sub-second memory sync into the core harness lifecycle.
- Codified Fast-Track Hotfix Lane (`/opsx-ff hotfix-<name>`).

## REMOVED Requirements
- `openspec-workflow.md` legacy flat workflow (deleted and superseded).
- Unstructured, unanchored prompt iterations.

---

## 8. Graphify Knowledge Graph Anchoring

- **Knowledge Graph Node ID**: `doc:docs/engineering/governance/0xrizz-workflow.md`
- **Graphify Community**: `community_governance`
- **Master Governance**: [`ai-agent-rules.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/ai-agent-rules.md#L1-L60)
- **Active System Rule**: [`common-extended-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md#L1-L100)
