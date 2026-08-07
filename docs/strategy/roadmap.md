# DBSN Project Roadmap

**Version:** 1.0
**Last Updated:** 2026-06-04
**Status:** Phase 3 - Infrastructure (Complete)

---

## Overview

This roadmap tracks the implementation of the DBSN Centralized Digital Ecosystem — a hub-and-spoke architecture consolidating three legacy WordPress domains into a single Next.js 16 codebase.

### Architecture Summary

- **Hub:** `dayaberkah.id` — Corporate trust center
- **Spokes:** `pju.dayaberkah.id`, `solarcell.dayaberkah.id`, `alatpetir.dayaberkah.id`, `baterai.dayaberkah.id`
- **Dashboard:** `dashboard.dayaberkah.id` — Client tracking portal
- **Tech Stack:** Next.js 16, Sanity.io, Neon Postgres + Prisma, Auth.js v5, Cloudflare Pages (`@cloudflare/next-on-pages`)

---

<!-- AUTO-GENERATED START -->
## Deployment Phase Status

- **Current Platform**: 100% Cloudflare Pages (`dayaberkah.id` & `<branch>.dbsn-website.pages.dev`)
- **Status**: Production & Staging Consolidated on Cloudflare Pages per ADR-0001
<!-- AUTO-GENERATED END -->

---

## Phase 1: Foundation (COMPLETED)

### Status: ✅ COMPLETE

### Objectives

Establish the project foundation with Next.js 16, TypeScript, and shared design system.

### Tasks

| Task | Status | Date Completed |
|------|--------|----------------|
| Initialize Next.js 16 with TypeScript | ✅ | 2026-05-13 |
| Configure pnpm package manager | ✅ | 2026-05-13 |
| Set up Tailwind CSS 4 + design tokens | ✅ | 2026-05-13 |
| Configure Radix UI + shadcn/ui patterns | ✅ | 2026-05-13 |
| Set up Prisma ORM configuration | ✅ | 2026-05-13 |
| Configure Jest testing framework | ✅ | 2026-05-13 |
| Environment variables structure | ✅ | 2026-05-13 |

### Success Criteria

- ✅ Next.js app runs locally on `pnpm dev`
- ✅ Tailwind CSS configured with DBSN design tokens
- ✅ Jest runs with 80% coverage threshold
- ✅ TypeScript strict mode enabled

---

## Phase 2: Core Features (COMPLETE)

### Status: ✅ 100% COMPLETE (7/7 tasks)

### Objectives

Build hub pages, spoke pages, RFQ forms, and authentication system.

### Tasks

| Task | Status | Owner | Date |
|------|--------|-------|------|
| 2.1 Route Groups Structure | ✅ | ECC | 2026-05-19 |
| 2.2 Shared UI Components | ✅ | ECC | 2026-05-19 |
| 2.3 Hub Pages | ✅ | ECC | 2026-05-19 |
| 2.4 Spoke Pages | ✅ | ECC | 2026-05-19 |
| 2.5 RFQ Forms (B2G/B2B) | ✅ | ECC | 2026-06-03 |
| 2.6 Sanity CMS Integration | ✅ | ECC | 2026-05-21 |
| 2.7 Subdomain Middleware | ✅ | ECC | 2026-05-22 |

### Phase 2.5: Segmented RFQ Forms (COMPLETE)

**Description:** Implement B2G and B2B RFQ forms with proper validation and submission handling.

**Tasks:**
- ✅ Create B2G form component with government-specific fields
- ✅ Create B2B form component with private sector fields
- ✅ Implement Zod validation schemas
- ✅ Add WhatsApp fallback engine
- ✅ Create `/api/rfq` endpoint
- ✅ Implement source attribution tracking

**Success Criteria:**
- ✅ Forms validate input with clear error messages
- ✅ RFQ submissions persist to Neon Postgres
- ✅ Resend acknowledgment email sent on success
- ✅ Telegram alert triggered on submission
- ✅ WhatsApp fallback activates on API failure

**Blocked By:** None (Phase 2.7 is complete)

### Phase 2.6: Sanity CMS Integration (COMPLETE)

**Description:** Set up Sanity.io for content federation across hub and spokes.

**Note:** Review: REQUEST CHANGES — bugfixes pending (see `.claude/reviews/sanity-cms-review.md`, untracked in `docs/` — verify path locally)

**Tasks:**
- ✅ Configure Sanity client
- ✅ Define content schemas (Product, Certification, PortfolioEntry, SpokeConfig)
- ✅ Implement GROQ query utilities
- ✅ Set up webhook-based cache invalidation
- ✅ Connect spoke pages to CMS data

**Success Criteria:**
- Product data fetches from Sanity
- Certification documents accessible
- Portfolio entries display correctly
- Webhook invalidates cache on content changes

### Phase 2.7: Subdomain Middleware (COMPLETE)

**Description:** Implement middleware-based routing for hub, spokes, and dashboard.

**Note:** Review: APPROVED — 155/155 tests passing (see `.claude/reviews/subdomain-middleware-review.md`, untracked in `docs/` — verify path locally)

**Tasks:**
- ✅ Create `middleware.ts` file
- ✅ Implement hostname-based routing logic
- ✅ Add subdomain-to-route-group mapping
- ✅ Configure local subdomain testing (lvh.me)
- ✅ Add authentication guards for dashboard

**Code Reference (Expected):**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] || '';

  if (hostname === 'dayaberkah.id') {
    return NextResponse.rewrite(new URL('/', request.url));
  }

  if (hostname === 'pju.dayaberkah.id') {
    return NextResponse.rewrite(new URL('/(spokes)/pju', request.url));
  }

  if (hostname === 'dashboard.dayaberkah.id') {
    return NextResponse.rewrite(new URL('/(dashboard)', request.url));
  }

  return NextResponse.next();
}
```

**Success Criteria:**
- Hub routes correctly via `dayaberkah.id`
- Spokes route correctly via their subdomains
- Dashboard routes correctly via `dashboard.dayaberkah.id`
- Local testing works with `lvh.me`

---

## Phase 3: Infrastructure (COMPLETE)

### Phase Status: ✅ COMPLETE

### Objectives

Set up deployment infrastructure, integrations, and SEO migration engine.

### Tasks

| Task | Status | Owner | Date |
|------|--------|-------|------|
| 3.1 Notification Queue Implementation | ✅ | ECC | 2026-06-03 |
| 3.2 Cloudflare Pages Deployment | ✅ | ECC | 2026-06-04 |
| 3.3 301 Redirect Engine | ✅ | ECC | 2026-06-04 |
| 3.4 SEO Migration | ✅ | ECC | 2026-06-04 |
| 3.5 GA4 Event Tracking | ✅ | ECC | 2026-06-04 |
| 3.6 GSC Verification | ✅ | ECC | 2026-06-04 |

### Success Criteria

- [x] Cloudflare Pages deploys successfully
- [x] Legacy URLs 301 redirect to new architecture
- [x] Zero 404s for indexed legacy URLs during migration
- [x] GA4 events fire for RFQ submissions, WhatsApp clicks, file downloads

---

## Phase 4: Quality Gates (NOT STARTED)

### Status: ⏸️ NOT STARTED

### Objectives

Performance optimization, security hardening, testing coverage, and production readiness.

### Tasks

| Task | Status | Target |
|------|--------|--------|
| 4.1 PSI 90+ Optimization | ⏳ TODO | Mobile PSI ≥ 90 |
| 4.2 Security Hardening | ⏳ TODO | CSP, HSTS, input validation |
| 4.3 Test Coverage 80%+ | ⏳ TODO | Unit, Integration, E2E |
| 4.4 RFQ Fallback Testing | ⏳ TODO | Forced failure test |
| 4.5 Dashboard Access Testing | ⏳ TODO | Data isolation verification |
| 4.6 Production Deployment | ⏳ TODO | Go/no-go approval |

### Success Criteria

- PSI mobile score 90+ on all key templates
- 80%+ code coverage with passing tests
- Security scan passes with no critical findings
- RFQ fallback validated under forced failure
- Dashboard data isolation confirmed

---

## Launch Gate Checklist

### Pre-Launch Requirements

- [ ] All Phase 1-4 tasks complete
- [ ] PSI mobile score 90+ on all key pages
- [ ] 80%+ test coverage passing
- [ ] Security audit passed
- [ ] SEO migration mapping complete
- [ ] 301 redirect engine tested
- [ ] RFQ fallback forced-failure test passed
- [ ] Dashboard access provisioning tested
- [ ] Stakeholder presentation delivered
- [ ] Go/no-go approval from leadership

### Rollback Conditions

Trigger rollback if any of the following occur:
- Production uptime < 99.5% for 1 hour
- >20% of requests return 404 errors
- Critical failure in RFQ pipeline > 1 hour
- Security incident confirmed
- Performance degradation > 50%

---

## Glossary

| Term | Definition |
|------|------------|
| **Hub** | Root domain `dayaberkah.id` — corporate trust center |
| **Spoke** | Product subdomains (`pju.*`, `solarcell.*`, etc.) |
| **B2G** | Business-to-Government segment (procurement officers, PPK, BUMN) |
| **B2B** | Business-to-Business segment (private sector buyers) |
| **RFQ** | Request for Quotation — segmented form for lead capture |
| **PSI** | PageSpeed Insights — Google's performance measurement tool |

---

## Related Documentation

- [PRD v3.1](prd.md) — Business requirements and user journeys
- [TDD v1](../engineering/playbooks/testing/strategy.md) — Technical design and implementation
- [AGENTS.md](../../AGENTS.md) — Project context, rules, and architecture
- [Quickstart Setup](../engineering/playbooks/quickstart.md) — Development environment configuration
- [Mocking Specs](../engineering/playbooks/testing/mocking-specs.md) — Testing patterns for external services

---

*Last modified: 2026-08-06*