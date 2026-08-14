---
id: SYS-DATA-02
title: "Data Model 02: Auth.js v5 Session & User Authorization Schema"
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_data_model"
authoritative_references:
  prisma_schema: "file:///d:/dev/arostech-hub/prisma/schema.prisma#L100-L180"
  prd_auth: "file:///d:/dev/arostech-hub/docs/strategy/prd/02-auth-and-access-model.md"
  adr_auth_split: "file:///d:/dev/arostech-hub/docs/system/adr/0006-authjs-v5-cloudflare-edge-runtime-split-config.md"
---

# Data Model 02: Auth.js v5 Session & User Authorization Schema

> **TL;DR**: Defines the TypeScript contracts, Zod schemas, and Prisma models for Auth.js v5 user authentication, OAuth accounts, sessions, and client project scope filters.

---

## 1. Zod Session Contracts (`authSessionSchema`)

Session objects returned by Auth.js v5 SHALL be validated using `authSessionSchema`:

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

## 2. Prisma User & Auth Models

```prisma
enum Role {
  ADMIN
  VIEWER
  CLIENT
}

enum TrackingScopeType {
  PROJECT
  ORDER
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
```

---

## 3. OpenSpec Behavioral Contracts

### Requirement: REQ-DATA-002-AUTH-SESSION-SCHEMA
Auth.js v5 sessions for `role: "client"` MUST include a valid `trackingScopeIds` string array.

#### Scenario: Session Authorization with Tracking Scope Array
- GIVEN a client logged in on `dashboard.dayaberkah.id`
- WHEN retrieving session info via `/api/auth/session`
- THEN the system MUST return an `AuthSession` payload matching `authSessionSchema`
- AND populate `user.trackingScopeIds` with authorized project identifiers.
