---
name: monorepo
description: This skill should be used when the user asks about "monorepo structure", "workspace setup", "add a new package", "add a new app", "turborepo configuration", "shared dependencies", "monorepo conventions", "setup environment variables", "create .env file", "configure env.ts", "environment validation", or needs guidance on the overall architecture, package relationships, environment configuration, or tooling configuration in this monorepo.
version: 0.3.0
---

# Monorepo Architecture

Comprehensive documentation of the monorepo structure, tooling, and conventions.

**IMPORTANT**: When setting up or modifying this monorepo, always follow the reference files in `references/` exactly. Do not add extra features, custom themes, or additional directories beyond what is documented.

## Overview

| Aspect               | Details                      |
| -------------------- | ---------------------------- |
| **Monorepo Tool**    | Turborepo                    |
| **Package Manager**  | Bun                          |
| **Language**         | TypeScript                   |
| **Backend Framework**| Hono                         |
| **Frontend Framework**| React 19 + React Router v7  |
| **Database**         | PostgreSQL with Drizzle ORM  |
| **Authentication**   | BetterAuth                   |
| **Styling**          | Tailwind CSS (default config)|
| **UI Components**    | shadcn/ui + Radix UI         |

## Directory Structure

```
/
├── apps/                 # Application packages
│   ├── api/              # Hono backend (port 3001)
│   └── app/              # React Router frontend (port 5173)
├── packages/             # Shared utility packages
│   ├── schema/           # Database + validation schemas
│   ├── ui/               # Shared React components
│   ├── email/            # React Email templates
│   ├── utils/            # Utility functions for frontend and backend
│   └── config/           # Configuration packages
│       ├── typescript/   # Shared tsconfig.json files
│       ├── tailwind/     # Shared Tailwind config
│       └── eslint/       # Shared ESLint config (TypeScript)
├── docs/                 # Documentation
├── .claude/              # Claude Code configuration
├── package.json          # Root workspace configuration
├── turbo.json            # Turborepo task configuration
└── bun.lock              # Bun lock file
```

## Creating New Apps

### React Router v7 Frontend

Use the official create command:

```bash
cd apps
bunx create-react-router@latest app --yes
```

After creation:
1. Remove nested `.git` directory
2. Update `package.json`: change name to `@bob/app`, add `"type": "module"`, add workspace dependencies
3. Create `eslint.config.ts` (TypeScript, not .js)
4. Keep CSS default - do not add custom theme variables

### Hono Backend

Use the official create command:

```bash
bun create hono@latest api --template bun --pm bun
```

After creation:
1. Update `package.json`: change name to `@bob/api`, add `"type": "module"`, add workspace dependencies
2. Create `eslint.config.ts` (TypeScript, not .js)
3. Set up directory structure as documented (no `services/` directory)

## Workspace Configuration

### Root package.json

```json
{
  "name": "bob",
  "private": true,
  "packageManager": "bun@1.2.19",
  "workspaces": ["apps/*", "packages/*", "packages/config/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "lint:fix": "turbo lint:fix",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "db:generate": "bun --cwd apps/api db:generate",
    "db:migrate": "bun --cwd apps/api db:migrate",
    "db:push": "bun --cwd apps/api db:push",
    "db:studio": "bun --cwd apps/api db:studio"
  },
  "devDependencies": {
    "prettier": "^3.4.0",
    "turbo": "^2.5.0"
  }
}
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start all dev servers (API + App) |
| `bunx turbo build` | Build all packages |
| `bun lint` | Run ESLint across all packages |
| `bun lint:fix` | Auto-fix ESLint issues |
| `bun test` | Run tests |
| `bun typecheck` | TypeScript type checking |
| `bun db:generate` | Generate Drizzle migrations |
| `bun db:migrate` | Run database migrations |
| `bun db:push` | Push schema changes directly |
| `bun db:studio` | Open Drizzle Studio UI |

## Applications

### API (`apps/api/`)

**Package Name**: `@bob/api`

Hono web server running on port 3001.

**Directory Structure**:
```
apps/api/src/
├── index.ts              # Entry point
├── env.ts                # Environment validation
├── auth.ts               # BetterAuth configuration
├── db/
│   ├── index.ts          # Database connection
│   ├── schema.ts         # Drizzle schemas
│   └── repositories/     # Data access layer
├── routes/               # API endpoints
├── middleware/           # Route middleware
└── use-cases/            # Business logic
```

**Note**: Do NOT create a `services/` directory. External service integrations go in use-cases or dedicated modules as needed.

**Key Dependencies**:
- Hono (web framework)
- Drizzle ORM (database)
- BetterAuth (authentication)
- Zod (validation)

### Frontend App (`apps/app/`)

**Package Name**: `@bob/app`

React Router v7 SSR application on port 5173.

**Directory Structure**:
```
apps/app/
├── app/
│   ├── routes/           # File-based routing
│   ├── components/       # React components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   └── app.css           # Global styles (keep default)
├── vite.config.ts        # Vite configuration
├── components.json       # shadcn/ui configuration
└── eslint.config.ts      # ESLint configuration (TypeScript)
```

**Key Dependencies**:
- React 19
- React Router v7 (SSR enabled)
- TanStack React Query
- Tailwind CSS
- Radix UI + shadcn/ui

## Shared Packages

### Schema (`@bob/schema`)

Centralized type-safe schemas shared between frontend and backend. Contains Drizzle ORM table definitions for the database and Zod schemas for runtime validation of API requests and responses.

### UI (`@bob/ui`)

**Shared UI component library and shadcn/ui installation target.** All shadcn components are installed to this package, not to individual apps.

**Directory Structure**:
```
packages/ui/
├── src/
│   ├── index.ts          # Exports cn utility
│   ├── utils.ts          # cn function (clsx + tailwind-merge)
│   └── components/       # shadcn/ui components go here
├── package.json
└── tsconfig.json
```

**shadcn Configuration** (components.json in apps/app):
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/app.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "~/components",
    "utils": "~/lib/utils",
    "ui": "~/components/ui",
    "lib": "~/lib",
    "hooks": "~/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Usage from apps**:
```typescript
// Import shared components
import { Button } from "@bob/ui/components/button";
import { Card } from "@bob/ui/components/card";

// Import cn utility
import { cn } from "@bob/ui";
```

**Key Points**:
- Uses `new-york` style (shadcn's refined variant)
- CSS variables enabled for theming
- Lucide icons as the icon library
- Components export via `@bob/ui/components/*` pattern
- The `cn` utility combines `clsx` and `tailwind-merge`

### Email (`@bob/email`)

Transactional email templates built with React Email. Generates email-safe HTML and plain text for password resets, email verification, account changes, and organization invitations. Used by the API to send emails via Postmark.

### Utils (`@bob/utils`)

Shared utility functions for both frontend and backend. Includes ID generation (nanoid-based with various formats), a pre-configured Pino logger with sensitive field redaction, and utility helpers.

### Configuration Packages

#### TypeScript Config (`@bob/typescript-config`)

Shared TypeScript configurations. Provides a base config for Node/backend code and a React-specific config that extends the base with JSX and DOM support.

#### Tailwind Config (`@bob/tailwind-config`)

Minimal shared Tailwind CSS configuration. **Keep this default** - do not add custom themes, color systems, or animations. Custom theming should be added per-app only when explicitly needed.

#### ESLint Config (`@bob/eslint-config`)

Shared ESLint configurations written in **TypeScript** (not JavaScript).

**CRITICAL**: You MUST use the exact ESLint configuration template from `references/eslint-setup.md`. Do not create your own ESLint config - copy the template exactly. This includes:
- The exact plugins (prettier, simple-import-sort, unused-imports, import)
- The exact rules configuration
- The exact import sort groups
- TypeScript files only (`.ts`, never `.js`)

## Turborepo Configuration

**turbo.json**:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".react-router/**", "!.react-router/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "lint:fix": {
      "dependsOn": ["^build"],
      "cache": false
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Key Concepts**:
- `^build` means dependencies must build first
- `cache: false` for dev servers (no caching)
- `persistent: true` for long-running tasks
- Build outputs cached in `.turbo/`

## Adding New Packages

### Adding a New App

1. Use official create commands when available (see "Creating New Apps" section)
2. Update `package.json` with name `@bob/[app-name]` and `"type": "module"`
3. Extend shared configs:
   ```json
   {
     "extends": "@bob/typescript-config/base.json"
   }
   ```
4. Add scripts: `dev`, `build`, `typecheck`, `lint`, `lint:fix`
5. Create `eslint.config.ts` (**TypeScript**, not `.js`) - see `references/eslint-setup.md` for the exact template with `tsconfigRootDir`

### Adding a New Shared Package

1. Create directory: `packages/[package-name]/`
2. Add `package.json`:
   ```json
   {
     "name": "@bob/[package-name]",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "exports": {
       ".": "./src/index.ts"
     },
     "scripts": {
       "typecheck": "tsc --noEmit",
       "lint": "eslint .",
       "lint:fix": "eslint . --fix"
     }
   }
   ```
3. Create `eslint.config.ts` (**TypeScript**, not `.js`) - see `references/eslint-setup.md` for the exact template with `tsconfigRootDir`
4. Reference from apps: `"@bob/[package-name]": "workspace:*"`

## Package Dependencies

```
@bob/app
  └── @bob/schema (db, validators)
  └── @bob/ui (components)
  └── @bob/utils (utilities)
  └── @bob/typescript-config/react
  └── @bob/tailwind-config
  └── @bob/eslint-config/react

@bob/api
  └── @bob/schema (db, validators)
  └── @bob/email (email templates)
  └── @bob/utils (utilities, logger)
  └── @bob/typescript-config/base
  └── @bob/eslint-config
```

## Environment Setup

### Source of Truth

**Always check `docs/specs/environment.txt`** for environment variable values. This file contains the actual credentials and connection details for local development. Do not make up values when this file exists.

### Creating Environment Files

Create **both** `.env` and `.env.example` files:

| File | Purpose | Values |
|------|---------|--------|
| `.env` | Local development (gitignored) | Real working values from `environment.txt` |
| `.env.example` | Documentation (committed) | Placeholder values showing format |

**Example `.env`** (with values from environment.txt):
```bash
DATABASE_URL="postgres://postgres:secret@localhost:5433/myapp_dev"
BETTER_AUTH_SECRET="generated-secret-here"
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

**Example `.env.example`** (committed to repo):
```bash
DATABASE_URL="postgres://user:password@localhost:5432/dbname"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### Generating Secrets

For any secret, key, or token not in `environment.txt`, generate a secure value:

```bash
# Generate 32-byte base64 secret (recommended for most secrets)
openssl rand -base64 32

# Generate 64-byte hex secret (for longer secrets)
openssl rand -hex 32
```

**Common secrets to generate:**
- `BETTER_AUTH_SECRET` - Required for BetterAuth session encryption
- `JWT_SECRET` - If using custom JWT signing
- `ENCRYPTION_KEY` - For data encryption

### Environment Validation with Zod

**Always validate environment variables** using Zod in `apps/api/src/env.ts`. This catches missing or invalid values at startup rather than runtime.

**Pattern for `env.ts`:**

```typescript
import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(32),

  // Optional with defaults
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),

  // API Keys (optional in dev, required in prod)
  POSTMARK_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

**Usage in application:**
```typescript
import { env } from "./env";

// Type-safe access
const dbUrl = env.DATABASE_URL;
const port = env.PORT; // number, with default applied
```

### Testing Environment Configuration

After setting up environment files, verify the configuration:

```bash
# 1. Check env.ts validates successfully (app should start)
cd apps/api && bun run dev

# 2. Verify database connection
bun run db:studio

# 3. Check all required vars are set
bun -e "import './src/env'"
```

**Common issues:**
- Missing required variable → Add to `.env` from `environment.txt`
- Invalid format (e.g., URL) → Check value matches expected format
- Port already in use → Check `environment.txt` for correct port (often 5433, not 5432)

### Sensible Defaults by Variable Type

| Variable Type | Default/Pattern | Example |
|--------------|-----------------|---------|
| Database URL | From environment.txt | `postgres://postgres:secret@localhost:5433/app` |
| API Port | 3001 for API, 5173 for frontend | `PORT=3001` |
| Node env | `development` | `NODE_ENV=development` |
| Auth secrets | Generate with openssl | `openssl rand -base64 32` |
| API base URLs | localhost with port | `API_URL=http://localhost:3001` |
| External API keys | From environment.txt or user provides | Check docs/specs/environment.txt |

## Additional Resources

### Reference Files

- **`references/eslint-setup.md`** - ESLint configuration template. **MUST be copied exactly** - do not write your own ESLint config.

**CRITICAL**: Reference files contain exact templates that must be used verbatim. Do not improvise, simplify, or "improve" them.
