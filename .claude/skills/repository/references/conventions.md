# Repository Conventions

## Overview
Repositories handle all direct database access in the API. They provide reusable, focused database operations that use-cases can compose together. Repositories sit between use-cases and the database, encapsulating complex queries and database logic.

## Directory Structure
```
repositories/
├── index.ts                      # Barrel file exporting all repositories
├── [model].ts                    # Model-specific repository file
└── [model].test.ts               # Test files (when needed)
```

## File Naming Convention
- **Pattern**: `[model].ts` (e.g., `websites.ts`, `users.ts`)
- **Test Pattern**: `[model].test.ts`
- **Export Pattern**: Use barrel file (`index.ts`) to export repositories as namespaced objects
- **Example barrel file**:
  ```typescript
  export * as websitesRepository from "./websites";
  export * as usersRepository from "./users";
  ```

## When to Create a Repository

Create a repository whenever database access is required. Each database operation should be a function within the model's repository file:

- **All database queries**: SELECT operations with joins, aggregations, or filtering
- **All database mutations**: INSERT, UPDATE, DELETE operations
- **Transaction operations**: Multi-step database operations requiring atomicity
- **Data transformation**: Operations that normalize or transform database data
- **Specialized operations**: Upserts, bulk operations, or complex updates

Repositories provide:
- **Separation of concerns**: Database logic separate from business logic
- **Reusability**: Same query can be used by multiple use-cases
- **Testability**: Database operations can be mocked in use-case tests
- **Type safety**: Strong typing using Drizzle's type inference
- **Transaction composability**: Can be called within or outside transactions

## Repository Pattern

### 1. Function Signature
```typescript
/**
 * Clear JSDoc describing what the operation does
 * Include details about transaction behavior, side effects, etc.
 */
export async function actionModel(
    param1: string,
    param2: Date,
    tx?: typeof db  // Optional transaction parameter for composability
): Promise<ReturnType> {
    // Implementation
}
```

### 2. Required Imports
```typescript
// Drizzle ORM operators
import { and, eq, gte, inArray, or, desc } from 'drizzle-orm'

// Schema imports
import {
    model,           // Database table
    relatedModel     // Related tables if needed
} from '@bob/schema/db'

// Database connection
import { db } from '../index'

// Utilities (if needed)
import { formatDateOnly, getId } from '@bob/utils'
```

### 3. Type Definitions
Define database types at the top of the file using Drizzle's type inference:

```typescript
// Database types (what Drizzle returns - dates are strings in DB)
type DbModel = typeof model.$inferSelect
type DbInsertModel = typeof model.$inferInsert

// Custom return types for specialized queries
type NormalizedResult = {
    field1: string
    field2: Date
    // ...
}
```

### 4. Implementation Structure

#### Simple Query Repository
```typescript
/**
 * Get a specific record by ID
 */
export async function getModelById(
    modelId: string
): Promise<DbModel | undefined> {
    const [result] = await db
        .select()
        .from(model)
        .where(eq(model.id, modelId))
        .limit(1)

    return result
}
```

#### Complex Query with Joins
```typescript
/**
 * Get records with related data
 */
export async function getModelsWithRelations(
    employeeId: string,
    venueId: string
): Promise<NormalizedResult[]> {
    const results = await db
        .select({
            // Select specific fields
            id: model.id,
            name: model.name,
            relatedName: relatedModel.name,
        })
        .from(model)
        .innerJoin(relatedModel, eq(relatedModel.id, model.relatedId))
        .where(
            and(
                eq(model.employeeId, employeeId),
                eq(model.venueId, venueId)
            )
        )
        .orderBy(desc(model.createdAt))

    // Transform if needed
    return results.map(r => ({
        field1: r.id,
        field2: new Date(r.date),
        // ...
    }))
}
```

#### Transaction-Based Repository
```typescript
/**
 * Perform operation with transaction support
 * Can be called from a use-case with an existing transaction
 */
export async function updateModelAtomically(
    modelId: string,
    effectiveFrom: Date,
    tx?: typeof db  // Accept optional transaction
): Promise<DbModel> {
    const executor = tx ?? db  // Use provided tx or default db

    return executor.transaction(async (txn) => {
        // Step 1: Get current state
        const [existing] = await txn
            .select()
            .from(model)
            .where(eq(model.id, modelId))
            .limit(1)

        if (!existing) {
            throw new Error('Model not found')
        }

        // Step 2: Update related records
        await txn
            .update(relatedModel)
            .set({ effectiveTo: formatDateOnly(effectiveFrom) })
            .where(eq(relatedModel.modelId, modelId))

        // Step 3: Create new record
        const [newRecord] = await txn
            .insert(model)
            .values({
                id: getId(),
                modelId,
                effectiveFrom: formatDateOnly(effectiveFrom),
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning()

        return newRecord
    })
}
```

## Key Patterns

### 1. Type Safety
- **Always use Drizzle's type inference** for database types
- **Define return types explicitly** for complex queries
- **Use `typeof db.$inferSelect`** for database row types
- **Use `typeof db.$inferInsert`** for insert types

### 2. Transaction Support
- **Accept optional `tx` parameter** for composability:
  ```typescript
  export async function myRepo(
      param: string,
      tx?: typeof db
  ): Promise<Result> {
      const executor = tx ?? db
      // Use executor instead of db
  }
  ```
- **Always use transactions** for multi-step operations
- **Throw errors** (don't return UseCaseResult) - let use-cases handle errors

### 3. Error Handling
- **Throw errors for exceptional conditions**:
  ```typescript
  if (!result) {
      throw new Error('Descriptive error message')
  }
  ```
- **Let use-cases catch and convert** to UseCaseResult
- **Be specific in error messages** for debugging

### 4. Query Optimization
- **Use `.limit(1)` for single-record queries**
- **Select only needed fields** for large tables
- **Use proper indexes** (defined in schema)
- **Order results consistently** when ordering matters

### 5. Data Transformation
- **Normalize data** when combining multiple tables:
  ```typescript
  return records.map(r => ({
      normalizedField: r.rawField,
      computedField: calculateValue(r.rawField),
  }))
  ```
- **Filter invalid data** early in the pipeline
- **Document transformations** in JSDoc

## Testing Repositories

### Test File Structure
Tests use Bun's test framework with mocks for database operations:

```typescript
import { describe, expect, it, mock } from 'bun:test'
import { getId } from '@bob/utils'

// Mock the db module before importing the repository
const mockTransaction = mock()
const mockSelect = mock()
const mockFrom = mock()
const mockWhere = mock()
// ... other query builder mocks

// Create mock tx object
let mockTx: any

mock.module('~/db', () => ({
    db: {
        transaction: mockTransaction,
    },
}))

// Import repository AFTER mocking
import { myRepository } from './my-repository.repository'

describe('myRepository', () => {
    describe('basic functionality', () => {
        it('should perform basic operation', async () => {
            // Setup mocks
            setupTransactionMock(/* ... */)

            // Execute
            const result = await myRepository('param')

            // Assert
            expect(result.field).toBe('expected')
        })
    })

    describe('edge cases', () => {
        it('should handle not found case', async () => {
            setupTransactionMock(/* return empty results */)

            expect(myRepository('id')).rejects.toThrow('Not found')
        })
    })
})
```

### Mock Helper Patterns
Create helper functions to setup complex mocks:

```typescript
function setupTransactionMock(
    recordExists: boolean,
    returnData: any[]
) {
    // Reset all mocks
    mockTransaction.mockReset()
    mockSelect.mockReset()
    // ...

    // Create mock tx object
    mockTx = {
        select: mockSelect,
        update: mockUpdate,
        delete: mockDelete,
        insert: mockInsert,
    }

    // Mock the transaction callback
    mockTransaction.mockImplementation(async (callback: any) => {
        return callback(mockTx)
    })

    // Setup query chains
    const selectChain = {
        from: mock().mockReturnValue({
            where: mock().mockReturnValue(
                recordExists ? returnData : []
            ),
        }),
    }
    mockSelect.mockReturnValue(selectChain)
}

// Helper to capture operations
function captureUpdateCalls() {
    const calls: any[] = []

    mockUpdate.mockImplementation((_table: any) => ({
        set: mock().mockImplementation((data: any) => ({
            where: mock().mockImplementation(() => {
                calls.push(data)
            }),
        })),
    }))

    return calls
}
```

### Test Coverage
Test repositories when they contain:
- **Complex business logic** (consolidation, state management)
- **Transaction behavior** that needs verification
- **Data transformations** with potential edge cases
- **Multiple code paths** (conditional logic, branching)
- **Complex date/time calculations**
- **Cascading operations** with side effects

For simple repositories (basic CRUD), testing may be optional, but test coverage is always valuable.

## Common Patterns

### Validation Repository
Check if a record exists and meets conditions:

```typescript
export async function validateModel(modelId: string): Promise<{
    exists: boolean
    isValid: boolean
    data?: ModelData
}> {
    const [result] = await db
        .select({
            id: model.id,
            status: model.status,
        })
        .from(model)
        .where(eq(model.id, modelId))
        .limit(1)

    if (!result) {
        return { exists: false, isValid: false }
    }

    const isValid = result.status === 'active'
    return {
        exists: true,
        isValid,
        data: result,
    }
}
```

### Historical Data Repository
Query time-based records:

```typescript
export async function getRecordAtDate(
    employeeId: string,
    date: Date
): Promise<DbRecord | undefined> {
    const dateString = formatDateOnly(date)

    const [result] = await db
        .select()
        .from(model)
        .where(
            and(
                eq(model.employeeId, employeeId),
                lte(model.effectiveFrom, dateString),
                or(
                    isNull(model.effectiveTo),
                    gte(model.effectiveTo, dateString)
                )
            )
        )
        .limit(1)

    return result
}
```

### Bulk Operations Repository
Handle multiple records efficiently:

```typescript
export async function bulkUpdateModels(
    modelIds: string[],
    updates: Partial<DbModel>
): Promise<void> {
    if (modelIds.length === 0) return

    await db
        .update(model)
        .set({
            ...updates,
            updatedAt: new Date(),
        })
        .where(inArray(model.id, modelIds))
}
```

### Delete with Cascading Logic
Handle related records during deletion:

```typescript
export async function deleteModelWithCleanup(
    modelId: string
): Promise<DbModel | undefined> {
    return await db.transaction(async (tx) => {
        // Get record before deletion
        const [record] = await tx
            .select()
            .from(model)
            .where(eq(model.id, modelId))
            .limit(1)

        if (!record) {
            return undefined
        }

        // Delete the record
        await tx.delete(model).where(eq(model.id, modelId))

        // Cleanup related data
        await cleanupRelatedRecords(tx, record)

        return record
    })
}
```

## Don'ts

- Don't return `UseCaseResult` - repositories throw errors
- Don't use `console.log` - use `logger` if needed
- Don't perform authorization - that's for use-cases/middleware
- Don't validate business rules - that's for use-cases
- Don't mix database operations with external API calls
- Don't duplicate query logic - create reusable repository functions
- Don't forget to handle undefined results from single-record queries
- Don't put database queries directly in use-cases - extract to repositories

## Integration with Use-Cases

Use-cases consume repositories and handle errors:

```typescript
// In use-case file
import { modelRepository } from '~/db/repositories'

export async function getModel(modelId: string): Promise<UseCaseResult<Model>> {
    try {
        const model = await modelRepository.findById(modelId)

        if (!model) {
            return failure('NOT_FOUND', 'Model not found')
        }

        return success(model)
    } catch (error) {
        logger.error('Failed to get model')
        logger.error(error)
        return failure('UNKNOWN', 'Failed to retrieve model')
    }
}
```

## Best Practices

1. **Keep functions focused**: One function = one database operation
2. **Group by model**: All operations for a model go in one repository file
3. **Make repositories composable**: Accept optional transaction parameter when needed
4. **Document thoroughly**: Complex queries need clear JSDoc
5. **Type everything**: Use Drizzle's type inference (`$inferSelect`, `$inferInsert`)
6. **Test complex logic**: Write tests for non-trivial repositories
7. **Optimize queries**: Select only needed fields, use proper joins
8. **Handle nulls explicitly**: Check for undefined results
9. **Use utilities**: Leverage `formatDateOnly`, `getId`, etc.
10. **Name descriptively**: Function name should describe the operation (e.g., `findById`, `findBySlug`, `create`)
11. **Return raw data**: Let use-cases handle transformation when possible
12. **Export types**: Export `Model` and `NewModel` types from each repository file
