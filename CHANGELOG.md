# Changelog

All notable changes to the **DBSN Centralized Digital Ecosystem** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Comprehensive repository documentation restructuring adhering to 7-pillar framework.
- Created `SECURITY.md`, `LICENSE`, `CONTRIBUTING.md`, and `CHANGELOG.md` at root.
- Minimal Working Example (MWE) guides for adding product spokes and API endpoints.

---

## [1.0.0] - 2026-07-25

### Added
- Consolidated 3 legacy WordPress domains into Next.js 16 App Router on Cloudflare Pages.
- Edge Subdomain Middleware routing for `dayaberkah.id`, `pju`, `solarcell`, `alatpetir`, `baterai`, and `dashboard`.
- Headless CMS integration using Sanity Studio with ISR revalidation.
- Neon Serverless Postgres integration via Prisma ORM for B2B/B2G client tracking.
- Auth.js v5 JWT edge authentication layer.
- Double-channel RFQ notification engine (Resend email + Telegram bot failover).
