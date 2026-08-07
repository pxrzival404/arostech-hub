# Minimal Working Example (MWE): Adding a New Product Spoke

This guide provides a step-by-step walk-through for adding a new product spoke domain (for example, `pompa.dayaberkah.id`) to the DBSN Centralized Digital Ecosystem.

---

## Architecture Context

Spokes are segment-focused product domains handled by Next.js App Router route groups inside `src/app/(spokes)/[spoke]`. Edge Subdomain Middleware inspects incoming hostnames and routes requests accordingly.

---

## Step-by-Step Implementation

### Step 1: Create Route Group Folder
Create a new route directory under `src/app/(spokes)/`:
```
src/app/(spokes)/pompa/page.tsx
```

Example `page.tsx`:
```tsx
import React from "react";

export default function PompaSpokePage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <h1 className="text-4xl font-bold">Sistem Pompa Industri & Submersible</h1>
      <p className="mt-4 text-gray-600">Solusi pemompaan terintegrasi PT DBSN.</p>
    </main>
  );
}
```

### Step 2: Register Subdomain in Edge Middleware
Open `src/middleware.ts` and add the new subdomain mapping:

```typescript
const SPOKE_ROUTES: Record<string, string> = {
  pju: "/pju",
  solarcell: "/solarcell",
  alatpetir: "/alatpetir",
  baterai: "/baterai",
  pompa: "/pompa", // <--- Add new spoke entry here
};
```

### Step 3: Register Sanity Document Types (Optional)
If the spoke requires CMS-managed products, register the document schema in `studio/schemas/spokePompa.ts` and export it in `studio/schemas/index.ts`.

### Step 4: Local Testing via `lvh.me`
1. Start local dev server: `pnpm dev`
2. Open browser at: `http://pompa.lvh.me:3000`
3. Verify that middleware resolves `pompa` host to `src/app/(spokes)/pompa/page.tsx`.

---

## Verification & Deployment Checklist
- [ ] Local preview loads correctly at `pompa.lvh.me:3000`.
- [ ] Unit tests pass: `pnpm test`.
- [ ] Edge compilation succeeds: `pnpm pages:build`.
- [ ] Add DNS CNAME record pointing `pompa.dayaberkah.id` to `dayaberkah.pages.dev` in Cloudflare Dashboard.
