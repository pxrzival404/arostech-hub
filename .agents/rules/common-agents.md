---
trigger: model_decision
description: Agent delegation protocol — roster, parallel execution, and completion contract.
---

# Agent Orchestration

> **Workflow context**: This rule governs **Layer 4 (Agent Delegation)** of the 8-Layer Workflow.
> Agent routing authority: [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md) ("Domain Glob Routing Matrix") and [`common-extended-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md) (Layer 4).
> Do NOT reference hardcoded agent names from this file for routing — follow the Layer 4 Delegation matrix.

## Available Agents

> **SSOT**: Agent roster and domain routing is defined in [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md) and [`common-extended-workflow.md`](file:///d:/dev/arostech-hub/.agents/rules/common-extended-workflow.md).
> This file contains delegation **protocol** only, not the roster.

**Quick delegation triggers** (see common-extended-workflow.md Layer 4 for routing flow):
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

## Parallel Subagent Delegation

ALWAYS use parallel `invoke_subagent` calls for independent operations:

```json
{
  "Subagents": [
    {
      "TypeName": "security-reviewer",
      "Role": "Security Specialist",
      "Prompt": "Security analysis of auth module"
    },
    {
      "TypeName": "performance-optimizer",
      "Role": "Performance Specialist",
      "Prompt": "Performance review of cache system"
    },
    {
      "TypeName": "typescript-reviewer",
      "Role": "Type Specialist",
      "Prompt": "Type checking of utilities"
    }
  ]
}
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
