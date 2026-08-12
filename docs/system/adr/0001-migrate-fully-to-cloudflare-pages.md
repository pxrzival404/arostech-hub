---
id: ADR-0001
title: "ADR-0001: Migrate Fully to Cloudflare Pages Infrastructure"
version: 4.0.0
status: ACCEPTED
target_domain: dayaberkah.id
graphify_community: "community_adr"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100"
  overview: "file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L28-L38"
---

# ADR-0001: Migrate Fully to Cloudflare Pages Infrastructure

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Baseline Sync`  
> **Authoritative Baseline Reference**: Architectural Decision Record governing the consolidation of preview, staging, and production hosting environments onto **Cloudflare Pages**, synchronized with PRD v4.0.0 ([`overview.md`](file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L28-L38)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/adr/0001-migrate-fully-to-cloudflare-pages.md`

---

## OpenSpec Delta

- `MODIFIED`: Consolidated hosting baseline to Cloudflare Pages for all application branches and preview environments.
- `REMOVED`: Deprecated third-party serverless hosting platforms.

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-ADR-0001 Single Hosting Provider Consolidation
The DBSN Centralized Digital Ecosystem MUST deploy exclusively onto Cloudflare Pages infrastructure. All HTTP traffic, edge middleware execution, preview environments, and custom subdomain DNS routing SHALL be managed under Cloudflare.

#### Scenario: Production Deployment Pipeline
- GIVEN a commit merged into main branch
- WHEN Cloudflare CI builds the project via `@cloudflare/next-on-pages`
- THEN the system SHALL deploy static and serverless edge functions directly to Cloudflare Pages
- AND production domain `dayaberkah.id` MUST be updated automatically.

---

## 2. Context & Decision Drivers

Prior infrastructure setups split preview, staging, and production environments across multiple deployment vendors. This dual-provider integration introduced two major issues:
1. High integration overhead: Managing two separate deployment platforms introduced redundant configuration friction.
2. Free tier limitations: External platforms suffered from build queue blocks and strict seat concurrency limits for collaborating team members.

---

## 3. Decision & Technical Architecture

We SHALL consolidate preview, staging, and production hosting entirely onto **Cloudflare Pages**. All hosting, preview URLs, DNS management, and WAF rules are unified under Cloudflare.

```typescript
export interface CloudflarePagesDeploymentConfig {
  projectName: "dayaberkah";
  buildOutputDirectory: ".vercel/output/static";
  nodeVersion: "20.x";
  framework: "nextjs-pages";
  edgeRuntimeEnabled: true;
}
```

---

## 4. Alternatives Considered

### Alternative 1: Upgrade Third-Party Host to Enterprise Tier
- **Pros**: Dedicated build resources.
- **Cons**: Per-seat recurring team pricing adds high financial overhead without resolving multi-provider management complexity.
- **Why not**: Cloudflare Pages provides unlimited team seats and native Edge integration for flat cost.

### Alternative 2: Maintain Split Staging and Production Hosts
- **Pros**: No immediate CI workflow changes needed.
- **Cons**: Causes parity discrepancies ("works on staging, breaks in production").
- **Why not**: Violates environmental parity standards and disrupts developer productivity.

---

## 5. Consequences & Risk Mitigation

### Positive
- Unifies hosting, CDN, DNS, SSL, and security (WAF) under a single cloud infrastructure provider.
- Resolves build concurrency and team collaboration limits.
- Guarantees staging/production environment parity by running all builds on the exact same Edge runtime.

### Negative & Risks
- Edge runtime constraints: All Next.js server-side code MUST run on the Edge Workers runtime (`export const runtime = "edge"`).
- **Mitigation**: Base code architecture, Prisma Neon proxy connection, and Auth.js v5 are fully configured for Edge compatibility.
