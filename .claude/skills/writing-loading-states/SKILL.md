---
name: writing-loading-states
description: This skill should be used when the user asks to "add loading state", "skeleton loader", "isLoading pattern", "empty state", "error state", or needs guidance on implementing loading indicators, skeletons, and state handling in React components.
---

# Loading States

This skill provides conventions for implementing loading states, skeleton loaders, and state handling in the Worksauce frontend application.

## When to Apply

- Adding loading indicators to buttons or forms
- Creating skeleton loaders for data fetching
- Implementing empty states for lists
- Handling error states in components
- Working with React Query loading states

## Button Loading States

Disable buttons and show visual feedback during mutations:

```typescript
import { Loader2 } from 'lucide-react'
import { Button } from '@bob/ui'

interface SubmitButtonProps {
    isLoading?: boolean
    children: React.ReactNode
}

export function SubmitButton({ isLoading, children }: SubmitButtonProps) {
    return (
        <Button type="submit" disabled={isLoading}>
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                </>
            ) : (
                children
            )}
        </Button>
    )
}
```

## Skeleton Loaders

Create skeleton components that match the shape of loaded content:

```typescript
import { Skeleton } from '@bob/ui'

export function CardSkeleton() {
    return (
        <div className="rounded-lg border p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    )
}

export function TableRowSkeleton() {
    return (
        <tr>
            <td className="p-4"><Skeleton className="h-4 w-24" /></td>
            <td className="p-4"><Skeleton className="h-4 w-32" /></td>
            <td className="p-4"><Skeleton className="h-4 w-20" /></td>
            <td className="p-4"><Skeleton className="h-8 w-8 rounded" /></td>
        </tr>
    )
}
```

## Query State Pattern

Handle all states from React Query systematically:

```typescript
export function ModelList() {
    const { data: models, isLoading, error } = useModels()

    if (isLoading) {
        return <ModelListSkeleton />
    }

    if (error) {
        return (
            <ErrorState
                title="Failed to load models"
                message={error.message}
                onRetry={() => window.location.reload()}
            />
        )
    }

    if (!models?.length) {
        return (
            <EmptyState
                title="No models yet"
                description="Create your first model to get started."
                action={<Button>Create Model</Button>}
            />
        )
    }

    return (
        <div className="space-y-4">
            {models.map((model) => (
                <ModelCard key={model.id} model={model} />
            ))}
        </div>
    )
}
```

## Empty State Component

```typescript
interface EmptyStateProps {
    title: string
    description?: string
    icon?: React.ReactNode
    action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {icon && (
                <div className="mb-4 text-muted-foreground">{icon}</div>
            )}
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}
```

## Error State Component

```typescript
import { AlertCircle } from 'lucide-react'
import { Button } from '@bob/ui'

interface ErrorStateProps {
    title: string
    message?: string
    onRetry?: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">{title}</h3>
            {message && (
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    {message}
                </p>
            )}
            {onRetry && (
                <Button variant="outline" onClick={onRetry} className="mt-4">
                    Try Again
                </Button>
            )}
        </div>
    )
}
```

## Mutation Loading in Forms

```typescript
export function CreateModelForm() {
    const createModel = useCreateModel({
        onSuccess: () => navigate('/models'),
    })

    const form = useForm<CreateModel>({
        resolver: zodResolver(createModelSchema),
    })

    return (
        <form onSubmit={form.handleSubmit((data) => createModel.mutate(data))}>
            {/* Form fields */}

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={createModel.isPending}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={createModel.isPending}>
                    {createModel.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Model'
                    )}
                </Button>
            </div>
        </form>
    )
}
```

## Key Rules

### Do's
- Always handle loading, error, and empty states
- Match skeleton shapes to actual content layout
- Disable all form actions during mutations
- Show spinners on the triggering button
- Provide retry actions for error states
- Use `isPending` from mutations (not `isLoading`)

### Don'ts
- Don't show raw error messages to users
- Don't leave empty containers when loading
- Don't forget to disable cancel/secondary buttons during mutations
- Don't use generic "Loading..." without context
- Don't skip empty state handling for lists
