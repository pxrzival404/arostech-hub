# Public API Reference Contracts

This document serves as the canonical contract reference for all public API endpoints provided by the **DBSN Centralized Digital Ecosystem**.

---

## 1. Request for Quotation (RFQ) Engine (`/api/rfq`)

Handles incoming quote requests from Hub and Spoke landing pages. Data is validated and stored in Neon Postgres via Prisma, with automated double-channel failover (Resend email + Telegram bot).

- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

### Request Body Schema (Zod)

```typescript
const rfqSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  company: z.string().optional(),
  spokeSegment: z.enum(["hub", "pju", "solarcell", "alatpetir", "baterai"]),
  projectDetails: z.string().min(10, "Rincian proyek minimal 10 karakter"),
});
```

### Success Response (`201 Created`)

```json
{
  "success": true,
  "message": "RFQ successfully recorded",
  "data": {
    "rfqId": "rfq_clx123abc456",
    "timestamp": "2026-08-07T04:20:00.000Z"
  }
}
```

### Error Response (`400 Bad Request` / `500 Server Error`)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Format email tidak valid"
    }
  ]
}
```

---

## 2. Authentication API (`/api/auth/*`)

Managed by **Auth.js v5** (NextAuth edge runtime JWT adapter).

- `GET/POST /api/auth/signin` — Initiates Auth.js session flow.
- `GET/POST /api/auth/callback/[provider]` — OAuth callback handler (Google OAuth).
- `GET /api/auth/session` — Resolves current JWT session token.

### Auth Session Object

```json
{
  "user": {
    "name": "Admin DBSN",
    "email": "admin@dayaberkah.id",
    "image": "https://lh3.googleusercontent.com/a/...",
    "role": "admin"
  },
  "expires": "2026-09-07T04:20:00.000Z"
}
```

---

## 3. Sanity ISR Revalidation Webhook (`/api/revalidate`)

Triggered by Sanity CMS webhooks upon document publication or modification to perform Incremental Static Regeneration (ISR).

- **HTTP Method**: `POST`
- **Headers Required**: `x-sanity-webhook-signature`

### Payload Body

```json
{
  "_type": "productSpoke",
  "slug": "pju-solar-all-in-one"
}
```

### Success Response (`200 OK`)

```json
{
  "revalidated": true,
  "now": 1723004400000
}
```
