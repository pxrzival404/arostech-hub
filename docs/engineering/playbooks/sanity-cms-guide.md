---
id: DOC-ENG-PLAY-SANITY
title: Sanity Headless CMS Integration & ISR Revalidation Guide
version: 4.0.0
status: LOCKED_BASELINE
graphify_community: "community_playbooks"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100"
  mocking_specs: "file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/mocking-specs.md#L1-L60"
---

# Sanity Headless CMS Integration & ISR Revalidation Guide

> **TL;DR**: Authoritative specification and architectural reference for Sanity Headless CMS Integration & ISR Revalidation Guide within the DBSN platform (docs/engineering/playbooks/sanity-cms-guide.md).


> **Authoritative Baseline Reference**: Usage patterns, GROQ query functions, schema definitions, and Incremental Static Regeneration (ISR) revalidation for Sanity CMS in the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100)).

---

## 1. Overview & Content Flow

Sanity is the headless CMS powering all content on the DBSN platform — products, certifications, portfolio entries, spoke configurations, and CMS-managed pages. The integration uses the `next-sanity` adapter for native ISR support via fetch cache tags.

```
Sanity Studio (cloud editor)
        │  publish / update
        ▼
Sanity CDN (GROQ delivery)
        │  client.fetch()
        ▼
Next.js ISR cache (tags: sanity:product:*)
        │  on webhook
        ▼
POST /api/revalidate  →  revalidateTag()  →  fresh page
```

---

## 2. Environment Variables

All Sanity environment variables MUST be validated at startup by `src/lib/config/env.ts` using Zod schemas. Missing or malformed values SHALL throw at boot time:

| Variable | Required | Format | Description |
|---|---|---|---|
| `SANITY_PROJECT_ID` | ✅ Yes | `[a-z0-9]+` | Sanity project ID |
| `SANITY_DATASET` | ✅ Yes | `[a-z0-9_-]+` | Dataset name (e.g., `production`) |
| `SANITY_API_VERSION` | ✅ Yes | `vYYYY-MM-DD` | API version (default: `v2025-05-21`) |
| `SANITY_API_READ_TOKEN` | ✅ Yes | starts with `sk` | Read-only API token |
| `SANITY_WEBHOOK_SECRET` | Optional* | any string | HMAC secret for webhook validation — **required in production** |

---

## 3. Client Setup & GROQ Query Standards

The configured client SHALL be a singleton exported from `src/lib/api/sanity/client.ts`. Developers MUST NOT invoke `createClient()` directly in component files.

### GROQ Dereferencing Rule
All GROQ queries targeting reference fields (such as `spoke`) MUST use explicit dereferencing syntax (`spoke->subdomain` or `spoke->{ _id, subdomain, name }`). Direct dot access on references (`spoke.subdomain`) MUST NOT be used as it yields `undefined` in filter contexts.

```typescript
// Declarative GROQ query helper contract
export interface ProductWithRelations {
  readonly _id: string;
  readonly title: string;
  readonly slug: { readonly current: string };
  readonly spoke: { readonly _id: string; readonly subdomain: string; readonly name: string };
}
```

---

## 4. Cache Tag System & Webhook Revalidation

1. Cache tags bridge Sanity content edits with Next.js ISR invalidation:
   - `sanity:{documentType}` — all documents of type
   - `sanity:{documentType}:{id}` — specific document
   - `sanity:spoke:{subdomain}` — all content for a spoke
   - `sanity:all` — full site cache purge
2. Webhook endpoints (`POST /api/revalidate`) MUST verify incoming HMAC-SHA256 signatures (`sanity-webhook-signature`) using `SANITY_WEBHOOK_SECRET`. Unsigned requests SHALL return `401 Unauthorized`.

---

## 5. OpenSpec Behavioral Requirements

### Requirement: REQ-ENG-SANITY-001-GROQ-DEREF
All GROQ query functions in `src/lib/api/sanity/queries.ts` SHALL use explicit dereferencing (`->`) on document reference attributes to ensure valid query results.

#### Scenario: Spoke Product Query Execution
- GIVEN a GROQ product query filtered by spoke subdomain
- WHEN `getProductsBySpoke(spokeSubdomain)` is executed
- THEN the query MUST use `spoke->subdomain == $subdomain` and return matching product records or `null` on error.

---

## 6. OpenSpec Delta

## ADDED Requirements
- REQ-ENG-SANITY-001-GROQ-DEREF: GROQ dereferencing invariant contract.

## MODIFIED Requirements
- Standardized cache tag invalidation payload handling.

## REMOVED Requirements
- Legacy dot-notation reference queries.

---

## 7. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/engineering/playbooks/sanity-cms-guide.md`
- Graphify Community: `community_playbooks`
- Master Reference: [`mocking-specs.md`](file:///d:/dev/arostech-hub/docs/engineering/playbooks/testing/mocking-specs.md#L1-L60)
