# arostech-hub — AI Agent Operating Rules

> **Project**: PT Daya Berkah Sentosa Nusantara (DBSN) — `arostech-hub`
> **Platform**: Antigravity AI Agent (z.ai) + ECC v2.2.0 + OpenSpec
> **Branch**: `refactor/reorganize-project-documentation`
> **Supersedes**: All prior AGENTS.md versions

---

## 1. Core Principles

1. **Docs-First** — Documentation is the source of truth. Code must conform to docs, not the reverse.
2. **Spec-Driven** — Every code change outside `docs/` must have a corresponding OpenSpec task. No spec, no code.
3. **Test-Driven** — Write tests before implementation (Red-Green-Refactor). 80%+ coverage required.
4. **Security-First** — Never compromise on security; validate all inputs. No hardcoded secrets.
5. **Agent-First** — Delegate to specialized agents for domain tasks. Use parallel execution for independent operations.
6. **Immutability** — Always create new objects, never mutate existing ones.
7. **Plan Before Execute** — Plan complex features before writing code.

---

## 2. Source of Truth Hierarchy

| Priority | Layer | Location | Purpose |
|----------|-------|----------|---------|
| 1 (Highest) | **High-Level Architecture (HLA)** | `docs/` | Strategy, system architecture, engineering governance, operations |
| 2 | **Low-Level Architecture (LLA)** | `openspec/` | Spec-driven change proposals, requirements, design, tasks |
| 3 | **Enforcement Rules** | `.agents/rules/` | Platform-specific constraints (Edge Runtime, CMS, Deploy, etc.) |
| 3.1 | **Teamwork Squad Rules** | `.agents/rules/teamwork-squad-orchestration.md` | Teamwork-Preview, Draft-First, PRD SSOT Cascade, Dynamic Task Expansion |
| 4 (Lowest) | **Implementation** | `src/`, `studio/`, `prisma/` | Production code — must match all layers above |

**Conflict Resolution**: When layers disagree, the higher-priority layer wins. Implementation that contradicts docs is a bug in the implementation.

### 2.0 Teamwork-Preview & Draft-First Workflow
When performing multi-agent operations or executing `/teamwork-preview`:
1. **Draft-First Alignment**: Always generate a structured Draft Plan / Prompt first for user review before execution.
2. **PRD-First SSOT Cascade**: All document modifications MUST cascade top-down from `docs/strategy/prd.md` (Root SSOT).
3. **Dynamic Task Expansion**: Squad agents have decision autonomy to dynamically add new Kanban work items when gap discovery reveals missing HLA artifacts or schemas.
4. **Merge Gates**: Every updated document MUST pass static 7-Pillars validation (`node .agents/scripts/validate-ai-docs.cjs`) and Knowledge Graph update (`graphify update .`).

### 2.1 Documentation Architecture (docs/)

When retrieving context, documentation is organized into 4 top-level domains:

- **Strategy & Scope**: `docs/strategy/` — PRD, business rules, domain model
- **System Architecture & API**: `docs/system/` — Overview, middleware, API reference, data model
- **Engineering & Governance**: `docs/engineering/` — AI agent rules, testing strategy, tech stack
- **Operations & Security**: `docs/operations/` — Deployment, monitoring, security policies

**AI-Friendly Documentation Invariant (7 Pillars Standard)**:
All documentation created or updated under `docs/` MUST comply with [.agents/rules/ai-friendly-docs.md](file:///d:/dev/arostech-hub/.agents/rules/ai-friendly-docs.md):
1. **YAML Frontmatter**: Machine-readable metadata (`id`, `title`, `version`, `status`, `graphify_community`, `authoritative_references`).
2. **Behavioral Contracts**: OpenSpec `Requirement:` & `Scenario:` format (GIVEN-WHEN-THEN).
3. **RFC 2119 Precision**: Normative keywords (`SHALL`, `MUST`, `MUST NOT`, `SHOULD`).
4. **Declarative Schemas**: Concrete Zod/Prisma/TypeScript interfaces over vague prose.
5. **Graphify Anchoring**: Node ID mapping (`doc:<path>`) & GraphRAG sub-graph queries.
6. **OpenSpec Lifecycle**: Explicit spec delta headers (`ADDED`, `MODIFIED`, `REMOVED`).
7. **Anchored URIs**: `file:///` URIs with exact line range anchors & zero redundancy.

### 2.2 OpenSpec Workflow (openspec/)

All code changes follow the OpenSpec SDD lifecycle:

1. **Explore** (`/opsx:explore`) — Analyze the problem space before committing
2. **Propose** (`/opsx:propose`) — Generate change artifacts: `proposal.md`, `specs/`, `design.md`, `tasks.md`
3. **Review** — Human approves specs before implementation begins
4. **Apply** (`/opsx:apply`) — Implement tasks one by one
5. **Verify** (`/opsx:verify`) — Confirm implementation matches specs
6. **Archive** (`/opsx:archive`) — Move completed changes to archive, update baseline specs

**Rules**:
- Each change gets its own folder under `openspec/changes/`
- Every requirement MUST have at least 2 concrete scenarios (WHEN/THEN format)
- Archive completed changes within 24 hours of closure
- `openspec/config.yaml` must be populated with project context
- No implementation without an approved proposal

### 2.3 Custom Rule Files (.agents/rules/)

Six platform-specific rule files enforce constraints that generic ECC rules cannot cover:

| Rule File | Scope | Status |
|-----------|-------|--------|
| `cloudflare-edge-runtime.md` | Edge Runtime constraints, `@cloudflare/next-on-pages` compatibility | **DRAFT / STUB — Authoring Planned for Fase 2** |
| `cloudflare-pages-deploy.md` | Build pipeline, `ignoreBuildErrors`, static export rules | **DRAFT / STUB — Authoring Planned for Fase 2** |
| `sanity-cms-federation.md` | GROQ patterns, ISR cache tags, Stega visual editing, schema registration | **DRAFT / STUB — Authoring Planned for Fase 2** |
| `monorepo-workspace.md` | Turborepo workspace rules, package boundaries, shared config | **DRAFT / STUB — Authoring Planned for Fase 2** |
| `tailwind-v4.md` | Tailwind CSS v4 migration constraints, utility patterns | **DRAFT / STUB — Authoring Planned for Fase 2** |
| `prisma-neon-edge.md` | Prisma/Neon Proxy lazy init, Edge-compatible query patterns | **DRAFT / STUB — Authoring Planned for Fase 2** |

**Gating**: Before any code change in the relevant domain, the agent MUST read and comply with the corresponding rule file. If the file is in draft/stub status, the agent MUST follow standard platform patterns and treat draft guidelines as advisory until authored.

---

## 3. Agent Roster & Delegation Rules

### 3.1 Active Agents for This Project

| Agent | Role | When to Invoke |
|-------|------|---------------|
| `architect` | System design, scalability decisions, harness structure | Architectural decisions, AGENTS.md updates, rule file authoring |
| `planner` | Implementation planning, phase breakdown | Complex features, refactoring, multi-file changes |
| `tdd-guide` | Test-driven development workflow | New features, bug fixes, any `.test.ts` creation |
| `code-reviewer` | Code quality, maintainability review | After writing/modifying any code |
| `security-reviewer` | Vulnerability detection, auth audit | Before commits, sensitive code, auth module changes |
| `typescript-reviewer` | TypeScript/JavaScript code review | `.ts`/`.tsx` file edits |
| `react-reviewer` | React component patterns | `.tsx` file edits, component creation |
| `spec-miner` | Brownfield spec extraction | Onboarding existing code to spec-driven development |
| `refactor-cleaner` | Dead code cleanup, consolidation | Code maintenance, removing scope creep artifacts |
| `doc-updater` | Documentation and codemaps | Updating docs/, generating codemaps |
| `e2e-runner` | End-to-end Playwright testing | Critical user flows, middleware chain verification |
| `build-error-resolver` | Fix build/type errors | When build fails |
| `database-reviewer` | PostgreSQL/Neon specialist | Prisma schema changes, query optimization |
| `loop-operator` | Autonomous loop execution | Long-running tasks, stall detection |
| `harness-optimizer` | Harness config tuning | Reliability, cost, throughput optimization |

### 3.2 Delegation Rules (Auto-Gating)

These rules apply during agent execution via explicit orchestration prompts (`/orchestrate`), subagent routing, or registered validation hooks in `.agents/hooks/`:

| Trigger | Auto-Delegate To | Chain |
|---------|-------------------|-------|
| Complex feature request (3+ files) | `planner` | then `architect` → `tdd-guide` |
| New feature proposal | `architect` | then `tdd-guide` |
| Any `.ts` file edit | `typescript-reviewer` | — |
| Any `.tsx` file edit | `react-reviewer` | then `typescript-reviewer` |
| Code just written/modified | `code-reviewer` | — |
| Bug fix or new feature | `tdd-guide` | — |
| Security-sensitive code (auth, API keys, middleware) | `security-reviewer` | — |
| Prisma schema change | `database-reviewer` | — |
| Documentation update | `doc-updater` | — |
| Build failure | `build-error-resolver` | — |
| Dead code or scope creep removal | `refactor-cleaner` | — |
| Brownfield onboarding | `spec-miner` | — |
| Critical user flow verification | `e2e-runner` | — |

### 3.3 Parallel Execution

Independent operations MUST be executed in parallel when possible:
- Multiple file reads across unrelated domains
- Multiple test suites that don't share state
- Agent reviews on unrelated file sets (e.g., `code-reviewer` + `security-reviewer`)

---

## 4. SDD x TDD Merge Strategy

Every OpenSpec task is executed using the nested TDD cycle:

```
OpenSpec Task → RED (write failing test) → GREEN (minimal implementation) → REFACTOR → verify 80%+ coverage → next task
```

### 4.1 Workflow Integration

1. **Plan** — Use `planner` agent. Identify dependencies and risks. Break into phases.
2. **TDD** — Use `tdd-guide` agent. Write tests first, implement, refactor.
3. **Review** — Use `code-reviewer` agent immediately. Address CRITICAL/HIGH issues.
4. **Capture Knowledge** — Route to correct location:
   - Temporary debugging notes → auto memory
   - Architecture decisions, API changes → existing `docs/` structure
   - Do NOT duplicate information already captured in code comments or OpenSpec artifacts
5. **Commit** — Conventional commits: `<type>(<scope>): <subject>`

### 4.2 TDD Workflow (Mandatory)

1. **RED** — Write test first. Test MUST fail.
2. **GREEN** — Write minimal implementation. Test MUST pass.
3. **REFACTOR** — Improve code. Verify coverage >= 80%.
4. **Troubleshoot**: Check test isolation → verify mocks → fix implementation (not tests, unless tests are wrong).

### 4.3 Test Types (All Required)

| Type | Scope | Tool | Coverage Target |
|------|-------|------|-----------------|
| Unit | Individual functions, utilities, components | Jest | 80%+ |
| Integration | API endpoints, database operations, middleware chain | Jest + test utilities | 80%+ |
| E2E | Critical user flows, subdomain routing, auth flows | Playwright | All critical paths |

---

## 5. Coding Standards

### 5.1 Immutability (Critical)
Always create new objects, never mutate. Return new copies with changes applied.

### 5.2 File Organization
- Many small files over few large ones
- 200-400 lines typical, 800 lines absolute maximum
- Organize by feature/domain, not by type
- High cohesion, low coupling

### 5.3 Error Handling
- Handle errors at every level
- User-friendly messages in UI code
- Log detailed context server-side
- Never silently swallow errors

### 5.4 Input Validation
- Validate all user input at system boundaries
- Use schema-based validation (Zod)
- Fail fast with clear messages
- Never trust external data

### 5.5 Code Quality Checklist
- Functions small (< 20 lines)
- Nesting < 4 levels
- Proper error handling, no hardcoded values
- Readable, well-named identifiers
- No `any` types in TypeScript

---

## 6. Security Guidelines

### 6.1 Pre-Commit Checklist
- No hardcoded secrets (API keys, passwords, tokens)
- All user inputs validated
- SQL injection prevention (parameterized queries via Prisma)
- XSS prevention (sanitized HTML, CSP headers)
- CSRF protection enabled (Next.js built-in + Auth.js)
- Authentication/authorization verified (JWT + role-based expiry)
- Rate limiting on all endpoints
- Error messages don't leak sensitive data

### 6.2 Secret Management
- NEVER hardcode secrets
- Use environment variables or a secret manager
- Validate required secrets at startup
- Rotate any exposed secrets immediately

### 6.3 Security Incident Protocol
STOP → use `security-reviewer` agent → fix CRITICAL issues → rotate exposed secrets → review codebase for similar issues.

---

## 7. Git Workflow

### 7.1 Commit Format
`<type>(<scope>): <subject>`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

### 7.2 PR Workflow
1. Analyze full commit history
2. Draft comprehensive summary
3. Include test plan
4. Push with `-u` flag

---

## 8. Architecture Constraints

### 8.1 Stack Topology
- **Runtime**: Cloudflare Pages (Edge) via `@cloudflare/next-on-pages`
- **Framework**: Next.js 16.2.6 (App Router)
- **CMS**: Sanity (GROQ + ISR + Stega visual editing)
- **Database**: Neon (PostgreSQL) via Prisma ORM (Proxy lazy init)
- **Auth**: Auth.js v5 (JWT strategy, role-based token expiry)
- **Styling**: Tailwind CSS v4
- **Monorepo**: Turborepo
- **Testing**: Jest (unit/integration) + Playwright (E2E)

### 8.2 Hub-and-Spoke Routing
Edge middleware chain: `short-circuit → cleanHostname → isHubDomain → isDashboardDomain → isSpokeDomain → 404`

Spoke subdomains: `pju`, `solarcell`/`solarpanel`, `alatpetir`/`penangkalpetir`, `baterai`

### 8.3 Known Drift Items (from v2 Audit)
- Subdomain naming mismatch (docs vs code) — resolution pending
- 6 rule files empty — authoring planned for Fase 2
- `ignoreBuildErrors: true` in `next.config.ts` — must be removed
- 21st SDK Agent Chat (undocumented scope creep) — fate pending

---

## 9. Knowledge Graph (Graphify)

If `graphify-out/GRAPH_REPORT.md` exists:
- Before answering architecture or codebase questions, read the graph report for god nodes and community structure
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files
- After modifying code files in a session, run `graphify update .` to keep the graph current (AST-only, no API cost)
- Workspace-scoped MCP server configurations belong in `.agents/mcp.json` or `.agents/mcp_config.json`
- Serving graphify via MCP requires installing `graphifyy[mcp]` (`uv tool install --upgrade "graphifyy[mcp]"`)

---

## 10. Workflow Surface Policy

- `skills/` is the canonical workflow surface for ECC
- New workflow contributions should land in `skills/` first
- `commands/` is a legacy slash-entry compatibility surface — only add/update when a shim is required for migration
- `openspec/` is the canonical spec surface — all change proposals live here
- Workspace-scoped MCP server configurations for Antigravity must be placed under `.agents/mcp.json` or `.agents/mcp_config.json` (do not place in `.gemini/` or `.antigravity/`)

---

## 11. Context Management

- Avoid the last 20% of context window for large refactoring and multi-file features
- Lower-sensitivity tasks (single edits, docs, simple fixes) tolerate higher utilization
- Clear context before starting implementation sessions
- Maintain good context hygiene throughout

---

## 12. Success Metrics

- All tests pass with 80%+ coverage
- No security vulnerabilities
- Code is readable and maintainable
- Performance is acceptable
- User requirements are met
- All 6 rule files are authored and enforced
- All OpenSpec changes are archived within 24 hours of completion
- AGENTS.md is current with the live codebase state
