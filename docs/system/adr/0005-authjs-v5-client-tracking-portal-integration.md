---
id: ADR-0005
title: "ADR-0005: Auth.js v5 JWT Session Model & Client Tracking Portal Integration"
version: 4.0.0
status: ACCEPTED
target_domain: dayaberkah.id
graphify_community: "community_adr"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L48-L55"
  data_model: "file:///d:/dev/arostech-hub/docs/system/data-model/00-overview.md#L25-L30"
  config_schema: "file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md#L45-L65"
---

# ADR-0005: Auth.js v5 JWT Session Model & Client Tracking Portal Integration

> **TL;DR**: Authoritative specification and architectural reference for ADR-0005: Auth.js v5 JWT Session Model & Client Tracking Portal Integration within the DBSN platform (docs/system/adr/0005-authjs-v5-client-tracking-portal-integration.md).


> **OpenSpec SDD Lifecycle Mapping**: `ADDED: 2026-08-12 Auth.js v5 Client Portal Baseline`  
> **Authoritative Baseline Reference**: Architectural Decision Record defining the Auth.js v5 JWT authentication architecture, role-based authorization rules, and row-level client project scoping for `dashboard.dayaberkah.id`, synchronized with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L48-L55)) and configuration schemas ([`configuration-schema.md`](file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md#L45-L65)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/adr/0005-authjs-v5-client-tracking-portal-integration.md`

---

## OpenSpec Delta

- `ADDED`: Established Auth.js v5 Edge-compatible JWT session architecture with role-based access control (`admin`, `viewer`, `client`) and row-level scoping (`trackingScopeIds`).
- `REMOVED`: Deprecated legacy external auth providers and legacy route group structures. Enforced standard App Router paths (`/client-portal` and `/admin`) mapped from `dashboard.dayaberkah.id`.

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-ADR-0005 Auth.js v5 JWT Edge Verification & Scoped Access
The system MUST execute Auth.js v5 JWT session verification inside Next.js Edge Middleware and Route Handlers. Requests targeting `dashboard.dayaberkah.id` or protected `/api/client-portal/*` endpoints SHALL require a valid JWT token signed with `NEXTAUTH_SECRET`. Client sessions MUST enforce row-level project filtering via `trackingScopeIds`.

#### Scenario: Valid Client Portal Session Access
- GIVEN an authenticated user with role `client` and `trackingScopeIds: ["PROJ-101", "PROJ-102"]`
- WHEN accessing `https://dashboard.dayaberkah.id/tracking`
- THEN Edge Middleware SHALL verify the JWT token using `NEXTAUTH_SECRET`
- AND the application SHALL serve client portal data strictly scoped to projects `PROJ-101` and `PROJ-102`.

#### Scenario: Unauthorized Access Rejection
- GIVEN an unauthenticated request targeting `https://dashboard.dayaberkah.id/tracking` or `/api/client-portal/projects`
- WHEN Edge Middleware or Route Handler validates the session
- THEN the system MUST reject request with HTTP 401 Unauthorized or redirect to `/auth/signin`.

#### Scenario: Cross-Client Scope Breach Prevention
- GIVEN a user authenticated as `client` attempting to query project `PROJ-999` outside their `trackingScopeIds`
- WHEN the API Route Handler executes database query filtering
- THEN the system MUST return HTTP 403 Forbidden or empty dataset response.

---

## 2. Context & Architecture

The Client Tracking Portal (`dashboard.dayaberkah.id`) allows DBSN enterprise and government clients to track real-time procurement statuses, shipment tracking, and installation milestones. To ensure sub-millisecond session validation on Cloudflare Pages Edge infrastructure without hitting origin database lookups on every request, session state MUST be encapsulated entirely within encrypted Auth.js v5 JWT tokens.

---

## 3. Declarative Security Schemas & Interfaces

### Declarative JWT Claims & Session Schemas

```typescript
import { z } from "zod";

export const UserRoleEnum = z.enum(["admin", "viewer", "client"]);

export const JWTClaimsSchema = z.object({
  sub: z.string().min(1, "User ID is required"),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleEnum,
  trackingScopeIds: z.array(z.string()).default([]),
  iat: z.number(),
  exp: z.number(),
});

export const SessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleEnum,
  trackingScopeIds: z.array(z.string()),
});

export type UserRole = z.infer<typeof UserRoleEnum>;
export type JWTClaims = z.infer<typeof JWTClaimsSchema>;
export type SessionUser = z.infer<typeof SessionUserSchema>;
```

---

## 4. Alternatives Considered

### Alternative 1: External Database Session Storage
- **Pros**: Instant server-side session revocation.
- **Cons**: Every HTTP request on Cloudflare Pages requires database query latency to check session tokens.
- **Why not**: Introduces latency spikes and potential connection exhaustion on edge deployments.

### Alternative 2: Disconnected Portal Applications
- **Pros**: Complete separation of tracking portal code.
- **Cons**: Duplicated Auth configurations, split database connections, high maintenance overhead.
- **Why not**: Single Next.js 16 app with Edge Subdomain Middleware provides unified security policies and effortless deployment.

---

## 5. Consequences & Security Guarantees

### Positive
- Sub-millisecond JWT verification at Cloudflare Edge using `NEXTAUTH_SECRET`.
- Granular role-based authorization (`admin`, `viewer`, `client`) and row-level data scoping via `trackingScopeIds`.
- Seamless integration with Next.js App Router and Prisma ORM.

### Negative & Mitigations
- Session token revocation requires short expiry windows (e.g. 24-hour token max age).
- **Mitigation**: Configured Auth.js v5 JWT rolling sessions to automatically refresh tokens during active usage.
