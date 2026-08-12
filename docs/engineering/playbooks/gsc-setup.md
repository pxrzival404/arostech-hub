---
id: DOC-ENG-PLAY-GSC
title: Google Search Console Setup, Verification & Indexing Playbook
version: 4.0.0
status: LOCKED_BASELINE
graphify_community: "community_playbooks"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100"
  seo_strategy: "file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/strategy.md#L148-L175"
---

# Google Search Console Setup, Verification & Indexing Playbook

> **Authoritative Baseline Reference**: Configuration, property structure, verification processes, and sitemap submission automation for Google Search Console (GSC) on the **DBSN Centralized Digital Ecosystem** (`dayaberkah.id` and its spoke subdomains), fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100)).

---

## 1. Property Structure

For maximum coverage and granular reporting, we configure a hybrid GSC property structure.

### A. Domain Property (Primary)
- **Target**: `dayaberkah.id` (covers `https://dayaberkah.id`, `https://pju.dayaberkah.id`, `https://solarcell.dayaberkah.id`, `https://alatpetir.dayaberkah.id`, `https://baterai.dayaberkah.id`).
- **Verification Method**: DNS TXT Record.
- **Why**: Captures domain-wide aggregate statistics, handles all paths/subdomains, and persists across protocol transitions.

### B. URL-Prefix Properties (Granular Secondary)
Granular URL-prefix properties SHOULD be added for isolated subdomain monitoring:
- `https://dayaberkah.id/` (Hub)
- `https://pju.dayaberkah.id/` (PJU Spoke)
- `https://solarcell.dayaberkah.id/` (Solar Cell Spoke)
- `https://alatpetir.dayaberkah.id/` (Alat Petir Spoke)
- `https://baterai.dayaberkah.id/` (Baterai Spoke)

> **Private Client Portal Note**: `https://dashboard.dayaberkah.id/` MUST NOT be submitted for public indexing. The client tracking portal SHALL set `<meta name="robots" content="noindex, nofollow" />` headers across all dashboard routes to block search engine indexing.

---

## 2. Verification Workflows

The application supports three verification mechanisms:

### A. DNS TXT Verification (Domain Property)
1. Add domain property `dayaberkah.id` in Google Search Console.
2. Copy generated verification token (e.g. `google-site-verification=xxxxxxxxx`).
3. Log in to Cloudflare Dashboard and navigate to DNS Zone editor for `dayaberkah.id`.
4. Create TXT record:
   - **Type**: `TXT`
   - **Name**: `@` (root domain `dayaberkah.id`)
   - **Content**: Verification token.
   - **TTL**: `Auto` or `3600`.
5. Once DNS propagates, click **Verify** in GSC dashboard.

### B. GSC HTML File Verification (URL-Prefix Fallback)
1. Set environment variable `GSC_VERIFICATION_CODE` to your token code.
2. The build process automatically outputs `public/google{code}.html`.
3. When deployed to Cloudflare Pages, this file is statically served at `/google{code}.html` for verification.

### C. Fallback Meta HTML Tag
1. Set environment variable `NEXT_PUBLIC_GSC_VERIFICATION` to verification token.
2. Root layout automatically injects `<meta name="google-site-verification" content="..." />` into page `<head>`.

---

## 3. Programmatic Sitemap Submission

Sitemap submission is automated via `scripts/gsc-submit-sitemap.ts` (executed off-runtime):

```bash
# Dry-run test mode
pnpm exec tsx scripts/gsc-submit-sitemap.ts --dry-run

# Production execution
GSC_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' pnpm exec tsx scripts/gsc-submit-sitemap.ts
```

---

## 4. Post-Deployment Indexing Monitoring Checklist

Use this checklist inside Google Search Console UI to monitor organic index health:

- [ ] **Clean Subdomain Routing**: Verify that all product spokes serve clean canonical URLs (`https://pju.dayaberkah.id/...`, `https://solarcell.dayaberkah.id/...`) with zero 301 redirect map rot.
- [ ] **Dashboard Index Exclusion**: Confirm `https://dashboard.dayaberkah.id/` pages return `noindex, nofollow` headers and are excluded from GSC index reports.
- [ ] **Crawl Rate Stability**: Monitor **Settings > Crawl stats** for 404/500 errors or DNS timeouts.
- [ ] **Sitemap Coverage**: Confirm submitted `sitemap.xml` files are marked **Success** across all public subdomains.
- [ ] **Canonical Tag Verification**: Inspect key landing and product pages using **URL Inspection** tool to verify clean canonical tags (`https://dayaberkah.id/...` or spoke equivalents).
- [ ] **Core Web Vitals**: Monitor mobile performance scores to ensure green thresholds (LCP < 2.5s, INP < 200ms, CLS < 0.1).

---

## 5. OpenSpec Behavioral Requirements

### Requirement: REQ-ENG-GSC-001-INDEX-CONTROL
The system SHALL expose XML sitemaps for public hubs and spokes while enforcing strict `noindex` headers on the client tracking portal (`dashboard.dayaberkah.id`).

#### Scenario: Indexing Verification
- GIVEN a search engine crawler requesting pages across subdomains
- WHEN requesting public spoke pages vs private dashboard pages
- THEN public spoke pages SHALL render valid canonical tags and XML sitemap inclusion, while dashboard pages MUST return `<meta name="robots" content="noindex, nofollow" />`.

---

## 6. OpenSpec Delta

## ADDED Requirements
- REQ-ENG-GSC-001-INDEX-CONTROL: Explicit `dashboard.dayaberkah.id` noindex enforcement and sitemap verification contract.

## MODIFIED Requirements
- Purged legacy 301 redirect map monitoring guidelines in favor of clean subdomain routing verification.

## REMOVED Requirements
- Legacy 301 redirect mapping checklists.

---

## 7. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/engineering/playbooks/gsc-setup.md`
- Graphify Community: `community_playbooks`
- Master Reference: [`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100)
