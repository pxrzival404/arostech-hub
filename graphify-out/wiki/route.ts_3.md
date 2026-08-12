# route.ts

> 32 nodes

## Key Concepts

- **queue.test.ts** (18 connections) — `src/__tests__/lib/api/notifications/queue.test.ts`
- **queue.ts** (14 connections) — `src/lib/api/notifications/queue.ts`
- **NotificationQueue** (9 connections) — `src/lib/api/notifications/queue.ts`
- **resend.ts** (8 connections) — `src/lib/api/notifications/resend.ts`
- **telegram.ts** (8 connections) — `src/lib/api/notifications/telegram.ts`
- **notifications.test.ts** (7 connections) — `src/__tests__/api/cron/notifications.test.ts`
- **.processJob()** (7 connections) — `src/lib/api/notifications/queue.ts`
- **notifications/route.ts** (6 connections) — `src/app/api/cron/notifications/route.ts`
- **sendRfqAcknowledgment()** (5 connections) — `src/lib/api/notifications/resend.ts`
- **sendInternalNotification()** (5 connections) — `src/lib/api/notifications/resend.ts`
- **alertNewRfq()** (5 connections) — `src/lib/api/notifications/telegram.ts`
- **alertRfqFailure()** (5 connections) — `src/lib/api/notifications/telegram.ts`
- **resend.test.ts** (4 connections) — `src/lib/api/notifications/__tests__/resend.test.ts`
- **alertQueueFailure()** (4 connections) — `src/lib/api/notifications/telegram.ts`
- **GET()** (3 connections) — `src/app/api/cron/notifications/route.ts`
- **telegram.test.ts** (3 connections) — `src/lib/api/notifications/__tests__/telegram.test.ts`
- **.enqueue()** (3 connections) — `src/lib/api/notifications/queue.ts`
- **.processAllPending()** (3 connections) — `src/lib/api/notifications/queue.ts`
- **mockNextResponse** (1 connections) — `src/__tests__/api/cron/notifications.test.ts`
- **mockProcessAllPending** (1 connections) — `src/__tests__/api/cron/notifications.test.ts`
- **createMockRequest()** (1 connections) — `src/__tests__/api/cron/notifications.test.ts`
- **mockJobCreate** (1 connections) — `src/__tests__/lib/api/notifications/queue.test.ts`
- **mockJobFindUnique** (1 connections) — `src/__tests__/lib/api/notifications/queue.test.ts`
- **mockJobFindMany** (1 connections) — `src/__tests__/lib/api/notifications/queue.test.ts`
- **mockJobUpdate** (1 connections) — `src/__tests__/lib/api/notifications/queue.test.ts`
- *... and 7 more nodes in this community*

## Relationships

- [route.ts](route.ts.md) (17 shared connections)

## Source Files

- `src/__tests__/api/cron/notifications.test.ts`
- `src/__tests__/lib/api/notifications/queue.test.ts`
- `src/app/api/cron/notifications/route.ts`
- `src/lib/api/notifications/__tests__/resend.test.ts`
- `src/lib/api/notifications/__tests__/telegram.test.ts`
- `src/lib/api/notifications/queue.ts`
- `src/lib/api/notifications/resend.ts`
- `src/lib/api/notifications/telegram.ts`

## Audit Trail

- EXTRACTED: 131 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*