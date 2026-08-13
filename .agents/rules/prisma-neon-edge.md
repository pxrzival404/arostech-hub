# Prisma ORM & Neon Postgres Serverless Governance Rule

> **Rule ID**: `RULE-DB-001`  
> **Project**: PT Daya Berkah Sentosa Nusantara (DBSN) — `arostech-hub`  
> **Owner Agents**: `typescript-reviewer` (ORM type safety), `database-reviewer` (query & schema governance)  
> **Primary Authority**: [ADR-0004](file:///d:/dev/arostech-hub/docs/system/adr/0004-universal-rfq-cart-schema-and-post-rfq-lead-classification.md), [ADR-0006](file:///d:/dev/arostech-hub/docs/system/adr/0006-authjs-v5-cloudflare-edge-runtime-split-config.md) & [Data Model Spec](file:///d:/dev/arostech-hub/docs/system/data-model.md)

---

## 1. File-Matcher Scopes

This rule MUST be enforced whenever an AI agent inspects or modifies files matching:

| Scope | Pattern | Rationale |
|---|---|---|
| Prisma schema | `prisma/schema.prisma` | Schema definition, generator config, datasource block |
| DB client module | `src/lib/db/prisma.ts` | Sole canonical instantiation point for Prisma Client |
| Auth config | `src/lib/auth/auth.config.ts` | Edge-safe JWT module — MUST NOT import Prisma/bcrypt |
| Auth route handler | `src/app/api/auth/[...nextauth]/route.ts` | Node-runtime entry point for Auth.js |
| Middleware | `src/middleware.ts` | Edge runtime — MUST NOT import Prisma |
| Edge API routes | `src/app/api/**/route.ts` (with `export const runtime = 'edge'`) | Must use loopback fetch, never direct Prisma |
| Node API routes | `src/app/api/**/route.ts` (with `export const runtime = 'nodejs'`) | May use Prisma Client directly |
| Server actions | `src/app/**/actions.ts`, `src/**/*.action.ts` | Run on Node runtime by default — Prisma permitted |
| Migration scripts | `prisma/migrations/**`, `scripts/migrate*.ts` | MUST use `DIRECT_URL` only |

---

## 2. Pre-Execution Architectural Vector Analysis

Before modifying database schemas or data access layers, agents MUST evaluate the following 3 vectors:

1. **Vector A — Trade-offs & Isolation Dynamics**:
   - Database connection pooling on Neon serverless PostgreSQL MUST use `@prisma/adapter-neon` with `@neondatabase/serverless`.
   - Lazy initialization via JavaScript `Proxy` pattern is MANDATORY in `src/lib/db/prisma.ts` to defer database connection setup until actual query execution.

2. **Vector B — System Invariants & Spec Compliance**:
   - Enforce composite lead structure (`RfqSubmission` + `RfqLineItem`) replacing single-table `Lead` per ADR-0004. Purge legacy `RedirectMap`.
   - Database operations MUST execute under Node.js runtime (`export const runtime = 'nodejs'`). Eager Prisma Client imports in Edge routes are strictly forbidden.

3. **Vector C — Edge Cases & Verification Strategy**:
   - Environment Variable Separation: `DATABASE_URL` (pooled connection string, port 5432/6543) for runtime queries; `DIRECT_URL` (unpooled direct connection string, port 5432) for Prisma CLI migrations.

---

## 3. Normative Enforcement Rules (RFC 2119)

1. Prisma Client initialization **MUST** use the lazy `Proxy` initialization pattern in `src/lib/db/prisma.ts`.
2. Serverless pooled connections **MUST** use `@prisma/adapter-neon` with the `driverAdapters` preview feature.
3. Routes performing Prisma database operations **MUST** declare `export const runtime = 'nodejs'`.
4. RFQ lead submissions **MUST** persist to composite `RfqSubmission` and `RfqLineItem` tables (ADR-0004). Legacy single-table `Lead` queries **MUST NOT** be used.
5. Migration commands **MUST** use `DIRECT_URL` while application queries **MUST** use `DATABASE_URL`.
6. Middleware (`src/middleware.ts`) and Edge-declared files **MUST NOT** import `prisma`, `PrismaAdapter`, or `bcryptjs`.

---

## 4. Authoritative Proxy Lazy-Init Pattern (`src/lib/db/prisma.ts`)

The following is the single authoritative instantiation pattern. ALL Prisma Client usage in this project MUST go through the module exported from `src/lib/db/prisma.ts`.

```typescript
// src/lib/db/prisma.ts — CANONICAL
import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined
}

function getPrismaInstance(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (
    !connectionString ||
    connectionString.includes('user:password@host') ||
    connectionString.includes('host/database')
  ) {
    throw new Error('[Prisma Init Error] DATABASE_URL environment variable is missing or unconfigured.')
  }
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient =
  globalForPrisma.__prisma ??
  new Proxy({} as unknown as PrismaClient, {
    get(_target, prop) {
      if (!(_target as any)._instance) {
        ;(_target as any)._instance = getPrismaInstance()
      }
      const instance = (_target as any)._instance
      const value = instance[prop as keyof PrismaClient]
      return typeof value === 'function' ? value.bind(instance) : value
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma
}
```

### Rationale & Design Controls
- **Proxy Lazy-Init**: The `Pool` and `PrismaNeon` adapter are constructed on first property access, preventing top-level Node.js code from executing during static import analysis.
- **`globalThis` Guard**: Prevents multiple active Prisma instances during Next.js hot-reload in development.
- **Guard Clause**: Fails fast if `DATABASE_URL` is unconfigured rather than failing silently on first query.

---

## 5. Edge / API-Loopback Decision Matrix

| Runtime | Use-Case | Allowed Pattern | Prohibited |
|---|---|---|---|
| **Edge** (`export const runtime = 'edge'`) | Read/write DB data | `fetch()` loopback to a Node API route | Any `import { prisma }` or `import { PrismaClient }` |
| **Edge** (Next.js middleware) | Auth checks, redirects | JWT decode-only (no DB), or loopback fetch | Any Prisma import; `PrismaAdapter`; `bcryptjs` |
| **Node** (`export const runtime = 'nodejs'`) | Read/write DB data | Direct `import { prisma } from '@/lib/db/prisma'` | — |
| **Node** (Server Actions) | Form submissions, mutations | Direct `import { prisma } from '@/lib/db/prisma'` | — |
| **Node** (Auth route handler) | Auth.js callbacks | Direct `import { prisma }` + `PrismaAdapter(prisma)` | — |

---

## 6. Environment Variable Mapping Matrix

| Variable Name | Connection Type | Port / Target | Usage | Production Constraint |
|---------------|-----------------|---------------|-------|-----------------------|
| `DATABASE_URL` | Pooled Connection String (`@neondatabase/serverless`) | Port 5432 / 6543 (Pooler) | Runtime application queries & API handlers | MUST include `?pgbouncer=true` or use Neon pooler host (`-pooler.neon.tech`). |
| `DIRECT_URL` | Direct Connection String (Unpooled TCP) | Port 5432 (Direct) | Prisma CLI migrations (`prisma migrate dev/deploy`) | MUST point to direct host (no `-pooler`). NEVER used at runtime. |

### Schema Datasource Block (`prisma/schema.prisma`)
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

---

## 7. Explicit Forbidden Anti-Patterns

### ANTI-1: Eager Prisma Client Import in Edge Runtime Modules
```typescript
// ❌ FORBIDDEN in Edge route or middleware
import { prisma } from '@/lib/db/prisma'

export const runtime = 'edge' // CRASH: Prisma driver fails in V8 Edge Isolate
```
**Correct Pattern**: Declare `export const runtime = 'nodejs'` for files importing `prisma`.

---

### ANTI-2: `PrismaAdapter` in Edge-Declared Files
```typescript
// ❌ FORBIDDEN in Edge files
import { PrismaAdapter } from '@auth/prisma-adapter'
```
**Correct Pattern**: Per ADR-0006, `PrismaAdapter` belongs exclusively in Node-runtime auth handlers (`src/lib/auth/auth.ts`).

---

### ANTI-3: `bcryptjs` Import in Edge Files
```typescript
// ❌ FORBIDDEN in Edge files
import { compare } from 'bcryptjs' // CRASH: C++ native crypto bindings fail on Edge
```
**Correct Pattern**: Execute password comparison exclusively inside Node-runtime handlers.

---

### ANTI-4: Using `DATABASE_URL` for Migrations
```bash
# ❌ FORBIDDEN: Will fail or cause schema drift on pooled connection
DATABASE_URL="postgres://user:pass@ep-xxx-pooler.neon.tech/db?pgbouncer=true" npx prisma migrate deploy
```
**Correct Pattern**: Always run migrations against `DIRECT_URL`:
```bash
DIRECT_URL="postgres://user:pass@ep-xxx.neon.tech/db" npx prisma migrate deploy
```

---

### ANTI-5: Prisma Client in `src/middleware.ts` or Legacy Single-Table Lead Queries
```typescript
// ❌ FORBIDDEN in src/middleware.ts
import { prisma } from '@/lib/db/prisma' // FORBIDDEN
```
**Correct Pattern**: Middleware MUST use stateless JWT verification. RFQ leads MUST persist to composite `RfqSubmission` + `RfqLineItem` tables per ADR-0004.

---

## 8. Approved Canonical Code Patterns

### APPROVED-1: Node-Runtime Route Handler with Direct Prisma Usage
```typescript
// src/app/api/leads/route.ts — APPROVED
export const runtime = 'nodejs'

import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const submissions = await prisma.rfqSubmission.findMany({
    where: { status: 'PENDING' },
    include: { lineItems: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(submissions)
}
```

---

### APPROVED-2: Composite RFQ Submission Transaction Pattern (ADR-0004)
```typescript
// src/app/api/rfq/route.ts — APPROVED
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const RfqPayloadSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(2),
  company: z.string().optional(),
  spokeSubdomain: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = RfqPayloadSchema.parse(body)

    const submission = await prisma.rfqSubmission.create({
      data: {
        customerEmail: validated.customerEmail,
        customerName: validated.customerName,
        company: validated.company,
        spokeSubdomain: validated.spokeSubdomain,
        status: 'PENDING',
        lineItems: {
          create: validated.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
          })),
        },
      },
      include: { lineItems: true },
    })

    return NextResponse.json({ success: true, submissionId: submission.id })
  } catch (err) {
    console.error('[RFQ Submission Error]:', err)
    return NextResponse.json({ success: false, error: 'Failed to process RFQ' }, { status: 400 })
  }
}
```

---

### APPROVED-3: Edge Route with Loopback Fetch to Node API
```typescript
// src/app/api/leads-edge/route.ts — APPROVED
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = new URL('/api/leads', baseUrl)
  url.search = request.nextUrl.search

  const response = await fetch(url, {
    headers: { 
      Authorization: request.headers.get('Authorization') ?? '',
      'x-internal-loopback': 'true',
    },
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json(data)
}
```

---

## 9. Schema Migration Checklist & Safety Rules

| Step | Action | Command | Verification |
|---|---|---|---|
| 1 | Check `DIRECT_URL` | Inspect `.env` | Must NOT contain `-pooler` |
| 2 | Create Migration | `npx prisma migrate dev --name <name>` | New SQL file in `prisma/migrations/` |
| 3 | Review SQL | Inspect generated `migration.sql` | Check for unsafe `DROP TABLE` or `ALTER` |
| 4 | Test Locally | `npx prisma migrate reset && npx prisma migrate dev` | Schema sync succeeds |
| 5 | Generate Client | `npx prisma generate` | `@prisma/client` types updated |
| 6 | Staging Deploy | `npx prisma migrate deploy` (staging `DIRECT_URL`) | Staging DB updated |
| 7 | Production Deploy | `npx prisma migrate deploy` (prod `DIRECT_URL`) | Production DB updated |
| 8 | Smoke Test | Test critical endpoints | No DB connection errors in logs |
| 9 | Commit | `git add prisma/migrations/ prisma/schema.prisma` | Migration version-controlled |

### Migration Safety Rules
- **MUST NOT** run `prisma db push` in production (bypasses migration history).
- **MUST NOT** manually edit `migration.sql` after generation without review from `database-reviewer`.
- **MUST** apply migrations via `prisma migrate deploy` in staging and production (`dev` resets the database).
