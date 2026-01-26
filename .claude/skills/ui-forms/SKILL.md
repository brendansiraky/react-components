---
name: ui-forms
description: This skill should be used when the user asks to "create a form", "add form validation", "implement useForm", "handle form submission", "add FormField component", "integrate form with mutation", "add field validation", "use zodResolver", "react-hook-form pattern", "form error handling", "FormMessage errors", "auth form with BetterAuth", or needs guidance on implementing forms with react-hook-form, Zod validation, and @bob/ui Form components in apps/app.
---

# UI Forms

This skill provides guidance for implementing forms in the frontend application (`apps/app`).

## Quick Reference

### Core Stack
- **react-hook-form**: Form state management
- **@hookform/resolvers/zod**: Zod integration
- **zod**: Schema validation
- **@bob/ui**: Form components (Form, FormField, FormItem, FormLabel, FormControl, FormMessage)
- **sonner**: Toast notifications
- **@bob/schema**: Shared validation schemas

### Key Principles

1. **Schema selection**: Use `@bob/schema` for API-related forms. Use `~/validation/` for frontend-only validation (auth forms, account settings)
2. **Field-level errors**: Use `FormMessage` for validation errors, not toasts
3. **Toasts for global feedback**: Only use toasts for success messages and API/network errors
4. **Dirty state tracking**: Disable submit buttons when form is not dirty
5. **Reset after success**: Call `form.reset()` after successful submissions
6. **Loading states**: Show loading indicators on submit buttons during mutations

### Basic Form Pattern

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Button, Input } from '@bob/ui'
import { createModelSchema, type CreateModel } from '@bob/schema'

const form = useForm<CreateModel>({
    resolver: zodResolver(createModelSchema),
    defaultValues: { name: '', description: '' },
})

<Button type="submit" disabled={!form.formState.isDirty || mutation.isPending}>
    {mutation.isPending ? 'Saving...' : 'Save'}
</Button>
```

### Error Handling Rules

| Error Type | How to Handle |
|------------|---------------|
| Field validation | `FormMessage` component under field |
| Async field validation | `form.setError('field', { message })` |
| API success | `toast.success('Message')` |
| API/Network failure | `toast.error('Message')` |
| Loading state | Button disabled + loading text |

## Auth Forms with BetterAuth

Auth forms (login, signup) use `authClient` directly instead of mutation hooks:

```typescript
import { authClient } from '~/lib/auth-client'
import { type LoginFormData, loginSchema } from '~/validation/auth'

const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
})

const onSubmit = async (data: LoginFormData) => {
    await authClient.signIn.email(
        { email: data.email, password: data.password },
        {
            onRequest: () => { setIsLoading(true); setError(null) },
            onSuccess: () => navigate('/dashboard'),
            onError: (ctx) => { setError(ctx.error.message); setIsLoading(false) },
        },
    )
}
```

**Key differences from mutation-based forms:**
- Use `useState` for loading/error state instead of mutation state
- Schema defined in `~/validation/auth.ts`, not `@bob/schema`
- Use `authClient` methods with `onRequest`, `onSuccess`, `onError` callbacks

## Real Codebase Examples

- **Basic form with mutation**: `apps/app/app/components/create-organization-form.tsx`
- **Async slug validation**: `apps/app/app/components/venues/create-venue-form.tsx`
- **Auth form (BetterAuth)**: `apps/app/app/components/login-form.tsx`
- **Frontend validation schemas**: `apps/app/app/validation/auth.ts`

## Detailed Documentation

For comprehensive patterns including:
- All form field types (Input, Textarea, Select, Checkbox)
- Conditional fields with `form.watch()`
- Dynamic field arrays with `useFieldArray`
- Custom and async validation patterns
- Form state management and reset patterns

See the full convention document: [references/conventions.md](./references/conventions.md)
