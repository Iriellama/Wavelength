# API Design Conventions

> Consistent response envelopes. Meaningful status codes. Cursor-based pagination.

## Response Envelope

All API responses use a consistent envelope.

### Success

```typescript
return reply.status(200).send({
  success: true,
  data: result,
})
```

### Success with Pagination

```typescript
return reply.status(200).send({
  success: true,
  data: items,
  hasMore: true,
  nextCursor: 'abc123',
})
```

### Error (Validation)

```typescript
return reply.status(400).send({
  success: false,
  message: 'Validation failed',
  errors: result.error.flatten(),
})
```

### Error (Business Logic)

```typescript
return reply.status(404).send({
  success: false,
  message: 'Item not found',
})
```

### Rules

- Always include `success: boolean` at the top level
- Use `data` for the primary payload
- Use `message` for human-readable error descriptions
- Use `errors` (plural) for Zod validation detail — always `.flatten()`, not `.format()`
- Don't spread service results into top level — wrap in `data`

## HTTP Status Codes

| Code | When to use |
|---|---|
| `200` | Successful reads and updates |
| `201` | Successful creates (new resource) |
| `400` | Bad input, failed validation, missing required fields |
| `401` | Not authenticated (missing/invalid token) |
| `403` | Authenticated but not authorized (wrong role, wrong org) |
| `404` | Resource not found |
| `409` | Conflict (duplicate, resource already exists) |
| `500` | Unhandled server error |

Don't use `422` — validation errors are `400`. Don't return `200` with `{ success: false }`.

## Endpoint Naming

- Use kebab-case: `/side-conversations`, not `/sideConversations`
- Use plural nouns for collections: `/items`, `/users`, `/orders`
- Nest resource-scoped actions: `GET /orders/:orderId/items`
- Use flat paths for specific actions: `POST /items/:itemId/archive`

```
GET    /api/items                    # List items
POST   /api/items                    # Create item
GET    /api/items/:id                # Get item
PATCH  /api/items/:id                # Update item
DELETE /api/items/:id                # Delete item
GET    /api/items/:id/comments       # List item comments
POST   /api/items/:id/archive        # Archive item
```

## Pagination

### Cursor-Based (Preferred)

```typescript
const { cursor, limit = 25 } = request.query

const items = await ItemRepository.listPaginated(orgId, cursor, limit)

return reply.send({
  success: true,
  data: items.data,
  hasMore: items.hasMore,
  nextCursor: items.nextCursor,
})
```

### Query Parameters

- `limit` — page size (enforce max in validation, e.g. `.max(100)`)
- `cursor` — opaque token from previous response. Omit on first request
- `page` — only for offset-based (admin/internal tools)

## Input Validation

Every route handler validates input with Zod before processing. Validate all sources.

```typescript
const ListItemsQuery = z.object({
  limit: z.coerce.number().min(1).max(100).default(25),
  cursor: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
})

const CreateItemBody = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
})

const ItemParams = z.object({
  id: z.string().uuid(),
})
```

## Authentication & Authorization

Every route has auth middleware. No accidental public endpoints.

```typescript
// Standard pattern
app.addHook('preHandler', authMiddleware)

// Controller checks authorization
if (request.user.role !== 'admin') {
  return reply.status(403).send({ success: false, message: 'Admin access required' })
}
```

### Input Validation Is Layer 1

Zod validation is the first line of defense. Organization scoping in queries is layer 2. Both are required.

## Backward Compatibility

- **Adding a field**: Safe, no coordination needed
- **Deprecating a field**: Add replacement first, mark old as deprecated, remove later
- **Changing a field type**: Treat as add new + deprecate old. Never change type in place
