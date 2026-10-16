---
description: "Inspect, search, and discover Antigravity agent tools, parameter schemas, prompt recipes, and system diagnostics"
---

# `/agy-tool` — Tool Catalog, Inspection, Recipe & Diagnostic Workflow

Use this workflow whenever the user or agent needs to:
- Discover available tools: `/agy-tool` or `/agy-tool --all`
- Search specific capabilities: `/agy-tool --search <query>`
- Inspect parameter schema & invariants: `/agy-tool --inspect <tool_name>`
- Generate copy-pasteable prompt recipes: `/agy-tool --recipe <intent>` or `/agy-tool --prompt <tool_name>`
- Run system health diagnostics: `/agy-tool --doctor`
- Export standalone 7-Pillars cheatsheet: `/agy-tool --export-md [path]`

---

## Execution Protocol (Git Bash POSIX)

```bash
node .agents/skills/agy-tool/scripts/help.js $ARGS
```
