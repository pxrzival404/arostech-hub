---
id: DOC-OPS-RUN-INCIDENT-5STEP
title: Operational 5-Step Incident Response Protocol Runbook
version: 4.0.0
status: LOCKED_BASELINE
graphify_community: "community_operations"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100"
  release_runbook: "file:///d:/dev/arostech-hub/docs/operations/runbooks/release-process.md#L1-L60"
---

# Operational 5-Step Incident Response Protocol Runbook

> **Authoritative Baseline Reference**: Operational triage, containment, remediation, recovery, and post-mortem procedures for production outages or degradation on the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100)).

---

## 1. Incident Severity Definitions

Operational incidents SHALL be categorized by severity level:

```typescript
// Declarative Incident Severity Contract Interface
export interface IncidentPayload {
  readonly incidentId: string;
  readonly severity: 'SEV-1' | 'SEV-2' | 'SEV-3';
  readonly affectedSubdomains: readonly string[];
  readonly startedAt: string;
}
```

| Severity | Definition | Target SLA |
| :--- | :--- | :--- |
| **SEV-1 (Critical)** | Core website or RFQ pipeline completely unreachable across subdomains | Response < 15m, Resolution < 2h |
| **SEV-2 (High)** | Single product spoke degraded or CMS sync webhook failing | Response < 30m, Resolution < 4h |
| **SEV-3 (Low)** | Minor UI layout glitch or non-critical documentation typo | Response < 4h, Resolution < 24h |

---

## 2. The 5-Step Incident Response Protocol

```
┌────────────────────────────────────────────────────────┐
│              OPERATIONAL 5-STEP INCIDENT PROTOCOL       │
├────────────────────────────────────────────────────────┤
│  1. DETECT & TRIAGE    ➔ Identify scope & declare SEV   │
│  2. CONTAINMENT        ➔ Isolate failure boundary       │
│  3. REMEDIATION        ➔ Roll back or apply emergency fix│
│  4. RECOVERY & VERIFY  ➔ Test end-to-end functionality  │
│  5. POST-MORTEM        ➔ Document root cause & prevention│
└────────────────────────────────────────────────────────┘
```

### Step 1: Detect & Triage
1. Identify failing endpoint via Cloudflare Analytics or Sentry error alerts.
2. Determine affected subdomains (`dayaberkah.id`, `pju`, `solarcell`, `alatpetir`, `baterai`, `dashboard`).
3. Declare severity level and notify technical leads via Telegram operations channel.

### Step 2: Containment
1. If Cloudflare Edge deployment is corrupted, roll back to prior verified deployment ID via Wrangler CLI (`wrangler pages deployment list`).
2. If Sanity CMS webhook is causing loops, temporarily pause webhook triggers in Sanity Studio API settings.

### Step 3: Remediation
1. Reproduce error locally: `pnpm pages:preview`.
2. Implement targeted minimal fix following TDD cycle (RED → GREEN → REFACTOR).
3. Verify fix locally using `pnpm test` and `pnpm pages:build`.

### Step 4: Recovery & Verification
1. Promote hotfix to production branch `main`.
2. Confirm Cloudflare Pages deployment succeeds.
3. Perform live smoke test against affected endpoints.

### Step 5: Post-Mortem & Prevention
1. Document root cause analysis (RCA), timeline, and resolution steps in `docs/operations/audits/`.
2. Add regression unit/integration test coverage to prevent recurrence.

---

## 3. OpenSpec Behavioral Requirements

### Requirement: REQ-OPS-INCIDENT-001-PROTOCOL
The operations team SHALL execute the 5-step incident response protocol for all SEV-1 and SEV-2 production incidents.

#### Scenario: SEV-1 Outage Escalation
- GIVEN a production outage on `dayaberkah.id`
- WHEN SEV-1 status is declared
- THEN operators MUST execute containment within 15 minutes and publish a post-mortem report within 24 hours of resolution.

---

## 4. OpenSpec Delta

## ADDED Requirements
- REQ-OPS-INCIDENT-001-PROTOCOL: Standardized 5-step incident response protocol requirement.

## MODIFIED Requirements
- Standardized incident escalation paths for Ecosystem v4.0.0.

## REMOVED Requirements
- None.

---

## 5. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/operations/runbooks/incident-response-5-step.md`
- Graphify Community: `community_operations`
- Master Reference: [`release-process.md`](file:///d:/dev/arostech-hub/docs/operations/runbooks/release-process.md#L1-L60)
