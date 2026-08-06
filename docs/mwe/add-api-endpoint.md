# Minimal Working Example (MWE): Adding a Secure API Endpoint

This guide demonstrates how to create a production-ready, type-safe, and secure API endpoint in the App Router under `src/app/api/`.

---

## Standards & Requirements

All API endpoints MUST implement:
1. Input Validation using **Zod** schemas.
2. Structured JSON Error Responses with proper HTTP status codes.
3. Edge Compatibility (using Neondatabase Serverless or Fetch API).
4. Session verification via Auth.js (if restricted).

---

## Step-by-Step Implementation

### Step 1: Create Route Handler
Create `src/app/api/example/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email(),
  category: z.enum(["general", "technical"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Business Logic Here
    return NextResponse.json(
      { success: true, data: validatedData },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Step 2: Testing the Endpoint
Run Jest route unit test under `src/__tests__/api/example.test.ts` or test via `curl`:

```bash
curl -X POST http://lvh.me:3000/api/example \
  -H "Content-Type: application/json" \
  -d '{"email":"test@dayaberkah.id","category":"technical"}'
```

---

## Security Best Practices
- Never expose internal database stack traces in response bodies.
- Enforce CORS rules at the Cloudflare WAF or middleware level.
