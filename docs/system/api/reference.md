---
id: API-REF-001
title: DBSN Public API Reference Contracts
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_api"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L636-L797"
  db_schema: "file:///d:/dev/arostech-hub/docs/system/data-model/00-overview.md#L1-L150"
  routing_lifecycle: "file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L1-L98"
---

# Public API Reference Contracts

> **TL;DR**: Authoritative specification and architectural reference for Public API Reference Contracts within the DBSN platform (docs/system/api/reference.md).


> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Baseline Sync`  
> **Authoritative Baseline Reference**: This document defines canonical API contracts for all endpoints in the **DBSN Centralized Digital Ecosystem**, adhering strictly to PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L636-L797)).

---

## 1. Standard Response Envelope

All API endpoints MUST respond using the standardized envelope format `{success, data, error, meta}` without a top-level `version` field. The envelope structure SHALL remain uniform across success and error outcomes.

```typescript
export interface ApiErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[] | null;
}

export interface ApiPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
  pagination?: ApiPagination | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta | null;
}
```

---

## 2. Request for Quotation (RFQ) Engine (`/api/rfq`)

The `/api/rfq` endpoint SHALL handle incoming composite quote submissions from Hub (`dayaberkah.id`) and Spoke landing pages (`pju`, `solarcell`, `alatpetir`, `baterai`). Validated data MUST be persisted in Neon Postgres via Prisma ORM (`rfq_submissions` header + `rfq_line_items` child rows) and trigger parallel Resend email and Telegram alerts.

- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

### Declarative Zod Schema (`rfqSubmissionSchema`)

The request body MUST conform to the unified `rfqSubmissionSchema` consisting of composite sub-schemas (`contact`, `meta`, `items`). Route handlers MUST NOT accept legacy top-level `segment` discriminators or `z.discriminatedUnion` branches.

```typescript
import { z } from "zod";

export const contactInfoSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  companyName: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
});

export const rfqMetaSchema = z.object({
  sourceDomain: z.string(),
  sourcePagePath: z.string(),
  procurementType: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
});

export const rfqCartItemSchema = z.object({
  spokeSegment: z.enum(["pju", "solarcell", "alatpetir", "baterai"]),
  productCategory: z.string().min(2, "Kategori produk wajib diisi"),
  quantity: z.number().int().positive("Jumlah harus angka positif"),
  unitOfMeasure: z.string().min(1, "Satuan unit wajib diisi"),
  unitPriceEstimate: z.number().nonnegative().optional(),
  projectScope: z.string().min(10, "Rincian scope proyek minimal 10 karakter"),
  timeline: z.string().optional(),
  notes: z.string().optional(),
});

export const rfqSubmissionSchema = z.object({
  contact: contactInfoSchema,
  meta: rfqMetaSchema,
  items: z.array(rfqCartItemSchema).min(1, "Minimal 1 barang dalam keranjang RFQ"),
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type RfqMeta = z.infer<typeof rfqMetaSchema>;
export type RfqCartItem = z.infer<typeof rfqCartItemSchema>;
export type RfqSubmission = z.infer<typeof rfqSubmissionSchema>;
```

### Example Request Body

```json
{
  "contact": {
    "fullName": "Budi Santoso",
    "email": "budi@pemkot.go.id",
    "phone": "+6281234567890",
    "companyName": "Dinas PU Kota Bandung"
  },
  "meta": {
    "sourceDomain": "pju.dayaberkah.id",
    "sourcePagePath": "/products/street-light",
    "procurementType": "Tender Langsung",
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "pju-2026-q3"
  },
  "items": [
    {
      "spokeSegment": "pju",
      "productCategory": "PJU Solar Cell All-in-One",
      "quantity": 200,
      "unitOfMeasure": "unit",
      "unitPriceEstimate": 4500000,
      "projectScope": "Street lighting for Kota Bandung area, APBD 2026",
      "timeline": "2026-12-31",
      "notes": "Termasuk instalasi & tiang 7m"
    }
  ]
}
```

### Success Response (`201 Created`)

```json
{
  "success": true,
  "data": {
    "id": "rfq_clx123abc456",
    "submissionStatus": "received",
    "dashboardAccessStatus": "not_eligible",
    "itemCount": 1,
    "createdAt": "2026-08-12T04:20:00.000Z"
  },
  "error": null,
  "meta": {
    "timestamp": "2026-08-12T04:20:00.000Z",
    "requestId": "req_clx789ghi012",
    "pagination": null
  }
}
```

### Validation Error Response (`422 Unprocessable Entity`)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      { "field": "contact.email", "message": "Format email tidak valid", "code": "invalid_format" },
      { "field": "items", "message": "Minimal 1 barang dalam keranjang RFQ", "code": "too_small" }
    ]
  },
  "meta": {
    "timestamp": "2026-08-12T04:20:00.000Z",
    "requestId": "req_clx789ghi012",
    "pagination": null
  }
}
```

---

## 3. Authentication API Catch-All (`/api/auth/[...nextauth]`)

All authentication requests SHALL be managed by **Auth.js v5** via a single Next.js App Router catch-all route at `/api/auth/[...nextauth]`. Separate custom login endpoints MUST NOT be created.

### Auth Endpoint Mapping
- `GET/POST /api/auth/[...nextauth]` — Unified catch-all handler governing Google OAuth (for internal staff) and Credentials Provider (for provisioned clients).
- `GET/POST /api/auth/callback/google` — Google OAuth callback for `role: "admin"` and `role: "viewer"`.
- `POST /api/auth/callback/credentials` — Credentials provider callback for `role: "client"`.
- `GET /api/auth/session` — Session resolution returning the active JWT session payload.
- `POST /api/auth/signout` — Session invalidation endpoint.

### JWT Session Payload Structure (`trackingScopeIds` array)

Client sessions MUST return a `trackingScopeIds` array populated from `users.tracking_scope_ids` to enforce row-level ownership filtering on project tracking endpoints. Admin and Viewer roles SHALL return `trackingScopeIds: null`.

#### Admin / Viewer Auth Session Payload Example

```json
{
  "user": {
    "id": "usr_clx123abc456",
    "name": "Admin DBSN",
    "email": "admin@dayaberkah.id",
    "image": "https://lh3.googleusercontent.com/a/...",
    "role": "admin",
    "trackingScopeIds": null
  },
  "expires": "2026-09-07T04:20:00.000Z"
}
```

#### Client Auth Session Payload Example

```json
{
  "user": {
    "id": "usr_clx789ghi012",
    "name": "Budi Santoso",
    "email": "budi@pemkot.go.id",
    "image": null,
    "role": "client",
    "trackingScopeIds": ["proj_abc123", "proj_def456"]
  },
  "expires": "2026-09-07T04:20:00.000Z"
}
```

---

## 4. Behavioral Contracts

### Requirement: REQ-API-001-UNIVERSAL-RFQ
The `/api/rfq` endpoint MUST validate incoming JSON requests against `rfqSubmissionSchema` and return a standard `201 Created` envelope on success.

#### Scenario: Valid Universal RFQ Submission
- GIVEN a buyer submitting a multi-item cart request on `pju.dayaberkah.id`
- WHEN the client submits a `POST /api/rfq` payload containing valid `contact`, `meta`, and `items` fields
- THEN the route handler MUST validate the payload against `rfqSubmissionSchema`
- AND save the record into Neon Postgres tables `rfq_submissions` and `rfq_line_items`
- AND return an HTTP status `201 Created` with `success: true` and `error: null`.

#### Scenario: Invalid RFQ Payload Triggers 422 Unprocessable Entity
- GIVEN a client request with an invalid email format or empty cart items
- WHEN the request is received at `POST /api/rfq`
- THEN the route handler MUST reject the payload with an HTTP status `422 Unprocessable Entity`
- AND return a standard envelope with `success: false` and formatted Zod validation error details.

### Requirement: REQ-API-002-AUTH-SESSION-SCOPING
The `/api/auth/session` endpoint MUST emit a JWT session object containing `trackingScopeIds` for authorized client roles.

#### Scenario: Client Role Session Issued with Authorized Tracking Scope
- GIVEN an authenticated client user with active project permissions
- WHEN requesting `GET /api/auth/session`
- THEN the system MUST return a session object with `role: "client"`
- AND include the array of authorized project IDs in `user.trackingScopeIds`.

---

## 5. Sanity ISR Revalidation Webhook (`/api/revalidate`)

Triggered by Sanity.io webhooks upon content publication or modification to execute Incremental Static Regeneration via `revalidateTag()`.

- **HTTP Method**: `POST`
- **Headers Required**: `x-sanity-webhook-signature`

### Success Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "revalidated": true,
    "tags": ["sanity:product", "sanity:spoke:pju"]
  },
  "error": null,
  "meta": {
    "timestamp": "2026-08-12T07:45:02.000Z",
    "requestId": "req_8f9a2b1e",
    "pagination": null
  }
}
```

---

## 6. Graphify Anchoring & References

- Knowledge Graph Node ID: `doc:docs/system/api/reference.md`
- Graphify Community: `community_api`
- Authoritative PRD Reference: [`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L636-L797)
- Data Model Reference: [`data-model.md`](file:///d:/dev/arostech-hub/docs/system/data-model/00-overview.md#L1-L150)
- Execution Lifecycle Reference: [`execution-lifecycle.md`](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L1-L98)
