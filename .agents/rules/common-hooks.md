---
trigger: model_decision
description: Hooks system rules, PreToolUse/PostToolUse/Stop hooks, auto-accept permissions, and TodoWrite best practices
---

# Hooks System

## Hook Types

- **PreToolUse**: Before tool execution (validation, parameter modification)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When session ends (final verification)


## Native Antigravity Platform Matchers

When configuring .agents/hooks.json for Antigravity, Antigravity CLI, or Antigravity IDE:
- Include native Antigravity tool names (
un_command, write_to_file, 
eplace_file_content, multi_replace_file_content) alongside legacy Bash/Edit/Write matchers.
- Ensure all pre-tool security guardrails trigger uniformly across all Antigravity runtimes.

## Stop Hook Report-Only Guardrail

- Stop hooks (stop-format-typecheck.js) MUST execute formatters in check-only / report-only mode by default.
- Unprompted background disk writes (--write) during Stop execution are strictly prohibited unless ECC_FORMAT_WRITE=1 is explicitly passed.
- Format notices and lint warnings must be output to stderr without mutating files on disk.

## Auto-Accept Permissions

Use with caution:
- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use dangerously-skip-permissions flag
- Configure `allowedTools` in `<harness-home>/settings.json` instead

## TodoWrite Best Practices

Use TodoWrite tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps

Todo list reveals:
- Out of order steps
- Missing items
- Extra unnecessary items
- Wrong granularity
- Misinterpreted requirements

## Graphify Post-Commit Hook (Layer 6 Automation)

Install alongside ECC hooks for automatic knowledge graph sync on every commit:

```bash
graphify hook install   # auto-rebuild AST after each git commit
```

This is the **Layer 6 (Memory Sync)** trigger for git-committed changes.
No API cost — AST extraction only. Ensures the next session's `graphify query` at Layer 0 reflects the latest committed state.

> See also: [`graphify.md`](./graphify.md) for full Layer 0/3/6/8 sync protocol and MCP tools.

