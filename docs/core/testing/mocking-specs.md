# Mocking Specifications

**Purpose:** Standard patterns for mocking external services in unit and integration tests  
**Framework:** Jest  
**Coverage Target:** 80%+

---

## Overview

This document defines standard mocking patterns for all external integrations in the DBSN project. Tests should never depend on live external services.

**External Services to Mock:**
1. Neon Postgres (via Prisma ORM)
2. Sanity.io (GROQ queries)
3. Resend (Email API)
4. Telegram Bot API

---

## Test File Structure

```typescript
// src/lib/__tests__/example.test.ts
import { mockPrismaClient } from '@/lib/__mocks__/prisma';
import { mockSanityClient } from '@/lib/__mocks__/sanity';
import { mockResend } from '@/lib/__mocks__/resend';
import { mockTelegram } from '@/lib/__mocks__/telegram';

jest.mock('@prisma/client', () => mockPrismaClient);
jest.mock('@sanity/client', () => mockSanityClient);
jest.mock('@resend/node', () => mockResend);
jest.mock('node-fetch', () => mockTelegram);
```

---

## 1. Neon Postgres (via Prisma)

### Setup

Create mock file at `src/lib/__mocks__/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

export const mockPrismaClient = {
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    lead: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    redirectMap: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
  })),
};
```

### Usage Examples

#### Create Operation

```typescript
import { PrismaClient } from '@prisma/client';

describe('LeadRepository', () => {
  const mockClient = new PrismaClient() as jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create lead with source attribution', async () => {
    const leadData = {
      segment: 'B2G' as const,
      sourceDomain: 'sentradaya.com',
      contactEmail: 'test@example.com',
    };

    mockClient.lead.create.mockResolvedValue({
      id: 'lead-123',
      ...leadData,
      createdAt: new Date('2026-05-20T10:00:00Z'),
    });

    const result = await createLead(leadData);

    expect(mockClient.lead.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        segment: 'B2G',
        sourceDomain: 'sentradaya.com',
        contactEmail: 'test@example.com',
      }),
    });

    expect(result.id).toBe('lead-123');
  });
});
```

#### FindMany Operation

```typescript
it('should return leads filtered by segment', async () => {
  const mockLeads = [
    { id: 'lead-1', segment: 'B2G' as const },
    { id: 'lead-2', segment: 'B2G' as const },
  ];

  mockClient.lead.findMany.mockResolvedValue(mockLeads);

  const result = await getLeadsBySegment('B2G');

  expect(mockClient.lead.findMany).toHaveBeenCalledWith({
    where: { segment: 'B2G' },
    orderBy: { createdAt: 'desc' },
  });

  expect(result).toHaveLength(2);
});
```

#### Transaction Mocking

```typescript
it('should handle transactions correctly', async () => {
  const leadData = { segment: 'B2G' as const, contactEmail: 'test@example.com' };
  
  mockClient.lead.create.mockResolvedValue({ id: 'lead-123', ...leadData });
  mockClient.$transaction.mockImplementation(async (callback) => {
    return await callback(mockClient);
  });

  await createLeadWithTransaction(leadData);

  expect(mockClient.$transaction).toHaveBeenCalledWith(expect.any(Function));
  expect(mockClient.lead.create).toHaveBeenCalled();
});
```

### Error Simulation

```typescript
it('should handle database errors', async () => {
  mockClient.lead.create.mockRejectedValue(new Error('Database connection failed'));

  await expect(createLead({})).rejects.toThrow('Database connection failed');
});

it('should handle unique constraint violations', async () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    'Unique constraint failed',
    { code: 'P2002', clientVersion: '5.0.0' }
  );
  
  mockClient.lead.create.mockRejectedValue(error);

  await expect(createLead({ email: 'duplicate@example.com' }))
    .rejects.toThrow('Email already registered');
});
```

---

## 2. Sanity.io (GROQ Queries)

### Setup

Create mock file at `src/lib/__mocks__/sanity.ts`:

```typescript
import { createClient } from '@sanity/client';

const mockFetch = jest.fn();

export const mockSanityClient = {
  createClient: jest.fn(() => ({
    fetch: jest.fn(),
    config: jest.fn(() => ({
      projectId: 'mock-project-id',
      dataset: 'production',
    })),
  })),
};

export const mockSanityFetch = {
  products: jest.fn(),
  certifications: jest.fn(),
  portfolio: jest.fn(),
  spokeConfig: jest.fn(),
};
```

### Usage Examples

#### Product Query

```typescript
import { createClient } from '@sanity/client';
import { mockSanityClient, mockSanityFetch } from '@/lib/__mocks__/sanity';

jest.mock('@sanity/client', () => mockSanityClient);

describe('ProductService', () => {
  const client = createClient({
    projectId: 'test-project',
    dataset: 'test',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch products by spoke', async () => {
    const mockProducts = [
      {
        _id: 'product-1',
        title: 'PJU Solar Cell',
        slug: { current: 'pju-solar-cell' },
        spoke: { _ref: 'spoke-pju' },
      },
    ];

    (client.fetch as jest.Mock).mockResolvedValue(mockProducts);

    const result = await getProductsBySpoke('pju');

    expect(client.fetch).toHaveBeenCalledWith(
      expect.stringContaining('*[_type == "product" && spoke._ref == "spoke-pju"]')
    );

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('PJU Solar Cell');
  });
});
```

#### Image Asset Mocking

```typescript
it('should handle image assets', async () => {
  const mockProduct = {
    _id: 'product-1',
    title: 'Product with Image',
    images: [
      {
        _key: 'img-1',
        asset: {
          _ref: 'image-abc123-800x600-jpg',
          url: 'https://cdn.sanity.io/images/mock-project-id/production/abc123-800x600.jpg',
        },
      },
    ],
  };

  (client.fetch as jest.Mock).mockResolvedValue([mockProduct]);

  const result = await getProductImages('product-1');

  expect(result[0].url).toContain('cdn.sanity.io');
  expect(result[0].url).toContain('.jpg');
});
```

### Error States

```typescript
it('should handle 404 errors', async () => {
  (client.fetch as jest.Mock).mockResolvedValue(null);

  const result = await getProductBySlug('nonexistent');

  expect(result).toBeNull();
});

it('should handle timeout errors', async () => {
  (client.fetch as jest.Mock).mockRejectedValue(
    new Error('Request timeout after 10000ms')
  );

  await expect(getProductBySlug('product-slug')).rejects.toThrow('Request timeout');
});
```

---

## 3. Resend (Email API)

### Setup

Create mock file at `src/lib/__mocks__/resend.ts`:

```typescript
import { Resend } from '@resend/node';

export const mockResend = {
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
};

export const mockResendSend = {
  success: jest.fn().mockResolvedValue({
    id: 'email-abc123',
    from: 'noreply@sentradaya.com',
    to: 'recipient@example.com',
    created_at: '2026-05-20T10:00:00Z',
  }),
  failure: jest.fn().mockRejectedValue(new Error('API rate limit exceeded')),
};
```

### Usage Examples

#### Send Acknowledgment Email

```typescript
import { Resend } from '@resend/node';
import { mockResend, mockResendSend } from '@/lib/__mocks__/resend';

jest.mock('@resend/node', () => mockResend);

describe('EmailService', () => {
  const resend = new Resend({ apiKey: 'test-key' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send RFQ acknowledgment email', async () => {
    resend.emails.send = mockResendSend.success;

    await sendRfqAcknowledgment({
      to: 'customer@example.com',
      leadId: 'lead-123',
    });

    expect(resend.emails.send).toHaveBeenCalledWith({
      from: 'noreply@sentradaya.com',
      to: 'customer@example.com',
      subject: expect.stringContaining('RFQ Received'),
      html: expect.stringContaining('lead-123'),
    });
  });

  it('should return email ID on success', async () => {
    resend.emails.send = mockResendSend.success;

    const result = await sendRfqAcknowledgment({
      to: 'test@example.com',
      leadId: 'lead-123',
    });

    expect(result.id).toBe('email-abc123');
  });
});
```

#### Template Verification

```typescript
it('should use correct template for client provisioning', async () => {
  resend.emails.send = mockResendSend.success;

  await sendClientProvisioningEmail({
    to: 'client@example.com',
    dashboardUrl: 'https://dashboard.sentradaya.com',
    tempPassword: 'TempPass123!',
  });

  expect(resend.emails.send).toHaveBeenCalledWith(
    expect.objectContaining({
      template: expect.any(String),
      subject: expect.stringContaining('Dashboard Access'),
    })
  );
});
```

### Error Simulation

```typescript
it('should handle Resend API failures', async () => {
  resend.emails.send = mockResendSend.failure;

  await expect(
    sendRfqAcknowledgment({ to: 'test@example.com', leadId: 'lead-123' })
  ).rejects.toThrow('API rate limit exceeded');
});

it('should fall back to console if API unavailable', async () => {
  resend.emails.send = mockResendSend.failure;

  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

  await sendRfqAcknowledgmentWithFallback({
    to: 'test@example.com',
    leadId: 'lead-123',
  });

  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining('Failed to send email'),
    expect.any(Error)
  );
});
```

---

## 4. Telegram Bot API

### Setup

Create mock file at `src/lib/__mocks__/telegram.ts`:

```typescript
// Telegram API uses fetch internally
export const mockTelegramApi = {
  sendMessage: jest.fn().mockResolvedValue({
    ok: true,
    result: {
      message_id: 123,
      chat: { id: -1001234567890, title: 'Sales Operations' },
      text: 'Test message',
      date: 1716182400,
    },
  }),
  error: jest.fn().mockRejectedValue(new Error('Bot token invalid')),
  rateLimit: jest.fn().mockRejectedValue(
    new Error('Too Many Requests: retry after 60')
  ),
};

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
```

### Usage Examples

#### Send Alert Message

```typescript
import { mockTelegramApi } from '@/lib/__mocks__/telegram';

describe('TelegramService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTelegramApi.sendMessage(),
    });
  });

  it('should send RFQ alert to sales channel', async () => {
    await sendRfqAlert({
      segment: 'B2G',
      spoke: 'pju',
      contactEmail: 'customer@example.com',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.telegram.org/bot'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('New B2G RFQ'),
      })
    );
  });

  it('should include all required fields in message', async () => {
    const messagePayload = {
      segment: 'B2G' as const,
      spoke: 'pju',
      companyName: 'PT Test Company',
      contactEmail: 'customer@example.com',
      productCategory: 'PJU Solar Cell',
    };

    await sendRfqAlert(messagePayload);

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);

    expect(body.text).toContain('B2G');
    expect(body.text).toContain('pju');
    expect(body.text).toContain('PT Test Company');
  });
});
```

#### Bot Token Validation

```typescript
it('should handle invalid bot token', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({
      ok: false,
      description: 'Unauthorized: invalid token',
    }),
  });

  await expect(
    sendRfqAlert({ segment: 'B2G', spoke: 'pju', contactEmail: 'test@example.com' })
  ).rejects.toThrow('Unauthorized: invalid token');
});
```

### Rate Limiting

```typescript
it('should handle rate limiting with backoff', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: { get: () => '60' },
      json: async () => ({ ok: false, description: 'Too Many Requests' }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, result: { message_id: 123 } }),
    });

  await sendRfqAlertWithRetry({
    segment: 'B2G',
    spoke: 'pju',
    contactEmail: 'test@example.com',
  });

  expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + retry
});
```

---

## Mock Utility Functions

### Create reusable test helpers:

```typescript
// src/lib/__tests__/helpers.ts
export const mockLead = (overrides = {}) => ({
  id: 'lead-123',
  segment: 'B2G' as const,
  sourceDomain: 'sentradaya.com',
  contactEmail: 'test@example.com',
  contactName: 'Test User',
  createdAt: new Date('2026-05-20T10:00:00Z'),
  submissionStatus: 'received' as const,
  ...overrides,
});

export const mockProduct = (overrides = {}) => ({
  _id: 'product-1',
  _type: 'product' as const,
  title: 'PJU Solar Cell',
  slug: { current: 'pju-solar-cell' },
  spoke: { _ref: 'spoke-pju' },
  ...overrides,
});

export const mockEmailResponse = (overrides = {}) => ({
  id: 'email-abc123',
  from: 'noreply@sentradaya.com',
  to: 'test@example.com',
  created_at: '2026-05-20T10:00:00Z',
  ...overrides,
});
```

---

## Best Practices

1. **Always clear mocks** in `beforeEach()` to prevent test pollution
2. **Use specific expectations** - verify exact parameters passed to mocks
3. **Test both success and failure paths** for all external integrations
4. **Mock at the boundary** - mock the client library, not the HTTP layer directly
5. **Keep mocks realistic** - return data structures matching production
6. **Avoid over-mocking** - only mock what's necessary for the test
7. **Document mock behavior** - explain why specific responses are expected

---

## Related Documentation

- [Project Roadmap](../project-roadmap.md) — Phase 2.5 (RFQ Forms) status
- [TDD v1](../architecture/tdd-v1.md) — Testing strategy and coverage requirements
- [Local Setup](../development/local-setup.md) — Development environment configuration

---

*Last modified: 2026-05-20*