# Developer Fix Guide — Pre-Fix Manual Tasks
> Date: 2026-07-14
> Prerequisite for: Fix Agent Prompt (docs/audits/integration-health-audit-2026-07-14.md)
> Estimated developer time: ~30 minutes

## How This Works

1. You (developer) complete ALL tasks below
2. Run: `I have completed all manual tasks, please verify`
3. Agent verifies each checkpoint automatically
4. If all pass → you paste the Fix Agent Prompt
5. If any fail → agent tells you exactly what's missing

---

## Task 1: Sanity Studio Authentication (for SAN-001)

The Fix Agent will create 3 new schemas + update existing ones in code, but Sanity Studio needs to be deployed to the cloud for editors to use them.

**What to do:**
1. Open terminal in project root
2. Run: `cd studio && npx sanity login`
3. Authenticate via browser when prompted
4. DO NOT deploy yet — the Fix Agent will create the schema files first

**After Fix Agent completes Phase 1:**
5. Run: `cd studio && npx sanity deploy`
6. Verify at: https://dayaberkah.sanity.studio/

**Checkpoint:** Agent will verify schema count via Sanity MCP `get_schema` tool

---

## Task 2: Cloudflare Secrets Setup (for CF-001)

The Fix Agent will update `wrangler.toml` with public vars, but secrets must be set by you in the Cloudflare Dashboard.

**What to do:**
1. Login to Cloudflare Dashboard: https://dash.cloudflare.com
2. Navigate to: Pages > `dbsn-website` > Settings > Environment variables
3. Add these **Production** secrets (copy values from your `.env.local` or password manager):

| Secret Name | Where to Find Value |
|-------------|-------------------|
| DATABASE_URL | Neon Console > Connection String |
| NEXTAUTH_SECRET | Generate: `openssl rand -base64 32` |
| SANITY_API_READ_TOKEN | Sanity Dashboard > API > Tokens > Add Read Token |
| SANITY_API_WRITE_TOKEN | Sanity Dashboard > API > Tokens > Add Write Token |
| SANITY_WEBHOOK_SECRET | Generate: `openssl rand -hex 32` (save for Task 4) |
| RESEND_API_KEY | Resend Dashboard > API Keys |
| TELEGRAM_BOT_TOKEN | @BotFather on Telegram |
| TELEGRAM_CHAT_ID | Your existing chat ID from .env.local |
| GOOGLE_CLIENT_ID | Google Cloud Console (see Task 3) |
| GOOGLE_CLIENT_SECRET | Google Cloud Console (see Task 3) |
| SENTRY_AUTH_TOKEN | Sentry > Settings > Auth Tokens > Create |
| GSC_SERVICE_ACCOUNT_JSON | Google Cloud Console > Service Accounts |
| API_KEY_21ST | 21st.dev Dashboard > API Keys |

**Also update your local `.env.local`** with the same values so the Fix Agent can verify connectivity during local builds.

**Checkpoint:** Agent will run `pnpm build` and check that env validation passes for all schemas

---

## Task 3: Google OAuth Callback URLs (for CF-002, CF-009)

**What to do:**
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Select your OAuth 2.0 Client ID
3. Add these Authorized Redirect URIs:
   - `https://dayaberkah.id/api/auth/callback/google`
   - `https://dashboard.dayaberkah.id/api/auth/callback/google`
   - `http://lvh.me:3000/api/auth/callback/google` (dev — should already exist)
4. Save

**Checkpoint:** Agent will verify by checking `GOOGLE_CLIENT_ID` is set in env

---

## Task 4: Sanity Webhook Configuration (for SAN-005, SAN-006)

**What to do:**
1. Go to Sanity Dashboard > API > Webhooks
2. Create or update webhook:
   - **Name:** `ISR Cache Revalidation`
   - **URL:** `https://dayaberkah.id/api/revalidate` (production)
   - **Trigger on:** Create, Update, Delete
   - **Filter:** Leave empty (all document types)
   - **Secret:** Paste the value you generated in Task 2 (`SANITY_WEBHOOK_SECRET`)
   - **Projection:** `{_id, _type, "subdomain": spoke->subdomain}`
3. Also add staging webhook if needed:
   - **URL:** `https://<branch>.dbsn-website.pages.dev/api/revalidate`
   - Use the same secret from your Cloudflare Pages env vars

**Checkpoint:** Agent will verify webhook secret is set in env and revalidate route handles the payload shape

---

## Task 5: Cloudflare Pages Git Integration (for CF-004)

**What to do:**
1. Go to Cloudflare Dashboard > Pages > Create a project (or reconfigure `dbsn-website`)
2. Connect to GitHub repository: `pampam666/dbsnweb-vbeta`
3. Build settings:
   - **Build command:** `pnpm pages:build`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** `/`
   - **Environment variables:** Set `NODE_VERSION=22` and `PNPM_VERSION=10`
4. Do NOT trigger first deploy yet — wait for Fix Agent to complete

**Checkpoint:** Agent will verify `.github/workflows/cloudflare-pages.yml` exists (created by Fix Agent)

---

## Task 6: DNS CNAME Records (for CF-012)

> ⚠️ Do this LAST, only after Fix Agent has completed ALL phases and you've verified staging works.

**What to do:**
1. Go to your DNS Manager (Cloudflare DNS or registrar)
2. Create CNAME records:

| Hostname | Type | Target |
|----------|------|--------|
| `@` (dayaberkah.id) | CNAME | `dbsn-website.pages.dev` |
| `www` | CNAME | `dbsn-website.pages.dev` |
| `pju` | CNAME | `dbsn-website.pages.dev` |
| `solarcell` | CNAME | `dbsn-website.pages.dev` |
| `alatpetir` | CNAME | `dbsn-website.pages.dev` |
| `baterai` | CNAME | `dbsn-website.pages.dev` |
| `dashboard` | CNAME | `dbsn-website.pages.dev` |

**Checkpoint:** Agent cannot verify DNS (external) — you must confirm: "DNS records are configured"

---

## Summary Checklist

Before triggering agent verification, confirm:

- [ ] Task 1: `npx sanity login` completed (deploy AFTER Fix Agent Phase 1)
- [ ] Task 2: All 13 Cloudflare secrets set in Dashboard + `.env.local` updated
- [ ] Task 3: Google OAuth callback URLs added for production domain
- [ ] Task 4: Sanity webhook configured with secret and subdomain projection
- [ ] Task 5: Cloudflare Pages connected to GitHub repo
- [ ] Task 6: DNS — SKIP for now (do after all fixes are complete)

When ready, type: **"I have completed all manual tasks, please verify"**
