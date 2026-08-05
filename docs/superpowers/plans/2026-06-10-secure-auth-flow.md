# Secure Subdomain Authentication Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement robust, JWT-validated authentication and role-based access control (RBAC) in Next.js Middleware across multiple subdomains.

**Architecture:** Wrap the existing middleware with NextAuth v5's `auth()` function. Split the Auth.js configuration into Edge-compatible and full versions to support middleware execution.

**Tech Stack:** Next.js (Edge Runtime), NextAuth v5 (Auth.js), Prisma.

---

### Task 1: Refactor Auth Configuration for Edge Compatibility

**Files:**
- Modify: `src/lib/auth/auth.config.ts`
- Create: `src/lib/auth/auth.ts`

- [ ] **Step 1: Extract Edge-safe configuration**
Modify `src/lib/auth/auth.config.ts` to export only the Edge-safe parts (providers, callbacks that don't use Prisma, etc.).

```typescript
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { Role } from '@prisma/client'

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // This remains here but we must ensure it doesn't import Prisma directly
        // Instead, the authorize logic will be injected or kept simple
        return null 
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isDashboard = nextUrl.hostname.startsWith('dashboard.')
      if (isDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.linkedLeadId = user.linkedLeadId
        token.issuedAt = Math.floor(Date.now() / 1000)
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as Role
        session.user.linkedLeadId = token.linkedLeadId as string | null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig
```

- [ ] **Step 2: Create full Auth configuration**
Create `src/lib/auth/auth.ts` which uses the `authConfig` and adds the Prisma adapter.

```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '../db/prisma'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  // Override authorize to use Prisma
  providers: [
    ...authConfig.providers.filter(p => p.id !== 'credentials'),
    // ... re-implement credentials provider with Prisma access
  ]
})
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/auth/auth.config.ts src/lib/auth/auth.ts
git commit -m "refactor: split auth config for edge compatibility"
```

### Task 2: Secure Middleware Implementation

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Wrap middleware with auth()**
Update `src/middleware.ts` to use the `auth` wrapper and implement RBAC.

```typescript
import { auth } from './lib/auth/auth.config' // Import the edge-safe auth
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const hostname = req.headers.get('host') || ''
  
  // Existing subdomain logic ...
  
  if (isDashboardDomain(hostname)) {
    if (!isLoggedIn && !isPublicRoute(nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    
    // RBAC check
    if (isLoggedIn && req.auth?.user.role === 'CLIENT') {
       // Additional CLIENT specific checks
    }
  }
  
  // ... rest of implementation
})
```

- [ ] **Step 2: Commit**
```bash
git add src/middleware.ts
git commit -m "feat: implement secure auth flow in middleware"
```

### Task 3: Verification and Testing

**Files:**
- Create: `src/__tests__/middleware.test.ts`

- [ ] **Step 1: Write middleware tests**
Create tests to verify that:
1. Unauthenticated requests to dashboard are redirected.
2. Authenticated requests with correct roles are allowed.
3. Subdomain rewriting still works.

- [ ] **Step 2: Run tests**
```bash
pnpm test src/__tests__/middleware.test.ts
```

- [ ] **Step 3: Commit**
```bash
git add src/__tests__/middleware.test.ts
git commit -m "test: verify secure middleware routing"
```
