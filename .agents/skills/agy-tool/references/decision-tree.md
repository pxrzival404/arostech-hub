# Tool Selection Decision Tree & Priority Routing

This document details the multi-tiered decision logic for selecting Native Antigravity tools, MCP servers, Antigravity CLI controls, and Custom Repository tools.

---

## 1. Master Execution Surface Flowchart

```mermaid
flowchart TD
    Start([Developer Task / Agent Goal]) --> Surface{Execution Context?}

    %% Context surfaces
    Surface -->|Headless CI/CD / Automated Script| CLI_Headless[agy -p / --prompt --non-interactive]
    Surface -->|Fast Interactive Terminal| CLI_TUI[agy TUI Session]
    Surface -->|Multi-Pane Desktop Visuals| App2[Antigravity 2.0 Electron Canvas]
    Surface -->|In-Editor Code Lenses / Inline| IDE[Antigravity IDE]

    CLI_TUI --> DomainCheck{What is the task domain?}
    App2 --> DomainCheck
    IDE --> DomainCheck

    %% Code & File Operations
    DomainCheck -->|File & Code Editing| CodeScope{Scope of change?}
    CodeScope -->|Single Contiguous Block| RFC[replace_file_content]
    CodeScope -->|Multiple Disjoint Blocks| MRFC[multi_replace_file_content]
    CodeScope -->|New File / Total Overwrite| WTF[write_to_file]
    CodeScope -->|AST / Structural Search| AST[token-optimizer:smart_ast_grep]
    CodeScope -->|Exact Text / Regex Search| GS[grep_search]
    CodeScope -->|Inspect Lines / Content| VF[view_file]

    %% Terminal & Execution
    DomainCheck -->|Command & Terminal| CmdScope{Execution Profile?}
    CmdScope -->|Fast Synchronous CLI| RC1[run_command]
    CmdScope -->|Long-Running / Background| RC2[run_command IsBackground=true]
    CmdScope -->|Recurring / Delayed Timer| SCH[schedule]
    RC2 --> YieldWait[Stop calling tools -> Reactive Wakeup]

    %% External Retrieval & Docs
    DomainCheck -->|Documentation & Web| DocScope{Source Type?}
    DocScope -->|Framework / SDK Library| C7[context7: resolve-library-id -> query-docs]
    DocScope -->|General Web Search| SW[search_web]
    DocScope -->|Dynamic Web / Deep Scrape| FC[firecrawl: firecrawl_scrape / search]

    %% Architecture & Database
    DomainCheck -->|Cloud DB / CMS / Graph| CloudScope{Target System?}
    CloudScope -->|Codebase Knowledge Graph| GraphScope{Graphify Operation?}
    GraphScope -->|Broad Architectural Context| GF_BFS[graphify: query_graph mode=bfs / get_community]
    GraphScope -->|Deep Execution Path Tracing| GF_DFS[graphify: query_graph mode=dfs / shortest_path]
    GraphScope -->|High-Risk Hub Discovery| GF_GOD[graphify: god_nodes / get_node]
    GraphScope -->|Session Reflection & Memory| GF_REF[graphify reflect / .graphify_learning.json]
    CloudScope -->|Neon Postgres Cloud DB| NEON[mcp-server-neon: run_sql / explain_sql / branches]
    CloudScope -->|Sanity Content Lake CMS| SANITY[Sanity: query_documents / patch_documents]
    CloudScope -->|Cloudflare Workers / D1 / KV| CF[cloudflare-bindings / cloudflare-observability]
    CloudScope -->|GitHub PRs / Issues / Reviews| GH[github: create_pull_request / reviews]

    %% OpenSpec & Repository Governance
    DomainCheck -->|Governance & OpenSpec| GovScope{Workflow Stage?}
    GovScope -->|Tool Discovery & Catalog| HELP[node scripts/help.js / /agy-tool]
    GovScope -->|Parameter & Schema Inspection| INSP[node scripts/help.js --inspect <tool>]
    GovScope -->|Prompt Formula Generation| REC[node scripts/help.js --recipe <intent>]
    GovScope -->|Harness Health Diagnostics| DOC[node scripts/help.js --doctor]
    GovScope -->|Cheatsheet Export| EXPMD[node scripts/help.js --export-md]
    GovScope -->|SDD Proposal & Planning| OPSX_P[/opsx-propose / /opsx-new]
    GovScope -->|TDD Implementation| OPSX_A[/opsx-apply + pnpm test]
    GovScope -->|Verification & Archive| OPSX_V[/opsx-verify -> /opsx-archive]
```

---

## 2. Priority Ladder & Conflict Resolution

1. **Official Library Documentation**: `context7` > `search_web` > `firecrawl`.
2. **Local Code Search**: `grep_search` (ripgrep) > `list_dir` > `filesystem:search_files`.
3. **Local File Editing**: `replace_file_content` / `multi_replace_file_content` > `write_to_file` > `filesystem:write_file`.
4. **Codebase Structural Exploration & Blast Radius**:
   - Layer 0 Boot (broad layout): `graphify:query_graph` (`mode="bfs"`) & `graphify:god_nodes`.
   - Architectural Impact / Refactoring: `graphify:shortest_path` (`max_hops=5`) & `graphify:get_neighbors`.
   - Layer 6 Memory Sync: `graphify reflect --if-stale` (`.graphify_learning.json`).
5. **Database Interaction**: Local migrations via `pnpm prisma`; remote diagnostics, branch isolation, and query tuning via `mcp-server-neon`.
6. **Task Monitoring**: Native *Reactive Wakeup* > `schedule` > NEVER use busy-wait shell loops.
