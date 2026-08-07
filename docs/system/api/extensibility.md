# API & Adapter Extensibility Architecture

> **Scope**: Standard architectural patterns for extending the DBSN platform with new product spokes and API endpoints.

---

## 1. Hub-and-Spoke Extension Pattern

The DBSN platform uses a Next.js App Router route-group architecture to isolate product domains:

```
src/app/
├── (hub)/                  # Corporate hub (dayaberkah.id)
├── (spokes)/               # Product spokes
│   ├── pju/                # pju.dayaberkah.id
│   ├── solarcell/          # solarcell.dayaberkah.id
│   ├── alatpetir/          # alatpetir.dayaberkah.id
│   └── baterai/            # baterai.dayaberkah.id
└── (dashboard)/            # Client portal (dashboard.dayaberkah.id)
```

### Adding a New Spoke
To add a new product spoke vertical:
1. Create a route group under `src/app/(spokes)/<spoke-name>/`.
2. Register the subdomain mapping in `src/lib/middleware/config.ts`.
3. Follow the step-by-step Minimal Working Example (MWE):
   👉 [`docs/system/api/mwe/add-new-spoke.md`](mwe/add-new-spoke.md)

---

## 2. API Route Handler Extension Pattern

All API endpoints follow a strict contract structure using Zod schema validation:

```ts
// Standard API route handler response format
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}
```

### Adding a New API Endpoint
To create a typed API route handler:
1. Define request/response Zod schemas in `src/lib/api/schemas/`.
2. Add route handler in `src/app/api/<feature>/route.ts`.
3. Follow the step-by-step Minimal Working Example (MWE):
   👉 [`docs/system/api/mwe/add-api-endpoint.md`](mwe/add-api-endpoint.md)
