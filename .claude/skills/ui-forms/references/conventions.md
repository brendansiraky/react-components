# Form Conventions

## Overview
Forms in the application use react-hook-form with Zod validation for type-safe form handling. All forms follow consistent patterns for validation, error handling, and user feedback.

## Form Architecture

### Schema Selection

- **`@bob/schema`**: Use for forms that submit to API endpoints. Ensures validation consistency between frontend and backend.
- **`~/validation/`**: Use for frontend-only validation (auth forms, account settings). Schemas live in `apps/app/app/validation/`.
- **Inline schemas**: Acceptable for simple, component-specific forms that don't need reuse.

## Form Implementation Pattern

### 1. Basic Form Structure
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { logger } from '@bob/utils'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Button,
    Input,
} from '@bob/ui'

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
})

type FormValues = z.infer<typeof formSchema>

export function MyForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
        },
    })

    const onSubmit = async (values: FormValues) => {
        try {
            // Handle submission
            toast.success('Success message')
            form.reset() // Reset form after success
        } catch (error) {
            logger.error('Form submission error')
            logger.error(error)
            toast.error('Error message')
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={!form.formState.isDirty}
                >
                    Submit
                </Button>
            </form>
        </Form>
    )
}
```

### 2. Integration with Mutation Hooks
Forms should validate data before passing to mutation hooks using shared schemas:

```typescript
import { createModelSchema, type CreateModel } from '@bob/schema'

export function CreateModelForm() {
    const createModel = useCreateModel({
        onSuccess: () => {
            toast.success('Model created successfully')
            form.reset()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create model')
        },
    })

    // Use the same schema from @bob/schema
    const form = useForm<CreateModel>({
        resolver: zodResolver(createModelSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    })

    const onSubmit = async (values: CreateModel) => {
        // Data is already validated by react-hook-form
        // Mutation hook will re-validate for safety
        createModel.mutate(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Form fields */}
                <Button
                    type="submit"
                    disabled={createModel.isPending || !form.formState.isDirty}
                >
                    {createModel.isPending ? 'Creating...' : 'Create Model'}
                </Button>
            </form>
        </Form>
    )
}
```

## Error Handling Patterns

### 1. Field-Level Validation Errors
**DO NOT use toasts for validation errors that can be tied to form fields.** Use form field error states instead:

```typescript
// Field-level validation errors - NO TOAST
const { isChecking, debouncedCheckSlug } = useCheckOrganisationSlugAvailability({
    onSuccess: () => organizationForm.clearErrors('slug'),
    onError: (message) => organizationForm.setError('slug', { message }), // Set field error, no toast
    currentSlug: activeOrganization?.slug,
})

// Form validation with Zod - errors appear under fields
const formSchema = z.object({
    name: z.string().min(1, 'Name is required'), // Error message shows under field
    email: z.string().email('Invalid email address'), // Error message shows under field
})

// In form field render
<FormField
    control={form.control}
    name="email"
    render={({ field }) => (
        <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
                <Input {...field} />
            </FormControl>
            <FormMessage /> {/* Validation errors appear here, not as toasts */}
        </FormItem>
    )}
/>
```

### 2. Server-Side Error Handling
```typescript
const onSubmit = async (values: FormValues) => {
    try {
        // For operations that modify server state
        await updateProfile(values)
        toast.success('Profile updated successfully')

        // Reset form after successful save
        form.reset(values)
    } catch (error) {
        // Check if error can be tied to a specific field
        if (error.field) {
            form.setError(error.field, { message: error.message })
        } else {
            // Only use toast for general errors
            logger.error('Failed to update profile')
            logger.error(error)
            toast.error('Failed to update profile')
        }
    }
}
```

## User Feedback Guidelines

### Toast Notifications
Use toast notifications for global success/error states that aren't tied to specific form fields:

```typescript
import { toast } from 'sonner'

// Success notifications - brief and informative
toast.success('Profile updated successfully')
toast.success('Settings saved')
toast.success('Organisation member invited')

// Error notifications - for API/network failures
toast.error('Failed to update profile')
toast.error('Network error. Please try again.')
toast.error(error.message) // Use actual error messages when available

// In mutation callbacks - always provide feedback
const updateModel = useUpdateModel(modelId, {
    onSuccess: (data) => {
        toast.success('Model updated successfully')
        form.reset(data) // Reset form to clear dirty state
    },
    onError: (error) => {
        toast.error(error.message)
    },
})
```

### Loading States
Don't use toasts for loading states - use UI indicators instead:

```typescript
// Use button disabled state and loading indicators
<Button
    type="submit"
    disabled={mutation.isPending || !form.formState.isDirty}
>
    {mutation.isPending ? 'Saving...' : 'Save Changes'}
</Button>

// Form-level loading state
{mutation.isPending && (
    <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving changes...</span>
    </div>
)}
```

## Form Field Patterns

### Standard Input Field
```typescript
<FormField
    control={form.control}
    name="fieldName"
    render={({ field }) => (
        <FormItem>
            <FormLabel>Field Label</FormLabel>
            <FormControl>
                <Input placeholder="Enter value..." {...field} />
            </FormControl>
            <FormDescription>
                Optional description text
            </FormDescription>
            <FormMessage />
        </FormItem>
    )}
/>
```

### Textarea Field
```typescript
<FormField
    control={form.control}
    name="description"
    render={({ field }) => (
        <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
                <Textarea
                    placeholder="Enter description..."
                    className="min-h-[100px]"
                    {...field}
                />
            </FormControl>
            <FormMessage />
        </FormItem>
    )}
/>
```

### Select Field
```typescript
<FormField
    control={form.control}
    name="category"
    render={({ field }) => (
        <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
            </Select>
            <FormMessage />
        </FormItem>
    )}
/>
```

### Checkbox Field
```typescript
<FormField
    control={form.control}
    name="agreeToTerms"
    render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
                <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
            </FormControl>
            <div className="space-y-1 leading-none">
                <FormLabel>
                    I agree to the terms and conditions
                </FormLabel>
                <FormDescription>
                    You must agree to continue.
                </FormDescription>
            </div>
            <FormMessage />
        </FormItem>
    )}
/>
```

## Advanced Patterns

### Conditional Fields
```typescript
const watchedField = form.watch('enableFeature')

return (
    <form>
        <FormField
            control={form.control}
            name="enableFeature"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3">
                    <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <FormLabel>Enable Feature</FormLabel>
                </FormItem>
            )}
        />

        {watchedField && (
            <FormField
                control={form.control}
                name="featureConfig"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Feature Configuration</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )}
    </form>
)
```

### Dynamic Field Arrays
```typescript
import { useFieldArray } from 'react-hook-form'

const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
})

return (
    <div className="space-y-4">
        {fields.map((field, index) => (
            <div key={field.id} className="flex items-end space-x-2">
                <FormField
                    control={form.control}
                    name={`items.${index}.value`}
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Item {index + 1}</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        ))}

        <Button
            type="button"
            variant="outline"
            onClick={() => append({ value: '' })}
        >
            Add Item
        </Button>
    </div>
)
```

## Schema Integration Best Practices

### 1. Choose the Right Schema Location
```typescript
// API-related forms - use @bob/schema
import { createTagSchema, type CreateTag } from '@bob/schema'

const form = useForm<CreateTag>({
    resolver: zodResolver(createTagSchema),
})

// Auth/frontend-only forms - use ~/validation/
import { loginSchema, type LoginFormData } from '~/validation/auth'

const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
})

// Simple component-specific forms - inline is acceptable
const formSchema = z.object({
    name: z.string().min(1, 'Required'),
})
```

### 2. Type Safety Flow
1. **Schema defines the contract**: `createModelSchema` from `@bob/schema`
2. **Type is inferred**: `type CreateModel = z.infer<typeof createModelSchema>`
3. **Form validates**: Uses `zodResolver(createModelSchema)`
4. **Hook receives typed data**: `mutationFn: (data: CreateModel) => ...`
5. **Hook re-validates**: Uses `createModelSchema.parse()` for safety

### 3. Default Values
```typescript
// For create forms - use empty defaults
const form = useForm<CreateModel>({
    resolver: zodResolver(createModelSchema),
    defaultValues: {
        name: '',
        description: '',
        isActive: true,
    },
})

// For edit forms - use existing data
const form = useForm<UpdateModel>({
    resolver: zodResolver(updateModelSchema),
    defaultValues: existingModel,
})

// Reset form when data changes
useEffect(() => {
    if (existingModel) {
        form.reset(existingModel)
    }
}, [existingModel, form])
```

## Form State Management

### Dirty State Tracking
```typescript
// Disable submit button when form is not dirty
<Button
    type="submit"
    disabled={!form.formState.isDirty || mutation.isPending}
>
    Save Changes
</Button>

// Reset form after successful submission
const onSuccess = (data) => {
    toast.success('Changes saved')
    form.reset(data) // This clears the dirty state
}
```

### Form Reset Patterns
```typescript
// Reset to original values
form.reset()

// Reset to new values (e.g., after successful update)
form.reset(updatedData)

// Reset specific fields
form.resetField('fieldName')

// Clear all errors
form.clearErrors()

// Clear specific field error
form.clearErrors('fieldName')
```

## Validation Patterns

### Custom Validation
```typescript
const formSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})
```

### Async Validation
```typescript
// Use external validation hooks
const { isChecking, debouncedCheckSlug } = useCheckSlugAvailability({
    onSuccess: () => form.clearErrors('slug'),
    onError: (message) => form.setError('slug', { message }),
})

// Show validation state in UI
<FormField
    control={form.control}
    name="slug"
    render={({ field }) => (
        <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
                <div className="relative">
                    <Input {...field} />
                    {isChecking && (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
                    )}
                </div>
            </FormControl>
            <FormMessage />
        </FormItem>
    )}
/>
```

## Don'ts

- Don't use toasts for field validation errors - use FormMessage instead
- Don't duplicate schemas that exist in `@bob/schema` for API forms
- Don't forget to reset forms after successful submissions
- Don't skip loading states on submit buttons
- Don't use `console.log` - use `@bob/utils` logger
- Don't forget to disable submit buttons during mutations
- Don't skip error handling in form submissions
- Don't hardcode success/error messages - make them contextual
