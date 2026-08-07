# ADR-0001: Migrate Fully to Cloudflare Pages and Deprecate Vercel

**Date**: 2026-07-20
**Status**: accepted
**Deciders**: User, Antigravity

## Context

The project currently uses Vercel for preview and staging deployments (`dbsn-test01.vercel.app`) and Cloudflare Pages for production deployments (`dayaberkah.id`). Cloudflare is also utilized for DNS and domain management (pointing CNAME records to Vercel).

This dual-provider integration introduces two main issues:
1. High integration overhead: Managing two separate deployment platforms (Vercel and Cloudflare Pages) is redundant and complex.
2. Free tier limitations: The development team experiences frequent errors and build queue blocks on Vercel's free tier due to concurrency and seat limits when pushing commits. Furthermore, Vercel's free tier is strictly for personal, non-commercial use.

## Decision

We will migrate preview and staging deployments entirely to Cloudflare Pages and deprecate the use of Vercel. All hosting, preview URLs, DNS, and routing will be consolidated under Cloudflare.

## Alternatives Considered

### Alternative 1: Upgrade to Vercel Pro (Paid Tier)
- **Pros**: Seamless Next.js deployment experience and fast builds.
- **Cons**: Vercel Pro charges per user ($20/member/month), which adds up quickly for a collaborating team.
- **Why not**: It introduces high recurring costs for temporary staging/preview environments and does not resolve the complexity of managing two distinct providers.

### Alternative 2: Maintain Current Setup (Vercel Free Tier)
- **Pros**: No immediate changes needed to the CI/CD staging configuration.
- **Cons**: Team workflow continues to be disrupted by build queue blocks and errors.
- **Why not**: Directly impacts developer productivity and violates Vercel's terms for commercial/team projects on the free plan.

## Consequences

### Positive
- Unifies hosting, CDN, DNS, SSL, and security (WAF) under a single provider (Cloudflare).
- Resolves build concurrency and team collaboration limits for free on Cloudflare Pages.
- Guarantees staging/production parity by running both on the exact same infrastructure, preventing "works on staging, breaks in production" bugs.
- Keeps git branch preview deployments functional via Cloudflare Pages' native branch previews.

### Negative
- Cloudflare Pages build times might be slightly slower compared to Vercel's optimized builder.
- Limited to 500 builds per month on the free tier (though upgrading to Cloudflare Pages Pro is a flat $20/month per account rather than per user).

### Risks
- Next.js compatibility: Cloudflare Pages compiles Next.js using `@cloudflare/next-on-pages` to run on the Edge Workers runtime, meaning any server-side code must run on the Edge runtime (`const runtime = 'edge'`).
- **Mitigation**: The codebase is already designed and configured for Cloudflare Pages Edge execution, so the risk is extremely low.
