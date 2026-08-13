---
id: ADR-0006
title: "ADR-0006: Auth.js v5 Cloudflare Edge Runtime Split-Config Architecture"
version: 4.0.0
status: ACCEPTED
target_domain: dayaberkah.id
graphify_community: "community_adr"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L753-L797"
  api_ref: "file:///d:/dev/arostech-hub/docs/system/api/reference.md#L194-L241"
  adr_0005: "file:///d:/dev/arostech-hub/docs/system/adr/0005-authjs-v5-client-tracking-portal-integration.md#L1-L116"
  adr_0007: "file:///d:/dev/arostech-hub/docs/system/adr/0007-adopt-opennext-cloudflare-adapter.md#L1-L50"
  auth_findings: "file:///d:/dev/arostech-hub/docs/audit/auth-findings.md#L1-L150"
---

# ADR-0006: Auth.js v5 Cloudflare Edge Runtime Split-Config Architecture

> **OpenSpec SDD Lifecycle Mapping**: `ADDED: 2026-08-13 Cloudflare Edge Runtime Auth Baseline`  
> **Authoritative Baseline Reference**: Architectural Decision Record defining the Cloudflare Edge Runtime authentication architecture, resolving Edge runtime incompatibilities between Auth.js v5, Prisma ORM, and bcryptjs.
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/adr/0006-authjs-v5-cloudflare-edge-runtime-split-config.md`

---

## OpenSpec Delta

- `ADDED`: Established the Auth.js v5 Split-Config Pattern separating Edge-safe configuration (`auth.config.ts`) from Node-runtime handler (`auth.ts`).
- `MODIFIED`: Configured route runtime targets for `/api/auth/[...nextauth]`, `/api/auth/forgot-password`, and `/api/auth/reset-password` to execute under Node.js runtime (`export const runtime = 'nodejs'`).
- `REMOVED`: Top-level eager instantiation of `PrismaAdapter(prisma)` and `bcryptjs` imports from Edge-targeted modules and Next.js Edge Middleware.

---

## 1. Context & Problem Statement

The **DBSN Centralized Digital Ecosystem** deploys to Cloudflare Pages via `@opennextjs/cloudflare` (superseding legacy `@cloudflare/next-on-pages` per [`ADR-0007`](file:///d:/dev/arostech-hub/docs/system/adr/0007-adopt-opennext-cloudflare-adapter.md)). The platform relies on Next.js 16 Edge Middleware (`src/middleware.ts`) for host mapping, subdomain rewriting (`dashboard.dayaberkah.id`, `pju`, `solarcell`, etc.), and session security enforcement.

During the Card 1.5 Auth + ADR Audit ([`auth-findings.md`](file:///d:/dev/arostech-hub/docs/audit/auth-findings.md#L1-L150)), a critical architectural defect was confirmed:
1. `src/lib/auth/auth.config.ts` eagerly instantiates `PrismaAdapter(prisma)` and imports `bcryptjs` at the top-level module root.
2. `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/auth/forgot-password/route.ts`, and `src/app/api/auth/reset-password/route.ts` declare `export const runtime = 'edge'`.

When building for Cloudflare Pages, V8 Edge Runtime isolates lack support for Node.js native APIs (such as `net`, `tls`, `crypto`, and native C++ bindings required by standard `@prisma/client` TCP socket drivers and `bcryptjs`). Eagerly importing `PrismaAdapter(prisma)` at module root in `auth.config.ts` causes bundling failures or runtime crashes (`TypeError: Cannot read properties of undefined` or `Module not found: Can't resolve 'net'`).

Therefore, the system MUST decouple Edge-compatible session validation from Node-runtime database adapter logic.

---

## 2. Decision & Selected Option

### Selected Option: Option B — Separate Node-Runtime Handlers & Split Auth Config Pattern

The system SHALL adopt **Option B (Split Auth Config with Node-Runtime Auth Handlers)** as the canonical authentication pattern across all Cloudflare Pages deployments:

1. **Split Configuration Architecture**:
   - **`src/lib/auth/auth.config.ts` (Edge-Safe)**: Contains lightweight Auth.js options required for Edge Middleware and stateless session decoding (providers list structure, custom JWT callbacks, dynamic role-based expiry, custom cookie names). It MUST NOT import `@auth/prisma-adapter`, `@prisma/client`, or `bcryptjs`.
   - **`src/lib/auth/auth.ts` (Node-Runtime)**: Imports `auth.config.ts`, attaches `PrismaAdapter(prisma)`, defines Credentials `authorize()` logic (with `bcrypt.compare`), and exports `handlers`, `auth`, `signIn`, and `signOut`.

2. **Explicit Node-Runtime Route Declarations**:
   - Authentication API endpoints (`/api/auth/[...nextauth]`, `/api/auth/forgot-password`, `/api/auth/reset-password`) MUST explicitly declare:
     ```typescript
     export const runtime = 'nodejs'
     ```
   - This ensures Cloudflare Pages routes authentication API traffic to Node.js compatibility workers while keeping standard pages and middleware at V8 Edge speed.

3. **Stateless Edge Middleware Verification**:
   - Edge Middleware (`src/middleware.ts`) SHALL perform lightweight stateless JWT signature verification using `getToken({ req, secret })` from `next-auth/jwt`.
   - Middleware MUST NOT execute database queries or invoke `PrismaAdapter`.

---

## 3. Evaluation of Alternatives

### Option A: API Loopback Pattern (REJECTED)
- **Concept**: Edge Middleware verifies session state by making an HTTP sub-request (`fetch('https://dashboard.dayaberkah.id/api/auth/session')`) to the origin Node server on every request.
- **Why Rejected**:
  - **Severe Latency Overhead**: Introduces +50ms to +200ms of latency per page request on dashboard subdomains.
  - **Sub-request Limits**: Exhausts Cloudflare Worker sub-request limits during concurrent resource loading.
  - **Cold-Start Fragility**: Fails or times out if the origin API endpoint experiences cold starts.

### Option B: Split Auth Config & Node-Runtime Handlers (ACCEPTED)
- **Concept**: De-couple Edge middleware JWT verification from Node-runtime Auth.js API route handlers.
- **Why Accepted**:
  - **Sub-millisecond Performance**: Edge Middleware decodes and verifies signed JWT tokens in V8 memory (<1ms).
  - **100% Edge-Compatible**: Completely removes `@prisma/client` and `bcryptjs` from the Edge bundle.
  - **Auth.js v5 Best Practice**: Directly aligns with Next.js App Router and Cloudflare Pages official integration guidelines.

---

## 4. Behavioral Contracts & Security Requirements

### Requirement: REQ-ADR-0006-EDGE-AUTH-SPLIT
Auth.js configuration MUST be split into Edge-safe (`auth.config.ts`) and Node-runtime (`auth.ts`) modules. Route handlers performing database operations MUST operate under Node.js runtime.

#### Scenario: Edge Middleware Stateless JWT Verification
- GIVEN an incoming request to `https://dashboard.dayaberkah.id/overview`
- WHEN Next.js Edge Middleware executes on Cloudflare Pages V8 Edge Runtime
- THEN Middleware MUST verify the session token using stateless `getToken()` with `NEXTAUTH_SECRET`
- AND MUST NOT instantiate `PrismaAdapter` or initiate database socket connections.

#### Scenario: Authentication Route Execution on Node Runtime
- GIVEN a user submitting credentials at `POST /api/auth/callback/credentials`
- WHEN Next.js routes the request to `/api/auth/[...nextauth]/route.ts`
- THEN the route handler MUST execute on Node.js runtime (`export const runtime = 'nodejs'`)
- AND validate the user password using `bcrypt.compare()` via `PrismaAdapter(prisma)` in `src/lib/auth/auth.ts`.

#### Scenario: Google OAuth Staff Role Enforce
- GIVEN a staff member signing in via Google OAuth
- WHEN Auth.js executes the `signIn` callback in `auth.config.ts`
- THEN the system MUST verify the email domain against approved internal staff domains (e.g. `@dayaberkah.id`)
- AND assign default internal role `VIEWER` or `ADMIN`, rejecting unauthorized external email accounts.

---

## 5. Declarative Architecture Schemas & Interfaces

### Declarative Split Auth Interface (`src/lib/auth/auth.config.ts` vs `src/lib/auth/auth.ts`)

```typescript
// src/lib/auth/auth.config.ts (Edge-Safe Schema)
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      // Dynamic role-based maxAge calculation
      return token
    },
    async session({ session, token }) {
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
}
```

```typescript
// src/lib/auth/auth.ts (Node-Runtime Engine Schema)
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '../db/prisma'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        // Node-runtime database lookup & bcrypt comparison
        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } })
        if (!user || !user.hashedPassword) return null
        const isValid = await bcrypt.compare(credentials.password as string, user.hashedPassword)
        return isValid ? user : null
      },
    }),
  ],
})
```

---

## 6. Consequences & Trade-offs

### Positive
- **Guaranteed Cloudflare Pages Compatibility**: Eliminates all Edge runtime compilation and bundling failures caused by Prisma and native Node modules.
- **Zero Latency Regression**: Edge Middleware validates JWT session signatures in V8 memory without database latency.
- **Strict Role Security**: Enforces Google OAuth for internal staff (`@dayaberkah.id`) and Credentials for provisioned clients (`role: "client"`).

### Negative & Mitigations
- **Dual Config Maintenance**: Maintaining both `auth.config.ts` and `auth.ts` requires discipline to keep provider definitions in sync.
- **Mitigation**: `auth.ts` spreads `...authConfig` to inherit all shared callbacks, cookie options, and JWT rules directly.

---

## 7. Wave 1 Implementation Instructions (Prerequisite for Task 3.1.1)

To complete Wave 1 implementation, execute the following step-by-step modifications:

### Step 1: Create `src/lib/auth/auth.ts` (Node-Runtime)
1. Create `src/lib/auth/auth.ts`.
2. Import `NextAuth` from `next-auth`, `Credentials` from `next-auth/providers/credentials`, `PrismaAdapter` from `@auth/prisma-adapter`, `prisma` from `../db/prisma`, and `bcrypt` from `bcryptjs`.
3. Import `authConfig` from `./auth.config`.
4. Export `{ handlers, auth, signIn, signOut }` initialized with `PrismaAdapter(prisma)` and `Credentials` provider.

### Step 2: Refactor `src/lib/auth/auth.config.ts` (Edge-Safe)
1. Remove imports of `PrismaAdapter`, `prisma`, and `bcryptjs`.
2. Export `authConfig: NextAuthConfig` containing Google provider, JWT strategy, dynamic role expiry callbacks, and cookie configurations.
3. Update Google OAuth `signIn` callback:
   - Restrict auto-provisioning to internal domains (`@dayaberkah.id`).
   - Assign default role `'VIEWER'` (not `'CLIENT'`).

### Step 3: Update Auth API Route Runtimes
1. In `src/app/api/auth/[...nextauth]/route.ts`:
   - Change import to `import { handlers } from '@/lib/auth/auth'`.
   - Set `export const runtime = 'nodejs'`.
2. In `src/app/api/auth/forgot-password/route.ts`:
   - Set `export const runtime = 'nodejs'`.
3. In `src/app/api/auth/reset-password/route.ts`:
   - Set `export const runtime = 'nodejs'`.

### Step 4: Update `src/lib/auth/auth-guard.ts`
1. Update `getServerSession()` to import `auth` from `./auth` (or `./auth.config` depending on execution context).

### Step 5: Verification & Testing
1. Run `npx jest src/lib/auth/__tests__/auth-guard.test.ts` to verify guard logic.
2. Run `npx jest src/__tests__/api/auth/session.test.ts` to verify session endpoints.

---

## 8. Graphify Anchoring & References

- Knowledge Graph Node ID: `doc:docs/system/adr/0006-authjs-v5-cloudflare-edge-runtime-split-config.md`
- Graphify Community: `community_adr`
- PRD Baseline Reference: [`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L753-L797)
- API Reference: [`reference.md`](file:///d:/dev/arostech-hub/docs/system/api/reference.md#L194-L241)
- Auth Findings Reference: [`auth-findings.md`](file:///d:/dev/arostech-hub/docs/audit/auth-findings.md#L1-L150)
