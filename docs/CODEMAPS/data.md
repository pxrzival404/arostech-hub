# Data Codemap

<!-- Generated: 2026-07-22 | Files scanned: 21 data-related | Token estimate: ~900 -->

## Sanity CMS Integration (Active)

### Client (`src/lib/api/sanity/client.ts`, 88 lines)
```
createClient({ projectId, dataset, apiVersion, useCdn, perspective: 'published', stega })
CACHE_TAGS → sanity:product | sanity:certification | sanity:portfolio | sanity:spoke:* | sanity:page | sanity:all
createFetchOptions(tags, revalidate?) → { next: { revalidate: 3600, tags } }
```

### Queries (`src/lib/api/sanity/queries.ts`, 429 lines)

| Function | GROQ Type | Cache Tags |
|----------|-----------|-----------|
| `getProductsBySpoke(subdomain)` | `*[_type=="product" && spoke.subdomain==$subdomain]` | product + spoke |
| `getProductBySlug(slug)` | `*[_type=="product" && slug.current==$slug][0]` | product |
| `getProductSlugsWithSpokes()` | `*[_type=="product"]{slug, subdomain}` | product |
| `getCertifications()` | `*[_type=="certification" && isIndexable==true]` | certification |
| `getCertificationBySlug(slug)` | `*[_type=="certification"...][0]` | certification |
| `getPortfolioEntries(spoke?)` | `*[_type=="portfolioEntry"]` | portfolio ± spoke |
| `getPortfolioBySlug(slug)` | `*[_type=="portfolioEntry"...][0]` | portfolio |
| `getSpokeConfig(subdomain)` | `*[_type=="spokeConfig" && subdomain==$subdomain][0]` | spokeConfig + spoke |
| `getAllSpokeConfigs()` | `*[_type=="spokeConfig"]` | spokeConfig |
| `getPageBySlug(slug, spoke?)` | `*[_type=="page"...][0]` | page ± spoke |

### Types (`src/lib/api/sanity/types.ts`, 272 lines)

| Type | Fields |
|------|--------|
| `Product` | _id, title, slug, spoke, shortDescription, fullDescription (PortableText), specifications, images, datasheetUrl, relatedCertifications, seoMeta |
| `Certification` | _id, title, slug, certificationBody, certType (SNI/TKDN/LKPP/ISO/Other), issueDate, expiryDate, documentUrl, coverImage, isIndexable, seoMeta |
| `PortfolioEntry` | _id, title, slug, projectType, clientCategory (Government/BUMN/Private/EPC), location, completionYear, scopeDescription, outcome, images, relatedSpoke, relatedProducts, seoMeta |
| `SpokeConfig` | _id, name, subdomain, tagline, heroImage, primaryColor, featuredProducts, seoDefaults |
| `Page` | _id, title, slug, targetSpoke, sections, seoMeta |
| `ProductWithRelations` | Product + expanded spoke{_id, subdomain, name} + expanded relatedCertifications |
| `PortfolioWithRelations` | PortfolioEntry + expanded relatedSpoke + relatedProducts |
| `SpokeConfigWithProducts` | SpokeConfig + expanded featuredProducts{_id, title, slug, shortDescription, images} |

### Image Helper (`src/lib/api/sanity/image.ts`, 69 lines)
```
imageUrlBuilder(client) → urlFor(source).width(w).height(h).auto('format').url()
```

## Static Data Layer

### Articles (`src/lib/api/articles.ts`, 174 lines)
```
Article { id, slug, title, category, excerpt, content, author, publishedAt, readingTime }
articles: Article[]  → 6 static articles (Energi Terbarukan, Regulasi, Industri, Teknik, Teknologi)
getArticleBySlug(slug) → Article | undefined
```

## Validation Schemas

### RFQ (`src/lib/schema/rfq-schemas.ts`, 183 lines)
Composite schemas built from atomic sub-schemas:
- **`contactInfoSchema`**: contact details (`contact_name`, `contact_email`, `contact_phone` as +62 Indonesian format, `company_name`)
- **`rfqMetaSchema`**: project metadata (`project_scope`, `timeline` as YYYY-MM-DD, `notes`)
- **`rfqCartItemSchema`**: single cart item (`product_id` Sanity `_id`, `product_name`, `quantity` integer clamped [1, 100,000], optional `variant`, optional `item_notes` max 1000)
- **`rfqItemsArraySchema`**: list of items (`items` array constrained to [1, 50] items to prevent empty/huge submissions)
- **`rfqB2BSchema`** / **`rfqB2GSchema`**: final strict schemas composed using `.merge()`, containing all above fields plus `segment: "B2B"|"B2G"`, `sourceTrackingSchema` fields, and B2G specific fields (`procurement_type` enum, optional `dipa_reference`).


### Env (`src/lib/config/env.ts`)
```
sanityEnvSchema: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION, SANITY_API_READ_TOKEN, SANITY_API_WRITE_TOKEN?, SANITY_WEBHOOK_SECRET?
middlewareEnvSchema: NEXT_PUBLIC_ROOT_DOMAIN, NEXT_PUBLIC_SITE_URL
databaseEnvSchema: DATABASE_URL
authEnvSchema: NEXTAUTH_SECRET, NEXTAUTH_URL
notificationEnvSchema: RESEND_API_KEY, RESEND_FROM_EMAIL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, WHATSAPP_SALES_NUMBER
```

## ISR Revalidation Pattern
```
Sanity → Webhook → POST /api/revalidate → revalidateTag('sanity:product') → ISR refresh
Default revalidate: 3600s (1 hour) per fetch
```

## Database Layer (Active)

Prisma models and fields mapped to PostgreSQL tables:

### `User` (mapped to `users` table)
- **Fields**:
  - `id` (String, `@id`, default CUID)
  - `email` (String, `@unique`, VarChar 255)
  - `emailVerified` (DateTime, optional)
  - `image` (String, optional)
  - `name` (String, VarChar 255)
  - `role` (Role enum: ADMIN, VIEWER, CLIENT; default ADMIN)
  - `createdAt` (DateTime, default now)
  - `linkedLeadId` (String, optional, soft link)
  - `clientCompanyName` (String, optional, VarChar 255)
  - `trackingScopeType` (TrackingScopeType enum: PROJECT, ORDER; optional)
  - `trackingScopeIds` (Json, optional, authorized IDs array)
  - `lastLoginAt` (DateTime, optional)
  - `isActive` (Boolean, default true)
- **Relations**:
  - `accounts` (Account[])
  - `sessions` (Session[])
- **Indexes**:
  - `@@index([email])`
  - `@@index([linkedLeadId])`
  - `@@index([role])`

### `Lead` (mapped to `leads` table)
- **Fields**:
  - `id` (String, `@id`, default CUID)
  - `createdAt` (DateTime, default now)
  - `updatedAt` (DateTime, `@updatedAt`)
  - `segment` (Segment enum: B2G, B2B)
  - `sourceDomain` (String, VarChar 255)
  - `sourcePagePath` (String, VarChar 512)
  - `sourceCampaignTag` (String, optional, VarChar 255)
  - `utmSource`, `utmMedium`, `utmCampaign` (String, optional, VarChar 255)
  - `contactName` (String, optional, VarChar 255)
  - `contactEmail` (String, optional, @unique, VarChar 255)
  - `contactPhone` (String, optional, VarChar 50)
  - `companyName` (String, optional, VarChar 255)
  - `productCategory` (String, optional, VarChar 255)
  - `quantity` (Int, optional, sum of all item quantities)
  - `projectScope` (String, optional, Text)
  - `timeline` (String, optional, VarChar 255)
  - `procurementType` (String, optional, VarChar 255, B2G only)
  - `notes` (String, optional, Text)
  - `submissionStatus` (SubmissionStatus enum: RECEIVED, CONTACTED, QUALIFIED, DISQUALIFIED; default RECEIVED)
  - `fallbackTriggered` (Boolean, default false)
  - `fallbackWaUrl` (String, optional, Text)
  - `trackingProjectId` (String, optional, VarChar 255)
  - `dashboardAccessGrantedAt` (DateTime, optional)
  - `dashboardAccessStatus` (DashboardAccessStatus enum: NOT_ELIGIBLE, PENDING, GRANTED, REVOKED; default NOT_ELIGIBLE)
- **Indexes**:
  - `@@index([segment, createdAt])`
  - `@@index([sourceDomain])`
  - `@@index([contactEmail])`
  - `@@index([submissionStatus])`

### `Account` (mapped to `accounts` table)
- **Fields**: `id`, `userId` (FK to User), `type`, `provider`, `providerAccountId`, `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`.
- **Relations**: `user` User (relation fields: `userId`, references: `id`, onDelete: Cascade).
- **Constraints**: `@@unique([provider, providerAccountId])`

### `Session` (mapped to `sessions` table)
- **Fields**: `id`, `sessionToken` (String, `@unique`), `userId` (FK to User), `expires` (DateTime).
- **Relations**: `user` User (relation fields: `userId`, references: `id`, onDelete: Cascade).

### `VerificationToken` (mapped to `verification_tokens` table)
- **Fields**: `identifier` (String), `token` (String, `@unique`), `expires` (DateTime).
- **Constraints**: `@@unique([identifier, token])`

### `RedirectMap` (mapped to `redirect_map` table)
- **Fields**: `legacyUrl` (String, `@id`), `targetUrl` (String, VarChar 1024), `spoke` (String, VarChar 100).
- **Indexes**: `@@index([legacyUrl])`