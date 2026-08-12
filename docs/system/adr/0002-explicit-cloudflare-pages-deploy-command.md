---
id: ADR-0002
title: "ADR-0002: Explicit Cloudflare Pages Deploy Target in Monorepo Workspace"
version: 4.0.0
status: ACCEPTED
target_domain: dayaberkah.id
graphify_community: "community_adr"
authoritative_references:
  adr_0001: "file:///d:/dev/arostech-hub/docs/system/adr/0001-migrate-fully-to-cloudflare-pages.md#L1-L50"
  config_schema: "file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md#L1-L50"
---

# ADR-0002: Explicit Cloudflare Pages Deploy Target in Monorepo Workspace

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Baseline Sync`  
> **Authoritative Baseline Reference**: Architectural Decision Record establishing explicit build target paths for Cloudflare Pages deployment scripts in the monorepo workspace, adhering to PRD v4.0.0 ([`adr_0001`](file:///d:/dev/arostech-hub/docs/system/adr/0001-migrate-fully-to-cloudflare-pages.md#L1-L50)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/adr/0002-explicit-cloudflare-pages-deploy-command.md`

---

## OpenSpec Delta

- `MODIFIED`: Enforced explicit project target parameters in `pages:deploy` package scripts to prevent CLI framework ambiguity errors.

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-ADR-0002 Explicit Deploy Script Parameters
All CI build scripts and deployment commands MUST explicitly specify the target static asset directory (`.vercel/output/static`) and Cloudflare Pages project name (`dayaberkah`). CI runners SHALL NOT invoke bare `wrangler deploy` without explicit positional directory parameters.

#### Scenario: Multi-Package Workspace CI Build
- GIVEN a pnpm workspace containing root Next.js app and `studio/` package
- WHEN the CI build script executes `pnpm pages:deploy`
- THEN Wrangler MUST receive explicit target path `.vercel/output/static` and `--project-name dayaberkah`
- AND the deployment SHALL complete cleanly without framework auto-detection errors.

---

## 2. Context & Problem Statement

During Cloudflare CI deployments, builds executed in multi-package repositories can fail during automatic framework detection if Wrangler discovers multiple package frameworks (such as root Next.js and subpackage Sanity Studio). Executing an unguided `wrangler deploy` from the root directory causes CLI ambiguity errors.

---

## 3. Decision & Declarative Command Schema

We SHALL explicitly target the static build output directory (`.vercel/output/static`) produced by `@cloudflare/next-on-pages` and specify `--project-name dayaberkah` in all deployment invocations:

```typescript
import { z } from "zod";

export const DeployCommandConfigSchema = z.object({
  targetDirectory: z.literal(".vercel/output/static"),
  projectName: z.literal("dayaberkah"),
  command: z.literal("npx wrangler pages deploy .vercel/output/static --project-name dayaberkah"),
});

export type DeployCommandConfig = z.infer<typeof DeployCommandConfigSchema>;
```

Command invocation:
```bash
npx wrangler pages deploy .vercel/output/static --project-name dayaberkah
```

> **Note**: `.vercel/output/static` is the standard build output directory generated locally by `@cloudflare/next-on-pages` (using Next.js Build Output API v3 spec). It is deployed directly to **Cloudflare Pages** edge infrastructure.

---

## 4. Alternatives Considered

### Alternative 1: Shell `cd` into Subfolder Prior to Deploy
- **Pros**: Keeps deployment parameters implicit.
- **Cons**: Breaks monorepo relative paths and adds brittle shell scripting step.
- **Why not**: Explicit CLI parameters are cleaner, deterministic, and self-documenting.

### Alternative 2: Separate `studio/` into Standalone Repository
- **Pros**: Removes multi-framework detection ambiguity.
- **Cons**: Breaks workspace monorepo advantages (atomic commits, shared versioning).
- **Why not**: Unnecessary overhead when Wrangler natively supports explicit path and project arguments.

---

## 5. Consequences

### Positive
- Completely bypasses Wrangler multi-framework auto-detection logic.
- Guarantees deterministic CI/CD deployments to Cloudflare Pages.
- Retains clean monorepo architecture.

### Negative & Mitigation
- Future changes to project name or output path MUST be updated explicitly in `package.json` scripts.
