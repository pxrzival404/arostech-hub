---
id: API-MWE-SPOKE-001
title: "Minimal Working Example: Adding a New Product Spoke Subdomain"
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_api"
authoritative_references:
  overview: "file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L40-L60"
  data_model: "file:///d:/dev/arostech-hub/docs/system/data-model/00-overview.md#L84-L105"
  adr_0003: "file:///d:/dev/arostech-hub/docs/system/adr/0003-greenfield-hub-and-spoke-subdomain-routing.md#L1-L50"
---

# Minimal Working Example: Adding a New Product Spoke Subdomain

> **TL;DR**: Authoritative specification and architectural reference for Minimal Working Example: Adding a New Product Spoke Subdomain within the DBSN platform (docs/system/api/mwe/add-new-spoke.md).


> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Baseline Sync`  
> **Authoritative Baseline Reference**: This guide provides a step-by-step walk-through for registering and deploying a new product spoke subdomain within the **DBSN Greenfield Hub-and-Spoke Architecture**, adhering to PRD v4.0.0 ([`overview.md`](file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L40-L60)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/api/mwe/add-new-spoke.md`

---

## OpenSpec Delta

- `MODIFIED`: Updated spoke registration protocol to conform with Next.js 16 Edge Subdomain Middleware routing.
- `ADDED`: Enforced declarative `SpokeSegmentEnum` validation across CMS and cart state.

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-MWE-SPOKE-001 Subdomain Spoke Registration & Edge Routing
The system SHALL route requests for product spoke subdomains (e.g. `pju.dayaberkah.id`, `solarcell.dayaberkah.id`, `alatpetir.dayaberkah.id`, `baterai.dayaberkah.id`) via Next.js Edge Middleware to dedicated route groups inside `src/app/(spokes)/[spoke]`. Adding a new product spoke MUST require updating `SPOKE_ROUTES` mapping in `src/middleware.ts`.

#### Scenario: Valid Subdomain Resolution
- GIVEN a user requesting `http://pju.dayaberkah.id/`
- WHEN the request hits Next.js Edge Middleware
- THEN middleware SHALL rewrite the internal URL to `src/app/(spokes)/pju/page.tsx`
- AND the browser URL bar SHALL remain intact as `http://pju.dayaberkah.id/`.

#### Scenario: Unregistered Subdomain Handling
- GIVEN an incoming request with an unmapped subdomain host
- WHEN middleware evaluates `SPOKE_ROUTES`
- THEN the system MUST return HTTP 404 Not Found.

---

## 2. Declarative Spoke Configuration Schemas

Spoke metadata and route mappings MUST conform to `SpokeConfigSchema`:

```typescript
import { z } from "zod";

export const SpokeSegmentEnum = z.enum([
  "pju",
  "solarcell",
  "alatpetir",
  "baterai",
  "pompa",
]);

export const SpokeConfigSchema = z.object({
  segment: SpokeSegmentEnum,
  subdomain: z.string(),
  displayName: z.string(),
  targetPath: z.string(),
  active: z.boolean().default(true),
});

export type SpokeSegment = z.infer<typeof SpokeSegmentEnum>;
export type SpokeConfig = z.infer<typeof SpokeConfigSchema>;
```

---

## 3. Step-by-Step Implementation

### Step 1: Create Spoke Route Group Directory
Create the spoke page entry inside `src/app/(spokes)/`:

```tsx
// File: src/app/(spokes)/pompa/page.tsx
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sistem Pompa Industri & Submersible | PT DBSN",
  description: "Katalog resmi & pengadaan pompa air industri dan submersible berkualitas tinggi.",
  alternates: {
    canonical: "https://pompa.dayaberkah.id",
  },
};

export default function PompaSpokePage() {
  return (
    <main className="min-h-screen py-16 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold">Sistem Pompa Industri & Submersible</h1>
      <p className="mt-4 text-gray-600">
        Solusi pemompaan terintegrasi dan sistem proteksi fluida dari PT DBSN.
      </p>
    </main>
  );
}
```

### Step 2: Register Subdomain in Edge Subdomain Middleware
Update `src/middleware.ts` to include the new subdomain mapping:

```typescript
// File: src/middleware.ts
const SPOKE_ROUTES: Record<string, string> = {
  pju: "/pju",
  solarcell: "/solarcell",
  alatpetir: "/alatpetir",
  baterai: "/baterai",
  pompa: "/pompa", // <--- Registered new product spoke subdomain
};
```

### Step 3: Register Sanity CMS Document Types (Optional)
If the spoke displays dynamic CMS-managed catalog items, add document schemas in `studio/schemas/spokePompa.ts` and register in Sanity Studio configuration.

### Step 4: Local Testing via `lvh.me`
1. Start local Next.js server: `pnpm dev`
2. Open browser at: `http://pompa.lvh.me:3000`
3. Verify that Edge middleware resolves `pompa` host to `src/app/(spokes)/pompa/page.tsx`.

---

## 4. Deployment Verification Checklist

- [ ] Local preview renders correctly at `http://pompa.lvh.me:3000`.
- [ ] Unit tests pass: `pnpm test`.
- [ ] Cloudflare build compilation succeeds: `pnpm pages:build`.
- [ ] CNAME record created in Cloudflare DNS pointing `pompa.dayaberkah.id` to `dayaberkah.pages.dev`.
