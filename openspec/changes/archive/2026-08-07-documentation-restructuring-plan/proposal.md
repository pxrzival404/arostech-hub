# Proposal: Documentation Restructuring Plan

## Why

The current repository documentation for PT Daya Berkah Sentosa Nusantara (DBSN) Centralized Digital Ecosystem (`arostech-hub`) is fragmented and lacks key governance, security, licensing, and API specification files. Restructuring the documentation according to the High-Level Software Development Framework 7-Pillar standard will establish a unified Single Source of Truth, accelerate developer onboarding, ensure legal and security compliance, and align AI agent workflows (ECC & OpenSpec).

## What Changes

- **Governance & Legal Root Files**:
  - **NEW**: Add `CONTRIBUTING.md` (branching model, PR checklist, conventional commits).
  - **NEW**: Add `SECURITY.md` (vulnerability disclosure policy, secrets handling, security contact placeholders).
  - **NEW**: Add `LICENSE` (proprietary/open-source licensing declaration).
  - **NEW**: Add `CHANGELOG.md` (Keep a Changelog & Semantic Versioning history).

- **Documentation Directory Hierarchy Restructuring (`docs/`)**:
  - Reorganize `docs/` into 12 structured modules: `system/`, `mwe/`, `api/`, `workflow/`, `codemaps/`, `adr/`, `development/`, `ia/`, `prd/`, `testing/`, `audits/`, `archive/`.

- **New Core Documentation Files**:
  - **NEW**: `docs/system/identity-and-scope.md` (Vision, philosophy, and compatibility matrix).
  - **NEW**: `docs/mwe/add-new-spoke.md` & `docs/mwe/add-api-endpoint.md` (Minimal Working Examples).
  - **NEW**: `docs/api/api-reference.md` (Centralized public API contracts for RFQ, Auth, Revalidation).
  - **NEW**: `docs/api/env-configuration-schema.md` (Complete environment variables reference).
  - **NEW**: `docs/workflow/release-management.md`, `coding-standards.md`, & `ecc-openspec-workflow.md` (Governance & AI agent coordination).

- **Index & Navigation Updates**:
  - Update root `README.md`, `docs/README.md`, `docs/ONBOARDING.md`, and `AGENTS.md` to reference the restructured documentation hierarchy and verify internal links.

## Capabilities

### New Capabilities
- `documentation-governance`: Defines specifications for repository documentation hierarchy, 7-pillar compliance rules, onboarding MWE standards, contribution guidelines, security disclosures, and release lifecycle documentation.

### Modified Capabilities
*(None - pure documentation and governance change with no application requirement changes)*

## Impact

- **Affected Directories**: Root directory (`/`), `docs/`, `.agents/`, and `openspec/`.
- **System Impact**: Zero impact on Next.js runtime application code (`src/`), Prisma database schemas, or Cloudflare Edge functions.
