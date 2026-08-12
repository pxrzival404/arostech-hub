---
id: SYS-DATA-MODEL-001
title: Declarative System Data Model & Schema Contracts
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_data_model"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L636-L797"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md#L68-L115"
  prisma_schema: "file:///d:/dev/arostech-hub/prisma/schema.prisma#L1-L200"
---

# Declarative System Data Model & Schema Contracts

> **OpenSpec SDD Lifecycle Mapping**: `ADDED: 2026-08-12 PRD v4.0.0 Greenfield Baseline`  
> **Authoritative Baseline Reference**: This document defines the canonical declarative data schemas, TypeScript interfaces, and database entities for the **DBSN Centralized Digital Ecosystem**, fully synchronized with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L636-L797)) and the production database schema ([`schema.prisma`](file:///d:/dev/arostech-hub/prisma/schema.prisma#L1-L200)).

---

## 1. Executive Summary & Legacy Rot Elimination

The DBSN platform SHALL operate on a **Unified Greenfield Data Architecture**. All legacy branching schemas (`rfqB2BSchema`, `rfqB2GSchema`), legacy URL mapping tables (`redirect_map`), and Cloudflare Edge redirect lookups have been **permanently eliminated**.

### Key Architectural Invariants
1. **Universal Ingestion**: Single unified composite RFQ schema (`rfqSubmissionSchema`) without top-level `segment` discriminators or `z.discriminatedUnion` branches.
2. **Scoped Access Control**: Auth.js v5 session model enforcing row-level client project filtering via `trackingScopeIds`.
3. **No Redirect Engine Table Rot**: Native Next.js 16 SEO Metadata API (`sitemap.ts`, `robots.ts`, JSON-LD) replaces all legacy 301 redirect engine tables.

---

## 2. Declarative Zod Schemas & TypeScript Interfaces

### 2.1 Universal RFQ Submission Contracts

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

### 2.2 Product Spoke Metadata & Cart Items Schemas

Product spoke metadata and client-side shopping cart state SHALL use `productSpokeMetaSchema` and `cartItemSchema`.

```typescript
import { z } from "zod";

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

### 2.3 Auth.js v5 JWT Session Contracts (`authSessionSchema`)

Session objects returned by Auth.js v5 SHALL be validated using `authSessionSchema`.

```typescript
import { z } from "zod";

export const userRoleEnum = z.enum(["admin", "viewer", "client"]);

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable().optional(),
  role: userRoleEnum,
  trackingScopeIds: z.array(z.string()).nullable(),
});

export const authSessionSchema = z.object({
  user: authUserSchema,
  expires: z.string(),
});

export type UserRole = z.infer<typeof userRoleEnum>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
```

---

## 3. Transactional Database Models (Neon Postgres via Prisma ORM)

The relational schema in Neon Postgres MUST conform to the baseline defined in [`schema.prisma`](file:///d:/dev/arostech-hub/prisma/schema.prisma#L1-L200), structured around a composite multi-item cart relationship (`rfq_submissions` header table and `rfq_line_items` child table).

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

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

enum Role {
  ADMIN
  VIEWER
  CLIENT
}

enum TrackingScopeType {
  PROJECT
  ORDER
}

model RfqSubmission {
  id                       String                @id @default(cuid())
  createdAt                DateTime              @default(now()) @map("created_at")
  updatedAt                DateTime              @updatedAt @map("updated_at")
  
  // Contact Information
  fullName                 String                @map("full_name") @db.VarChar(255)
  email                    String                @map("email") @db.VarChar(255)
  phone                    String                @map("phone") @db.VarChar(50)
  companyName              String                @map("company_name") @db.VarChar(255)
  
  // Submission Metadata & Attribution
  sourceDomain             String                @map("source_domain") @db.VarChar(255)
  sourcePagePath           String                @map("source_page_path") @db.VarChar(512)
  procurementType          String?               @map("procurement_type") @db.VarChar(255)
  utmSource                String?               @map("utm_source") @db.VarChar(255)
  utmMedium                String?               @map("utm_medium") @db.VarChar(255)
  utmCampaign              String?               @map("utm_campaign") @db.VarChar(255)
  utmTerm                  String?               @map("utm_term") @db.VarChar(255)
  utmContent               String?               @map("utm_content") @db.VarChar(255)
  
  // Status tracking & Fallback
  submissionStatus         SubmissionStatus      @default(RECEIVED) @map("submission_status")
  fallbackTriggered        Boolean               @default(false) @map("fallback_triggered")
  fallbackWaUrl            String?               @map("fallback_wa_url") @db.Text
  
  // Dashboard Provisioning
  trackingProjectId        String?               @map("tracking_project_id") @db.VarChar(255)
  dashboardAccessGrantedAt DateTime?             @map("dashboard_access_granted_at")
  dashboardAccessStatus    DashboardAccessStatus @default(NOT_ELIGIBLE) @map("dashboard_access_status")
  
  // Relational Child Items (1-to-many relationship with rfq_line_items)
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

model User {
  id                String             @id @default(cuid())
  email             String             @unique @map("email") @db.VarChar(255)
  emailVerified     DateTime?          @map("email_verified")
  hashedPassword    String?            @map("hashed_password")
  image             String?
  name              String             @map("name") @db.VarChar(255)
  role              Role               @default(ADMIN)
  createdAt         DateTime           @default(now()) @map("created_at")
  
  linkedRfqId       String?            @map("linked_rfq_id") @db.VarChar(255)
  clientCompanyName String?            @map("client_company_name") @db.VarChar(255)
  
  trackingScopeType TrackingScopeType? @map("tracking_scope_type")
  trackingScopeIds  Json?              @map("tracking_scope_ids")
  
  lastLoginAt       DateTime?          @map("last_login_at")
  isActive          Boolean            @default(true) @map("is_active")
  
  accounts          Account[]
  sessions          Session[]
  
  @@index([email])
  @@index([linkedRfqId])
  @@index([role])
  @@map("users")
}

model Account {
  id                 String  @id @default(cuid())
  userId             String  @map("user_id")
  type               String
  provider           String
  providerAccountId  String  @map("provider_account_id")
  refresh_token      String? @db.Text
  access_token       String? @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String? @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

enum NotificationType {
  EMAIL_ACK
  EMAIL_INTERNAL
  TELEGRAM
}

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model NotificationJob {
  id              String           @id @default(cuid())
  type            NotificationType
  rfqSubmissionId String           @map("rfq_submission_id")
  rfqSubmission   RfqSubmission   @relation(fields: [rfqSubmissionId], references: [id], onDelete: Cascade)
  payload         Json
  status          JobStatus        @default(PENDING)
  attempts        Int              @default(0)
  maxAttempts     Int              @default(3)
  lastAttemptAt   DateTime?        @map("last_attempt_at")
  nextAttemptAt   DateTime?        @map("next_attempt_at")
  errorLog        String?          @map("error_log") @db.Text
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  @@index([status, nextAttemptAt])
  @@index([rfqSubmissionId])
  @@map("notification_jobs")
}

---

## 4. Explicit Deprecation & Legacy Schema Supersession Notice

The Greenfield PRD v4.0.0 establishes strict deprecation boundaries for legacy data contracts and tables. All application code, validation layers, and database migrations SHALL comply with the following supersession rules:

| Deprecated Asset | Asset Type | Status in Greenfield PRD v4.0.0 | Superseding Replacement | Architectural Rationale |
|------------------|------------|----------------------------------|-------------------------|------------------------|
| `rfqB2BSchema` | Zod Schema / Type | **DEPRECATED & SUPERSEDED** | `rfqSubmissionSchema` | Replaced by composite multi-item cart validation without branch discriminators. |
| `rfqB2GSchema` | Zod Schema / Type | **DEPRECATED & SUPERSEDED** | `rfqSubmissionSchema` | Segment-specific rules folded into optional `procurementType` attribute in `rfqMetaSchema`. |
| `redirect_map` | Postgres Database Table | **DEPRECATED & PERMANENTLY REMOVED** | Next.js 16 Native Metadata API (`sitemap.ts`, `robots.ts`) | Edge redirect table rot eliminated; static SEO metadata replaces database table lookups. |

### Deprecation Policy Rules:
1. **Zero Reference Rule**: Route handlers and UI components MUST NOT import or reference `rfqB2BSchema`, `rfqB2GSchema`, or `redirect_map`.
2. **Schema Invariant**: All submission processing MUST validate payloads exclusively via `rfqSubmissionSchema`.
3. **Database Migration Safety**: Production migrations MUST execute drop statements for the legacy `redirect_map` table and map all composite quotes into header-child `rfq_submissions` and `rfq_line_items` tables.

---

## 5. Behavioral Contracts

### Requirement: REQ-DATA-001-UNIVERSAL-RFQ-SCHEMA
The system MUST validate all inbound quotes using `rfqSubmissionSchema` and require `companyName` as a non-empty string.

#### Scenario: Unified Ingestion Without Segment Discrimination
- GIVEN a user submitting an RFQ form on `solarcell.dayaberkah.id`
- WHEN the submission payload is processed by the API route handler
- THEN the system MUST validate the payload against `rfqSubmissionSchema`
- AND reject requests where `companyName` or `items` array is empty or missing.

### Requirement: REQ-DATA-002-AUTH-SESSION-SCHEMA
Auth.js v5 sessions for `role: "client"` MUST include a valid `trackingScopeIds` string array.

#### Scenario: Session Authorization with Tracking Scope Array
- GIVEN a client logged in on `dashboard.dayaberkah.id`
- WHEN retrieving session info via `/api/auth/session`
- THEN the system MUST return an `AuthSession` payload matching `authSessionSchema`
- AND populate `user.trackingScopeIds` with authorized project identifiers.

### Requirement: REQ-DATA-003-LEGACY-SCHEMA-ELIMINATION
The application codebase MUST NOT use legacy branching schemas (`rfqB2BSchema`, `rfqB2GSchema`) or legacy redirect engine tables (`redirect_map`).

#### Scenario: Prohibition of Deprecated Branch Schemas and Redirect Tables
- GIVEN an application build or schema migration execution
- WHEN validating type definitions and database schemas
- THEN all submission handlers MUST exclusively reference `rfqSubmissionSchema`
- AND all SEO routing MUST rely on native Next.js 16 metadata structures instead of redirect mapping tables.

---

## 6. Graphify Anchoring & References

- Knowledge Graph Node ID: `doc:docs/system/data-model.md`
- Graphify Community: `community_data_model`
- Authoritative PRD Reference: [`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L636-L797)
- API Reference Contract: [`reference.md`](file:///d:/dev/arostech-hub/docs/system/api/reference.md#L1-L100)
- Prisma Schema Reference: [`schema.prisma`](file:///d:/dev/arostech-hub/prisma/schema.prisma#L1-L200)
