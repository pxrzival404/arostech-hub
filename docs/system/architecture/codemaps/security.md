---
id: ARCH-SEC-CODEMAP-001
title: Auth.js v5 Edge Security & Client Portal Access Codemap
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_architecture"
authoritative_references:
  adr_0005: "file:///d:/dev/arostech-hub/docs/system/adr/0005-authjs-v5-client-tracking-portal-integration.md#L1-L50"
  config_schema: "file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md#L45-L65"
  overview: "file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L28-L38"
---

# Auth.js v5 Edge Security & Client Portal Access Codemap

> **OpenSpec SDD Lifecycle Mapping**: `ADDED: 2026-08-12 Auth.js v5 Security Codemap Baseline`  
> **Authoritative Baseline Reference**: This document details the security architecture, Edge JWT token validation, role-based authorization matrix, and row-level client project access codemap for the **DBSN Centralized Digital Ecosystem**, fully synchronized with PRD v4.0.0 and ADR-0005 ([`adr_0005`](file:///d:/dev/arostech-hub/docs/system/adr/0005-authjs-v5-client-tracking-portal-integration.md#L1-L50)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/architecture/codemaps/security.md`

---

## OpenSpec Delta

- `ADDED`: Comprehensive Auth.js v5 Edge security codemap enforcing role-based access (`admin`, `viewer`, `client`) and row-level project scoping via `trackingScopeIds`.
- `REMOVED`: Eliminated legacy authentication references and un-scoped API access patterns.

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-SEC-CODEMAP-001 Edge Session Verification & Authorization Matrix
The system MUST execute Auth.js v5 JWT token verification inside Next.js Edge Middleware for all requests accessing `dashboard.dayaberkah.id` or protected routes `/client-portal/*`, `/admin/*`, and `/api/client-portal/*`. JWT validation SHALL run on Cloudflare Pages Edge infrastructure using `NEXTAUTH_SECRET`.

#### Scenario: Edge Token Verification
- GIVEN an incoming HTTP request containing a `next-auth.session-token` cookie or Bearer authorization header
- WHEN Next.js Edge Middleware intercepts the request
- THEN middleware MUST verify token signature and expiration using `NEXTAUTH_SECRET`
- AND if valid, SHALL inject decoded session user claims into request headers (`x-user-id`, `x-user-role`, `x-user-scope`).

#### Scenario: Client Row-Level Data Isolation
- GIVEN an authenticated user with role `client` querying `/api/client-portal/projects`
- WHEN the API Route Handler executes database queries via Prisma ORM
- THEN the query MUST append `WHERE id IN (trackingScopeIds)` filtering
- AND the system SHALL return only records matching the client's explicit project scope.

---

## 2. Declarative Security & Authorization Schemas

```typescript
import { z } from "zod";

export const RoleEnum = z.enum(["admin", "viewer", "client"]);

export const JWTClaimsSchema = z.object({
  sub: z.string().min(1, "User ID is required"),
  email: z.string().email(),
  name: z.string(),
  role: RoleEnum,
  trackingScopeIds: z.array(z.string()).default([]),
  iat: z.number(),
  exp: z.number(),
});

export const ClientPortalAccessSchema = z.object({
  userId: z.string(),
  role: RoleEnum,
  trackingScopeIds: z.array(z.string()),
  targetProjectId: z.string(),
  isAuthorized: z.boolean(),
});

export type UserRole = z.infer<typeof RoleEnum>;
export type JWTClaims = z.infer<typeof JWTClaimsSchema>;
export type ClientPortalAccess = z.infer<typeof ClientPortalAccessSchema>;
```

---

## 3. System Security Terrain & Code Architecture

### 3.1 Edge Security Subsystem Flow

```
[ Incoming Client Request ]
           │
           ▼
[ Cloudflare WAF & Security Headers ] ─── (DDoS / Bot Inspection)
           │
           ▼
[ Next.js Edge Middleware (src/middleware.ts) ]
           │
           ├── Host Inspection: dashboard.dayaberkah.id -> /client-portal
           │
           ├── JWT Verification: verify JWT via Auth.js & NEXTAUTH_SECRET
           │      │
           │      ├── Invalid / Missing -> Redirect to /auth/signin or HTTP 401
           │      └── Valid Claims -> Inject x-user-role & x-user-scope
           │
           ▼
[ Route Handler / Page Server Component ]
           │
           ▼
[ Prisma ORM Row-Level Scoped Query (WHERE id IN (trackingScopeIds)) ]
           │
           ▼
[ Neon Postgres Database ]
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| Endpoint / Resource Path | `admin` Role | `viewer` Role | `client` Role | Anonymous |
| :--- | :---: | :---: | :---: | :---: |
| `dayaberkah.id` (Hub Pages) | Allow | Allow | Allow | Allow |
| `*.dayaberkah.id` (Spoke Catalog Pages) | Allow | Allow | Allow | Allow |
| `POST /api/rfq/submit` | Allow | Allow | Allow | Allow |
| `dashboard.dayaberkah.id/tracking` | Allow (All) | Allow (All) | Allow (Scoped) | Deny (401) |
| `/api/client-portal/projects` | Allow (All) | Allow (All) | Allow (Scoped) | Deny (401) |
| `/admin/*` & `/api/admin/*` | Allow | Deny (403) | Deny (403) | Deny (401) |

---

## 5. Security Practices & Controls

1. **Secret Binding Security**: `NEXTAUTH_SECRET` MUST be stored as a Cloudflare Secret (minimum 32 random characters) and NEVER committed to source repositories.
2. **Subdomain Security Headers**: Edge Middleware MUST append security headers:
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy: default-src 'self' ...`
3. **No Database Credential Exposure**: Direct database queries MUST use Neon serverless proxy connection pools configured with parameterized queries via Prisma ORM to prevent SQL injection.
