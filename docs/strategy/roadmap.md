---
id: ROAD-DBSN-001
title: Greenfield Architecture Roadmap
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_roadmap"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L22-L35"
  overview: "file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L1-L60"
  testing_strategy: "file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/strategy.md#L1-L50"
---

# Greenfield Architecture Roadmap

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Cascade`  
> **Authoritative Baseline Reference**: This document tracks execution phases and status for the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L15-L120)).

---

## Executive Phase Alignment Summary

| Phase | Title | Status | Completion Target / Date | Key Milestones |
|---|---|---|---|---|
| **Phase 1** | Foundation & Core Architecture | **COMPLETE** | 2026-05-13 | Next.js 16 setup, pnpm workspace, Tailwind v4, Prisma ORM |
| **Phase 2** | Core Features & Universal RFQ | **COMPLETE** | 2026-06-03 | Subdomain middleware, Universal RFQ cart API, Sanity CMS |
| **Phase 3** | Infrastructure & Auth.js v5 | **COMPLETE** | 2026-06-04 | Cloudflare Pages deployment, Auth.js v5 client portal |
| **Phase 4** | Quality Gates & E2E Validation | **NOT STARTED** | Q3 2026 | PSI 90+ mobile optimization, 80%+ test coverage, E2E checks |

---

## 1. Phase 1: Foundation (COMPLETED)

### Status: ✅ COMPLETE

#### Objectives
Establish the monorepo foundation with Next.js 16, TypeScript 5.7+, Tailwind CSS v4, and Prisma ORM.

| Task | Status | Completed Date |
|------|--------|----------------|
| Initialize Next.js 16 App Router | ✅ | 2026-05-13 |
| Configure pnpm workspace | ✅ | 2026-05-13 |
| Configure Tailwind CSS v4 design tokens | ✅ | 2026-05-13 |
| Set up Prisma ORM & Neon Postgres driver | ✅ | 2026-05-13 |
| Set up Jest testing suite & 80% coverage threshold | ✅ | 2026-05-13 |

---

## 2. Phase 2: Core Features & Universal RFQ (COMPLETED)

### Status: ✅ COMPLETE

#### Objectives
Implement hub-and-spoke routing (`pju`, `solarcell`, `alatpetir`, `baterai`, `dashboard`), Universal RFQ cart schema (`rfqSubmissionSchema`), Sanity CMS queries, and notification fallbacks.

| Task | Status | Completed Date |
|------|--------|----------------|
| Subdomain Edge Middleware (`cleanHostname`, `isSpokeDomain`) | ✅ | 2026-05-22 |
| Universal RFQ Cart API (`POST /api/rfq`) | ✅ | 2026-06-03 |
| Sanity CMS Integration (`product`, `spokeConfig`, `portfolioEntry`) | ✅ | 2026-05-21 |
| Resend Email & Telegram Notification Pipeline | ✅ | 2026-06-03 |

---

## 3. Phase 3: Infrastructure & Auth.js v5 Portal (COMPLETED)

### Status: ✅ COMPLETE

#### Objectives
Deploy to Cloudflare Pages via `@cloudflare/next-on-pages` and implement Auth.js v5 client tracking portal at `dashboard.dayaberkah.id`.

| Task | Status | Completed Date |
|------|--------|----------------|
| Greenfield Cloudflare Pages Deployment | ✅ | 2026-06-04 |
| Client Tracking Portal at `dashboard.dayaberkah.id` (`dashboard/`) | ✅ | 2026-06-04 |
| Auth.js v5 Catch-All Route (`/api/auth/[...nextauth]`) | ✅ | 2026-06-04 |
| GA4 Event Telemetry Instrumentation | ✅ | 2026-06-04 |

---

## 4. Phase 4: Quality Gates & E2E Validation (NOT STARTED)

### Status: ⏸️ NOT STARTED

#### Objectives
Execute performance profiling for mobile PSI 90+, full test coverage enforcement (80%+), and security vulnerability scanning.

| Task | Status | Target Schedule |
|------|--------|-----------------|
| PSI 90+ Mobile Optimization & Asset Budget | ⏳ TODO | Phase 4 Kickoff |
| Security Policy & CVE Response Automation | ⏳ TODO | Phase 4 Midpoint |
| Playwright E2E Full Workflow Integration | ⏳ TODO | Phase 4 Midpoint |
| Production Release Sign-Off | ⏳ TODO | Phase 4 Gate |

---

## 5. Behavioral Contracts & Launch Gates

### Requirement: REQ-ROAD-001-PHASE-GATEWAY
Phase 4 SHALL NOT proceed to production deployment without passing all Quality Gate success criteria.

#### Scenario: Production Launch Gateway Check
- GIVEN Phase 4 execution active
- WHEN evaluating release readiness
- THEN mobile PSI MUST score >= 90, total test coverage MUST satisfy >= 80%, and zero critical security vulnerabilities SHALL exist.

### Requirement: REQ-ROAD-002-GREENFIELD-DEPLOYMENT
The system SHALL deploy exclusively to Cloudflare Pages edge hosting on `dayaberkah.id` and its registered product spoke subdomains without maintaining legacy redirect infrastructure.

#### Scenario: Greenfield Release Verification
- GIVEN a production build deployment artifact
- WHEN Cloudflare Pages edge build pipeline completes
- THEN the system MUST deliver `dayaberkah.id` and all product spoke subdomains (`pju`, `solarcell`, `alatpetir`, `baterai`, `dashboard`) directly from the edge runtime.

---

## 6. GRAPHIFY ANCHORING & REFERENCES

- Knowledge Graph Node ID: `doc:docs/strategy/roadmap.md`
- Graphify Community: `community_roadmap`
- System Architecture Overview: [`overview.md`](file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L1-L60)
- System PRD SSOT: [`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L120)