# TypeScript & Zod Type Discipline

> Types, not casts. Zero `any`. Parse, don't validate.

## Non-Negotiables

- Strict TypeScript: `noImplicitAny`, `strictNullChecks`
- Zero `as any`. `as unknown as X` only when TypeScript genuinely cannot infer, with an inline note
- No `Record<string, any>` as a permanent solution
- Prettier: single quotes, no semis, trailing commas, 2-space tabs, 100 print width

## Zod Schema Discipline

### Parse at Boundaries

Every piece of data crossing a system boundary is untrusted. Parse it through Zod.

| Boundary | Risk if unvalidated |
|---|---|
| HTTP request body/params/query | Malformed input crashes handler |
| Webhook payloads from external services | Provider changes shape without warning |
| Queue/job payloads | Serialization drift between producer and consumer |
| JSONB/JSON columns from the database | Stale or corrupted data from older code |
| Environment variables | Missing config crashes at runtime |

```typescript
// GOOD: parse at the boundary
const WebhookPayload = z.object({
  event: z.enum(['created', 'updated', 'deleted']),
  data: z.object({ id: z.string().uuid() }),
})

function handleWebhook(raw: unknown) {
  const result = WebhookPayload.safeParse(raw)
  if (!result.success) {
    logger.warn({ errors: result.error.flatten() }, 'Invalid webhook payload')
    return
  }
  await processEvent(result.data)
}

// BAD: cast and pray
function handleWebhook(payload: any) {
  const event = payload as WebhookEvent
  await processEvent(event)
}
```

### Schema File Separation

| Concern | File | Rule |
|---|---|---|
| Zod schemas | `<module>.schema.ts` | Never inline in a service/controller |
| Interfaces/types | `<module>.types.ts` | Internal interfaces (>3 fields) — never inline in business logic |
| Large helpers | `<module>.helper.ts` | Pure functions >~30 lines — their own file |

### Bounded Inputs

Every `z.string()` that accepts external content gets `.max(N)`. Every `z.array()` gets `.max(M)`.

```typescript
const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20),
})
```

## Type Patterns

### Derive Types from Schemas

```typescript
const ItemSchema = z.object({
  name: z.string(),
  status: z.enum(['draft', 'active', 'archived']),
})

type Item = z.infer<typeof ItemSchema>
```

### Use Literal Unions Over `string`

```typescript
// BAD
function setStatus(status: string) { ... }

// GOOD
type ItemStatus = 'draft' | 'active' | 'archived'
function setStatus(status: ItemStatus) { ... }
```

### Extract Inline Union Types

Inline unions with 3+ members belong in a named type alias.

```typescript
// BAD
function handle(type: 'created' | 'updated' | 'deleted' | 'merged' | 'reopened') { ... }

// GOOD
type EventType = 'created' | 'updated' | 'deleted' | 'merged' | 'reopened'
function handle(type: EventType) { ... }
```

### Exhaustive Switches

```typescript
switch (status) {
  case 'draft': return handleDraft()
  case 'active': return handleActive()
  case 'archived': return handleArchived()
  default: {
    const _exhaustive: never = status
    throw new Error(`Unhandled status: ${status}`)
  }
}
```

### Avoid Non-Null Assertions (`!`)

Prefer proper narrowing, early returns, or explicit error throwing.

```typescript
// BAD
const user = users.find(u => u.id === id)!

// GOOD
const user = users.find(u => u.id === id)
if (!user) throw new Error(`User ${id} not found`)
```

### Typed Results Over Thrown Errors

```typescript
// GOOD: caller handles each case
type CreateResult =
  | { success: true; data: Item }
  | { success: false; error: string; code: 'VALIDATION' | 'CONFLICT' }

// BAD: mixing exceptions for control flow
throw new Error('Item already exists')
```

## Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Files | kebab-case | `item-service.ts` |
| Components | PascalCase | `ItemCard.tsx` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `ItemStatus` |
| Functions | camelCase | `createItem()` |

## Environment Variables at Startup

Validate all required env vars when the app boots, not when first accessed.

```typescript
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  PORT: z.coerce.number().default(3000),
})

export const env = EnvSchema.parse(process.env)
```
