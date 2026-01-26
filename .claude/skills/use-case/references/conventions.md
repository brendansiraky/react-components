# Use-Case Conventions

## Overview
Use-cases implement all business logic in the API. They are the core of our clean architecture pattern, sitting between the routes (thin presentation layer) and the database layer.

## Directory Structure
```
use-cases/
├── [feature]/                      # Feature-specific directory
│   ├── [action]-[model].use-case.ts   # Individual use-case files
│   └── index.ts                    # Re-exports all use-cases from the directory
```

**Note**: Avoid creating `types.ts` files for re-exports or aliases. Use `@bob/schema` types directly instead.

## File Naming Convention
- **Pattern**: `[action]-[model].use-case.ts`
- **Examples**:
  - `create-tag.use-case.ts`
  - `update-project.use-case.ts`
  - `delete-domain.use-case.ts`
  - `get-user-tags.use-case.ts`
  - `authorize-user-project-access.use-case.ts`

## Use-Case Pattern

### 1. Function Signature
```typescript
export async function actionModel(
    memberId: string,          // Always first if needed for ownership
    resourceId?: string,        // Resource ID if operating on existing resource
    data?: InputType           // Data for create/update operations
): Promise<UseCaseResult<OutputType>> {
    // Implementation
}
```

### 2. Required Imports
```typescript
// Schema imports - types and validation
import {
    type CreateModel,      // Input type
    createModelSchema,     // Input validation schema
    type GetModel,         // Output type
    getModelSchema,        // Output validation schema
    model                  // Database table
} from '@bob/schema'

// Utilities
import { getId, logger } from '@bob/utils'

// Database and result handling
import { db } from '~/db'
import { isDuplicateError } from '~/lib/is-duplicate-error'
import { failure, success, type UseCaseResult } from '~/lib/use-case-result'

// Note: Validation schemas come from two sources:
// 1. @bob/schema - for standard CRUD schemas (create, update, get, list filters)
// 2. ~/validation/ - for API-specific validators (route params, complex validation)
// See respective CONVENTIONS.md files for details
```

### 3. Implementation Structure
```typescript
export async function createModel(
    memberId: string,
    data: CreateModel
): Promise<UseCaseResult<GetModel>> {
    // Step 1: Validate input with strict() when spreading data
    const validatedData = createModelSchema.strict().safeParse(data)

    if (!validatedData.success) {
        return failure('INVALID_REQUEST', 'Invalid model data')
    }

    try {
        // Step 2: Perform database operation
        const now = new Date()

        const [newModel] = await db
            .insert(model)
            .values({
                id: getId(),
                memberId,
                ...validatedData.data,  // Spread validated data
                createdAt: now,
                updatedAt: now,
            })
            .returning()


        // Step 4: Call other use-cases if needed (optional)
        // await relatedUseCase(...)

        return success(newModel)
    } catch (error) {
        // Step 5: Handle specific database errors if needed
        if (isDuplicateError(error)) {
            return failure('DUPLICATE_KEY', 'Model already exists')
        }

        // Step 6: Log errors properly (two separate statements)
        logger.error('Failed to create model')
        logger.error(error)

        return failure('UNKNOWN', 'Failed to create model')
    }
}
```

## Key Patterns

### 1. Input Validation
- **Always validate input** using `.safeParse()`
- **Use `.strict()`** when spreading data into database operations to ensure no extra fields
- **Use regular `.safeParse()`** for update operations where partial data is expected
- **Validation schemas come from**:
  - `@bob/schema` for model CRUD operations (createModelSchema, updateModelSchema, etc.)
  - `~/validation/` for API-specific validation (see `/apps/api/src/validation/CONVENTIONS.md`)

### 2. Database Operations
- **Always use `.returning()`** for INSERT/UPDATE/DELETE to get the result
- **Check result existence** after UPDATE/DELETE operations
- **Use transactions** for multi-step operations (wrap in `db.transaction()`)
- **Let database handle constraints** - never pre-check with SELECT queries
- **For upserts**: Use `.onConflictDoUpdate()` instead of SELECT then INSERT/UPDATE
- **Handle duplicates in catch block** using `isDuplicateError()` helper
- **For deletes**: Check if result is undefined to detect NOT_FOUND

### 3. Error Handling
- **Never throw errors** - always return `UseCaseResult`
- **Use proper error codes**:
  - `INVALID_REQUEST` - Invalid input data
  - `NOT_FOUND` - Resource doesn't exist
  - `DUPLICATE_KEY` - Unique constraint violation
  - `AUTH_ERROR` - Authentication/authorization failure
  - `FORBIDDEN` - Forbidden
  - `UNKNOWN` - Unexpected errors
- **Handle duplicate errors** using the `isDuplicateError()` helper:
  ```typescript
  import { isDuplicateError } from '~/lib/is-duplicate-error'

  // In catch block
  if (isDuplicateError(error)) {
      return failure('DUPLICATE_KEY', 'Resource already exists')
  }
  ```
- **Log errors with two statements**:
  ```typescript
  logger.error('Descriptive message about what failed')
  logger.error(error)
  ```


### 4. Authorization
- **Use dedicated authorization use-cases** for access control - don't embed auth logic in business use-cases
- **Call authorization use-cases first** before performing operations:
  ```typescript
  // Example: Check project access before operating on project resources
  const accessResult = await authorizeUserProjectAccess(memberId, 'admin', projectId)

  if (!accessResult.success) {
      return failure('AUTH_ERROR', 'You are not authorized to perform this action')
  }
  ```
- **Return the failure directly** from auth use-cases using consistent error codes and messages
- **Only include ownership checks in WHERE clauses when explicitly required for the business logic** (not for authorization)

### 5. Date Handling
- **Create timestamps once** and reuse:
  ```typescript
  const now = new Date()
  // Use 'now' for both createdAt and updatedAt
  ```

### 6. Complex Queries
- **Use proper joins** for related data
- **Use `.groupBy()` when using aggregate functions**
- **Order results consistently** (usually by `createdAt DESC`)

## Common Patterns

### List/Get Multiple Resources
```typescript
export async function getMemberModels(
    memberId: string,
    filters: ListModelsFilters = {}
): Promise<UseCaseResult<Model[]>> {
    try {
        const validatedFilters = listModelsFiltersSchema.safeParse(filters)

        if (!validatedFilters.success) {
            return failure('INVALID_REQUEST', 'Invalid filters')
        }

        // Authorization check if needed for this resource type
        // const accessResult = await authorizeUserProjectAccess(memberId, 'read', projectId)
        // if (!accessResult.success) {
        //     return failure('AUTH_ERROR', 'You are not authorized to access this resource')
        // }

        const conditions: (typeof model.id)[] = []

        // Add filter conditions
        if (filters.someFilter) {
            conditions.push(eq(model.field, filters.someFilter))
        }

        const models = await db
            .select()
            .from(model)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(model.createdAt))

        return success(models)
    } catch (error) {
        logger.error('Failed to get models')
        logger.error(error)
        return failure('UNKNOWN', 'Failed to retrieve models')
    }
}
```

### Update Resource
```typescript
export async function updateModel(
    modelId: string,
    memberId: string,
    data: UpdateModel
): Promise<UseCaseResult<GetModel>> {
    const validatedData = updateModelSchema.safeParse(data)

    if (!validatedData.success) {
        return failure('INVALID_REQUEST', 'Invalid model data')
    }

    try {
        const now = new Date()

        const [updatedModel] = await db
            .update(model)
            .set({
                ...validatedData.data,
                updatedAt: now,
            })
            .where(eq(model.id, modelId))
            .returning()

        if (!updatedModel) {
            return failure('NOT_FOUND', 'Model not found')
        }

        return success(updatedModel)
    } catch (error) {
        if (isDuplicateError(error)) {
            return failure('DUPLICATE_KEY', 'Model with this data already exists')
        }

        logger.error('Failed to update model')
        logger.error(error)
        return failure('UNKNOWN', 'Failed to update model')
    }
}
```

### Delete Resource
```typescript
export async function deleteModel(
    modelId: string,
    memberId: string
): Promise<UseCaseResult<GetModel>> {
    try {
        const [result] = await db
            .delete(model)
            .where(eq(model.id, modelId))
            .returning()

        if (result === undefined) {
            return failure('NOT_FOUND', 'Model not found')
        }

        return success(result)
    } catch (error) {
        logger.error('Failed to delete model')
        logger.error(error)
        return failure('UNKNOWN', 'Failed to delete model')
    }
}
```

### Upsert Operations
For operations that should create or update based on existence, use `.onConflictDoUpdate()`:
```typescript
export async function upsertModel(
    memberId: string,
    data: CreateModel
): Promise<UseCaseResult<GetModel>> {
    const validatedData = createModelSchema.strict().safeParse(data)

    if (!validatedData.success) {
        return failure('INVALID_REQUEST', 'Invalid model data')
    }

    try {
        const now = new Date()

        const [result] = await db
            .insert(model)
            .values({
                id: getId(),
                memberId,
                ...validatedData.data,
                createdAt: now,
                updatedAt: now,
            })
            .onConflictDoUpdate({
                target: [model.memberId, model.uniqueField], // Specify conflict columns
                set: {
                    ...validatedData.data,
                    updatedAt: now,
                },
            })
            .returning()

        return success(result)
    } catch (error) {
        logger.error('Failed to upsert model')
        logger.error(error)
        return failure('UNKNOWN', 'Failed to upsert model')
    }
}
```

## Type Definitions

### Schema-Derived Types
**Prefer using types from `@bob/schema` directly** instead of creating local type abstractions.

For standard CRUD operations, use the canonical types:
```typescript
import type { ProjectWithTags, CreateProject, UpdateProject } from '@bob/schema'
```

### Local Types (when absolutely necessary)
Only create local types when:
- The type is truly specific to internal API processing
- It combines data in ways not covered by schema types
- The abstraction significantly reduces code duplication across multiple use-cases

**Avoid creating re-export layers or backward compatibility aliases** - import from `@bob/schema` directly.

## Re-exports (index.ts)
Always create an index.ts file to re-export all use-cases:
```typescript
export { createTag } from './create-tag.use-case'
export { deleteTag } from './delete-tag.use-case'
export { getTag } from './get-tag.use-case'
export { getMemberTags } from './get-user-tags.use-case'
export { updateTag } from './update-tag.use-case'
```

## Testing
- Test files should be named `[use-case-name].test.ts`
- Mock database calls and external services
- Test all error cases and edge conditions
- Verify proper error codes are returned

## Don'ts
- Don't use `console.log` - always use `@bob/utils` logger
- Don't throw errors - always return `UseCaseResult`
- Don't perform business logic in routes - use use-cases
- Don't skip validation - always validate input
- Don't embed authorization logic in business use-cases - use dedicated auth use-cases
- Don't pre-check for existence with SELECT queries - let database handle constraints
- Don't use SELECT then INSERT/UPDATE patterns - use `.onConflictDoUpdate()` for upserts
- Don't manually check for duplicates - use `isDuplicateError()` in catch blocks
- Don't combine error logging - use two separate statements
- Don't re-export in barrel files. Just import directly
