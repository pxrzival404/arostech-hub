---
id: ARCH-MAP-DEPS-001
title: System Package Dependencies & Service Mapping
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_architecture"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L110-L170"
  compatibility_matrix: "file:///d:/dev/arostech-hub/docs/strategy/compatibility-matrix.md#L1-L40"
---

# System Package Dependencies & Service Mapping

> **TL;DR**: Authoritative specification and architectural reference for System Package Dependencies & Service Mapping within the DBSN platform (docs/system/architecture/codemaps/dependencies.md).


> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Cascade`  
> **Authoritative Baseline Reference**: This document provides the complete mapping of node dependencies, active packages, runtime engines, and external service bindings for the **DBSN Centralized Digital Ecosystem**, fully synchronized with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L110-L170)) and the system runtime compatibility matrix ([`compatibility-matrix.md`](file:///d:/dev/arostech-hub/docs/strategy/compatibility-matrix.md#L1-L40)).

---

## ## OpenSpec Delta

- **ADDED**: Modern package ecosystem specifications including Next.js 16.2.6, React 19.2.4, Tailwind CSS v4, `@prisma/adapter-neon`, Auth.js v5 (`next-auth`), Motion (`framer-motion`), and 21st SDK.
- **REMOVED**: Legacy Supabase SDKs, Redis client drivers, and legacy 301 redirect engine packages.

---

## Section I: Core Framework & Runtime Packages

| Package | Version | Layer / Purpose | Constraints |
| :--- | :--- | :--- | :--- |
| `next` | `16.2.6` | App Router, Edge Middleware, ISR | MUST run with Edge Runtime compatibility |
| `react` | `19.2.4` | UI Library & RSC Server Actions | React Server Components baseline |
| `react-dom` | `19.2.4` | DOM Renderer | Browser rendering target |
| `typescript` | `^5.7.3` | Type System | Strict mode enabled |

---

## Section II: CMS & Content Ecosystem

| Package | Version | Layer / Purpose |
| :--- | :--- | :--- |
| `next-sanity` | `^12.4.5` | Next.js Sanity client, Stega visual editing, ISR handler |
| `@sanity/client` | `^7.22.0` | GROQ query client |
| `@sanity/image-url` | `^2.1.1` | Sanity image URL builder |
| `@portabletext/react` | `^6.2.0` | PortableText rich content renderer |

---

## Section III: UI Components & Animation

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `tailwindcss` | `^4.0.0` | Utility-first styling engine (`@theme` tokens) |
| `@tailwindcss/postcss` | `^4.0.0` | PostCSS build integration |
| `framer-motion` | `^12.40.0` | Motion animations & entrance reveals |
| `lucide-react` | `^1.16.0` | SVG Icon library |
| `embla-carousel-react` | `^8.6.0` | Accessible carousel primitive |
| `next-themes` | `^0.4.6` | Dark/light theme switcher |
| `class-variance-authority` | `^0.7.1` | Component variant composition (CVA) |
| `clsx` | `^2.1.1` | Conditional class composition |
| `tailwind-merge` | `^3.6.0` | Tailwind class merger |

---

## Section IV: Validation & Data Layer

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `zod` | `^4.4.3` | Schema validation for RFQ, forms, and env |
| `@prisma/client` | `^6.19.3` | Prisma ORM database client |
| `@prisma/adapter-neon` | `^7.8.0` | Neon Serverless Postgres Proxy adapter |
| `@auth/prisma-adapter` | `^2.11.2` | Auth.js database adapter |
| `next-auth` | `^5.0.0-beta.31` | Auth.js v5 session management & RBAC |

---

## Section V: Notification & Telemetry Services

| Service / Package | Status | Target Environment / Purpose |
| :--- | :--- | :--- |
| `resend` (`^6.12.4`) | **Active** | Resend API client for RFQ quotation ACK & alerts |
| Telegram Bot API | **Active** | Ingestion alerts & infrastructure warning channel |
| WhatsApp `wa.me` | **Active** | Manual submission fallback for RFQ failure path |
| Cloudflare Pages | **Active** | Edge hosting & CDN infrastructure |
| 21st SDK | **Active** | AI Agent Chat integration (`/api/an-token`) |

---

## Section VI: Declarative Dependencies Schema

```typescript
export interface PackageManifestSchema {
  name: 'arostech-hub';
  private: true;
  scripts: {
    dev: string;
    build: string;
    start: string;
    lint: string;
    test: string;
  };
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}
```

---

## Section VII: OpenSpec Behavioral Contracts

### Requirement: REQ-MAP-DEPS-001-PACKAGES
The project package ecosystem MUST enforce compatibility across Next.js 16, React 19, Auth.js v5, and Prisma 6, and SHALL NOT include deprecated drivers (Supabase, Redis, or legacy redirect utilities).

#### Scenario: Dependency Verification
- GIVEN a dependency audit execution
- WHEN `package.json` dependencies are scanned
- THEN the system MUST verify that all installed packages comply with PRD v4.0.0 baseline requirements
- AND it SHALL confirm that zero legacy 301 redirect or Redis packages exist in the manifest.

---

## Section VIII: Knowledge Graph Anchoring

- **Graphify Node**: `doc:docs/system/architecture/codemaps/dependencies.md`
- **Community**: `community_architecture`
- **Authoritative Anchor**: [`compatibility-matrix.md`](file:///d:/dev/arostech-hub/docs/strategy/compatibility-matrix.md#L1-L40)