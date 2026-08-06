---
trigger: always_on
---

# Agent Rule: Documentation Mode (`documentation-mode.md`)

> **STATUS**: ACTIVE / ENFORCED  
> **SCOPE**: Project-wide Agent Write Restrictions  
> **LAST UPDATED**: 2026-08-06

---

## 1. Overview & Mandate

When **Documentation Mode** is active, the agent acts exclusively as a **Technical Writer & Documentation Maintainer**.

- **WRITE / EDIT Permission**: Restricted strictly to documentation files, PRDs, agent guidelines, and documentation assets.
- **CODEBASE Protection**: The main codebase (`src/`, components, API routes, database schemas, utility scripts, config files) is **STRICTLY READ-ONLY**.
- **READ Permission**: Unrestricted read access to all codebase files is allowed and encouraged to ensure accurate technical documentation.

---

## 2. Trigger Conditions (Activation)

This rule is automatically activated under any of the following conditions:
1. **Explicit Prompt Keywords**: User prompt contains tags or keywords such as `[DOCS_MODE]`, `[DOCUMENTATION_MODE]`, `/doc-mode`, `"documentation mode"`, or `"docs mode"`.
2. **Contextual Task Scope**: The primary user request involves writing, updating, auditing, or refactoring documentation, PRDs, README files, or architecture guides.

---

## 3. Whitelist Policy (WRITE / EDIT Permitted)

The agent is **ONLY** allowed to invoke file modification tools (`write_to_file`, `replace_file_content`, `multi_replace_file_content`) on targets matching the following paths and patterns:

### Allowed Directories & Paths
- `docs/**`
- `.claude/prds/**`
- `.agents/**` or `.agent/**`

### Allowed File Extensions (Project-wide)
- Markdown files: `*.md`, `*.mdx`
- Text documentation: `*.txt` (located inside doc folders)

### Allowed Documentation Visual Assets
Files created or updated inside documentation directories matching:
- Diagram sources: `*.mermaid`, `*.puml`
- Vector & raster images: `*.svg`, `*.png`, `*.jpg`

---

## 4. Blacklist Policy (WRITE / EDIT Strictly Forbidden)

The agent is **STRICTLY FORBIDDEN** from modifying or creating any files outside the Whitelist.

### Forbidden Target Examples (Non-exhaustive)
- Source code: `src/**`, `subdomain/**`, `studio/**`, `public/**`
- Scripts & config: `scripts/**`, `next.config.ts`, `wrangler.json`, `package.json`, `tsconfig.json`, `tailwind.config.ts`
- Language files: `*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.mjs`, `*.cjs`, `*.py`, `*.go`, `*.rs`
- Data & schema: `prisma/**`, `*.prisma`, `*.sql`, `*.graphql`
- Styles & markup: `*.css`, `*.scss`, `*.html` (outside docs)

---

## 5. Terminal Execution Constraints (Moderate Lock)

When Documentation Mode is active, tool calls to `run_command` are governed by the following rules:

### PERMITTED Terminal Commands (Read-only / Verification)
- Inspection & Status: `git status`, `git diff`, `git log`
- Verification & Checks: `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm typecheck`
- Listing & Analysis: `dir`, `ls`, `cat`, `grep`

### FORBIDDEN Terminal Commands (Mutating Codebase)
- Automatic Code Formatters / Codegen: `npx prettier --write src/`, `pnpm codegen`, `prisma generate` (if modifying source files)
- Code Modifications via CLI: `git checkout -- .`, `git apply`, `sed` / `awk` inplace inline edits on source code.
- Package Installs / Removals modifying codebase: `pnpm add`, `npm install` (unless updating doc dependencies with explicit user approval).

---

## 6. Violation Safeguard & Error Handling

If an agent accidentally attempts to call `write_to_file`, `replace_file_content`, or `multi_replace_file_content` on a forbidden file path while in Documentation Mode:

1. **Self-Correction Intercept**: The agent MUST cancel the tool call prior to execution.
2. **User Notification**: The agent MUST inform the user:
   > ⚠️ **[Documentation Mode Guardrail]**: Access Denied. Writing to codebase file `[filepath]` is strictly prohibited while Documentation Mode is active. If you wish to edit source code, please disable Documentation Mode or switch to Development Mode.

---

## 7. Example Workflow

```mermaid
flowchart TD
    A[User Request] --> B{Contains [DOCS_MODE] or Task = Docs?}
    B -- Yes --> C[Activate Documentation Mode]
    B -- No --> D[Standard Development Mode]
    
    C --> E[Analyze Codebase - READ ONLY]
    E --> F{Agent Action: File Write}
    F -- Target in Whitelist docs/*.md --> G[Execute Write]
    F -- Target in Blacklist src/*.ts --> H[ABORT WRITE & Warn User]
```
