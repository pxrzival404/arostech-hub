## MODIFIED Requirements

### Requirement: Repository Documentation Structure Compliance
The repository documentation layout SHALL adhere to the 4-domain deep-module structure: `docs/strategy/`, `docs/system/`, `docs/engineering/`, and `docs/operations/`. Each domain SHALL expose a `README.md` index file as its shallow interface. The tree SHALL be no more than 3 levels deep from the `docs/` root at any point. Every documentation concern SHALL be reachable via a single `glob docs/<domain>/**` pattern.

#### Scenario: Documentation structure validation
- **WHEN** an auditor or AI agent inspects the repository documentation structure
- **THEN** all 4 top-level domains (`strategy/`, `system/`, `engineering/`, `operations/`) SHALL be present under `docs/`
- **THEN** all 7 requirement pillars (Identity & Scope, Onboarding, Architecture & Mechanics, API & Extensibility, Governance & Workflow, QA & Lifecycle, Security & Legal) SHALL be addressable through files located within those 4 domains
- **THEN** each domain folder SHALL contain a `README.md` index file

#### Scenario: Agent glob discoverability
- **WHEN** an AI agent harness resolves documentation context for a given domain query
- **THEN** the agent SHALL be able to retrieve all relevant files for that domain using a single glob pattern (`docs/<domain>/**`) without needing to know individual filenames in advance

### Requirement: Root Governance and Security Disclosures
The repository root directory MUST contain `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, and `CHANGELOG.md`. `CONTRIBUTING.md` and `SECURITY.md` MAY be thin pointer stubs that redirect to their canonical content under `docs/` — they MUST remain valid, renderable Markdown files containing a link to the canonical document. `CHANGELOG.md` and `LICENSE` SHALL remain canonical at root.

#### Scenario: Contribution and security policy verification
- **WHEN** a human contributor or automated security scanner checks the repository root
- **THEN** `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, and `CHANGELOG.md` MUST exist at the repository root
- **THEN** `CONTRIBUTING.md` and `SECURITY.md` MUST either contain actionable policy content directly OR link to a canonical document under `docs/` that contains it
- **THEN** `CHANGELOG.md` SHALL contain the version history directly at root

#### Scenario: GitHub UI compatibility for pointer files
- **WHEN** GitHub renders the root `CONTRIBUTING.md` or `SECURITY.md`
- **THEN** a human reader SHALL be able to navigate directly to the actionable policy content via the embedded link

### Requirement: Minimal Working Examples for Extensibility
The documentation suite SHALL provide isolated, step-by-step Minimal Working Examples (MWE) for creating new product spokes and secure API endpoints.

#### Scenario: Developer onboarding creating a new spoke
- **WHEN** a developer follows the MWE guide at `docs/system/api/mwe/add-new-spoke.md`
- **THEN** they SHALL be able to scaffold a new product spoke with isolated route groups and middleware configuration without breaking existing spokes

#### Scenario: Developer adding an API endpoint
- **WHEN** a developer follows the MWE guide at `docs/system/api/mwe/add-api-endpoint.md`
- **THEN** they SHALL be able to create a validated, typed API route handler without modifying the middleware layer
