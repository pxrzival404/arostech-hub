---
id: ADR-0004
title: "ADR-0004: Universal RFQ Cart Schema and Post-RFQ Lead Classification Architecture"
version: 4.0.0
status: ACCEPTED
target_domain: dayaberkah.id
graphify_community: "community_adr"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L29-L35"
  data_model: "file:///d:/dev/arostech-hub/docs/system/data-model.md#L35-L80"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md#L60-L120"
---

# ADR-0004: Universal RFQ Cart Schema and Post-RFQ Lead Classification Architecture

> **OpenSpec SDD Lifecycle Mapping**: `ADDED: 2026-08-12 PRD v3.5 & v4.0.0 Universal RFQ Transition`  
> **Authoritative Baseline Reference**: Architectural Decision Record formalizing the unified, single-schema RFQ submission model (`rfqSubmissionSchema`) and post-submission lead classification pipeline, synchronized with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L29-L35)) and system data model ([`data-model.md`](file:///d:/dev/arostech-hub/docs/system/data-model.md#L35-L80)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/adr/0004-universal-rfq-cart-schema-and-post-rfq-lead-classification.md`

---

## OpenSpec Delta

- `ADDED`: Established single composite `rfqSubmissionSchema` for all quote inquiries submitted across Hub (`dayaberkah.id`) and product spoke subdomains.
- `REMOVED`: Eliminated legacy branching schemas (`rfqB2BSchema`, `rfqB2GSchema`), user-facing form segregation, top-level `segment` discriminators, and `z.discriminatedUnion` payload validation logic.

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-ADR-0004 Universal RFQ Payload Ingestion
All Request for Quote (RFQ) inquiries MUST be ingested through a single API contract (`rfqSubmissionSchema`) without top-level segment branching or user-facing form discrimination. The API handler SHALL validate contact details, metadata context, and shopping cart item arrays in a single atomic transaction.

#### Scenario: Unified Quote Submission Flow
- GIVEN a user submitting quote items from `pju.dayaberkah.id` or `solarcell.dayaberkah.id`
- WHEN the client POSTs to `/api/rfq/submit`
- THEN the system MUST validate the payload using `rfqSubmissionSchema`
- AND the handler SHALL persist the inquiry into Neon Postgres table `rfq_submissions`
- AND internal notification adapters (Resend email, Telegram Bot) MUST receive the normalized quote data.

#### Scenario: Post-Submission Lead Classification
- GIVEN a successfully stored RFQ submission in Neon Postgres
- WHEN the post-ingestion classifier worker inspects `companyName` and item details
- THEN the system SHALL categorize the lead (e.g. enterprise, government, commercial) asynchronously in background processing without delaying HTTP 200 response to user.

---

## 2. Context & Problem Statement

Earlier system designs split quote submissions into separate user-facing form paths (such as distinct B2B corporate forms versus B2G government procurement forms) enforced by `z.discriminatedUnion` schemas. This design created friction for prospective clients, forced duplicate form components across product spokes, and complicated cart state management. PRD v3.5 and v4.0.0 established that user-facing form splits MUST be replaced with a single, frictionless composite RFQ cart model.

---

## 3. Decision & Declarative Data Schemas

We SHALL ingest all quote inquiries through a single unified composite schema (`rfqSubmissionSchema`). Client-side forms MUST require `companyName` (`min(2)`). Classification of lead types (B2B vs B2G vs Commercial) SHALL occur post-submission in background processing.

### Declarative Zod RFQ Submission Schema

```typescript
import { z } from "zod";

export const ContactInfoSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  companyName: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
});

export const RfqMetaSchema = z.object({
  sourceDomain: z.string(),
  sourcePagePath: z.string(),
  procurementType: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
});

export const RfqCartItemSchema = z.object({
  spokeSegment: z.enum(["pju", "solarcell", "alatpetir", "baterai"]),
  productCategory: z.string().min(2, "Kategori produk wajib diisi"),
  quantity: z.number().int().positive("Jumlah harus angka positif"),
  unitOfMeasure: z.string().min(1, "Satuan unit wajib diisi"),
  unitPriceEstimate: z.number().nonnegative().optional(),
  projectScope: z.string().min(10, "Rincian scope proyek minimal 10 karakter"),
  timeline: z.string().optional(),
  notes: z.string().optional(),
});

export const RfqSubmissionSchema = z.object({
  contact: ContactInfoSchema,
  meta: RfqMetaSchema,
  items: z.array(RfqCartItemSchema).min(1, "Minimal 1 barang dalam keranjang RFQ"),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type RfqMeta = z.infer<typeof RfqMetaSchema>;
export type RfqCartItem = z.infer<typeof RfqCartItemSchema>;
export type RfqSubmission = z.infer<typeof RfqSubmissionSchema>;
```

---

## 4. Alternatives Considered

### Alternative 1: Discriminated Union Form Segregation (`z.discriminatedUnion`)
- **Pros**: Strict type enforcement of form-specific fields upfront.
- **Cons**: High user drop-off rate, duplicated UI component code, complex cart state logic across spoke subdomains.
- **Why not**: Discriminating forms on the frontend creates unnecessary friction for buyers submitting multi-product RFQs.

### Alternative 2: Separate Form Endpoints per Product Spoke
- **Pros**: Isolated endpoints per spoke.
- **Cons**: Fragmented notification pipelines, inconsistent database storage, impossible multi-spoke cross-cart submissions.
- **Why not**: Prevents users from requesting combined quotes across multiple product categories (e.g. PJU solar cell + battery systems).

---

## 5. Consequences & Risk Mitigation

### Positive
- Single unified API endpoint (`POST /api/rfq/submit`) handles all quote submissions across all subdomains.
- Enables multi-spoke cart aggregation (users can combine PJU, solarcell, and battery items into one quote).
- Eliminates frontend schema branching and simplifies cart state management.

### Negative & Mitigations
- Lead classification logic must run asynchronously in background pipelines.
- **Mitigation**: Post-submission lead tagger runs during Telegram/Resend notification dispatch without blocking HTTP user responses.
