# Dependencies Codemap

<!-- Generated: 2026-07-22 | Files scanned: package.json | Token estimate: ~600 -->

## Core Runtime

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.6 | Framework (App Router, Edge Middleware, ISR) |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | DOM renderer |

## CMS & Content

| Package | Version | Purpose |
|---------|---------|---------|
| `@sanity/client` | ^7.22.0 | Sanity GROQ query client |
| `@sanity/image-url` | ^2.1.1 | Sanity image URL builder |
| `next-sanity` | ^12.4.5 | Next.js Sanity integration (createClient, stega) |
| `@portabletext/react` | ^6.2.0 | Render Sanity PortableText blocks |
| `@portabletext/types` | ^4.0.2 | TypeScript types for PortableText |

## UI Components & Animation

| Package | Version | Purpose |
|---------|---------|---------|
| `framer-motion` | ^12.40.0 | Page/component animations |
| `lucide-react` | ^1.16.0 | Icon library |
| `embla-carousel-react` | ^8.6.0 | Carousel / slider |
| `next-themes` | ^0.4.6 | Dark/light theme management |
| `@radix-ui/react-accordion` | ^1.2.12 | Accessible accordion primitive |
| `@radix-ui/react-avatar` | ^1.1.11 | Accessible avatar primitive |
| `@radix-ui/react-dialog` | ^1.1.15 | Modal/dialog primitive |
| `@radix-ui/react-select` | ^2.2.6 | Dropdown select primitive |
| `@radix-ui/react-slot` | ^1.2.4 | Compound component (asChild) |
| `@radix-ui/react-tabs` | ^1.1.13 | Tab interface primitive |
| `@radix-ui/react-tooltip` | ^1.2.8 | Tooltip primitive |
| `class-variance-authority` | ^0.7.1 | Type-safe component variants (CVA) |
| `clsx` | ^2.1.1 | Conditional class name utility |
| `tailwind-merge` | ^3.6.0 | Merge Tailwind classes without conflicts |
| `tw-animate-css` | ^1.4.0 | CSS animation utilities for Tailwind |

## Validation & Forms

| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | ^4.4.3 | Schema validation (RFQ, env) |
| `react-hook-form` | ^7.76.0 | Form state management |
| `@hookform/resolvers` | ^5.2.2 | Zod bridge for RHF |

## Database & Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| `@prisma/client` | ^6.19.3 | Prisma query engine client for PostgreSQL |
| `@auth/prisma-adapter` | ^2.11.2 | Database adapter mapping Auth.js users/sessions to Prisma |
| `next-auth` | ^5.0.0-beta.31 | Auth.js v5 beta library for next-gen React/Next.js authentication |

## Notification Services

| Package | Version | Purpose |
|---------|---------|---------|
| `resend` | ^6.12.4 | Resend API client for email transmission |

## Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4 | Utility-first CSS |
| `@tailwindcss/postcss` | ^4 | PostCSS integration |

## Testing & Tooling (devDependencies)

| Package | Version | Purpose |
|---------|---------|---------|
| `jest` | ^30.4.2 | Test runner |
| `jest-environment-jsdom` | ^30.4.1 | jsdom environment for component tests |
| `@jest/globals` | ^30.4.1 | Jest global types |
| `@swc/jest` | ^0.2.39 | SWC-based TS transpilation for Jest |
| `ts-jest` | ^29.4.10 | TypeScript Jest transformer |
| `@testing-library/react` | ^16.3.2 | Component testing |
| `@testing-library/jest-dom` | ^6.9.1 | DOM matchers |
| `@testing-library/user-event` | ^14.6.1 | User interaction simulation |
| `@playwright/test` | ^1.60.0 | E2E testing |
| `@types/jest` | ^30.0.0 | TypeScript types for Jest |
| `cross-env` | ^10.1.0 | Cross-platform env variable setting |
| `prisma` | ^6.19.3 | Prisma CLI and code generator |

## TypeScript (devDependencies)

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5 | Type system |
| `@types/node` | ^20 | Node.js types |
| `@types/react` | ^19 | React types |
| `@types/react-dom` | ^19 | React DOM types |
| `eslint` | ^9 | Linter |
| `eslint-config-next` | 16.2.6 | Next.js ESLint config |

## External Services (Active & Planned)

| Service | Status | Purpose |
|---------|---------|---------|
| Neon Postgres + Prisma | **Active** | Transactional database storing users, leads, redirects |
| Auth.js v5 | **Active** | Session management, RBAC, cookie auth |
| Resend | **Active** | Email notifications (quotation ACK & alerts) |
| Telegram Bot API | **Active** | Ingestion alerts and dev error messaging channel |
| Cloudflare Pages | **Active** | Edge hosting & CDN (Staging & Production) |
| GA4 + GSC | **Active** | Analytics & SEO |
| 21st SDK | **Active** | Agent chat integration |
| Sentry | **Active** | Error tracking |