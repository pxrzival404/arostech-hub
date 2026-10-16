---
id: DOC-ENG-TEST-E2E-PLAYBOOK
title: Playwright End-to-End (E2E) Testing Playbook
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_testing"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100"
  strategy: "file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/strategy.md#L1-L60"
---

# Playwright End-to-End (E2E) Testing Playbook

> **TL;DR**: Authoritative specification and architectural reference for Playwright End-to-End (E2E) Testing Playbook within the DBSN platform (docs/engineering/playbooks/testing/e2e-playbook.md).


> **Authoritative Baseline Reference**: Execution patterns, Page Object Model (POM) structure, cross-subdomain authentication, and critical flow verification for Playwright E2E testing in the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100)).

---

## 1. Playwright Setup & Configuration

Playwright E2E tests SHALL validate user journeys across corporate hub (`dayaberkah.id`), product spokes (`pju`, `solarcell`, `alatpetir`, `baterai`), and the private client tracking portal (`dashboard.dayaberkah.id`).

```typescript
// play-config.ts sample contract interface
export interface E2ETestConfig {
  readonly baseURL: string;
  readonly testDir: string;
  readonly retries: number;
  readonly use: {
    readonly trace: 'on-first-retry' | 'retain-on-failure';
    readonly screenshot: 'only-on-failure';
  };
}
```

---

## 2. Core Execution Commands

All E2E test suites MUST be executed using standard project tooling:

```bash
# Run all Playwright E2E tests headless
pnpm test:e2e

# Run E2E tests with UI mode debugging
pnpm test:e2e -- --ui

# Target specific subdomain test suite
pnpm test:e2e -- tests/e2e/spoke-pju.spec.ts
```

---

## 3. Page Object Model (POM) Patterns

Developers MUST structure E2E tests using the Page Object Model pattern inside `tests/e2e/pages/`:

1. `HubHomePage.ts` — Corporate trust center, navigation links, certification badges.
2. `SpokePage.ts` — Product spoke layout, category filters, product details, RFQ trigger.
3. `UniversalRfqModal.ts` — RFQ cart modal interaction, form input, submission trigger.
4. `DashboardPage.ts` — Auth.js v5 client login, project milestone tracking, data isolation.

---

## 4. OpenSpec Behavioral Requirements

### Requirement: REQ-ENG-TEST-E2E-001-FLOW-VERIFICATION
Playwright E2E tests SHALL verify critical user flows end-to-end across hub, spoke, and client portal subdomains.

#### Scenario: Universal RFQ Submission Flow
- GIVEN a user navigating to `pju.dayaberkah.id`
- WHEN selecting a product, adding it to the RFQ cart, and submitting the form
- THEN the system SHALL display a success confirmation state and record the submission lead record in Neon Postgres.

---

## 5. OpenSpec Delta

## ADDED Requirements
- REQ-ENG-TEST-E2E-001-FLOW-VERIFICATION: End-to-end multi-subdomain user flow verification requirement.

## MODIFIED Requirements
- Standardized E2E testing playbook for Ecosystem v4.0.0.

## REMOVED Requirements
- None.

---

## 6. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/engineering/playbooks/testing/e2e-playbook.md`
- Graphify Community: `community_testing`
- Master Reference: [`strategy.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/strategy.md#L1-L60)
