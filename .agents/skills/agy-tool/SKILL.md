---
name: agy-tool
description: >-
  Authoritative tooling guide, capability discovery engine, and developer prompt cookbook
  for Google Antigravity. Covers all 20 Native built-in tools (default_api), 17 Local &
  Global MCP servers (Context7, Graphify, Neon, Sanity, Cloudflare, Playwright, Firecrawl,
  GitHub, Notion, Token-Optimizer), Antigravity CLI (agy) commands, and arostech-hub
  OpenSpec SDD workflows. Features parameter inspection, prompt formulas, system health
  diagnostics, and 7-Pillars markdown cheatsheet generation.
license: Apache-2.0
compatibility: Google Antigravity (AGY), Antigravity IDE, Antigravity 2.0, Antigravity CLI
metadata:
  standard: "agentskills.io/v1.0"
  author: "Google Antigravity Team & PT Daya Berkah Sentosa Nusantara"
  version: "2.5.0"
---

# Antigravity Tool Ecosystem Guide (`agy-tool`)

Authoritative reference, developer prompt cookbook, and deterministic tool discovery engine for Google Antigravity.

---

## 1. Quick Tool Discovery & Diagnostic Engine (`/agy-tool`)

The `agy-tool` skill provides a zero-dependency CLI runner (`scripts/help.js`) with comprehensive discovery, inspection, and diagnostic capabilities:

```bash
# 1. Complete Categorized Inventory (Native, MCP, CLI, Repo)
node .agents/skills/agy-tool/scripts/help.js --all

# 2. Filter by Category
node .agents/skills/agy-tool/scripts/help.js --category native   # Core default_api tools
node .agents/skills/agy-tool/scripts/help.js --category mcp      # Sanity, Neon, Cloudflare, Playwright, Context7
node .agents/skills/agy-tool/scripts/help.js --category cli      # agy flags, /compact, /model, TUI hotkeys
node .agents/skills/agy-tool/scripts/help.js --category repo     # /opsx-* SDD workflows & repo scripts

# 3. Search by Keyword or Capability
node .agents/skills/agy-tool/scripts/help.js --search postgres
node .agents/skills/agy-tool/scripts/help.js --search sanity

# 4. Deep Parameter & Guardrail Inspection (--inspect)
node .agents/skills/agy-tool/scripts/help.js --inspect replace_file_content
node .agents/skills/agy-tool/scripts/help.js --inspect mcp-server-neon:run_sql

# 5. Developer Prompt Recipe Generator (--recipe / --prompt)
node .agents/skills/agy-tool/scripts/help.js --recipe refactor
node .agents/skills/agy-tool/scripts/help.js --prompt invoke_subagent

# 6. Fast System Diagnostics & Health Doctor (--doctor / --health)
node .agents/skills/agy-tool/scripts/help.js --doctor
node .agents/skills/agy-tool/scripts/help.js --health --json

# 7. Generate Standalone 7-Pillars Markdown Cheatsheet (--export-md)
node .agents/skills/agy-tool/scripts/help.js --export-md docs/CHEATSHEET_TOOLS.md

# 8. Machine-Readable JSON Output for Subagent Delegation
node .agents/skills/agy-tool/scripts/help.js --category mcp --json
```

---

## 2. Master Tool Selection Matrix

| Task Objective | Recommended Tool | Fallback / Alternative | Operational Invariant |
|---|---|---|---|
| **Precise Single Code Edit** | `replace_file_content` | `multi_replace_file_content` | Exact byte-for-byte `TargetContent`, 1-indexed lines |
| **Multi-Location / Batch Edit** | `multi_replace_file_content` | `replace_file_content` | Provide array of ordered replacement chunks |
| **Create New / Overwrite File** | `write_to_file` | — | Include `ArtifactMetadata` when writing artifacts |
| **Inspect File / Line Slices** | `view_file` | `grep_search` | Max 800 lines/call; 1-indexed (`StartLine >= 1`) |
| **Search Codebase Content** | `grep_search` (ripgrep) | `token-optimizer:smart_ast_grep` | Fast regex/literal search; max 50 matches |
| **Execute Bash / Build / Test** | `run_command` | `manage_task` | Git Bash POSIX syntax (`/`); specify `Cwd` |
| **Background / Long CLI Task** | `run_command` (async) | `schedule` | Never poll `manage_task`; rely on *Reactive Wakeup* |
| **Subagent Task Delegation** | `invoke_subagent` | `define_subagent` | Route model: `flash` (lookup) vs `pro` (architecture) |
| **Inter-Agent Sync / Report** | `send_message` | — | Mandatory subagent output contract; never use for user |
| **Official Library / SDK Docs** | `context7` (`resolve-library-id` -> `query-docs`) | `search_web` | Always prioritize Context7 over search engines |
| **Codebase Graph & God Nodes** | `graphify:query_graph` (`mode="bfs"`) | `graphify:god_nodes`, `get_node` | Layer 0 Context Boot; structural blast radius |
| **Shortest Path & Dependency Flow** | `graphify:shortest_path` (`max_hops`) | `graphify:query_graph` (`mode="dfs"`) | Trace dependency chain between 2 concepts |
| **Work Memory & Reflection Sync** | `graphify reflect` | `.graphify_learning.json` | Layer 6 Memory Sync; persist lessons into LESSONS.md |
| **Live Database / Branching** | `mcp-server-neon` | `pnpm prisma` (local) | Serverless Postgres branching, EXPLAIN query plans |
| **CMS Lake & GROQ Queries** | `Sanity:query_documents` | `Sanity:patch_documents` | GROQ queries against live datasets; drafts & releases |
| **Edge Runtime / KV / D1 / R2** | `cloudflare-bindings` | `cloudflare-observability` | Inspect remote bindings and live worker logs |
| **Browser DOM / Screenshots** | `playwright:browser_snapshot` | `browser-use:browser_task` | Step-by-step interactive inspection & visual verification |
| **Deep Web Scraping & Papers** | `firecrawl:firecrawl_scrape` | `firecrawl:research_search_papers` | Clean Markdown extraction from dynamic JS sites |
| **Headless CI/CD Automation** | `agy -p "<prompt>" --non-interactive` | `agy --dangerously-skip-permissions` | Single-shot scriptable agent loop execution |
| **Context Compaction in TUI** | `/compact` | `/context` | Reclaim context window tokens during long sessions |
| **OpenSpec SDD Lifecycle** | `/opsx-propose`, `/opsx-apply` | `/opsx-verify`, `/opsx-archive` | Spec-driven development without premature coding |
| **AI Documentation Standard** | `node .agents/scripts/validate-ai-docs.cjs` | `ensure-tldr.cjs` | Enforce 7 Pillars AI-Friendly Docs standard |

---

## 3. Invariants & Zero-Assumption Guardrails

All agents and developers MUST respect these critical invariants:

1. **POSIX Path Standard**: Always format filesystem paths with forward slashes (`/`) and use absolute paths. Windows backslashes (`\`) are strictly forbidden in tool arguments.
2. **1-Based Indexing**: `view_file`, `replace_file_content`, and `multi_replace_file_content` are **1-indexed** (Line 1 is the first line).
3. **Exact Verbatim Whitespace**: In `replace_file_content`, `TargetContent` must match the exact character sequence, including spaces, indentation, tabs, and newlines. Always run `view_file` before editing.
4. **Reactive Wakeup (Zero Polling Loops)**: NEVER create busy-wait polling loops with `manage_task(Action='status')` or `manage_subagents(Action='list')`. Yield execution by stopping tool calls; Antigravity wakes the agent automatically.
5. **No Native `cd` Commands**: Never execute `cd` inside `run_command`. Set the target directory explicitly using the `Cwd` parameter.
6. **Subagent Communication Contract**: Subagents MUST deliver all findings via `send_message`. Output emitted outside `send_message` is not delivered to the caller.
7. **Context7 Precedence**: For React, Next.js, Prisma, Tailwind, Cloudflare, Auth.js, or Sanity syntax, always call Context7 MCP tools instead of guessing or web-searching.

---

## 4. Developer Prompt Recipes

### A. Surgical Refactoring (`replace_file_content`)
```text
Refactor the function `validateAuthSession` in `src/lib/auth/session.ts` to return null on expired tokens. Do not alter surrounding helper functions or file imports. Maintain exact indentation.
```

### B. Background Build & Test (`run_command` + Reactive Wakeup)
```text
Run `pnpm build` in the background with Cwd="d:/dev/arostech-hub". While the compilation is running, inspect `src/middleware.ts` to verify Edge runtime compliance without polling the task status.
```

### C. Framework Documentation Lookup (`context7`)
```text
Look up the official Next.js 15+ documentation using Context7 for configuring Edge Route Handlers with custom streaming responses.
```

### D. Architectural Blast Radius & Shortest Path (`graphify:shortest_path`)
```text
Before modifying `src/lib/auth.ts`, query Graphify with mode="dfs" and compute shortest_path between "authConfig" and "middleware.ts" (max_hops=5). Verify if any god_nodes with 50+ connections are affected.
```

### E. Session Work Memory Reflection (`graphify reflect`)
```text
At the conclusion of the feature session, execute `graphify reflect --if-stale --out docs/LESSONS.md` to distill debugging insights into `.graphify_learning.json` and persist node confidence overlays.
```

### F. Subagent Parallel Research (`invoke_subagent`)
```text
Spawn a research subagent using model 'flash' to explore `prisma/schema.prisma` and map all relations connected to the `Organization` model, then send me a structured report.
```

### G. Health Diagnostic Probe (`/agy-tool --doctor`)
```text
/agy-tool --doctor
Audit local Git Bash toolchains, masked API environment keys, and active MCP configuration files.
```

---

## 5. Progressive Disclosure References

- For complete decision trees and workflow branching: [references/decision-tree.md](./references/decision-tree.md)
- For machine-readable schemas and full parameter catalogs: [resources/tools.json](./resources/tools.json)
- For automated benchmark test cases: [eval/eval.json](./eval/eval.json)
- For deterministic tool discovery & doctor helper: `node .agents/skills/agy-tool/scripts/help.js`
