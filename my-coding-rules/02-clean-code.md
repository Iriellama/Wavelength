# Clean Code Principles

> Clean, honest, small. Every line earns its place.

## Core Principles

| Principle | Rule |
|---|---|
| **SRP** | Single Responsibility — each function/class/file does ONE thing |
| **DRY** | Don't Repeat Yourself — extract duplicates at the 2nd occurrence |
| **OCP** | Open/Closed — adding a variant is additive (new file + registration), not scattered edits |
| **DIP** | Depend on interfaces and injected services, not concrete implementations |
| **KISS** | Keep It Simple — simplest solution that works. No premature abstraction |
| **YAGNI** | You Aren't Gonna Need It — no factories with one implementation, no registries with one plugin |

## Code Readability

### Early Returns Over Nesting

Maximum nesting depth: 2 levels. Guard clauses first, happy path last.

```typescript
// BAD
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      doThing()
    }
  }
}

// GOOD
if (!user) return
if (!user.isActive) return
if (!user.hasPermission) return
doThing()
```

### No Nested Ternaries

```typescript
// BAD
const result = isA ? (isB ? valueAB : valueA) : valueDefault

// GOOD
if (isA && isB) return valueAB
if (isA) return valueA
return valueDefault
```

### No Boolean Positional Parameters

```typescript
// BAD: what does `true` mean?
await processItem(itemId, true, false)

// GOOD: self-documenting
await processItem(itemId, { skipNotification: true, forceReassign: false })
```

Functions with 3+ parameters accept an options object.

### Naming Precision

Names like `data`, `result`, `info`, `item`, `value`, `handler`, `process` force the reader to read the implementation. Names must encode domain meaning and match behavior exactly.

```typescript
// BAD
function handleData(data: any) { ... }

// GOOD
function assignTicketToAgent(ticketId: string, agentId: string) { ... }
```

### Extract Constants

```typescript
// BAD: magic strings scattered across files
if (status === 'pending' || status === 'waiting') { ... }

// GOOD: defined once
const INACTIVE_STATUSES = new Set(['pending', 'waiting'])
if (INACTIVE_STATUSES.has(status)) { ... }
```

## File Discipline

- **Components/Modules:** Max ~300 lines
- **Services:** Max ~400 lines
- **One primary responsibility per file**
- If a function exceeds ~30 lines or has >2 levels of nesting, it's doing too much — extract or invert

## Comment Discipline

- No narration (`// Import X`, `// Define Y`, `// Return result`)
- No JSDoc blocks except on genuinely non-obvious public APIs
- No "what changed" comments — diffs explain change history
- Comments allowed ONLY when explaining a non-obvious constraint, trade-off, or invariant

## No Phantom Abstractions

Don't create abstractions for a single consumer. Wait until the second or third consumer arrives.

```typescript
// BAD: base class with one subclass
abstract class BaseProcessor { /* 50 lines */ }
class OnlyProcessor extends BaseProcessor { /* the only subclass */ }

// GOOD: just the concrete implementation
class ItemProcessor { /* all logic here */ }
```

## Reuse Before You Build

Before writing anything new, search the codebase. Duplicated logic is the fastest path to inconsistency.

## Dead Code

Remove immediately:
- Registry/factory patterns where nothing reads from the registry
- Placeholder implementations that are never called
- Duplicate type aliases
- Unused imports
