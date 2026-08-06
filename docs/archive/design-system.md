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

# Design System Specification — DBSN Sentradaya

**Project:** DBSN Centralized Digital Ecosystem — Hub-and-spoke renewable energy platform (PJU, Solar, Lightning Protection, Battery Storage)

## 1. Visual Theme & Atmosphere

The DBSN Sentradaya design system is grounded in the visual language of Indonesian renewable energy and infrastructure — **deep forest emerald greens** anchor the brand identity, paired with **warm amber / burnt-sienna accents** that evoke tropical sunset light on solar panels. The palette deliberately signals sustainability, industrial reliability, and national pride. It is a B2B / B2G brand (Pemerintah, BUMN, EPC clients), so the surface is **clean, breathable, and certified-feeling** rather than playful or trendy.

---

## 2. Color Palette & Roles

### Primary Foundation
- **Warm Barely-There Cream** `#FBFAF7` (`oklch(0.99 0.002 155)`) — Page background.
- **Warm Charcoal Text** `#1F1A14` (`oklch(0.15 0.02 155)`) — Primary foreground.
- **Pure White Card** `#FFFFFF` — Card surfaces, popovers, navbar-on-scroll.
- **Muted Warm Gray** `#F2EFEA` — Secondary/muted surfaces, input halos.

### Brand Primary (Deep Forest Emerald)
- **Brand Emerald** `#059669` (emerald-600) — Primary CTAs, links, active states, focus rings.
- **Deep Emerald** `#047857` (emerald-700) — Solid fills for navbar CTA, primary buttons.
- **Forest Dark** `#065F46` / `#064E3B` (emerald-800/900) — Footer, deepest gradient anchors.

---

## 3. Typography Rules

- **Primary Sans-Serif**: Inter (`--font-inter`)
- **Editorial Serif**: Merriweather (`--font-merriweather`)
