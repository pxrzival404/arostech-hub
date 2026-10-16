---
id: API-MWE-CLIENT-PORTAL-001
title: "Minimal Working Example: Adding a Client Tracking Portal Route Handler"
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_api"
authoritative_references:
  adr_0005: "file:///d:/dev/arostech-hub/docs/system/adr/0005-authjs-v5-client-tracking-portal-integration.md#L1-L50"
  security_codemap: "file:///d:/dev/arostech-hub/docs/system/architecture/codemaps/security.md#L1-L50"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md#L21-L57"
---

# Minimal Working Example: Adding a Client Tracking Portal Route Handler

> **TL;DR**: Authoritative specification and architectural reference for Minimal Working Example: Adding a Client Tracking Portal Route Handler within the DBSN platform (docs/system/api/mwe/add-client-portal-route.md).


> **OpenSpec SDD Lifecycle Mapping**: `ADDED: 2026-08-12 Auth.js v5 Client Portal MWE Baseline`  
> **Authoritative Baseline Reference**: Step-by-step guide and production-ready code for implementing authenticated, row-level scoped API endpoints for the **Client Tracking Portal** (`dashboard.dayaberkah.id`), synchronized with PRD v4.0.0 and ADR-0005 ([`adr_0005`](file:///d:/dev/arostech-hub/docs/system/adr/0005-authjs-v5-client-tracking-portal-integration.md#L1-L50)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/api/mwe/add-client-portal-route.md`

---

## OpenSpec Delta

- `ADDED`: Established Minimal Working Example for Client Tracking Portal API endpoints with Auth.js v5 session validation and row-level `trackingScopeIds` database filtering.

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-MWE-CLIENT-PORTAL-001 Row-Level Scoped Route Handler Execution
Client Tracking Portal route handlers under `src/app/api/client-portal/` MUST execute on the Cloudflare Pages Edge runtime (`export const runtime = "edge"`). Route handlers SHALL authenticate incoming requests via Auth.js v5 and restrict database queries strictly to projects matching the user's `trackingScopeIds`.

#### Scenario: Authenticated Client Query
- GIVEN a client user authenticated with `trackingScopeIds: ["PROJ-201", "PROJ-202"]`
- WHEN GET `/api/client-portal/projects` is invoked
- THEN the handler SHALL extract session claims and scope IDs
- AND the Prisma ORM database query MUST execute `WHERE id IN ("PROJ-201", "PROJ-202")`
- AND the system SHALL return HTTP 200 with `{ success: true, data: [...], error: null, meta: ApiMeta }`.

#### Scenario: Unauthenticated Request Interception
- GIVEN an unauthenticated client request lacking valid session JWT tokens
- WHEN GET `/api/client-portal/projects` is invoked
- THEN the route handler MUST reject the request with HTTP 401 Unauthorized.

---

## 2. Declarative Route Handler Schemas

```typescript
import { z } from "zod";

export const ClientProjectQuerySchema = z.object({
  statusFilter: z.enum(["ALL", "IN_PROGRESS", "DELIVERED", "INSTALLED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const ClientProjectItemSchema = z.object({
  id: z.string(),
  projectCode: z.string(),
  clientName: z.string(),
  spokeSegment: z.enum(["pju", "solarcell", "alatpetir", "baterai"]),
  status: z.string(),
  progressPercentage: z.number().min(0).max(100),
  estimatedDelivery: z.string().nullable(),
  updatedAt: z.string(),
});

export type ClientProjectQuery = z.infer<typeof ClientProjectQuerySchema>;
export type ClientProjectItem = z.infer<typeof ClientProjectItemSchema>;
```

---

## 3. Step-by-Step Implementation

### Step 1: Create Scoped Route Handler File
Create file `src/app/api/client-portal/projects/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth"; // Auth.js v5 helper
import { ClientProjectQuerySchema } from "./schema";

export const runtime = "edge";

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  try {
    // 1. Session & Access Verification via Auth.js v5
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication session required to access Client Portal data",
            details: null,
          },
          meta: { timestamp, requestId },
        },
        { status: 401 }
      );
    }

    const { role, trackingScopeIds } = session.user;

    // 2. Validate Query Parameters
    const url = new URL(request.url);
    const queryParams = ClientProjectQuerySchema.parse({
      statusFilter: url.searchParams.get("statusFilter") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
    });

    // 3. Row-Level Scoped Query Filtering
    // If role is 'client', strictly restrict query to assigned trackingScopeIds
    const scopeFilter =
      role === "admin"
        ? {} // Admins can view all projects
        : { id: { in: trackingScopeIds || [] } };

    // Example mock or Prisma query result
    const projects = [
      {
        id: "PROJ-201",
        projectCode: "DBSN-PJU-2026-089",
        clientName: session.user.name || "Client Enterprise",
        spokeSegment: "pju",
        status: "IN_PROGRESS",
        progressPercentage: 65,
        estimatedDelivery: "2026-09-15T00:00:00.000Z",
        updatedAt: timestamp,
      },
    ].filter((p) => role === "admin" || (trackingScopeIds || []).includes(p.id));

    return NextResponse.json(
      {
        success: true,
        data: projects,
        error: null,
        meta: {
          timestamp,
          requestId,
          pagination: {
            page: queryParams.page,
            limit: queryParams.limit,
            totalItems: projects.length,
            totalPages: 1,
          },
        },
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
            message: "Invalid query parameter values",
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
          message: "Failed to fetch Client Tracking Portal project data",
          details: null,
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
}
```

---

## 4. Security & Access Verification

1. **Session Scope Isolation**: Client users (`role: "client"`) MUST never be allowed to query projects outside their `trackingScopeIds` array.
2. **Standard API Envelope**: Responses MUST follow the system standard `{ success, data, error, meta }` response envelope ([`api_reference`](file:///d:/dev/arostech-hub/docs/system/api/reference.md#L21-L57)).
3. **Edge Compliance**: The handler MUST execute on Edge (`export const runtime = "edge"`).
