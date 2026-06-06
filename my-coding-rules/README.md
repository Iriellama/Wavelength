# Prompt Wars — Code Quality Directives

> Hackathon coding standards for TypeScript + MySQL (Aiven) + Kysely + Zod projects.
> Attach these files to your prompts for consistent, production-grade code quality.

## Stack

| Layer | Tech |
|---|---|
| Language | TypeScript (strict mode) |
| Database | MySQL via Aiven Cloud Console |
| Query Builder | Kysely (type-safe SQL) |
| Validation | Zod |
| Runtime | Node.js |

## Files

| File | What It Covers |
|---|---|
| [`01-architecture.md`](./01-architecture.md) | Layered design (Route → Controller → Service → Repository), file structure, design patterns |
| [`02-clean-code.md`](./02-clean-code.md) | SOLID, DRY, KISS, YAGNI, readability, naming, file discipline |
| [`03-typescript-zod.md`](./03-typescript-zod.md) | Type safety, Zod schemas, boundary parsing, naming conventions |
| [`04-database-kysely.md`](./04-database-kysely.md) | Repository pattern, Kysely setup, transactions, migrations, pagination |
| [`05-error-handling.md`](./05-error-handling.md) | Structured errors, centralized handler, logging, typed results |
| [`06-api-design.md`](./06-api-design.md) | Response envelopes, HTTP status codes, endpoint naming, pagination |
| [`07-scalability-concurrency.md`](./07-scalability-concurrency.md) | Distributed systems, idempotency, race conditions, state machines, async discipline |
| [`08-code-review-checklist.md`](./08-code-review-checklist.md) | Pre-commit quality checklist, anti-patterns, severity guide |

## How to Use

Attach the relevant files to your AI prompts depending on what you're building:

- **Setting up the project?** → `01-architecture` + `04-database-kysely` + `03-typescript-zod`
- **Building API endpoints?** → `01-architecture` + `06-api-design` + `05-error-handling`
- **Writing business logic?** → `02-clean-code` + `03-typescript-zod` + `07-scalability-concurrency`
- **Code review / final pass?** → `08-code-review-checklist`
- **Everything?** → Attach all 8 files

## Core Philosophy

1. **Fix the root cause, never the symptom**
2. **Reuse before you build** — search first
3. **Simplicity over cleverness** — no premature abstraction
4. **Parse, don't validate** — Zod at every boundary
5. **Think distributed** — would this work with 10 instances?
6. **Clean, honest, small** — every line earns its place
