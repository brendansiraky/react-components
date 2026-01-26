# Middleware Conventions - Advanced Patterns

This reference contains advanced middleware patterns beyond the core conventions in SKILL.md.

## Discriminated Union Context

For contexts with mutually exclusive states, use discriminated unions to enable exhaustive type checking:

```typescript
export interface SubscriptionContext extends AuthContext {
    Variables: AuthContext['Variables'] &
        (
            | { isInTrial: false; limits: { projects: number; storage: number } }
            | { isInTrial: true; limits: false }
        )
}
```

Usage in handlers:

```typescript
async function handler(c: Context<SubscriptionContext>) {
    const isInTrial = c.get('isInTrial')

    if (isInTrial) {
        // TypeScript knows limits is false here
        return c.json({ message: 'Trial users cannot access this feature' }, 403)
    }

    // TypeScript knows limits is { projects: number; storage: number } here
    const limits = c.get('limits')
    if (limits.projects > 10) {
        // ...
    }
}
```

## Dynamic Permission Checking

For permissions that depend on request context (route params, body values):

```typescript
export function checkPermissions(
    requiredPermissions:
        | PermissionCheck
        | PermissionCheck[]
        | ((c: Context<AuthContext>) => PermissionCheck | PermissionCheck[])
) {
    return async function checkPermissionsMiddleware(c: Context<AuthContext>, next: Next) {
        const permissions =
            typeof requiredPermissions === 'function' ? requiredPermissions(c) : requiredPermissions

        const permissionArray = Array.isArray(permissions) ? permissions : [permissions]

        const member = c.get('member')
        const hasPermission = permissionArray.some((perm) =>
            checkMemberHasPermission(member, perm)
        )

        if (!hasPermission) {
            throw new HTTPException(403, { message: 'Insufficient permissions' })
        }

        await next()
    }
}
```

## Helper Wrapper Functions

Create specialized middleware that wraps generic middleware for common patterns:

```typescript
// Venue-specific permission wrapper
export function checkVenuePermissions(permission: 'write' | 'read') {
    return checkPermissions((c) => [
        { venue: [`${c.req.param('venueId')}:${permission}`] },  // Specific venue permission
        { venue: [permission] },  // Global venue permission fallback
    ])
}

// Organization-level permission wrapper
export function checkOrgPermissions(permission: 'admin' | 'member') {
    return checkPermissions((c) => ({
        organization: [`${c.req.param('orgId')}:${permission}`],
    }))
}
```

Usage:

```typescript
venueRouter.get('/:venueId', checkVenuePermissions('read'), async (c) => {
    // Handler logic
})

venueRouter.put('/:venueId', checkVenuePermissions('write'), async (c) => {
    // Handler logic
})
```

## Conditional Middleware

Apply middleware based on runtime conditions:

```typescript
export function conditionalMiddleware(
    condition: (c: Context) => boolean,
    middleware: MiddlewareHandler
): MiddlewareHandler {
    return async (c, next) => {
        if (condition(c)) {
            return middleware(c, next)
        }
        await next()
    }
}

// Usage: Only apply rate limiting in production
venueRouter.post(
    '/submit',
    conditionalMiddleware(
        () => env.NODE_ENV === 'production',
        passwordAttemptRateLimit()
    ),
    async (c) => {
        // Handler logic
    }
)
```

## Middleware Composition

Combine multiple middleware into a single function:

```typescript
export function composeMiddleware(
    ...middlewares: MiddlewareHandler[]
): MiddlewareHandler {
    return async (c, next) => {
        let index = 0

        async function runNext(): Promise<void> {
            if (index < middlewares.length) {
                const middleware = middlewares[index++]
                await middleware(c, runNext)
            } else {
                await next()
            }
        }

        await runNext()
    }
}

// Usage: Common middleware stack as a single function
const protectedRoute = composeMiddleware(
    bindAuthContext(),
    bindSubscriptionContext(),
    checkPermissions('write')
)

venueRouter.post('/protected', protectedRoute, async (c) => {
    // Handler logic
})
```

## Request Timing Middleware

Track request duration for monitoring:

```typescript
export function requestTiming(): MiddlewareHandler {
    return async (c, next) => {
        const start = performance.now()

        await next()

        const duration = performance.now() - start
        c.res.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`)

        if (duration > 1000) {
            logger.warn(`Slow request: ${c.req.method} ${c.req.path} took ${duration.toFixed(2)}ms`)
        }
    }
}
```

## Error Recovery Middleware

Wrap routes with custom error recovery:

```typescript
export function withErrorRecovery(
    fallback: (c: Context, error: Error) => Response | Promise<Response>
): MiddlewareHandler {
    return async (c, next) => {
        try {
            await next()
        } catch (error) {
            if (error instanceof HTTPException) {
                throw error  // Let HTTP exceptions pass through
            }

            logger.error('Unhandled error in route:')
            logger.error(error)

            return await fallback(c, error as Error)
        }
    }
}

// Usage
venueRouter.get(
    '/risky-operation',
    withErrorRecovery((c, error) =>
        c.json({ message: 'Operation failed', fallback: true }, 500)
    ),
    async (c) => {
        // Handler that might throw
    }
)
```

## Best Practices

1. **Use factory functions consistently** - Even middleware with no options should be a function that returns the handler
2. **Type narrow in handlers** - Use discriminated unions and type guards to get precise types
3. **Prefer composition over inheritance** - Use `composeMiddleware` for common stacks
4. **Log slow requests** - Add timing middleware in development to catch performance issues
5. **Keep fallback paths explicit** - Use `devOnly` flags and conditional middleware for environment-specific behavior
