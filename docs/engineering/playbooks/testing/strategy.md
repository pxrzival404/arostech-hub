---
id: TDD-STRAT-001
title: DBSN Technical Testing & TDD Strategy
version: 4.0.0
status: LOCKED_BASELINE
graphify_community: "community_testing"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md#L1-L60"
---

# Technical Testing & TDD Strategy

> **Authoritative Baseline Reference**: Testing playbook and TDD execution methodology for the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100)).

---

## 1. TDD Philosophy & Execution Mandate

All software development across the codebase MUST adhere to the Test-Driven Development (TDD) cycle (RED → GREEN → REFACTOR).

```
┌─────────────────────────────────────────────────────────┐
│                    TEST-DRIVEN DEVELOPMENT              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐    ┌────────────┐    ┌───────────┐         │
│  │   RED    │    │   GREEN    │    │   REFACTOR│         │
│  │Write Test│ →  │Write Code  │ →  │Clean Up   │         │
│  │Fail Test │    │Pass Test   │    │Pass Test  │         │
│  └─────────┘    └────────────┘    └───────────┘         │
│               ↘           ↙               ↙             │
│          Production-Ready Code                          │
└─────────────────────────────────────────────────────────┘
```

### Mandated TDD Rules
1. **Red First**: No production feature code SHALL be merged without prior failing test coverage.
2. **Isolation Invariant**: Tests MUST execute independently without shared in-memory state or database pollution.
3. **Coverage Threshold**: Total project test coverage MUST be maintained at **80%+** across unit, integration, and end-to-end suites.
4. **Zero-Hallucination Scope**: Test suites MUST NOT import or mock non-existent runtime components (such as external legacy queue clusters or legacy 301 redirect tables).

---

## 2. Architecture & Subdomain Test Suites

### Greenfield Subdomain Routing Suite
Tests MUST verify middleware subdomain routing for `dayaberkah.id` and canonical product spoke subdomains (`pju`, `solarcell`, `alatpetir`, `baterai`, `dashboard`).

```typescript
// src/__tests__/middleware/routing.test.ts
import { NextRequest } from 'next/server';
import middleware from '@/middleware';

describe('Middleware Subdomain Routing', () => {
  it('SHALL rewrite hub requests on dayaberkah.id to root app tree', () => {
    const req = new NextRequest('https://dayaberkah.id/about', {
      headers: { host: 'dayaberkah.id' }
    });
    const res = middleware(req);
    expect(res?.headers.get('x-middleware-subdomain')).toBe('hub');
  });

  it('SHALL rewrite dashboard requests to flat dashboard/ route', () => {
    const req = new NextRequest('https://dashboard.dayaberkah.id/overview', {
      headers: { host: 'dashboard.dayaberkah.id' }
    });
    const res = middleware(req);
    expect(res?.headers.get('x-middleware-subdomain')).toBe('dashboard');
  });
});
```

---

## 3. Universal RFQ & Greenfield Test Specifications

### Requirement: REQ-TEST-001-UNIVERSAL-RFQ
The testing framework MUST validate composite cart RFQ submissions (`rfqSubmissionSchema`) and WhatsApp fallback handling without relying on legacy B2B/B2G form branching or external message broker dependencies.

#### Scenario: Universal RFQ Unit & Integration Verification
- GIVEN a valid multi-item RFQ payload
- WHEN submitted to `POST /api/rfq`
- THEN the suite MUST verify `201 Created` status, Neon Postgres database insertion, Resend email dispatch, and Telegram notification trigger.

---

## 4. Test Pyramid & Target Coverage Matrix

| Test Level | Scope | Tools | Target Coverage | Execution Trigger |
|---|---|---|---|---|
| **Unit** | Utility functions, Zod schemas, React components | Jest / React Testing Library | 85%+ | Pre-commit hook & PR gate |
| **Integration** | API routes (`/api/rfq`, `/api/auth`), Prisma DB queries | Jest + Mocked Providers | 80%+ | CI pipeline run |
| **E2E** | Client dashboard auth, tracking portal, RFQ submission | Playwright | 100% Critical Flows | Pre-deployment gate |

---

## 5. OpenSpec Delta

## ADDED Requirements
- REQ-TEST-001-UNIVERSAL-RFQ: Universal RFQ cart testing requirement.

## MODIFIED Requirements
- Purged legacy Redis and 301 redirect map references in favor of native Cloudflare Edge runtime patterns.

## REMOVED Requirements
- Legacy queue testing specifications.

---

## 6. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/engineering/playbooks/testing/strategy.md`
- Graphify Community: `community_testing`
- Master Reference: [`guide.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/guide.md#L1-L60)
