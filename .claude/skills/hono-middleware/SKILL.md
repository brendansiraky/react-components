---
name: hono-middleware
description: This skill should be used when the user asks to "create a middleware", "add middleware", "protect a route", "add authentication", "add authorization", "check permissions", "add permission middleware", "rate limit endpoint", "bind context", "add context variables", "extend AuthContext", "skip auth for route", or needs guidance on Hono middleware patterns, permission checking, context type composition, or middleware factory functions in apps/api/src/middleware/.
---

# Hono Middleware

Conventions for creating middleware in the Hono backend (`apps/api/src/middleware`).

## When to Apply

- Creating new middleware functions
- Adding authentication or authorization checks
- Binding context variables for downstream handlers
- Implementing rate limiting
- Skipping authentication for specific routes (OAuth callbacks, webhooks)

## File Structure

```
middleware/
├── bind-auth-context.middleware.ts      # Authentication context
├── bind-subscription-context.middleware.ts  # Subscription limits
├── check-permissions.middleware.ts      # Permission checking
└── rate-limit.middleware.ts             # Rate limiting
```

**File naming**: `[purpose].middleware.ts`

## Standard Middleware Pattern

```typescript
import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { logger } from '@bob/utils'

export interface CustomContext {
    Variables: {
        customData: CustomType
    }
}

export function middlewareName(options?: OptionsType): MiddlewareHandler<CustomContext> {
    return async (c, next) => {
        try {
            // Validation
            if (someConditionFails) {
                throw new HTTPException(403, { message: 'Error message' })
            }

            // Set context variables
            c.set('customData', value)

            await next()
        } catch (error) {
            if (error instanceof HTTPException) {
                throw error  // Re-throw existing HTTPExceptions
            }
            logger.error('Middleware error:')
            logger.error(error)
            throw new HTTPException(500, { message: 'Operation failed' })
        }
    }
}
```

## Context Type Patterns

### Basic Context Interface

```typescript
export interface AuthContext {
    Variables: {
        user: typeof auth.$Infer.Session.user
        session: typeof auth.$Infer.Session.session
        member: MemberWithOrganization
    }
}
```

### Extending Existing Context

Build on previous middleware contexts:

```typescript
import type { AuthContext } from './bind-auth-context.middleware'

export interface SubscriptionContext extends AuthContext {
    Variables: AuthContext['Variables'] & {
        isInTrial: boolean
        limits: { projects: number; storage: number }
    }
}
```

## Path Skipping Pattern

For routes that bypass authentication (OAuth callbacks, webhooks):

```typescript
const UNAUTHENTICATED_PATH_PATTERNS = [
    // OAuth callbacks - dev only
    { pattern: /\/api\/integrations\/deputy\/callback/, devOnly: true },
    // Webhooks - always unauthenticated
    { pattern: /\/api\/integrations\/deputy\/webhooks\/[a-zA-Z0-9]+/, devOnly: false },
]

function shouldSkipAuth(url: string): boolean {
    return UNAUTHENTICATED_PATH_PATTERNS.some((config) => {
        if (config.devOnly && env.NODE_ENV !== 'dev') {
            return false
        }
        return config.pattern.test(url)
    })
}

export function bindAuthContext(): MiddlewareHandler<AuthContext> {
    return async (c, next) => {
        if (shouldSkipAuth(c.req.raw.url)) {
            return await next()  // Skip auth but continue chain
        }
        // ... rest of middleware
    }
}
```

## Permission Checking

```typescript
export function checkPermissions(
    requiredPermissions: PermissionCheck | PermissionCheck[]
) {
    return async function checkPermissionsMiddleware(c: Context<AuthContext>, next: Next) {
        const member = c.get('member')
        // ... permission checking logic
        await next()
    }
}
```

## Rate Limiting

Use `hono-rate-limiter`:

```typescript
import { rateLimiter } from 'hono-rate-limiter'

export function passwordAttemptRateLimit(): MiddlewareHandler {
    return rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 5,
        standardHeaders: 'draft-6',
        keyGenerator: (c) => {
            const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
            const linkSlug = c.req.param('link') || 'unknown'
            return `password-attempt:${ip}:${linkSlug}`
        },
        skipSuccessfulRequests: true,
        message: 'Too many password attempts. Please try again in 15 minutes.',
    })
}
```

## Error Handling

| Use | When |
|-----|------|
| `throw new HTTPException(401, { message: '...' })` | Auth failures, validation errors that stop request |
| `return c.json({ message: '...' }, 403)` | Middleware that returns responses without stopping |

Always re-throw existing HTTPExceptions to preserve the original error:

```typescript
try {
    // ... middleware logic
} catch (error) {
    if (error instanceof HTTPException) {
        throw error  // Don't wrap existing HTTP errors
    }
    logger.error('Middleware error:')
    logger.error(error)
    throw new HTTPException(500, { message: 'Operation failed' })
}
```

## Usage in Routes

### Router-Level Middleware

```typescript
const venueRouter = new Hono<AuthContext>()
venueRouter.use(bindAuthContext())
```

### Route-Specific Middleware

```typescript
venueRouter.get('/:venueId', checkPermissions('read'), async function getVenueHandler(c) {
    const member = c.get('member')
    // Handler logic
})
```

### Middleware Chaining

```typescript
venueRouter.post(
    '/:venueId/sensitive',
    bindAuthContext(),
    bindSubscriptionContext(),
    checkPermissions('write'),
    passwordAttemptRateLimit(),
    async function sensitiveHandler(c) {
        // All middleware passed
    }
)
```

## Key Principles

1. **Export factory functions** - Always return middleware from a function, even with no parameters
2. **Type your context** - Define and export context interfaces for type safety
3. **Extend existing contexts** - Use `extends AuthContext` to build on previous middleware
4. **Re-throw HTTPExceptions** - Don't wrap existing HTTP errors
5. **Use `@bob/utils` logger** - Never use `console.log`
6. **Keep middleware focused** - One concern per middleware function

## Additional Resources

For advanced patterns including discriminated union contexts, dynamic permission checking, and helper wrapper functions:

- **`references/middleware-conventions.md`** - Detailed middleware patterns and best practices
