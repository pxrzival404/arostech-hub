## Why

The `docs/` tree grew organically into 11+ loosely-related top-level folders with overlapping responsibilities, making it costly for both engineers and AI agent harnesses to build accurate context. The Documentation Architecture Audit Report (2026-08-07) defines a validated, approved target state — four top-level domains (`strategy/`, `system/`, `engineering/`, `operations/`) — that consolidates every existing document under a single, glob-friendly hierarchy no deeper than three levels. Executing this migration now closes the drift risk between root governance files and their future canonical locations under `docs/`, eliminates pre-existing broken internal links, and establishes the `README.md`-as-index pattern needed for agent context-window economy.

## What Changes

- **Create 4 top-level domain directories** under `docs/`: `strategy/`, `system/`, `engineering/`, `operations/`.
- **Move and rename 36 existing files** from current paths to target paths per the audit report Section 5 mapping table (no content changes during moves).
- **Merge 3 file pairs** into single canonical documents:
  - `docs/system/identity-and-scope.md` + `docs/system/business-context.md` → `docs/strategy/vision.md`
  - `docs/system/architecture.md` + `docs/CODEMAPS/architecture.md` → `docs/system/architecture/overview.md`
  - `docs/ONBOARDING.md` + `docs/development/local-setup.md` → `docs/engineering/playbooks/quickstart.md`
- **Delete 1 retired file**: `docs/ia/index.md` (superseded by `docs/system/architecture/README.md`).
- **Author 3 net-new content files**:
  - `docs/strategy/compatibility-matrix.md` — supported runtimes/platforms/versions matrix
  - `docs/system/api/extensibility.md` — plugin/adapter architecture documentation
  - `docs/engineering/governance/versioning-policy.md` — SemVer rules and release policy
- **Author 8+ `README.md` index files** (one at `docs/` root and each domain/second-level folder).
- **Convert 3 root files to thin pointer files** (content moves to `docs/`):
  - `AGENTS.md` → pointer to `docs/engineering/governance/ai-agent-rules.md`
  - `CONTRIBUTING.md` → pointer to `docs/engineering/governance/contributing.md`
  - `SECURITY.md` → pointer to `docs/operations/security/security-policy.md`
- **Repair all internal Markdown links** in `README.md`, `docs/`, and agent rule files that reference moved paths.
- **Update `.agents/rules/documentation-mode.md`** whitelist to reflect new canonical doc paths.
- **Sync OpenSpec spec** for `documentation-governance` to reference updated MWE paths.

## Capabilities

### New Capabilities

*(none — this change restructures existing documentation paths; no new system behaviors are introduced)*

### Modified Capabilities

- `documentation-governance`: MWE scenario path reference changes from `docs/mwe/add-new-spoke.md` to `docs/system/api/mwe/add-new-spoke.md`. Root governance files (`CONTRIBUTING.md`, `SECURITY.md`) now become pointer stubs — the requirement that they "exist and provide actionable policies" is satisfied by pointer redirection to canonical locations under `docs/`.

## Impact

- **All Markdown files in `docs/`**: Every file is moved, merged, or rewritten in-place. No source code (`src/`, `prisma/`, config files) is touched.
- **Root `README.md`**: 10 documentation links updated to new paths.
- **Root `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`**: Content relocated; root files become thin stubs.
- **`.agents/rules/documentation-mode.md`**: Whitelist path descriptions updated.
- **`openspec/specs/documentation-governance/spec.md`**: MWE scenario path updated.
- **No runtime, build, or deployment impact**: `package.json` `directories.doc` field points to `docs/` (unchanged); no CI/CD scripts reference internal doc paths; `.github/` does not exist.
