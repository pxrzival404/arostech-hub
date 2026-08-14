---
id: ARCH-MAP-DATA-001
title: System Data Layer & Schema Code Terrain Map
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_architecture"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L110-L170"
  data_model: "file:///d:/dev/arostech-hub/docs/system/data-model/00-overview.md#L1-L150"
---

# System Data Layer & Schema Code Terrain Map

> **TL;DR**: Authoritative specification and architectural reference for System Data Layer & Schema Code Terrain Map within the DBSN platform (docs/system/architecture/codemaps/data.md).


> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Cascade`  
> **Authoritative Baseline Reference**: This document defines the Sanity CMS integration, Prisma Neon Proxy data layer, database models, static data engines, and validation schemas for the **DBSN Centralized Digital Ecosystem**, fully synchronized with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L110-L170)) and the data model specification ([`data-model.md`](file:///d:/dev/arostech-hub/docs/system/data-model/00-overview.md#L1-L150)).

---

## ## OpenSpec Delta

- **ADDED**: Prisma 6 Neon Serverless Proxy adapter configuration (`@prisma/adapter-neon`), composite cart submission schemas (`rfqSubmissionSchema`), and Sanity GROQ query definitions with Stega visual editing.
- **REMOVED**: Legacy `RedirectMap` / `redirect_map` database table models, legacy B2B/B2G branching tables, and Redis cache layer dependencies.

---

## Section I: Sanity CMS Integration

### 1. Client Configuration (`src/lib/api/sanity/client.ts`)
```typescript
createClient({ 
  projectId, 
  dataset, 
  apiVersion: '2024-01-01', 
  useCdn: process.env.NODE_ENV === 'production', 
  perspective: 'published', 
  stega: { enabled: false, studioUrl: '/studio' } 
});
```
- **Cache Tags**: `sanity:product`, `sanity:certification`, `sanity:portfolio`, `sanity:spoke:*`, `sanity:page`, `sanity:all`.
- **Fetch Options**: `createFetchOptions(tags, revalidate = 3600) → { next: { revalidate, tags } }`.

### 2. GROQ Queries (`src/lib/api/sanity/queries.ts`)

| Function | GROQ Query Pattern | Associated Cache Tags |
| :--- | :--- | :--- |
| `getProductsBySpoke(subdomain)` | `*[_type=="product" && spoke.subdomain==$subdomain]` | `product`, `spoke` |
| `getProductBySlug(slug)` | `*[_type=="product" && slug.current==$slug][0]` | `product` |
| `getProductSlugsWithSpokes()` | `*[_type=="product"]{slug, subdomain}` | `product` |
| `getCertifications()` | `*[_type=="certification" && isIndexable==true]` | `certification` |
| `getCertificationBySlug(slug)` | `*[_type=="certification"...][0]` | `certification` |
| `getPortfolioEntries(spoke?)` | `*[_type=="portfolioEntry"]` | `portfolio` |
| `getSpokeConfig(subdomain)` | `*[_type=="spokeConfig" && subdomain==$subdomain][0]` | `spokeConfig`, `spoke` |

---

## Section II: Validation & Ingestion Schemas

### RFQ Composite Schema (`src/lib/schema/rfq-schemas.ts`)
The system MUST validate composite cart RFQ submissions using Zod:

```typescript
import { z } from 'zod';

export const rfqCartItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().min(1).max(100000),
  variant: z.string().optional(),
  itemNotes: z.string().max(1000).optional(),
});

export const rfqSubmissionSchema = z.object({
  contactName: z.string().min(2).max(255),
  contactEmail: z.string().email(),
  contactPhone: z.string().regex(/^\+62[0-9]{9,13}$/, 'Must be valid Indonesian phone (+62...)'),
  companyName: z.string().max(255).optional(),
  segment: z.enum(['B2B', 'B2G']),
  procurementType: z.string().optional(),
  projectScope: z.string().max(2000).optional(),
  timeline: z.string().optional(),
  items: z.array(rfqCartItemSchema).min(1).max(50),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export type RfqSubmissionInput = z.infer<typeof rfqSubmissionSchema>;
```

---

## Section III: Database Models & Prisma Schemas (Neon Postgres)

The transactional data layer SHALL execute via Prisma ORM connected to Neon Postgres:

### 1. `User` Model (`users` table)
- `id` (CUID, `@id`)
- `email` (String, `@unique`, VarChar 255)
- `name` (String, VarChar 255)
- `role` (Role Enum: `ADMIN`, `VIEWER`, `CLIENT`; default `ADMIN`)
- `linkedLeadId` (String, optional soft FK)
- `isActive` (Boolean, default `true`)

### 2. `Lead` Model (`leads` table)
- `id` (CUID, `@id`)
- `createdAt` (DateTime, default `now()`)
- `updatedAt` (DateTime, `@updatedAt`)
- `segment` (Segment Enum: `B2B`, `B2G`)
- `sourceDomain` (String, VarChar 255)
- `contactName` (String, VarChar 255)
- `contactEmail` (String, VarChar 255)
- `contactPhone` (String, VarChar 50)
- `companyName` (String, optional, VarChar 255)
- `submissionStatus` (SubmissionStatus Enum: `RECEIVED`, `CONTACTED`, `QUALIFIED`, `DISQUALIFIED`)

### 3. `RfqSubmission` & `RfqLineItem` Models
- **`RfqSubmission`**: Header table storing submitter details, segment, status, and tracking ID.
- **`RfqLineItem`**: Child table referencing `RfqSubmission` with `productId`, `productName`, `quantity`, and `itemNotes`.

### 4. Legacy Model Deprecation Status
- **`RedirectMap` (`redirect_map`)**: **PERMANENTLY REMOVED**. Replaced by Next.js 16 native SEO metadata (`sitemap.ts`, `robots.ts`).

---

## Section IV: OpenSpec Behavioral Contracts

### Requirement: REQ-MAP-DATA-001-DATA-FEDERATION
The system data layer SHALL fetch published content from Sanity CMS via GROQ, validate transactional writes using Zod, and persist composite cart records to Neon Postgres via Prisma Neon Proxy without Redis or legacy redirect tables.

#### Scenario: Composite RFQ Persistence
- GIVEN a validated `RfqSubmissionInput` payload
- WHEN Prisma creates the lead and submission records
- THEN it MUST write the submission header to `RfqSubmission` and all cart line items to `RfqLineItem`
- AND it SHALL execute within a single Prisma transaction block.

---

## Section V: Knowledge Graph Anchoring

- **Graphify Node**: `doc:docs/system/architecture/codemaps/data.md`
- **Community**: `community_architecture`
- **Authoritative Anchor**: [`data-model.md`](file:///d:/dev/arostech-hub/docs/system/data-model/00-overview.md#L1-L150)