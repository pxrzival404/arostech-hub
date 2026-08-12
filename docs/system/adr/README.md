---
id: ADR-INDEX-001
title: Architecture Decision Records Index
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_adr"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100"
  overview: "file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L1-L50"
---

# Architecture Decision Records Index

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Baseline Sync`  
> **Authoritative Baseline Reference**: Index of all architectural decision records governing the **DBSN Centralized Digital Ecosystem**, fully synchronized with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/adr/README.md`

---

## OpenSpec Delta

- `MODIFIED`: Updated decision log matrix to include Greenfield Subdomain Routing (ADR-0003), Universal RFQ Cart Schema (ADR-0004), and Auth.js v5 Client Tracking Portal Integration (ADR-0005).

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-ADR-INDEX-001 Architecture Decision Log Maintenance
All architectural decisions governing system topology, data schemas, routing, deployment, and security MUST be recorded in `docs/system/adr/`. Each record SHALL adhere to the 7-Pillars AI-Friendly Documentation Standard and maintain line-anchored `file:///` URIs.

#### Scenario: Architecture Governance Audit
- GIVEN a system architecture audit or onboarding task
- WHEN an engineer or AI agent reviews architectural decisions
- THEN all active decisions SHALL be discoverable via this index matrix with valid anchored links.

---

## 2. Architecture Decision Log Matrix

| ADR # | Title | Status | Date | Target Area | Link |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **ADR-0001** | Migrate Fully to Cloudflare Pages Infrastructure | Accepted | 2026-07-20 | Edge Deployment | [`0001`](file:///d:/dev/arostech-hub/docs/system/adr/0001-migrate-fully-to-cloudflare-pages.md#L1-L50) |
| **ADR-0002** | Explicit Cloudflare Pages Deploy Target in Monorepo Workspace | Accepted | 2026-07-21 | CI/CD & Scripts | [`0002`](file:///d:/dev/arostech-hub/docs/system/adr/0002-explicit-cloudflare-pages-deploy-command.md#L1-L50) |
| **ADR-0003** | Greenfield Hub-and-Spoke Subdomain Routing Architecture | Accepted | 2026-08-12 | Edge Routing & SEO | [`0003`](file:///d:/dev/arostech-hub/docs/system/adr/0003-greenfield-hub-and-spoke-subdomain-routing.md#L1-L50) |
| **ADR-0004** | Universal RFQ Cart Schema & Post-RFQ Lead Classification | Accepted | 2026-08-12 | Data Model & API | [`0004`](file:///d:/dev/arostech-hub/docs/system/adr/0004-universal-rfq-cart-schema-and-post-rfq-lead-classification.md#L1-L50) |
| **ADR-0005** | Auth.js v5 JWT Session Model & Client Tracking Portal Integration | Accepted | 2026-08-12 | Security & Auth | [`0005`](file:///d:/dev/arostech-hub/docs/system/adr/0005-authjs-v5-client-tracking-portal-integration.md#L1-L50) |

---

## 3. Templates & Authoring Rules

New architectural decisions MUST follow the standardized template defined in [`template.md`](file:///d:/dev/arostech-hub/docs/system/adr/template.md#L1-L50).
