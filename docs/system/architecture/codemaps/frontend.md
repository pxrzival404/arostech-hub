---
id: ARCH-MAP-FRONTEND-001
title: System Frontend Architecture & Code Terrain Map
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_architecture"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L110-L170"
  overview: "file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L1-L80"
---

# System Frontend Architecture & Code Terrain Map

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Greenfield Cascade`  
> **Authoritative Baseline Reference**: This document defines the frontend application structure, component hierarchy, state management, design system tokenization, and UI patterns for the **DBSN Centralized Digital Ecosystem**, fully synchronized with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd.md#L110-L170)).

---

## ## OpenSpec Delta

- **ADDED**: Tailwind CSS v4 design token engine, Motion animation primitives (`motion/react` / `framer-motion`), Lucide React icon set, and dynamic spoke subdomain page trees (`pju`, `solarcell`, `alatpetir`, `baterai`).
- **REMOVED**: Legacy CSS utility files, legacy UI templates, and legacy client-side state models.

---

## Section I: Page Tree Structure

The application page hierarchy SHALL operate within Next.js 16 App Router route groups:

```
src/app/
├── layout.tsx                    → Root layout (ThemeProvider, PageLoader, fonts)
├── globals.css                   → Global Tailwind v4 styles + theme tokens
├── (hub)/
│   ├── layout.tsx                → Hub layout (Navbar, Footer, ScrollProgress)
│   ├── page.tsx                  → Hub homepage (composed sections)
│   ├── about/page.tsx            → Corporate about sub-page
│   ├── articles/
│   │   ├── page.tsx              → Articles listing
│   │   └── [slug]/page.tsx       → Article detail
│   ├── certifications/page.tsx   → Centralized certification matrix
│   ├── contact/page.tsx          → Contact page + RFQ composite form
│   ├── faq/page.tsx              → Corporate FAQ
│   ├── portfolio/page.tsx        → Portfolio project showcase
│   └── products/page.tsx         → Product catalog & spoke gateway
├── chat/
│   ├── page.tsx                  → Agent chat interface (21st SDK integration)
│   └── theme.json                → Chat theme configuration
├── dashboard/
│   ├── layout.tsx                → Client dashboard layout (Auth guard)
│   └── page.tsx                  → Project/order tracking overview
└── (spokes)/
    ├── pju/                      → PJU spoke static route group
    └── [spoke]/                  → Dynamic spoke route segment (solarcell, alatpetir, baterai)
        ├── page.tsx              → Spoke homepage
        ├── products/             → Spoke catalog
        └── portfolio/            # Spoke portfolio showcase
```

---

## Section II: Component Hierarchy & Architecture

```
src/components/
├── forms/                         → Composite cart RFQ form components (submits to /api/rfq)
│   ├── RfqCompositeForm.tsx      → Multi-item composite RFQ cart form
│   ├── RfqB2BForm.tsx            → B2B segment inline form handler
│   ├── RfqB2GForm.tsx            → B2G procurement inline form handler
│   └── contact-form.tsx          → Direct contact inquiry form
│
├── ui/                           → Radix UI primitives (shadcn pattern)
│   ├── accordion.tsx             → Accordion primitive wrapper
│   ├── badge.tsx                 → Status/label badge with CVA variants
│   ├── button.tsx                → Button with CVA variants
│   ├── card.tsx                  → Card container + sub-parts
│   ├── dialog.tsx                → Modal/dialog primitive
│   ├── input.tsx                 → Text input with Zod error integration
│   ├── select.tsx                → Accessible dropdown select
│   ├── tabs.tsx                  → Accessible tab interface
│   └── tooltip.tsx               → Tooltip trigger wrapper
│
├── shared/                       → Shared layout & motion components
│   ├── Accordion.tsx             → Motion accordion wrapper
│   ├── BackToTop.tsx             → Motion scroll-to-top button
│   ├── Button.tsx                → Tokenized button with motion micro-interactions
│   ├── Footer.tsx                → Global site footer
│   ├── Navbar.tsx                → Responsive navigation bar with spoke dropdowns
│   ├── PageLoader.tsx            → Full-page loading overlay
│   ├── PortableText.tsx          → @portabletext/react renderer wrapper
│   ├── ScrollProgress.tsx        → Scroll indicator bar
│   ├── ScrollReveal.tsx          → IntersectionObserver reveal animation wrapper
│   └── ThemeToggle.tsx           → Dark/light theme switcher (`next-themes`)
│
└── sections/                     → Hub page section components
    ├── AboutSection.tsx          → Corporate background section
    ├── CertificationsSection.tsx → Cert cards grid section
    ├── ContactSection.tsx        → Contact info & RFQ form container
    ├── HeroSection.tsx           → Hero banner + primary CTA
    ├── PortfolioSection.tsx      → Portfolio grid/carousel section
    └── ProductsSection.tsx       → Spoke product gateway grid
```

---

## Section III: State Management & Styling Stack

| Concern | Approach / Technology | Enforcement Invariant |
| :--- | :--- | :--- |
| **Styling** | Tailwind CSS v4 + PostCSS | Theme tokens in `globals.css` using `@theme` directive |
| **Motion** | Motion (`motion/react` / `framer-motion`) | Reduced-motion safe entrance animations & reveals |
| **Icons** | Lucide React | Standardized `lucide-react` SVG icon set |
| **Theme** | `next-themes` | SSR hydration-safe Light/Dark mode switching |
| **Forms** | React Hook Form + Zod | Strict schema validation with `@hookform/resolvers` |
| **RFQ Cart State** | Zustand | LocalStorage persisted store (`dbsn-rfq-cart`) |
| **Session** | Auth.js v5 | Client SessionProvider & JWT cookie tracking |

---

## Section IV: Declarative Component Props Schema

```typescript
import { ReactNode } from 'react';

export interface BaseSectionProps {
  id?: string;
  className?: string;
  children?: ReactNode;
}

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  spokeSubdomain: 'pju' | 'solarcell' | 'alatpetir' | 'baterai';
  imageUrl: string;
  shortDescription: string;
  specifications: Record<string, string>;
  isTkdnCertified?: boolean;
}
```

---

## Section V: OpenSpec Behavioral Contracts

### Requirement: REQ-MAP-FRONTEND-001-UI-ARCHITECTURE
The frontend layer SHALL render responsive, accessible UI components using Tailwind CSS v4 and Motion, and MUST interface with the composite RFQ cart state store without client-side hydration mismatches.

#### Scenario: Spoke Navigation & Cart Ingestion
- GIVEN a user browsing `solarcell.dayaberkah.id/products`
- WHEN the user selects a solar panel product and clicks "Ajukan Penawaran"
- THEN the frontend MUST append the product item to the Zustand `dbsn-rfq-cart` store
- AND it SHALL open the RFQ modal or redirect to `/contact` with pre-filled cart state.

---

## Section VI: Knowledge Graph Anchoring

- **Graphify Node**: `doc:docs/system/architecture/codemaps/frontend.md`
- **Community**: `community_architecture`
- **Authoritative Anchor**: [`overview.md`](file:///d:/dev/arostech-hub/docs/system/architecture/overview.md#L1-L80)