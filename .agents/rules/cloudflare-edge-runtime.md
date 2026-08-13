# Cloudflare Edge Runtime Governance Rule

> **Rule ID**: `RULE-EDGE-001`  
> **Project**: PT Daya Berkah Sentosa Nusantara (DBSN) — `arostech-hub`  
> **Target Scope**: Cloudflare Workers V8 Edge Runtime (`export const runtime = 'edge'`), Next.js Edge Middleware (`src/middleware.ts`), and Edge API Routes.  
> **Owner Agents**: `typescript-reviewer` (type safety & runtime compatibility), `code-reviewer` (pattern enforcement).  
> **Primary Authority**: [ADR-0006](file:///d:/dev/arostech-hub/docs/system/adr/0006-authjs-v5-cloudflare-edge-runtime-split-config.md) & [Coding Standards](file:///d:/dev/arostech-hub/docs/engineering/governance/coding-standards.md)

---

## 1. File-Matcher Scopes

This rule MUST be enforced whenever an AI agent inspects or modifies files matching:

```
src/middleware.ts
src/lib/middleware/**
src/lib/auth/auth.config.ts
src/app/api/auth/[...nextauth]/**
src/lib/utils/pages-host.ts
src/lib/edge/**/*.ts
src/**/*edge*.ts
src/**/*edge*.tsx
```

Any file that is transitively imported by `src/middleware.ts` or declares `export const runtime = 'edge'` is **in-scope** and MUST comply with all constraints in this rule.

---

## 2. Pre-Execution Architectural Vector Analysis

Before modifying any file in the Edge scope, agents MUST evaluate the following 3 vectors:

1. **Vector A — Trade-offs & Isolation Dynamics**:
   - Cloudflare Workers execute inside V8 Isolate environments lacking Node.js OS bindings (`net`, `tls`, `fs`, `child_process`, `crypto` native bindings).
   - Memory is strictly limited to 128 MB per request; streaming responses using Web Streams API (`ReadableStream`) are REQUIRED for payloads larger than 1 MB to prevent heap allocation crashes.
   - Total deployment bundle limit is 25 MB compressed. Node-only native modules must be excluded from Edge entry points.

2. **Vector B — System Invariants & Spec Compliance**:
   - Enforce 100% compliance with ADR-0006 (Option B Split Auth Config): `auth.config.ts` MUST remain Edge-safe (stateless JWT decoding only) and MUST NOT import `@auth/prisma-adapter`, `@prisma/client`, or `bcryptjs`.
   - Middleware subrequests MUST complete within 50 ms CPU time budget.
   - Domain classification interfaces MUST safely parse preview deployment subdomains (`<branch>.dbsn-website.pages.dev` and `?subdomain=preview`).

3. **Vector C — Edge Cases & Verification Strategy**:
   - Edge case: Missing environment variables on preview branches (`NEXTAUTH_SECRET`, `DATABASE_URL`). Fallbacks MUST fail gracefully without unhandled exceptions.
   - Subrequest limit: Workers allow max 50 concurrent subrequests per request. Infinite fetch loops or blocking loopbacks to internal API routes on hot paths are strictly forbidden.

---

## 3. Normative Enforcement Rules (RFC 2119)

1. Files running on Edge Runtime (`runtime = 'edge'` or `src/middleware.ts`) **MUST NOT** import Node.js native modules (`fs`, `path`, `child_process`, `net`, `tls`, `crypto` native C++ bindings, `os`, `buffer`).
2. `src/lib/auth/auth.config.ts` **MUST NOT** eagerly instantiate `PrismaAdapter` or import `bcryptjs`. Authentication routes performing database queries **MUST** declare `export const runtime = 'nodejs'`.
3. Edge Middleware (`src/middleware.ts`) **MUST NOT** issue synchronous loopback `fetch('/api/...')` subrequests to internal API endpoints on hot request paths. All domain rewriting and session verification **MUST** execute statelessly in V8 memory or cache.
4. Production Edge middleware **MUST NOT** execute synchronous `console.log` statements on hot paths; debug logging **MUST** be conditionally guarded by `process.env.NODE_ENV === 'development'`.
5. Domain classification interfaces **MUST** model `'preview'` as a first-class domain class in `CleanDomainClass`.
6. Unmatched routes in Edge middleware **MUST NOT** return bare `new NextResponse(null, { status: 404 })`; they **MUST** rewrite to the styled `/404` route.
7. Response payloads larger than 1 MB **MUST** be returned as a `ReadableStream` rather than buffered in memory.

---

## 4. Cloudflare Workers / Pages Runtime Limits

| Metric / Resource Limit | Cloudflare Pages / Edge Limit | Governance Standard |
|-------------------------|--------------------------------|----------------------|
| **Middleware Subrequest CPU Time** | 50 ms | Maximum 50ms processing per incoming request in `src/middleware.ts` |
| **Worker Subrequest CPU Time** | 30 seconds | Standard Worker execution cap |
| **V8 Isolate Memory Cap** | 128 MB | Payloads >1 MB MUST use streaming Web Streams |
| **Subrequest Limit** | 50 subrequests / request | Prohibit recursive or loopback `fetch()` calls on hot paths |
| **Concurrent Subrequests** | 6 parallel calls | Maximum parallel subrequest fan-out cap |
| **Compressed Worker Bundle** | 25 MB | Exclude Prisma Client, bcrypt, and heavy Node SDKs from Edge |

---

## 5. Explicit Forbidden Anti-Patterns

### ANTI-1: Importing Node.js OS Modules in Edge Files
```typescript
// ❌ FORBIDDEN in src/middleware.ts or files with export const runtime = 'edge'
import { readFileSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

export const runtime = 'edge'

export function middleware(req: NextRequest) {
  const config = JSON.parse(readFileSync(path.join(process.cwd(), 'redirects.json'), 'utf8')) // CRASH: Node API not in V8 Isolate
  return NextResponse.next()
}
```
**Correct Pattern**: Use Web Standards (`fetch`, `Headers`, `Request`, `Response`, `Web Crypto API`) or in-memory static maps.

---

### ANTI-2: Eager Prisma & Bcrypt Imports in Edge Auth Config (ADR-0006 Violation)
```typescript
// ❌ FORBIDDEN in src/lib/auth/auth.config.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'

export const authConfig = {
  adapter: PrismaAdapter(prisma), // CRASH: Prisma socket driver fails in Edge V8 isolate
  providers: [
    Credentials({
      async authorize(c) {
        const ok = await bcrypt.compare(c.password, user.pass) // CRASH: bcrypt native C++ bindings fail
        return ok ? user : null
      }
    })
  ]
}
```
**Correct Pattern**: Split auth configuration per ADR-0006. Use `auth.config.ts` for Edge-safe JWT config and `auth.ts` for Node-runtime handlers.

---

### ANTI-3: Loopback `fetch('/api/redirects/lookup')` in Edge Middleware Hot Path
```typescript
// ❌ FORBIDDEN in src/lib/middleware/redirect-engine.ts
export async function lookupRedirect(pathname: string, spoke: string | null, origin: string): Promise<string | null> {
  const cached = getFromCache(legacyUrl)
  if (cached !== undefined) return cached

  // BLOCKING LOOPBACK FETCH: Adds up to 2000ms latency per request & consumes subrequest quota
  const response = await fetch(new URL('/api/redirects/lookup', origin), { signal: AbortSignal.timeout(2000) })
  const data = await response.json()
  return data.destination ?? null
}
```
**Correct Pattern**: Perform lookup statelessly in memory using compiled static maps or KV edge storage without loopback network fetches.

---

### ANTI-4: `console.log` Output on Middleware Hot Path
```typescript
// ❌ FORBIDDEN in src/middleware.ts
export async function middleware(req: NextRequest) {
  console.log(`[Middleware] Hub domain detected: ${req.nextUrl.pathname}`) // FORBIDDEN: Adds serialization overhead on hot path
  return NextResponse.next()
}
```
**Correct Pattern**: Guard debug logs with environment checks:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.debug('[middleware:hub]', req.nextUrl.pathname)
}
```

---

### ANTI-5: Missing `'preview'` Domain Class in Domain Classification
```typescript
// ❌ FORBIDDEN: Missing preview domain class
type CleanDomainClass = 'hub' | 'dashboard' | 'spoke' | 'unknown'
```
**Correct Pattern**: Explicitly support `'preview'` domain class to handle single-domain preview deployments (`?subdomain=preview` or `*.pages.dev`).

---

### ANTI-6: Bare 404 Response Without Next.js Route Rewrite
```typescript
// ❌ FORBIDDEN in src/middleware.ts
return new NextResponse(null, { status: 404 }) // FORBIDDEN: Renders blank white page to user
```
**Correct Pattern**: Rewrite to the application's styled 404 page:
```typescript
return NextResponse.rewrite(new URL('/404', req.url))
```

---

## 6. Approved Canonical Code Patterns

### APPROVED-1: Edge-Safe Auth Config (ADR-0006 Split Architecture)

**`src/lib/auth/auth.config.ts`** (Edge-safe — importable from middleware):
```typescript
import type { NextAuthConfig } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role: string
    linkedLeadId?: string | null
    trackingScopeIds?: unknown
  }
  interface Session {
    user: {
      role: string
      linkedLeadId?: string | null
      trackingScopeIds?: unknown
    } & import('next-auth').DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    linkedLeadId?: string | null
    trackingScopeIds?: unknown
    issuedAt?: number
  }
}

export const authConfig: NextAuthConfig = {
  providers: [], // Added in Node-runtime auth.ts
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? 'VIEWER'
        token.linkedLeadId = user.linkedLeadId
        token.trackingScopeIds = user.trackingScopeIds
        token.issuedAt = Math.floor(Date.now() / 1000)
      }

      const roleDurations: Record<string, number> = {
        CLIENT: 24 * 60 * 60,
        ADMIN: 8 * 60 * 60,
        VIEWER: 8 * 60 * 60,
      }
      const maxAge = roleDurations[token.role as string] || 24 * 60 * 60
      const now = Math.floor(Date.now() / 1000)
      const issued = (token.issuedAt || token.iat || now) as number

      if (now - issued > maxAge) {
        return null
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.linkedLeadId = token.linkedLeadId as string | null
        session.user.trackingScopeIds = token.trackingScopeIds
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
}
```

**`src/lib/auth/auth.ts`** (Node-runtime only — imported strictly from API route handlers):
```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '../db/prisma'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.passwordHash) return null
        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        return isValid ? { id: user.id, email: user.email, role: user.role } : null
      },
    }),
  ],
  callbacks: authConfig.callbacks,
})
```

---

### APPROVED-2: Cache-Only Redirect Lookup (No Loopback Fetch)
```typescript
// src/lib/middleware/redirect-engine.ts — APPROVED
interface CacheEntry {
  value: string | null
  expiry: number
}

const cache = new Map<string, CacheEntry>()
const MAX_CACHE_SIZE = 500
const CACHE_TTL = 5 * 60 * 1000

let staticRedirects: ReadonlyMap<string, string> = new Map()

export function injectRedirectMap(map: ReadonlyMap<string, string>): void {
  staticRedirects = map
}

function getFromCache(key: string): string | null | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return undefined
  }
  return entry.value
}

function setToCache(key: string, value: string | null): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }
  cache.set(key, { value, expiry: Date.now() + CACHE_TTL })
}

function normalizePath(pathname: string): string {
  if (pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

export function lookupRedirect(
  pathname: string,
  spoke: string | null,
): string | null {
  try {
    const normalizedPath = normalizePath(pathname)
    const legacyUrl = spoke ? `/${spoke}${normalizedPath}` : normalizedPath

    const cached = getFromCache(legacyUrl)
    if (cached !== undefined) return cached

    const staticTarget = staticRedirects.get(legacyUrl)
    const result = staticTarget ?? null

    setToCache(legacyUrl, result)
    return result
  } catch {
    return null
  }
}
```

---

### APPROVED-3: Domain Class with `'preview'` Support
```typescript
// src/lib/middleware/config.ts — APPROVED
export type CleanDomainClass = 'hub' | 'dashboard' | 'spoke' | 'preview' | 'unknown'

export interface DomainResolution {
  domainClass: CleanDomainClass
  spoke: string | null
}

const PREVIEW_SUBDOMAIN = 'preview' as const
const SPOKE_SUBDOMAINS = ['pju', 'solarcell', 'solarpanel', 'alatpetir', 'penangkalpetir', 'baterai'] as const

export function classifyDomain(hostname: string): DomainResolution {
  const rawHost = (hostname || '').split(':')[0].toLowerCase()
  if (!rawHost || rawHost === 'localhost' || rawHost === '127.0.0.1' || rawHost === 'dayaberkah.id' || rawHost === 'www.dayaberkah.id') {
    return { domainClass: 'hub', spoke: null }
  }

  const parts = rawHost.split('.')
  const subdomain = parts.length > 2 ? parts[0] : null

  if (subdomain === PREVIEW_SUBDOMAIN || rawHost.endsWith('.pages.dev')) {
    return { domainClass: 'preview', spoke: null }
  }
  if (subdomain === 'dashboard') {
    return { domainClass: 'dashboard', spoke: null }
  }
  if (subdomain && (SPOKE_SUBDOMAINS as readonly string[]).includes(subdomain)) {
    return { domainClass: 'spoke', spoke: subdomain }
  }

  return { domainClass: 'unknown', spoke: null }
}
```

---

### APPROVED-4: Memory-Efficient Edge Payload Streaming
```typescript
// src/app/api/stream/route.ts — APPROVED
export const runtime = 'edge'

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode('{"status":"streaming","data":['))
      
      for (let i = 0; i < 1000; i++) {
        const chunk = JSON.stringify({ id: i, timestamp: Date.now() }) + (i < 999 ? ',' : '')
        controller.enqueue(encoder.encode(chunk))
      }
      
      controller.enqueue(encoder.encode(']}'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-transform',
    },
  })
}
```

---

## 7. Edge vs Node Runtime Decision Matrix

### When to Use `export const runtime = 'edge'`

| Condition | Runtime | Rationale |
|---|---|---|
| File is `src/middleware.ts` or imported by it | `edge` (implicit) | Next.js middleware ALWAYS runs on Edge |
| Route handler needs geo, IP, or `cf` request metadata | `edge` | `request.cf` object is only available on Edge |
| Route handler performs no DB I/O, no filesystem access, no native modules | `edge` | Lower cold-start latency, globally distributed |
| Lightweight proxy / redirect / rewrite route | `edge` | Sub-millisecond routing decisions at the edge |
| Auth JWT verification only (no DB lookup) | `edge` | Stateless crypto is fast on V8 isolate |

### When to Use `export const runtime = 'nodejs'`

| Condition | Runtime | Rationale |
|---|---|---|
| File imports `prisma`, `PrismaAdapter`, or any Prisma client | `nodejs` | Prisma Client requires Node.js APIs |
| File imports `bcryptjs` or `bcrypt` | `nodejs` | Native crypto bindings require Node runtime |
| File imports `fs`, `path`, `child_process`, or any `node:*` module | `nodejs` | Modules do not exist in V8 isolates |
| File uses `next-auth` with OAuth providers that call DB in callbacks | `nodejs` | ADR-0006: Node-runtime handler for auth routes |
| Heavy JSON schema validation or data transformation | `nodejs` | Avoid CPU budget exhaustion on Edge |

### Runtime Decision Helper

```typescript
type RuntimeTarget = 'edge' | 'nodejs'

interface RuntimeDecision {
  runtime: RuntimeTarget
  reason: string
  nodeOnlyDeps: string[]
}

const NODE_ONLY_PACKAGES: ReadonlySet<string> = new Set([
  '@prisma/client',
  'prisma',
  'bcryptjs',
  'bcrypt',
  '@auth/prisma-adapter',
  'sharp',
  'node-fetch',
])

export function decideRuntime(imports: string[]): RuntimeDecision {
  const nodeOnly = imports.filter((imp) => NODE_ONLY_PACKAGES.has(imp))
  if (nodeOnly.length > 0) {
    return {
      runtime: 'nodejs',
      reason: `Node-only dependencies: ${nodeOnly.join(', ')}`,
      nodeOnlyDeps: nodeOnly,
    }
  }
  return { runtime: 'edge', reason: 'No Node-only dependencies', nodeOnlyDeps: [] }
}
```

### Hard Rules
1. **`src/middleware.ts` MUST NOT** contain any import that resolves to a Node.js-only module at build time.
2. **`src/lib/auth/auth.config.ts` MUST NOT** import `PrismaAdapter`, `prisma`, `bcryptjs`, or any Node-only module per ADR-0006.
3. **Route handlers under `src/app/api/auth/[...nextauth]/` MUST NOT** declare `export const runtime = 'edge'`.
4. **Any new file imported by `src/middleware.ts`** MUST be reviewed for Edge compatibility before merging.
5. **`console.log` MUST NOT** appear in production Edge middleware code.
