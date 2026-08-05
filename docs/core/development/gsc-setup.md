# Google Search Console (GSC) Setup & Verification Guide

This guide details the Google Search Console (GSC) configuration, property structure, verification processes, and sitemap submission automation for the DBSN central digital ecosystem (`sentradaya.com` and its spoke subdomains).

---

## 1. Property Structure

For maximum coverage and granular reporting, we configure a hybrid GSC property structure.

### A. Domain Property (Recommended Primary)
- **Target**: `sentradaya.com` (covers `https://sentradaya.com`, `https://pju.sentradaya.com`, `https://solarcell.sentradaya.com`, `https://alatpetir.sentradaya.com`, `https://baterai.sentradaya.com`, `https://dashboard.sentradaya.com` under all HTTP/HTTPS protocols).
- **Verification Method**: DNS TXT Record.
- **Why**: Captures domain-wide aggregate statistics, handles all paths/subdomains, and persists across protocol transitions.

### B. URL-Prefix Properties (Granular Secondary)
If individual teams or managers require access to specific subdomains or isolated settings, individual URL-prefix properties should be added:
- `https://sentradaya.com/` (Hub)
- `https://pju.sentradaya.com/` (PJU Spoke)
- `https://solarcell.sentradaya.com/` (Solarcell Spoke)
- `https://alatpetir.sentradaya.com/` (Alat Petir Spoke)
- `https://baterai.sentradaya.com/` (Baterai Spoke)
- `https://dashboard.sentradaya.com/` (Client Portal)
- **Verification Methods**: HTML File, Meta Verification Tag, or DNS TXT.

---

## 2. Verification Workflows

The application supports three verification mechanisms.

### A. DNS TXT Verification (Domain Property)
1. Add the domain property `sentradaya.com` in Google Search Console.
2. Copy the generated verification code (e.g. `google-site-verification=xxxxxxxxx`).
3. Log in to the Cloudflare Dashboard and navigate to the DNS Zone editor for `sentradaya.com`.
4. Create a new DNS record:
   - **Type**: `TXT`
   - **Name**: `@` (representing the root domain `sentradaya.com`)
   - **Content**: The token value copied from GSC.
   - **TTL**: `Auto` or `3600`.
5. Once DNS propagates, click **Verify** in the GSC dashboard.

### B. GSC HTML File Verification (URL-Prefix fallback)
The platform features an automated file builder wired into `next.config.ts`.
1. Set the env variable `GSC_VERIFICATION_CODE` to your GSC HTML token (e.g., `google123456789.html` or just the code `123456789`).
2. Run `pnpm build` or `pnpm dev`.
3. The server automatically generates `public/google{code}.html` containing the verification text.
4. When deployed to Cloudflare Pages, this file is statically served at `/google{code}.html` for verification.

### C. Fallback Meta HTML Tag
1. Set the environment variable `NEXT_PUBLIC_GSC_VERIFICATION` to the verification token content.
2. The root layout automatically injects `<meta name="google-site-verification" content="..." />` into the page `<head>`.

---

## 3. Programmatic Sitemap Submission

We have an operational Node.js script located at `scripts/gsc-submit-sitemap.ts` to submit sitemaps programmatically. This utility executes off-runtime (never during user requests).

### A. Prerequisites
1. Create a Google Cloud Platform (GCP) project.
2. Enable the **Google Search Console API** (Webmasters API).
3. Create a **Service Account** under **IAM & Admin > Service Accounts**.
4. Generate and download a **JSON Private Key** for the service account.
5. In Google Search Console, navigate to **Settings > Users and permissions** for the properties you want to submit sitemaps to.
6. Add the service account's client email (e.g., `service-account@project.iam.gserviceaccount.com`) as a user with **Full** or **Owner** permission.

### B. Execution

Ensure you set the `GSC_SERVICE_ACCOUNT_JSON` environment variable containing the single-line string representation of your service account JSON file.

#### Dry-Run Mode (Safe)
Test the script and verify API target endpoints without sending real requests:
```bash
# Run dry run directly
pnpm exec tsx scripts/gsc-submit-sitemap.ts --dry-run
```

#### Production Run (Live)
Run the script to authenticate and submit sitemaps for all properties:
```bash
# Execute sitemap submission
GSC_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' pnpm exec tsx scripts/gsc-submit-sitemap.ts
```

---

## 4. Post-Migration Indexing Monitoring Checklist

Use this checklist inside the Google Search Console UI to monitor the consolidation from WordPress to the centralized Next.js architecture:

- [ ] **Inspect Redirect Mappings**: Verify that old URLs are returning 301 redirects and are registered under **Pages > Redirects** in GSC.
- [ ] **Check Crawl Rate**: Monitor **Settings > Crawl stats** for any spikes in 404s, 500s, or DNS connection timeouts.
- [ ] **Analyze Sitemap Coverage**: Confirm all submitted sitemaps are marked as **Success** and track the count of discovered pages.
- [ ] **URL Inspection**: Test key landing and product pages using the **URL Inspection** tool to verify rendering, mobile usability, and correct canonical tagging (`https://sentradaya.com/...` or spoke equivalents).
- [ ] **Search Performance**: Compare pre- and post-migration impressions and CTR under **Performance** to ensure organic keywords match the consolidated architecture.
- [ ] **Core Web Vitals**: Monitor mobile page performance. High-speed edge rendering on Cloudflare Pages should help achieve green scores (LCP, FID/INP, CLS).
