---
id: ARCH-MAP-BACKEND-001
title: System Backend Architecture & Code Terrain Map
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_architecture"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L110-L170"
  data_model: "file:///d:/dev/arostech-hub/docs/system/data-model.md#L1-L150"
---

# System Backend Architecture & Code Terrain Map

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Cascade`  
> **Authoritative Baseline Reference**: This document defines the backend serverless architecture, route handlers, middleware pipeline, authentication layer, and notification services for the **DBSN Centralized Digital Ecosystem**, fully synchronized with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L110-L170)) and the data model specification ([`data-model.md`](file:///d:/dev/arostech-hub/docs/system/data-model.md#L1-L150)).

---

## ## OpenSpec Delta

- **ADDED**: Next.js 16 App Router Route Handlers, composite cart RFQ ingestion (`/api/rfq`), Auth.js v5 JWT handlers (`/api/auth/[...nextauth]`), Sanity ISR revalidation (`/api/revalidate`), and 21st SDK agent chat integration (`/api/an-token`).
- **REMOVED**: Legacy 301 redirect handlers (`/api/admin/redirects`, `/api/redirects/lookup`), legacy Supabase auth handlers, and Redis queue processors.

---

## Section I: API Route Landscape

The system backend operates strictly via Next.js 16 Serverless Route Handlers executing on Cloudflare Pages or Node.js runtime bindings:

```
POST/GET  /api/revalidate          → route.ts → verify webhook secret → revalidateTag()
POST      /api/rfq                 → route.ts → parse & validate rfqSubmissionSchema → prisma.rfqSubmission.create → fire-and-forget notifications
GET       /api/rfq                 → route.ts → JSON healthcheck response
GET/POST  /api/auth/[...nextauth]  → route.ts → handlers mapping to Auth.js v5
POST      /api/auth/forgot-password → route.ts → password reset request initiation
POST      /api/auth/reset-password  → route.ts → password reset completion
POST      /api/an-token             → route.ts → 21st SDK agent chat token handler
POST      /api/cron/notifications   → route.ts → notification queue processor (cron endpoint)
```

| File Path | Purpose | Key Integrations |
| :--- | :--- | :--- |
| `src/app/api/revalidate/route.ts` | Sanity CMS webhook ISR revalidation | `revalidateTag()`, `SANITY_WEBHOOK_SECRET` |
| `src/app/api/revalidate/__tests__/route.test.ts` | Webhook security & revalidation tests | Jest unit & mock handlers |
| `src/app/api/rfq/route.ts` | RFQ composite cart submission ingestion & healthcheck | Prisma Neon Proxy, Zod validation |
| `src/app/api/rfq/__tests__/route.test.ts` | Ingestion, cart schema validation & fallback tests | Jest integration tests |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js v5 route handlers wrapper | `handlers.GET`, `handlers.POST` |

---

## Section II: Middleware Pipeline Architecture

The Edge Middleware MUST process all incoming hostnames before page rendering:

```
Request → src/middleware.ts (Edge Runtime)
  │
  ├─ Short-circuit: /api/*, /_next/*, /*.ext  → NextResponse.next()
  │
  ├─ cleanHostname(host)   → strips port number
  ├─ extractSubdomain(host)→ extracts spoke or dashboard prefix
  │
  ├─ isHubDomain()         → pass-through with x-middleware-subdomain: 'hub'
  ├─ isDashboardDomain()   → session check (Auth.js cookie) 
  │                          ├── authenticated   → rewrite: /dashboard{pathname}
  │                          └── unauthenticated → redirect: /dashboard/login
  ├─ isSpokeDomain(spoke)  → rewrite: /${spoke}${pathname}
  └─ unknown               → return new NextResponse(null, { status: 404 })
```

---

## Section III: Authentication & Authorization Layer (Auth.js v5)

### Session & Guard Mechanics (`src/lib/auth/auth.config.ts`)
- **Strategy**: JWT-based session token storage with dynamic role-based expiry.
- **Providers**: Credentials Provider with database user verification via Prisma Neon Proxy adapter.
- **Role-Based Token Expiry**:
  - `CLIENT` role: 24 hours.
  - `ADMIN` & `VIEWER` roles: 8 hours.
- **Server Guards** (`src/lib/auth/auth-guard.ts`):
  - `getServerSession()`: Retrieves current authenticated Auth.js session.
  - `requireAuth(requiredRole?)`: Guard redirecting unauthenticated or unauthorized requests to `/dashboard/login`.
  - `requireDashboardAccess()`: Enforces explicit client dashboard access checks (`dashboardAccessStatus === 'GRANTED'`).

---

## Section IV: Notification Services Layer

### 1. Resend Email (`src/lib/api/notifications/resend.ts`)
- `sendRfqAcknowledgment(submission)`: Dispatches customer ACK email containing product line items, total quantity, and tracking reference.
- `sendInternalNotification(submission)`: Routes internal lead alert with full quotation context to the sales team.

### 2. Telegram Bot Alerts (`src/lib/api/notifications/telegram.ts`)
- `alertNewRfq(submission)`: Non-blocking alert pushing RFQ payload details to the Telegram ops channel.
- `alertRfqFailure(error, payload)`: Pushes dev alerts on ingestion failures.

### 3. WhatsApp Fallback Link Builder (`src/lib/api/notifications/whatsapp.ts`)
- `buildWhatsAppFallbackUrl(formData)`: Encodes cart submission items into a pre-filled `wa.me` URL for manual customer submission upon API failure.

---

## Section V: Declarative Backend Interfaces

```typescript
import { z } from 'zod';

export const ApiHealthCheckResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'error']),
  timestamp: z.string().datetime(),
  environment: z.string(),
  services: z.object({
    database: z.boolean(),
    sanity: z.boolean(),
  }),
});

export type ApiHealthCheckResponse = z.infer<typeof ApiHealthCheckResponseSchema>;
```

---

## Section VI: OpenSpec Behavioral Contracts

### Requirement: REQ-MAP-BACKEND-001-ROUTE-HANDLERS
The backend route handlers SHALL validate incoming requests using Zod schemas, write composite cart data via Prisma Neon Proxy, and execute non-blocking notification alerts without relying on legacy redirect engines or Redis queues.

#### Scenario: RFQ Ingestion Success
- GIVEN a valid composite cart payload sent to `POST /api/rfq`
- WHEN the route handler parses and validates the request against `rfqSubmissionSchema`
- THEN it SHALL persist the submission header and line items to Neon Postgres via Prisma
- AND it MUST trigger fire-and-forget email and Telegram notifications
- AND it SHALL return HTTP 201 Created with the generated tracking ID.

---

## Section VII: Knowledge Graph Anchoring

- **Graphify Node**: `doc:docs/system/architecture/codemaps/backend.md`
- **Community**: `community_architecture`
- **Authoritative Anchor**: [`data-model.md`](file:///d:/dev/arostech-hub/docs/system/data-model.md#L1-L150)