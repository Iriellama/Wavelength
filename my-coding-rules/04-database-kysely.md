# Database Patterns — MySQL + Kysely

> One repository per table. Organization-scoped queries. Transactions for multi-step mutations.

## Stack

- **Database:** MySQL via Aiven Cloud Console
- **Query Builder:** Kysely (type-safe SQL builder for TypeScript)
- **Type Generation:** Kysely codegen or manual typed table definitions
- **Validation:** Zod for input validation before DB writes

## Repository Pattern

One repository per table. Static methods with Kysely. Thin data access only.

```typescript
import { db } from '@/lib/database'
import type { DB } from '@/types/database'
import type { Insertable, Selectable, Updateable } from 'kysely'

export type Item = Selectable<DB['items']>
export type NewItem = Insertable<DB['items']>
export type ItemUpdate = Updateable<DB['items']>

export class ItemRepository {
  static async findById(id: string): Promise<Item | undefined> {
    return db.selectFrom('items').where('id', '=', id).selectAll().executeTakeFirst()
  }

  static async findByOrg(organizationId: string): Promise<Item[]> {
    return db
      .selectFrom('items')
      .where('organization_id', '=', organizationId)
      .selectAll()
      .execute()
  }

  static async insert(data: NewItem): Promise<Item> {
    const result = await db.insertInto('items').values(data).executeTakeFirstOrThrow()
    return ItemRepository.findById(result.insertId as string) as Promise<Item>
  }

  static async update(id: string, data: ItemUpdate): Promise<void> {
    await db.updateTable('items').set(data).where('id', '=', id).execute()
  }

  static async delete(id: string): Promise<void> {
    await db.deleteFrom('items').where('id', '=', id).execute()
  }
}
```

## Kysely Database Instance

```typescript
import { Kysely, MysqlDialect } from 'kysely'
import { createPool } from 'mysql2'
import type { DB } from '@/types/database'

const pool = createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
})

export const db = new Kysely<DB>({
  dialect: new MysqlDialect({ pool }),
})
```

## Transactions for Multi-Step Mutations

When updating multiple tables as part of one logical operation, use transactions.

```typescript
await db.transaction().execute(async (trx) => {
  await trx
    .updateTable('orders')
    .set({ status: 'completed', completed_at: new Date() })
    .where('id', '=', orderId)
    .execute()

  await trx
    .insertInto('order_events')
    .values({ order_id: orderId, event: 'completed', created_at: new Date() })
    .execute()
})
```

## Query Rules

### Organization-Scoped Queries

Every query that touches user data MUST filter by `organization_id`. This is a security requirement.

```typescript
// ALWAYS include org scope
static async findByOrg(orgId: string, filters: ItemFilters) {
  let query = db.selectFrom('items').where('organization_id', '=', orgId)
  if (filters.status) query = query.where('status', '=', filters.status)
  return query.selectAll().execute()
}
```

### Pagination — Cursor-Based

```typescript
static async listPaginated(orgId: string, cursor?: string, limit = 25) {
  let query = db
    .selectFrom('items')
    .where('organization_id', '=', orgId)
    .orderBy('created_at', 'desc')
    .limit(limit + 1)

  if (cursor) {
    query = query.where('created_at', '<', cursor)
  }

  const rows = await query.selectAll().execute()
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows

  return {
    data: items,
    hasMore,
    nextCursor: hasMore ? items[items.length - 1].created_at : null,
  }
}
```

### No N+1 Queries

```typescript
// BAD: N+1 — one query per item
for (const item of items) {
  const owner = await UserRepository.findById(item.owner_id)
}

// GOOD: batch query
const ownerIds = items.map(i => i.owner_id)
const owners = await db
  .selectFrom('users')
  .where('id', 'in', ownerIds)
  .selectAll()
  .execute()

const ownerMap = new Map(owners.map(o => [o.id, o]))
```

### No Await Inside Loops

```typescript
// BAD: sequential, each waits for previous
for (const id of ids) {
  await processItem(id)
}

// GOOD: concurrent
await Promise.all(ids.map(id => processItem(id)))
```

## Migrations (Kysely)

```typescript
import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('items')
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('organization_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('status', 'varchar(50)', (col) => col.notNull().defaultTo('draft'))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createIndex('idx_items_org_id')
    .on('items')
    .column('organization_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('items').execute()
}
```

### Migration Rules

- Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- Always add indexes on frequently queried columns
- New columns must be nullable or have defaults (backward compat during deploys)
- Consider the performance impact of indexes on write-heavy tables

## Type Generation

Keep database types in sync with your schema. Either use Kysely's introspection or maintain manually:

```typescript
export interface DB {
  items: {
    id: string
    organization_id: string
    name: string
    status: 'draft' | 'active' | 'archived'
    created_at: Date
    updated_at: Date
  }
  users: {
    id: string
    email: string
    name: string
    created_at: Date
  }
}
```

## Performance Rules

- Don't add joins or subqueries to frequently-called endpoints without measuring impact
- Use indexes on columns in WHERE, ORDER BY, and JOIN clauses
- Prefer precomputed/cached data for read-heavy paths
- Store enum values in the DB, map to display strings in the frontend only
