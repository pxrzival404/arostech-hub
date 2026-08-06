# Local Code Review: Phase 2.6 — Sanity CMS Integration

**Reviewed**: 2026-05-21  
**Author**: Local Workspace  
**Decision**: **REQUEST CHANGES** (Multiple Critical/High risk bugs and architectural issues identified)

## Summary
The Phase 2.6 Sanity CMS integration successfully sets up schemas, queries, and type safety across Hub and Spoke pages. However, multiple critical-risk bugs are present, including a broken signature verification algorithm for the webhook route, broken file URL mappings on the CDN, and N+1 query patterns during build-time static page generation.

---

## Findings

### CRITICAL
None.

### HIGH

#### 1. Insecure/Broken Webhook Signature Verification
* **File Location**: `src/app/api/revalidate/route.ts`
* **Description**: The webhook revalidation endpoint checks for signature validity using `signature !== 'sha1=' + secret`. In production, Sanity does not send the secret in plaintext. It sends a cryptographic HMAC signature of the request body payload (normally keyed by the secret). Genuine webhook events will always fail this check, making the revalidation mechanism non-functional.
* **Suggested Fix**: Read the raw body as text and verify using Node's `crypto` module:
    ```typescript
    import { createHmac } from 'crypto'
    const rawBody = await request.text()
    const computedSignature = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')
    if (signature !== computedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    const body = JSON.parse(rawBody)
    ```

#### 2. Broken CDN PDF Document / Datasheet Links (404 Errors)
* **File Locations**: 
    * `src/app/(hub)/certifications/page.tsx`
    * `src/app/(spokes)/[spoke]/products/[slug]/page.tsx`
* **Description**: PDF document assets are linked directly via the file reference:
    `href={'https://cdn.sanity.io/files/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${cert.documentFile.asset._ref}'}`
    This creates paths like `/files/.../file-uuid-pdf` which returns `404 Not Found` on the Sanity CDN. Sanity CDN expects the filename to be `uuid.pdf` (stripping the `file-` prefix and replacing the trailing extension dash with a dot).
* **Suggested Fix**: Update the GROQ query projections in `src/lib/api/sanity/queries.ts` to resolve file URLs directly via the CDN reference:
    ```groq
    "datasheetUrl": datasheetFile.asset->url,
    "documentUrl": documentFile.asset->url
    ```
    Then, render `href={product.datasheetUrl}` directly on the page components.

#### 3. Build-Time N+1 Queries in Static Parameters Generation
* **File Location**: `src/app/(spokes)/[spoke]/products/[slug]/page.tsx`
* **Description**: In the product detail page, `generateStaticParams()` queries all spoke configurations and then runs a loop query `getProductsBySpoke(cfg.subdomain)` for every single subdomain. This results in N+1 queries during the build process, which will bottleneck compilation as content scales.
* **Suggested Fix**: Add a single query helper to fetch all active product slug/subdomain mappings in one query:
    ```typescript
    export async function getProductSlugsWithSpokes() {
      return await client.fetch<Array<{ slug: string; subdomain: string }>>(
        defineQuery(groq`*[_type == "product"]{
          "slug": slug.current,
          "subdomain": spoke->subdomain
        }`)
      )
    }
    ```

---

### MEDIUM

#### 1. Fragile Hand-Rolled Portable Text Rendering
* **File Locations**: 
    * `src/app/(spokes)/[spoke]/products/[slug]/page.tsx`
    * `src/app/(hub)/portfolio/[slug]/page.tsx`
* **Description**: Instead of utilizing standard rendering tools, the code uses a custom helper `PortableTextRenderer` which casts block data to `unknown[]` and manually filters formatting styles. This completely discards rich-text formats (such as links, lists, bold/italics, and custom images) edited in Sanity Studio.
* **Suggested Fix**: Install and implement the official `@portabletext/react` library.

#### 2. Promise Array Fallback Array Defaulting Bug
* **File Location**: `src/app/(hub)/page.tsx`
* **Description**: The fallback evaluation `getCertifications() || []` applies to the Promise object returned by the query, which is always truthy. As a result, the default `[]` is never hit during runtime. If a query fails and returns `null`, the page variables resolve to `null` rather than the safe empty array.
* **Suggested Fix**: Apply default array assignments after the `Promise.all` has resolved:
    ```typescript
    const [rawCerts, rawPortfolio] = await Promise.all([
      getCertifications(),
      getPortfolioEntries(),
    ])
    const certifications = rawCerts || []
    const portfolio = rawPortfolio || []
    ```

#### 3. Incomplete Fine-Grained ISR Cache Invalidation
* **File Location**: `src/app/api/revalidate/route.ts`
* **Description**: When a product or certification is updated, only the ID-specific tag (`sanity:product:${id}`) is invalidated. The general collection tag (`sanity:product`) targeted by list queries is never invalidated. It is currently bypassed only because the global tag `sanity:all` is cleared on every edit, which forces a full site cache clear and negates fine-grained caching.
* **Suggested Fix**: Push the general collection tags (e.g. `CACHE_TAGS.product()`) to the revalidation list on document mutations.

---

### LOW

#### 1. Webhook Secret Environment Variable Missing from Zod Schema
* **File Location**: `src/lib/config/env.ts`
* **Description**: `SANITY_WEBHOOK_SECRET` is accessed directly via raw `process.env` in `route.ts`. It is recommended to add it to the validated env schema to ensure it is configured.

#### 2. Simplified Test Mock structures
* **File Location**: `src/lib/api/sanity/__tests__/queries.test.ts`
* **Description**: Query tests mock returns with minimal structures (`{ _id: 'prod-1', title: 'Solar Panel' }`). These mismatch production shapes, which could mask interface type mismatches.

---

## Validation Results

| Check | Result |
|---|---|
| Type check | Pass |
| Lint | Pass |
| Tests | Pass (127/127 passed) |
| Build | Pass (Production optimize completed successfully) |
