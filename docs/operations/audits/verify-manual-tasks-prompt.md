# Verification Prompt — Manual Tasks Checkpoint

> **Usage:** Copy everything between the `---` markers below and paste it into the Claude Code CLI session where you completed the manual tasks.

---

I have completed all manual tasks from `docs/audits/developer-fix-guide.md`. Please verify each checkpoint below and report pass/fail status. Do NOT modify any files — this is a read-only verification.

## Verification Checklist

Execute the following 6 checks in order. For each, report PASS or FAIL with evidence.

### Check 1: `.env.local` Secrets Populated

Read the `.env.local` file (or `.env` if `.env.local` doesn't exist) and verify ALL of the following env vars are present and NOT placeholder values (placeholders include: `your_*`, `placeholder`, `xxx`, `re_your_*`, empty string, or `[your-*]`):

Required secrets:
- `DATABASE_URL` (must start with `postgresql://`)
- `NEXTAUTH_SECRET` (must be >=32 characters)
- `SANITY_API_READ_TOKEN` (must start with `sk`)
- `SANITY_API_WRITE_TOKEN` (must start with `sk`)
- `SANITY_WEBHOOK_SECRET` (must be non-empty)
- `RESEND_API_KEY` (must start with `re_`)
- `TELEGRAM_BOT_TOKEN` (must match `^\d+:[A-Za-z0-9_-]+$`)
- `TELEGRAM_CHAT_ID` (must be non-empty)
- `GOOGLE_CLIENT_ID` (must end with `.apps.googleusercontent.com`)
- `GOOGLE_CLIENT_SECRET` (must start with `GOCSPX-`)
- `SENTRY_AUTH_TOKEN` (must be non-empty)
- `GSC_SERVICE_ACCOUNT_JSON` (must be valid JSON containing `private_key`)
- `API_KEY_21ST` (must start with `21st_`)

Also verify these public vars are set:
- `NEXT_PUBLIC_ROOT_DOMAIN` (should be `dayaberkah.id` for prod or `lvh.me` for dev)
- `NEXTAUTH_URL` (should be a valid URL)
- `SANITY_PROJECT_ID` (should be `3h4k8dye`)
- `SANITY_DATASET` (should be `production`)

**Report format:** List each var as PASS or FAIL with the first 4 characters of the value (for verification without leaking the full secret). If any are placeholders, state which placeholder pattern was detected.

### Check 2: `pnpm build` Env Validation Passes

Run `pnpm build` and verify:
- Exit code is 0
- No `Sanity environment validation failed` errors
- No `Middleware environment validation failed` errors
- No `Auth environment validation failed` errors
- No `Database environment validation failed` errors
- No `Notification environment validation failed` errors
- No `21st SDK environment validation failed` errors

If the build fails due to env validation, report which schema failed and which env vars are missing/invalid.

If the build fails for OTHER reasons (e.g., TypeScript errors, missing modules), note that the env validation PASSED but the build has unrelated issues — this is expected since the Fix Agent hasn't run yet.

**Report format:** `PASS Env validation passed (build exit code: X)` or `FAIL Env validation failed: [schema name] — missing: [var names]`

### Check 3: Sanity MCP Schema Accessibility

Use the Sanity MCP `get_schema` tool (or `list_workspace_schemas`) with:
- `projectId`: `3h4k8dye`
- `dataset`: `production`

Verify:
- The tool returns successfully (no auth errors)
- The response includes the 3 existing schema types: `spokeConfig`, `product`, `portfolioEntry`
- Note: The 3 new schemas (`certification`, `page`, `article`) will NOT exist yet — this is expected before the Fix Agent runs

**Report format:** `PASS Sanity project accessible — found N schema types: [list]` or `FAIL Sanity access failed: [error message]`

### Check 4: `wrangler.toml` Configuration

Read `wrangler.toml` and verify:
- `NEXTAUTH_URL` is NOT `https://dashboard.dayaberkah.id` (should be `https://dayaberkah.id` after Fix Agent runs — but BEFORE Fix Agent, this check is informational only)
- `SANITY_API_VERSION` — record current value (should be aligned to `v2025-05-21` after Fix Agent)
- `NEXT_PUBLIC_ROOT_DOMAIN` is `dayaberkah.id`

**IMPORTANT:** This check has two modes:
- **Before Fix Agent:** Just record the current values — do NOT fail this check. The Fix Agent will update these.
- **After Fix Agent:** Verify `NEXTAUTH_URL = "https://dayaberkah.id"` and `SANITY_API_VERSION = "v2025-05-21"`.

Since the Fix Agent has NOT run yet, just report the current values and mark as INFO (not pass/fail).

**Report format:** `INFO wrangler.toml current values: NEXTAUTH_URL=[value], SANITY_API_VERSION=[value], NEXT_PUBLIC_ROOT_DOMAIN=[value] — Fix Agent will update these`

### Check 5: Cloudflare Pages Workflow File

Check if `.github/workflows/cloudflare-pages.yml` exists.

- If it does NOT exist: This is EXPECTED before the Fix Agent runs. Mark as INFO.
- If it DOES exist: The Fix Agent has already run. Verify it contains `pnpm pages:build` and targets a Linux runner (`runs-on: ubuntu-latest` or similar).

**Report format:** `INFO .github/workflows/cloudflare-pages.yml not found yet — Fix Agent will create it` OR `PASS Workflow file exists — Linux runner: [yes/no], build command: [value]`

### Check 6: Developer Confirmation

Ask the developer to confirm (do not verify programmatically):
- Task 1 (Sanity login): "Did you run `npx sanity login` and authenticate?"
- Task 3 (Google OAuth): "Did you add the 3 redirect URIs in Google Cloud Console?"
- Task 4 (Sanity webhook): "Did you configure the webhook with the secret and subdomain projection?"
- Task 5 (Cloudflare Pages): "Did you connect the GitHub repo to Cloudflare Pages?"
- Task 6 (DNS): Skip — confirmed to be done later.

Wait for the developer's yes/no response for each.

---

## Final Output

After all 6 checks, print a summary table:

```
| Check | Status | Notes |
|-------|--------|-------|
| 1. .env.local secrets | PASS/FAIL | [count] / 13 secrets populated |
| 2. Build env validation | PASS/FAIL/INFO | [result] |
| 3. Sanity MCP access | PASS/FAIL | [schema count] |
| 4. wrangler.toml | INFO | [current values] |
| 5. CF workflow file | INFO | [exists/not yet] |
| 6. Developer confirm | PASS/FAIL | [task results] |
```

### If ALL checks pass (Checks 1, 2, 3, 6 = PASS; Checks 4, 5 = INFO):

Print exactly:
```
All manual tasks verified. You may now paste the Fix Agent Prompt from docs/audits/integration-health-audit-2026-07-14.md
```

### If ANY check fails:

Print exactly (for each failure):
```
FAIL Check [N] failed: [check name]

What's missing:
- [specific item 1]
- [specific item 2]

What to do:
- [actionable instruction referencing the task in developer-fix-guide.md]
```

Do NOT proceed to the Fix Agent prompt until all actionable checks pass.

---
