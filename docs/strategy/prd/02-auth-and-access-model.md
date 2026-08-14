---
id: PRD-MOD-02
title: "PRD Module 02: Authentication, Access Control & Client Portal Model"
version: 4.0.0
status: LOCKED_BASELINE
architecture: Hub-and-Spoke Greenfield
target_domain: dayaberkah.id
graphify_community: "community_prd"
authoritative_references:
  data_model_auth: "file:///d:/dev/arostech-hub/docs/system/data-model/02-auth-session-schema.md"
  adr_auth_edge: "file:///d:/dev/arostech-hub/docs/system/adr/0006-authjs-v5-cloudflare-edge-runtime-split-config.md"
  adr_client_portal: "file:///d:/dev/arostech-hub/docs/system/adr/0005-authjs-v5-client-tracking-portal-integration.md"
---

# PRD Module 02: Authentication, Access Control & Client Portal Model

> **TL;DR**: Defines the unified Auth.js v5 authentication architecture across the catch-all route `/api/auth/[...nextauth]`, distinguishing internal Google OAuth (admin/viewer) from client Credentials access, along with row-level data isolation via `trackingScopeIds`.

---

## 1. Authentication Architecture (Auth.js v5)

Authentication is consolidated through a single Auth.js v5 catch-all endpoint: `GET/POST /api/auth/[...nextauth]`. No custom or bespoke authentication endpoints exist in the architecture.

### 1.1 Provider Strategy
1. **Internal Staff (`role: "admin" | "viewer"`)**:
   - Provider: Google OAuth (`/api/auth/callback/google`).
   - Domain Restricted: Restricted to authorized corporate emails.
2. **Client Users (`role: "client"`)**:
   - Provider: Credentials Provider (`/api/auth/callback/credentials`).
   - Verification: Handled in `authorize()` validating against active `users` records (`role = "client"`, `is_active = true`).
   - Provisioning: Accounts are provisioned by Sales Ops in the Admin Dashboard upon RFQ qualification.

### 1.2 Session Payload Contracts

#### Admin/Viewer Session
```json
{
  "user": {
    "id": "usr_clx123abc456",
    "name": "Admin DBSN",
    "email": "admin@dayaberkah.id",
    "role": "admin",
    "trackingScopeIds": null
  },
  "expires": "2026-09-07T04:20:00.000Z"
}
```

#### Client Session
```json
{
  "user": {
    "id": "usr_clx789ghi012",
    "name": "Budi Santoso",
    "email": "budi@pemkot.go.id",
    "role": "client",
    "trackingScopeIds": ["proj_bandung_pju_01", "ord_solar_456"]
  },
  "expires": "2026-09-07T04:20:00.000Z"
}
```

---

## 2. Access Control & Row-Level Isolation

### 2.1 Role-Based Access Control (RBAC)
- **Admin**: Full read/write access to lead pipeline, user management, and tracking statuses.
- **Viewer**: Read-only access to inquiries and metrics.
- **Client**: Restricted strictly to tracking project data associated with their provisioned `tracking_scope_ids`.

### 2.2 Row-Level Security Enforcements
1. For client sessions, backend endpoints MUST filter all database queries by `user.trackingScopeIds`.
2. Clients MUST NOT be permitted to query projects outside their authorized scope array.
3. Access attempts for unauthorized project IDs SHALL return `403 Forbidden` and trigger an audit security log.

### 2.3 JWT Token Hygiene
- Tokens MUST be stored in `httpOnly`, `secure`, `sameSite=lax` cookies.
- Token Expiration: 24 hours for client sessions; 8 hours for admin sessions.
- Rate Limiting: 10 login attempts per 5 minutes per IP enforced at Edge Middleware.

---

## 3. OpenSpec Behavioral Contracts

### Requirement: REQ-AUTH-001-CLIENT-DATA-ISOLATION
The API layer MUST enforce row-level scoping for all client tracking queries based on verified JWT session claims.

#### Scenario: Client querying tracking portal
- GIVEN an authenticated client with `trackingScopeIds: ["proj_123"]`
- WHEN the client requests project tracking status for `"proj_123"`
- THEN the system MUST return the project details.

#### Scenario: Unauthorized cross-tenant query
- GIVEN an authenticated client with `trackingScopeIds: ["proj_123"]`
- WHEN the client attempts to request details for `"proj_999"`
- THEN the system MUST return HTTP 403 Forbidden and record a security log event.
