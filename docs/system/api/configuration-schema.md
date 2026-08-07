# Environment Variables & Configuration Schema Reference

This reference documents all environment variables used by the **DBSN Centralized Digital Ecosystem**, including data types, default values, optionality, and secret binding rules on Cloudflare Pages.

---

## Environment Variable Reference Matrix

| Variable Name | Description | Data Type | Required? | Default Value | Binding Location |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `DATABASE_URL` | Neon Postgres pooled connection string | `string` | **Yes** | — | `.env.local` / Cloudflare Secret |
| `DIRECT_URL` | Neon Postgres direct non-pooled string | `string` | **Yes** | — | `.env.local` / Cloudflare Secret |
| `NEXTAUTH_SECRET` | Secret key for Auth.js session JWT encrypt | `string` | **Yes** | — | Cloudflare Secret (min 32 chars) |
| `NEXTAUTH_URL` | Canonical app URL | `string` | **Yes** | `http://lvh.me:3000` | `.env.local` |
| `SANITY_PROJECT_ID` | Sanity Studio Project ID | `string` | **Yes** | — | `.env.local` / Pages Env |
| `SANITY_DATASET` | Sanity Studio Dataset name | `string` | **Yes** | `production` | `.env.local` / Pages Env |
| `SANITY_API_READ_TOKEN` | Sanity API token for preview reads | `string` | **Yes** | — | Cloudflare Secret |
| `SANITY_WRITE_TOKEN` | Sanity API token for mutation webhooks | `string` | Optional | — | Cloudflare Secret |
| `RESEND_API_KEY` | Resend transactional email API key | `string` | **Yes** | — | Cloudflare Secret |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot token for RFQ alerts | `string` | **Yes** | — | Cloudflare Secret |
| `TELEGRAM_CHAT_ID` | Telegram Chat ID for issue reporting | `string` | **Yes** | — | Cloudflare Secret |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for Auth.js | `string` | Optional | — | Cloudflare Secret |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `string` | Optional | — | Cloudflare Secret |
| `CRON_SECRET` | Auth bearer token for cron jobs | `string` | Optional | — | Cloudflare Secret |

---

## Local Development vs Cloudflare Pages Secrets

### Local Setup (`.env.local` & `.dev.vars`)
- Next.js server-side build reads `.env.local`.
- `wrangler pages dev` local edge preview reads simulated secrets from `.dev.vars`.

### Production Binding via Wrangler CLI
Upload production environment secrets to Cloudflare Pages:

```bash
npx wrangler pages secret put DATABASE_URL
npx wrangler pages secret put NEXTAUTH_SECRET
npx wrangler pages secret put RESEND_API_KEY
npx wrangler pages secret put TELEGRAM_BOT_TOKEN
npx wrangler pages secret put TELEGRAM_CHAT_ID
```
