---
id: API-EXT-001
title: API & Adapter Extensibility Architecture
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_api"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L110-L170"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md#L1-L100"
  data_model: "file:///d:/dev/arostech-hub/docs/system/data-model.md#L1-L150"
---

# API & Adapter Extensibility Architecture

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Baseline Sync`  
> **Authoritative Baseline Reference**: This document defines the extension patterns for adding product spokes, custom API route handlers, and external integration webhooks within the **DBSN Centralized Digital Ecosystem**, conforming to PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L110-L170)).

---

## 1. Hub-and-Spoke Extension Pattern

The DBSN platform SHALL organize application routes using Next.js App Router route groups for product spokes alongside flat routes for authenticated portals:

```
src/app/
├── (hub)/                  # Corporate hub (dayaberkah.id)
├── (spokes)/               # Product spokes
│   ├── pju/                # pju.dayaberkah.id
│   ├── solarcell/          # solarcell.dayaberkah.id
│   ├── alatpetir/          # alatpetir.dayaberkah.id
│   └── baterai/            # baterai.dayaberkah.id
├── dashboard/              # Flat route: Client portal (dashboard.dayaberkah.id)
└── api/                    # API route handlers
```

### Protocol for Adding a New Spoke
When onboarding a new product vertical spoke:
1. Developers SHALL create a new route group under `src/app/(spokes)/<spoke-name>/`.
2. Middleware MUST be updated to include the new subdomain mapping in `src/proxy.ts`.
3. Spoke metadata and features MUST be validated using `spokeConfigSchema`.

### Declarative Spoke Configuration Zod Schema (`spokeConfigSchema`)

```typescript
import { z } from "zod";

export const spokeConfigSchema = z.object({
  spokeSlug: z.enum(["pju", "solarcell", "alatpetir", "baterai"]).or(z.string()),
  subdomain: z.string().min(1, "Subdomain name is required"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  activeFeatures: z.array(z.string()),
  primaryCategory: z.string(),
  whatsappFallbackNumber: z.string().min(10, "WhatsApp phone number must be at least 10 digits"),
  metaTitleTemplate: z.string(),
  metaDescription: z.string(),
});

export type SpokeConfig = z.infer<typeof spokeConfigSchema>;
```

---

## 2. API Route Handler & Webhook Extension Patterns

All API endpoints MUST adhere to the standardized response envelope format defined in [`reference.md`](file:///d:/dev/arostech-hub/docs/system/api/reference.md#L20-L45):

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta: {
    timestamp: string;
    requestId: string;
  } | null;
}
```

### Declarative Sanity Webhook Zod Schema (`sanityWebhookSchema`)

External CMS webhook handlers (such as `/api/revalidate`) MUST validate incoming event payloads against `sanityWebhookSchema` and verify `x-sanity-webhook-signature` headers before triggering cache invalidation.

```typescript
import { z } from "zod";

export const sanityWebhookSchema = z.object({
  _id: z.string(),
  _type: z.string(),
  _updatedAt: z.string(),
  slug: z.object({ current: z.string() }).optional(),
  tags: z.array(z.string()).optional(),
});

export type SanityWebhookPayload = z.infer<typeof sanityWebhookSchema>;
```

---

## 3. Behavioral Contracts

### Requirement: REQ-EXT-001-API-ROUTE-CREATION
New API route handlers MUST implement Zod request schema validation and return standard error response envelopes on validation failures.

#### Scenario: Registering a New Endpoint with Zod Validation
- GIVEN a developer adding an endpoint at `src/app/api/<feature>/route.ts`
- WHEN receiving an invalid request payload
- THEN the route handler MUST return a `400 Bad Request` or `422 Unprocessable Entity` status
- AND include a structured Zod error details array in the error response payload.

### Requirement: REQ-EXT-002-SPOKE-CONFIGURATION-VALIDATION
The system MUST validate all newly registered product spoke configurations against `spokeConfigSchema` before enabling edge routing.

#### Scenario: Dynamic Spoke Onboarding Validation
- GIVEN a new spoke configuration defined for `baterai.dayaberkah.id`
- WHEN loaded by the application configuration loader
- THEN the system MUST validate the configuration against `spokeConfigSchema`
- AND reject invalid configurations missing mandatory metadata or fallback numbers.

---

## 4. Graphify Anchoring & References

- Knowledge Graph Node ID: `doc:docs/system/api/extensibility.md`
- Graphify Community: `community_api`
- Authoritative API Reference Contract: [`reference.md`](file:///d:/dev/arostech-hub/docs/system/api/reference.md#L1-L100)
- Authoritative PRD Reference: [`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L110-L170)
- System Data Model Reference: [`data-model.md`](file:///d:/dev/arostech-hub/docs/system/data-model.md#L1-L150)
