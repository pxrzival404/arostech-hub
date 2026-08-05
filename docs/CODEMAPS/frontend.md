# Frontend Codemap

<!-- Generated: 2026-07-22 | Files scanned: 184 TS/TSX | Token estimate: ~800 -->

## Page Tree

```
src/app/
├── layout.tsx                    → Root layout (ThemeProvider, PageLoader, fonts)
├── globals.css                   → Global styles + Tailwind v4 + theme tokens
├── (hub)/
│   ├── layout.tsx                → Hub layout (Navbar, Footer, ScrollProgress)
│   ├── page.tsx                  → Hub homepage (all sections composed)
│   ├── about/page.tsx            → About sub-page
│   ├── articles/
│   │   ├── page.tsx              → Articles listing
│   │   └── [slug]/page.tsx       → Article detail
│   ├── certifications/page.tsx   → Certifications listing
│   ├── contact/page.tsx          → Contact page
│   ├── faq/page.tsx              → FAQ page
│   ├── portfolio/page.tsx        → Portfolio listing
│   └── products/page.tsx         → Products listing
├── chat/
│   ├── page.tsx                  → Agent chat interface (21st SDK integration)
│   └── theme.json                → Chat theme configuration
├── dashboard/
│   ├── layout.tsx                → Dashboard layout
│   └── page.tsx                  → Dashboard home (rewritten from dashboard.*)
└── (spokes)/
    ├── pju/                      → PJU spoke pages
    └── [spoke]/                  → Dynamic spoke pages
```

## Component Hierarchy

```
src/components/
├── ui/                           → 12 Radix UI primitives (shadcn pattern)
│   ├── accordion.tsx             → Accordion primitive wrapper
│   ├── badge.tsx                 → Status/label badge with CVA variants
│   ├── button.tsx                → Button with CVA variants
│   ├── card.tsx                  → Card container + sub-parts
│   ├── dialog.tsx                → Modal/dialog (Radix portal)
│   ├── index.ts                  → Barrel export
│   ├── input.tsx                 → Text input
│   ├── label.tsx                 → Form label
│   ├── select.tsx                → Dropdown select (Radix)
│   ├── tabs.tsx                  → Tab interface (Radix)
│   ├── textarea.tsx              → Multiline input
│   └── tooltip.tsx               → Tooltip trigger wrapper
│
├── shared/                       → 14 shared/layout components
│   ├── Accordion.tsx             → FAQ-style accordion (framer-motion)
│   ├── Avatar.tsx                → User avatar with fallback
│   ├── BackToTop.tsx             → Scroll-to-top button (framer-motion)
│   ├── Button.tsx                → High-level button with variants + motion
│   ├── Footer.tsx                → Site footer (links, social, copyright)
│   ├── Navbar.tsx                → Responsive navigation bar
│   ├── PageLoader.tsx            → Full-page loading overlay
│   ├── PortableText.tsx          → @portabletext/react renderer wrapper
│   ├── ScrollProgress.tsx        → Top progress bar (scroll indicator)
│   ├── ScrollReveal.tsx          → Intersection observer reveal animation
│   ├── Tabs.tsx                  → High-level tab component
│   ├── ThemeToggle.tsx           → Dark/light mode toggle (next-themes)
│   ├── Tooltip.tsx               → High-level tooltip wrapper
│   └── WaveDivider.tsx           → SVG wave section divider
│
└── sections/                     → 12 hub page section components
    ├── AboutSection.tsx          → Company about (16 KB)
    ├── ArticlesSection.tsx       → Articles grid/list (14 KB)
    ├── CTABanner.tsx             → Call-to-action banner (7 KB)
    ├── CertificationsSection.tsx → Cert cards/grid (11 KB)
    ├── ContactSection.tsx        → Contact form + info (14 KB)
    ├── FAQSection.tsx            → FAQ accordion (12 KB)
    ├── HeroSection.tsx           → Hero banner + CTA (11 KB)
    ├── PortfolioSection.tsx      → Portfolio carousel/grid (14 KB)
    ├── ProcessSection.tsx        → How-we-work steps (6 KB)
    ├── ProductsSection.tsx       → Products showcase (19 KB)
    ├── ProjectMapSection.tsx     → Geographic project map (6 KB)
    └── TestimonialsSection.tsx   → Testimonials carousel (8 KB)
```

## Hooks

| File | Purpose |
|------|---------|
| `src/hooks/use-counter.ts` | Animated counter hook (IntersectionObserver + RAF) |
| `src/hooks/use-rfq-cart.ts` | Zustand hydration hook (`useRfqCartHydrated`) to prevent SSR mismatches |

## Utilities

| File | Purpose |
|------|---------|
| `src/lib/utils/cn.ts` | Tailwind class merger (`clsx` + `tailwind-merge`) |
| `src/lib/utils/index.ts` | Utility barrel export |
| `src/lib/utils/tracking.ts` | UTM / source tracking helpers |

## State Management

| Concern | Approach |
|---------|---------|
| Theme | `next-themes` ThemeProvider (dark/light) |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion (page transitions, scroll reveals) |
| Carousel | Embla Carousel React |
| Session & Auth | Auth.js v5 JWT cookie authentication & RBAC |
| RFQ Cart State | Zustand localStorage persisted store (`dbsn-rfq-cart`) |
| URL state | Planned Phase 3 |

## UI Pattern

```
CVA (class-variance-authority) → variant definitions
clsx + tailwind-merge (cn()) → conditional class composition
Radix UI primitives → accessibility-first headless components
Framer Motion → entrance animations, scroll-triggered reveals
```