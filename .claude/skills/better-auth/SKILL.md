---
name: better-auth
description: This skill should be used when the user asks to "add authentication", "implement login", "add signup", "configure OAuth", "add Google login", "add GitHub login", "manage sessions", "add organizations", "invite users to organization", "manage roles and permissions", "add API keys", "integrate Stripe subscriptions", "add 2FA", "add passkeys", "add magic links", "add email verification", "reset password", "social login", "SSO integration", or mentions BetterAuth plugins, authentication middleware, or session management.
---

# Better Auth

Better Auth is a framework-agnostic authentication and authorization framework for TypeScript. This project integrates it with a Hono backend and React Router v7 frontend.

## Project Configuration

### Key Files

| File | Purpose |
|:-----|:--------|
| `apps/api/src/auth.ts` | Server-side Better Auth configuration |
| `apps/app/app/lib/auth-client.ts` | Client-side auth using `createAuthClient` |
| `apps/api/src/lib/permissions.ts` | Access control definitions |

### Active Plugins

| Plugin | Client Plugin | Purpose |
|:-------|:--------------|:--------|
| `organization` | `organizationClient` | Multi-tenancy with roles, invitations |
| `apiKey` | `apiKeyClient` | API key authentication |
| `stripe` | `stripeClient` | Subscription management |
| `admin` | `adminClient` | Admin role and user management |

### Authentication Methods

- **Email & Password** - Primary method, auto-signin enabled
- **Google OAuth** - Social login via `socialProviders.google`

## Common Workflows

### Adding a New OAuth Provider

1. Add provider credentials to `apps/api/.env`
2. Configure in `apps/api/src/auth.ts` under `socialProviders`:

```typescript
socialProviders: {
    google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
}
```

3. Add login button in frontend using `authClient.signIn.social({ provider: "github" })`

For provider-specific setup, consult `references/authentication/` files.

### Working with Organizations

**Server-side** (`apps/api/src/auth.ts`):
- Organization plugin configured with `ac` (access control) from `~/lib/permissions`
- Custom roles defined: `owner`, `admin`, `employeeManager`, `awardCompliance`
- Auto-creates organization on user signup (unless invitation signup)
- Sends invitation emails via `sendOrganizationInvitationEmail`

**Client-side operations:**
```typescript
import { authClient } from '~/lib/auth-client'

// Create organization
await authClient.organization.create({ name: "Acme Inc", slug: "acme" })

// Invite member
await authClient.organization.inviteMember({ email: "user@example.com", role: "admin" })

// Switch active organization
await authClient.organization.setActive({ organizationId: "org_123" })

// Get current organization
const { data } = await authClient.useActiveOrganization()
```

### Session and User Data

**React hooks:**
```typescript
import { authClient } from '~/lib/auth-client'

// Get session (returns { user, session })
const { data: session, isPending } = authClient.useSession()

// Get active organization
const { data: org } = authClient.useActiveOrganization()
```

**Server-side session access:**
```typescript
import { auth } from '~/auth'

// In Hono route handler
const session = await auth.api.getSession({ headers: c.req.raw.headers })
if (!session) return c.json({ error: 'Unauthorized' }, 401)
```

### Roles and Permissions

Permissions defined in `apps/api/src/lib/permissions.ts` using Better Auth's access control:

```typescript
import { createAccessControl, defaultStatements } from "better-auth/plugins/organization/access"

export const ac = createAccessControl({
    ...defaultStatements,
    // Custom permissions
})

export const employeeManager = { ... }
export const awardCompliance = { ... }
```

Check permissions:
```typescript
// Server-side
const hasPermission = await auth.api.hasPermission({
    headers,
    body: { permission: { resource: ["organization"], action: ["update"] } }
})
```

### API Key Authentication

```typescript
// Client: Create API key
const { data } = await authClient.apiKey.create({ name: "My API Key" })

// Server: Validate API key in route
const apiKey = c.req.header('x-api-key')
const validation = await auth.api.validateApiKey({ body: { key: apiKey } })
```

### Stripe Subscriptions

Configuration in `apps/api/src/auth.ts`:
- Plans loaded from `~/config/plans.json`
- Creates Stripe customer on signup
- Webhook handling via `stripeWebhookSecret`

```typescript
// Client: Get subscription status
const { data } = await authClient.subscription.list()

// Client: Create checkout session
await authClient.subscription.upgrade({ plan: "pro" })
```

## Cross-Subdomain Authentication

This project uses cross-subdomain cookies:

```typescript
advanced: {
    crossSubDomainCookies: {
        enabled: true,
        domain: env.ROOT_DOMAIN,
    },
},
trustedOrigins: [`${SCHEME}://*.${env.ROOT_DOMAIN}`],
```

Sessions work across `*.worksauce.com` subdomains.

## Database Hooks

User creation triggers automatic organization creation:
- Skipped for invitation signups (`metadata.isInvitationSignup`)
- Creates `{userName}'s Organization` with generated slug
- Custom slug supported via `metadata.slug`

Invitation cleanup hook auto-deletes invitations after accept/cancel.

## Email Integration

Auth emails handled by custom functions in `apps/api/src/email/`:
- `sendPasswordResetEmail` - Password reset
- `sendEmailVerificationEmail` - Email verification
- `sendOrganizationInvitationEmail` - Org invitations
- `sendDeleteAccountVerificationEmail` - Account deletion confirmation

## Documentation Reference

For detailed API documentation, consult these reference files:

### Core Concepts
- **`references/concepts/session-management.md`** - Session handling, cookies, refresh
- **`references/concepts/hooks.md`** - Customize auth behavior with hooks
- **`references/concepts/plugins.md`** - Plugin system overview
- **`references/concepts/users-accounts.md`** - User and account management

### Plugins (Currently Used)
- **`references/plugins/organization.md`** - Organizations, roles, invitations, teams
- **`references/plugins/api-key.md`** - API key authentication
- **`references/plugins/stripe.md`** - Stripe subscriptions and payments
- **`references/plugins/admin.md`** - Admin functionality

### Plugins (Available to Add)
- **`references/plugins/2fa.md`** - Two-factor authentication
- **`references/plugins/passkey.md`** - Passkey/WebAuthn support
- **`references/plugins/magic-link.md`** - Passwordless email links
- **`references/plugins/sso.md`** - Enterprise SSO integration
- **`references/plugins/jwt.md`** - JWT token authentication

### OAuth Providers
- **`references/authentication/google.md`** - Google OAuth (currently active)
- **`references/authentication/github.md`** - GitHub OAuth
- **`references/authentication/apple.md`** - Apple Sign In
- **`references/authentication/microsoft.md`** - Microsoft/Azure AD

### Integrations
- **`references/integrations/hono.md`** - Hono middleware patterns
- **`references/integrations/remix.md`** - React Router/Remix patterns
- **`references/adapters/drizzle.md`** - Drizzle ORM adapter

### Troubleshooting
- **`references/errors.md`** - Common error codes and solutions
- **`references/errors/state_mismatch.md`** - OAuth state issues
- **`references/errors/oauth_provider_not_found.md`** - Provider configuration
