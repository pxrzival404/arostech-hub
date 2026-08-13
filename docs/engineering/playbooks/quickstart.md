---
id: PLAY-QUICK-001
title: Developer Quickstart & Onboarding Playbook
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_engineering"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L35"
  testing_strategy: "file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/strategy.md#L1-L35"
  deployment_runbook: "file:///d:/dev/arostech-hub/docs/operations/runbooks/deployment.md#L1-L35"
---

# Developer Quickstart & Onboarding Playbook

> **Authoritative Baseline Reference**: Day-1 developer onboarding and local environment setup guide for the **DBSN Centralized Digital Ecosystem**, adhering to PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L35)).

---

## OpenSpec Delta (M3 / SQ-OPS)

### [ADDED]
- Declarative Zod schemas (`LocalDevConfigSchema`, `SubdomainRouteMappingSchema`) for local environment validation and multi-subdomain routing verification.
- Verified Day-1 `lvh.me` multi-subdomain local routing execution table for apex and product spoke routing.
- OpenSpec Behavioral Contracts (`REQ-QUICK-001-LOCAL-ONBOARDING`, `REQ-QUICK-002-SUBDOMAIN-ROUTING-DEV`, `REQ-QUICK-003-BUILD-VERIFICATION`).

### [MODIFIED]
- Standardized all internal cross-documentation references to line-anchored `file:///` URIs.
- Updated setup prerequisites to Node.js v20+ LTS and pnpm v9+.

### [REMOVED]
- Removed unanchored relative Markdown links and outdated local dev assumptions.

---

## 1. System Overview & Tech Stack

A Next.js 16 (React 19) platform consolidating product verticals into a single hub-and-spoke architecture, deployed on Cloudflare Pages with Edge Middleware for subdomain routing.

Developers MUST install Node.js v20+ LTS and pnpm v9+ to run the local development environment.

### Domain & Routing Topology

| Hostname | Route Mapping | Purpose |
|---|---|---|
| `dayaberkah.id` | `(hub)` | Corporate trust center |
| `*.dayaberkah.id` (`pju`, `solarcell`, `alatpetir`, `baterai`) | `(spokes)` | Product segments |
| `dashboard.dayaberkah.id` | `dashboard/` | Flat route: Client tracking portal |

---

## 2. Declarative Developer Setup Schema

```typescript
import { z } from 'zod';

export const LocalDevConfigSchema = z.object({
  nodeVersion: z.string().startsWith('v20'),
  packageManager: z.string().startsWith('pnpm@9'),
  port: z.number().default(3000),
  host: z.string().default('lvh.me'),
});

export const SubdomainRouteMappingSchema = z.object({
  subdomain: z.enum(['hub', 'pju', 'solarcell', 'alatpetir', 'baterai', 'dashboard']),
  localUrl: z.string().url(),
  mappedAppRoute: z.string(),
});

export type LocalDevConfig = z.infer<typeof LocalDevConfigSchema>;
export type SubdomainRouteMapping = z.infer<typeof SubdomainRouteMappingSchema>;
```

---

## 3. Day-1 Developer Checklist

### Requirement: REQ-QUICK-001-LOCAL-ONBOARDING
New engineering team members SHALL execute the Day-1 onboarding checklist to instantiate a fully compliant local development environment.

#### Scenario: First-Time Environment Bootstrap
- GIVEN a freshly cloned repository
- WHEN running `pnpm install` and setting up `.env.local`
- THEN the local server MUST start via `pnpm dev` and serve requests on port 3000.

- [ ] Install `pnpm` (v9+) and Node.js (v20+ LTS)
- [ ] Run `pnpm install`
- [ ] Copy `.env.example` → `.env.local`, fill in Sanity + database credentials
- [ ] Run `pnpm dev` — verify hub loads at `http://lvh.me:3000`
- [ ] Verify product spoke loads at `http://pju.lvh.me:3000`
- [ ] Read [System Architecture Overview](file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L1-L35)
- [ ] Read [Middleware & Routing Lifecycle](file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md#L1-L35)
- [ ] Read [Testing Strategy Playbook](file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/strategy.md#L1-L35) and run `pnpm test`

---

## 4. Minimal Working Examples (MWE)

- 🚀 [Adding a New Product Spoke](file:///d:/dev/arostech-hub/docs/system/api/mwe/add-new-spoke.md#L1-L35)
- ⚡ [Adding a Secure API Endpoint](file:///d:/dev/arostech-hub/docs/system/api/mwe/add-api-endpoint.md#L1-L35)

---

## 5. Local Development Setup (`lvh.me` & Hosts File)

### Requirement: REQ-QUICK-002-SUBDOMAIN-ROUTING-DEV
The local development environment MUST resolve multi-subdomain requests using `lvh.me` loopback routing or custom system hosts entries without modifying application middleware logic.

#### Scenario: Local Subdomain Resolution
- GIVEN a running Next.js development server on port 3000
- WHEN navigating to `http://pju.lvh.me:3000`
- THEN Edge Middleware MUST extract the `pju` subdomain and route the request to `(spokes)/pju`.

### Method A: Using `lvh.me` (Recommended)

`lvh.me` and all subdomains (`*.lvh.me`) automatically resolve to `127.0.0.1`.

| Production Target | Local URL | App Route Destination |
|------------------|-----------|-----------------------|
| `dayaberkah.id` | `http://lvh.me:3000` | `(hub)` |
| `pju.dayaberkah.id` | `http://pju.lvh.me:3000` | `(spokes)/pju` |
| `solarcell.dayaberkah.id` | `http://solarcell.lvh.me:3000` | `(spokes)/solarcell` |
| `alatpetir.dayaberkah.id` | `http://alatpetir.lvh.me:3000` | `(spokes)/alatpetir` |
| `baterai.dayaberkah.id` | `http://baterai.lvh.me:3000` | `(spokes)/baterai` |
| `dashboard.dayaberkah.id` | `http://dashboard.lvh.me:3000` | `dashboard/` (flat route) |

### Method B: System Hosts File Configuration

If testing without port numbers or custom host aliases:

#### Windows (`C:\Windows\System32\drivers\etc\hosts`) / macOS (`/etc/hosts`)
```hosts
127.0.0.1 dayaberkah.id
127.0.0.1 pju.dayaberkah.id
127.0.0.1 solarcell.dayaberkah.id
127.0.0.1 alatpetir.dayaberkah.id
127.0.0.1 baterai.dayaberkah.id
127.0.0.1 dashboard.dayaberkah.id
```

---

## 6. Common Development Commands

### Requirement: REQ-QUICK-003-BUILD-VERIFICATION
Developers MUST execute build type-checking and unit testing scripts prior to committing code or opening pull requests.

#### Scenario: Pre-Commit Build Verification
- GIVEN a modified feature branch
- WHEN running `pnpm pages:build` and `pnpm test`
- THEN both commands MUST pass with 0 errors and minimum 80% test coverage.

```bash
pnpm dev              # Local dev server (lvh.me:3000)
pnpm build            # Production Next.js build
pnpm pages:build      # OpenNext Cloudflare edge build (@opennextjs/cloudflare)
pnpm pages:preview    # Local Wrangler edge preview
pnpm test             # Run Jest unit/integration test suite
pnpm test:coverage    # Run Jest coverage report
```

---

## 7. GRAPHIFY ANCHORING & REFERENCES

- Knowledge Graph Node ID: `doc:docs/engineering/playbooks/quickstart.md`
- Graphify Community: `community_engineering`
- Deployment Protocol: [`deployment.md`](file:///d:/dev/arostech-hub/docs/operations/runbooks/deployment.md#L1-L35)