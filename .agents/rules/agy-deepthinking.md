---
trigger: manual
description: General in-flight deep-thinking, multi-source knowledge gathering, sequential reasoning, and architectural reasoning rule for task execution sessions.
---

# Antigravity General In-Flight Deep-Thinking & Architectural Reasoning Rule (`agy-deepthinking`)

> **Scope**: Deep-reasoning sessions, complex architectural analysis, multi-dimensional problem solving, or high-risk task execution. General-purpose and workflow-agnostic.
> **Activation**: Manual (activated directly in the active conversation, or injected via a prompt draft engineered by `agy-prompt`).

---

## 1. Activation & Dual Operation Modes
This rule operates manually through two mechanisms:
1. **Injected via Prompt Draft (`agy-prompt`)**: When combined with `agy-prompt`, this rule's directives are embedded into the target prompt draft so the receiving downstream agent adheres to the deep-reasoning protocol.
2. **Direct Activation in Active Session**: When explicitly invoked in a conversation, all agent interactions within that session MUST adhere to deep architectural reasoning before making decisions or modifying the system.

---

## 2. Multi-Source Information Gathering (Comprehensive Research)
Agents operating under this rule have full authority and are strongly encouraged to gather comprehensive evidence and context across all available tools:
- **Internal Repository**: Use local Graphify tools (`graphify query`, `query_graph`, `get_node`, `shortest_path`) to map module dependencies, AST graphs, and subgraphs.
- **External Literature & Documentation**: Use Context7 MCP tools (`resolve-library-id`, `query-docs`) for official library/framework documentation, and web search/browser tools for up-to-date references.
- **Research Subagent Delegation**: The agent is authorized and encouraged to spawn specialized research subagents (`invoke_subagent` with `research` or `researcher`) for extensive investigations requiring deep cross-referencing.

---

## 3. Sequential Thinking, Architectural Reasoning & Checklist Gate
- **Sequential Multi-Step Reasoning (`sequentialthinking`)**: For complex, multi-vector architectural problems with deep dependency chains, the agent is **STRONGLY ENCOURAGED** to utilize the `sequentialthinking` MCP tool to break down reasoning into structured, iterative steps (*thought steps, hypothesis testing, branch exploration, revisions*) prior to drawing conclusions.
- **Pre-Execution Freeze**: Before making destructive modifications or editing files, the agent MUST complete its full reasoning chain regarding trade-offs, system invariants, schema synchronization, and potential breaking changes.
- **Checklist Gate Table (Chat Output)**: Before invoking any file-modifying tool for the first time on a complex task, the agent **MUST** render an explicit evaluation table in the chat output:

| Architectural Vector / Dimension | Target Scope & Component | Findings & Evidence Analysis | Gate Status | Action / Decision |
|---|---|---|---|---|
| **[Vector 1: Trade-off / Isolation]** | `[file:///path/to/file#L...]` | [Evidence summary] | `PASS` / `FAIL` | [Proceed / Clarify] |
| **[Vector 2: Invariant / Schema]** | `[file:///path/to/file#L...]` | [Evidence summary] | `PASS` / `FAIL` | [Proceed / Clarify] |
| **[Vector 3: Edge Cases / Integration]** | `[file:///path/to/file#L...]` | [Evidence summary] | `PASS` / `FAIL` | [Proceed / Clarify] |

> **Gate Invariant**: If any status is `FAIL` or contains critical ambiguities, the agent MUST halt file mutation and request user clarification (e.g., via `/grill-me`).

---

## 4. General Non-Prescriptive Autonomy
- This rule is **general, adaptive, and non-prescriptive**.
- Once all evidence is validated and the Checklist Gate passes, the agent maintains full autonomy to select the cleanest, most maintainable implementation path (*KISS, DRY, Ponytail / simplest solution that actually works*).
