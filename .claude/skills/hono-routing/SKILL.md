---
name: hono-routing
description: This skill should be used when the user asks to "create an API endpoint", "add a route", "create a route handler", "add validation to a route", "set up route middleware", "create REST endpoint", "add CRUD routes", "create param schema", "validate request params", "add API validation", or needs guidance on Hono router setup, request validation, or response handling in apps/api/src/routes/.
---

# Hono Routing

Conventions for creating API routes in the Hono backend (`apps/api/src/routes`). Routes are thin presentation layers that validate input, delegate to use-cases, and return HTTP responses.

## Quick Reference

| Aspect | Convention |
|--------|------------|
| File naming | `[feature].route.ts` (kebab-case, singular) |
| Handler naming | `[action][Resource]Handler` (e.g., `listTagsHandler`) |
| Router type | `new Hono<AuthContext>()` |
| Validation | `createValidator('json'|'query'|'param', schema)` |
| Response | `mapUseCaseResultToHttpStatus(result, c)` |

## File Structure

```
routes/
├── [feature].route.ts    # Route definitions (kebab-case, singular)
├── auth.route.ts         # Authentication routes
└── index.ts              # Router composition
```

## Router Setup

```typescript
import { Hono } from 'hono'
import { type AuthContext, bindAuthContext } from '~/middleware/bind-auth-context.middleware'

export const featureRouter = new Hono<AuthContext>()
featureRouter.use(bindAuthContext())
```

## Critical Rule: Named Handler Functions

Always use named functions, never anonymous arrow functions:

```typescript
// CORRECT
featureRouter.get('/', async function listItemsHandler(c) { ... })

// WRONG - Never use anonymous arrow functions
featureRouter.get('/', async (c) => { ... })
```

## Standard CRUD Pattern

```typescript
import { Hono } from 'hono'
import { createModelSchema, updateModelSchema, listModelsFiltersSchema } from '@bob/schema'
import { createValidator } from '~/lib/create-validator'
import { mapUseCaseResultToHttpStatus } from '~/lib/use-case-result'
import { type AuthContext, bindAuthContext } from '~/middleware/bind-auth-context.middleware'
import { createModel, getModel, listModels, updateModel, deleteModel } from '~/use-cases/models'
import { modelIdParamSchema } from '~/validation/model.validation'

export const modelRouter = new Hono<AuthContext>()
modelRouter.use(bindAuthContext())

// List
modelRouter.get('/', createValidator('query', listModelsFiltersSchema),
    async function listModelsHandler(c) {
        const member = c.get('member')
        const filters = c.req.valid('query')
        return mapUseCaseResultToHttpStatus(await listModels(member.id, filters), c)
    })

// Get
modelRouter.get('/:modelId', createValidator('param', modelIdParamSchema),
    async function getModelHandler(c) {
        const member = c.get('member')
        const { modelId } = c.req.valid('param')
        return mapUseCaseResultToHttpStatus(await getModel(modelId, member.id), c)
    })

// Create
modelRouter.post('/', createValidator('json', createModelSchema),
    async function createModelHandler(c) {
        const member = c.get('member')
        const data = c.req.valid('json')
        return mapUseCaseResultToHttpStatus(await createModel(member.id, data), c)
    })

// Update
modelRouter.put('/:modelId', createValidator('param', modelIdParamSchema),
    createValidator('json', updateModelSchema),
    async function updateModelHandler(c) {
        const member = c.get('member')
        const { modelId } = c.req.valid('param')
        const data = c.req.valid('json')
        return mapUseCaseResultToHttpStatus(await updateModel(modelId, member.id, data), c)
    })

// Delete
modelRouter.delete('/:modelId', createValidator('param', modelIdParamSchema),
    async function deleteModelHandler(c) {
        const member = c.get('member')
        const { modelId } = c.req.valid('param')
        return mapUseCaseResultToHttpStatus(await deleteModel(modelId, member.id), c)
    })
```

## Validation

### Using createValidator

```typescript
createValidator('json', schema)   // Request body
createValidator('query', schema)  // Query parameters
createValidator('param', schema)  // Route parameters
```

### Schema Sources

| Type | Source | Example |
|------|--------|---------|
| Body schemas | `@bob/schema` | `createTagSchema`, `updateTagSchema` |
| Query schemas | `@bob/schema` | `listTagsFiltersSchema` |
| Param schemas | `~/validation/[model].validation.ts` | `tagIdParamSchema` |

### Creating Param Validators

Create in `apps/api/src/validation/[model].validation.ts`:

```typescript
import { z } from 'zod'
import { selectTagSchema } from '@bob/schema'

// Reuse field types from existing schemas - don't redefine
export const tagIdParamSchema = z.object({
    tagId: selectTagSchema.shape.id,  // Reuses the actual ID type
})
```

## Response Handling

Always use `mapUseCaseResultToHttpStatus` to convert use-case results:

```typescript
const result = await someUseCase(...)
return mapUseCaseResultToHttpStatus(result, c)
```

Status code mappings: 200 (Success), 400 (INVALID_REQUEST), 401 (AUTH_ERROR), 403 (FORBIDDEN), 404 (NOT_FOUND), 409 (DUPLICATE_KEY), 500 (UNKNOWN)

## Route Registration

Register routes in `apps/api/src/hono.ts`:

```typescript
import { tagRouter } from './routes/tag.route'
app.route('/api/tags', tagRouter)
```

## Key Principles

1. **Routes are thin** - Delegate all business logic to use-cases
2. **Never access database directly** - Always go through use-cases
3. **Never catch errors** - Let use-cases return error results
4. **Always validate all inputs** - Use createValidator for every input
5. **Get authenticated member from context** - `c.get('member')`

## Additional Resources

### Reference Files

For detailed patterns and best practices, consult:
- **`references/conventions.md`** - Full routing conventions, RESTful patterns, middleware usage, and validation strategies
