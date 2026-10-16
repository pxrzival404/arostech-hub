---
id: ADR-0007
title: "ADR-0007: Adopt OpenNext Cloudflare Adapter (@opennextjs/cloudflare)"
version: 4.0.0
status: ACCEPTED
target_domain: dayaberkah.id
graphify_community: "community_adr"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L110-L125"
  overview: "file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L30-L40"
  adr_0001: "file:///d:/dev/arostech-hub/docs/system/adr/superseded/0001-migrate-fully-to-cloudflare-pages.md#L1-L50"
  adr_0002: "file:///d:/dev/arostech-hub/docs/system/adr/superseded/0002-explicit-cloudflare-pages-deploy-command.md#L1-L50"
  adr_0006: "file:///d:/dev/arostech-hub/docs/system/adr/0006-authjs-v5-cloudflare-edge-runtime-split-config.md#L1-L50"
---

# ADR-0007: Adopt OpenNext Cloudflare Adapter (`@opennextjs/cloudflare`)

> **TL;DR**: Authoritative specification and architectural reference for ADR-0007: Adopt OpenNext Cloudflare Adapter (`@opennextjs/cloudflare`) within the DBSN platform (docs/system/adr/0007-adopt-opennext-cloudflare-adapter.md).


> **OpenSpec SDD Lifecycle Mapping**: `ADDED: 2026-08-13 OpenNext Cloudflare Adapter Migration`  
> **Authoritative Baseline Reference**: Architectural Decision Record governing the adoption of `@opennextjs/cloudflare` as the canonical build and deployment adapter for Next.js 16 App Router on Cloudflare Pages, superseding the output directory and deploy command specifications of [`ADR-0001`](file:///d:/dev/arostech-hub/docs/system/adr/superseded/0001-migrate-fully-to-cloudflare-pages.md#L1-L50) and [`ADR-0002`](file:///d:/dev/arostech-hub/docs/system/adr/superseded/0002-explicit-cloudflare-pages-deploy-command.md#L1-L50).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/adr/0007-adopt-opennext-cloudflare-adapter.md`

---

## OpenSpec Delta

- `ADDED`: Established `@opennextjs/cloudflare` as the build output bundler, targeting `.open-next/assets` and `.open-next/worker.js`.
- `ADDED`: Created `open-next.config.ts` using `defineCloudflareConfig()` for declarative adapter caching and binding configurations.
- `SUPERSEDED`: Superseded `.vercel/output/static` build output target from [`ADR-0001`](file:///d:/dev/arostech-hub/docs/system/adr/superseded/0001-migrate-fully-to-cloudflare-pages.md#L54-L61) and explicit deployment script parameters from [`ADR-0002`](file:///d:/dev/arostech-hub/docs/system/adr/superseded/0002-explicit-cloudflare-pages-deploy-command.md#L48-L67).

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-ADR-0007 OpenNext Cloudflare Build & Deploy Standardization
The deployment pipeline MUST build the Next.js application using `@opennextjs/cloudflare` and output deployable assets to `.open-next/assets`. All local preview and production deployments SHALL execute `opennextjs-cloudflare` CLI tools or Wrangler deployment targeting `.open-next/assets`.

#### Scenario: Production Deployment via OpenNext CLI
- GIVEN a verified Next.js 16 App Router codebase with `open-next.config.ts`
- WHEN the build runner executes `pnpm pages:build` (`npx opennextjs-cloudflare build`)
- THEN the system SHALL compile edge Worker artifacts under `.open-next/`
- AND `npx opennextjs-cloudflare deploy` SHALL deploy assets to Cloudflare Pages project `dayaberkah`.

---

## 2. Context & Multi-Dimensional Decision Rationale

Legacy configurations relied on `@cloudflare/next-on-pages` which produced build artifacts under `.vercel/output/static` (the proprietary Next.js Build Output API v3 specification). This introduced an architectural paradox in a Cloudflare-only ecosystem.

We adopt `@opennextjs/cloudflare` based on **5 core rationale dimensions**:

1. **Elimination of Vendor Coupling**: OpenNext outputs directly to `.open-next/assets` and `.open-next/worker.js`, completely purging Vercel-specific `.vercel/output` references from the build pipeline.
2. **Official Cloudflare Strategic Endorsement**: Cloudflare documentation officially establishes `@opennextjs/cloudflare` as the primary, GA-bound adapter for Next.js 14/15/16 App Router on Cloudflare Workers and Pages.
3. **Comprehensive Next.js App Router Compatibility**: Native support for React Server Components (RSC), Server Actions, Static Site Generation (SSG), Server-Side Rendering (SSR), Incremental Static Regeneration (`revalidateTag` / `revalidatePath`), and Response streaming.
4. **Declarative Configuration Architecture**: Introduces `open-next.config.ts` via `defineCloudflareConfig()` for adapter-level caching (Cloudflare KV/R2) and environment binding declarations.
5. **Native Standardized CLI Suite**: Replaces brittle custom wrapper scripts with native `opennextjs-cloudflare build`, `opennextjs-cloudflare preview`, and `opennextjs-cloudflare deploy`.

---

## 3. Declarative Architecture Schemas & Config

### OpenNext Configuration Schema (`open-next.config.ts`)

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Declarative Cloudflare OpenNext bindings and cache overrides
});
```

### Deploy Command Zod Schema

```typescript
import { z } from "zod";

export const OpenNextDeployConfigSchema = z.object({
  adapterPackage: z.literal("@opennextjs/cloudflare"),
  configFile: z.literal("open-next.config.ts"),
  buildOutputDir: z.literal(".open-next/assets"),
  buildCommand: z.literal("npx opennextjs-cloudflare build"),
  deployCommand: z.literal("npx opennextjs-cloudflare deploy"),
});

export type OpenNextDeployConfig = z.infer<typeof OpenNextDeployConfigSchema>;
```

---

## 4. Alternatives Considered

### Alternative 1: Retain `@cloudflare/next-on-pages`
- **Pros**: Zero initial documentation update required.
- **Cons**: Locked to legacy Vercel `.vercel/output/static` spec; lacks active feature additions for Next.js 16 App Router APIs.
- **Why not**: Violates architectural cleanliness and restricts Next.js 16 feature adoption.

### Alternative 2: Direct Static Export (`next export` / `output: 'export'`)
- **Pros**: Simple static asset output under `./out`.
- **Cons**: Completely removes Server-Side Rendering (SSR), Server Actions, and Auth.js v5 Edge Middleware session security.
- **Why not**: Breaks core business requirements for dynamic RFQ handling and client portal authentication.

---

## 5. Consequences & Trade-offs

### Positive
- Unified, non-vendor-coupled build output structure under `.open-next/`.
- Full compatibility with Next.js 16 App Router, React 19 RSC, and ISR tag revalidation.
- Native CLI workflow (`opennextjs-cloudflare build` / `deploy`).

### Negative & Mitigations
- Package dependency update required in `package.json` (`devDependencies`: `@opennextjs/cloudflare`).
- **Mitigation**: Update all agent rules (`cloudflare-pages-deploy.md`, `monorepo-workspace.md`) to mandate OpenNext CLI commands.
