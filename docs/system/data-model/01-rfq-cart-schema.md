---
id: SYS-DATA-01
title: "Data Model 01: Universal RFQ Submission & Cart Schema Contracts"
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_data_model"
authoritative_references:
  prisma_schema: "file:///d:/dev/arostech-hub/prisma/schema.prisma#L20-L80"
  prd_rfq: "file:///d:/dev/arostech-hub/docs/strategy/prd/01-domain-rfq-cart-schema.md"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md#L68-L115"
---

# Data Model 01: Universal RFQ Submission & Cart Schema Contracts

> **TL;DR**: Defines the canonical declarative Zod schemas, TypeScript types, and Prisma relational models for Universal RFQ multi-item cart submissions and notification jobs.

---

## 1. Declarative Zod Schemas & TypeScript Types

All quote inquiries submitted via Hub (`dayaberkah.id`) or product spoke subdomains MUST conform to `rfqSubmissionSchema`.

```typescript
import { z } from "zod";

export const contactInfoSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  companyName: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
});

export const rfqMetaSchema = z.object({
  sourceDomain: z.string(),
  sourcePagePath: z.string(),
  procurementType: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
});

export const rfqCartItemSchema = z.object({
  spokeSegment: z.enum(["pju", "solarcell", "alatpetir", "baterai"]),
  productCategory: z.string().min(2, "Kategori produk wajib diisi"),
  quantity: z.number().int().positive("Jumlah harus angka positif"),
  unitOfMeasure: z.string().min(1, "Satuan unit wajib diisi"),
  unitPriceEstimate: z.number().nonnegative().optional(),
  projectScope: z.string().min(10, "Rincian scope proyek minimal 10 karakter"),
  timeline: z.string().optional(),
  notes: z.string().optional(),
});

export const rfqSubmissionSchema = z.object({
  contact: contactInfoSchema,
  meta: rfqMetaSchema,
  items: z.array(rfqCartItemSchema).min(1, "Minimal 1 barang dalam keranjang RFQ"),
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type RfqMeta = z.infer<typeof rfqMetaSchema>;
export type RfqCartItem = z.infer<typeof rfqCartItemSchema>;
export type RfqSubmission = z.infer<typeof rfqSubmissionSchema>;
```

### 1.2 Spoke Metadata & Client-Side Cart Schema
```typescript
export const productSpokeMetaSchema = z.object({
  spokeSegment: z.enum(["pju", "solarcell", "alatpetir", "baterai"]),
  spokeName: z.string().min(2),
  canonicalDomain: z.string().url(),
  primaryCategory: z.string(),
  tkdnCertified: z.boolean().default(true),
  sniCertified: z.boolean().default(true),
});

export const cartItemSchema = z.object({
  id: z.string(),
  spokeSegment: z.enum(["pju", "solarcell", "alatpetir", "baterai"]),
  productCategory: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitOfMeasure: z.string().min(1),
  unitPriceEstimate: z.number().optional(),
  projectScope: z.string().optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
});

export type ProductSpokeMeta = z.infer<typeof productSpokeMetaSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
```

---

## 2. Prisma Models (Neon Postgres)

```prisma
enum SubmissionStatus {
  RECEIVED
  CONTACTED
  QUALIFIED
  DISQUALIFIED
}

enum DashboardAccessStatus {
  NOT_ELIGIBLE
  PENDING
  GRANTED
  REVOKED
}

model RfqSubmission {
  id                       String                @id @default(cuid())
  createdAt                DateTime              @default(now()) @map("created_at")
  updatedAt                DateTime              @updatedAt @map("updated_at")
  
  fullName                 String                @map("full_name") @db.VarChar(255)
  email                    String                @map("email") @db.VarChar(255)
  phone                    String                @map("phone") @db.VarChar(50)
  companyName              String                @map("company_name") @db.VarChar(255)
  
  sourceDomain             String                @map("source_domain") @db.VarChar(255)
  sourcePagePath           String                @map("source_page_path") @db.VarChar(512)
  procurementType          String?               @map("procurement_type") @db.VarChar(255)
  utmSource                String?               @map("utm_source") @db.VarChar(255)
  utmMedium                String?               @map("utm_medium") @db.VarChar(255)
  utmCampaign              String?               @map("utm_campaign") @db.VarChar(255)
  utmTerm                  String?               @map("utm_term") @db.VarChar(255)
  utmContent               String?               @map("utm_content") @db.VarChar(255)
  
  submissionStatus         SubmissionStatus      @default(RECEIVED) @map("submission_status")
  fallbackTriggered        Boolean               @default(false) @map("fallback_triggered")
  fallbackWaUrl            String?               @map("fallback_wa_url") @db.Text
  
  trackingProjectId        String?               @map("tracking_project_id") @db.VarChar(255)
  dashboardAccessGrantedAt DateTime?             @map("dashboard_access_granted_at")
  dashboardAccessStatus    DashboardAccessStatus @default(NOT_ELIGIBLE) @map("dashboard_access_status")
  
  items                    RfqLineItem[]
  notificationJobs         NotificationJob[]
  
  @@index([sourceDomain])
  @@index([email])
  @@index([submissionStatus])
  @@map("rfq_submissions")
}

model RfqLineItem {
  id                String        @id @default(cuid())
  rfqSubmissionId   String        @map("rfq_submission_id")
  rfqSubmission     RfqSubmission @relation(fields: [rfqSubmissionId], references: [id], onDelete: Cascade)
  
  spokeSegment      String        @map("spoke_segment") @db.VarChar(50)
  productCategory   String        @map("product_category") @db.VarChar(255)
  quantity          Int           @map("quantity")
  unitOfMeasure     String        @map("unit_of_measure") @db.VarChar(50)
  unitPriceEstimate Decimal?      @map("unit_price_estimate") @db.Decimal(12, 2)
  projectScope      String        @map("project_scope") @db.Text
  timeline          String?       @map("timeline") @db.VarChar(255)
  notes             String?       @map("notes") @db.Text
  createdAt         DateTime      @default(now()) @map("created_at")

  @@index([rfqSubmissionId])
  @@index([spokeSegment])
  @@map("rfq_line_items")
}
```

---

## 3. OpenSpec Behavioral Contracts

### Requirement: REQ-DATA-001-UNIVERSAL-RFQ-SCHEMA
The system MUST validate all inbound quotes using `rfqSubmissionSchema` and require `companyName` as a non-empty string.

#### Scenario: Unified Ingestion Without Segment Discrimination
- GIVEN a user submitting an RFQ form on `solarcell.dayaberkah.id`
- WHEN the submission payload is processed by the API route handler
- THEN the system MUST validate the payload against `rfqSubmissionSchema`
- AND reject requests where `companyName` or `items` array is empty or missing.
