---
id: audit-21st-sdk-footprint
title: "Card 1.7 21st SDK Footprint Audit & Recommendation Report"
version: 1.0.0
status: APPROVED
author: Card 1.7 21st SDK Audit Agent
date: 2026-08-13
graphify_community: "an-token/route.ts"
authoritative_references:
  - "file:///D:/dev/arostech-hub/AGENTS.md#L286"
  - "file:///D:/dev/arostech-hub/SYSTEM_BLUEPRINT_MIGRATION_PLAN_v2.md#L284"
  - "file:///D:/dev/arostech-hub/src/app/chat/page.tsx"
  - "file:///D:/dev/arostech-hub/src/app/api/an-token/route.ts"
  - "file:///D:/dev/arostech-hub/src/agents/my-agent/index.ts"
  - "file:///D:/dev/arostech-hub/src/lib/config/env.ts#L257-L301"
---

# Card 1.7 21st SDK Footprint Audit & Recommendation Report

> **TL;DR**: Authoritative specification and architectural reference for Card 1.7 21st SDK Footprint Audit & Recommendation Report within the DBSN platform (docs/operations/audits/phase-1-findings/sdk-footprint-findings.md).


## 1. Executive Summary

This report delivers the comprehensive audit of the **21st SDK Agent Chat** integration within `arostech-hub` (`refactor/reorganize-project-documentation` branch), executed under Card 1.7 of `SYSTEM_BLUEPRINT_MIGRATION_PLAN_v2.md`. 

The 21st SDK footprint represents an undocumented, experimental scope creep item (tracked as Known Drift Item 8.3 in [AGENTS.md](file:///D:/dev/arostech-hub/AGENTS.md#L286)). The audit evaluated all source code, API routes, agent definitions, test suites, configuration schemas, and npm dependencies associated with the 21st SDK.

**Key Finding & Recommendation**:
- **Decision**: **`remove`** (Wave 4 task 3.4.3).
- **Rationale**: The feature is completely unaligned with PT Daya Berkah Sentosa Nusantara's core business requirements (B2B solar/PJU infrastructure & RFQ portal), relies on uncurated pre-1.0 third-party SDK packages (`@21st-sdk/*`), increases Cloudflare Pages bundle overhead, adds maintenance drag, and exhibits edge-runtime rate limiting bypass vulnerabilities across distributed workers.

---

## 2. Complete File Inventory & Line Counts

The complete footprint of 21st SDK across the codebase comprises **7 dedicated files** and **3 configuration entrypoints**, totaling **195 lines of dedicated code**.

### 2.1 Dedicated File Inventory

| File Path | Description | Line Count | Runtime / Environment |
| :--- | :--- | :---: | :--- |
| [`src/app/chat/page.tsx`](file:///D:/dev/arostech-hub/src/app/chat/page.tsx) | Next.js App Router client chat page rendering `<AgentChat />` UI | 31 lines | Edge Runtime (`'edge'`) |
| [`src/app/chat/theme.json`](file:///D:/dev/arostech-hub/src/app/chat/theme.json) | Styling theme JSON configuration for `<AgentChat />` | 6 lines | Static JSON asset |
| [`src/app/api/an-token/route.ts`](file:///D:/dev/arostech-hub/src/app/api/an-token/route.ts) | Token issuing endpoint for 21st SDK client sessions | 46 lines | Edge Runtime (`'edge'`) |
| [`src/agents/my-agent/index.ts`](file:///D:/dev/arostech-hub/src/agents/my-agent/index.ts) | Server-side agent definition (`claude-3-5-sonnet-latest`) with `add` tool | 17 lines | Server / Node runtime |
| [`src/__tests__/chat-page.test.tsx`](file:///D:/dev/arostech-hub/src/__tests__/chat-page.test.tsx) | Jest unit test for Chat Page rendering & props binding | 39 lines | Jest / jsdom |
| [`src/__tests__/api/an-token.test.ts`](file:///D:/dev/arostech-hub/src/__tests__/api/an-token.test.ts) | Jest unit test for `/api/an-token` POST auth & token generation | 56 lines | Jest / node |
| **Total Dedicated Files** | **6 Files** | **195 lines** | — |

### 2.2 Shared Configuration & Infrastructure Entrypoints

| Config File | Target Symbol / Section | Lines Affected | Nature of Coupling |
| :--- | :--- | :---: | :--- |
| [`src/lib/config/env.ts`](file:///D:/dev/arostech-hub/src/lib/config/env.ts#L257-L301) | `anSDKEnvSchema`, `validateANSDKEnv`, `getANSDKEnv` | 45 lines (L257-L301) | Zod env schema requiring `API_KEY_21ST` (`21st_*`) |
| [`package.json`](file:///D:/dev/arostech-hub/package.json#L25-L28) | `dependencies` & `scripts.lint` | 5 lines (L25-L28, L11) | 4 npm packages & lint command script target |
| [`next.config.ts`](file:///D:/dev/arostech-hub/next.config.ts#L33) | `experimental.optimizePackageImports` | 1 line (L33) | Bundle optimization list includes `@21st-sdk/react` |

---

## 3. npm Dependency Analysis

The project includes **4 core dependencies** directly published under the `@21st-sdk` namespace, along with **2 supporting Vercel AI SDK packages**.

### 3.1 21st SDK Direct Dependencies

| Package Name | Installed Version | Role & Functionality | Maintenance Risk |
| :--- | :---: | :--- | :--- |
| `@21st-sdk/agent` | `^0.0.18` | Agent builder primitive (`agent()`, `tool()`) for defining agent prompts & tools | **High** (Experimental pre-1.0 release) |
| `@21st-sdk/nextjs` | `^0.0.11` | Next.js adapter (`AgentChat`, `createAgentChat`, `createTokenHandler`) | **High** (Pre-1.0 release, non-standard server imports) |
| `@21st-sdk/node` | `^0.1.1` | Node.js backend client runtime | **High** (Pre-1.0 release) |
| `@21st-sdk/react` | `^0.2.3` | React UI components for chat interface | **High** (Pre-1.0 release) |

### 3.2 Related AI SDK Dependencies

| Package Name | Installed Version | Used In | Impact of Removal |
| :--- | :---: | :--- | :--- |
| `@ai-sdk/react` | `^3.0.204` | [`src/app/chat/page.tsx`](file:///D:/dev/arostech-hub/src/app/chat/page.tsx#L6) (`useChat`) | Retain if used elsewhere or evaluate in separate cleanup |
| `ai` | `^6.0.202` | Peer dependency for Vercel AI SDK | Retain if used elsewhere or evaluate in separate cleanup |

---

## 4. Auth Model of `/api/an-token`

The `/api/an-token` route ([`src/app/api/an-token/route.ts`](file:///D:/dev/arostech-hub/src/app/api/an-token/route.ts)) acts as an ephemeral token issuer that exchanges the master `API_KEY_21ST` secret for a short-lived client session token used by `@21st-sdk/nextjs` frontend components.

```
[ Client Browser ] --( POST /api/an-token with Auth Cookie )--> [ Edge Worker: route.ts ]
                                                                       |
                                                                1. Rate Limit Check (10 req/min)
                                                                2. Auth.js v5 Session Check (auth())
                                                                3. Validate API_KEY_21ST
                                                                       |
                                                                4. createTokenHandler()
                                                                       |
[ Client Browser ] <--( Ephemeral Token Response )----------------------
```

### 4.1 Request Processing Pipeline

1. **Edge Runtime Execution**:
   ```typescript
   export const runtime = 'edge'
   ```
2. **In-Memory Rate Limiting**:
   ```typescript
   const limiter = createRateLimiter({
     interval: 60 * 1000,
     maxRequests: 10,
   })
   const ip = getClientIp(req)
   const rateLimitResult = limiter.check(ip)
   ```
   If request count > 10 req/min per IP, returns `429 Too Many Requests` with `Retry-After` header.
3. **Session Authentication (Auth.js v5)**:
   ```typescript
   const session = await auth()
   if (!session || !session.user) {
     return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
   }
   ```
   Ensures only logged-in users with a valid JWT session can acquire a token.
4. **Environment Secret Extraction**:
   ```typescript
   export const getTokenHandler = () => {
     const { API_KEY_21ST } = validateANSDKEnv()
     return createTokenHandler({ apiKey: API_KEY_21ST })
   }
   ```
5. **Token Delegation**:
   `getTokenHandler()(req)` sends a server-to-server request to 21st SDK infrastructure to generate a scoped client token.

---

## 5. Feature Description & Integration Topology

### 5.1 UI & Component Architecture

The chat interface is exposed at route `/chat` ([`src/app/chat/page.tsx`](file:///D:/dev/arostech-hub/src/app/chat/page.tsx)):
- Initializes `createAgentChat` configured with `agent: 'my-agent'` and `tokenUrl: '/api/an-token'`.
- Uses Vercel AI SDK `useChat({ chat })` to handle message stream state (`messages`, `sendMessage`, `status`, `stop`, `error`).
- Renders `<AgentChat />` full-screen (`h-screen`) styled via [`theme.json`](file:///D:/dev/arostech-hub/src/app/chat/theme.json).

### 5.2 Server Agent Definition

The target agent is defined in [`src/agents/my-agent/index.ts`](file:///D:/dev/arostech-hub/src/agents/my-agent/index.ts):
```typescript
import { agent, tool } from "@21st-sdk/agent"
import { z } from "zod"

export default agent({
  model: "claude-3-5-sonnet-latest",
  systemPrompt: "You are a helpful coding assistant.",
  tools: {
    add: tool({
      description: "Add two numbers",
      inputSchema: z.object({ a: z.number(), b: z.number() }),
      execute: async ({ a, b }) => ({
        content: [{ type: "text", text: `${a + b}` }],
      }),
    }),
  },
})
```

### 5.3 Architectural Disconnect

- **Generic Demo Artifact**: The agent is configured as a general "coding assistant" with a simple addition tool (`add`).
- **No Business Domain Integration**: It has **zero** integration with PT Daya Berkah Sentosa Nusantara's core platform domain models (PJU solar street lights, solar panels, lightning protection, batteries, RFQ cart system, or Sanity CMS content).
- **Undocumented Feature**: Not referenced in `docs/strategy/prd/00-overview-and-goals.md`, domain models, or high-level architecture docs.

---

## 6. Risk Assessment

| Risk Category | Rating | Details & Analysis |
| :--- | :---: | :--- |
| **API Key Exposure** | **LOW** | The master `API_KEY_21ST` is strictly handled on the server within `/api/an-token` and is not embedded into client bundle JS. |
| **Edge Rate Limit Bypass** | **HIGH** | `createRateLimiter` uses an in-memory Map. On Cloudflare Pages distributed edge nodes, memory is isolated per worker instance. An attacker can easily bypass the 10 req/min limit across multiple Cloudflare PoPs. |
| **Cloudflare Worker Bundle Limit** | **HIGH** | Including 4 proprietary SDK packages (`@21st-sdk/*`) increases worker bundle size. Cloudflare Pages enforces a strict **25MB worker bundle limit** (which already requires skipping Sentry in production builds). |
| **Pre-1.0 Dependency Instability** | **HIGH** | `@21st-sdk/*` packages are at v0.0.x / v0.1.x versions. Maintaining uncurated, rapid-breaking pre-1.0 SDK dependencies introduces vulnerability risk and build breakage. |
| **Architectural Scope Creep** | **HIGH** | Violates Core Principle #1 (Docs-First) and Core Principle #2 (Spec-Driven) in `AGENTS.md`. Code was added without PRD entry, OpenSpec proposal, or domain alignment. |

---

## 7. Concrete Recommendation for Wave 4 Task 3.4.3 (`an-token-decision`)

### 7.1 Option Evaluation

| Option | Description | Recommendation Verdict | Rationale |
| :--- | :--- | :---: | :--- |
| **Option A: `document`** | Formally document as product feature, write PRD spec, and retain codebase footprint. | **REJECTED** | No business justification for a generic coding assistant chat in an enterprise renewable energy & RFQ platform. Increases bundle size and security surface. |
| **Option B: `branch-off`** | Move 21st SDK code to a separate experimental branch (`experiment/21st-sdk-chat`). | **REJECTED** | Implementation consists only of 195 lines of basic boilerplate demo code. Maintaining a separate branch adds git complexity without residual value. |
| **Option C: `remove`** | Completely purge all 21st SDK code, routes, tests, configuration schemas, and npm dependencies. | **RECOMMENDED** | Restores codebase purity, aligns implementation with PRD SSOT, eliminates worker bundle overhead, and resolves Known Drift Item 8.3. |

### 7.2 Step-by-Step Execution Plan for Wave 4 Task 3.4.3 (`remove`)

When executing task 3.4.3 in Wave 4, the agent `refactor-cleaner` MUST execute the following surgical deletions:

1. **Delete Dedicated Directories & Files**:
   - `rm -rf src/app/chat/`
   - `rm -rf src/app/api/an-token/`
   - `rm -rf src/agents/`
   - `rm src/__tests__/api/an-token.test.ts`
   - `rm src/__tests__/chat-page.test.tsx`
2. **Clean Up Environment Validation Schema**:
   - Remove `anSDKEnvSchema`, `ANSDKEnv`, `validateANSDKEnv`, `cachedANSDKEnv`, and `getANSDKEnv` from [`src/lib/config/env.ts`](file:///D:/dev/arostech-hub/src/lib/config/env.ts#L257-L301).
3. **Uninstall npm Packages**:
   - `pnpm remove @21st-sdk/agent @21st-sdk/nextjs @21st-sdk/node @21st-sdk/react`
4. **Clean Up Build & Lint Configurations**:
   - Remove `@21st-sdk/react` from `experimental.optimizePackageImports` in [`next.config.ts`](file:///D:/dev/arostech-hub/next.config.ts#L33).
   - Remove `src/app/chat/page.tsx` from `scripts.lint` in [`package.json`](file:///D:/dev/arostech-hub/package.json#L11).
5. **Clean Up Codemaps & Documentation**:
   - Update [`docs/system/architecture/codemaps/backend.md`](file:///D:/dev/arostech-hub/docs/system/architecture/codemaps/backend.md) and [`docs/system/architecture/codemaps/dependencies.md`](file:///D:/dev/arostech-hub/docs/system/architecture/codemaps/dependencies.md) to remove `/api/an-token` and 21st SDK references.
   - Update Known Drift Items in [`AGENTS.md`](file:///D:/dev/arostech-hub/AGENTS.md) to mark 21st SDK drift as **RESOLVED (REMOVED)**.
6. **Verification Gate**:
   - Run `pnpm test` to verify all tests pass with zero 21st SDK references.
   - Run `pnpm build` to verify Cloudflare Pages build succeeds cleanly.

---

## 8. Behavioral Contracts & Specification Delta (7-Pillars Standard)

```markdown
Requirement: PURGE_UNDOCUMENTED_21ST_SDK_FOOTPRINT
  The system SHALL NOT contain unapproved 21st SDK dependencies, routes, or agent endpoints in production builds.

  Scenario: Purging 21st SDK Footprint in Wave 4
    GIVEN the codebase contains /app/chat, /api/an-token, src/agents/my-agent, and @21st-sdk/* packages
    WHEN Wave 4 task 3.4.3 execution is invoked
    THEN all 21st SDK files and directories MUST be deleted
    AND all 4 @21st-sdk/* npm dependencies MUST be uninstalled from package.json
    AND validateANSDKEnv MUST be removed from src/lib/config/env.ts
    AND pnpm build MUST compile cleanly without 21st SDK imports
```

```markdown
Specification Delta:
  MODIFIED: docs/system/architecture/codemaps/backend.md (Removed /api/an-token route entry)
  MODIFIED: docs/system/architecture/codemaps/dependencies.md (Removed 21st SDK dependency entry)
  MODIFIED: AGENTS.md (Marked Drift Item 8.3 as RESOLVED)
  REMOVED: src/app/chat/page.tsx
  REMOVED: src/app/chat/theme.json
  REMOVED: src/app/api/an-token/route.ts
  REMOVED: src/agents/my-agent/index.ts
  REMOVED: src/__tests__/api/an-token.test.ts
  REMOVED: src/__tests__/chat-page.test.tsx
```
