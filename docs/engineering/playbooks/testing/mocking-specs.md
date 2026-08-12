---
id: DOC-ENG-TEST-MOCKING
title: External Service Mocking Specifications & Test Doubles Guide
version: 4.0.0
status: LOCKED_BASELINE
graphify_community: "community_testing"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100"
  strategy: "file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/strategy.md#L1-L60"
---

# External Service Mocking Specifications & Test Doubles Guide

> **Authoritative Baseline Reference**: Standardized mock definitions and test double specifications for external integrations (Neon/Prisma, Sanity CMS, Resend Email, and Telegram Bot API) in the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100)).

---

## 1. Overview & Isolation Mandate

Tests MUST NEVER depend on live network calls or external staging servers. All external services SHALL be mocked using isolated Jest mocks in `src/lib/__mocks__/`.

**Services Subject to Mandatory Mocking:**
1. Neon Postgres (via `@prisma/client`)
2. Sanity.io Headless CMS (via `@sanity/client`)
3. Resend Email API (via `@resend/node`)
4. Telegram Bot API (via `fetch`)

---

## 2. Neon Postgres Mock Specification (`src/lib/__mocks__/prisma.ts`)

The Prisma client mock MUST reflect PRD v4.0.0 models (`lead`, `user`, `account`, `session`) and MUST NOT contain legacy tables (such as `redirectMap`).

```typescript
import { PrismaClient } from '@prisma/client';

export const mockPrismaClient = {
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    lead: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
  })),
};
```

---

## 3. Sanity CMS Mock Specification (`src/lib/__mocks__/sanity.ts`)

Sanity mocks SHALL simulate GROQ query responses and handle null returns gracefully:

```typescript
export const mockSanityClient = {
  createClient: jest.fn(() => ({
    fetch: jest.fn().mockResolvedValue([]),
    config: jest.fn(() => ({
      projectId: 'mock-project-id',
      dataset: 'production',
    })),
  })),
};
```

---

## 4. Resend & Telegram Notification Mocks

Email and messaging API adapters MUST be mocked to capture dispatch payloads without sending live external network requests:

```typescript
// Resend Email Mock
export const mockResend = {
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn().mockResolvedValue({ id: 'email-mock-123' }) },
  })),
};
```

---

## 5. OpenSpec Behavioral Requirements

### Requirement: REQ-ENG-MOCKING-001-ISOLATION
Test suites executing under `pnpm test` SHALL run in 100% offline isolation without reaching external networks or non-existent legacy tables.

#### Scenario: Prisma & Network Mock Verification
- GIVEN a unit or integration test suite executing API or database logic
- WHEN invoking repository or service functions
- THEN all database operations MUST execute against `mockPrismaClient` (without `redirectMap` references) and external HTTP requests MUST execute against `global.fetch` mocks.

---

## 6. OpenSpec Delta

## ADDED Requirements
- REQ-ENG-MOCKING-001-ISOLATION: Offline network isolation contract.

## MODIFIED Requirements
- Excised `redirectMap` table mock from Prisma test double.

## REMOVED Requirements
- Legacy `redirectMap` mocking specifications.

---

## 7. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/engineering/playbooks/testing/mocking-specs.md`
- Graphify Community: `community_testing`
- Master Reference: [`guide.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/guide.md#L1-L60)