---
name: DBSN Sentradaya
colors:
  # Primary Foundation — warm neutral base
  background: '#FBFAF7'        # oklch(0.99 0.002 155) — Warm Barely-There Cream
  foreground: '#1F1A14'        # oklch(0.15 0.02 155) — Warm Charcoal Text
  card: '#FFFFFF'              # Pure white card surface
  card-foreground: '#1F1A14'
  surface-warm-muted: '#F2EFEA'  # oklch(0.96 0.005 155) — Muted warm gray
  popover: '#FFFFFF'
  popover-foreground: '#1F1A14'

  # Brand Primary — Deep Forest Emerald (renewable energy / sustainability)
  primary: '#059669'           # emerald-600 — Primary brand emerald
  primary-deep: '#047857'      # emerald-700 — Navbar/CTA solid
  primary-darker: '#065F46'    # emerald-800 — Hover depth
  primary-darkest: '#064E3B'   # emerald-900 — Footer / hero gradient anchor
  primary-foreground: '#FFFFFF'
  primary-50: '#ECFDF5'
  primary-100: '#D1FAE5'
  primary-200: '#A7F3D0'
  primary-300: '#6EE7B7'
  primary-400: '#34D399'
  primary-500: '#10B981'
  primary-900: '#064E3B'

  # Accent — Warm Amber / Burnt Sienna (sunset / Indonesian warmth)
  accent: '#F59E0B'            # amber-500
  accent-deep: '#D97706'       # amber-600
  accent-darker: '#B45309'     # amber-700
  accent-darkest: '#92400E'    # amber-800 (also tailwind config "accent")
  accent-foreground: '#3F2A0A'
  accent-50: '#FFF7EB'
  accent-100: '#FEF3C7'
  accent-200: '#FDE68A'
  accent-300: '#FCD34D'
  accent-400: '#FBBF24'

  # Secondary — Muted Slate (for ghost UI chrome)
  secondary: '#F2EFEA'         # oklch(0.96 0.01 155)
  secondary-foreground: '#3A2E1F'
  muted: '#F2EFEA'
  muted-foreground: '#8A8278'  # oklch(0.5 0.02 155)

  # Hero Overlay Gradient (signature)
  hero-gradient-start: 'rgba(3, 44, 34, 0.92)'   # Deep forest
  hero-gradient-mid: 'rgba(4, 78, 57, 0.82)'     # Mid emerald
  hero-gradient-end: 'rgba(120, 53, 15, 0.7)'    # Burnt amber

  # Borders / Inputs / Rings
  border: '#E8E1D6'            # oklch(0.92 0.01 155) — warm hairline
  input: '#E8E1D6'
  ring: '#059669'              # Focus ring uses brand emerald
  ring-legacy: '#3B82F6'       # Legacy focus ring (input.tsx still references)
  border-emerald-soft: '#D1E7DC'
  border-amber-soft: '#F5E0B3'

  # Functional / State
  destructive: '#C8372A'       # oklch(0.577 0.245 27.325)
  destructive-foreground: '#FFFFFF'
  success: '#10B981'
  warning: '#F59E0B'
  info: '#3B82F6'

  # Category Accent System (portfolio filters)
  category-government: '#059669'  # emerald
  category-bumn: '#D97706'        # amber
  category-private: '#3B82F6'     # blue
  category-epc: '#9333EA'         # purple

  # WhatsApp floating CTA
  whatsapp: '#25D366'

typography:
  display-hero:
    fontFamily: Inter
    fontSize: clamp(2.25rem, 1rem + 4vw, 3.75rem)
    fontWeight: '700'
    lineHeight: 1.1
    letterSpacing: '-0.02em'
  section-heading:
    fontFamily: Inter
    fontSize: clamp(1.875rem, 1rem + 2vw, 2.25rem)
    fontWeight: '700'
    lineHeight: 1.2
    letterSpacing: '-0.01em'
  card-title:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 1.3
    letterSpacing: '0'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 1.6
    letterSpacing: '0'
  body-lead:
    fontFamily: Inter
    fontSize: clamp(1.125rem, 1rem + 0.5vw, 1.25rem)
    fontWeight: '400'
    lineHeight: 1.7
    letterSpacing: '0'
  overline-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: '0.08em'
  label-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: '0'
  stat-value:
    fontFamily: Inter
    fontSize: clamp(1.5rem, 1rem + 1.5vw, 2rem)
    fontWeight: '700'
    lineHeight: 1.2
    letterSpacing: '-0.02em'
  serif-editorial:
    fontFamily: Merriweather
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.7
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.375rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  2xl: 1rem
  3xl: 1.5rem
  pill: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  section-y: clamp(3rem, 2rem + 4vw, 5rem)
  gutter-mobile: 16px
  gutter-tablet: 24px
  gutter-desktop: 32px
  container-max: 1280px
---

# Design System: DBSN Sentradaya
**Project:** DBSN Centralized Digital Ecosystem — Hub-and-spoke renewable energy platform (PJU, Solar, Lightning Protection, Battery Storage)

## 1. Visual Theme & Atmosphere

The DBSN Sentradaya design system is grounded in the visual language of Indonesian renewable energy and infrastructure — **deep forest emerald greens** anchor the brand identity, paired with **warm amber / burnt-sienna accents** that evoke tropical sunset light on solar panels. The palette deliberately signals sustainability, industrial reliability, and national pride. It is a B2B / B2G brand (Pemerintah, BUMN, EPC clients), so the surface is **clean, breathable, and certified-feeling** rather than playful or trendy.

The atmosphere layers three depth strategies: (1) a **warm barely-there cream background** that keeps content sections airy, (2) **signature gradient overlays** — emerald → amber — used on hero imagery, CTAs, premium-card top bars, and section dividers to create visual continuity, and (3) **glassmorphism cards** (`bg-white/70 backdrop-blur-lg`) on hero panels, scroll-revealed stats, and floating notifications. Motion is generous but respectful: floating decorative blobs, animated gradients (15s shift), shimmer sweeps, and Framer Motion scroll-reveals all **disable cleanly under `prefers-reduced-motion`**. Trust badges (SNI, TKDN, LKPP, ISO) appear in nearly every section — certification is part of the visual identity, not just compliance.

## 2. Color Palette & Roles

### Primary Foundation
- **Warm Barely-There Cream** `#FBFAF7` (`oklch(0.99 0.002 155)`) — Page background. Warm-neutral, not pure white, signals craftsmanship over clinical sterility.
- **Warm Charcoal Text** `#1F1A14` (`oklch(0.15 0.02 155)`) — Primary foreground. Soft black with subtle warm undertone, easier on eyes than pure `#000`.
- **Pure White Card** `#FFFFFF` — Card surfaces, popovers, navbar-on-scroll.
- **Muted Warm Gray** `#F2EFEA` — Secondary/muted surfaces, input halos, subtle backgrounds.

### Accent & Interactive (Brand Primary — Deep Forest Emerald)
- **Brand Emerald** `#059669` (emerald-600) — Primary CTAs, links, active states, focus rings.
- **Deep Emerald** `#047857` (emerald-700) — Solid fills for navbar CTA, primary buttons, filter chips.
- **Forest Dark** `#065F46` / `#064E3B` (emerald-800/900) — Footer, deepest gradient anchors, hover depth.
- **Signature Gradient** — `rgba(3,44,34,0.92) → rgba(4,78,57,0.82) → rgba(120,53,15,0.7)` — forest → emerald → burnt amber. Used on hero overlay, CTA banners, premium-card top bars, section-divider underlines.

### Secondary Accent (Warm Amber / Burnt Sienna)
- **Sunset Amber** `#F59E0B` / `#FBBF24` (amber-400/500) — Secondary CTA highlights, TKDK badges, rating stars, decorative floating blobs.
- **Burnt Amber** `#D97706` / `#B45309` / `#92400E` (amber-600/700/800) — Deep accent fills, BUMN portfolio category, accent-foreground text.

### Typography & Text Hierarchy
- **Primary Text** Warm Charcoal `#1F1A14`
- **Body / Secondary Text** Warm Slate `#5A5147` (slate-600 with warm cast)
- **Muted Text** `#8A8278` (muted-foreground, oklch(0.5 0.02 155))
- **Brand Text on Dark** `#ECFDF5` / `#A7F3D0` (emerald-50/200) — Footer text, hero overlay captions.
- **Link Hover Text** Emerald-700 on light, Emerald-400 on dark.

### Functional States
- **Destructive** `#C8372A` (oklch(0.577 0.245 27.325)) — Form errors, delete actions.
- **Success** Emerald-500 `#10B981`
- **Warning** Amber-500 `#F59E0B`
- **Info** Legacy Blue `#3B82F6` — Retained for chart-1, legacy input focus, info icons.
- **Category Accent System** (portfolio filters) — Government `#059669`, BUMN `#D97706`, Private `#3B82F6`, EPC `#9333EA`.
- **WhatsApp** `#25D366` — Reserved green for the floating WhatsApp CTA.

## 3. Typography Rules

### Hierarchy & Weights
The system uses **Inter** as the primary sans-serif (via `next/font/google`, exposed as `--font-inter`), with **Merriweather** (`--font-merriweather`) as an editorial serif used sparingly for long-form article body copy. Geometric, high-x-height Inter conveys modern industrial precision; Merriweather softens editorial content with humanist warmth.

- **Hero Display** — `text-4xl sm:text-5xl lg:text-6xl`, weight 700, leading-tight (1.1), tracking `-0.02em`, white text over hero gradient with `text-shadow: 0 2px 30px rgba(0,0,0,0.6)` for outdoor-glare legibility.
- **Section Heading** — `text-3xl sm:text-4xl`, weight 700, color `emerald-900`, centered, with a 5rem wide pill underline (emerald-500 → amber-400 gradient) auto-rendered via `.section-heading::after`.
- **Card Title** — `text-2xl`, weight 600, tracking-tight, color `foreground`.
- **Body Lead** — `text-lg`, weight 400, leading-relaxed, `max-w-2xl mx-auto`.
- **Body Base** — `text-base sm:text-lg`, weight 400, leading-relaxed.
- **Overline / Section Eyebrow** — `text-xs sm:text-sm`, weight 600, `tracking-wider uppercase`, always paired with a small lucide icon inside an emerald-50 badge.
- **Stat Value** — `text-2xl sm:text-3xl`, weight 700, with animated counter (2s ease-out).
- **Form Label** — `text-sm`, weight 500, slate-700.
- **Caption / Microcopy** — `text-xs`, slate-500, leading-tight.

### Spacing Principles
Letter-spacing is **tight on display (-0.02em)** and **loose on overlines (+0.08em)**. Line-height follows editorial conventions: tight (1.1) for hero, comfortable (1.6) for body, generous (1.7) for long-form. Headings never use uppercase; overlines always do.

## 4. Component Stylings

### Buttons
Buttons use `rounded-md` (0.375rem) — modestly professional, not playful. Default height `h-10` (40px), padding `px-4 py-2`. **Touch targets enforce `min-h-[48px]`** on mobile-perceived CTAs (navbar, hero, contact forms). Variants:
- **Primary** — `bg-emerald-600 hover:bg-emerald-700 text-white`, drop shadow `shadow-xl shadow-emerald-600/40` on hero.
- **Outline** — `bg-transparent border-white/40 text-white hover:bg-white/10 backdrop-blur-sm` (over imagery), or `border-emerald-200 text-emerald-700 hover:bg-emerald-50` (on light).
- **Ghost / Secondary** — slate-100 hover, slate-500 text.
- **CTA-on-emerald** (CTABanner) — `bg-white text-emerald-800 hover:bg-emerald-50` — inverted for contrast on emerald-700 backgrounds.
- **States** — `transition-all duration-300`, `focus:ring-2 focus:ring-primary focus:ring-offset-2`.

### Cards & Premium Surfaces
Cards are the workhorse component — portfolio items, products, stats, certifications, blog teasers. Three tiers:
- **Base Card** — `rounded-lg border border-slate-200 bg-white shadow-sm`, padding `p-6`.
- **Hover-Lift Card** — adds `transition-all duration-300 hover:-translate-y-1 hover:shadow-lg` (`.card-hover`, `.hover-lift`, `.premium-card` utilities).
- **Premium Card** — top-edge gradient bar (`bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500`, opacity 0 → 100 on hover), hairline border `border-gray-200/80`, hover `border-emerald-200 hover:-translate-y-1`. Used for product cards and key portfolio items.
- **Glass Card** — `bg-white/70 backdrop-blur-lg border border-white/30 shadow-lg` — used over imagery (hero certificates, floating badges). Dark variant `bg-gray-800/70 border-gray-700/30`.

Domain-specific: **Portfolio Cards** include a numbered emerald-600 circular badge (top-left), aspect-video image area with `bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50` placeholder, category color-bar on top, and a 1.02 hover scale.

### Navigation
- **Navbar** — Transparent over hero (`bg-transparent`), becomes `bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200/50` after 20px scroll. Height `h-16`, max-width `max-w-7xl`, logo in `rounded-xl bg-white shadow-sm` container (36×36px). Brand text in `emerald-900` (solid) or `text-white` (transparent). Mobile drawer is a flat panel with `rounded-lg` links and full-width emerald-700 CTA.
- **Footer** — `bg-emerald-900 text-white` with 4-column grid, `uppercase tracking-wider` section titles, `emerald-300` links with `→` arrow revealed on hover. WhatsApp CTA in `bg-green-600/80 hover:bg-green-600 rounded-xl`.
- **Scroll Progress** — thin emerald bar at top of page.
- **Back-to-Top** — floating emerald CTA bottom-right after scroll.

### Inputs & Forms
Inputs use `h-10 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm`. Focus state: `focus:ring-2 focus:ring-primary` (legacy blue `#3b82f6` — note: brand-inconsistent, should be emerald). Form labels `text-sm font-medium text-slate-700`. Error state `border-red-500 focus-visible:ring-red-500` with `text-sm text-red-500` message below. RFQ cart forms (B2B / B2G) use `react-hook-form` + Zod with quantity steppers (`Minus`/`Plus` icons in emerald-50 squares).

### Domain-Specific Components
- **Trust Badge Grid** — SNI / TKDN / LKPP / ISO cards in a `bg-white/5 backdrop-blur-md rounded-2xl` panel on hero. Each badge is `rounded-xl bg-emerald-500/10` with `group-hover:scale-110 transition-transform duration-300` icon lift.
- **Hero Stat Counter** — `bg-white/10 backdrop-blur-md border border-white/20 rounded-xl` cards with animated count-up + bottom-edge gradient reveal (`from-emerald-400 to-amber-400`) on hover.
- **CTA Banner** — full-bleed `bg-gradient-to-r from-emerald-700 to-emerald-800` section with SVG diamond-pattern overlay, floating particle dots, countdown timer chips (`bg-white/15` rounded-lg with `text-white font-bold`), social-proof notification bottom-right.
- **Product Detail Sheet** — Radix Dialog bottom-sheet on mobile (`rounded-t-3xl`) / centered modal on desktop (`rounded-2xl`), with category-colored top accent bar (`bg-emerald-600` / `bg-amber-600`).
- **Section Divider** — `bg-gradient-to-r from-emerald-500 to-amber-400` thin pill at section bottoms.

## 5. Layout Principles

### Grid & Structure
- **Container Max Width** — `max-w-7xl` (1280px) for full sections; `max-w-4xl` (896px) for content-focused CTAs; `max-w-3xl` (768px) for section intros.
- **Responsive Gutters** — `px-4 sm:px-6 lg:px-8` (16 / 24 / 32px) consistently across all sections.
- **Section Vertical Rhythm** — `py-12 sm:py-16 lg:py-20` (48 / 64 / 80px), establishing a breathable industrial cadence.
- **Card Grids** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6` for portfolios/products; `grid-cols-2 sm:grid-cols-4` for stat quartets.
- **Hero Grid** — `lg:grid-cols-2 gap-12 items-center` for split-screen hero with right-side visual.

### Whitespace Strategy
8px base unit, expressed via Tailwind's standard scale (`gap-2 gap-4 gap-6 gap-8 gap-10 gap-12`). Section intros get `mb-12`, card grids `gap-6`, mobile reflows to `gap-4`. Internal card padding `p-6` (24px) standard, `p-5` (20px) on tighter stat tiles. Touch targets `min-h-[44px]` to `min-h-[48px]` per WCAG.

### Alignment & Visual Balance
Section headings are **centered** with eyebrow badge → heading → subtitle stack (`text-center max-w-3xl mx-auto mb-12`). Body content often returns to left-aligned within cards. Visual weight is balanced by alternating dense card grids with airy CTA bands between sections. Floating decorative elements (emerald-300/10 and amber-300/12 blurred circles) introduce organic asymmetry on the hero.

### Responsive Behavior & Touch
Mobile-first (Tailwind default). Breakpoints: `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`, `2xl 1536px`. Navbar collapses to hamburger at `md` breakpoint (768px). Hero right-column visual hides below `lg` (`hidden lg:block`). All interactive elements meet 44×44px touch minimum; primary CTAs push to 48px. Mobile dialogs become bottom-sheets (`rounded-t-3xl`); desktop dialogs center (`rounded-2xl sm:zoom-in-95`). Form fields use `type="tel"` `inputmode="numeric"` for Indonesian phone validation (`+62 / 62 / 0` patterns).

## 6. Design System Notes for Stitch Generation

### Language to Use
When prompting Stitch to generate screens in this system, use natural-language descriptors like: *"Indonesian renewable-energy corporate brand, deep forest emerald primary with warm amber sunset accents, breathable warm-cream background, glassmorphism cards over gradient overlays, certified-trust industrial aesthetic, Bahasa Indonesia copy, generous whitespace with animated scroll reveals."*

Avoid generic terms like "modern SaaS dashboard" or "clean startup landing" — they push toward blue/violet defaults that fight the brand. Instead reference: *"industrial sustainable infrastructure, B2G procurement portal, certification-heavy trust signals, hero with emerald-to-amber gradient overlay over energy infrastructure photography."*

### Color References
When specifying colors in prompts, pair descriptive names with hex values for clarity:
- *"Deep Forest Emerald `#059669` for primary CTAs and navigation"*
- *"Burnt Amber `#D97706` for certification badges and secondary highlights"*
- *"Warm Cream `#FBFAF7` for the page background, not pure white"*
- *"Hero gradient overlay: forest `#032C22` → emerald `#044E39` → burnt amber `#78350F`, with 60–80% opacity over photography"*
- *"Footer solid emerald-900 `#064E3B` with emerald-200 `#A7F3D0` link text"*

### Component Prompts
- **Hero Section**: *"Full-bleed hero with energy-infrastructure photograph under a 60% black overlay plus animated 15-second emerald-to-amber gradient. White H1 left-aligned with `text-shadow` for outdoor glare. Primary emerald CTA with `shadow-xl shadow-emerald-600/40` glow, ghost outline CTA beside it. Three glass stat cards (`bg-white/10 backdrop-blur-md`) below with animated count-up numbers. Bottom-right floating glass certificate badges. Scroll cue with `bounce-down` animation bottom-center."*
- **Product / Portfolio Card**: *"Pure-white premium card, `rounded-xl`, hairline border. Top-edge gradient bar (emerald-500 → amber-400 → emerald-500) hidden by default, opacity-100 on hover. Numbered emerald-600 circular badge top-left. Aspect-video image area with `from-emerald-100 via-emerald-50 to-amber-50` placeholder gradient. Hover lifts card by 4px with shadow-xl and emerald-200 border."*
- **CTA Banner**: *"Full-width emerald-700 → emerald-800 gradient section with subtle diamond SVG pattern at 6% opacity and floating white particle dots. Centered white headline + emerald-100 subtext. Frosted-glass countdown timer chip (`bg-white/10 backdrop-blur-sm border border-white/15`) with amber-400 clock icon. Two-button row: white-on-emerald-800 primary + transparent outline secondary with WhatsApp icon."*

### Incremental Iteration
- Start with **atmosphere first** — get the hero gradient + warm cream background right before refining components. The mood is the brand.
- Lock the **emerald + amber pair** early; every additional color (chart series, portfolio categories) should defer to one of these two families unless explicitly功能性 (destructive, WhatsApp, category accent).
- Push **certification signals** (SNI / TKDN / LKPP / ISO badges) into the hero, footer, and product detail — they are non-negotiable trust signals in this market.
- Use **glassmorphism sparingly** — only over photography or dark gradients. Glass cards on flat white backgrounds look out of place.
- Always include a `prefers-reduced-motion` fallback when animating (float, gradient-shift, shimmer, scroll-reveal).
- For mobile, default to bottom-sheet modals (`rounded-t-3xl`) rather than centered dialogs — the system uses this pattern consistently for product/portfolio detail.
- Touch targets `min-h-[48px]` on every CTA — Indonesian mobile-first users depend on this.
- Bilingual consideration: keep all user-facing copy in **Bahasa Indonesia**; technical spec sheets and certification codes stay in English (SNI, IEC, ISO, etc.).
