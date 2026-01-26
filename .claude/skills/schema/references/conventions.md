# Schema Conventions

## Overview
This directory contains all database schema definitions using Drizzle ORM. These schemas are the single source of truth for the database structure and are used to generate TypeScript types and Zod validation schemas.

## File Structure
```
schema/
├── [model].schema.ts           # Individual model schemas
├── db-schema.ts                # Main database connection and exports
├── auth-db-schema.ts           # BetterAuth generated schemas
└── index.ts                    # Public API exports (barrel file)
```

## File Naming Convention
- **Pattern**: `[model-name].schema.ts` (kebab-case)
- **Examples**:
  - `tag.schema.ts`
  - `project.schema.ts`
  - `project-link.schema.ts`
  - `custom-domain.schema.ts`

## Schema Definition Pattern

### 1. Basic Table Structure
```typescript
import { boolean, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { createIdField } from '../lib/create-id-field'
import { member } from './auth-db-schema'  // Import related tables

// Define the database table
export const model = pgTable('model_name', {
    // Primary key - always use createIdField
    id: createIdField('id').primaryKey(),

    // Foreign keys - with cascade delete
    memberId: createIdField('member_id')
        .notNull()
        .references(() => member.id, { onDelete: 'cascade' }),

    // Required fields
    name: varchar('name', { length: 100 }).notNull(),

    // Optional fields
    description: varchar('description', { length: 500 }),

    // Boolean fields with defaults
    isActive: boolean('is_active').notNull().default(true),

    // Timestamps - always include both
    createdAt: timestamp('created_at')
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: timestamp('updated_at')
        .$defaultFn(() => new Date())
        .notNull(),
})
```

### 2. Custom Validation
Define custom validators for fields that need extra validation:
```typescript
// Custom validators for specific field types
const colorSchema = z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, 'Color must be a valid hex color')

const slugSchema = z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

const emailSchema = z
    .string()
    .email('Invalid email address')
```

### 3. Schema Derivation
Derive Zod schemas from the database table:

**CRITICAL: Never redefine field schemas. Always extend/derive from the database schema.**

```typescript
import { preprocessDate } from 'src/lib/pre-process-date'

// Base insert schema with custom validation and date preprocessing
export const insertModelSchema = createInsertSchema(model, {
    // ONLY extend validation for complex rules (e.g., regex patterns)
    color: (schema) => schema.and(colorSchema),  // Extending, not redefining
    slug: (schema) => schema.and(slugSchema),    // Adding validation to existing
    ...preprocessDate,  // Handles date string conversion for all timestamp fields
})

// Base select schema with custom validation and date preprocessing
export const selectModelSchema = createSelectSchema(model, {
    // Apply same custom validation to select schema
    color: (schema) => schema.and(colorSchema),
    slug: (schema) => schema.and(slugSchema),
    ...preprocessDate,  // Handles date string conversion for all timestamp fields
})

// WRONG - Never manually redefine what's already in the database
export const wrongSchema = z.object({
    id: z.string(),          // Don't redefine!
    name: z.string(),        // The DB already defines this!
    color: z.string(),       // Use createInsertSchema/createSelectSchema!
})

// CORRECT - Always derive from database schema
export const correctSchema = insertModelSchema.pick({ /* fields */ })

// Type exports from schemas
export type InsertModelSchema = typeof insertModelSchema
export type SelectModelSchema = typeof selectModelSchema

// Database row type
export type Model = typeof model.$inferSelect
```

### 4. Endpoint-Specific Schemas
**CRITICAL PRINCIPLE: NEVER CREATE CRUD SCHEMAS PREEMPTIVELY**

Create endpoint-specific schemas **ONLY when implementing the actual API endpoint**. Each schema should be named to directly tie to the specific route/use-case for easy recognition.

**Key Principles:**
- Always derive from insertModelSchema or selectModelSchema, never create new z.object() definitions
- Name schemas after their specific endpoint/use-case (e.g., `listProjectsSchema`, `createProjectSchema`, `updateProjectProfileSchema`)
- Only create schemas when you're actively implementing the endpoint that uses them
- Remove schemas if their corresponding endpoint is removed

**Naming Convention Examples:**
- `POST /api/projects` -> `createProjectSchema`
- `GET /api/projects` -> `listProjectsSchema` (if different from base)
- `PATCH /api/projects/:id` -> `updateProjectSchema`
- `GET /api/projects/:id` -> Usually just use `selectProjectSchema` directly
- `PATCH /api/profile` -> `updateUserProfileSchema` (specific use case)
- `POST /api/organizations/:id/invite` -> `inviteOrganizationMemberSchema`

```typescript
// WRONG - Don't create generic CRUD schemas preemptively
export const getProjectSchema = selectProjectSchema  // Redundant!
export const createProjectSchema = insertProjectSchema.pick({ /* ... */ })  // Not implemented yet!
export const updateProjectSchema = insertProjectSchema.partial().pick({ /* ... */ })  // No endpoint exists!

// CORRECT - Only create when implementing actual endpoints
// Only add these when you're actively building the corresponding API route:

// For POST /api/projects endpoint (only when implementing this route)
export const createProjectSchema = insertProjectSchema.pick({
    name: true,
    description: true,
    color: true,
    // Don't include: id, organizationId, timestamps
})
export type CreateProject = z.infer<typeof createProjectSchema>

// For PATCH /api/projects/:id endpoint (only when implementing this route)
export const updateProjectSchema = insertProjectSchema.partial().pick({
    name: true,
    description: true,
    color: true,
    isActive: true,
    // Don't include: id, organizationId, createdAt
})
export type UpdateProject = z.infer<typeof updateProjectSchema>
```

**Schema Lifecycle:**
1. Start with ONLY base schemas: `insertModelSchema` and `selectModelSchema`
2. When implementing an API endpoint, create the specific schema needed
3. Name it clearly after the endpoint/use-case it serves
4. If the endpoint is removed, remove the schema too

### 5. Extended Schemas
For specialized use cases with computed fields:
```typescript
// Schema with additional computed fields (extend from selectModelSchema)
export const modelWithStatsSchema = selectModelSchema.extend({
    usageCount: z.number().int().min(0),      // New computed field
    lastUsedAt: z.date().nullable(),          // New computed field
})
export type ModelWithStats = z.infer<typeof modelWithStatsSchema>

// Query parameter schemas (exception: can be new z.object for non-model data)
export const listModelsFiltersSchema = z.object({
    includeInactive: stringToBoolean.optional().default(false),
    search: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional().default(50),
    offset: z.number().int().min(0).optional().default(0),
})
export type ListModelsFilters = z.infer<typeof listModelsFiltersSchema>

// When composing schemas from multiple models, still derive:
export const modelWithRelationsSchema = selectModelSchema.merge(
    selectRelatedSchema.pick({ relatedField: true })
)
```

## Field Conventions

### IDs
- Always use `createIdField()` helper for ID fields
- Primary keys: `id: createIdField('id').primaryKey()`
- Foreign keys: `[model]Id: createIdField('[model]_id')`

### Timestamps
- Always include both `createdAt` and `updatedAt`
- Use `.$defaultFn(() => new Date())` for default values
- Both should be `.notNull()`

### Date Field Preprocessing (IMPORTANT)
**All schemas with date/timestamp fields MUST use date preprocessing to handle API responses:**

```typescript
import { preprocessDate, preprocessDateString } from '../lib/pre-process-date'

// For standard schemas with createdAt and updatedAt
export const selectModelSchema = createSelectSchema(model, {
    // ... other field validations
    ...preprocessDate,  // Handles createdAt and updatedAt ONLY
})

// For schemas with custom date fields
export const selectModelSchema = createSelectSchema(model, {
    // ... other field validations
    ...preprocessDate,  // Handles createdAt and updatedAt
    startDate: preprocessDateString,  // Custom date field
    endDate: preprocessDateString,    // Custom date field
    lastLoginAt: preprocessDateString, // Custom date field
})
```

**Why this is necessary:**
- When JSON is sent from the API, Date objects are serialized as ISO strings
- The frontend receives strings like `"2024-01-01T00:00:00.000Z"` instead of Date objects
- Without preprocessing, Zod validation will fail because it expects Date objects
- The preprocessing utilities automatically convert these strings back to Date objects

**Two utilities available:**
1. **`...preprocessDate`** - An object spread that handles ONLY the default timestamps:
   - `createdAt`
   - `updatedAt`

2. **`preprocessDateString`** - A function to handle any custom date field:
   - Use for any date/timestamp field other than createdAt/updatedAt
   - Apply it directly to the field in the schema refinements

**Apply preprocessing to:**
- All `selectSchema` definitions (for API responses)
- All `insertSchema` definitions (for consistency)
- Any schema that extends from these base schemas will inherit the preprocessing

### Strings
- Use `varchar` with explicit length limits
- Common lengths:
  - Names: 100-255
  - Descriptions: 500-1000
  - Slugs: 50-100
  - Colors: 7 (for hex)

### Relations
- Always specify `onDelete` behavior
- Use `'cascade'` for dependent data
- Use `'set null'` for optional relations
- Use `'restrict'` to prevent deletion

## Index File (index.ts)
Use barrel exports to re-export everything:
```typescript
// Re-export all schemas
export * from './schema/model.schema'
export * from './schema/another-model.schema'
export * from './schema/project.schema'
// ... etc

// Export database connection if needed
export { db } from './schema/db-schema'
```

## Relationships

### One-to-Many
```typescript
// Parent table
export const organization = pgTable('organization', {
    id: createIdField('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
})

// Child table with foreign key
export const member = pgTable('member', {
    id: createIdField('id').primaryKey(),
    organizationId: text('organization_id')
        .notNull()
        .references(() => organization.id, { onDelete: 'cascade' }),
})
```

### Many-to-Many
```typescript
// Junction table
export const projectTag = pgTable('project_tag', {
    id: createIdField('id').primaryKey(),
    projectId: createIdField('project_id')
        .notNull()
        .references(() => project.id, { onDelete: 'cascade' }),
    tagId: createIdField('tag_id')
        .notNull()
        .references(() => tag.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at')
        .$defaultFn(() => new Date())
        .notNull(),
})
```

## Migration Considerations
- Field renames require migration scripts
- Adding nullable fields is safe
- Adding non-nullable fields requires default values
- Removing fields requires careful migration planning

## Best Practices

### Do's
- Always derive schemas from database tables
- Use custom validators for business rules
- Export both types and schemas
- **Create endpoint-specific schemas ONLY when implementing the actual API endpoint**
- Name endpoint schemas clearly after their use-case/route
- Keep endpoint schemas focused (pick only needed fields)
- Use consistent field naming (camelCase in code, snake_case in DB)
- Include proper indexes for foreign keys
- Document complex business rules in comments

### Don'ts
- **Don't ever redefine field schemas** - always derive from database schemas
- **Don't create CRUD schemas preemptively** - only when implementing actual endpoints
- Don't create generic schemas like `getModelSchema` that just alias `selectModelSchema`
- Don't create new `z.object()` for model data - use `pick()`, `omit()`, `extend()`, `merge()`
- Don't include system fields in create schemas (id, timestamps)
- Don't forget cascade behavior on foreign keys
- Don't use `any` type - always define proper types
- Don't skip validation - always use schemas
- Don't mix database logic with validation logic

**The Golden Rule**: If a field exists in the database, it should NEVER be redefined. The only exception is extending validation (like adding regex to a string field) using the pattern `(schema) => schema.and(customValidator)`.

## Schema vs Validation Split

### What Goes Here (packages/schema)
- Database table definitions
- Base insert/select schemas
- CRUD operation schemas (create, update, get)
- Extended schemas with computed fields
- Types that need to be shared with frontend
- Query filter schemas that frontend uses

### What Goes in API Validation (apps/api/src/validation)
- Route parameter schemas
- API-specific validation logic
- Complex business rule validation
- One-off parameter schemas
- Validation that combines multiple entities
