---
id: PRD-MOD-01
title: "PRD Module 01: Universal RFQ Cart Schema, Data Models & Telemetry"
version: 4.0.0
status: LOCKED_BASELINE
architecture: Hub-and-Spoke Greenfield
target_domain: dayaberkah.id
graphify_community: "community_prd"
authoritative_references:
  data_model: "file:///d:/dev/arostech-hub/docs/system/data-model/01-rfq-cart-schema.md"
  prisma_schema: "file:///d:/dev/arostech-hub/prisma/schema.prisma#L1-L100"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md#L50-L120"
---

# PRD Module 01: Universal RFQ Cart Schema, Data Models & Telemetry

> **TL;DR**: Specifies the composite multi-item cart data model, Sanity CMS content schemas, transactional database tables (`rfq_submissions` & `rfq_line_items`), GA4 telemetry instrumentation, and formal acceptance test cases.

---

## 1. Content Management Schemas (Sanity.io)

All marketing and catalog content is managed in **Sanity.io** as the single source of truth:
- **Product**: `title`, `slug`, `spoke`, `shortDescription`, `fullDescription`, `specifications` (array of KV pairs), `images`, `datasheetFile`, `relatedCertifications`, `seoMeta`.
- **Certification**: `title`, `slug`, `certificationBody`, `certType` (SNI | TKDN | LKPP | ISO | Other), `issueDate`, `expiryDate`, `documentFile`, `coverImage`, `isIndexable`.
- **PortfolioEntry**: `title`, `slug`, `projectType`, `clientCategory` (Government | BUMN | Private | EPC), `location`, `completionYear`, `scopeDescription`, `outcome`, `images`, `relatedSpoke`.
- **SpokeConfig**: `name`, `subdomain`, `tagline`, `heroImage`, `primaryColor`, `featuredProducts`, `seoDefaults`.

---

## 2. Transactional Database Models (Neon Postgres)

All inquiries and user access data MUST be persisted in Neon Postgres via Prisma ORM using a two-table header-child model:

### 2.1 `rfq_submissions` (Submission Header)
- `id` (CUID), `created_at`, `updated_at`
- `source_domain`, `source_page_path`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` (nullable client-captured strings)
- `contact_name`, `contact_email`, `contact_phone`, `company_name` (string — required)
- `procurement_type` (nullable string — optional for all users)
- `submission_status` (enum: received | contacted | qualified | disqualified)
- `notes` (nullable string — general buyer context)
- `source_campaign_tag` (nullable string — internal sales tag)
- `fallback_triggered` (boolean), `fallback_wa_url` (nullable string)
- `tracking_project_id` (nullable string), `dashboard_access_status` (enum: not_eligible | pending | granted | revoked)

### 2.2 `rfq_line_items` (Cart Items)
- `id` (CUID)
- `rfq_submission_id` (FK → `rfq_submissions.id`, `ON DELETE CASCADE`)
- `spoke_segment` (enum: pju | solarcell | alatpetir | baterai)
- `product_category` (string)
- `quantity` (integer, > 0)
- `unit_of_measure` (string — required)
- `unit_price_estimate` (nullable decimal — optional buyer budget)
- `project_scope` (string, min 10 chars)
- `timeline` (nullable string)
- `notes` (nullable string — technical specifications)

---

## 3. Analytics & Telemetry Strategy

The platform MUST track user lifecycle events in Google Analytics 4 (GA4):

| Event Name | Trigger | Key Parameters |
|---|---|---|
| `whatsapp_click` | User taps any WhatsApp CTA | `source_page`, `spoke`, `cta_location` |
| `rfq_start` | User focuses first RFQ field | `form_type` ("universal"), `spoke`, `source_page` |
| `rfq_submit_attempt` | User clicks submit on RFQ form | `form_type` ("universal"), `spoke`, `field_count_filled` |
| `rfq_submit_success` | RFQ API returns 201 | `form_type` ("universal"), `spoke`, `source_domain` |
| `rfq_submit_failure` | RFQ API returns non-2xx | `error_code`, `fallback_triggered` (true) |
| `file_download` | User downloads document/datasheet | `file_name`, `file_type`, `cert_type`, `spoke` |
| `dashboard_login_success` | Client logs into dashboard | `user_role`, `linked_rfq_submission_id` |
| `tracking_status_view` | Client views project tracking | `tracking_scope_type`, `tracking_id` |

---

## 4. Acceptance Criteria & Test Cases

### REQ-001: Main Hub Trust Platform
- **GIVEN** a buyer on `dayaberkah.id`
- **WHEN** clicking any spoke navigation link
- **THEN** the browser MUST route to the corresponding spoke subdomain.

### REQ-004: Universal RFQ System
- **GIVEN** an RFQ submission with contact details and at least one line item
- **WHEN** submitted to `/api/rfq`
- **THEN** the system MUST persist records in `rfq_submissions` and `rfq_line_items`
- **AND** return `201 Created` with a standard response envelope.

---

## 5. OpenSpec Behavioral Contracts

### Requirement: REQ-CART-001-COMPOSITE-STORAGE
The backend service SHALL store multi-item RFQ inquiries across header and child tables within an atomic transaction.

#### Scenario: Multi-spoke cart checkout
- GIVEN a cart containing items from multiple spokes (e.g. PJU and Solar Cell)
- WHEN the user submits the RFQ form
- THEN the system MUST insert one `rfq_submissions` header record and multiple `rfq_line_items` child records inside a database transaction.
