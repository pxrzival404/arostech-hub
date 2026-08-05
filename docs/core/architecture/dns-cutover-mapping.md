# DNS Cutover Checklist & Target Mapping Matrix

**Document Version:** 1.0.0  
**Effective Date:** 2026-07-22  
**Target Platform:** Cloudflare Pages (`dbsn-website.pages.dev`)  
**Legacy Platform:** Vercel (`cname.vercel-dns.com` / `76.76.21.21`)  

---

## 1. Overview & Objectives

This document details the exact DNS configuration, target mapping matrix, pre-cutover validation, execution steps, and post-cutover verification procedures for migrating `dayaberkah.id` and all associated subdomains from Vercel to 100% Cloudflare Pages hosting.

---

## 2. Target Mapping Matrix

All DNS records are managed within the Cloudflare DNS zone for `dayaberkah.id`. Proxy status (Orange Cloud) must be enabled (`Proxied`) for all web records to ensure DDoS protection, WAF rules, edge caching, and automatic SSL/TLS certificate management.

| Domain / Subdomain | Host / Record Name | Record Type | Legacy Target (`cname.vercel-dns.com`) | New Target (Cloudflare Pages) | Proxy Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Apex Domain** | `@` (`dayaberkah.id`) | CNAME (Flattened) / ALIAS | `76.76.21.21` / `cname.vercel-dns.com` | `dbsn-website.pages.dev` | `Proxied` (Orange) | Main Hub website landing page |
| **WWW Subdomain** | `www` | CNAME | `cname.vercel-dns.com` | `dbsn-website.pages.dev` | `Proxied` (Orange) | Canonical www redirect / alias |
| **Dashboard** | `dashboard` | CNAME | `cname.vercel-dns.com` | `dbsn-website.pages.dev` | `Proxied` (Orange) | Admin portal & user login (`/(dashboard)`) |
| **PJU Spoke** | `pju` | CNAME | `cname.vercel-dns.com` | `dbsn-website.pages.dev` | `Proxied` (Orange) | Penerangan Jalan Umum product line (`/(spokes)`) |
| **Solarcell Spoke** | `solarcell` | CNAME | `cname.vercel-dns.com` | `dbsn-website.pages.dev` | `Proxied` (Orange) | Solar Panel & Energy product line (`/(spokes)`) |
| **Baterai Spoke** | `baterai` | CNAME | `cname.vercel-dns.com` | `dbsn-website.pages.dev` | `Proxied` (Orange) | Industrial Battery product line (`/(spokes)`) |
| **Alatpetir Spoke** | `alatpetir` | CNAME | `cname.vercel-dns.com` | `dbsn-website.pages.dev` | `Proxied` (Orange) | Lightning Protection product line (`/(spokes)`) |

---

## 3. Pre-Cutover Checklist

Before modifying live DNS records, complete the following prerequisites:

- [ ] **Cloudflare Pages Custom Domains Registration**:
  - Add `dayaberkah.id`, `www.dayaberkah.id`, `dashboard.dayaberkah.id`, `pju.dayaberkah.id`, `solarcell.dayaberkah.id`, `baterai.dayaberkah.id`, and `alatpetir.dayaberkah.id` in Cloudflare Pages project settings (`dbsn-website`).
- [ ] **SSL/TLS Encryption Mode**:
  - Set SSL/TLS mode to **Full (strict)** in Cloudflare SSL/TLS settings.
- [ ] **Environment Variable Verification**:
  - Verify Cloudflare Pages Environment Variables:
    - `NEXT_PUBLIC_ROOT_DOMAIN` = `dayaberkah.id`
    - `NEXT_PUBLIC_SITE_URL` = `https://dayaberkah.id`
    - `NEXTAUTH_URL` = `https://dayaberkah.id`
- [ ] **OAuth Callback URL Whitelisting**:
  - Confirm Google OAuth & Third-party providers whitelist callback URLs for `https://dashboard.dayaberkah.id/api/auth/callback/google` and `https://dayaberkah.id/api/auth/callback/google`.

---

## 4. Cutover Execution Steps

1. **Delete Legacy Vercel DNS Records**:
   Remove existing `A` record pointing to `76.76.21.21` or `CNAME` records pointing to `cname.vercel-dns.com`.
2. **Add Cloudflare Pages CNAME Records**:
   Create `CNAME` records for `@`, `www`, `dashboard`, `pju`, `solarcell`, `baterai`, `alatpetir` pointing to `dbsn-website.pages.dev`.
3. **Enable Cloudflare Proxying**:
   Ensure the proxy status toggle (Orange Cloud) is **ON** for all 7 records.
4. **Purge Cache**:
   Purge Cloudflare Edge Cache and Next.js ISR cache post-deployment.

---

## 5. Post-Cutover Verification Commands

Run the following commands in PowerShell or Bash to independently verify DNS propagation and Cloudflare Edge header responses.

### A. HTTP Header Verification (`Server: Cloudflare` & `cf-ray`)

```powershell
# 1. Apex Domain Verification
curl.exe -I https://dayaberkah.id

# Expected Output Headers:
# HTTP/2 200
# server: cloudflare
# cf-ray: <ray-id>-<location>
# content-type: text/html; charset=utf-8

# 2. Subdomain Verification
curl.exe -I https://dashboard.dayaberkah.id
curl.exe -I https://pju.dayaberkah.id
curl.exe -I https://solarcell.dayaberkah.id
curl.exe -I https://baterai.dayaberkah.id
curl.exe -I https://alatpetir.dayaberkah.id
```

### B. DNS Resolution Verification

```powershell
# Check DNS A/AAAA resolution for apex and subdomains
Resolve-DnsName -Name dayaberkah.id -Type A
Resolve-DnsName -Name dashboard.dayaberkah.id -Type CNAME
Resolve-DnsName -Name pju.dayaberkah.id -Type CNAME
```

### C. Automated Header Verification Script

```powershell
$domains = @(
    "https://dayaberkah.id",
    "https://www.dayaberkah.id",
    "https://dashboard.dayaberkah.id",
    "https://pju.dayaberkah.id",
    "https://solarcell.dayaberkah.id",
    "https://baterai.dayaberkah.id",
    "https://alatpetir.dayaberkah.id"
)

foreach ($url in $domains) {
    try {
        $res = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing
        $serverHeader = $res.Headers["Server"]
        $cfrayHeader = $res.Headers["cf-ray"]
        Write-Host "[$url] Status: $($res.StatusCode) | Server: $serverHeader | CF-Ray: $cfrayHeader"
    } catch {
        Write-Host "[$url] Error: $_"
    }
}
```
