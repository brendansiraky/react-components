---
name: repository
description: This skill should be used when the user asks to "create a repository", "add a repository function", "write database queries", "get data from database", "insert into database", "update database records", "delete from database", "add Drizzle query", "find by ID", "find by slug", "check if exists", "bulk update records", "query with joins", "add transaction support", or needs guidance on data access patterns in apps/api/src/db/repositories/.
---

# Repository

This skill provides conventions for creating and maintaining database repository files in the `apps/api/src/db/repositories/` directory.

## Quick Reference

### File Structure
- **Location**: `apps/api/src/db/repositories/`
- **Pattern**: One file per model (e.g., `websites.ts`, `users.ts`)
- **Export**: Group related functions in a single file, export via barrel file

### Core Principles
1. **Throw errors, don't return UseCaseResult** - Let use-cases handle error conversion
2. **Use Drizzle type inference** - `typeof model.$inferSelect` for types
3. **Accept optional `tx` parameter** - Enable transaction composability when needed
4. **Keep functions focused** - Each function performs one database operation

### Basic Structure
```typescript
import { eq } from 'drizzle-orm'
import { model } from '@bob/schema/db'
import { db } from '../index'

export type Model = typeof model.$inferSelect
export type NewModel = typeof model.$inferInsert

export async function findById(id: string): Promise<Model | undefined> {
    const result = await db.select().from(model).where(eq(model.id, id))
    return result[0]
}

export async function create(data: NewModel): Promise<Model> {
    const [record] = await db.insert(model).values(data).returning()
    if (!record) {
        throw new Error('Failed to create record')
    }
    return record
}
```

### Key Don'ts
- Don't return `UseCaseResult` from repositories - throw errors instead
- Don't perform authorization checks - use-cases/middleware handle this
- Don't use `console.log` - use `logger` if needed
- Don't put database queries directly in use-cases - extract to repositories

## Additional Resources

### Reference Files

For complete patterns, examples, and detailed guidelines, consult:
- **`references/conventions.md`** - Full repository conventions

The reference document includes:
- Complex query patterns with joins
- Transaction-based repository examples
- Testing patterns with Bun mocks
- Common repository patterns (validation, historical data, bulk operations)
- Integration examples with use-cases
