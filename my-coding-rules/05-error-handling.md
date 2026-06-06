# Error Handling & Observability

> Errors are structured, not stringified. No silent fallbacks. No `console.log`.

## Error Handling Rules

### Structured Errors, Not Strings

Throw `Error` instances or typed subclasses. Never `throw 'string'`. Preserve `cause` when re-throwing.

```typescript
// GOOD
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

throw new AppError('Item not found', 404, 'NOT_FOUND')

// BAD
throw 'Item not found'
throw new Error('something broke') // no status, no code
```

### Centralized Route Error Handler

Every route handler uses a wrapper that catches unhandled exceptions and returns structured responses.

```typescript
function withRouteErrorHandling(
  handler: RouteHandler,
  meta: { route: string },
): RouteHandler {
  return async (request, reply) => {
    try {
      return await handler(request, reply)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
          code: error.code,
        })
      }
      logger.error({ error, route: meta.route }, 'Unhandled route error')
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}
```

### No Silent Fallbacks

Don't wrap throwing code in `catch (e) { return null }`. Either handle the specific error type meaningfully or let it propagate.

```typescript
// BAD: hides failures
try {
  const data = await fetchExternal()
  return data
} catch {
  return null
}

// GOOD: handle specific errors
try {
  const data = await fetchExternal()
  return data
} catch (error) {
  if (error instanceof TimeoutError) {
    return { success: false, error: 'External service timed out' }
  }
  throw error
}
```

### Typed Service Results

Services return typed results instead of throwing for expected business outcomes.

```typescript
type CreateResult =
  | { success: true; data: Item }
  | { success: false; error: string; code: 'VALIDATION' | 'CONFLICT' | 'NOT_FOUND' }

async function createItem(input: CreateInput): Promise<CreateResult> {
  const existing = await ItemRepository.findBySlug(input.slug)
  if (existing) {
    return { success: false, error: 'Slug already taken', code: 'CONFLICT' }
  }
  const item = await ItemRepository.insert(input)
  return { success: true, data: item }
}
```

### External I/O Has Explicit Timeouts

Every fetch/query/external call has a deadline. On timeout, return a structured failure rather than throwing.

```typescript
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)

try {
  const response = await fetch(url, { signal: controller.signal })
  return { success: true, data: await response.json() }
} catch (error) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return { success: false, message: 'Request timed out' }
  }
  throw error
} finally {
  clearTimeout(timeout)
}
```

## Logging Discipline

### Structured Logger Only

```typescript
// GOOD: structured, with correlation IDs
logger.info({ itemId, organizationId, action: 'created' }, 'Item created successfully')
logger.error({ error, itemId }, 'Failed to create item')

// FORBIDDEN in production
console.log('Processing item:', id)
console.error('Error:', err)
logger.info('Processing ' + id)                    // string interpolation
logger.info('🛍️ ITEM SERVICE: starting...')         // emoji-heavy
logger.debug('[TRACE] entering processItem')        // entry/exit tracing
```

### Child Loggers for Services

```typescript
export class ItemService {
  private logger = logger.child({ service: 'ItemService' })

  async create(input: CreateInput) {
    this.logger.info({ slug: input.slug }, 'Creating item')
    // ...
  }
}
```

### Log What Matters

- Log state transitions: `'Item status transition'` with `{ from, to, triggeredBy }`
- Log external API failures with context
- Don't log function entry/exit or environment dumps
- Every log line must earn its place — logs cost money

## Validation Errors

Return structured validation errors using Zod's `.flatten()`.

```typescript
const result = CreateItemSchema.safeParse(request.body)
if (!result.success) {
  return reply.status(400).send({
    success: false,
    message: 'Validation failed',
    errors: result.error.flatten(),
  })
}
```

## Error Capture Best Practices

```typescript
// Capture unexpected errors with rich context
captureError(error, {
  operation: 'createItem',
  step: 'external-api-call',
  itemId,
  organizationId,
})

// DON'T capture expected errors
// Validation failures, normal not-found flows — these are business logic, not bugs

// Normalize unknown errors
const err = error instanceof Error ? error : new Error(String(error))
```
