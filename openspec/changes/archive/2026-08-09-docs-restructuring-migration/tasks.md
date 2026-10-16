## 1. Branch Setup

- [x] 1.1 Create a new git branch: `git checkout -b docs/restructure-4-domain-migration`

## 2. Create Target Directory Structure

- [x] 2.1 Create `docs/strategy/` directory
- [x] 2.2 Create `docs/system/architecture/codemaps/` directory
- [x] 2.3 Create `docs/system/architecture/information-architecture/` directory
- [x] 2.4 Create `docs/system/adr/` directory
- [x] 2.5 Create `docs/system/api/mwe/` directory
- [x] 2.6 Create `docs/engineering/governance/` directory
- [x] 2.7 Create `docs/engineering/playbooks/testing/` directory
- [x] 2.8 Create `docs/operations/runbooks/` directory
- [x] 2.9 Create `docs/operations/security/` directory
- [x] 2.10 Create `docs/operations/audits/lighthouse/desktop/` and `docs/operations/audits/lighthouse/recomendation/` directories

## 3. Simple File Moves (git mv — 1-to-1, no content change)

- [x] 3.1 `git mv docs/system/project-roadmap.md docs/strategy/roadmap.md`
- [x] 3.2 `git mv docs/prd/prd-v3.md docs/strategy/prd/00-overview-and-goals.md`
- [x] 3.3 `git mv docs/prd/prd-c-level-segment-focus.md docs/strategy/segments.md`
- [x] 3.4 `git mv docs/system/middleware-routing.md docs/system/architecture/execution-lifecycle.md`
- [x] 3.5 `git mv "docs/CODEMAPS/backend.md" docs/system/architecture/codemaps/backend.md`
- [x] 3.6 `git mv "docs/CODEMAPS/frontend.md" docs/system/architecture/codemaps/frontend.md`
- [x] 3.7 `git mv "docs/CODEMAPS/data.md" docs/system/architecture/codemaps/data.md`
- [x] 3.8 `git mv "docs/CODEMAPS/dependencies.md" docs/system/architecture/codemaps/dependencies.md`
- [x] 3.9 `git mv docs/ia/ia-sitemaps.md docs/system/architecture/information-architecture/sitemaps.md`
- [x] 3.10 `git mv docs/ia/ia-user-flows.md docs/system/architecture/information-architecture/user-flows.md`
- [x] 3.11 `git mv docs/ia/ia-strategy-navigation.md docs/system/architecture/information-architecture/navigation-strategy.md`
- [x] 3.12 `git mv docs/adr/README.md docs/system/adr/README.md`
- [x] 3.13 `git mv docs/adr/template.md docs/system/adr/template.md`
- [x] 3.14 `git mv docs/adr/0001-migrate-fully-to-cloudflare-pages.md docs/system/adr/superseded/0001-migrate-fully-to-cloudflare-pages.md`
- [x] 3.15 `git mv docs/adr/0002-explicit-cloudflare-pages-deploy-command.md docs/system/adr/superseded/0002-explicit-cloudflare-pages-deploy-command.md`
- [x] 3.16 `git mv docs/api/api-reference.md docs/system/api/reference.md`
- [x] 3.17 `git mv docs/api/env-configuration-schema.md docs/system/api/configuration-schema.md`
- [x] 3.18 `git mv docs/mwe/add-api-endpoint.md docs/system/api/mwe/add-api-endpoint.md`
- [x] 3.19 `git mv docs/mwe/add-new-spoke.md docs/system/api/mwe/add-new-spoke.md`
- [x] 3.20 `git mv docs/workflow/coding-standards.md docs/engineering/governance/coding-standards.md`
- [x] 3.21 `git mv docs/workflow/ecc-openspec-workflow.md docs/engineering/governance/openspec-workflow.md`
- [x] 3.22 `git mv docs/development/sanity-cms-guide.md docs/engineering/playbooks/sanity-cms-guide.md`
- [x] 3.23 `git mv docs/development/gsc-setup.md docs/engineering/playbooks/gsc-setup.md`
- [x] 3.24 `git mv docs/system/tdd-v1.md docs/engineering/playbooks/testing/strategy.md`
- [x] 3.25 `git mv docs/development/testing-guide.md docs/engineering/playbooks/testing/guide.md`
- [x] 3.26 `git mv docs/testing/mocking-specs.md docs/engineering/playbooks/testing/mocking-specs.md`
- [x] 3.27 `git mv docs/workflow/release-management.md docs/operations/runbooks/release-process.md`
- [x] 3.28 `git mv docs/development/cloudflare-deployment.md docs/operations/runbooks/deployment.md`
- [x] 3.29 `git mv docs/system/dns-cutover-mapping.md docs/operations/runbooks/dns-cutover.md`
- [x] 3.30 `git mv docs/audits/developer-fix-guide.md docs/operations/audits/developer-fix-guide.md`
- [x] 3.31 `git mv docs/audits/verify-manual-tasks-prompt.md docs/operations/audits/verify-manual-tasks-prompt.md`
- [x] 3.32 `git mv docs/audits/integration-health-audit-2026-07-14.md docs/operations/audits/archive/integration-health-audit-2026-07-14.md`
- [x] 3.33 `git mv docs/audits/landing-page-ux-audit-2026-07-09.md docs/operations/audits/archive/landing-page-ux-audit-2026-07-09.md`
- [x] 3.34 `git mv "docs/audits/lighthouse/desktop/dayaberkah.id-20260723T014653.json" docs/operations/audits/lighthouse/desktop/dayaberkah.id-20260723T014653.json`
- [x] 3.35 `git mv "docs/audits/lighthouse/recomendation/dayaberkah.id-20260723T014653.md" docs/operations/audits/archive/lighthouse-20260723-recommendation.md`

## 4. File Merges (content combination — creates new target files)

- [x] 4.1 Merge `docs/system/identity-and-scope.md` + `docs/system/business-context.md` → create `docs/strategy/vision.md` (preserve full content of both under labelled `##` sections)
- [x] 4.2 `git rm docs/system/identity-and-scope.md docs/system/business-context.md` after merge is confirmed complete
- [x] 4.3 Merge `docs/system/architecture.md` + `docs/CODEMAPS/architecture.md` → create `docs/system/architecture/overview.md` (use `architecture.md` as base; append CODEMAPS content under `## Code Terrain Map` section)
- [x] 4.4 `git rm docs/system/architecture.md "docs/CODEMAPS/architecture.md"` after merge is confirmed complete
- [x] 4.5 Merge `docs/ONBOARDING.md` + `docs/development/local-setup.md` → create `docs/engineering/playbooks/quickstart.md` (use `ONBOARDING.md` as framing structure; embed `local-setup.md` content under `## Local Development Environment` section)
- [x] 4.6 `git rm docs/ONBOARDING.md docs/development/local-setup.md` after merge is confirmed complete

## 5. File Deletion

- [x] 5.1 `git rm docs/ia/index.md` (superseded by `docs/system/architecture/README.md` to be created in Step 6)

## 6. Root Pointer File Conversion

- [x] 6.1 Relocate full `AGENTS.md` body content to `docs/engineering/governance/ai-agent-rules.md` (new file)
- [x] 6.2 Rewrite root `AGENTS.md` as a thin pointer: role summary (2–3 lines), link to `docs/engineering/governance/ai-agent-rules.md`, and 4-domain glob map (`docs/strategy/**`, `docs/system/**`, `docs/engineering/**`, `docs/operations/**`)
- [x] 6.3 Relocate full `CONTRIBUTING.md` body content to `docs/engineering/governance/contributing.md` (new file)
- [x] 6.4 Rewrite root `CONTRIBUTING.md` as a thin pointer: 2-line intro + link to `docs/engineering/governance/contributing.md`
- [x] 6.5 Relocate full `SECURITY.md` body content to `docs/operations/security/security-policy.md` (new file)
- [x] 6.6 Rewrite root `SECURITY.md` as a thin pointer: 2-line intro + link to `docs/operations/security/security-policy.md`

## 7. README.md Index Files (9 files)

- [x] 7.1 Rewrite `docs/README.md` in-place as master index — 4-domain navigation table with audience routing (AI agent, human contributor, security scanner, repo visitor)
- [x] 7.2 Create `docs/strategy/README.md` — index linking to `vision.md`, `roadmap.md`, `prd.md`, `segments.md`, `compatibility-matrix.md`
- [x] 7.3 Create `docs/system/README.md` — index linking to `architecture/`, `adr/`, `api/` with one-line descriptions
- [x] 7.4 Create `docs/system/architecture/README.md` — index linking to `overview.md`, `execution-lifecycle.md`, `codemaps/`, `information-architecture/`
- [x] 7.5 Create `docs/system/adr/README.md` — decision log table (ADR number, title, status, date) for 0001 and 0002
- [x] 7.6 Create `docs/system/api/README.md` — index linking to `reference.md`, `configuration-schema.md`, `extensibility.md`, `mwe/`
- [x] 7.7 Create `docs/engineering/README.md` — index linking to `governance/` and `playbooks/` with descriptions
- [x] 7.8 Create `docs/operations/README.md` — index linking to `runbooks/`, `security/`, `audits/`
- [x] 7.9 Create `docs/operations/audits/README.md` — audit log table (date, scope, status) for all existing audit files

## 8. Net-New Content Files (3 files)

- [x] 8.1 Create `docs/strategy/compatibility-matrix.md` — matrix of supported runtimes (Node versions, Cloudflare Workers runtime, Next.js version, browser targets) with current known values
- [x] 8.2 Create `docs/system/api/extensibility.md` — plugin/adapter architecture document describing the hub-spoke extension pattern, referencing `docs/system/api/mwe/add-new-spoke.md` as the MWE
- [x] 8.3 Create `docs/engineering/governance/versioning-policy.md` — SemVer rules (major/minor/patch triggers), changelog update procedure, release gate criteria

## 9. Internal Markdown Link Repair

- [x] 9.1 Update `README.md` (root): fix 10 broken links to new paths (architecture.md → system/architecture/overview.md, middleware-routing.md → system/architecture/execution-lifecycle.md, mwe/* → system/api/mwe/*, api/* → system/api/*, development/* → engineering/playbooks/*)
- [x] 9.2 Update `docs/system/architecture/overview.md` (merged): re-anchor all relative links from new file location
- [x] 9.3 Update `docs/engineering/playbooks/quickstart.md` (merged): fix all relative links (CONTRIBUTING.md, architecture, testing, mwe guides)
- [x] 9.4 Update `docs/engineering/playbooks/testing/guide.md`: fix links to `mocking-specs.md` and `tdd-v1.md` (now at `strategy.md`)
- [x] 9.5 Update `docs/engineering/playbooks/sanity-cms-guide.md`: fix link to `docs/CODEMAPS/data.md` (now at `docs/system/architecture/codemaps/data.md`) and `testing/mocking-specs.md`
- [x] 9.6 Update `docs/engineering/playbooks/testing/mocking-specs.md`: fix links to `project-roadmap.md`, `local-setup.md`, `tdd-v1.md`
- [x] 9.7 Update `docs/system/architecture/codemaps/` files: fix any cross-references
- [x] 9.8 Update `docs/system/project-roadmap.md` (now at `docs/strategy/roadmap.md`): fix links to `AGENTS.md`, `testing/mocking-specs.md`, `development/local-setup.md`, `architecture/tdd-v1.md`
- [x] 9.9 Update `docs/system/architecture/information-architecture/` files: fix relative cross-links between the 3 IA documents
- [x] 9.10 Update `docs/operations/audits/developer-fix-guide.md`: fix link to `integration-health-audit-2026-07-14.md` (same directory, relative path unchanged — verify)
- [x] 9.11 Update `docs/operations/audits/archive/integration-health-audit-2026-07-14.md`: fix self-reference path string in agent prompt content
- [x] 9.12 Update `docs/engineering/governance/ai-agent-rules.md` (new AGENTS.md canonical file): update any internal doc path references in the rules body

## 10. Agent Rules & OpenSpec Sync

- [x] 10.1 Update `.agents/rules/documentation-mode.md` whitelist: confirm `docs/**` glob still covers new structure; update any specific path examples in the file that reference old directory names
- [x] 10.2 Update `openspec/specs/documentation-governance/spec.md` main spec: apply the delta from this change's `specs/documentation-governance/spec.md` (update MWE path and pointer-stub language)

## 11. Verification

- [x] 11.1 Run `git diff --stat main` — confirm only `docs/`, root pointer files, `.agents/rules/`, and `openspec/specs/` are changed; no `src/` or config files
- [x] 11.2 Verify all 9 `README.md` index files exist at correct paths
- [x] 11.3 Run `grep -rn "\](docs/mwe\|docs/adr\|docs/api\|docs/CODEMAPS\|docs/codemaps\|docs/development\|docs/ia\|docs/prd\|docs/system/identity\|docs/system/business\|docs/system/architecture\.md\|docs/system/middleware\|docs/system/tdd\|docs/system/dns\|docs/system/project-roadmap\|docs/testing\|docs/workflow\|docs/audits\)" docs/ README.md AGENTS.md` — confirm zero old-path links remain
- [x] 11.4 Verify root `SECURITY.md` and `CONTRIBUTING.md` are valid renderable Markdown (open in browser preview)
- [x] 11.5 Run `openspec validate` — confirm spec delta passes validation
- [x] 11.6 Commit all changes with conventional commit message: `docs: restructure docs/ into 4-domain deep-module architecture`
