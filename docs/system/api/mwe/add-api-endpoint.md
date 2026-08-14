---
id: API-MWE-ENDPOINT-001
title: "Minimal Working Example: Adding a Secure Edge API Endpoint"
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_api"
authoritative_references:
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md#L21-L57"
  data_model: "file:///d:/dev/arostech-hub/docs/system/data-model/00-overview.md#L32-L80"
  config_schema: "file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md#L45-L75"
---

# Minimal Working Example: Adding a Secure Edge API Endpoint

> **TL;DR**: Authoritative specification and architectural reference for Minimal Working Example: Adding a Secure Edge API Endpoint within the DBSN platform (docs/system/api/mwe/add-api-endpoint.md).


> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Baseline Sync`  
> **Authoritative Baseline Reference**: This guide demonstrates how to create a production-ready, type-safe, and secure API endpoint in the Next.js App Router under `src/app/api/`, adhering to PRD v4.0.0 standards ([`reference.md`](file:///d:/dev/arostech-hub/docs/system/api/reference.md#L21-L57)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/api/mwe/add-api-endpoint.md`

---

## OpenSpec Delta

- `MODIFIED`: Standardized API endpoint MWE to use standard response envelope `{success, data, error, meta}` without top-level `version` field.
- `ADDED`: Enforced Edge runtime compatibility requirement (`export const runtime = "edge"`).

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-MWE-API-001 Secure Edge API Route Handler Execution
All API endpoints inside `src/app/api/` MUST execute on the Cloudflare Pages Edge runtime (`export const runtime = "edge"`). Endpoints SHALL validate request payloads using Zod schemas and respond with the standardized API response envelope (`ApiResponse<T>`).

#### Scenario: Valid Request Execution
- GIVEN a valid HTTP POST request containing JSON payload matching `SampleEndpointRequestSchema`
- WHEN the Route Handler executes on the Edge runtime
- THEN the system SHALL validate the payload with Zod
- AND the handler MUST return HTTP 200 with `{ success: true, data: T, error: null, meta: ApiMeta }`.

#### Scenario: Invalid Payload Rejection
- GIVEN an incoming request with missing or malformed fields
- WHEN Zod validation fails
- THEN the handler MUST catch the `z.ZodError`
- AND the system SHALL return HTTP 400 with `{ success: false, data: null, error: { code: "VALIDATION_ERROR", message: "...", details: [...] }, meta: ApiMeta }`.

---

## 2. Declarative Route Handler Schemas

Route Handlers MUST declare input and response schemas adhering to system contracts ([`reference.md`](file:///d:/dev/arostech-hub/docs/system/api/reference.md#L21-L57)):

```typescript
import { z } from "zod";

export const SampleEndpointRequestSchema = z.object({
  contactEmail: z.string().email("Email format must be valid"),
  inquiryCategory: z.enum(["general", "technical", "procurement"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type SampleEndpointRequest = z.infer<typeof SampleEndpointRequestSchema>;
```

---

## 3. Step-by-Step Route Handler Implementation

### Step 1: Create Edge Route Handler File
Create file `src/app/api/example/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { SampleEndpointRequestSchema } from "./schema";

export const runtime = "edge";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  try {
    const rawBody = await request.json();
    const validatedData = SampleEndpointRequestSchema.parse(rawBody);

    // Business Logic Execution
    const responsePayload = {
      processed: true,
      email: validatedData.contactEmail,
      category: validatedData.inquiryCategory,
    };

    return NextResponse.json(
      {
        success: true,
        data: responsePayload,
        error: null,
        meta: { timestamp, requestId },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request payload format",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          meta: { timestamp, requestId },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during request processing",
          details: null,
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
}
```

### Step 2: Testing Endpoint via Local HTTP Client
Developers MUST test route handlers using `curl` or automated integration tests:

```bash
curl -X POST http://lvh.me:3000/api/example \
  -H "Content-Type: application/json" \
  -d '{"contactEmail":"procurement@dayaberkah.id","inquiryCategory":"technical","message":"Inquiry regarding solar panel specifications"}'
```

---

## 4. Security & Edge Runtime Rules

1. **Edge Runtime Enforcement**: Every API route handler MUST include `export const runtime = "edge";`.
2. **Input Sanitization**: Request bodies MUST be parsed using Zod schemas before executing database or third-party service calls.
3. **No Internal Leakage**: Internal error details and database stack traces MUST NOT be exposed to clients in response envelopes.
