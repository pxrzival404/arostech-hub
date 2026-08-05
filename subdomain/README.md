# Arostech — Multi-Category Subdomain Website

Website multi-category subdomain untuk **PT Daya Berkah Sentosa Nusantara (Arostech)** — penyedia solusi PJU, baterai, solar panel, dan penangkal petir.

## Tech Stack

- **Framework**: Next.js 16.1.3 (App Router, Webpack mode)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Neon PostgreSQL (Prisma 6.19 ORM)
- **Auth**: NextAuth 4.24 (Credentials provider, JWT sessions)
- **CMS**: Sanity CMS (multi-tenant hub-spoke architecture)
- **Email**: Resend (transactional email with PDF attachments)
- **PDF**: PDFKit (2-PDF system: Raw + Processed RFQ)
- **Deployment**: PM2 + Caddy reverse proxy (standalone mode)

## Architecture

Multi-tenant architecture via subdomain routing:

| Subdomain | Category |
|-----------|----------|
| `pju` | PJU (Lampu Jalan Umum) |
| `baterai` | Baterai |
| `solarpanel` | Solar Panel |
| `penangkalpetir` | Penangkal Petir |

Each subdomain shares the same codebase but displays different product data, hero images, and content from Sanity CMS. Subdomain detection works via:
- **Production**: Host-based detection + cookies
- **Preview/Development**: `?subdomain=xxx` URL parameter

## Features

- 🌐 7+ public pages per subdomain (Home, Products, Articles, Portfolio, About, Contact, RFQ)
- 📦 Product catalog with dynamic sub-category tabs
- 📝 RFQ (Request for Quotation) system with draft folders
- 📄 Dual PDF generation (Raw RFQ + Processed Quotation)
- 📧 Automated email notifications via Resend
- 🎨 Sanity CMS with WYSIWYG editor (MDXEditor)
- 🔐 Admin dashboard with subdomain filtering
- 💰 Pricing engine with tier-based pricing
- 🖱️ Drag-and-drop file uploads
- 📱 Mobile-first responsive design
- 🌙 Dark mode with emerald green theme

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Sanity CMS project
- Resend account (for email)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/arostech-website.git
cd arostech-website

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your actual credentials

# Setup database
npx prisma generate
npx prisma db push

# Run development server (IMPORTANT: use webpack, not turbopack)
NODE_OPTIONS='--max-old-space-size=3072' npx next dev -p 3000
```

### Environment Variables

See `.env.example` for the complete list of required environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL pooled connection |
| `DATABASE_URL_UNPOOLED` | Neon PostgreSQL direct connection (for migrations) |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `NEXTAUTH_URL` | Base URL of your application |
| `RESEND_API_KEY` | Resend API key for emails |
| `SANITY_PROJECT_ID` | Sanity CMS project ID |
| `SANITY_API_TOKEN` | Sanity read-only API token |
| `SANITY_API_WRITE_TOKEN` | Sanity editor API token |

### Production Build

```bash
# Use the build script (handles standalone deployment file copying)
bash scripts/build.sh

# Start with PM2
npx pm2 start ecosystem.config.cjs
```

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages (Home, Products, RFQ, etc.)
│   ├── (studio)/studio/   # Sanity Studio (standalone layout)
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes (public + admin)
├── components/
│   ├── admin/             # Admin components (SubdomainFilter, etc.)
│   ├── ui/                # shadcn/ui + custom components (DropzoneInput)
│   ├── SpokeProvider.tsx  # Client-side subdomain context
│   └── SpokeLink.tsx      # Auto-preserves subdomain URL param
├── lib/
│   ├── pdf-generator.ts   # PDFKit generator (Raw + Processed RFQ)
│   ├── rfq-processor.ts   # Tier pricing, RFQ logic
│   ├── rfq-store.ts       # Zustand store (multi-tenant folders)
│   ├── email-service.ts   # Resend email service
│   ├── pricing-engine.ts  # Tier-based pricing calculation
│   └── subdomain.ts       # Subdomain config maps
├── sanity/                # Sanity schemas, queries, fetchers
├── data/                  # Fallback data per subdomain
└── types/                 # TypeScript type definitions
```

## RFQ Workflow

1. **Client** submits RFQ → Draft stored in Zustand
2. **Client** confirms submission → Raw PDF generated, email sent to client + sales team
3. **Admin** reviews in dashboard → Updates pricing, adds signature → Sends quotation
4. **Client** receives Processed PDF via email → Can accept or reject

## Important Notes

- **Use Webpack, NOT Turbopack** — Turbopack causes OOM errors
- **Standalone deployment** requires copying `.next/static/` to `.next/standalone/.next/static/` after build (handled by `scripts/build.sh`)
- **PDFKit** only supports PNG/JPEG (not WebP) for image embedding
- **Sanity Vision** is disabled due to a bug in @sanity/vision 6.x
- **Sub-kategori** tabs are derived dynamically from product data, not hardcoded
- **RFQ page** fetches product data from Sanity API, not hardcoded arrays

## License

Private — All rights reserved.
