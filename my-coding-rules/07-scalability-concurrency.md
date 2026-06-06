# Scalability & Concurrency

> Think "10 API instances behind a load balancer." Every piece of code must work when two instances process related events simultaneously.

## Distributed Systems Mindset

Before writing code, ask: "Would this work with 10 API instances behind a load balancer?"

### No In-Memory State for Coordination

```typescript
// BAD: only works on single instance
const processedIds = new Set<string>()
if (processedIds.has(id)) return

// GOOD: Redis or database-backed deduplication
const alreadyProcessed = await redis.get(`processed:${id}`)
if (alreadyProcessed) return
await redis.set(`processed:${id}`, '1', 'EX', 3600)
```

### No In-Memory Rate Limiting on Multi-Instance Services

```typescript
// BAD: each instance has its own counter
let requestCount = 0

// GOOD: Redis-backed rate limiting
const key = `rate:${orgId}:${endpoint}`
const count = await redis.incr(key)
if (count === 1) await redis.expire(key, 60)
if (count > limit) throw new AppError('Rate limit exceeded', 429)
```

## Idempotency

Operations that can be triggered more than once (webhooks, queue retries, event replays) must be idempotent.

### Database Idempotency Keys

```typescript
const alreadyProcessed = await EventRepository.existsByIdempotencyKey(key)
if (alreadyProcessed) return
```

### Queue Job Deduplication

```typescript
// GOOD: deterministic, entity-scoped
jobId: `process-order_${orderId}`
jobId: `send-notification-${userId}-${eventId}`

// BAD: includes timestamps (defeats deduplication)
jobId: `process-order_${orderId}_${Date.now()}`
```

### Database Constraints as Ultimate Backstop

```typescript
await db
  .insertInto('events')
  .values(event)
  .onConflict((oc) => oc.column('external_event_id').doNothing())
  .execute()
```

## Race Condition Prevention

### Optimistic Locking

For status transitions where concurrent updates are rare but must not clobber each other:

```typescript
static async updateWithOptimisticLock(
  id: string,
  expectedStatus: string,
  updates: ItemUpdate,
) {
  const result = await db
    .updateTable('items')
    .set(updates)
    .where('id', '=', id)
    .where('status', '=', expectedStatus)
    .execute()

  if (result.numUpdatedRows === 0n) {
    throw new AppError('Item was modified concurrently', 409, 'CONFLICT')
  }
}
```

### Pessimistic Locking

For critical sections within a transaction where you need exclusive access:

```typescript
await db.transaction().execute(async (trx) => {
  const item = await trx
    .selectFrom('items')
    .where('id', '=', itemId)
    .forUpdate()
    .executeTakeFirst()

  if (item.processed) return
  await trx.updateTable('items').set({ processed: true }).where('id', '=', itemId).execute()
})
```

### Database Unique Constraints

The strongest guarantee against duplicates:

```typescript
// Migration
await db.schema
  .createIndex('idx_events_external_id_unique')
  .on('events')
  .column('external_event_id')
  .unique()
  .execute()
```

## Decision Guide

| Scenario | Tool |
|---|---|
| Only one instance should run this at a time | Distributed lock (Redis) |
| Webhook/event might arrive twice | Idempotency key (DB or job ID) |
| Two updates might hit the same row concurrently | Optimistic lock (status check in WHERE) |
| Must read-then-write atomically | `SELECT ... FOR UPDATE` in transaction |
| Duplicate inserts must be impossible | Database unique constraint + `ON CONFLICT` |

Default to the simplest tool. A unique constraint beats a distributed lock for preventing duplicate inserts.

## Async & Promise Discipline

### Parallelize Independent Awaits

```typescript
// BAD: sequential
const users = await fetchUsers(orgId)
const items = await fetchItems(orgId)

// GOOD: concurrent
const [users, items] = await Promise.all([fetchUsers(orgId), fetchItems(orgId)])
```

### No Await Inside Loops

```typescript
// BAD: N+1 async pattern
for (const id of ids) {
  await processItem(id)
}

// GOOD: batch
await Promise.all(ids.map(id => processItem(id)))
```

### Intentional Fire-and-Forget

```typescript
// GOOD: explicit rejection handling
void sendNotification(itemId).catch((err) =>
  logger.warn({ itemId, err }, 'Notification failed (non-critical)')
)

// BAD: unhandled promise — errors vanish silently
sendNotification(itemId)
```

## State Machine Discipline

When an entity has a `status` field with more than 3 values, define valid transitions as data.

```typescript
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

const VALID_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

function assertValidTransition(from: OrderStatus, to: OrderStatus): void {
  if (!VALID_TRANSITIONS[from].includes(to)) {
    throw new AppError(`Cannot transition from '${from}' to '${to}'`, 400)
  }
}
```

### Transition Rules

- The service layer owns transition validation — not the repository, not the controller
- Terminal states are final — no transitioning out without an explicit reopen flow
- Log every state transition with `{ from, to, triggeredBy, reason }`

## Queue Workers

### Workers Orchestrate, Don't Implement

Queue workers call existing services. They don't contain business logic.

```typescript
// GOOD
async processJob(job: Job) {
  const service = new OrderService()
  await service.processOrder(job.data.orderId)
}

// BAD: business logic in the worker
async processJob(job: Job) {
  const order = await db.selectFrom('orders').where('id', '=', job.data.orderId).executeTakeFirst()
  if (order.status === 'pending') {
    await db.updateTable('orders').set({ status: 'confirmed' }).where('id', '=', order.id).execute()
    await sendConfirmationEmail(order)
  }
}
```

## Reliability Patterns

- **Retry loops have an N-strikes escape.** After N consecutive failures (usually 3), surface the failure and force-advance past the poison input
- **Memoize successes only, never failures.** A cached failure re-serves the error to every caller
- **Cursors advance ONLY after the downstream side-effect succeeds.** Don't move the read cursor before processing commits
- **External I/O is bounded by an explicit timeout.** Every fetch, query, or external call has a deadline
