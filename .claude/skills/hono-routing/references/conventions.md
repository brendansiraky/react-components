# Hono Routing Conventions

## Overview

Routes are the thin presentation layer of the API. They handle HTTP requests, validate input, delegate to use-cases for business logic, and return appropriate HTTP responses. Routes should contain minimal logic.

## File Structure

```
routes/
├── [feature].route.ts    # Route definitions for a feature
├── auth.route.ts         # Authentication routes (special case)
└── index.ts              # Main router composition (if needed)
```

**File naming pattern**: `[feature].route.ts` (kebab-case, singular)

Examples: `tag.route.ts`, `project.route.ts`, `billing.route.ts`, `project-link.route.ts`

## Route Handler Pattern

### Router Setup

```typescript
import { Hono } from 'hono'
import { type AuthContext, bindAuthContext } from '~/middleware/bind-auth-context.middleware'

// Create router with context type
export const featureRouter = new Hono<AuthContext>()

// Apply authentication middleware to all routes
featureRouter.use(bindAuthContext())
```

### Required Imports Structure

```typescript
import { Hono } from 'hono'

// Import schemas from @bob/schema package
import {
    createModelSchema,
    updateModelSchema,
    listModelsFiltersSchema
} from '@bob/schema'

// Import utilities
import { createValidator } from '~/lib/create-validator'
import { mapUseCaseResultToHttpStatus } from '~/lib/use-case-result'

// Import middleware
import { type AuthContext, bindAuthContext } from '~/middleware/bind-auth-context.middleware'

// Import use-cases
import {
    createModel,
    deleteModel,
    getModel,
    listModels,
    updateModel
} from '~/use-cases/models'

// Import parameter validators
import { modelIdParamSchema } from '~/validation/model.validation'
```

### Handler Function Naming

**Pattern**: `[action][Resource]Handler`

```typescript
async function listTagsHandler(c) { }
async function createTagHandler(c) { }
async function getTagHandler(c) { }
async function updateTagHandler(c) { }
async function deleteTagHandler(c) { }
async function bulkDeleteTagsHandler(c) { }
async function getGroupedTagsHandler(c) { }
```

### Route Handler Implementation

**CRITICAL: Always use descriptive named functions for route handlers:**

```typescript
// CORRECT - Named function
tagRouter.get('/', async function listTagsHandler(c) {
    // Implementation
})

// WRONG - Anonymous arrow function
tagRouter.get('/', async (c) => {
    // Implementation
})
```

### CRUD Handler Examples

#### GET - List Resources

```typescript
featureRouter.get(
    '/',
    createValidator('query', listModelsFiltersSchema),
    async function listModelsHandler(c) {
        const member = c.get('member')
        const filters = c.req.valid('query')

        const result = await listModels(member.id, filters)

        return mapUseCaseResultToHttpStatus(result, c)
    }
)
```

#### GET - Single Resource

```typescript
featureRouter.get(
    '/:modelId',
    createValidator('param', modelIdParamSchema),
    async function getModelHandler(c) {
        const member = c.get('member')
        const { modelId } = c.req.valid('param')

        const result = await getModel(modelId, member.id)

        return mapUseCaseResultToHttpStatus(result, c)
    }
)
```

#### POST - Create Resource

```typescript
featureRouter.post(
    '/',
    createValidator('json', createModelSchema),
    async function createModelHandler(c) {
        const member = c.get('member')
        const data = c.req.valid('json')

        const result = await createModel(member.id, data)

        return mapUseCaseResultToHttpStatus(result, c)
    }
)
```

#### PUT - Update Resource

```typescript
featureRouter.put(
    '/:modelId',
    createValidator('param', modelIdParamSchema),
    createValidator('json', updateModelSchema),
    async function updateModelHandler(c) {
        const member = c.get('member')
        const { modelId } = c.req.valid('param')
        const data = c.req.valid('json')

        const result = await updateModel(modelId, member.id, data)

        return mapUseCaseResultToHttpStatus(result, c)
    }
)
```

#### DELETE - Delete Resource

```typescript
featureRouter.delete(
    '/:modelId',
    createValidator('param', modelIdParamSchema),
    async function deleteModelHandler(c) {
        const member = c.get('member')
        const { modelId } = c.req.valid('param')

        const result = await deleteModel(modelId, member.id)

        return mapUseCaseResultToHttpStatus(result, c)
    }
)
```

## Validation Patterns

### Using createValidator

The `createValidator` helper provides consistent error formatting:

```typescript
// For request body
createValidator('json', schemaName)

// For query parameters
createValidator('query', schemaName)

// For route parameters
createValidator('param', schemaName)

// Multiple validators can be chained
featureRouter.put(
    '/:id',
    createValidator('param', idParamSchema),
    createValidator('json', updateSchema),
    async function handler(c) { /* ... */ }
)
```

### Validation Strategy

#### Schemas Directly from @bob/schema

Use schemas directly from the schema package for:
- **JSON body validation** - Use create/update schemas directly
- **Query parameters** - Use filter schemas directly
- **Standard CRUD operations** - The schemas are already defined

```typescript
// Use createTagSchema directly for JSON body
tagRouter.post(
    '/',
    createValidator('json', createTagSchema),  // Direct from @bob/schema
    async function createTagHandler(c) {
        const data = c.req.valid('json')
        // ...
    }
)

// Use updateTagSchema directly for updates
tagRouter.put(
    '/:tagId',
    createValidator('param', tagIdParamSchema),  // From validation folder
    createValidator('json', updateTagSchema),     // Direct from @bob/schema
    async function updateTagHandler(c) {
        // ...
    }
)

// Use filter schemas directly for query params
tagRouter.get(
    '/',
    createValidator('query', listTagsFiltersSchema),  // Direct from @bob/schema
    async function listTagsHandler(c) {
        // ...
    }
)
```

#### Validators in validation/ Directory

Create validators in `apps/api/src/validation/[model].validation.ts` for:
- **Route parameters** - These need custom object structures
- **Complex validation** - Business rules not in base schemas
- **API-specific validation** - Validation not shared with frontend

**File naming pattern**: `[model].validation.ts`

Examples: `tag.validation.ts`, `project.validation.ts`, `automation.validation.ts`

```typescript
// apps/api/src/validation/tag.validation.ts
import { z } from 'zod'
import { selectTagSchema, selectProjectSchema } from '@bob/schema'

// IMPORTANT: Reuse field types from existing schemas
export const tagIdParamSchema = z.object({
    tagId: selectTagSchema.shape.id,  // Reuse the actual ID type, don't redefine
})

// For multiple parameters
export const tagWithProjectParamSchema = z.object({
    tagId: selectTagSchema.shape.id,
    projectId: selectProjectSchema.shape.id,  // Reuse from project schema
})
```

#### Key Principle: Don't Redefine, Reuse

```typescript
// WRONG - Redefining the ID type
export const tagIdParamSchema = z.object({
    tagId: z.string().uuid(),  // Don't redefine!
})

// CORRECT - Reusing the ID type from schema
export const tagIdParamSchema = z.object({
    tagId: selectTagSchema.shape.id,  // Reuse from existing schema
})
```

## Response Handling

### Using mapUseCaseResultToHttpStatus

This utility automatically maps use-case results to HTTP responses:

```typescript
const result = await someUseCase(...)
return mapUseCaseResultToHttpStatus(result, c)

// Automatically returns:
// - 200 with data for success
// - 400 for INVALID_REQUEST
// - 401 for AUTH_ERROR
// - 404 for NOT_FOUND
// - 409 for DUPLICATE_KEY
// - 403 for FORBIDDEN
// - 500 for UNKNOWN
```

### Custom Success Response

Transform successful responses:

```typescript
return mapUseCaseResultToHttpStatus(result, c, (data) => {
    return c.json({
        model: data,
        metadata: { timestamp: new Date() }
    }, 200)
})
```

### Direct Response (Rare Cases)

For special cases that don't fit the pattern:

```typescript
// Only when use-case doesn't return UseCaseResult
const result = await getRulesGroupedByEvent(member.id)

if (!result.success) {
    return c.json({ message: result.message }, 500)
}

return c.json(result.data)
```

## Middleware Usage

### Authentication

```typescript
// Apply to all routes in router
featureRouter.use(bindAuthContext())

// Or apply to specific routes
featureRouter.get(
    '/protected',
    bindAuthContext(),
    async function protectedHandler(c) {
        const member = c.get('member')  // Available after auth
        // ...
    }
)
```

### Custom Middleware

```typescript
// Apply feature-specific middleware
featureRouter.use('/admin/*', requireAdminRole())
```

## Route Organization

### RESTful Patterns

```typescript
// Standard CRUD endpoints
GET    /api/models          // List all
GET    /api/models/:id      // Get one
POST   /api/models          // Create
PUT    /api/models/:id      // Update
DELETE /api/models/:id      // Delete

// Nested resources
GET    /api/models/:id/items
POST   /api/models/:id/items

// Actions
POST   /api/models/:id/publish
POST   /api/models/:id/archive
```

### Special Endpoints

```typescript
// Bulk operations
POST   /api/models/bulk-delete
PUT    /api/models/bulk-update

// Specialized queries
GET    /api/models/grouped
GET    /api/models/stats

// Validation/checks
POST   /api/models/check-availability
```

## Route Comments

Add comments for complex or non-standard endpoints:

```typescript
// GET /api/tags - List all tags for the authenticated user
tagRouter.get('/', /* ... */)

// POST /api/tags/automation-rules - Create a new automation rule
tagRouter.post('/automation-rules', /* ... */)
```

## Error Handling

Routes should not handle errors directly - let use-cases return error results:

```typescript
// CORRECT - Let use-case handle errors
async function createModelHandler(c) {
    const result = await createModel(data)
    return mapUseCaseResultToHttpStatus(result, c)
}

// WRONG - Don't catch errors in routes
async function createModelHandler(c) {
    try {
        const result = await createModel(data)
        return c.json(result)
    } catch (error) {
        return c.json({ error: 'Failed' }, 500)
    }
}
```

## Route Registration

Routes are registered in the main app file:

```typescript
// apps/api/src/hono.ts
import { Hono } from 'hono'
import { tagRouter } from './routes/tag.route'
import { projectRouter } from './routes/project.route'

const app = new Hono()

// Register routers
app.route('/api/tags', tagRouter)
app.route('/api/projects', projectRouter)
```

## Best Practices

### Do's

- Keep routes thin - delegate to use-cases
- Always use named handler functions
- Use createValidator for all input validation
- Use mapUseCaseResultToHttpStatus for responses
- Get member/user from context after auth
- Pass member.id to use-cases for ownership
- Use RESTful conventions
- Add comments for complex endpoints
- Reuse field types from `@bob/schema`
- Keep validators focused and single-purpose

### Don'ts

- Don't use anonymous arrow functions for handlers
- Don't put business logic in routes
- Don't access database directly
- Don't throw errors - return results
- Don't skip validation
- Don't handle errors in routes
- Don't use console.log
- Don't return raw use-case errors to clients
- Don't duplicate schemas that exist in `@bob/schema`
- Don't redefine field types - import and reuse

## Testing Routes

- Test HTTP status codes
- Test validation errors
- Test authentication requirements
- Mock use-cases for isolated testing
- Verify correct data is passed to use-cases
