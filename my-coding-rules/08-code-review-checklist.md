# Code Review & Quality Checklist

> Run this checklist before every commit. Code quality is scored.

## Architecture

- [ ] Change is in the correct layer (Route → Controller → Service → Repository)
- [ ] No business logic in controllers or repositories
- [ ] No HTTP-aware code in services (no request/reply objects)
- [ ] Reuses existing services/hooks — no duplicated logic
- [ ] New files follow directory conventions and have a clear single responsibility

## Code Quality

- [ ] No nesting deeper than 2 levels — early returns used
- [ ] No nested ternaries
- [ ] No `as any` — all types are explicit
- [ ] No `console.log` — structured logger used
- [ ] Files under 300 lines (components) / 400 lines (services)
- [ ] Constants extracted for repeated values (no magic strings/numbers)
- [ ] Functions under ~30 lines with max 2 levels of nesting
- [ ] Named functions and variables describe intent (no `data`, `result`, `handler`)
- [ ] No unnecessary comments (no narration, no JSDoc on obvious functions)

## Type Safety

- [ ] All inputs validated with Zod at system boundaries
- [ ] Types derived from Zod schemas (`z.infer<typeof Schema>`)
- [ ] Literal unions used instead of raw `string` for known value sets
- [ ] Exhaustive switches with `default: never`
- [ ] No non-null assertions (`!`) — proper narrowing used
- [ ] All `z.string()` and `z.array()` have `.max()` bounds

## Database

- [ ] Organization-scoped queries (every user-data query filters by `organization_id`)
- [ ] Multi-step mutations wrapped in transactions
- [ ] No N+1 queries — batch operations used
- [ ] No `await` inside loops — use `Promise.all`
- [ ] Cursor-based pagination for list endpoints
- [ ] Indexes on frequently queried columns

## Error Handling

- [ ] Route handlers use centralized error handler wrapper
- [ ] Services return typed results for expected outcomes (not exceptions)
- [ ] No silent `catch { return null }` swallowing errors
- [ ] External calls have explicit timeouts
- [ ] Structured logging with correlation IDs (no string interpolation)

## API Design

- [ ] Responses use `{ success, data/message }` envelope
- [ ] Correct HTTP status codes (400 for validation, 404 for not found, etc.)
- [ ] Input validated from all sources (body, params, query)
- [ ] Auth middleware on every route (no accidental public endpoints)

## Concurrency & Reliability

- [ ] Concurrent writes guarded (optimistic lock, unique constraint, or distributed lock)
- [ ] Queue jobs use deterministic IDs for deduplication
- [ ] Webhook/event handlers are idempotent
- [ ] No in-memory state for cross-instance coordination
- [ ] State transitions validated in service layer before DB write
- [ ] Fire-and-forget promises have explicit `.catch()` handlers

## Anti-Patterns to Avoid

- Abstractions for a single consumer (premature factories, base classes)
- Speculative refactoring of unrelated code
- `Record<string, any>` as permanent metadata type
- Debug/trace logs in production paths
- try/catch blocks that swallow errors silently
- Multiple scattered updates to the same record
- Webhook payloads cast with `as` instead of parsed through Zod
- Boolean positional parameters
- Functions named `data`, `result`, `handler`, `process`

## Severity Guide

| Label | Meaning |
|---|---|
| **Blocker** | Violates type safety, security, or data integrity |
| **Major** | DRY/SRP violation, wrong layer, premature abstraction |
| **Minor** | Naming, constant extraction, small readability improvements |
