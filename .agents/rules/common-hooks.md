---
trigger: model_decision
description: Hooks system rules, PreInvocation/PreToolUse/PostToolUse/Stop hooks, auto-accept permissions, and task tracking best practices
---

# Hooks System

## Hook Types (Antigravity Standard)

- **PreInvocation**: Before model execution (inject contextual instructions/ephemeral messages via `injectSteps`)
- **PreToolUse**: Before tool step executes (validate, block via `decision: 'deny'`, or prompt via `decision: 'ask'`)
- **PostToolUse**: After tool step completes (auto-format tracking, diagnostics; expects `{}`)
- **PostInvocation**: After tool calls finish (continuation control via `terminationBehavior`)
- **Stop**: When execution loop terminates (verify completion; returns `{ decision: 'continue' }` or `{}`)

## Native Antigravity Platform Matchers

When configuring `.agents/hooks.json` for Antigravity:
- Include native Antigravity tool names (`run_command`, `write_to_file`, `replace_file_content`, `multi_replace_file_content`) alongside legacy matchers.
- Ensure all pre-tool security guardrails trigger uniformly across all Antigravity runtimes.

## Stop Hook Report-Only Guardrail

- Stop hooks (`stop-format-typecheck.js`) MUST execute formatters in check-only / report-only mode by default.
- Unprompted background disk writes (`--write`) during Stop execution are strictly prohibited unless `ECC_FORMAT_WRITE=1` is explicitly passed.
- Format notices and lint warnings must be output to stderr without mutating files on disk.

## Auto-Accept Permissions

Use with caution:
- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use dangerously-skip-permissions flag
- Configure `allowedTools` in `.agents/settings.json` instead

## Task & Plan Tracking Best Practices

In Antigravity, track task execution via:
- **`implementation_plan.md` artifacts** (`<appDataDir>/brain/<conversation-id>/implementation_plan.md`) with explicit GFM task checklists (`- [ ]`, `- [x]`).
- **OpenSpec SDD Tasks** (`openspec/changes/<change-id>/tasks.md`) for Layer 3/5 TDD tracking.
- Track progress systematically to reveal out-of-order steps, missing items, or wrong granularity.

## Graphify Post-Commit Hook (Layer 6 Automation)

Install alongside ECC hooks for automatic knowledge graph sync on every commit:

```bash
graphify hook install   # auto-rebuild AST after each git commit
```

This is the **Layer 6 (Memory Sync)** trigger for git-committed changes.
No API cost — AST extraction only. Ensures the next session's `graphify query` at Layer 0 reflects the latest committed state.

> See also: [`graphify.md`](./graphify.md) for full Layer 0/3/6/8 sync protocol and MCP tools.

