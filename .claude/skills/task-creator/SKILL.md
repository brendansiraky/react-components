---
name: task-creator
description: This skill should be used when the user asks to "create a task list", "break down this PRD", "generate tasks from this TDD", "split this into tasks", "create implementation tasks", or needs to convert a product requirements document, technical design document, or feature description into an actionable task list.
---

# Task Creator

Generate structured task lists from PRDs, TDDs, or feature descriptions. Features have user-facing acceptance criteria, and each task has a clear description that an LLM agent can execute.

## Task Format

Each task is a YAML list item:

```yaml
- code: PRD-001-US-001-T001
  title: Task title
  description: Brief description of what needs to be done.
  status: pending
  skills: [skill-name, another-skill]
  testing: bun-testing
```

### Task Code Format

Each task has a unique code derived from its PRD and user story:

| Component | Format | Example |
|-----------|--------|---------|
| PRD code | `PRD-XXX` | `PRD-001` |
| User story | `PRD-XXX-US-YYY` | `PRD-001-US-001` |
| Task code | `PRD-XXX-US-YYY-TZZZ` | `PRD-001-US-001-T001` |

- `XXX` = 3-digit PRD number (from source document's `Code:` field)
- `YYY` = 3-digit user story number within that PRD
- `ZZZ` = 3-digit task number within that user story

Tasks are numbered sequentially within each user story (T001, T002, T003...).

### Other Fields

Status values: `pending` or `completed`.
Skills: List of skill names that help implement this task (see "Assigning Skills to Tasks" section).
Testing: The testing skill to use for verifying the task (see "Assigning Testing Skills" section).

## Feature Format

Each feature has a code and acceptance criterion describing the user-facing outcome:

```yaml
- code: PRD-001-US-001
  name: "Guest creates first website"
  acceptance: What the user can do when this feature is complete.
  tasks:
    - code: PRD-001-US-001-T001
      title: First task
      description: What needs to be done.
      status: pending
      skills: [skill-name]
      testing: bun-testing
```

The feature code is derived from the PRD code and user story number from the source document.

Acceptance criteria should be written from a non-technical user's perspective - what they can see or do, not how it's implemented.

## Rules for Creating Tasks

### Tasks Should Be Small

A task should be completable in roughly 5-15 minutes of focused work. Split large tasks.

**Heuristics:**
- One component = one task
- One API endpoint = one task
- One auth provider = one task
- One user story = 2-5 tasks typically

### Order Tasks by Dependency

Earlier tasks must not depend on later tasks. Work flows top-to-bottom.

**Correct order:**
1. Create database schema
2. Create repository functions
3. Create API endpoint
4. Create frontend component

### Start with Scaffolding

First tasks set up structure (folders, configs, packages) before feature work.

### Environment Setup Tasks

When a task requires environment variables, **always create actual `.env` files with working values, not just `.env.example`**. The description should:

1. **Reference the environment spec**: Direct the implementor to `docs/specs/environment.txt` for credential values
2. **Create both files**: Update `.env.example` (documentation with placeholders) AND `.env` (working local values)
3. **Generate secrets**: Use `openssl rand -base64 32` for any secret/key values not in environment.txt
4. **Add Zod validation**: Create/update `env.ts` to validate all environment variables

**Always assign the `monorepo` skill** to environment setup tasks - it contains detailed guidance for env file setup, secret generation, and Zod validation patterns.

**Example description:**
> Configure environment variables for database and auth. Reference `docs/specs/environment.txt` for connection values. Create `.env` with working values and `.env.example` with placeholders. Generate BETTER_AUTH_SECRET using openssl. Add Zod validation in `env.ts` for all new variables.

### Structuring Features

**Features = user stories, deliverables, or major milestones.** Each feature represents a coherent unit of work that could be reviewed or deployed independently.

**What makes a feature:**
- A user story (US-001, US-002)
- A major deliverable
- A significant milestone in the project

**Feature granularity:**
- Aim for 2-6 tasks per feature
- A feature with 1 task should be merged with another
- A feature with 7+ tasks should be split
- Each feature name should clearly indicate its purpose

**Feature ordering:**
- Infrastructure and setup features come first
- Core functionality before enhancements
- Dependencies flow top-to-bottom (earlier features don't depend on later ones)

## Process

### Step 1: Identify Features

Scan the input document for natural features or sections:
- Setup/infrastructure
- Core features
- Integration points
- Polish/verification

### Step 2: Break Down Each Feature

For each feature, identify discrete units of work:
- Each file or module that needs creation
- Each configuration that needs setup
- Each integration point

### Step 3: Write Features and Tasks

For each feature, write a user-facing acceptance criterion. Then break it into tasks:
- Title is action-oriented (verb first)
- Description explains what and why briefly

### Step 4: Order and Review

Reorder tasks so dependencies flow correctly. Review for:
- No task depends on a later task
- Scaffolding comes first
- Each feature acceptance describes what the user can do

## Example

**Input:** PRD `docs/specs/prd-002-user-auth.md` (Code: PRD-002) with user stories US-001 (Registration) and US-002 (Google OAuth)

**Output:**

```yaml
name: "User Authentication"
source:
  document: "docs/specs/prd-002-user-auth.md"
  code: PRD-002
features:
  - code: PRD-002-US-001
    name: "User Registration"
    acceptance: User can create an account with their email and password.
    tasks:
      - code: PRD-002-US-001-T001
        title: Create registration form component
        description: Build the signup form with email and password fields.
        status: pending
        skills: [react-components, ui-forms, styling]
        testing: vitest-testing

      - code: PRD-002-US-001-T002
        title: Add registration API endpoint
        description: Create POST /api/auth/register endpoint.
        status: pending
        skills: [hono-routing, use-case, better-auth]
        testing: bun-testing

      - code: PRD-002-US-001-T003
        title: Connect form to API
        description: Wire up form submission to call the registration endpoint.
        status: pending
        skills: [tanstack-query-hooks, ui-forms]
        testing: vitest-testing

  - code: PRD-002-US-002
    name: "Google OAuth Login"
    acceptance: User can sign in using their Google account.
    tasks:
      - code: PRD-002-US-002-T001
        title: Configure Google OAuth environment variables
        description: Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.example with placeholders. Check docs/specs/environment.txt for credentials or note that user must create a Google OAuth app. Add Zod validation in env.ts.
        status: pending
        skills: [monorepo, better-auth]
        testing: bun-testing

      - code: PRD-002-US-002-T002
        title: Configure Google OAuth provider
        description: Add Google as a social login provider in the auth configuration.
        status: pending
        skills: [better-auth]
        testing: bun-testing

      - code: PRD-002-US-002-T003
        title: Create Google OAuth login button
        description: Add "Continue with Google" button to the login page.
        status: pending
        skills: [react-components, better-auth, styling]
        testing: vitest-testing
```

## Output Structure

When generating a task list, output a YAML document that strictly follows this template:

```yaml
name: "Project or feature name"
source:
  document: "path/to/document.md"
  code: PRD-001
features:
  - code: PRD-001-US-001
    name: "First User Story"
    acceptance: What the user can do when this feature is complete.
    tasks:
      - code: PRD-001-US-001-T001
        title: First task
        description: What needs to be done.
        status: pending
        skills: [skill-name]
        testing: bun-testing

      - code: PRD-001-US-001-T002
        title: Second task
        description: What needs to be done.
        status: pending
        skills: [skill-name, another-skill]
        testing: vitest-testing

  - code: PRD-001-US-002
    name: "Second User Story"
    acceptance: What the user can do when this feature is complete.
    tasks:
      - code: PRD-001-US-002-T001
        title: Third task
        description: What needs to be done.
        status: pending
        skills: [skill-name]
        testing: e2e-testing
```

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Project or feature name | `"User Authentication"` |
| `source.document` | Path to source document | `"docs/specs/prd-001.md"` |
| `source.code` | PRD code from source document | `"PRD-001"` |
| `features` | List of features (user stories/deliverables) | See template |
| `features[].code` | User story code | `"PRD-001-US-001"` |
| `features[].name` | User story or deliverable name | `"User Registration"` |
| `features[].acceptance` | User-facing outcome when feature is complete | `"User can create an account"` |
| `features[].tasks` | List of tasks in the feature | See template |

### Task Fields

| Field | Description | Required |
|-------|-------------|----------|
| `code` | Unique task identifier (e.g., `PRD-001-US-001-T001`) | Yes |
| `title` | Action-oriented task name | Yes |
| `description` | Brief explanation of what and why | Yes |
| `status` | `pending` or `completed` | Yes |
| `skills` | List of skills that help implement this task | Yes |
| `testing` | Testing skill for verifying this task (see "Assigning Testing Skills" section) | Yes |

**This template format must be strictly followed.** Do not deviate from the structure or omit required fields.

## Assigning Skills to Tasks

Each task must include a `skills` array listing the skills that will help implement it. Analyze the task's requirements and assign relevant skills from the available list.

### Available Skills

#### Database & Data Layer
| Skill | Use When Task Involves |
|-------|------------------------|
| `schema` | Creating database tables, Drizzle schemas, Zod validation, foreign keys, insert/select schemas, relationships |
| `repository` | Database queries, CRUD operations, Drizzle queries, find by ID/slug, bulk updates, joins, transactions |
| `use-case` | Business logic, orchestrating repositories, UseCaseResult pattern, safeParse validation, authorization checks |

#### API Layer
| Skill | Use When Task Involves |
|-------|------------------------|
| `hono-routing` | API endpoints, route handlers, request/response validation, REST endpoints, param schemas |
| `hono-middleware` | Auth middleware, permission checks, context binding, rate limiting, AuthContext extension |
| `better-auth` | Authentication, login, signup, OAuth (Google/GitHub), sessions, organizations, roles, API keys, 2FA, magic links |

#### Frontend Components
| Skill | Use When Task Involves |
|-------|------------------------|
| `react-components` | React components, props patterns, layouts, component interfaces, slot props, render props, shadcn components |
| `frontend-designer` | UI design decisions, visual consistency, design tokens, spacing, colors, typography, matching shadcn style |
| `ui-forms` | Forms, form validation, react-hook-form, FormField, zodResolver, form submission, FormMessage errors |
| `ui-dialog` | Modals, dialogs, popups, confirmation dialogs, AlertDialog, dialog with dropdown, useModalInDropdown |
| `styling` | CVA variants, Tailwind CSS, className patterns, component variants |
| `writing-loading-states` | Loading indicators, skeletons, empty states, error states, isLoading patterns |

#### Data Fetching
| Skill | Use When Task Involves |
|-------|------------------------|
| `tanstack-query-hooks` | React Query hooks, useQuery, useMutation, query invalidation, CRUD hooks, data fetching patterns |

#### Infrastructure & Services
| Skill | Use When Task Involves |
|-------|------------------------|
| `email` | Email templates, transactional emails, React Email, Postmark, EmailLayout, password reset emails |
| `monorepo` | Workspace setup, new packages/apps, Turborepo configuration, shared dependencies, **environment variables setup (.env files, env.ts validation, secret generation)** |

### Skill Assignment Rules

1. **Match task type to skills**: Analyze what the task creates or modifies
2. **Include all relevant skills**: A form component task might need `react-components`, `writing-forms`, and `styling`
3. **Order by relevance**: List the most relevant skill first
4. **Minimum one skill**: Every task must have at least one skill assigned

### Examples

**Database table task:**
```yaml
- code: PRD-003-US-001-T001
  title: Create websites table schema
  description: Define the websites table with url, name, and userId fields.
  status: pending
  skills: [schema]
  testing: bun-testing
```

**Full-stack feature task:**
```yaml
- code: PRD-003-US-002-T001
  title: Create website form component
  description: Build form for adding new websites with URL and name fields.
  status: pending
  skills: [react-components, ui-forms, styling]
  testing: vitest-testing
```

**API endpoint task:**
```yaml
- code: PRD-003-US-002-T002
  title: Add POST /api/websites endpoint
  description: Create endpoint to save new websites to the database.
  status: pending
  skills: [hono-routing, use-case, repository]
  testing: bun-testing
```

**Data fetching task:**
```yaml
- code: PRD-003-US-003-T001
  title: Create useWebsites hook
  description: Add React Query hook to fetch user's websites.
  status: pending
  skills: [tanstack-query-hooks]
  testing: vitest-testing
```

**Auth feature task:**
```yaml
- code: PRD-002-US-002-T003
  title: Add Google OAuth login button
  description: Add "Continue with Google" button to login page.
  status: pending
  skills: [react-components, better-auth, styling]
  testing: vitest-testing
```

**Environment setup task:**
```yaml
- code: PRD-001-US-001-T001
  title: Configure environment variables
  description: Set up environment variables for database and auth. Reference docs/specs/environment.txt for PostgreSQL connection values. Create .env with working values and .env.example with placeholders. Generate BETTER_AUTH_SECRET using openssl. Add Zod validation in apps/api/src/env.ts.
  status: pending
  skills: [monorepo]
  testing: bun-testing
```

## Assigning Testing Skills

Each task must include a `testing` field specifying which testing skill to use for verification. Choose the appropriate testing skill based on what the task creates or modifies.

### Available Testing Skills

| Skill | Use When Task Involves |
|-------|------------------------|
| `bun-testing` | Non-UI code: utilities, business logic, API routes, use cases, repositories, data transformations, validation, formatters, parsers |
| `vitest-testing` | React components: rendering, user interactions, state changes, custom hooks, UI logic with conditional rendering |
| `e2e-testing` | Complete user flows: authentication flows, critical user journeys (checkout, onboarding), cross-page interactions, visual verification |

### Testing Skill Selection Rules

1. **Match task output to testing type**:
   - API endpoint → `bun-testing`
   - React component → `vitest-testing`
   - User flow spanning multiple pages → `e2e-testing`

2. **Prefer unit tests when possible**: Use `bun-testing` or `vitest-testing` over `e2e-testing` when the task can be verified in isolation

3. **Use E2E sparingly**: Reserve `e2e-testing` for critical user journeys and cross-page flows

### Testing Skill Examples

**Database/API task:**
```yaml
- code: PRD-003-US-001-T001
  title: Create websites table schema
  description: Define the websites table with url, name, and userId fields.
  status: pending
  skills: [schema]
  testing: bun-testing
```

**React component task:**
```yaml
- code: PRD-003-US-002-T001
  title: Create website form component
  description: Build form for adding new websites with URL and name fields.
  status: pending
  skills: [react-components, ui-forms, styling]
  testing: vitest-testing
```

**User flow task:**
```yaml
- code: PRD-002-US-001-T004
  title: Verify complete registration flow
  description: Test end-to-end user registration from form to dashboard.
  status: pending
  skills: [e2e-testing]
  testing: e2e-testing
```

**Utility function task:**
```yaml
- code: PRD-004-US-001-T001
  title: Create URL validation utility
  description: Add function to validate and normalize website URLs.
  status: pending
  skills: []
  testing: bun-testing
```

**Custom hook task:**
```yaml
- code: PRD-003-US-003-T001
  title: Create useWebsites hook
  description: Add React Query hook to fetch user's websites.
  status: pending
  skills: [tanstack-query-hooks]
  testing: vitest-testing
```
