# Local Development Setup

**Purpose:** Configure local development environment for hub-and-spoke subdomain routing  
**OS:** Windows, macOS, Linux

---

## Overview

The DBSN platform uses a hub-and-spoke architecture with multiple subdomains served from a single Next.js 16 codebase. This document explains how to test subdomain routing locally.

### Subdomain Architecture

| Domain | Purpose | Route |
|--------|---------|-------|
| `sentradaya.com` | Hub — Corporate trust center | `(hub)` |
| `pju.sentradaya.com` | PJU / Street Lighting spoke | `(spokes)/pju` |
| `solarcell.sentradaya.com` | Solar Cell spoke | `(spokes)/solarcell` |
| `alatpetir.sentradaya.com` | Lightning Protection spoke | `(spokes)/alatpetir` |
| `baterai.sentradaya.com` | Battery spoke | `(spokes)/baterai` |
| `dashboard.sentradaya.com` | Client tracking portal | `dashboard/` (flat route) |

---

## Method A: Using lvh.me (Recommended)

**Pros:** No system file modifications, works immediately  
**Cons:** Requires port specification in URL

### How lvh.me Works

The domain `lvh.me` (and all subdomains `*.lvh.me`) resolves to `127.0.0.1` (localhost). This allows you to test subdomain routing without modifying your system's hosts file.

### Access URLs

Replace `:3000` with your dev server port if different:

| Production Domain | Local Access URL |
|------------------|-------------------|
| `sentradaya.com` | `lvh.me:3000` |
| `pju.sentradaya.com` | `pju.lvh.me:3000` |
| `solarcell.sentradaya.com` | `solarcell.lvh.me:3000` |
| `alatpetir.sentradaya.com` | `alatpetir.lvh.me:3000` |
| `baterai.sentradaya.com` | `baterai.lvh.me:3000` |
| `dashboard.sentradaya.com` | `dashboard.lvh.me:3000` |

### Middleware Configuration

The actual middleware at `src/middleware.ts` uses domain-resolution helpers from `src/lib/middleware/config.ts`. You do **not** need to rewrite it — it already supports `lvh.me` local development out of the box.

**Key helpers in `src/lib/middleware/config.ts`:**

| Function | Purpose |
|----------|---------|
| `cleanHostname(host)` | Strips port number from `Host` header |
| `isHubDomain(hostname)` | Returns `true` for root/www domain and `localhost` |
| `isDashboardDomain(hostname)` | Returns `true` when subdomain is `dashboard` |
| `isSpokeDomain(hostname)` | Returns the spoke subdomain string, or `null` |
| `SPOKE_SUBDOMAINS` | `['pju', 'solarcell', 'alatpetir', 'baterai']` |

**Routing outcome:**

```
Request hostname       → Routed to
─────────────────────────────────────────────────────
lvh.me:3000            → (hub) route group  (NextResponse.next)
dashboard.lvh.me:3000  → rewrite /dashboard/*
pju.lvh.me:3000        → rewrite /pju/*  →  (spokes)/pju
solarcell.lvh.me:3000  → rewrite /solarcell/*
unknown hostname       → rewrite /404
```

**Actual matcher configuration** (in `src/middleware.ts`):

```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
```

**Development hostname map** (`src/lib/middleware/dev-hosts.ts`):

```typescript
export const DEV_HOSTNAMES = {
  'lvh.me': '(hub)',
  'www.lvh.me': '(hub)',
  'dashboard.lvh.me': '/dashboard',
  'pju.lvh.me': '(spokes)/pju',
  'solarcell.lvh.me': '(spokes)/solarcell',
  'alatpetir.lvh.me': '(spokes)/alatpetir',
  'baterai.lvh.me': '(spokes)/baterai',
} as const
```

### Cloudflare Pages Preview Domain Support

The middleware also supports Cloudflare Pages preview deployments. Hostnames ending in `.pages.dev` are treated as root domains, enabling full hub-and-spoke testing on preview URLs:

| Preview URL | Routed as |
|-------------|-----------|
| `<branch>.dbsn-website.pages.dev` | Hub |
| `pju.<branch>.dbsn-website.pages.dev` | PJU spoke |
| `dashboard.<branch>.dbsn-website.pages.dev` | Dashboard |

No additional configuration is needed — the middleware detects `.pages.dev` domains automatically.

### Usage

1. Start dev server: `pnpm dev`
2. Navigate to: `http://pju.lvh.me:3000`
3. Verify you see the PJU spoke page

---

## Method B: Hosts File Modification

**Pros:** No port specification needed in URL  
**Cons:** Requires admin privileges, manual cleanup required

### Windows

1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add entries:

```
127.0.0.1 sentradaya.com
127.0.0.1 pju.sentradaya.com
127.0.0.1 solarcell.sentradaya.com
127.0.0.1 alatpetir.sentradaya.com
127.0.0.1 baterai.sentradaya.com
127.0.0.1 dashboard.sentradaya.com
```

4. Save file

### macOS / Linux

1. Edit `/etc/hosts` with sudo:
   ```bash
   sudo nano /etc/hosts
   ```

2. Add entries:
   ```
   127.0.0.1 sentradaya.com
   127.0.0.1 pju.sentradaya.com
   127.0.0.1 solarcell.sentradaya.com
   127.0.0.1 alatpetir.sentradaya.com
   127.0.0.1 baterai.sentradaya.com
   127.0.0.1 dashboard.sentradaya.com
   ```

3. Save (Ctrl+O, Enter, Ctrl+X)

4. Flush DNS cache:
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

### Usage

1. Start dev server: `pnpm dev`
2. Navigate to: `http://pju.sentradaya.com:3000`
3. Verify you see the PJU spoke page

---

## Environment Variables

### Required Variables

Create `.env.local` in project root:

```bash
# Domain
NEXT_PUBLIC_ROOT_DOMAIN="lvh.me"          # Use sentradaya.com in production
NEXT_PUBLIC_SITE_URL="http://lvh.me:3000" # Use https://sentradaya.com in production

# Sanity CMS
SANITY_PROJECT_ID="your-project-id"
SANITY_DATASET="production"
SANITY_API_VERSION="v2025-05-21"
SANITY_API_READ_TOKEN="sk-your-read-token"
SANITY_API_WRITE_TOKEN="sk-your-write-token"   # Optional
SANITY_WEBHOOK_SECRET="your-webhook-secret"     # Optional in dev

# Email (Resend) — Optional in dev
RESEND_API_KEY="re_your-api-key-here"

# Telegram Bot — Optional in dev
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHAT_ID="-1001234567890"

# Analytics — Optional in dev
GA_TRACKING_ID="G-XXXXXXXXXX"
```

### Verification

```bash
# Verify environment variables are loaded
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.NEXT_PUBLIC_ROOT_DOMAIN)"
```

---

## Development Server Configuration

### Port Configuration

Default port is `3000`. To use a different port:

```bash
# Pass port flag directly
pnpm dev -- -p 4000
```

### Available Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server (port 3000) |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Jest unit/integration tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |

### Windows Local Build Requirement (`@cloudflare/next-on-pages`)

When running `pnpm pages:build` to compile edge bundles for Cloudflare Pages:
- `@cloudflare/next-on-pages` CLI v1.13.16 spawns `bash` internally during asset bundling.
- On Windows native PowerShell or CMD without `bash` in system `PATH`, executing `pnpm pages:build` throws `Error: spawn bash ENOENT`.

**Local Development Workarounds for Windows:**
1. Run `pnpm pages:build` inside **Git Bash** or **WSL (Windows Subsystem for Linux)**.
2. Ensure `bash.exe` (from Git for Windows, MSYS2, or WSL) is present in your Windows system `PATH` (e.g. `C:\Program Files\Git\bin`).

**CI Environment Note:**
Cloudflare Pages CI environment runs natively on Linux runners where `bash` is present in `PATH`. Remote CI builds are unaffected.

### Hot Module Replacement

Next.js 16 provides fast HMR. No additional configuration needed.

---

## Troubleshooting

### Subdomain routing not working

1. Verify middleware.ts exists at project root
2. Check hostname extraction:
   ```typescript
   // Add debug logging to middleware.ts
   console.log('Hostname:', hostname);
   ```
3. Ensure matcher configuration includes your routes

### lvh.me not resolving

1. Verify DNS resolution:
   ```bash
   # Windows
   nslookup lvh.me
   nslookup pju.lvh.me
   
   # macOS / Linux
   dig lvh.me
   dig pju.lvh.me
   ```
2. Both should resolve to `127.0.0.1`

### Port already in use

```bash
# Find process using port 3000 (Windows)
netstat -ano | findstr :3000

# Find process using port 3000 (macOS / Linux)
lsof -ti:3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # macOS / Linux
```

### Environment variables not loading

1. Verify `.env.local` file exists
2. Check file encoding (must be UTF-8)
3. Restart dev server after adding variables

---

## Testing Checklist

Before committing code, verify:

- [ ] Hub page loads at `lvh.me:3000`
- [ ] At least one spoke loads at `*.lvh.me:3000`
- [ ] Dashboard routes correctly with authentication
- [ ] Environment variables are properly set
- [ ] No console errors in browser dev tools
- [ ] Network requests resolve correctly

---

## Related Documentation

- [Project Roadmap](../project-roadmap.md) — Phase 2.7 (Subdomain Middleware) status
- [Mocking Specs](../testing/mocking-specs.md) — External service mocking patterns
- [TDD v1](../architecture/tdd-v1.md) — Middleware routing architecture
- [`src/middleware.ts`](../../../src/middleware.ts) — Active edge middleware implementation
- [`src/lib/middleware/config.ts`](../../../src/lib/middleware/config.ts) — Domain resolution helpers
- [`src/lib/middleware/dev-hosts.ts`](../../../src/lib/middleware/dev-hosts.ts) — Development hostname map

---

*Last modified: 2026-05-26*