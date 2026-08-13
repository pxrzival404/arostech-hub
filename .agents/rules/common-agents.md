---
trigger: model_decision
description: Agent delegation protocol — roster, parallel execution, and completion contract.
---

# Agent Orchestration

> **Workflow context**: This rule governs **Layer 4 (Agent Delegation)** of the 8-Layer Workflow.
> Agent roster authority: [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md) Section 3.1 (28 project-specific agents with auto-gating matrix).
> Do NOT reference agent names from this file for routing — use the auto-gating matrix in AGENTS.md Section 3.2.

## Available Agents

> **SSOT**: Full 28-agent roster with file-type auto-gating is in [`AGENTS.md Section 3.1`](file:///d:/dev/arostech-hub/AGENTS.md#L104-L135).
> This file contains delegation **protocol** only, not the roster.

**Quick delegation triggers** (see AGENTS.md Section 3.2 for full auto-gating matrix):
- Complex feature (3+ files) → `planner` → `architect` → `tdd-guide`
- Code just written → `code-reviewer`
- Bug fix / new feature → `tdd-guide`
- Architectural decision → `architect`

## Immediate Agent Usage

No user prompt needed:
1. Complex feature requests - Use **planner** agent
2. Code just written/modified - Use **code-reviewer** agent
3. Bug fix or new feature - Use **tdd-guide** agent
4. Architectural decision - Use **architect** agent

## Parallel Task Execution

ALWAYS use parallel Task execution for independent operations:

```markdown
# GOOD: Parallel execution
Launch 3 agents in parallel:
1. Agent 1: Security analysis of auth module
2. Agent 2: Performance review of cache system
3. Agent 3: Type checking of utilities

# BAD: Sequential when unnecessary
First agent 1, then agent 2, then agent 3
```

## Delegation Completion Contract

Applies to every agent at every depth (parent, child, grandchild):

1. **Your final message IS the deliverable.** Never end your turn with "waiting for background agents" — a spawned task is not a completed task. Ending your turn while children are running orphans their results (completed children cannot notify a parent whose turn has ended).
2. **If you delegate, you own collection.** Wait for results, integrate them, then return. Fire-and-forget delegation is forbidden.
3. **Decompose only when the work cannot fit in one context.** Do not re-delegate a task already sized for a single agent — depth is an outcome, not a plan.

> Rationale: observed failure mode — research agents followed "Parallel Task Execution" above, spawned children, and returned "waiting" as their final answer. All children completed successfully but their results were orphaned. The parallel rule without a completion contract produces zombie tasks.

## Multi-Perspective Analysis

For complex problems, use split role sub-agents:
- Factual reviewer
- Senior engineer
- Security expert
- Consistency reviewer
- Redundancy checker
