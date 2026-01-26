---
name: tanstack-query-hooks
description: This skill should be used when the user asks to "create a hook", "add a query hook", "implement useQuery", "create a mutation hook", "add CRUD hooks", "fetch API data", "useCustomMutation pattern", "invalidate queries", "add data fetching", or needs guidance on React Query hook patterns, query key strategies, or mutation callbacks in apps/app/app/hooks/.
---

# TanStack Query Hooks

Conventions for creating React hooks that wrap TanStack Query for data fetching and mutations.

## Directory Structure

```
hooks/
├── [model]/
│   ├── use-[model]s.ts          # List resources
│   ├── use-[model].ts           # Get single resource
│   ├── use-create-[model].ts    # Create
│   ├── use-update-[model].ts    # Update
│   └── use-delete-[model].ts    # Delete
```

## Key Rules

1. **No `types.ts` files** - Import from `@bob/schema` or define inline
2. **No `index.ts` barrel files** - Import hooks directly
3. **Use `useCustomMutation`** for all mutations (not raw `useMutation`)
4. **Toast messages in hooks** - Not in components
5. **Validate responses** with `.safeParse()` and provide fallback

## Essential Imports

```typescript
// Queries
import { useQuery } from '@tanstack/react-query'
import { createSecureFetch } from '@bob/ui'

// Mutations
import { useCustomMutation, type UseMutationCallbacks } from '@bob/ui'

// Common
import { toast } from 'sonner'
import { logger } from '@bob/utils'
import { env } from '~/env'
```

## Query Hook Pattern

```typescript
export function useModels(filters?: ListFilters) {
    const fetch = createSecureFetch(env.VITE_API_URL, 'Failed to fetch models')

    return useQuery({
        queryKey: ['models', 'list', filters], // Hierarchical: [resource, action, params]
        queryFn: async () => {
            const response = await fetch('/api/models')
            const json = await response.json()
            const validated = modelSchema.array().safeParse(json)
            if (!validated.success) {
                logger.warn('Validation failed')
                return json
            }
            return validated.data
        },
    })
}
```

## Mutation Hook Pattern

```typescript
interface Variables {
    modelId: string
    data: UpdateModel
}

export function useUpdateModel(callbacks?: UseMutationCallbacks<GetModel>) {
    return useCustomMutation<GetModel, Error, Variables>(
        env.VITE_API_URL,
        'Failed to update model',
        (queryClient, fetch) => ({
            mutationFn: async ({ modelId, data }) => {
                const validatedData = updateModelSchema.safeParse(data)
                if (!validatedData.success) {
                    logger.error('Invalid data provided')
                    throw new Error('Invalid data')
                }

                const response = await fetch(`/api/models/${modelId}`, {
                    method: 'PUT',
                    body: JSON.stringify(validatedData.data),
                })
                return response.json()
            },
            onSuccess: async (data, { modelId }) => {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['models', 'list'] }),
                    queryClient.invalidateQueries({ queryKey: ['models', 'detail', modelId] }),
                ])
                toast.success('Model updated')
                callbacks?.onSuccess?.(data)
            },
            onError: (error) => {
                toast.error(`Failed: ${error?.message || 'Unknown error'}`)
                callbacks?.onError?.(error)
            },
        }),
    )
}
```

## Query Key Conventions

Use hierarchical query keys for consistency:
- **List queries**: `['models', 'list', filters]`
- **Detail queries**: `['models', 'detail', modelId]`
- **Invalidate list**: `queryClient.invalidateQueries({ queryKey: ['models', 'list'] })`
- **Remove specific**: `queryClient.removeQueries({ queryKey: ['models', 'detail', modelId] })` (for deletes)

## Real Codebase Examples

- **Query hook**: `apps/app/app/hooks/venue/use-venues.ts`
- **Create mutation**: `apps/app/app/hooks/venue/use-create-venue.ts`
- **Delete mutation**: `apps/app/app/hooks/venue/use-delete-venue.ts`

## Additional Resources

### Reference Files

For complete patterns including detailed CRUD examples, schema validation, error handling, form integration, and the full list of don'ts:

- **`references/patterns.md`** - Complete hook conventions and patterns
