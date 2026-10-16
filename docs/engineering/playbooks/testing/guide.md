---
id: DOC-ENG-TEST-GUIDE
title: Engineering Testing Guide & Jest Execution Playbook
version: 5.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_testing"
authoritative_references:
  workflow: "file:///d:/dev/arostech-hub/docs/engineering/governance/0xrizz-workflow.md#L1-L100"
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100"
  strategy: "file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/strategy.md#L1-L60"
---

# Engineering Testing Guide & Jest Execution Playbook

> **TL;DR**: Authoritative specification and architectural reference for Engineering Testing Guide & Jest Execution Playbook within the DBSN platform (docs/engineering/playbooks/testing/guide.md).


> **Authoritative Baseline Reference**: Execution patterns, Jest configuration, directory conventions, and Universal RFQ test specifications for the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100)) and [`0xrizz-workflow.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/0xrizz-workflow.md#L1-L100).

---

## 1. Running Tests & Commands

All unit and integration tests MUST be executed using standard `pnpm` test commands:

| Command | Purpose |
|---|---|
| `pnpm test` | Run all Jest unit and integration tests once |
| `pnpm test:watch` | Run tests in interactive watch mode |
| `pnpm test:coverage` | Generate coverage report (target: **85.0%+** Strict Zero-Regression Gate) |

```bash
# Run specific test file
pnpm test -- src/lib/api/sanity/__tests__/queries.test.ts

# Run tests matching pattern
pnpm test -- --testPathPattern="sanity|middleware"
```

---

## 2. Directory & File Conventions

Tests SHALL be co-located inside `__tests__/` directories adjacent to source files:

```
src/
├── lib/
│   ├── api/
│   │   └── sanity/
│   │       ├── queries.ts           ← Source code
│   │       └── __tests__/
│   │           ├── queries.test.ts  ← Unit test suite
│   │           └── fixtures.ts      ← Test data factories
│   └── __mocks__/
│       └── prisma.ts                ← Manual mock for @prisma/client
```

---

## 3. Universal RFQ Cart Testing Specifications

The multi-product Universal RFQ Cart system introduces Zod schema validation (`rfqSubmissionSchema`), Zustand persistent store (`rfq-cart-store.ts`), dynamic form components (`RfqCartForm.tsx`), and composite API route handling (`POST /api/rfq`). Developers MUST adhere to these testing patterns:

### A. Zod Validation Schema Unit Tests (`__tests__/rfq-schemas.test.ts`)
- **Field Constraints**: Test happy path and error paths for contact name, email, phone (+62 prefix), company name, and project scope notes.
- **Cart Bounds**: Assert that submission payloads block empty cart items arrays (min 1) and restrict bulk submissions (max 50).
- **Quantity Bounds**: Verify that item quantities are integers clamped between 1 and 100,000.
- **Strict Parsing**: Assert that extraneous fields are rejected using strict validation (`.strict()`).

### B. Zustand Store Tests (`__tests__/rfq-cart-store.test.ts`)
- **Mutations**: Test that `addItem`, `removeItem`, `updateQuantity`, `updateItemNotes`, and `clearCart` mutate cart state correctly.
- **Deduplication**: Assert that adding duplicate product and variant keys merges lines by incrementing quantity.
- **Hydration & Reset**: Test store hydration and clearing between user sessions.

### C. Dynamic Form Component Tests (`RfqCartForm.test.tsx`)
- **Store Hydration**: Mock `useRfqCartHydrated` to verify skeleton rendering prior to hydration.
- **Empty Cart State**: Verify Empty Cart view and "Browse Products" CTA when cart items array is empty.
- **Submission Trigger**: Verify valid form submission dispatches composite payload containing contact details and item arrays to `POST /api/rfq`.

### D. Composite API Route Tests (`src/app/api/rfq/__tests__/route.test.ts`)
- **Validation Error Envelope**: Verify invalid payloads return `422 Unprocessable Entity` with standardized error codes.
- **Success Payload Handling**: Request `POST /api/rfq` with valid Universal RFQ payloads and verify `201 Created` status, mock lead ID generation, Resend email dispatch, and Telegram alert triggering.

---

## 4. OpenSpec Behavioral Requirements

### Requirement: REQ-ENG-TEST-001-UNIVERSAL-RFQ
The Jest test suite SHALL validate composite Universal RFQ cart submissions, Zod schema constraints, and API handler responses without relying on legacy B2B/B2G form branching.

#### Scenario: Universal RFQ Cart Integration Test
- GIVEN a multi-product Universal RFQ submission payload
- WHEN executing the route integration test against `POST /api/rfq`
- THEN the test suite MUST assert a `201 Created` HTTP status and verify database insertion and notification dispatch.

---

## 5. OpenSpec Delta

## ADDED Requirements
- REQ-ENG-TEST-001-UNIVERSAL-RFQ: Universal RFQ cart testing specification.

## MODIFIED Requirements
- Replaced legacy separate B2B/B2G form testing guidelines with the unified Universal RFQ Cart testing protocol.

## REMOVED Requirements
- Legacy B2B/B2G form testing instructions.

---

## 6. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/engineering/playbooks/testing/guide.md`
- Graphify Community: `community_testing`
- Master Reference: [`strategy.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/strategy.md#L1-L60)
