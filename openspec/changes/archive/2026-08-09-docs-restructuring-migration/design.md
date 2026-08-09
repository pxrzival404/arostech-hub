## Context

See `proposal.md` — Why for motivation.

The current `docs/` tree has 11+ top-level folders. A Documentation Architecture Audit Report validated the current state against the approved target architecture on 2026-08-07: all 43 tracked files in `docs/` and 5 root governance files are accounted for in the migration mapping. No `.github/` directory exists; no build scripts or CI/CD pipelines reference internal doc paths. The `package.json` `directories.doc` field references `docs/` (the top-level folder) only — safe to restructure internals. The `.agents/config.json` does not hardcode any doc paths.

Key pre-existing conditions to carry into execution:
- Several files have **broken relative links** prior to restructuring (e.g., `local-setup.md` → `../architecture/tdd-v1.md`, `sanity-cms-guide.md` → `../../CODEMAPS/data.md`).
- The `docs/codemaps/` directory is lowercase on disk but uppercase (`docs/CODEMAPS/`) in git tracking — Windows filesystem is case-insensitive; the migration must use `git mv` to rename correctly.
- Root `AGENTS.md` is actively consumed by Antigravity CLI harnesses at startup; becoming a thin pointer must preserve all structural cues harnesses depend on.
- `openspec/specs/documentation-governance/spec.md` hardcodes `docs/mwe/add-new-spoke.md` — requires a sync via `/opsx-sync` after archive.

## Goals / Non-Goals

**Goals:**
- Safely relocate all 43 `docs/` files to the 4-domain target structure using `git mv` (preserving history).
- Merge 3 file pairs into unified documents without content loss.
- Convert `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md` to valid, renderable thin pointer stubs.
- Author all required `README.md` index files and 3 net-new content files.
- Repair every broken internal Markdown link at both old locations and newly computed relative paths.
- Update `.agents/rules/documentation-mode.md` whitelist to cover new canonical paths.

**Non-Goals:**
- Changes to any source code (`src/`, `prisma/`, `next.config.ts`, `wrangler.json`).
- Changing `CHANGELOG.md` or `LICENSE` (canonical, stay at root).
- Authoring final production-quality content for the 3 net-new files — initial authoritative scaffolds are sufficient; detailed content is an editorial follow-up.
- Retroactively fixing broken links that originate inside `openspec/` exploration files or archived changes.

## Decisions

### Decision 1: Use `git mv` for all file moves

**Why `git mv` over copy-then-delete:** Git tracks renames as moves (when similarity threshold is met), preserving `git log --follow` history for moved files. This is critical for audit trails on governance documents like `AGENTS.md` body content moving to `ai-agent-rules.md`.

**Alternative considered:** Copy files first, delete originals, then commit — rejected because git would treat these as two unrelated operations (add + delete), losing history.

### Decision 2: Staged execution order — moves first, merges second, new content third, links last

**Rationale:** Performing file moves as a discrete git-trackable batch before any content edits prevents merge conflicts between renamed file detection and content diffs. Link repair must happen last because it depends on knowing all final destination paths.

**Execution order:**
1. Create all new target directories
2. `git mv` all simple 1→1 moves
3. Perform the 3 merge operations (manual content combination)
4. Delete `docs/ia/index.md`
5. Convert root pointer files (`AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`)
6. Author `README.md` index files (9 total)
7. Author 3 net-new content files
8. Repair all internal Markdown links (global find-replace sweep)
9. Update `.agents/rules/documentation-mode.md`

### Decision 3: Thin pointer format for root governance files

**Why pointers are valid:** GitHub surfaces `CONTRIBUTING.md` and `SECURITY.md` at root for its UI prompts and Security Advisory tab. Both work correctly as pointer stubs — GitHub renders the Markdown link, and automated scanners will follow links. Pointer content must be ≥ 5 lines with: role summary, link to canonical location, one-glob map of the 4 domains (for `AGENTS.md` only).

**`AGENTS.md` pointer special requirement:** Agent harnesses that load `AGENTS.md` at startup must be able to determine: (1) where the canonical rules live, (2) the 4-domain glob map, (3) that full rules are one link away. The pointer must not be empty or a 1-line stub.

**Alternative considered:** Keep root files canonical and duplicate content under `docs/` — rejected because of drift risk identified in audit.

### Decision 4: `docs/CODEMAPS/` → `docs/system/architecture/codemaps/` casing via `git mv`

On Windows, `git mv docs/CODEMAPS/backend.md docs/system/architecture/codemaps/backend.md` handles the directory rename cleanly because the target path is different. No intermediate rename step needed.

### Decision 5: Merge strategy for the 3 file pairs

| Merge | Strategy |
|---|---|
| `identity-and-scope.md` + `business-context.md` → `vision.md` | Preserve both documents' full content under labelled `##` sections; editorial condensation is a follow-up, not part of this migration |
| `architecture.md` + `CODEMAPS/architecture.md` → `overview.md` | Use `architecture.md` as base; append CODEMAPS content under a clearly marked `## Code Terrain Map` section |
| `ONBOARDING.md` + `local-setup.md` → `quickstart.md` | Use `ONBOARDING.md` as the framing structure; embed `local-setup.md` content under a `## Local Development Environment` section |

### Decision 6: Link repair approach — relative path recalculation

All internal Markdown links are relative. After moves, each link must be recalculated from the new file location to the new target location. Strategy: grep for all `](` link patterns across moved files, filter for `docs/`-relative links (excluding `http://`, `https://`, `#`), and repair each one individually using the mapping table as reference. No automated regex rewrite — each link is verified manually during repair.

## Risks / Trade-offs

- **[Risk] Content loss during merges** → Mitigation: Stage merges as explicit commits; preserve all source content verbatim in the merged file before any editorial condensation.
- **[Risk] Agent harness breakage if `AGENTS.md` pointer is too thin** → Mitigation: Pointer includes full 4-domain glob map and explicit link — harnesses resolve correctly from either stub or canonical file.
- **[Risk] Pre-existing broken links obscure new breaks** → Mitigation: Link repair step starts from a comprehensive grep of all `](` patterns in the new tree; broken-before-migration links are also fixed.
- **[Risk] Windows `git mv` case sensitivity** → Mitigation: Use full different target paths (directory changes), not just case changes, so Windows git handles them without ambiguity.
- **[Risk] `docs/codemaps/` on-disk name differs from git index `docs/CODEMAPS/`** → Mitigation: Use `git mv docs/CODEMAPS/...` (uppercase) to match the git index, not the disk representation.

## Migration Plan

**Rollback strategy:** The entire migration is a single git branch. If anything breaks before merge to `main`, `git checkout main` and `git branch -D <branch>` restores the original state completely.

**Verification before merging to `main`:**
1. Run `git diff --stat main` to confirm only `docs/`, root pointer files, `.agents/rules/`, and `openspec/specs/` are changed.
2. Manually verify all `README.md` index files exist at each domain/second-level folder.
3. Run `grep -r "\](docs/" README.md docs/ AGENTS.md` to confirm no old-path links remain.
4. Verify GitHub renders `SECURITY.md` and `CONTRIBUTING.md` root pointers correctly (preview in browser).
5. Run `openspec validate` to confirm spec delta is clean.

## Open Questions

*(none — all material design decisions are resolved above)*
