# Sanity CMS Federation & Data Fetching Governance Rule

> **Rule ID**: `RULE-CMS-001`  
> **Project**: PT Daya Berkah Sentosa Nusantara (DBSN) — `arostech-hub`  
> **Owner Agents**: `typescript-reviewer` (query type safety), `react-reviewer` (RSC data fetching)  
> **Primary Authority**: [Data Model Spec](file:///d:/dev/arostech-hub/docs/system/data-model.md) & [Coding Standards](file:///d:/dev/arostech-hub/docs/engineering/governance/coding-standards.md)

---

## 1. File-Matcher Scopes

This rule MUST be enforced whenever an AI agent inspects or modifies files matching:

| Scope | Path Pattern | Rationale |
|-------|-------------|-----------|
| Studio schemas | `studio/schemaTypes/**/*.{ts,tsx}` | Local schema definitions & type declarations |
| Client config | `src/lib/sanity/client.ts`, `src/lib/api/sanity/client.ts` | Sanity client instantiation & Stega settings |
| GROQ queries | `src/lib/sanity/queries.ts`, `src/lib/api/sanity/queries.ts` | GROQ queries & fetch helper functions |
| Sanity types | `src/lib/sanity/types.ts`, `src/lib/api/sanity/types.ts` | TypeScript interfaces for Sanity payloads |
| Next.js pages | `src/app/**/page.tsx` (when fetching Sanity content) | Server Components consuming Sanity content |
| On-demand revalidation | `src/app/api/revalidate/**/route.ts` | Webhook route handlers for ISR cache purging |

---

## 2. Pre-Execution Architectural Vector Analysis

Before modifying Sanity schemas or query functions, agents MUST evaluate the following 3 vectors:

1. **Vector A — Trade-offs & Isolation Dynamics**:
   - Content queries MUST use `defineQuery()` from `next-sanity` to enable compile-time type extraction.
   - Stega visual editing encoding MUST be active during development and preview (`process.env.NODE_ENV === 'development'` or `CF_PAGES_BRANCH !== 'main'`), but strictly disabled in production builds for HTML payload size optimization.

2. **Vector B — System Invariants & Spec Compliance**:
   - Exactly **6 local schema types** MUST exist in `studio/schemaTypes/`: `spokeConfig`, `product`, `portfolioEntry`, `certification`, `page`, `article`. Zero unmanaged cloud-only types permitted.
   - Cache tag format MUST strictly follow the canonical taxonomy: `sanity:{type}`, `sanity:{type}:{id}`, `sanity:spoke:{subdomain}`, `sanity:all`.
   - Content updates MUST trigger cache revalidation via `revalidateTag()` only. `revalidatePath()` is strictly prohibited for Sanity-driven content.

3. **Vector C — Edge Cases & Verification Strategy**:
   - Null-on-Error Invariant: All Sanity data fetching helpers MUST return `null` or fallback arrays on fetch failure rather than throwing unhandled exceptions in production RSCs.

---

## 3. Normative Enforcement Rules (RFC 2119)

1. All GROQ queries **MUST** be defined using `defineQuery()` from `next-sanity`. Raw string queries without `defineQuery()` **MUST NOT** be used.
2. Dynamic GROQ values **MUST** be passed as parameters (`$slug`, `$subdomain`). JavaScript string interpolation inside GROQ templates **MUST NOT** be used.
3. Production GROQ queries **MUST** specify explicit field projections. Unqualified `*` selections **MUST NOT** be used.
4. Data fetching functions **MUST** handle errors gracefully using the null-on-error pattern (return `null` or empty fallback array, never throw in production).
5. ISR revalidation **MUST** use `revalidateTag()` with canonical cache tags (`sanity:{type}`). `revalidatePath()` **MUST NOT** be used for Sanity updates.
6. Stega visual editing metadata **MUST NOT** be compiled into production builds, and `encodeSourceMapAtPath` **MUST** exclude `url` asset fields.
7. All queried content types **MUST** have matching TypeScript definitions and local schemas registered in `studio/schemaTypes/index.ts`.

---

## 4. Cache Tag Taxonomy

| Tag Format | Factory Method | Granularity | Revalidation Scope |
|------------|----------------|-------------|-------------------|
| `sanity:product` | `CACHE_TAGS.product()` | Collection | All products |
| `sanity:product:{id}` | `CACHE_TAGS.product(id)` | Single | One product |
| `sanity:certification` | `CACHE_TAGS.certification()` | Collection | All certifications |
| `sanity:certification:{id}` | `CACHE_TAGS.certification(id)` | Single | One certification |
| `sanity:portfolio` | `CACHE_TAGS.portfolio()` | Collection | All portfolio entries |
| `sanity:portfolio:{id}` | `CACHE_TAGS.portfolio(id)` | Single | One portfolio entry |
| `sanity:article` | `CACHE_TAGS.article()` | Collection | All articles |
| `sanity:article:{id}` | `CACHE_TAGS.article(id)` | Single | One article |
| `sanity:spoke:{subdomain}` | `CACHE_TAGS.spoke(subdomain)` | Spoke | One spoke's data |
| `sanity:spokeConfig` | `CACHE_TAGS.spokeConfig()` | Collection | All spoke configs |
| `sanity:spokeConfig:{id}` | `CACHE_TAGS.spokeConfig(id)` | Single | One spoke config |
| `sanity:page` | `CACHE_TAGS.page()` | Collection | All pages |
| `sanity:page:{id}` | `CACHE_TAGS.page(id)` | Single | One page |
| `sanity:all` | `CACHE_TAGS.all()` | Global | Entire Sanity cache |

---

## 5. GROQ Convention Rules

### GROQ-1: `defineQuery()` Wrapper Is Mandatory
All GROQ queries MUST be wrapped with `defineQuery()` from `next-sanity`.
```typescript
// APPROVED
import { defineQuery } from 'next-sanity'
const getProduct = defineQuery(`*[_type == "product" && slug.current == $slug][0]`)
```

### GROQ-2: Parameterized Queries Only
All dynamic values MUST be passed as GROQ parameters (`$paramName`). String interpolation is forbidden.
```typescript
// APPROVED
const query = defineQuery(`*[_type == "product" && slug.current == $slug][0]{ title, price }`)
client.fetch(query, { slug: 'my-product' })
```

### GROQ-3: Explicit Field Projections
All production queries MUST project only the required fields.
```typescript
// APPROVED
const query = defineQuery(`
  *[_type == "product" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    price,
    "imageUrl": mainImage.asset->url
  }
`)
```

---

## 6. Explicit Forbidden Anti-Patterns

### ANTI-1: Raw String GROQ Queries
```typescript
// ❌ FORBIDDEN
client.fetch('*[_type == "product"]')
```
**Correct Pattern**: Wrap all queries with `defineQuery()`.

---

### ANTI-2: String Interpolation in GROQ Templates
```typescript
// ❌ FORBIDDEN: Vulnerable to injection and breaks query caching
client.fetch(defineQuery(`*[_type == "product" && slug.current == "${slug}"][0]`))
```
**Correct Pattern**: Use parameterized inputs: `{ slug }`.

---

### ANTI-3: Using `revalidatePath()` for Sanity Webhooks
```typescript
// ❌ FORBIDDEN in src/app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
revalidatePath('/products/[slug]') // FORBIDDEN
```
**Correct Pattern**: Use `revalidateTag(CACHE_TAGS.product(id))`.

---

### ANTI-4: Unmanaged Cloud-Only Schema Types
All six Sanity document types MUST have local schema files in `studio/schemaTypes/`:

| `_type` | Schema File | Required Status |
|---------|-------------|-----------------|
| `spokeConfig` | `spokeConfig.ts` | ✓ Registered |
| `product` | `product.ts` | ✓ Registered |
| `portfolioEntry` | `portfolioEntry.ts` | ✓ Registered |
| `certification` | `certification.ts` | ✓ Registered |
| `page` | `page.ts` | ✓ Registered |
| `article` | `article.ts` | ✓ Registered |

---

### ANTI-5: Enabling Stega Visual Editing in Production
```typescript
// ❌ FORBIDDEN: Stega enabled unconditionally in production
export const client = createClient({
  projectId,
  dataset,
  stega: { enabled: true, studioUrl: '/studio' } // FORBIDDEN IN PROD
})
```
**Correct Pattern**: Conditionally enable Stega only in development or preview environments.

---

## 7. Approved Canonical Code Patterns

### APPROVED-1: Type-Safe GROQ Query with Null-on-Error + Cache Tags
```typescript
// src/lib/sanity/queries.ts — APPROVED
import { defineQuery } from 'next-sanity'
import { sanityFetch } from './client'
import type { ProductData } from './types'

export const PRODUCT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    price,
    description,
    "imageUrl": mainImage.asset->url
  }
`)

export async function getProductBySlug(slug: string): Promise<ProductData | null> {
  try {
    const product = await sanityFetch<ProductData>({
      query: PRODUCT_BY_SLUG_QUERY,
      params: { slug },
      tags: [`sanity:product`, `sanity:all`],
    })
    return product ?? null
  } catch (error) {
    console.error(`[Sanity Fetch Error] Failed to fetch product slug '${slug}':`, error)
    return null // Return null on error, never crash RSC
  }
}
```

---

### APPROVED-2: ISR Webhook Revalidation Handler
```typescript
// src/app/api/revalidate/route.ts — APPROVED
import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string; _id: string; spoke?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    )

    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
    }

    const type = body?._type
    if (!type) {
      return NextResponse.json({ message: 'Missing document type' }, { status: 400 })
    }

    revalidateTag(`sanity:${type}`)
    if (body._id) revalidateTag(`sanity:${type}:${body._id}`)
    if (body.spoke) revalidateTag(`sanity:spoke:${body.spoke}`)
    revalidateTag('sanity:all')

    return NextResponse.json({ revalidated: true, type, now: Date.now() })
  } catch (err) {
    console.error('[ISR Webhook Error]:', err)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
```

---

### APPROVED-3: Schema Registration (`studio/schemaTypes/index.ts`)
```typescript
// studio/schemaTypes/index.ts — APPROVED
import spokeConfig from './spokeConfig'
import product from './product'
import portfolioEntry from './portfolioEntry'
import certification from './certification'
import page from './page'
import article from './article'

export const schemaTypes = [
  spokeConfig,
  product,
  portfolioEntry,
  certification,
  page,
  article,
]
```

---

### APPROVED-4: Environment-Aware Stega Client Setup
```typescript
// src/lib/sanity/client.ts — APPROVED
import { createClient } from 'next-sanity'

const isDev = process.env.NODE_ENV === 'development'
const isPreview = (process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH !== 'main') || process.env.IS_PREVIEW === 'true'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-08-13',
  useCdn: !isDev && !isPreview,
  stega: {
    enabled: isDev || isPreview,
    studioUrl: '/studio',
    filter: (props) => {
      if (props.sourcePath.at(-1) === 'url') return false // Prevent Stega corruption on URLs
      return props.filterDefault(props)
    },
  },
})
```

---

## 8. Studio / Query Synchronization Checklist

- [ ] **Schema file exists** — A `.ts` file in `studio/schemaTypes/` defines the document type with `defineType()`.
- [ ] **Schema is registered** — Included in `schemaTypes` array in `studio/schemaTypes/index.ts`.
- [ ] **TypeScript interface exists** — Interface defined in `types.ts` matching projection fields.
- [ ] **GROQ projections match schema fields** — All fields in GROQ queries correspond to schema fields.
- [ ] **Cache tag factory exists** — Follows `sanity:{type}` and `sanity:{type}:{id}` taxonomy.
- [ ] **Queries use `defineQuery()`** — Wrapped with `defineQuery()` from `next-sanity`.
- [ ] **Queries use parameterized inputs** — All dynamic values are `$parameters`.
- [ ] **Null-on-error pattern applied** — Fetch helper returns `null` on failure.
- [ ] **Revalidation route handles type** — Webhook handler maps `_type` to cache tags.
- [ ] **Stega exclusion covers URL fields** — URL fields filtered out in `stega.filter`.
