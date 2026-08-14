---
id: SYS-DATA-00
title: "Data Model 00: Overview & Database Architecture"
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_data_model"
authoritative_references:
  prisma_schema: "file:///d:/dev/arostech-hub/prisma/schema.prisma#L1-L200"
  prd_data: "file:///d:/dev/arostech-hub/docs/strategy/prd/01-domain-rfq-cart-schema.md"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md"
---

# Data Model 00: Overview & Database Architecture

> **TL;DR**: Defines the database topology (Neon PostgreSQL via Prisma ORM), core data invariants, legacy schema supersession rules, and the deprecation policy.

---

## 1. Executive Summary & Core Invariants

The DBSN platform operates on a **Unified Greenfield Data Architecture**. All legacy branching schemas (`rfqB2BSchema`, `rfqB2GSchema`), legacy URL mapping tables (`redirect_map`), and Cloudflare Edge redirect lookups have been **permanently eliminated**.

### Key Invariants
1. **Universal Ingestion**: Single unified composite RFQ schema (`rfqSubmissionSchema`) without top-level `segment` discriminators or `z.discriminatedUnion` branches.
2. **Scoped Access Control**: Auth.js v5 session model enforcing row-level client project filtering via `trackingScopeIds`.
3. **No Redirect Engine Table Rot**: Native Next.js 16 SEO Metadata API (`sitemap.ts`, `robots.ts`, JSON-LD) replaces all legacy 301 redirect engine tables.

---

## 2. Datasource & Generator Configuration

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

---

## 3. Legacy Schema Supersession & Deprecation Policy

| Deprecated Asset | Asset Type | Status in Greenfield PRD v4.0.0 | Superseding Replacement | Architectural Rationale |
|---|---|---|---|---|
| `rfqB2BSchema` | Zod Schema / Type | **DEPRECATED & SUPERSEDED** | `rfqSubmissionSchema` | Replaced by composite multi-item cart validation without branch discriminators. |
| `rfqB2GSchema` | Zod Schema / Type | **DEPRECATED & SUPERSEDED** | `rfqSubmissionSchema` | Segment-specific rules folded into optional `procurementType` attribute in `rfqMetaSchema`. |
| `redirect_map` | Postgres Database Table | **DEPRECATED & PERMANENTLY REMOVED** | Next.js 16 Native Metadata API (`sitemap.ts`, `robots.ts`) | Edge redirect table rot eliminated; static SEO metadata replaces database table lookups. |

### Deprecation Enforcements:
1. **Zero Reference Rule**: Route handlers and UI components MUST NOT import or reference `rfqB2BSchema`, `rfqB2GSchema`, or `redirect_map`.
2. **Database Migration Safety**: Production migrations MUST execute drop statements for legacy redirect tables.

---

## 4. OpenSpec Behavioral Contracts

### Requirement: REQ-DATA-000-SCHEMA-PURITY
The database schema MUST NOT retain legacy redirect tables or unsegmented branching fields.

#### Scenario: Schema validation check
- GIVEN the Prisma schema file
- WHEN parsed by Prisma compiler
- THEN no models for `redirect_map` or legacy `segment` columns SHALL exist.
