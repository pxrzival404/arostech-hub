---
id: RUN-DNS-001
title: DNS Cutover Checklist & Target Mapping Matrix
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_ops"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L35"
  deployment_runbook: "file:///d:/dev/arostech-hub/docs/operations/runbooks/deployment.md#L1-L35"
---

# DNS Cutover Checklist & Target Mapping Matrix

> **TL;DR**: Authoritative specification and architectural reference for DNS Cutover Checklist & Target Mapping Matrix within the DBSN platform (docs/operations/runbooks/dns-cutover.md).


> **Authoritative Baseline Reference**: This runbook documents the DNS CNAME record topology, pre-cutover checklist, declarative record schemas, and post-cutover verification procedures for **`dayaberkah.id`** on Cloudflare Pages, adhering strictly to PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L35)).

---

## OpenSpec Delta (M3 / SQ-OPS)

### [ADDED]
- Greenfield CNAME topology mapping all 7 hostnames (`@`, `www`, `dashboard`, `pju`, `solarcell`, `baterai`, `alatpetir`) to `dayaberkah.pages.dev`.
- Declarative Zod schemas (`DNSRecordTopologySchema`, `CutoverVerificationSchema`) for automated DNS validation.
- OpenSpec Behavioral Contracts (`REQ-DNS-001-CNAME-TOPOLOGY`, `REQ-DNS-002-PRE-CUTOVER-VALIDATION`, `REQ-DNS-003-POST-CUTOVER-VERIFICATION`).

### [MODIFIED]
- Standardized edge SSL mode requirement to **Full (strict)** across all custom hostnames.

### [REMOVED]
- Legacy domain pointers, external proxy configs, and outdated 301 engine routing entries.

---

## 1. Overview & Objectives

This document details the exact DNS configuration, target mapping matrix, pre-cutover validation, execution steps, and post-cutover verification procedures for deploying `dayaberkah.id` and all associated product spoke subdomains on 100% Cloudflare Pages hosting.

---

## 2. Target Mapping Matrix & Declarative Schemas

### Requirement: REQ-DNS-001-CNAME-TOPOLOGY
All DNS records MUST be configured within the Cloudflare DNS zone for `dayaberkah.id` as CNAME targets pointing strictly to `dayaberkah.pages.dev` with Orange Cloud proxying enabled (`Proxied`).

#### Scenario: CNAME Record Provisioning
- GIVEN a custom hostname request for any of the 7 canonical hostnames (`@`, `www`, `dashboard`, `pju`, `solarcell`, `baterai`, `alatpetir`)
- WHEN creating the DNS record in Cloudflare DNS
- THEN the record type MUST be CNAME pointing to `dayaberkah.pages.dev` and proxy status MUST be `Proxied`.

### Declarative DNS Topology Schema

```typescript
import { z } from 'zod';

export const DNSRecordTopologySchema = z.object({
  hostname: z.string(),
  recordType: z.enum(['CNAME', 'ALIAS']),
  target: z.literal('dayaberkah.pages.dev'),
  proxied: z.literal(true),
  appRouterMapping: z.string(),
});

export const CutoverVerificationSchema = z.object({
  url: z.string().url(),
  expectedHttpStatus: z.literal(200),
  expectedServerHeader: z.literal('cloudflare'),
  expectedTlsVersion: z.literal('TLSv1.3'),
});

export type DNSRecordTopology = z.infer<typeof DNSRecordTopologySchema>;
export type CutoverVerification = z.infer<typeof CutoverVerificationSchema>;
```

### Greenfield 7-Hostname Mapping Table

| Domain / Subdomain | Host / Record Name | Record Type | Target (Cloudflare Pages) | Proxy Status | App Router Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Apex Domain** | `@` (`dayaberkah.id`) | CNAME (Flattened) / ALIAS | `dayaberkah.pages.dev` | `Proxied` (Orange) | `(hub)` |
| **WWW Subdomain** | `www` | CNAME | `dayaberkah.pages.dev` | `Proxied` (Orange) | `(hub)` alias |
| **Dashboard** | `dashboard` | CNAME | `dayaberkah.pages.dev` | `Proxied` (Orange) | `dashboard/` (flat route) |
| **PJU Spoke** | `pju` | CNAME | `dayaberkah.pages.dev` | `Proxied` (Orange) | `(spokes)/pju` |
| **Solarcell Spoke** | `solarcell` | CNAME | `dayaberkah.pages.dev` | `Proxied` (Orange) | `(spokes)/solarcell` |
| **Baterai Spoke** | `baterai` | CNAME | `dayaberkah.pages.dev` | `Proxied` (Orange) | `(spokes)/baterai` |
| **Alatpetir Spoke** | `alatpetir` | CNAME | `dayaberkah.pages.dev` | `Proxied` (Orange) | `(spokes)/alatpetir` |

---

## 3. Pre-Cutover Checklist

### Requirement: REQ-DNS-002-PRE-CUTOVER-VALIDATION
Before modifying live DNS records, the operations team SHALL verify custom hostname registrations, SSL settings, and Auth.js callback configuration.

#### Scenario: Pre-Cutover Verification
- GIVEN the Cloudflare Pages project `dayaberkah`
- WHEN performing pre-cutover validation
- THEN all 7 custom hostnames MUST be registered in Cloudflare Pages and SSL mode MUST be set to Full (strict).

- [x] **Cloudflare Pages Custom Domains Registration**:
  - Add `dayaberkah.id`, `www.dayaberkah.id`, `dashboard.dayaberkah.id`, `pju.dayaberkah.id`, `solarcell.dayaberkah.id`, `baterai.dayaberkah.id`, and `alatpetir.dayaberkah.id` in Cloudflare Pages project settings (`dayaberkah`).
- [x] **SSL/TLS Encryption Mode**:
  - Set SSL/TLS mode to **Full (strict)** in Cloudflare SSL/TLS settings.
- [x] **Environment Variable Verification**:
  - Verify Cloudflare Pages Environment Variables:
    - `NEXT_PUBLIC_ROOT_DOMAIN` = `dayaberkah.id`
    - `NEXTAUTH_URL` = `https://dayaberkah.id`
- [x] **Auth.js Callback URL Whitelisting**:
  - Confirm OAuth whitelist includes `https://dashboard.dayaberkah.id/api/auth/callback/google` and `https://dayaberkah.id/api/auth/callback/google`.

---

## 4. Cutover Execution Steps

1. **Configure Cloudflare CNAME Records**:
   Create `CNAME` records for `@`, `www`, `dashboard`, `pju`, `solarcell`, `baterai`, `alatpetir` pointing to `dayaberkah.pages.dev`.
2. **Enable Cloudflare Proxying**:
   Ensure the proxy status toggle (Orange Cloud) is **ON** for all records.
3. **Purge Cache**:
   Purge Cloudflare Edge Cache post-deployment.

---

## 5. Post-Cutover Verification Commands

### Requirement: REQ-DNS-003-POST-CUTOVER-VERIFICATION
Post-cutover automated HTTP checks MUST verify HTTP/2 200 response codes and `Server: cloudflare` headers across all 7 hostnames.

#### Scenario: Verification Command Execution
- GIVEN a completed DNS cutover
- WHEN executing HTTP verification requests
- THEN each hostname MUST respond with HTTP 200 and include valid Cloudflare edge headers.

```powershell
# Verify HTTP/2 200 and Server: Cloudflare headers across all 7 hostnames
curl.exe -I https://dayaberkah.id
curl.exe -I https://www.dayaberkah.id
curl.exe -I https://dashboard.dayaberkah.id
curl.exe -I https://pju.dayaberkah.id
curl.exe -I https://solarcell.dayaberkah.id
curl.exe -I https://baterai.dayaberkah.id
curl.exe -I https://alatpetir.dayaberkah.id
```

---

## 6. GRAPHIFY ANCHORING & REFERENCES

- Knowledge Graph Node ID: `doc:docs/operations/runbooks/dns-cutover.md`
- Graphify Community: `community_ops`
- Deployment Protocol: [`deployment.md`](file:///d:/dev/arostech-hub/docs/operations/runbooks/deployment.md#L1-L35)
