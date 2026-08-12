---
id: DOC-OPS-RUN-ONBOARDING
title: Client Onboarding & Project Tracking Portal Management Runbook
version: 4.0.0
status: LOCKED_BASELINE
graphify_community: "community_operations"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100"
  release_runbook: "file:///d:/dev/arostech-hub/docs/operations/runbooks/release-process.md#L1-L60"
---

# Client Onboarding & Project Tracking Portal Management Runbook

> **Authoritative Baseline Reference**: Operational procedures for provisioning client accounts, managing project tracking milestones, and maintaining B2B/B2G data isolation on the **DBSN Client Portal** (`dashboard.dayaberkah.id`), fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100)).

---

## 1. Overview & Portal Architecture

The Client Portal (`dashboard.dayaberkah.id`) serves authenticated B2B and B2G procurement officers with real-time tracking for project milestones, deliverables, warranty certificates, and RFQ order histories.

```
Client Portal Admin (Operations)
        │  1. Provision User & Project in Neon DB
        ▼
Auth.js v5 JWT Session Management
        │  2. Send Onboarding Invitation Email (Resend)
        ▼
Client Officer (`dashboard.dayaberkah.id`)
        │  3. Login & View Isolated Project Timeline
        ▼
Real-time Project Milestone Tracking
```

```typescript
// Declarative Client Onboarding Payload Interface
export interface ClientOnboardingPayload {
  readonly clientName: string;
  readonly contactEmail: string;
  readonly companyName: string;
  readonly segment: 'B2B' | 'B2G';
  readonly assignedProjects: readonly string[];
}
```

---

## 2. Onboarding Workflow Steps

1. **User Account Provisioning**: Operations SHALL create user records with role `CLIENT` in Neon Postgres using Auth.js credentials.
2. **Project Linkage**: Link the client user ID to target project milestone records in the database.
3. **Invitation Dispatch**: Trigger an automated welcome email via Resend containing secure password setup links to `dashboard.dayaberkah.id`.
4. **Access Verification**: Test client login in an isolated browser session to verify that the client can only access assigned project records.

---

## 3. Data Isolation & Security Mandates

- **Tenant Isolation**: Database queries on `dashboard.dayaberkah.id` MUST enforce explicit `where: { clientId: user.id }` constraints.
- **Index Exclusion**: Dashboard routes MUST serve `<meta name="robots" content="noindex, nofollow" />` headers to ensure zero public indexing.

---

## 4. OpenSpec Behavioral Requirements

### Requirement: REQ-OPS-ONBOARDING-001-TENANT-ISOLATION
The Client Portal SHALL strictly isolate project milestone data, ensuring authenticated clients access only their explicitly assigned project records.

#### Scenario: Client Portal Access Control
- GIVEN an authenticated B2B or B2G client user logged into `dashboard.dayaberkah.id`
- WHEN viewing project milestones or order histories
- THEN the system MUST filter database queries by the client's authenticated user ID and return `403 Forbidden` if unauthorized resource access is attempted.

---

## 5. OpenSpec Delta

## ADDED Requirements
- REQ-OPS-ONBOARDING-001-TENANT-ISOLATION: Tenant data isolation and client onboarding specification.

## MODIFIED Requirements
- Standardized client portal management for Ecosystem v4.0.0.

## REMOVED Requirements
- None.

---

## 6. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/operations/runbooks/client-onboarding-and-tracking.md`
- Graphify Community: `community_operations`
- Master Reference: [`release-process.md`](file:///d:/dev/arostech-hub/docs/operations/runbooks/release-process.md#L1-L60)
