---
title: Antigravity Unified Tool Ecosystem Cheatsheet
description: Authoritative 7-Pillars capability discovery and prompt reference cheatsheet for Google Antigravity Native tools, MCP servers, CLI commands, and Repository workflows.
standard: agentskills.io/v1.0
category: documentation
version: 2.5.0
last_updated: 2026-08-15
tags: [antigravity, tools, mcp, cli, workflows, cheatsheet]
canonical: docs/CHEATSHEET_TOOLS.md
---

# Antigravity Unified Tool Ecosystem Cheatsheet

> **Skill Name:** `agy-tool` | **Version:** `2.5.0` | **Updated:** `2026-08-15`

> **TL;DR**:
> - **Scope**: 4-tier tooling catalog (Native `default_api`, MCP Servers, CLI & TUI Controls, OpenSpec SDD Workflows).
> - **Core Invariants**: POSIX forward slashes (`/`), 1-based indexing, verbatim whitespace matching, and Reactive Wakeup (no polling).
> - **Discovery**: Execute `node scripts/help.js --search <query>` or `/agy-tool --help` for instant discovery.

---

## Table of Contents
1. [Master Tool Selection Matrix](#1-master-tool-selection-matrix)
2. [Category 1: Native Agent Tools (`default_api`)](#2-category-1-native-agent-tools-default_api)
3. [Category 2: Model Context Protocol (MCP) Tools](#3-category-2-model-context-protocol-mcp-tools)
4. [Category 3: Antigravity CLI Commands & TUI Controls (`agy`)](#4-category-3-antigravity-cli-commands--tui-controls-agy)
5. [Category 4: Repository Workflows & Custom Scripts (`arostech-hub`)](#5-category-4-repository-workflows--custom-scripts-arostech-hub)
6. [Critical Invariants & Guardrails](#6-critical-invariants--guardrails)
7. [Developer Prompt Recipes](#7-developer-prompt-recipes)

---

## 1. Master Tool Selection Matrix

| Task Objective | Recommended Tool | Fallback / Alternative | Operational Invariant |
|---|---|---|---|
| **Precise Single Code Edit** | `replace_file_content` | `multi_replace_file_content` | Exact character match, 1-indexed lines |
| **Multi-Location / Batch Edit** | `multi_replace_file_content` | `replace_file_content` | Array of ordered replacement chunks |
| **Create New / Overwrite File** | `write_to_file` | — | Set `Overwrite: true` if rewriting |
| **Inspect File / Line Slices** | `view_file` | `grep_search` | Max 800 lines/call; `StartLine >= 1` |
| **Search Codebase Content** | `grep_search` (ripgrep) | `token-optimizer:smart_ast_grep` | Fast regex/literal search; max 50 matches |
| **Execute Bash / Build / Test** | `run_command` | `manage_task` | Git Bash POSIX syntax (`/`); specify `Cwd` |
| **Background Long-Running CLI** | `run_command` (`IsBackground: true`) | `schedule` | Stop calling tools -> *Reactive Wakeup* |
| **Subagent Task Delegation** | `invoke_subagent` | `define_subagent` | Route model: `flash` (lookup) vs `pro` (architecture) |
| **Inter-Agent Sync / Report** | `send_message` | — | Mandatory subagent output contract; never use for user |
| **Official Library / SDK Docs** | `context7` (`resolve-library-id` -> `query-docs`) | `search_web` | Canonical docs over generic web search |
| **Codebase Graph & God Nodes** | `graphify:query_graph` | `graphify:get_neighbors` | Layer 0 boot; structural blast radius |
| **Live Database & Branching** | `mcp-server-neon` | `pnpm prisma` (local) | Serverless Postgres branching, EXPLAIN plans |
| **CMS Lake & GROQ Queries** | `Sanity:query_documents` | `Sanity:patch_documents` | Live datasets, draft perspectives & releases |
| **Edge Runtime / KV / D1 / R2** | `cloudflare-bindings` | `cloudflare-observability` | Remote bindings & live telemetry logs |
| **Browser DOM / Screenshots** | `playwright:browser_snapshot` | `browser-use:browser_task` | Interactive selector inspection & verification |
| **Deep Web Scraping & Papers** | `firecrawl:firecrawl_scrape` | `firecrawl:research_search_papers` | Dynamic JS markdown extraction & arXiv search |
| **Headless CI/CD Automation** | `agy -p "<prompt>" --non-interactive` | `agy --dangerously-skip-permissions` | Single-shot scriptable agent loop execution |
| **Context Compaction in TUI** | `/compact` | `/context` | Token reclamation during long sessions |
| **OpenSpec SDD Lifecycle** | `/opsx-propose`, `/opsx-apply` | `/opsx-verify`, `/opsx-archive` | Spec-driven development without premature coding |
| **AI Documentation Audit** | `node .agents/scripts/validate-ai-docs.cjs` | `ensure-tldr.cjs` | Enforces 7-Pillars AI-Friendly Docs standard |

---

## 2. Category 1: Native Agent Tools (`default_api`)

| Tool Name | Safety | Signature & Parameters | Description & Invariants |
|---|---|---|---|
| **`view_file`** | `read_only` | `view_file(AbsolutePath, StartLine, EndLine, ContentOffset, IsSkillFile)` | Read text and binary files with 1-indexed line slicing (max 800 lines) and byte offset pagination. |
| **`write_to_file`** | **`mutating`** | `write_to_file(TargetFile, CodeContent, Overwrite, Description, ArtifactMetadata)` | Create new files or overwrite existing files with complete code contents. |
| **`replace_file_content`** | **`mutating`** | `replace_file_content(TargetFile, TargetContent, ReplacementContent, StartLine, EndLine, Instruction, Description)` | Precise single contiguous block find-and-replace using exact byte-for-byte character matching. |
| **`multi_replace_file_content`** | **`mutating`** | `multi_replace_file_content(TargetFile, ReplacementChunks, Instruction, Description)` | Atomic multi-chunk find-and-replace across non-contiguous blocks in a file. |
| **`list_dir`** | `read_only` | `list_dir(DirectoryPath)` | Explore directory contents, relative paths, file sizes, and recursive child counts. |
| **`grep_search`** | `read_only` | `grep_search(SearchPath, Query, IsRegex, CaseInsensitive, MatchPerLine, Includes)` | Fast ripgrep code search with regex, case-insensitivity, and glob filtering (capped at 50 matches). |
| **`run_command`** | **`mutating`** | `run_command(CommandLine, Cwd, IsDaemon, WaitMsBeforeAsync)` | Execute shell commands in Git Bash POSIX terminal (sync or background daemon). |
| **`manage_task`** | `standard` | `manage_task(Action, TaskId, Input)` | Manage, monitor, tail logs, send input to, or terminate asynchronous background processes. |
| **`define_subagent`** | `standard` | `define_subagent(name, description, system_prompt, enable_mcp_tools, enable_write_tools)` | Dynamically registers new specialized subagent blueprints for the duration of the conversation. |
| **`invoke_subagent`** | `standard` | `invoke_subagent(Subagents: [{TypeName, Role, Prompt, Model}])` | Spawn asynchronous subagent instances for concurrent task execution with model routing. |
| **`send_message`** | `standard` | `send_message(Recipient, Message)` | Inter-agent communication bus for relaying reports and structured findings between agents. |
| **`manage_subagents`** | `standard` | `manage_subagents(Action, ConversationIds)` | Inspect active subagents, view conversation IDs, check lifecycle states, or terminate instances. |
| **`search_web`** | `read_only` | `search_web(query, domain)` | Performs Google web search for public knowledge, documentation, or technical discussions. |
| **`read_url_content`** | `read_only` | `read_url_content(Url)` | Fetches public web page content via HTTP request and converts HTML into clean markdown. |
| **`generate_image`** | **`mutating`** | `generate_image(Prompt, ImageName, AspectRatio, ImagePaths)` | Generates or edits UI mockups and graphics saved as visual artifacts. |
| **`ask_question`** | `standard` | `ask_question(questions)` | Renders interactive modal for clarifying underspecified requirements or choosing designs. |
| **`schedule`** | `standard` | `schedule(Prompt, DurationSeconds, CronExpression, TimerCondition, IsDaemon)` | Schedule one-shot timers with cancellation conditions or recurring cron notifications. |
| **`call_mcp_tool`** | `standard` | `call_mcp_tool(ServerName, ToolName, Arguments)` | Dynamic RPC gateway to execute lazy-loaded tools from configured MCP servers. |
| **`list_resources`** | `read_only` | `list_resources(ServerName)` | Lists available static resources exposed by an MCP server. |
| **`read_resource`** | `read_only` | `read_resource(ServerName, Uri)` | Retrieves contents of a specific MCP server resource URI. |

---

## 3. Category 2: Model Context Protocol (MCP) Tools

| Tool / Server | Target Server | RPC / Signature | Capability & Constraints |
|---|---|---|---|
| **`context7`** | `context7` | `call_mcp_tool('context7', 'resolve-library-id', { libraryName, query })` | Authoritative real-time documentation retrieval for developer libraries and SDKs. |
| **`graphify`** | `graphify` | `call_mcp_tool('graphify', 'query_graph', { query })` | Codebase structural ontology, God node detection, and dependency impact analysis. |
| **`mcp-server-neon`** | `mcp-server-neon` | `call_mcp_tool('mcp-server-neon', 'run_sql', { project_id, sql })` | Neon Serverless Postgres database management, instant branching, live SQL, and query tuning. |
| **`Sanity`** | `Sanity` | `call_mcp_tool('Sanity', 'query_documents', { query: '*[_type=="product"]' })` | Headless CMS Content Lake, live GROQ querying, document mutations, and draft releases. |
| **`cloudflare-bindings`** | `cloudflare-bindings` | `call_mcp_tool('cloudflare-bindings', 'd1_database_query', { database_id, sql })` | Manage Cloudflare Edge primitives: D1 SQL, KV storage, R2 object store, and Worker scripts. |
| **`cloudflare-observability`** | `cloudflare-observability` | `call_mcp_tool('cloudflare-observability', 'query_worker_observability', { worker_name, query })` | Query live Worker telemetry logs, observability values, and execution metrics. |
| **`cloudflare-docs`** | `cloudflare-docs` | `call_mcp_tool('cloudflare-docs', 'search_cloudflare_documentation', { query })` | Authoritative Cloudflare developer documentation and Pages-to-Workers migration guides. |
| **`cloudflare-builds`** | `cloudflare-builds` | `call_mcp_tool('cloudflare-builds', 'workers_builds_list_builds', { account_id })` | Inspect live Cloudflare Worker and Pages build pipelines, deployments, and build logs. |
| **`playwright`** | `playwright` | `call_mcp_tool('playwright', 'browser_navigate', { url })` | Automated headless browser navigation, E2E testing, visual snapshots, and DOM interaction. |
| **`browser-use`** | `browser-use` | `call_mcp_tool('browser-use', 'browser_task', { task })` | Autonomous cloud browser agent for multi-step web workflows and complex interactions. |
| **`firecrawl`** | `firecrawl` | `call_mcp_tool('firecrawl', 'firecrawl_scrape', { url })` | Advanced web scraping, recursive crawling, markdown extraction, and arXiv research search. |
| **`github`** | `github` | `call_mcp_tool('github', 'create_pull_request', { title, body, head, base })` | GitHub platform operations: pull requests, issue triage, branch management, and reviews. |
| **`filesystem`** | `filesystem` | `call_mcp_tool('filesystem', 'read_file', { path })` | Local filesystem operations fallback for allowed directory boundaries. |
| **`memory`** | `memory` | `call_mcp_tool('memory', 'create_entities', { entities })` | Persistent knowledge graph memory across developer sessions and agent handoffs. |
| **`notion-mcp-server`** | `notion-mcp-server` | `call_mcp_tool('notion-mcp-server', 'API-post-search', { query })` | Notion workspace integration, task management, and document synchronization. |
| **`sequential-thinking`** | `sequential-thinking` | `call_mcp_tool('sequential-thinking', 'sequentialthinking', { thought, thoughtNumber, totalThoughts, nextThoughtNeeded })` | Dynamic multi-step reasoning protocol for complex mathematical or architectural planning. |
| **`token-optimizer`** | `token-optimizer` | `call_mcp_tool('token-optimizer', 'smart_ast_grep', { pattern, language })` | Context hygiene, session compression, AST grep, predictive caching, and token budgeting. |

---

## 4. Category 3: Antigravity CLI Commands & TUI Controls (`agy`)

| Command / Hotkey | Scope / Mode | Usage Syntax | Operational Function |
|---|---|---|---|
| **`agy`** | `CLI / TUI` | `agy [--resume <id>] [--model <name>] [--cwd <path>]` | Launch interactive Terminal User Interface (TUI) coding session. |
| **`agy -p`** | `CLI / TUI` | `agy -p "<instruction>" [--output-format json] [--non-interactive]` | Non-interactive headless single-shot execution for scripts and CI/CD pipelines. |
| **`agy --resume`** | `CLI / TUI` | `agy --resume <session-id> / agy -c` | Reconnect to a previous conversation state with preserved context and history. |
| **`agy auth`** | `CLI / TUI` | `agy auth login | agy auth status | agy auth logout` | Manage user authentication, API keys, and account login status. |
| **`agy config`** | `CLI / TUI` | `agy config get <key> | agy config set <key> <value>` | Inspect and set global platform settings, telemetry, and default models. |
| **`/compact`** | `CLI / TUI` | `/compact [directives]` | Manually trigger conversation context compaction to reclaim tokens. |
| **`/stats`** | `CLI / TUI` | `/stats` | Display active session token usage, latency metrics, and API quota. |
| **`/model`** | `CLI / TUI` | `/model [tier-name]` | Switch active LLM model tier (e.g. gemini-2.5-pro vs gemini-2.5-flash). |
| **`/checkpoint`** | `CLI / TUI` | `/checkpoint [label]` | Create an immutable point-in-time snapshot of conversation and file state. |
| **`/clear`** | `CLI / TUI` | `/clear` | Reset conversation transcript while retaining project context. |
| **`/export`** | `CLI / TUI` | `/export [filepath]` | Export active conversation log to local Markdown/JSON format. |
| **`/exit`** | `CLI / TUI` | `/exit or /quit` | Safely terminate the active CLI session. |

---

## 5. Category 4: Repository Workflows & Custom Scripts (`arostech-hub`)

| Workflow / Script | Category | Invocation Syntax | Purpose & Quality Gate |
|---|---|---|---|
| **`/opsx-propose`** | `Workflow` | `/opsx-propose <feature-name-or-description>` | OpenSpec SDD: Propose a new change (proposal, specs, design, tasks) without writing code. |
| **`/opsx-apply`** | `Workflow` | `/opsx-apply [change-name]` | OpenSpec SDD: Sequentially implement task checklists from approved OpenSpec delta change. |
| **`/opsx-verify`** | `Workflow` | `/opsx-verify [change-name]` | OpenSpec SDD: Verify codebase changes against specifications, tests, and design requirements. |
| **`/opsx-archive`** | `Workflow` | `/opsx-archive [change-name]` | OpenSpec SDD: Archive completed change proposal and sync delta specs to main specification root. |
| **`/opsx-sync`** | `Workflow` | `/opsx-sync [change-name]` | OpenSpec SDD: Sync delta specs directly to main specifications without archiving. |
| **`/opsx-new`** | `Workflow` | `/opsx-new` | OpenSpec SDD: Start a new step-by-step change lifecycle with guided prompt questions. |
| **`/opsx-ff`** | `Workflow` | `/opsx-ff <change-description>` | OpenSpec SDD: Fast-forward through OpenSpec artifact creation in one go. |
| **`validate-ai-docs.cjs`** | `Workflow` | `node .agents/scripts/validate-ai-docs.cjs` | Validate Markdown docs against the 7-Pillars standard (frontmatter, links, TL;DR). |
| **`generate-docs-manifests.cjs`** | `Workflow` | `node .agents/scripts/generate-docs-manifests.cjs` | Generate token-lean index manifests for AI context harvesting and prompt injection. |
| **`ensure-tldr.cjs`** | `Workflow` | `node .agents/scripts/ensure-tldr.cjs` | Enforce machine-readable TL;DR summary blocks in all project documentation. |
| **`reconcile-docs-links.cjs`** | `Workflow` | `node .agents/scripts/reconcile-docs-links.cjs` | Check and fix relative and absolute markdown document links across the repository. |
| **`help.js`** | `Workflow` | `node .agents/skills/agy-tool/scripts/help.js [--all|--inspect <tool>|--recipe <intent>|--doctor|--export-md]` | Deterministic tool catalog runner, parameter inspector, prompt generator, and system doctor. |
| **`harness-audit.js`** | `Workflow` | `node scripts/harness-audit.js` | Execute deterministic 12-category harness audit producing a 0-10 scorecard. |
| **`platform-audit.js`** | `Workflow` | `node scripts/platform-audit.js` | Audit Cloudflare Pages Edge, Neon Postgres, and Sanity CMS bindings and connectivity. |
| **`quality-gate.js`** | `Workflow` | `node scripts/quality-gate.js <filepath>` | Run ECC formatter and quality gate verification for targeted files. |
| **`mcp-health-check.js`** | `Workflow` | `node scripts/mcp-health-check.js` | Probe and report connectivity status of all configured MCP servers. |

---

## 6. Critical Invariants & Guardrails
1. **POSIX Paths**: Use forward slashes (`/`) exclusively.
2. **1-Based Indexing**: `view_file` and `replace_file_content` start on Line 1.
3. **Exact Whitespace**: `replace_file_content` requires byte-for-byte matching.
4. **Reactive Wakeup**: Never poll `manage_task` or loop with `sleep`.
5. **No Native `cd`**: Pass target directories via the `Cwd` argument.
6. **Subagent Contract**: Subagents deliver all results via `send_message`.
7. **Context7 Precedence**: Use Context7 MCP tools for official library documentation.

---

## 7. Developer Prompt Recipes
```text
Refactor the function validateAuthSession in src/lib/auth/session.ts to return null on expired tokens. Do not alter surrounding helper functions or file imports.
```