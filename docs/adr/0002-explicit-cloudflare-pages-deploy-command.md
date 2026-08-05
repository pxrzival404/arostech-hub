# ADR-0002: Explicit Cloudflare Pages Deploy Target in Monorepo Workspace

**Date**: 2026-07-21
**Status**: accepted
**Deciders**: User, Antigravity

## Context

During Cloudflare CI deployments for the project (`dayaberkah`), builds failed at the deployment stage (e.g. build UUID `6814bd5c-6277-44b8-9851-4795afdb0f61` and `2a50bd1b`). While the Next.js compilation step (`@cloudflare/next-on-pages`) succeeded cleanly, the subsequent deployment step threw the following error:

```
✘ [ERROR] Wrangler was unable to automatically configure your project to work with Cloudflare,
  since multiple frameworks were found: PNPM + Next.js studio, PNPM + Next.js ..
```

Because the repository is structured as a PNPM workspace containing both the root Next.js web application and a `studio/` workspace package (Sanity Studio), Wrangler's automatic framework detection becomes ambiguous when executing bare `wrangler deploy` from the root directory.

## Decision

We will explicitly target the `@cloudflare/next-on-pages` static build output directory (`.vercel/output/static`) and specify the project name (`dayaberkah`) in all Cloudflare Pages deployment invocations.

> **Note**: `.vercel/output/static` is the standard temporary build directory generated locally by `@cloudflare/next-on-pages` (which uses Next.js Build Output API v3 specification). It is deployed entirely onto **Cloudflare Pages** infrastructure, and **does not use Vercel hosting or Vercel servers** in any way.

Specifically, the deployment command is updated to:
```bash
npx wrangler pages deploy .vercel/output/static --project-name dayaberkah
```

## Alternatives Considered

### Alternative 1: Run Wrangler within a specific subfolder shell step
- **Pros**: Keeps deployment parameters implicit.
- **Cons**: Requires custom shell scripting in CI and does not resolve bare `wrangler` CLI ambiguities in root commands.
- **Why not**: Explicitly passing path parameters to `wrangler pages deploy` is simpler, cleaner, and guaranteed to work across local and CI environments.

### Alternative 2: Separate `studio/` into a completely distinct standalone git repository
- **Pros**: Eliminates multi-framework workspace detection by removing monorepo structure.
- **Cons**: Loses monorepo benefits (shared versioning, atomic commits, single repository management).
- **Why not**: Unnecessary architectural overhead when Wrangler provides explicit CLI deployment flags.

## Consequences

### Positive
- Bypasses Wrangler's multi-framework auto-detection logic completely during CI/CD.
- Ensures reliable, deterministic deployments directly to Cloudflare Pages.
- Maintains monorepo workspace organization intact.

### Negative
- CI build configuration must maintain explicit deployment arguments if the output path or project name changes in the future.

### Risks
- If Cloudflare CI settings still call bare `npx wrangler deploy` instead of the project's `pages:deploy` command, manual adjustment in the Cloudflare Dashboard (Settings -> Build -> Deploy command) is required.
- **Mitigation**: Update `package.json` script `"pages:deploy"` and document dashboard requirement.
