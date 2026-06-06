# Architecture & Layered Design

> Every request flows through exactly these layers. No shortcuts.

## The Four Layers

```
Route → Controller → Service → Repository
  ↓         ↓           ↓          ↓
 HTTP    Parsing    Business    Data
schema  + auth      logic      access
```

### Route

Thin wiring — HTTP method, path, schema, auth middleware. Reads like a table of contents.

```typescript
app.post('/api/items', {
  schema: createItemSchema,
  preHandler: [authMiddleware],
  handler: withRouteErrorHandling(createItem, { route: 'create-item' }),
})
```

### Controller

Parses and validates input (Zod `safeParse`), delegates to services, builds HTTP response. No business logic.

```typescript
export async function createItem(request: FastifyRequest, reply: FastifyReply) {
  const result = CreateItemSchema.safeParse(request.body)
  if (!result.success) {
    return reply.status(400).send({ success: false, errors: result.error.flatten() })
  }

  const item = await itemService.create(result.data)
  return reply.status(201).send({ success: true, data: item })
}
```

### Service

Orchestrates business logic. Coordinates multiple repositories. Validates state transitions. Returns typed results.

```typescript
export class ItemService {
  constructor(private db = DatabaseInstance.getInstance()) {}

  async create(input: CreateItemInput): Promise<ItemResult> {
    const existing = await ItemRepository.findBySlug(input.slug)
    if (existing) {
      return { success: false, error: 'Slug already taken', code: 'CONFLICT' }
    }
    return { success: true, data: await ItemRepository.insert(input) }
  }
}
```

### Repository

Thin data access. One per table. No transformation logic, no business rules.

```typescript
export class ItemRepository {
  static async findBySlug(slug: string) {
    return db.selectFrom('items').where('slug', '=', slug).executeTakeFirst()
  }

  static async insert(data: NewItem) {
    return db.insertInto('items').values(data).returningAll().executeTakeFirstOrThrow()
  }
}
```

## File Structure

```
src/
├── routes/
│   └── <feature>.router.ts         # Route registration only
├── controllers/
│   └── <feature>.controller.ts     # Handler functions
├── services/
│   └── <feature>/
│       ├── <feature>.service.ts    # Orchestration logic
│       ├── <feature>.types.ts      # Internal types
│       └── <feature>.schema.ts     # Zod schemas
├── repositories/
│   └── <feature>.repository.ts     # Data access (Kysely)
└── schemas/
    └── <feature>.schema.ts         # Request/response Zod schemas
```

## Layer Rules

| Layer | CAN do | MUST NOT do |
|---|---|---|
| Route | Wire HTTP to handler, apply middleware | Contain handler logic or schemas inline |
| Controller | Parse input, call services, build response | Contain business logic or DB access |
| Service | Orchestrate business logic, call repos | Know about HTTP (request/reply objects) |
| Repository | Execute queries, return typed data | Contain business rules or transformations |

## Design Pattern Selection

| Situation | Pattern | Example |
|---|---|---|
| N things with same lifecycle, different details | Strategy/Adapter | Channel message sending |
| Open-ended set of variants, each self-contained | Registry | Webhook providers |
| 2–3 simple branches, unlikely to grow | Switch + exhaustive `default: never` | Priority mapping |
| Complex multi-step with rollback | Transaction script (`db.transaction()`) | Bulk operations |
| Cross-cutting behavior | Middleware/Decorator | Logging, auth, rate limiting |

## Single Update Point

Build update objects incrementally. Write once.

```typescript
// GOOD: one update
const updates: Partial<Item> = {}
if (shouldArchive) updates.archived_at = new Date()
if (shouldReassign) updates.owner_id = newOwnerId
if (Object.keys(updates).length > 0) {
  await ItemRepository.update(id, updates)
}

// BAD: scattered updates
if (shouldArchive) await ItemRepository.update(id, { archived_at: new Date() })
if (shouldReassign) await ItemRepository.update(id, { owner_id: newOwnerId })
```
