---
id: DOC-ENG-INDEX
title: Engineering & Governance Master Index
version: 4.0.0
status: LOCKED_BASELINE
graphify_community: "community_engineering"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100"
  ai_rules: "file:///d:/dev/arostech-hub/docs/engineering/governance/ai-agent-rules.md#L1-L60"
---

# Engineering & Governance Master Index (`docs/engineering/`)

> **TL;DR**: Authoritative specification and architectural reference for Engineering & Governance Master Index (`docs/engineering/`) within the DBSN platform (docs/engineering/README.md).


> **Authoritative Baseline Reference**: Repository governance policies, contribution rules, testing standards, and developer playbooks for the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100)).

---

## 1. Overview & Operating Standard

Engineering discipline at DBSN is governed by strict test-driven development (TDD), docs-first specification, and 7-Pillars AI-friendly documentation rules. All developers and AI agent harnesses MUST conform to the governance standards defined in this directory.

```
docs/engineering/
├── governance/             # Mandatory repository governance rules
│   ├── ai-agent-rules.md   # AI agent operating guardrails & topology
│   ├── coding-standards.md # TypeScript, React 19, Tailwind v4 rules
│   ├── contributing.md     # Git Flow, commit standards, PR gates
│   ├── openspec-workflow.md# OpenSpec Extended Workflow (OPSX) guide
│   └── versioning-policy.md# SemVer 2.0.0 & release gate criteria
└── playbooks/              # Developer execution playbooks
    ├── gsc-setup.md        # Google Search Console & indexing playbook
    ├── sanity-cms-guide.md # Headless Sanity CMS & ISR guide
    ├── quickstart.md       # Day-1 developer onboarding guide
    └── testing/            # Comprehensive testing documentation
        ├── guide.md        # Jest runner & file conventions
        ├── strategy.md     # TDD strategy & coverage targets
        ├── mocking-specs.md# External service mocks (Prisma, Sanity, etc.)
        └── e2e-playbook.md # Playwright E2E testing playbook
```

---

## 2. Governance Contracts & Guidelines

| Policy Document | Scope & Focus | Key Standard |
| :--- | :--- | :--- |
| [`contributing.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/contributing.md#L1-L60) | Git Flow, Conventional Commits, PR approval gates | PRs MUST pass 100% tests & edge build |
| [`ai-agent-rules.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/ai-agent-rules.md#L1-L60) | Operating rules, domain topology, `[DOCS_MODE]` guardrails | Agents SHALL NOT mutate code in DOCS_MODE |
| [`coding-standards.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/coding-standards.md#L1-L60) | TS strict mode, immutability, React 19 RSC, Tailwind v4 | Code SHALL NOT use `any` types |
| [`versioning-policy.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/versioning-policy.md#L1-L40) | SemVer 2.0.0 rules and release gates | Version numbers SHALL follow SemVer strictly |
| [`openspec-workflow.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/openspec-workflow.md#L1-L50) | OpenSpec Extended Workflow (OPSX) lifecycle | Changes MUST have approved OpenSpec proposal |

---

## 3. Developer Playbooks & Testing Framework

| Playbook Document | Focus Area | Primary Target |
| :--- | :--- | :--- |
| [`quickstart.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/quickstart.md#L1-L50) | Local setup, `lvh.me` subdomain resolution, pnpm commands | Local environment setup |
| [`sanity-cms-guide.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/sanity-cms-guide.md#L1-L100) | GROQ query patterns, ISR cache tags, webhook revalidation | Sanity CMS integration |
| [`gsc-setup.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/gsc-setup.md#L1-L50) | Search Console setup, sitemap submission, indexing checks | Organic search indexing |
| [`testing/strategy.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/strategy.md#L1-L60) | TDD RED-GREEN-REFACTOR cycle, 80%+ coverage mandate | Test architecture strategy |
| [`testing/guide.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/guide.md#L1-L60) | Jest configuration, file layout, Universal RFQ testing | Unit & Integration testing |
| [`testing/mocking-specs.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/mocking-specs.md#L1-L60) | Neon/Prisma, Sanity, Resend, Telegram API mocks | Isolated unit mocking |
| [`testing/e2e-playbook.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/e2e-playbook.md#L1-L60) | Playwright E2E testing across subdomains & client portal | Critical E2E user flows |

---

## 4. OpenSpec Behavioral Requirements

### Requirement: REQ-ENG-INDEX-001
Engineering documentation SHALL provide single-source-of-truth navigation across all governance, playbook, and testing specifications.

#### Scenario: Contributor Navigation
- GIVEN a human developer or AI agent requiring engineering guidance
- WHEN accessing `docs/engineering/README.md`
- THEN the system SHALL expose valid `file:///` anchored links to all governance and playbook documents.

---

## 5. OpenSpec Delta

## ADDED Requirements
- REQ-ENG-INDEX-001: Consolidated engineering governance and playbook index.

## MODIFIED Requirements
- None.

## REMOVED Requirements
- Legacy unanchored navigation links.

---

## 6. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/engineering/README.md`
- Graphify Community: `community_engineering`
- Master Reference: [`AGENTS.md`](file:///d:/dev/arostech-hub/AGENTS.md#L1-L50)
