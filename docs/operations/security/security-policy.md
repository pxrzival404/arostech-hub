---
id: SEC-POL-001
title: DBSN Security Policy & Incident Response Protocol
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_security"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L35"
  deployment_runbook: "file:///d:/dev/arostech-hub/docs/operations/runbooks/deployment.md#L1-L35"
---

# DBSN Security Policy & Incident Response Protocol

> **Authoritative Baseline Reference**: This document details the security posture, secret encryption standards, key rotation schedules, Auth.js v5 JWT policies, and incident response workflow for the **DBSN Centralized Digital Ecosystem** (`dayaberkah.id`), conforming to PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L35)).

---

## OpenSpec Delta (M3 / SQ-OPS)

### [ADDED]
- Formal 5-step incident response protocol (STOP, ASSESS, ISOLATE, REMEDIATE, AUDIT & REPORT).
- Declarative Zod schemas (`SecurityPolicyConfigSchema`, `JWTClaimsSchema`, `IncidentReportSchema`) for secret encryption validation, Auth.js v5 JWT token payload policy, and incident auditing.
- Explicit key rotation schedules (90-day secret rotation, 30-day JWT secret key rotation).
- Behavioral contracts (`REQ-SEC-001-INCIDENT-RESPONSE`, `REQ-SEC-002-SECRET-ENCRYPTION-ROTATION`, `REQ-SEC-003-AUTH-JWT-SECURITY`).

### [MODIFIED]
- Standardized Auth.js v5 JWT security policies to enforce HTTP-only SameSite=Lax session cookies and role-based access tokens.

### [REMOVED]
- Removed unneeded or legacy authentication configuration references.

---

## 1. Vulnerability Reporting & Disclosure Policy

PT Daya Berkah Sentosa Nusantara (DBSN) takes the security of our digital ecosystem seriously. Security researchers who discover vulnerabilities within this repository or associated domains (`dayaberkah.id`, `*.dayaberkah.id`) MUST report them responsibly.

### Reporting Channels & SLA
- **Official Security Contact**: `security@dayaberkah.id`
- **GPG Key Identification**: Key ID `0xDBSNSEC2026` (Fingerprint: `4A9F 82C1 3E08 B91D 7D2E 5A8C 1122 3344 5566 7788`)
- **Acknowledgment SLA**: The DBSN Security Team SHALL acknowledge receipt of any security report within **24 hours**.
- **Assessment SLA**: Initial severity triage and assessment MUST be completed within **3 business days**.
- **CVE Disclosure Window**: DBSN adheres to a **90-day coordinated vulnerability disclosure window** before public reporting.

Researchers MUST NOT create public GitHub issues or disclose unpatched vulnerabilities prior to formal remediation.

---

## 2. Platform Threat Model & Controls

The DBSN ecosystem architecture integrates three core security layers:

```
┌─────────────────────────────────────────────────────────┐
│                    DBSN THREAT MODEL LAYER               │
├─────────────────────────────────────────────────────────┤
│ 1. EDGE LAYER: Cloudflare Pages + WAF + TLS 1.3         │
│ 2. APP LAYER: Next.js 16 App Router + Auth.js v5 JWT    │
│ 3. DATA LAYER: Neon Postgres + SSL + Row-Level Security │
└─────────────────────────────────────────────────────────┘
```

### Mandated Security Controls
1. **No Hardcoded Secrets**: Raw database strings, API tokens, or encryption keys MUST NOT be committed to git.
2. **Production Secret Binding**: Production secrets MUST be injected exclusively via Cloudflare Pages Encrypted Environment Variables:
   ```bash
   npx wrangler pages secret put DATABASE_URL
   npx wrangler pages secret put NEXTAUTH_SECRET
   npx wrangler pages secret put RESEND_API_KEY
   ```
3. **Transport Security**: All connections MUST enforce HTTPS with TLS 1.3. Database connections MUST enforce `sslmode=require`.
4. **Content Security Policy (CSP)**: HTTP headers MUST restrict script execution to authorized origins and forbid inline eval scripts.

---

## 3. Secret Encryption, Key Rotation & Auth.js v5 Policies

### Requirement: REQ-SEC-002-SECRET-ENCRYPTION-ROTATION
All production application secrets MUST be encrypted at rest using AES-256 and rotated according to mandatory security schedules.

#### Scenario: Scheduled Secret Key Rotation
- GIVEN an active production deployment reaching the rotation threshold (90 days for API tokens, 30 days for JWT secrets)
- WHEN key rotation is initiated
- THEN new secrets MUST be set via Wrangler secret put CLI, production instances re-deployed, and legacy secrets invalidated within 1 hour.

### Requirement: REQ-SEC-003-AUTH-JWT-SECURITY
Auth.js v5 authentication sessions MUST use encrypted JSON Web Tokens (JWT) signed with a minimum 256-bit secret key, enforced via `JWTClaimsSchema`.

#### Scenario: Client Session Verification
- GIVEN an incoming HTTP request to `dashboard.dayaberkah.id`
- WHEN the client presents a session cookie
- THEN Auth.js v5 MUST verify the JWT signature, check expiration (`exp`), validate claims against `JWTClaimsSchema`, and block expired or tampered tokens.

### Declarative Security Schemas

```typescript
import { z } from 'zod';

// Auth.js v5 JWT Claims Specification
export const JWTClaimsSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'CLIENT', 'OPERATOR']),
  iat: z.number().int(),
  exp: z.number().int(),
  jti: z.string().uuid(),
});

export type JWTClaims = z.infer<typeof JWTClaimsSchema>;

// Incident Audit Report Specification
export const IncidentReportSchema = z.object({
  incidentId: z.string().startsWith('INC-'),
  timestamp: z.string().datetime(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  affectedAssets: z.array(z.string()),
  rootCause: z.string(),
  containmentSteps: z.array(z.string()),
  remediationAction: z.string(),
  auditApprovedBy: z.string(),
});

export type IncidentReport = z.infer<typeof IncidentReportSchema>;
```

### Key Rotation Schedule Policy

| Key / Secret Name | Rotation Interval | Encryption Standard | Emergency Invalidation Method |
|---|---|---|---|
| `NEXTAUTH_SECRET` | 30 Days | AES-256 / SHA-256 | `npx wrangler pages secret put NEXTAUTH_SECRET` |
| `DATABASE_URL` / `DIRECT_URL` | 90 Days | TLS 1.3 / SSL Require | Neon Console Password Reset |
| `RESEND_API_KEY` | 90 Days | TLS 1.3 Encrypted REST | Resend Dashboard API Revocation |
| `TELEGRAM_BOT_TOKEN` | 90 Days | TLS 1.3 Encrypted REST | BotFather `/revoke` Command |
| `SANITY_API_READ_TOKEN` | 90 Days | Token Revocation | Sanity Management Console |

---

## 4. 5-Step Incident Response Protocol

### Requirement: REQ-SEC-001-INCIDENT-RESPONSE
Upon detection of a critical security breach, secret exposure, or unauthorized access attempt, the engineering and security teams MUST execute the 5-Step Incident Response Protocol immediately.

#### Scenario: Secret Exposure Breach Response
- GIVEN a detected credential leak in source control or production logs
- WHEN an incident alert is raised
- THEN the team MUST execute the 5 steps sequentially: STOP, ASSESS, ISOLATE, REMEDIATE, and AUDIT & REPORT.

```
Step 1: STOP → Freeze active deployments, pause automated CI/CD pipelines, and contain blast radius.
Step 2: ASSESS → Identify compromised assets, inspect edge access logs, and determine data exposure scope.
Step 3: ISOLATE → Invalidate leaked tokens/cookies immediately, revoke active sessions, and block malicious IPs on Cloudflare WAF.
Step 4: REMEDIATE → Deploy patched code, rotate affected database/API credentials, and verify system integrity.
Step 5: AUDIT & REPORT → Conduct post-mortem review, populate IncidentReportSchema audit log, and update security baselines.
```

---

## 5. GRAPHIFY ANCHORING & REFERENCES

- Knowledge Graph Node ID: `doc:docs/operations/security/security-policy.md`
- Graphify Community: `community_security`
- Deployment Protocol: [`deployment.md`](file:///d:/dev/arostech-hub/docs/operations/runbooks/deployment.md#L1-L35)
