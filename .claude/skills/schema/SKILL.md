---
name: schema
description: This skill should be used when the user asks to "create a database table", "add a schema field", "define Zod validation", "create insert schema", "create select schema", "add foreign key", "define relationships", "add timestamps", "create junction table", "derive schemas from database", "extend validation schema", or needs guidance on Drizzle ORM schemas, Zod type definitions, and database modeling in packages/schema/.
---

# Schema

This skill provides conventions for database schema definitions using Drizzle ORM and Zod validation in `packages/schema/`.

## When to Use This Skill

Use this skill when:
- Creating new database tables with Drizzle ORM
- Defining Zod validation schemas derived from database tables
- Adding relationships between tables (one-to-many, many-to-many)
- Creating endpoint-specific schemas for API operations

## Quick Reference

### File Structure
```
packages/schema/src/
├── db/           # Database table definitions
├── validators/   # Zod validation schemas
└── index.ts      # Barrel exports
```

### File Naming
- Database tables: `[model-name].ts` in `db/`
- Validators: `[model-name].ts` in `validators/`

### Critical Rules

1. **Always include `createdAt` and `updatedAt`** timestamps on tables
2. **Always specify `onDelete` behavior** on foreign keys
3. **Derive validation schemas from database tables** when using drizzle-zod
4. **Never redefine field schemas manually** - use `pick()`, `omit()`, `extend()`
5. **Create endpoint-specific schemas only when implementing the endpoint**
6. **Name schemas after their endpoint** (e.g., `createProjectSchema` for `POST /api/projects`)

### Basic Table Structure
```typescript
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const model = pgTable('model_name', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    // Foreign key with cascade delete
    parentId: text('parent_id')
        .notNull()
        .references(() => parent.id, { onDelete: 'cascade' }),
    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

### Validation Schema Pattern
```typescript
import { z } from 'zod'

// Create schema - pick only user-provided fields
export const createModelSchema = z.object({
    name: z.string().min(1).max(100),
    // Don't include: id, timestamps, system fields
})

// Update schema - make fields optional
export const updateModelSchema = createModelSchema.partial()

// Type exports
export type CreateModelInput = z.infer<typeof createModelSchema>
export type UpdateModelInput = z.infer<typeof updateModelSchema>
```

### Endpoint Schema Naming Convention
| Endpoint | Schema Name |
|----------|-------------|
| `POST /api/projects` | `createProjectSchema` |
| `PATCH /api/projects/:id` | `updateProjectSchema` |
| `GET /api/projects` (with filters) | `listProjectsSchema` |

## Additional Resources

### Reference Files

For detailed patterns and comprehensive guidelines, consult:
- **`references/conventions.md`** - Complete schema conventions

Search patterns for the reference file:
- `grep "Relationship"` - One-to-many and many-to-many patterns
- `grep "Extended Schemas"` - Computed fields and query parameters
- `grep "Best Practices"` - Do's and don'ts
- `grep "Date Field"` - Date preprocessing patterns
