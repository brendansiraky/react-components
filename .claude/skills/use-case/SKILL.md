---
name: use-case
description: This skill should be used when the user asks to "create a use-case", "implement business logic", "add CRUD operations", "write a create function", "write an update function", "write a delete function", "handle database errors", "return UseCaseResult", "use safeParse validation", "add authorization check", or needs guidance on use-case patterns and error handling in apps/api/src/use-cases/.
---

# Use-Case

This skill provides conventions for implementing backend use-cases in the API layer. Use-cases contain business logic and sit between routes and repositories in the clean architecture pattern.

## Quick Reference

### File Structure
- Location: `apps/api/src/use-cases/[feature]/`
- Naming: `[action]-[model].use-case.ts`
- Always include `index.ts` for re-exports

### Core Imports
```typescript
import { type CreateModel, createModelSchema } from '@bob/schema'
import { getId, logger } from '@bob/utils'
import { db } from '~/db'
import { isDuplicateError } from '~/lib/is-duplicate-error'
import { failure, success, type UseCaseResult } from '~/lib/use-case-result'
```

### Function Pattern
```typescript
export async function actionModel(
    memberId: string,
    data: CreateModel
): Promise<UseCaseResult<GetModel>> {
    const validatedData = createModelSchema.strict().safeParse(data)
    if (!validatedData.success) {
        return failure('INVALID_REQUEST', 'Invalid data')
    }
    // ... implementation
    return success(result)
}
```

### Error Codes
- `INVALID_REQUEST` - Invalid input
- `NOT_FOUND` - Resource missing
- `DUPLICATE_KEY` - Constraint violation
- `AUTH_ERROR` - Authorization failure
- `FORBIDDEN` - Access denied
- `UNKNOWN` - Unexpected errors

### Key Rules
1. Always validate input with `.safeParse()`
2. Use `.strict()` when spreading data
3. Never throw - return `UseCaseResult`
4. Log errors in two statements
5. Use `isDuplicateError()` for duplicates
6. Use `.onConflictDoUpdate()` for upserts
7. Always use `.returning()` for mutations

## Additional Resources

### Reference Files

For detailed patterns, code examples, and complete guidelines, consult:
- **`references/conventions.md`** - Full use-case conventions
