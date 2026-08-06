# Landing Page UX/UI Quality Audit

**Date:** 2026-07-09
**Scope:** `src/app/(hub)/page.tsx` and all 10 sections rendered below `HeroSection`
**Method:** Code-level audit against 7 criteria, scored 1–5 (5 = excellent)
**Reference:** `.stitch/DESIGN.md` (design tokens + component stylings)

---

## Executive Summary

The hero section is the only section that fully delivers on the brand promise: layered depth (photography + gradient + dot pattern + blurred floating blobs), glassmorphism stat cards, animated counters with hover-reveal gradient underlines, and a strong emerald→amber color story. **The moment a user scrolls past the hero, the visual energy drops by ~70%.** Sections 1–10 are well-structured, accessible, and on-brand color-wise, but they are overwhelmingly **white-on-white-on-gray-50 card grids with text content**, repeating the same `Card → Badge → Heading → Paragraph → Button` pattern with little depth, decoration, or rhythm variation.

**Three structural problems cause the "wall of text / flat below hero" feeling:**

1. **Background monotony** — 7 of 10 sections alternate between `bg-white` and `bg-gray-50/50` (barely distinguishable). Only `TestimonialsSection` (`bg-emerald-50/50`) and `CTABanner` (emerald gradient) break the pattern.
2. **Missing imagery** — `ArticlesSection` uses the same Newspaper-icon gradient placeholder for **all 6 cards**. `CertificationsSection` has zero certification-body logos. `TestimonialsSection` has zero client logos. `AboutSection` uses initials-in-circles instead of team photos. `PortfolioSection` has 8 of 12 items as hatched-line placeholders.
3. **Card-grid fatigue** — `About` (Tim), `Products`, `Portfolio`, `Certifications`, `Testimonials`, `Articles` all use the **same `grid sm:grid-cols-2 lg:grid-cols-3/4 gap-6` + white card + hover-lift** pattern. Nothing differentiates them visually.

**Concrete wins available without touching hero/navbar/footer:**
- Replace generic placeholders with real imagery / illustrations
- Introduce 3–4 distinct section background treatments (warm-cream tint, emerald-tint, amber-tint, gradient band) instead of `white ↔ gray-50`
- Cut the redundant "Mengapa Memilih Kami" stat block from `ProductsSection` (hero already shows 500+/15+/30+)
- Replace off-brand emoji icons in `FAQSection` with Lucide icons
- Constrain `ArticlesSection` category colors to the emerald/amber palette

---

## Score Matrix

| # | Section | Visual Density | Scroll Economy | Contrast & Hierarchy | Design System | Mobile | A11y | Motion | **Avg** |
|---|---------|---------------:|---------------:|---------------------:|--------------:|-------:|-----:|-------:|--------:|
| 1 | AboutSection | 3 | 2 | 3 | 4 | 4 | 4 | 3 | **3.29** |
| 2 | ProductsSection | 4 | 2 | 3 | 5 | 4 | 4 | 4 | **3.71** |
| 3 | PortfolioSection | 4 | 3 | 3 | 3 | 4 | 4 | 3 | **3.43** |
| 4 | CertificationsSection | 3 | 3 | 3 | 4 | 4 | 4 | 2 | **3.29** |
| 5 | ProcessSection | 4 | 4 | 3 | 4 | 5 | 4 | 3 | **3.86** |
| 6 | TestimonialsSection | 3 | 3 | 3 | 4 | 5 | 4 | 3 | **3.57** |
| 7 | ArticlesSection | 2 | 3 | 3 | 2 | 4 | 4 | 3 | **3.00** |
| 8 | FAQSection | 3 | 3 | 3 | 3 | 4 | 4 | 3 | **3.29** |
| 9 | CTABanner | 4 | 5 | 5 | 5 | 4 | 3 | 4 | **4.29** |
| 10 | ContactSection | 4 | 4 | 3 | 4 | 4 | 4 | 3 | **3.71** |
| | **HeroSection (reference)** | **5** | **5** | **5** | **5** | **5** | **4** | **5** | **4.86** |

**Page average below hero:** 3.41 / 5 — clear headroom for improvement.

---

## Per-Section Analysis

### 1. AboutSection — `src/components/sections/AboutSection.tsx`
**Avg score: 3.29**

**Top 3 issues:**
1. **Tab 1 "Profil Perusahaan" is a text wall** (lines 124–129) — two 4-line paragraphs back-to-back. Below the fold, the milestone timeline runs 6 items long, each with another sentence of body copy. Total reading load is heavy.
2. **Team cards use initials-in-gradient-circle avatars** (lines 219–223) instead of real photos. Visually flat and impersonal — every card looks identical, undermining the "meet the team" intent.
3. **Visi & Misi tab is a numbered list of 6 long sentences** (lines 194–203) — no visual hierarchy, no icons, no break in rhythm. Reads like a corporate PDF.

**Recommended fix:**
- Collapse profile paragraphs to a single 2-sentence lead + 4-icon highlight grid (already exists at lines 132–145 — make it the primary content).
- Replace initials-avatars with real photos from Sanity (`teamMember.image` field), or illustrated avatar illustrations in emerald monochrome.
- Convert Visi & Misi list to iconified cards in a 2-col grid (one card per mission with a Lucide icon).

---

### 2. ProductsSection — `src/components/sections/ProductsSection.tsx`
**Avg score: 3.71**

**Top 3 issues:**
1. **"Mengapa Memilih Kami?" stat block is redundant** (lines 54–59, 215–233) — duplicates the hero's 500+/15+/30+ stats. Wastes ~400px of vertical space and dilutes the hero's impact.
2. **All 4 product cards follow an identical visual rhythm** — top gradient bar, aspect-[4/3] image, icon-in-square, title, subtitle, paragraph, bullet list, button. The eye sees "the same card × 4" and disengages.
3. **Comparison table view** (lines 168–193) is a wall of 12-point text in a 5-column table — visually intimidating, no color-coding per product.

**Recommended fix:**
- **Remove the "Mengapa Memilih Kami" block entirely** — the hero already does this job. Saves ~400px scroll.
- Differentiate product cards via a unique decorative element per category: PJU gets a streetlight SVG illustration, Solar gets a sun-ray pattern, Petir gets a lightning-bolt watermark, Baterai gets a battery cell graphic. Keeps grid cohesion while adding personality.
- Add color-coded left-border accents to comparison table rows (emerald/amber alternating per product column).

---

### 3. PortfolioSection — `src/components/sections/PortfolioSection.tsx`
**Avg score: 3.43**

**Top 3 issues:**
1. **8 of 12 portfolio items render as hatched-line placeholders** (lines 116–121) with a generic `Building2` icon. This is the single biggest "looks unfinished" signal on the page. Default fallback data ships these placeholders — only 3 items (`p1`, `p2`, `p3`) have real image paths.
2. **Off-palette category colors** (lines 56–64) — `Private: bg-blue-100`, `EPC: bg-purple-100`. DESIGN.md *does* allow these as the "Category Accent System" (§2), but they break the emerald/amber rhythm when 4+ cards in a row show blue/purple.
3. **12 items is too many** — visual fatigue sets in around card 6. Filter chips help but the default "all" view is overwhelming.

**Recommended fix:**
- Ship a real image (or at minimum an SVG illustration in emerald monochrome) for every portfolio item — no hatched placeholders.
- Default the filter to a curated "Government" or "BUMN" view (showing 5–6 items), expose "Semua" as the explicit choice.
- For `Private` and `EPC` categories, soften the accent: use `bg-blue-50/border-blue-200` instead of saturated `bg-blue-100`. Keeps category system intact while tonal weight stays emerald-led.

---

### 4. CertificationsSection — `src/components/sections/CertificationsSection.tsx`
**Avg score: 3.29**

**Top 3 issues:**
1. **Zero certification-body logos** — BSN, TÜV Rheinland, Kementerian Perindustrian, LKPP are all named in text but never shown as logos. For a B2G brand where "certified-feeling" is the *core atmosphere statement* in DESIGN.md §1, this is the biggest missed trust signal on the page.
2. **Every cert card is text-only** (lines 61–90) — type badge, status pill, title, description, body, date. No visual differentiation between SNI vs ISO vs TKDN cards beyond a 10px badge color.
3. **Static summary stat tiles** (lines 119–129) — same hover-lift pattern as every other section, no animation or visual interest to mark "12 active certifications" as a moment of pride.

**Recommended fix:**
- Add a certification-body logo strip (SVG logos for BSN, TÜV Rheinland, Kemperin, LKPP) above the Tabs component — visually rich, immediately conveys credibility.
- Use the type-icon (`Shield`, `Award`, `ClipboardCheck`, `FileCheck`) at **large size as a watermark** in each card background (`opacity-[0.04]`, bottom-right) — gives each card visual identity without competing with text.
- Animate the summary stat counters using the same `useCounter` hook the hero uses.

---

### 5. ProcessSection — `src/components/sections/ProcessSection.tsx`
**Avg score: 3.86 (highest non-CTA section)**

**Top 3 issues:**
1. **Plain white background** (line 17) — no dot pattern, no decoration, no subtle gradient. Looks bare next to AboutSection which has the same structure but adds pattern overlay (line 78).
2. **Timeline connector is static** — no scroll-linked progress animation. The `bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400` line (line 34) looks like a static decoration rather than a journey.
3. **Step descriptions are short but generic** ("Diskusi kebutuhan dan survey lokasi", "Desain teknis dan proposal penawaran") — no numbers, no proof points, no differentiators.

**Recommended fix:**
- Add the same `radial-gradient` dot pattern overlay used in AboutSection (line 78) at low opacity, OR add a subtle gradient tint `bg-gradient-to-b from-emerald-50/30 to-white`.
- Replace step descriptions with metric-backed statements ("Survey lokasi & analisis kebutuhan (1–3 hari)", "Desain teknis + RAB dalam 7 hari", etc.).
- Optional: scroll-linked progress bar on the connector line using Framer Motion `useScroll` + `useTransform`.

---

### 6. TestimonialsSection — `src/components/sections/TestimonialsSection.tsx`
**Avg score: 3.57**

**Top 3 issues:**
1. **No client logos** — testimonials reference "Pemerintah Kota Surabaya", "PT PLN (Persero)", "PT Wijaya Karya", "Telkom Indonesia", "PT Adhi Karya" — all major Indonesian institutions with publicly usable logos. Showing these as a logo strip (separate from testimonial cards) would dramatically increase trust signal per pixel.
2. **All 6 testimonial cards look identical** (lines 38–60) — same quote icon, same emerald accent, same star rating. No visual hierarchy between a Surabaya municipal contract and an Adhi Karya endorsement.
3. **`bg-emerald-50/50` is barely distinguishable from `bg-gray-50/50`** at the perceptual level — too close in lightness to create real section contrast.

**Recommended fix:**
- **Add a logo strip above the testimonial grid** showing 6–8 client logos in monochrome emerald.
- Differentiate the "featured" testimonial (e.g., the PLN or Adhi Karya one) with a larger card spanning 2 columns on desktop, a portrait photo, and a "featured" amber accent.
- Deepen the section background to `bg-gradient-to-b from-emerald-50 via-white to-emerald-50` — creates visible rhythm against adjacent white sections.

---

### 7. ArticlesSection — `src/components/sections/ArticlesSection.tsx`
**Avg score: 3.00 (lowest on page)**

**Top 3 issues:**
1. **Every article thumbnail is the same gradient + Newspaper icon placeholder** (lines 146–155). All 6 cards look like a wireframe. This is the worst visual offender on the page — it actively undermines credibility because articles look unfinished.
2. **Off-palette category colors** (lines 18–24) — `Regulasi: amber-100` ✓, `Industri: purple-100` ✗, `Teknik: teal-100` ✗, `Teknologi: orange-100` ✗. DESIGN.md only sanctions blue/purple under the "Category Accent System" for portfolio — these article colors leak off-brand.
3. **Author photos missing** — `article.author` is a string, no avatar. Articles feel impersonal.

**Recommended fix:**
- **Replace placeholder thumbnails with real imagery** — either Sanity-sourced article hero images, or illustrated category-specific SVGs (solar panel for "Energi Terbarukan", government building for "Regulasi", factory for "Industri", tools for "Teknik", circuit for "Teknologi"). Render with the emerald→amber gradient overlay for brand cohesion.
- Collapse category colors to **2 families**: emerald (Energi Terbarukan, Teknik) and amber (Regulasi, Industri, Teknologi). Keeps visual order while preserving filterability.
- Add author initials-in-circle (or real avatars if available) to the card footer alongside the date.

---

### 8. FAQSection — `src/components/sections/FAQSection.tsx`
**Avg score: 3.29**

**Top 3 issues:**
1. **Off-brand emoji category icons** (line 41) — `umum: "🏢"`, `produk: "💡"`, `pengadaan: "📋"`. DESIGN.md §3 specifies "Overline / Section Eyebrow — always paired with a small lucide icon inside an emerald-50 badge." Emojis break the industrial corporate aesthetic.
2. **Answers are dense paragraphs** (lines 17–37) — some answers run 6+ lines. Hard to scan.
3. **Open-vs-closed visual differentiation is weak** — only a subtle `bg-emerald-50/50` tint (line 123). Hard to tell at a glance which items are expanded.

**Recommended fix:**
- Replace emojis with Lucide icons (`HelpCircle`, `Lightbulb`, `ClipboardList`) inside emerald-50 badge squares — matches every other section's eyebrow pattern.
- Break long answers into bullet points or numbered steps (line 32 already does this for one answer — apply the pattern everywhere).
- Strengthen open state: thicker left border (`border-l-4 border-l-emerald-500`), subtle shadow lift (`shadow-sm`).

---

### 9. CTABanner — `src/components/sections/CTABanner.tsx`
**Avg score: 4.29 (best section — reference for others)**

**Top 3 issues:**
1. **Social proof notification is hidden on mobile** (line 107: `hidden sm:block`) — most Indonesian traffic is mobile-first per DESIGN.md §6. The animation is wasted on the majority of users.
2. **"500+ instansi" claim lacks specificity** — feels like a generic marketing line.
3. **Particle animation** (lines 52–55) does not appear to gate on `prefers-reduced-motion` — the floating `animation: float ...` keyframes run unconditionally.

**Recommended fix:**
- Replace `hidden sm:block` with a mobile-friendly variant: show a compact version (`max-w-[200px]`, bottom-anchored) on mobile, full version on desktop.
- Tighten the claim to something specific and verifiable ("Bergabung dengan 50+ Pemerintah Daerah dan 20+ BUMN yang mempercayai kami").
- Add `motion-safe:` prefix to the floating particle animation, or wrap in a `useReducedMotion` check.

---

### 10. ContactSection — `src/components/sections/ContactSection.tsx`
**Avg score: 3.71**

**Top 3 issues:**
1. **Three equal-weight cards** (Info, Form, Map) create no visual hierarchy — the user's eye doesn't know where to land first.
2. **Map iframe points at generic Surabaya** (line 208) — not the specific office address. Looks lazy.
3. **WhatsApp CTA is a small inline link** inside the contact-info card (line 109) — for Indonesian B2G/B2B, WhatsApp is the primary conversion channel and should be visually prominent.

**Recommended fix:**
- Make the **Form card the hero** (2-col span on desktop, emerald accent border, subtle gradient background) and stack Info + Map as secondary cards in the right column.
- Replace generic Surabaya embed with a real office address + a styled map pin overlay matching the emerald brand.
- Promote WhatsApp to a full-width secondary button on the form card and a prominent floating tile in the Info card (matching the green-50 / green-700 treatment but larger).

---

## Cross-Cutting Themes

### Theme 1: Background rhythm is broken
Current sequence: `white → gray-50/50 → white → gray-50/50 → white → emerald-50/50 → white → white → emerald-gradient → white`

The `gray-50/50` is too close to `white` to register as contrast. The single `emerald-50/50` (Testimonials) and the CTA gradient are the only visual breaks.

**Proposed rhythm (still emerald/amber-led):**
```
Hero       → gradient overlay (unchanged)
About      → warm-cream `#FBFAF7` with dot pattern
Products   → white (cards carry the visual)
Portfolio  → subtle amber tint `bg-amber-50/30`
Certifications → white with watermark icons
Process    → emerald gradient band `from-emerald-50 to-white`
Testimonials → deep emerald `from-emerald-50 via-white to-emerald-50`
Articles   → white with category icon watermarks
FAQ        → warm-cream `#FBFAF7`
CTA        → emerald gradient (unchanged — already great)
Contact    → white
```

### Theme 2: Imagery is structurally missing
- Articles: 0/6 real images
- Portfolio: 3/12 real images (default data)
- Certifications: 0/4 body logos
- Testimonials: 0/6 client logos
- Team: 0/4 real photos

**Recommendation:** Treat imagery acquisition as a Phase 2 prerequisite. Either source from Sanity CMS (requires content entry), commission SVG illustrations in emerald/amber monochrome, or use a managed stock library (Unsplash/Pexels filtered for renewable energy / Indonesian infrastructure).

### Theme 3: Card grid pattern overuse
6 of 10 sections use the identical `grid sm:grid-cols-2 lg:grid-cols-3 gap-6` + `Card` with `hover-lift` pattern. This is the single biggest contributor to "everything looks the same below the hero."

**Recommendation:** Introduce layout variety per section:
- About → split-screen (text + visual side-by-side)
- Products → bento-grid (1 large featured + 3 small)
- Portfolio → masonry or featured-row + grid
- Testimonials → single featured large + smaller satellites
- Articles → horizontal scroll carousel
- Certifications → logo strip + tabbed grid

### Theme 4: Motion is uniform but reserved
All sections use `ScrollReveal` (Framer Motion fade-up). No section uses scroll-linked transforms, sticky elements, parallax, or staggered reveals beyond the basic delay cascade.

**Recommendation:** Add 2–3 "motion moments" to break the uniform fade-up:
- Process timeline scroll-linked progress
- Portfolio filter change with layout animation
- Stats counter triggered on viewport entry (already done in ProductsSection, replicate to CertificationsSection)

### Theme 5: Off-palette color leaks
- ArticlesSection category colors (`purple`, `teal`, `orange`) — outside DESIGN.md palette
- FAQSection emoji icons — outside DESIGN.md icon language
- CertificationsSection status orange — slightly off-amber, should use `accent-300`/`accent-400`

**Recommendation:** Constrain all non-brand colors to the `accent-100/200/300` (amber) family or the explicitly-sanctioned Category Accent System (blue/purple for portfolio only).

---

## Proposed Redesign Approach (Phase 2 — pending approval)

The redesign will be **scoped and incremental**, not a wholesale rewrite. The hero, navbar, footer, routing, Sanity schema, and auth are explicitly out of scope.

**Sequenced work plan (each step independently shippable):**

| Step | Target | Expected impact | Effort |
|------|--------|-----------------|--------|
| 1 | Remove "Mengapa Memilih Kami" block from ProductsSection | -400px scroll, removes redundancy | XS |
| 2 | Replace FAQSection emojis with Lucide icons in emerald badges | On-brand consistency | XS |
| 3 | Constrain ArticlesSection category colors to emerald/amber | Palette discipline | XS |
| 4 | Adjust section background rhythm (per Theme 1) | Visual contrast vs hero | S |
| 5 | Add certification-body logo strip to CertificationsSection | Trust signal density | S |
| 6 | Add client logo strip to TestimonialsSection | Trust signal density | S |
| 7 | Replace article placeholder thumbnails with illustrated SVGs | Visual completeness | M |
| 8 | Replace portfolio placeholders with illustrated SVGs or curated imagery | Visual completeness | M |
| 9 | Add section-specific layout variety (bento for Products, featured+grid for Portfolio) | Card fatigue fix | M |
| 10 | Tighten FAQ answer formatting (bullets for long answers) | Scannability | S |
| 11 | Promote WhatsApp CTA in ContactSection | Conversion lift | S |
| 12 | Add scroll-linked progress to ProcessSection timeline | Motion moment | S |
| 13 | Add watermark background icons to Certifications / Articles cards | Card visual identity | S |
| 14 | Verify `prefers-reduced-motion` on CTABanner particles | A11y compliance | XS |

**Acceptance gates per step:**
- `pnpm build` passes
- `pnpm test` passes (no regressions)
- Mobile (375px), tablet (768px), desktop (1280px) visual check
- WCAG 2.2 AA contrast verified (4.5:1 body, 3:1 large text)
- Zero ad-hoc color/spacing values — all from DESIGN.md tokens

---

## Open Questions for Reviewer

Before approving Phase 2, please decide:

1. **Imagery strategy** — should I (a) use SVG illustrations I author inline (fastest, on-brand, but lower fidelity), (b) block Phase 2 on Sanity CMS content entry (highest fidelity, slowest), or (c) mix: SVG for placeholders now, Sanity swap-in later?
2. **Scope of layout changes** — comfortable with bento-grid / featured-card layouts (Step 9), or prefer to keep all grids uniform and only change backgrounds + imagery?
3. **Trust logos** — do you have rights-cleared asset files for BSN, TÜV Rheinland, Kemperin, LKPP, PLN, Wijaya Karya, Telkom, Adhi Karya logos? If not, should I omit the logo strips (Steps 5–6) until assets are available?
4. **Specific address** — what is the real office address for the ContactSection map embed (currently generic Surabaya)?
5. **Phase 2 sequencing** — do you want all 14 steps in one PR, or split into 2–3 PRs (e.g., quick-wins 1–3 first, visual 4–8 second, motion+layout 9–14 third)?

---

*Audit artifact — awaiting reviewer approval before Phase 2 redesign work begins.*
