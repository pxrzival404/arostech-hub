# Teamwork Squad Orchestration & Dynamic Cascade Rule

> **Scope**: All multi-agent operations, document alignment tasks, and complex refactoring in `arostech-hub`.
> **Standard**: ECC Agent Squad Orchestration Baseline v4.0.0

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
- `Lead Architect` (`architect`): Kanban board owner & architectural decision maker.
- `SQ-STRATEGY` (`planner` / `architect`): Vision, product segments, launch roadmap.
- `SQ-SYSTEM` (`typescript-reviewer` / `architect`): API reference, Zod schemas, Auth.js catch-all contracts.
- `SQ-OPS` (`security-reviewer` / `architect`): Cloudflare Pages runbooks, DNS CNAME topology, incident protocols.
- `SQ-QA` (`tdd-guide`): Greenfield TDD baselines, test coverage rules.
- `SQ-INTEGRATOR` (`code-reviewer` / `loop-operator`): Merge gate enforcement & Knowledge Graph update.

### 5. Strict Merge Gate Requirements
A work item CANNOT move to `Merged` status unless:
- `node .agents/scripts/validate-ai-docs.cjs` passes with 0 issues across all modified files.
- 0 residual legacy domain (`sentradaya.com`) or hallucinated env var references exist.
- `graphify update .` updates the AST knowledge graph successfully.

### 6. Token Limit Continuation Pattern
When resuming a session interrupted by token limits, the prompt MUST include a State Handoff Table separating `MERGED` files from `NEEDS-CASCADE` files to prevent redundant edits on completed files.
