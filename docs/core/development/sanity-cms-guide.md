# Sanity CMS Integration Guide

**Purpose:** Usage patterns, query functions, types, and ISR revalidation for the Sanity CMS integration  
**Source:** `src/lib/api/sanity/`

---

## Overview

Sanity is the headless CMS powering all content on the DBSN platform — products, certifications, portfolio entries, spoke configurations, and CMS-managed pages. The integration uses the `next-sanity` adapter for native ISR (Incremental Static Regeneration) support via fetch cache tags.

**Content flow:**

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

## Environment Variables

All Sanity env vars are validated at startup by `src/lib/config/env.ts` using Zod. Missing or malformed values throw at boot, not at request time.

| Variable | Required | Format | Description |
|---|---|---|---|
| `SANITY_PROJECT_ID` | ✅ Yes | `[a-z0-9]+` | Sanity project ID |
| `SANITY_DATASET` | ✅ Yes | `[a-z0-9_-]+` | Dataset name (e.g., `production`) |
| `SANITY_API_VERSION` | ✅ Yes | `vYYYY-MM-DD` | API version (default: `v2025-05-21`) |
| `SANITY_API_READ_TOKEN` | ✅ Yes | starts with `sk` | Read-only API token |
| `SANITY_API_WRITE_TOKEN` | Optional | starts with `sk` | Write token (used for content mutations) |
| `SANITY_WEBHOOK_SECRET` | Optional* | any string | HMAC secret for webhook validation — **required in production** |

> *`SANITY_WEBHOOK_SECRET` is optional locally but the `/api/revalidate` endpoint returns `500` in production if it is missing.

---

## Client Setup

The configured client is a singleton exported from `src/lib/api/sanity/client.ts`:

```typescript
import { client } from '@/lib/api/sanity/client'

// Direct fetch (rarely used — prefer query functions below)
const data = await client.fetch('*[_type == "product"]')
```

**Client configuration:**

| Option | Value | Notes |
|---|---|---|
| `useCdn` | `true` in production | Reads from Sanity CDN for speed |
| `perspective` | `'published'` | Only serves published content (not drafts) |
| `apiVersion` | `SANITY_API_VERSION` env | Pinned to `v2025-05-21` by default |
| `stega.enabled` | `true` in dev/preview | Source map overlay for Sanity Visual Editing |

**Do not** call `createClient()` directly. Always import the shared `client` instance.

---

## GROQ Query Functions

All query functions live in `src/lib/api/sanity/queries.ts`. They return `null` on error (no throws in consumers).

### Products

#### `getProductsBySpoke(spokeSubdomain)`

Fetch all products for a specific spoke, ordered by title.

```typescript
import { getProductsBySpoke } from '@/lib/api/sanity/queries'

const products = await getProductsBySpoke('pju')
// returns: ProductWithRelations[] | null
// cache tags: ['sanity:product', 'sanity:spoke:pju']
// revalidate: 3600s
```

#### `getProductBySlug(slug)`

Fetch a single product by its URL slug.

```typescript
const product = await getProductBySlug('lampu-jalan-solar-15w')
// returns: ProductWithRelations | null
// cache tags: ['sanity:product']
// revalidate: 3600s
```

#### `getProductSlugsWithSpokes()`

Optimized for `generateStaticParams()`. Returns all `{slug, subdomain}` pairs in a single query — avoids N+1.

```typescript
const slugs = await getProductSlugsWithSpokes()
// returns: Array<{ slug: string; subdomain: string }> | null
// Use in: src/app/(spokes)/[spoke]/products/[slug]/page.tsx
```

### Certifications

#### `getCertifications()`

Fetch all certifications where `isIndexable == true`, ordered by type then title.

```typescript
const certs = await getCertifications()
// returns: Certification[] | null
// cache tags: ['sanity:certification']
```

#### `getCertificationBySlug(slug)`

```typescript
const cert = await getCertificationBySlug('sni-12345-2024')
// returns: Certification | null
```

### Portfolio

#### `getPortfolioEntries(spokeSubdomain?)`

Fetch all portfolio entries, optionally filtered by spoke. Ordered by completion year descending.

```typescript
// All entries
const all = await getPortfolioEntries()

// Filtered to PJU spoke
const pjuEntries = await getPortfolioEntries('pju')
// cache tags: ['sanity:portfolio', 'sanity:spoke:pju']
```

#### `getPortfolioBySlug(slug)`

```typescript
const entry = await getPortfolioBySlug('lampu-jalan-jakarta-selatan')
// returns: PortfolioWithRelations | null
```

### Spoke Configuration

#### `getSpokeConfig(subdomain)`

Fetch spoke branding, hero image, tagline, and featured products for a subdomain.

```typescript
const config = await getSpokeConfig('pju')
// returns: SpokeConfigWithProducts | null
// cache tags: ['sanity:spokeConfig', 'sanity:spoke:pju']
// Use in: spoke layout or page.tsx
```

#### `getAllSpokeConfigs()`

Lightweight query for navigation. Returns only `_id, name, subdomain, tagline, primaryColor`.

```typescript
const spokes = await getAllSpokeConfigs()
// returns: SpokeConfig[] | null
// Use in: Navbar, sitemap generation
```

### Pages

#### `getPageBySlug(slug, spokeSubdomain?)`

Fetch a CMS-managed page. When `spokeSubdomain` is provided, filters to that spoke's pages only.

```typescript
// Hub page
const aboutPage = await getPageBySlug('about-us')

// Spoke-specific page
const pjuFaq = await getPageBySlug('faq', 'pju')
// cache tags: ['sanity:page', 'sanity:spoke:pju']
```

---

## Cache Tag System

Cache tags are the bridge between Sanity content updates and Next.js ISR invalidation.

### Tag Format

```
sanity:{documentType}          — all documents of type
sanity:{documentType}:{id}     — specific document
sanity:spoke:{subdomain}       — all content for a spoke
sanity:all                     — invalidate everything
```

### `CACHE_TAGS` Reference

```typescript
import { CACHE_TAGS } from '@/lib/api/sanity/client'

CACHE_TAGS.product()              // 'sanity:product'
CACHE_TAGS.product('doc-abc123')  // 'sanity:product:doc-abc123'
CACHE_TAGS.certification()        // 'sanity:certification'
CACHE_TAGS.portfolio()            // 'sanity:portfolio'
CACHE_TAGS.spokeConfig()          // 'sanity:spokeConfig'
CACHE_TAGS.spoke('pju')           // 'sanity:spoke:pju'
CACHE_TAGS.page()                 // 'sanity:page'
CACHE_TAGS.all                    // 'sanity:all'
```

### `createFetchOptions()` Helper

Use this when writing new query functions to ensure consistent tagging:

```typescript
import { createFetchOptions, CACHE_TAGS } from '@/lib/api/sanity/client'

const options = createFetchOptions(
  [CACHE_TAGS.product(), CACHE_TAGS.spoke('pju')],
  3600,  // revalidate in seconds (defaults to 3600)
)

await client.fetch(query, { subdomain: 'pju' }, options)
```

---

## Content Types

All TypeScript interfaces are in `src/lib/api/sanity/types.ts`.

### Core Types

| Type | Sanity `_type` | Key Fields |
|---|---|---|
| `Product` | `product` | `title`, `slug`, `spoke`, `shortDescription`, `fullDescription` (Portable Text), `specifications[]`, `images[]`, `datasheetUrl`, `seoMeta` |
| `Certification` | `certification` | `title`, `slug`, `certificationBody`, `certType`, `issueDate`, `expiryDate`, `documentUrl`, `isIndexable`, `seoMeta` |
| `PortfolioEntry` | `portfolioEntry` | `title`, `slug`, `projectType`, `clientCategory`, `location`, `completionYear`, `scopeDescription` (Portable Text), `images[]` |
| `SpokeConfig` | `spokeConfig` | `name`, `subdomain`, `tagline`, `heroImage`, `primaryColor`, `featuredProducts[]`, `seoDefaults` |
| `Page` | `page` | `title`, `slug`, `targetSpoke`, `sections` (Portable Text / CustomBlock), `seoMeta` |

### Enums

```typescript
type CertType = 'SNI' | 'TKDN' | 'LKPP' | 'ISO' | 'Other'
type ClientCategory = 'Government' | 'BUMN' | 'Private' | 'EPC'
```

### Query Result Types (expanded relations)

| Type | Extends | Expanded Fields |
|---|---|---|
| `ProductWithRelations` | `Product` | `spoke` → `{_id, subdomain, name}`, `relatedCertifications` → `{_id, title, slug}[]` |
| `PortfolioWithRelations` | `PortfolioEntry` | `relatedSpoke` → `{_id, subdomain, name}`, `relatedProducts` → `{_id, title, slug}[]` |
| `SpokeConfigWithProducts` | `SpokeConfig` | `featuredProducts` → `{_id, title, slug, shortDescription, images}[]` |
| `PageWithSpoke` | `Page` | `targetSpoke` → `{_id, subdomain, name} \| null` |

### Shared Types

```typescript
// Sanity image reference — pass to urlForImage()
interface ImageAsset {
  _key: string
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

// Use @portabletext/react to render these
type PortableTextBlock = SanityPortableTextBlock
```

---

## Image URL Builder

Three functions are exported from `src/lib/api/sanity/image.ts`.

### `urlForImage(source)` — Chainable builder

Use when you need full control over transformations:

```typescript
import { urlForImage } from '@/lib/api/sanity/image'
import Image from 'next/image'

const imageUrl = urlForImage(product.images[0])
  .width(800)
  .height(600)
  .quality(80)
  .auto('format')   // serves WebP/AVIF automatically
  .url()

<Image src={imageUrl} alt={product.title} width={800} height={600} />
```

### `getOptimizedImageUrl(source, width, height?, quality?)` — Convenience function

Returns a `string | null`. Returns `null` safely when `source` is `null`/`undefined`:

```typescript
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'

const src = getOptimizedImageUrl(product.images[0], 400, 300, 80)
// → 'https://cdn.sanity.io/images/{projectId}/{dataset}/...?w=400&h=300&q=80&auto=format'
// → null if source is null/undefined
```

### `sanityImageLoader` — Next.js Image loader

Configure in `next.config.ts` to use Sanity as the image source for all `<Image>` components:

```typescript
// next.config.ts
import { sanityImageLoader } from '@/lib/api/sanity/image'

const nextConfig = {
  images: {
    loader: sanityImageLoader,
  },
}
```

---

## ISR Revalidation Webhook

When content is published in Sanity Studio, a webhook fires `POST /api/revalidate` to invalidate the affected Next.js cache entries.

### Setup (Sanity Studio → Settings → API → Webhooks)

| Field | Value |
|---|---|
| **URL** | `https://sentradaya.com/api/revalidate` |
| **Method** | `POST` |
| **Trigger on** | Create, Update, Delete |
| **Filter** | `_type in ["product", "certification", "portfolioEntry", "spokeConfig", "page"]` |
| **Secret** | The value of `SANITY_WEBHOOK_SECRET` env var |

### Signature Verification

The endpoint validates every request using HMAC-SHA256:

```
sanity-webhook-signature: sha256={hex digest of body signed with SANITY_WEBHOOK_SECRET}
```

Timing-safe comparison prevents timing attacks. Requests without a valid signature return `401`.

### Document Type → Cache Tag Mapping

| Sanity `_type` | Tags invalidated |
|---|---|
| `product` | `sanity:all`, `sanity:product:{id}`, `sanity:product` |
| `certification` | `sanity:all`, `sanity:certification:{id}`, `sanity:certification` |
| `portfolioEntry` | `sanity:all`, `sanity:portfolio:{id}`, `sanity:portfolio` |
| `spokeConfig` | `sanity:all`, `sanity:spokeConfig:{id}`, `sanity:spokeConfig` |
| `page` | `sanity:all`, `sanity:page:{id}`, `sanity:page` |
| *(unknown type)* | 400 error — not invalidated |

### Health Check

```bash
# Check if webhook secret is configured
curl https://sentradaya.com/api/revalidate
# → { "status": "ok", "webhookConfigured": true }
```

### Testing Revalidation Locally

```bash
# Trigger revalidation without signature (works when SANITY_WEBHOOK_SECRET is unset)
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"_id":"doc-abc123","_type":"product","operation":"update"}'
```

---

## Testing Sanity Integrations

Use the mock at `src/lib/__mocks__/sanity.ts` to avoid live Sanity calls in tests. See [Mocking Specs](../testing/mocking-specs.md) §2 for full patterns.

```typescript
import { mockSanityClient, mockFetch, mockSanityFetch } from '@/lib/__mocks__/sanity'

jest.mock('@sanity/client', () => mockSanityClient)

beforeEach(() => jest.clearAllMocks())

it('fetches products by spoke', async () => {
  mockFetch.mockResolvedValue([{ _id: 'p1', title: 'Product 1' }])

  const result = await getProductsBySpoke('pju')

  expect(mockFetch).toHaveBeenCalledWith(
    expect.stringContaining('spoke.subdomain == $subdomain'),
    { subdomain: 'pju' },
    expect.objectContaining({ next: { revalidate: 3600 } }),
  )
  expect(result).toHaveLength(1)
})
```

---

## Related Documentation

- [`src/lib/api/sanity/`](../../../src/lib/api/sanity/) — Source directory (client, queries, types, image)
- [`src/app/api/revalidate/route.ts`](../../../src/app/api/revalidate/route.ts) — Webhook handler
- [Mocking Specs](../testing/mocking-specs.md) — How to mock Sanity in tests
- [Data Codemap](../../CODEMAPS/data.md) — Token-lean data layer overview
- [TDD v1](../architecture/tdd-v1.md) — Testing strategy and coverage targets

---

*Last modified: 2026-05-26*
