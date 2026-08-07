# Backend Codemap

<!-- Generated: 2026-07-22 | Files scanned: 12 API routes | Token estimate: ~850 -->

## API Routes

```
POST/GET  /api/revalidate          → route.ts → verify webhook secret → revalidateTag()
POST      /api/rfq                 → route.ts → parse & validate B2B/B2G Zod schemas → prisma.lead.create → fire-and-forget notifications
GET       /api/rfq                 → route.ts → JSON healthcheck response
GET/POST  /api/auth/[...nextauth]  → route.ts → handlers mapping to NextAuth.js v5
POST      /api/auth/forgot-password → route.ts → password reset request initiation
POST      /api/auth/reset-password  → route.ts → password reset completion
GET/POST  /api/admin/redirects     → route.ts → admin redirect map management (CRUD + hit tracking)
GET       /api/redirects/lookup      → route.ts → lightweight redirect lookup (middleware loopback)
POST      /api/an-token             → route.ts → 21st SDK agent chat token handler
POST      /api/cron/notifications   → route.ts → notification queue processor (cron endpoint)
```

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/api/revalidate/route.ts` | Sanity webhook ISR revalidation | ~120 |
| `src/app/api/revalidate/__tests__/route.test.ts` | Route tests | ~250 |
| `src/app/api/rfq/route.ts` | B2B & B2G RFQ form ingestion handler & healthcheck | 173 |
| `src/app/api/rfq/__tests__/route.test.ts` | Infrastructure failure, validation & success tests | ~310 |
| `src/app/api/auth/[...nextauth]/route.ts` | Route handlers integration wrapper for NextAuth.js | 3 |

## Middleware Chain (Active)

```
Request → src/middleware.ts (Edge Runtime)
  │
  ├─ Short-circuit: /api/*, /_next/*, /*.ext  → NextResponse.next()
  │
  ├─ cleanHostname(host)   → strips port number
  ├─ isDashboardDomain()   → extractSubdomain() === 'dashboard'
  ├─ isSpokeDomain()       → subdomain in SPOKE_SUBDOMAINS
  │
  ├─ isHubDomain()         → rewrite: x-middleware-subdomain: 'hub'
  ├─ isDashboardDomain()   → session check (next-auth cookie) 
  │                          ├── authenticated   → rewrite: /dashboard{pathname}
  │                          └── unauthenticated → redirect: /login
  ├─ isSpokeDomain(spoke)  → rewrite: /{spoke}{pathname}
  └─ unknown               → rewrite: /404
```

## Middleware Config (`src/lib/middleware/config.ts`)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `cleanHostname` | `(host) → string` | Strip port from hostname |
| `isLocalDevelopment` | `(hostname) → boolean` | Detect lvh.me local dev |
| `extractSubdomain` | `(hostname) → string \| null` | Extract subdomain relative to ROOT_DOMAIN |
| `isHubDomain` | `(hostname) → boolean` | Match root / www domain |
| `isDashboardDomain` | `(hostname) → boolean` | Match dashboard subdomain |
| `isSpokeDomain` | `(hostname) → string \| null` | Match pju/solarcell/alatpetir/baterai |

```
SPOKE_SUBDOMAINS = ['pju', 'solarcell', 'alatpetir', 'baterai']
```

## Environment Config (`src/lib/config/env.ts`)

| Schema | Variables | Validator |
|--------|-----------|-----------|
| `sanityEnvSchema` | SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION, SANITY_API_READ_TOKEN, SANITY_API_WRITE_TOKEN, SANITY_WEBHOOK_SECRET | `validateSanityEnv()` / `getSanityEnv()` |
| `middlewareEnvSchema` | NEXT_PUBLIC_ROOT_DOMAIN, NEXT_PUBLIC_SITE_URL | `validateMiddlewareEnv()` / `getMiddlewareEnv()` |
| `databaseEnvSchema` | DATABASE_URL | `validateDatabaseEnv()` / `getDatabaseEnv()` |
| `authEnvSchema` | NEXTAUTH_SECRET, NEXTAUTH_URL | `validateAuthEnv()` / `getAuthEnv()` |
| `notificationEnvSchema` | RESEND_API_KEY, RESEND_FROM_EMAIL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, WHATSAPP_SALES_NUMBER | `validateNotificationEnv()` / `getNotificationEnv()` |

## Sanity Revalidation Flow

```
Sanity Webhook → POST /api/revalidate
  → verify SANITY_WEBHOOK_SECRET
  → revalidateTag('sanity:*')
  → ISR pages refresh
```

## Authentication & Authorization Layer

### Config & Flow (`src/lib/auth/auth.config.ts`)
- **Strategy**: JWT-based session token storage.
- **Provider**: Credentials provider with custom `authorize(credentials)` hook that validates database user status and matches standard credentials.
- **Role-based Session Max Age**: Evaluated inside `jwt()` callback dynamically:
  - `CLIENT` role: 24 hours.
  - `ADMIN` & `VIEWER` roles: 8 hours.
  - Expired tokens automatically yield `null` to prompt re-login.
- **Sign In Verification**: Custom `signIn()` callback forces strict database access checking. If the signing-in user has the `CLIENT` role, they must have a valid `linkedLeadId` pointing to a Lead with `dashboardAccessStatus === 'GRANTED'`.

### Server Guards (`src/lib/auth/auth-guard.ts`)
- `getServerSession()`: Wrapper to fetch current server-side NextAuth session.
- `checkDashboardAccess(email)`: Queries the Postgres database to verify user status and ensure client access is explicitly provisioned (`dashboardAccessStatus === 'GRANTED'`).
- `requireAuth(requiredRole?)`: Guard for pages/routes. Redirects to `/login` if unauthenticated or if a specific role check fails.
- `requireDashboardAccess()`: Guard verifying session status and querying `checkDashboardAccess` dynamically. Redirects to `/login` if not active.

## Notification Services Layer

### Resend Email (`src/lib/api/notifications/resend.ts`)
- `sendRfqAcknowledgment(lead)`: Dispatches customer ACK email containing Segment, Product Category list, and Total Quantity.
- `sendInternalNotification(lead)`: Routes detailed internal email with lead context (Scope, Timeline, Contact Details) to the admin/sales address.

### Telegram Webhooks (`src/lib/api/notifications/telegram.ts`)
- Non-blocking alerts using the native `fetch` API.
- `alertNewRfq(lead)`: Formats and pushes successful RFQ ingestion data to the Telegram channel.
- `alertRfqFailure(error, payload)`: Alerts the development/infrastructure channel of ingestion failure with error messages and the raw payload.

### WhatsApp Fallback Prefills (`src/lib/api/notifications/whatsapp.ts`)
- `buildWhatsAppFallbackUrl(formData)`: Encodes all RFQ form fields into a custom WA chat prefilled link (`https://wa.me/{phone}?text={encodedText}`) to allow manual submission on API failure.

## Planned (Phase 3)

```
GET  /api/tracking/:id     → Auth guard → Prisma Row Access Scope
```