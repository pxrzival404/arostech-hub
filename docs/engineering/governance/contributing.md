---
id: DOC-ENG-GOV-CONTRIBUTING
title: Contributing Guidelines & Git Flow Standard
version: 4.0.0
status: LOCKED_BASELINE
graphify_community: "community_governance"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100"
  ai_rules: "file:///d:/dev/arostech-hub/docs/engineering/governance/ai-agent-rules.md#L1-L60"
---

# Contributing Guidelines & Git Flow Standard

> **TL;DR**: Authoritative specification and architectural reference for Contributing Guidelines & Git Flow Standard within the DBSN platform (docs/engineering/governance/contributing.md).


> **Authoritative Baseline Reference**: Rules for human developers and AI agents contributing to the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100)).

---

## 1. Branching Strategy & Git Flow

Contributors MUST follow a structured Git Flow:

- `main` — Production branch (deployed to Cloudflare Pages `dayaberkah.id`).
- `feature/<short-description>` — New feature implementation (e.g., `feature/universal-rfq-cart`).
- `fix/<short-description>` — Bug fixes and patch releases.
- `docs/<short-description>` — Documentation refactoring and updates.

### Execution Workflow
1. Branch off `main`: `git checkout -b feature/my-new-spoke`
2. Implement changes following Test-Driven Development (TDD).
3. Run local quality verification: `pnpm lint`, `pnpm test`, `pnpm pages:build`.
4. Push to remote and submit a Pull Request (PR) against `main`.

---

## 2. Conventional Commit Standards

Commits MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>
```

### Supported Types
- `feat`: New product spoke capability or API feature.
- `fix`: Bug fix or patch.
- `docs`: Documentation updates only.
- `refactor`: Code restructuring without functional changes.
- `test`: Adding or updating Jest or Playwright test suites.
- `chore`: Dependency updates or build tooling adjustments.

---

## 3. Mandatory Pull Request Verification Gate

Before any PR is merged into `main`, it SHALL satisfy all gate conditions:

- [ ] All code is strictly typed in TypeScript 5.7+ with 0 `any` annotations.
- [ ] Static analysis passes clean: `pnpm lint`.
- [ ] Unit and integration test suites pass 100%: `pnpm test`.
- [ ] Edge compilation succeeds: `pnpm pages:build`.
- [ ] Documentation updated following the 7-Pillars standard.

---

## 4. OpenSpec Behavioral Requirements

### Requirement: REQ-ENG-CONTRIBUTING-001-GATE-ENFORCEMENT
All Pull Requests submitted to `main` SHALL automatically pass CI static checks and edge build verification before receiving merge approval.

#### Scenario: PR Submission & Automated Gate Verification
- GIVEN a contributor opening a Pull Request against `main`
- WHEN CI triggers the verification pipeline (`pnpm lint && pnpm test && pnpm pages:build`)
- THEN all checks SHALL pass with exit code 0 before code is merged.

---

## 5. OpenSpec Delta

## ADDED Requirements
- REQ-ENG-CONTRIBUTING-001-GATE-ENFORCEMENT: Automated CI quality gate.

## MODIFIED Requirements
- Updated PR approval criteria to mandate Cloudflare Pages edge build checks.

## REMOVED Requirements
- Legacy unverified manual review steps.

---

## 6. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/engineering/governance/contributing.md`
- Graphify Community: `community_governance`
- Master Reference: [`coding-standards.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/coding-standards.md#L1-L60)
