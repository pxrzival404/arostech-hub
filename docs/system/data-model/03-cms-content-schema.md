---
id: SYS-DATA-03
title: "Data Model 03: Sanity CMS Content Schemas & GROQ Bindings"
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_data_model"
authoritative_references:
  sanity_guide: "file:///d:/dev/arostech-hub/docs/engineering/playbooks/sanity-cms-guide.md"
  prd_cms: "file:///d:/dev/arostech-hub/docs/strategy/prd/01-domain-rfq-cart-schema.md"
---

# Data Model 03: Sanity CMS Content Schemas & GROQ Bindings

> **TL;DR**: Defines the Sanity.io headless CMS schemas for products, certifications, portfolio showcases, and spoke configurations, including GROQ query contracts and ISR revalidation patterns.

---

## 1. Sanity Document Schemas

All marketing and catalog schemas in `studio/schemas/` MUST conform to these type contracts:

### 1.1 `product` Schema
```typescript
export interface SanityProduct {
  _id: string;
  _type: "product";
  title: string;
  slug: { current: string };
  spoke: { _ref: string };
  shortDescription: string;
  fullDescription: any[]; // Portable Text
  specifications: Array<{ key: string; value: string }>;
  images: Array<{ asset: { _ref: string } }>;
  datasheetFile?: { asset: { _ref: string } };
  relatedCertifications?: Array<{ _ref: string }>;
  seoMeta: {
    title?: string;
    description?: string;
    ogImage?: { asset: { _ref: string } };
  };
}
```

### 1.2 `certification` Schema
```typescript
export interface SanityCertification {
  _id: string;
  _type: "certification";
  title: string;
  slug: { current: string };
  certificationBody: string;
  certType: "SNI" | "TKDN" | "LKPP" | "ISO" | "Other";
  issueDate: string;
  expiryDate?: string;
  documentFile: { asset: { _ref: string } };
  coverImage?: { asset: { _ref: string } };
  isIndexable: boolean;
}
```

### 1.3 `portfolioEntry` Schema
```typescript
export interface SanityPortfolioEntry {
  _id: string;
  _type: "portfolioEntry";
  title: string;
  slug: { current: string };
  projectType: string;
  clientCategory: "Government" | "BUMN" | "Private" | "EPC";
  location: string;
  completionYear: number;
  scopeDescription: any[]; // Portable Text
  outcome: string;
  images: Array<{ asset: { _ref: string } }>;
  relatedSpoke: { _ref: string };
}
```

---

## 2. GROQ Data Fetching & ISR Rules

1. **Strict Query Definition**: Queries MUST use `defineQuery()` from `next-sanity` or `groq` with exact projection fields to optimize Cloudflare edge bundle sizes.
2. **Null-on-Error Pattern**: CMS queries SHALL degrade gracefully by returning `null` or empty arrays on fetch failure rather than throwing unhandled runtime exceptions.
3. **ISR Tag Revalidation**: Sanity webhook events trigger targeted `revalidateTag()` calls for specific spokes and product slugs.

---

## 3. OpenSpec Behavioral Contracts

### Requirement: REQ-CMS-001-TYPE-SAFETY
Frontend components SHALL consume CMS data through typed interfaces generated from Sanity schema definitions.

#### Scenario: Rendering product specification table
- GIVEN a product document fetched from Sanity CMS
- WHEN rendering the specifications block on `pju.dayaberkah.id`
- THEN the component MUST validate and render the key-value pairs without triggering runtime undefined errors.
