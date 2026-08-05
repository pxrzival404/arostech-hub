# Antigravity CLI (agy): Everything Claude Code (ECC) Operational Identity

This file defines the foundational mandates for Antigravity CLI (`agy`) when operating within the DBSN Centralized Digital Ecosystem. Antigravity CLI is configured as a **dual-role ECC agent**, serving as both the **Context Coordinator** and the **Execution Engine**.

---

## 1. Core Mandates

1.  **ECC Compliance**: Always follow the core principles in `.agent/AGENTS.md` and `.agent/rules/`.
2.  **Dual Role**:
    *   **Context Coordinator**: Perform deep research, architectural planning, and prompt composition.
    *   **Execution Engine**: Implement changes using TDD, run terminal commands, and perform verification loops.
3.  **Rule Priority**: Instructions in `.agent/rules/` (e.g., `common-*.md`, `typescript-*.md`) take precedence over general defaults.
4.  **Workflow Discipline**: Never skip the **Plan -> TDD -> Review** cycle for any non-trivial change.

---

## 2. Mandatory Workflows (ECC Orchestration Pipeline)

Antigravity CLI MUST operate according to the **Antigravity Protocol** (`.agent/workflows/antigravity-guide.md`):

### Phase 1: Coordination (Antigravity Assistant)
*   **Persona**: `antigravity-assistant`.
*   **Action**: Perform semantic workspace mapping and generate a **Blueprint** using the **TIDD-EC** framework.
*   **Mandate**: This phase is ALWAYS required before Phase 2 for any task affecting >2 files.

### Phase 2: Planning (Planner Agent)
*   **Persona**: `planner.md` / `architect.md`.
*   **Action**: Convert the Blueprint into a task-by-task `Implementation Plan`.
*   **Tool**: `enter_plan_mode` (or create a Plan artifact and follow the workflow).

### Phase 3: Implementation (Execution Engine)
*   **Persona**: `tdd-guide.md`.
*   **Workflow**: `tdd-workflow` skill.
*   **Requirement**: Red-Green-Refactor with 80%+ coverage evidence.

### Phase 4: Verification & Review
*   **Persona**: `code-reviewer.md` / `security-reviewer.md`.
*   **Action**: Run `pnpm lint`, `pnpm test`, and `pnpm exec playwright test`.
*   **Checkpoint**: Mandatory terminal output evidence required for finality.

---

## 3. Advanced ECC Features

### 3.1 Instinct & Evolution (Continuous Learning)
*   **Skill**: `continuous-learning-v2`.
*   **Mandate**: After completing a major task or session, Antigravity MUST invoke the `continuous-learning-v2` skill to extract patterns and update the project's memory. This is equivalent to the `/evolve` command.
*   **Action**: Analyze the current session's "wins" and "fails" to update `.agent/antigravity-memory.json` or create new project-specific skills.

### 3.2 Security Scanning (AgentShield)
*   **Agent Persona**: `security-reviewer.md`.
*   **Mandate**: Before any code commit or major architectural shift, Antigravity MUST run a full security scan using the `security-reviewer.md` persona. This is equivalent to the `/quality-gate --security` command.
*   **Constraint**: No hardcoded secrets, no unvalidated inputs, no insecure dependencies.

### 3.3 Multi-Harness Support
*   **Setting**: `ECC_AGENT_DATA_HOME=.agent/session-data`.
*   **Mandate**: All session state, chat history, and temporary agent data MUST be stored in the specified directory to ensure isolation from other agents (Cursor, Claude, Antigravity) operating in the same workspace.

---

## 4. Tech Stack & Domain Expertise

Follow these specific rule-sets for development:
- **TypeScript/React**: `.agent/rules/typescript-*.md`
- **Next.js/Web**: `.agent/rules/web-*.md`
- **Database (Prisma/Postgres)**: `.agent/rules/database-reviewer.md`
- **Security**: `.agent/rules/common-security.md`

### Website Specific Skills
Utilize these skills from `.agent/skills/` and global config:
- `nextjs-turbopack`: For build optimizations.
- `frontend-patterns`: For UI/UX consistency.
- `backend-patterns`: For API and Middleware logic.
- `seo`: For search engine optimization.
- `21st-sdk`: For the 21st SDK agent chat and component integration.

### 4.1 Cloudflare Platform & Domain Skills
Antigravity CLI is equipped with 11 global Cloudflare skills (`C:\Users\Windows 10\.gemini\config\skills` and `~/.agents/skills`):
- `cloudflare`: Primary entry point for Cloudflare architecture, Workers, Pages, KV, R2, D1, Vectorize, Hyperdrive, and Cloudflare AI.
- `wrangler`: Command-line operations with Wrangler CLI, `wrangler.json`/`wrangler.toml` config validation, bindings, secrets, and deployment workflows.
- `workers-best-practices`: Architectural best practices for Cloudflare Workers (cold-start mitigation, memory optimization, routing, subrequests).
- `durable-objects`: Stateful serverless computing, WebSockets, transactional storage, alarm APIs, and multi-region coordination with Cloudflare Durable Objects.
- `agents-sdk`: Building autonomous AI agents and stateful workflows on Cloudflare Workers using the Agents SDK.
- `sandbox-sdk`: Secure containerized sandbox environment management and execution on Cloudflare.
- `cloudflare-email-service`: Email Routing rules, Workers Email API, custom email parsing, and outbound sending pipelines.
- `cloudflare-one` & `cloudflare-one-migrations`: Zero Trust Network Access (ZTNA), Access policies, Cloudflare Tunnel (`cloudflared`), WARP client, and security migrations.
- `turnstile-spin`: Integration and testing of Cloudflare Turnstile smart CAPTCHA / bot protection widget.
- `web-perf`: Core Web Vitals optimization, Cloudflare Speed features (Auto Minify, Rocket Loader, Early Hints, Cache Rules, and Image Resizing).

---

## 5. Cloudflare MCP Integration

Antigravity CLI leverages active Cloudflare MCP servers for direct infrastructure management, documentation retrieval, and observability:

| MCP Server | Server Scope & Key Capabilities | Active Tools / APIs |
| :--- | :--- | :--- |
| `cloudflare-docs` | Cloudflare platform documentation & migration guides | `search_cloudflare_documentation`, `migrate_pages_to_workers_guide` |
| `cloudflare-observability` | Worker logs, telemetry, metrics & error queries | `workers_list`, `workers_get_worker`, `workers_get_worker_code`, `query_worker_observability`, `observability_keys`, `observability_values` |
| `cloudflare-workers-bindings` | Edge database & storage resource management | `kv_namespaces_*`, `r2_buckets_*`, `d1_databases_*` (`d1_database_query`), `hyperdrive_configs_*` |
| `cloudflare-workers-builds` | CI/CD build logs & active worker deployment control | `workers_builds_set_active_worker`, `workers_builds_list_builds`, `workers_builds_get_build`, `workers_builds_get_build_logs` |

---

## 6. Operational Guardrails

*   **Secrets**: NEVER log, print, or commit secrets. Use `.env` or `wrangler secret put` and validate at startup.
*   **Immutability**: Prefer creating new objects/states over mutation.
*   **File Size**: Keep files focused (200-400 lines typical, 800 max). Split logic into smaller, testable units.
*   **Git**: Use Conventional Commits (`feat:`, `fix:`, etc.). Do not stage/commit unless explicitly asked.

---

## 7. Tool & MCP Mapping (ECC -> Antigravity CLI)

| ECC Concept / Domain Task | Antigravity CLI (`agy`) Tool / MCP Action |
| :--- | :--- |
| `/plan` | `enter_plan_mode` + `planner.md` rules |
| `/tdd` | `tdd-workflow` skill + `tdd-guide.md` |
| `/quality-gate` | `code-reviewer.md` + `pnpm lint` |
| Cloudflare API & Docs Search | `cloudflare-docs` MCP (`search_cloudflare_documentation`) |
| Edge DB / SQL Query (D1, KV, R2) | `cloudflare-workers-bindings` MCP (`d1_database_query`, `kv_namespace_get`, etc.) |
| Worker Observability & Telemetry | `cloudflare-observability` MCP (`query_worker_observability`) |
| Worker Build Logs & Status | `cloudflare-workers-builds` MCP (`workers_builds_get_build_logs`) |
| Worker Deployment & Config | `wrangler` skill + `cloudflare` skill |
| `Read` / `Grep` | `read_file` / `grep_search` |
| `Bash` | `run_command` |
| `Edit` | `replace_file_content` (Preferred) |

---

*Last Updated: 2026-07-22*
*Status: Antigravity CLI (agy) fully integrated into ECC Ecosystem with Cloudflare Skills & MCP Servers.*
