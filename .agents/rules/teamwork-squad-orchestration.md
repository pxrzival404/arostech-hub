---
trigger: model_decision
description: Squad orchestration protocol for multi-agent teamwork-preview sessions — Draft-First, PRD cascade, L4 alignment, and merge gates.
---

# Teamwork Squad Orchestration & Dynamic Cascade Rule

> **Scope**: All multi-agent operations, document alignment tasks, and complex refactoring in `arostech-hub`.
> **Standard**: ECC Agent Squad Orchestration Baseline v4.0.0
> **Workflow context**: This rule governs **Layer 4 (Agent Delegation)** — Squad mode expansion of the auto-gating matrix.
> See [`AGENTS.md Section 3.2`](file:///d:/dev/arostech-hub/AGENTS.md) for the base auto-gating matrix.

---

## Mandate & Operating Invariants

### 1. Draft-First Alignment
When requested to run `/teamwork-preview` or multi-agent squad orchestration, the agent MUST present a structured draft prompt/plan artifact for user review BEFORE initiating agent execution or spawning parallel tasks.

### 2. PRD-First Root SSOT Cascade
All architectural documentation modifications MUST cascade top-down from `docs/strategy/prd.md` (Root SSOT). The cascade order MUST follow:
`PRD` → `Strategy & Identity` → `Core Architecture & API` → `Ops & SecOps` → `TDD & Governance`.

### 3. Dynamic Task Expansion & Decision Autonomy
Agent Squads are granted decision autonomy. If an agent discovers undocumented modules, missing Zod schemas, unanchored URIs, or incomplete runbooks during deep exploration, the agent SHALL dynamically create new Kanban work items and execute them.

### 4. Squad Role Breakdown

**Squad Role ↔ Layer 4 Auto-Gating Alignment**:
| Squad Role | File Type / Trigger | Primary Agents |
|------------|--------------------|-----------------|
| `SQ-STRATEGY` | PRD / `docs/strategy/` | `planner`, `architect` |
| `SQ-SYSTEM` | `.ts`, `.tsx`, middleware | `typescript-reviewer`, `architect` |
| `SQ-OPS` | Deploy configs, security files | `security-reviewer`, `architect` |
| `SQ-QA` | New feature (any file) | `tdd-guide` |
| `SQ-INTEGRATOR` | Post-all-tasks merge | `code-reviewer`, `loop-operator` |

- `Lead Architect` (`architect`): Kanban board owner & architectural decision maker.

### 5. Strict Merge Gate Requirements (Layer 7 Alignment)
A work item CANNOT move to `Merged` status unless ALL of the following pass:
- Full **Layer 7 build pipeline**: `pnpm lint ✓` + `pnpm test --coverage (≥80%) ✓` + `pnpm pages:build ✓`
- `node .agents/scripts/validate-ai-docs.cjs` passes with 0 issues across all modified files.
- 0 residual legacy domain (`sentradaya.com`) or hallucinated env var references exist.
- `graphify update .` updates the AST knowledge graph successfully.

### 6. Token Limit Continuation Pattern
When resuming a session interrupted by token limits, the prompt MUST include a State Handoff Table separating `MERGED` files from `NEEDS-CASCADE` files to prevent redundant edits on completed files.
