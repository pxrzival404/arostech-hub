---
id: PRD-MOD-03
title: "PRD Module 03: API Contracts, Response Envelopes & Error Policies"
version: 4.0.0
status: LOCKED_BASELINE
architecture: Hub-and-Spoke Greenfield
target_domain: dayaberkah.id
graphify_community: "community_prd"
authoritative_references:
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md"
  data_model_rfq: "file:///d:/dev/arostech-hub/docs/system/data-model/01-rfq-cart-schema.md"
---

# PRD Module 03: API Contracts, Response Envelopes & Error Policies

> **TL;DR**: Mandates the standard `{ success, data, error, meta }` response envelope for all REST API endpoints, specifies the `POST /api/rfq` request/response contract, and establishes integration error policies.

---

## 1. Standard Response Envelope

All API endpoints SHALL return responses matching the unified envelope specification:

### 1.1 Success Format (`200 OK` / `201 Created`)
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

### 1.2 Error Format (`4xx` / `5xx`)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "contact.email",
        "message": "Must be a valid email address",
        "code": "invalid_format"
      }
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

## 2. RFQ Submission Endpoint (`POST /api/rfq`)

Inbound RFQ requests MUST submit a composite cart conforming to `rfqSubmissionSchema`:

```typescript
const rfqSubmissionSchema = z.object({
  contact: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    companyName: z.string().min(2),
  }),
  meta: z.object({
    sourceDomain: z.string(),
    sourcePagePath: z.string(),
    procurementType: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmTerm: z.string().optional(),
    utmContent: z.string().optional(),
  }),
  items: z.array(z.object({
    spokeSegment: z.enum(["pju", "solarcell", "alatpetir", "baterai"]),
    productCategory: z.string(),
    quantity: z.number().int().positive(),
    unitOfMeasure: z.string().min(1),
    unitPriceEstimate: z.number().optional(),
    projectScope: z.string().min(10),
    timeline: z.string().optional(),
    notes: z.string().optional(),
  })).min(1),
});
```

---

## 3. Integration Error Contracts

- **Resend (Email)**: 3 retries with exponential backoff (1s, 2s, 4s). Persistent errors trigger a Telegram sales alert.
- **Telegram Bot**: 429 backoff 60s; 5xx retry up to 2 times; alert logged to error monitoring.
- **Sanity CMS**: Timeout > 10s serves stale cached content with visual freshness badge.
- **Neon Postgres**: Connection errors trigger the pre-filled WhatsApp fallback UI to prevent lead loss.

---

## 4. OpenSpec Behavioral Contracts

### Requirement: REQ-API-001-STRICT-ENVELOPE
Every API endpoint MUST return a JSON payload with `success`, `data`, `error`, and `meta` fields.

#### Scenario: Validation failure on RFQ submission
- GIVEN a client submitting an invalid email to `POST /api/rfq`
- WHEN the server processes the request
- THEN it MUST respond with HTTP 422 Unprocessable Entity
- AND the JSON envelope MUST have `success: false`, `data: null`, and descriptive `error.details`.
