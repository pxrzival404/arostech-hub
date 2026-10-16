---
id: PRD-MOD-05
title: "PRD Module 05: Resolved Architectural Decisions Log"
version: 4.0.0
status: LOCKED_BASELINE
architecture: Hub-and-Spoke Greenfield
target_domain: dayaberkah.id
graphify_community: "community_prd"
authoritative_references:
  prd_overview: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md"
  data_model: "file:///d:/dev/arostech-hub/docs/system/data-model/01-rfq-cart-schema.md"
  adr_routing: "file:///d:/dev/arostech-hub/docs/system/adr/0003-greenfield-hub-and-spoke-subdomain-routing.md"
---

# PRD Module 05: Resolved Architectural Decisions Log

> **TL;DR**: Authoritative historical log of all key architectural and product decisions (OQ-1 through OQ-6, plus Greenfield SEO Strategy) locked for the PT Daya Berkah Sentosa Nusantara platform baseline.

---

## 1. Resolved Decisions Inventory

### Decision #1 (OQ-1) — Meta Envelope Shape
- **Decision**: Adopt `{ meta: { timestamp, requestId, pagination } }` without a top-level `version` field.
- **Rationale**: Flat route endpoints (`/api/rfq`) operate without URL versioning (`/api/v1/...`), rendering inline payload version strings redundant.

### Decision #2 (OQ-2) — Nested Payload Structure
- **Decision**: Structure payload as `{ contact: {...}, meta: {...}, items: [...] }`.
- **Rationale**: Direct 1:1 mapping to transactional tables (`rfq_submissions` header & `rfq_line_items` child rows).

### Decision #3 (OQ-3) — Client-Side UTM Attribution
- **Decision**: Capture UTM parameters (`utmSource`, `utmMedium`, etc.) in client `sessionStorage` on first landing and submit within `meta`.
- **Rationale**: Browser privacy policies frequently strip `Referer` headers; direct client capture guarantees attribution fidelity.

### Decision #4 (OQ-4) — Line-Item Scope & Timeline Placement
- **Decision**: Place `timeline` and `projectScope` at the line-item level in `rfqCartItemSchema`; make `unitOfMeasure` required and `unitPriceEstimate` optional.
- **Rationale**: Enables multi-spoke orders with distinct delivery timelines and removes friction for buyers without exact budgets.

### Decision #5 (OQ-5) — Header vs Child Columns
- **Decision**: Maintain `source_campaign_tag` and overall `notes` in `rfq_submissions` header table, while technical notes live in `rfq_line_items`.
- **Rationale**: Keeps business-level context distinct from technical product specs.

### Decision #6 (OQ-6) — Universal RFQ Architecture Transition (v3.5)
- **Decision**: Replace bifurcated `rfqB2BSchema` / `rfqB2GSchema` with a single unsegmented `rfqSubmissionSchema`. Remove `segment` column from the database.
- **Rationale**: Prevents form abandonment. B2B and B2G classification is handled downstream in Admin Dashboard views.

### Decision #7 — Greenfield Build Strategy — Native SEO Architecture (v3.6)
- **Decision**: Build purely greenfield without legacy 301 redirect mapping tables (`redirect_map`), edge lookup workers, or legacy routes.
- **Rationale**: Eliminates technical debt and latency. SEO is handled natively via Next.js 16 `Metadata` API, `sitemap.ts`, `robots.ts`, and Schema.org JSON-LD.

---

## 2. OpenSpec Behavioral Contracts

### Requirement: REQ-DEC-001-IMMUTABLE-BASELINE
Decisions recorded in this module SHALL serve as binding architectural constraints for all code implementation and future PRD iterations.

#### Scenario: Architectural compliance validation
- GIVEN a feature proposal or code modification
- WHEN evaluating against platform rules
- THEN the implementation MUST conform to all 7 locked decisions in this log.
