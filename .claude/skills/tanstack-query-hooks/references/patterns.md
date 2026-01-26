# Hook Conventions

## Overview
Hooks implement data fetching and mutations for the frontend application. They provide a clean interface between React components and the API, using React Query for caching and state management.

## Directory Structure
```
hooks/
├── [model]/                        # Model-specific directory
│   ├── use-[model]s.ts             # List/fetch multiple resources
│   ├── use-[model].ts              # Fetch single resource by ID
│   ├── use-create-[model].ts       # Create new resource
│   ├── use-update-[model].ts       # Update existing resource
│   ├── use-delete-[model].ts       # Delete resource
│   └── use-[custom-action].ts      # Custom actions (e.g., use-assign-tag-to-proposal.ts)
├── [shared-hooks].ts               # Non-model specific hooks
└── CONVENTION.md                   # This file
```

**IMPORTANT**:
- NO separate `types.ts` files. Types should come from `@bob/schema` or be defined inline.
- NO `index.ts` barrel files. Import hooks directly from their specific files.

## File Naming Convention
- **Pattern**: `use-[action]-[model].ts` or `use-[model][s].ts`
- **Examples**:
  - `use-tags.ts` - List tags
  - `use-tag.ts` - Get single tag
  - `use-create-tag.ts` - Create tag
  - `use-update-tag.ts` - Update tag
  - `use-delete-tag.ts` - Delete tag
  - `use-assign-tag-to-proposal.ts` - Custom action

## Hook Patterns

### 1. Type Handling Strategy

**Preference Order for Types:**
1. **First**: Import types from `@bob/schema` when available
2. **Second**: Define types inline above the function that uses them
3. **Never**: Create separate `types.ts` files in hook directories

### 2. Required Imports
```typescript
// React Query - for queries only
import { useQuery } from '@tanstack/react-query'

// Custom hooks - PREFERRED for mutations
import { useCustomMutation, type UseMutationCallbacks } from '@bob/ui'

// Fetch utility - for query hooks
import { createSecureFetch } from '@bob/ui'

// Toast notifications - for user feedback in hooks
import { toast } from 'sonner'

// Logger - for validation warnings
import { logger } from '@bob/utils'

// Schema imports - PREFERRED when available
import {
    type CreateModel,      // Input type
    createModelSchema,     // Input validation schema
    type GetModel,         // Output type
    getModelSchema,        // Output validation schema
    type UpdateModel,      // Update input type
    updateModelSchema      // Update validation schema
} from '@bob/schema'

// OR inline type definitions when schema types aren't available:
interface CustomApiType {
    id: string
    name: string
    // ... other properties
}

// Environment
import { env } from '~/env'
```

### 3. Callback Interface Pattern and Variables
For mutation hooks using `useCustomMutation`, define a Variables interface and use the standard callback type with generic:
```typescript
// Define Variables interface for mutation parameters
interface Variables {
    modelId: string
    data: CreateModel
}

// Use the standard UseMutationCallbacks type with generic for return type
export function useCreateModel(callbacks?: UseMutationCallbacks<GetModel>) {
    return useCustomMutation<GetModel, Error, Variables>(
        env.VITE_API_URL,
        'Failed to create model',
        (queryClient, fetch) => ({
            // hook implementation
        }),
    )
}
```

## Hook Types

### 1. Query Hooks (Fetching Data)

#### List Multiple Resources
```typescript
export function useModels(filters?: ListFilters) {
    const fetch = createSecureFetch(env.VITE_API_URL, 'Failed to fetch models')

    return useQuery({
        queryKey: ['models', 'list', filters], // Hierarchical: [resource, action, params]
        queryFn: async (): Promise<ModelWithExtra[]> => {
            const queryParams = new URLSearchParams()

            if (filters?.someFilter) {
                queryParams.append('someFilter', filters.someFilter.toString())
            }

            // Use fetch utility from @bob/ui - handles credentials and error responses automatically
            const response = await fetch(`/api/models?${queryParams}`)

            const json = await response.json()

            // Validate response against schema
            const validatedData = modelWithExtraSchema.array().safeParse(json)

            if (!validatedData.success) {
                logger.warn('Fetch models response validation failed')
                logger.warn(validatedData.error)

                return json
            }

            return validatedData.data
        },
    })
}
```

#### Single Resource by ID
```typescript
export function useModel(modelId: string) {
    const fetch = createSecureFetch(env.VITE_API_URL, 'Failed to fetch model')

    return useQuery({
        queryKey: ['models', 'detail', modelId], // Hierarchical: [resource, action, id]
        queryFn: async (): Promise<GetModel> => {
            // Use fetch utility from @bob/ui - handles credentials and error responses automatically
            const response = await fetch(`/api/models/${modelId}`)

            const json = await response.json()

            // Validate response against schema
            const validatedData = getModelSchema.safeParse(json)

            if (!validatedData.success) {
                logger.warn('Fetch model response validation failed')
                logger.warn(validatedData.error)

                return json
            }

            return validatedData.data
        },
    })
}
```

### 2. Mutation Hooks (Modifying Data)

**PREFERRED**: Use `useCustomMutation` for all mutations as it handles authentication, error messages, and provides `fetch`.

**Note**: Not all mutations perform fetch operations. Some may use `authClient` or other services. In these cases, still use `useCustomMutation` but ignore the `fetch` parameter and use the appropriate client directly.

#### Create Resource
```typescript
interface Variables {
    data: CreateModel
}

/**
 * Hook to create a new model
 */
export function useCreateModel(callbacks?: UseMutationCallbacks<GetModel>) {
    return useCustomMutation<GetModel, Error, Variables>(
        env.VITE_API_URL,
        'Failed to create model',
        (queryClient, fetch) => ({
            mutationFn: async ({ data }): Promise<GetModel> => {
                // Validate input data
                const validatedData = createModelSchema.safeParse(data)
                if (!validatedData.success) {
                    logger.error('Invalid data provided to create model')
                    logger.error(validatedData.error)
                    throw new Error('Invalid model data')
                }

                const response = await fetch('/api/models', {
                    method: 'POST',
                    body: JSON.stringify(validatedData.data),
                })

                const json = await response.json()
                return json
            },
            onSuccess: async (data) => {
                await queryClient.invalidateQueries({
                    queryKey: ['models', 'list'],
                    refetchType: 'all',
                })

                toast.success('Model created successfully')

                callbacks?.onSuccess?.(data)
            },
            onError: (error) => {
                toast.error(`Failed to create model: ${error?.message || 'Unknown error'}`)

                callbacks?.onError?.(error)
            },
        }),
    )
}
```

#### Update Resource
```typescript
interface Variables {
    modelId: string
    data: UpdateModel
}

/**
 * Hook to update an existing model
 */
export function useUpdateModel(callbacks?: UseMutationCallbacks<GetModel>) {
    return useCustomMutation<GetModel, Error, Variables>(
        env.VITE_API_URL,
        'Failed to update model',
        (queryClient, fetch) => ({
            mutationFn: async ({ modelId, data }): Promise<GetModel> => {
                // Validate ID
                if (!modelId) {
                    logger.error('No model ID provided for update')
                    throw new Error('Model ID is required')
                }

                // Validate input data
                const validatedData = updateModelSchema.safeParse(data)
                if (!validatedData.success) {
                    logger.error('Invalid data provided to update model')
                    logger.error(validatedData.error)
                    throw new Error('Invalid model data')
                }

                const response = await fetch(`/api/models/${modelId}`, {
                    method: 'PUT',
                    body: JSON.stringify(validatedData.data),
                })

                return response.json()
            },
            onSuccess: async (data, { modelId }) => {
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['models', 'list'],
                        refetchType: 'all',
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['models', 'detail', modelId],
                        refetchType: 'all',
                    }),
                ])

                toast.success('Model updated successfully')

                callbacks?.onSuccess?.(data)
            },
            onError: (error) => {
                toast.error(`Failed to update model: ${error?.message || 'Unknown error'}`)

                callbacks?.onError?.(error)
            },
        }),
    )
}
```

#### Delete Resource
```typescript
interface Variables {
    modelId: string
}

/**
 * Hook to delete a model
 */
export function useDeleteModel(callbacks?: UseMutationCallbacks<void>) {
    return useCustomMutation<void, Error, Variables>(
        env.VITE_API_URL,
        'Failed to delete model',
        (queryClient, fetch) => ({
            mutationFn: async ({ modelId }): Promise<void> => {
                // Validate ID
                if (!modelId) {
                    logger.error('No model ID provided for deletion')
                    throw new Error('Model ID is required')
                }

                await fetch(`/api/models/${modelId}`, {
                    method: 'DELETE',
                })
                // DELETE operations typically don't return data
            },
            onSuccess: async (data, variables) => {
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['models', 'list'],
                        refetchType: 'all',
                    }),
                    // Remove the specific detail query (not invalidate)
                    queryClient.removeQueries({
                        queryKey: ['models', 'detail', variables.modelId],
                    }),
                ])

                toast.success('Model deleted successfully')

                callbacks?.onSuccess?.(data)
            },
            onError: (error) => {
                toast.error(`Failed to delete model: ${error?.message || 'Unknown error'}`)

                callbacks?.onError?.(error)
            },
        }),
    )
}
```

#### Auth Client Example (No Fetch)
```typescript
interface Variables {
    email: string
    password: string
}

/**
 * Hook to sign in using authClient instead of fetch
 */
export function useSignIn(callbacks?: UseMutationCallbacks<void>) {
    return useCustomMutation<void, Error, Variables>(
        env.VITE_API_URL,
        'Failed to sign in',
        (queryClient, fetch) => ({
            // Note: fetch is provided but not used - we use authClient instead
            mutationFn: async ({ email, password }) => {
                // Using authClient directly, not fetch
                const result = await authClient.signIn.email({
                    email,
                    password,
                })

                if (result.error) {
                    throw new Error(result.error.message)
                }
            },
            onSuccess: async (data) => {
                await queryClient.invalidateQueries({
                    queryKey: ['user'],
                    refetchType: 'all',
                })

                return callbacks?.onSuccess?.(data)
            },
        }),
    )
}
```

## Key Patterns

### 1. Mutation Hook Pattern (PREFERRED)
- **Use `useCustomMutation`** for all mutations instead of raw `useMutation`
- **Benefits**: Handles authentication, error messages, provides `fetch`
- **Pattern**: Define `Variables` interface, use `UseMutationCallbacks` type
- **Toast notifications**: Handle success/error messages in the hook, not the component
- **JSDoc comments**: Always include descriptive comment for the hook

### 2. Schema Validation
- **AVOID define new schemas** - try and import from `@bob/schema`
- **Input validation in hooks**: Validate input data at the start of `mutationFn` using `.safeParse()` and throw on failure
- **Query validation**: Always validate response data using `.safeParse()` after receiving from API
- **Use `.array()` for list responses**: `modelSchema.array().safeParse(data)`
- **Always provide fallback** when validation fails - log warning and return unvalidated data

### 3. Query Keys
- **Use hierarchical patterns**: `['models', 'list', filters]`, `['models', 'detail', id]`
- **Include filters in query keys**: `['models', 'list', { includeInactive }]`
- **Be specific with invalidation**: Target the right query keys
- **Use `removeQueries` for deletes**: Remove specific detail queries instead of invalidating

### 4. Error Handling & User Feedback
- **Toast in hooks**: Use `toast.success()` and `toast.error()` in mutation hooks
- **Error pattern**: `toast.error(\`Failed to [action]: \${error?.message || 'Unknown error'}\`)`
- **Success pattern**: `toast.success('[Action] completed successfully')`
- **Component callbacks**: Still support optional callbacks for additional component-specific logic

### 5. Query Invalidation
- **For creates**: Invalidate list queries (`['models', 'list']`)
- **For updates**: Invalidate both list and individual resource queries
- **For deletes**: Invalidate list queries AND remove the detail query with `removeQueries`
- **Use `refetchType: 'all'`** to ensure fresh data
- **Use `Promise.all()`** for multiple invalidations

### 6. Network Configuration
- **For query hooks**: Use `createSecureFetch` from `@bob/ui` - handles credentials and error responses automatically
- **For mutation hooks**: Use `fetch` provided by `useCustomMutation` - handles credentials and JSON automatically
- **Use proper HTTP methods**: GET, POST, PUT, DELETE
- **Query parameters**: Construct properly with `URLSearchParams` for query hooks

### 7. TypeScript Types
- **Variables interface**: Always define for mutation parameters
- **Use `UseMutationCallbacks<T>`**: Standard callback type with generic for return type
- **Import types from schema packages when available** - don't redefine
- **If schema types aren't available, define inline** above the function
- **Never create separate types.ts files** in hook directories

## Form Integration

### Schema-Based Form Validation
Forms should use the same schemas for validation to ensure consistency:

```typescript
import { createModelSchema, type CreateModel } from '@bob/schema'

// Form component
function CreateModelForm() {
    const createModel = useCreateModel({
        onSuccess: () => {
            // Handle success
        },
        onError: (error) => {
            // Handle error
        },
    })

    const handleSubmit = (formData: unknown) => {
        // Validate form data using the same schema
        const validatedData = createModelSchema.safeParse(formData)

        if (!validatedData.success) {
            // Handle validation errors in form
            return
        }

        // Data is now typed as CreateModel and validated
        createModel.mutate(validatedData.data)
    }
}
```

### Type Safety Flow
1. **Schema defines the contract**: `createModelSchema` from `@bob/schema`
2. **Type is inferred**: `type CreateModel = z.infer<typeof createModelSchema>`
3. **Form validates**: Uses `createModelSchema.safeParse()`
4. **Hook receives typed data**: `mutationFn: (data: CreateModel) => ...`
5. **Hook validates response**: Uses `getModelSchema.safeParse()` for response validation with fallback to unvalidated data

## Callback Usage

### In Components
```typescript
const createModel = useCreateModel({
    onSuccess: (data) => {
        // Additional component-specific logic (optional)
        // Toast message already handled in hook
        navigate('/models')
    },
    onError: (error) => {
        // Additional error handling (optional)
        // Error toast already handled in hook
        setFormErrors(error.fieldErrors)
    },
})

// Use the mutation with Variables pattern
const handleCreate = () => {
    createModel.mutate({
        data: {
            name: 'New Model',
            description: 'Model description'
        }
    })
}
```

## Don'ts
- Don't use raw `useMutation` - always prefer `useCustomMutation` for mutations
- Don't handle toast messages in components - handle them in hooks
- Don't create separate `types.ts` files in hook directories
- Don't create `index.ts` barrel files - import hooks directly from their specific files
- Don't define new schemas - always import from `@bob/schema`
- Don't skip input/output validation
- Don't manually handle `credentials: 'include'` or error checking - `createSecureFetch` (queries) and `fetch` (mutations) handle it
- Don't forget query invalidation after mutations
- Don't hardcode API URLs - use `env.VITE_API_URL`
- Don't manually handle response.ok checks in query hooks - use `createSecureFetch` from `@bob/ui`
- Don't forget to call provided callbacks in mutation handlers
- Don't forget JSDoc comments for hook functions
