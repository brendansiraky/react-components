---
name: prd
description: This skill should be used when the user asks to "create a PRD", "write a PRD", "product requirements document", "write requirements", "spec out a feature", "document product requirements", "create a product spec", "write user stories", "define acceptance criteria", "plan a feature", or needs guidance on structuring product requirements, user stories, acceptance criteria, or functional requirements.
version: 0.2.0
---

# PRD (Product Requirements Document) Creation

Create high-quality Product Requirements Documents that are clear, actionable, and suitable for implementation by developers or AI agents.

## The Job

1. Receive a feature description from the user
2. **Determine the next PRD code** by scanning `docs/specs/prd-*.md` for existing codes (PRD-001, PRD-002, etc.)
3. Ask 3-5 essential clarifying questions (with lettered options)
4. Generate a structured PRD following the format below, using the assigned PRD code
5. Save to `docs/specs/prd-XXX-[feature-name].md` (where XXX is the code number)

### PRD Code Assignment

Each PRD gets a unique sequential code (e.g., `PRD-001`, `PRD-002`). To determine the next code:

1. Scan existing files in `docs/specs/prd-*.md`
2. Look for `**Code:** PRD-XXX` in each file's metadata
3. Find the highest existing number and increment by 1
4. If no existing PRDs have codes, start with `PRD-001`

**Important:** Do NOT start implementing. Just create the PRD.

## Step 1: Clarifying Questions

Ask only critical questions where the initial prompt is ambiguous. Format with lettered options for quick responses:

```
1. What is the primary goal of this feature?
   A. [Option 1]
   B. [Option 2]
   C. [Option 3]
   D. Other: [please specify]

2. Who is the target user?
   A. Guest/anonymous users
   B. Registered users
   C. Admin users
   D. All users
```

This lets users respond with "1A, 2C, 3B" for quick iteration.

## Step 2: PRD Structure

Generate the PRD with these sections in order:

### 1. Title and Introduction

```markdown
# PRD: [Product/Feature Name]

**Code:** PRD-XXX

## Introduction

[2-4 sentences describing what the product/feature is, who it's for, and its core value proposition. Emphasize the key differentiator or approach.]
```

The PRD code appears immediately after the title for easy identification and cross-referencing.

### 2. Goals

High-level objectives as bullet points (4-6 goals maximum):

```markdown
## Goals

- Enable [user type] to [achieve outcome] using [approach]
- Provide [capability] by [method]
- Allow [action] through [mechanism]
```

### 3. User Stories

Numbered stories prefixed with the PRD code for uniqueness across all PRDs. Format: `[PRD-XXX]-US-YYY`

```markdown
### PRD-001-US-001: [Short descriptive title]
**Description:** As a [user type], I want to [action] so that [benefit].

**Acceptance Criteria:**
- [ ] [Specific, testable criterion]
- [ ] [UI element or behavior requirement]
- [ ] [Edge case or validation requirement]
- [ ] [Error state handling if applicable]
```

This prefixing ensures user story IDs are globally unique, making it easy to reference specific stories across different PRDs (e.g., "see PRD-003-US-002 for related functionality").

**Story organization:** Order stories by user journey:
1. Entry point / first interaction
2. Core workflow (main features)
3. Secondary features
4. Settings and management
5. Error handling and edge cases

**Acceptance criteria rules:**
- Each criterion must be testable (pass/fail)
- Include UI behavior specifics (what shows, where, when)
- Cover both happy path and error states
- For UI stories: Always include browser verification criterion

### 4. Functional Requirements

Numbered requirements (`FR-X`) organized by category:

```markdown
## Functional Requirements

### [Category Name]
- FR-1: System must [specific behavior with conditions]
- FR-2: System must [another behavior]

### [Another Category]
- FR-3: System must [behavior]
```

**Common categories:**
- Core Functionality (main feature behaviors)
- User Interface (layout, navigation, feedback states)
- Authentication / Authorization
- Guest Flow / Onboarding
- Data Management
- Sharing / Collaboration

### 5. Non-Goals

Explicitly state what is out of scope:

```markdown
## Non-Goals

- [Feature explicitly not included]
- [Capability deferred to future]
- [Integration not supported in MVP]
```

Non-goals prevent scope creep and set clear boundaries. Include anything that might be assumed but isn't planned.

### 6. Design Considerations

UI/UX guidance organized by screen or component:

```markdown
## Design Considerations

### [Screen Name]
- [Layout: what's where, visual hierarchy]
- [Key elements: buttons, inputs, displays]
- [Interactions: hover states, click behaviors]

### [Another Screen]
- [Layout description]
- [Component placement]
```

### 7. Technical Considerations

Implementation notes without over-specifying:

```markdown
## Technical Considerations

- [Data storage approach]
- [Security considerations]
- [Performance requirements]
- [Session/state management]
- [Integration points]
```

### 8. Success Metrics

Measurable outcomes with specific targets:

```markdown
## Success Metrics

- [User can complete X in under Y seconds/clicks]
- [Z% of users who do A proceed to do B]
- [Feature renders correctly across modern browsers]
```

### 9. Open Questions

Unresolved decisions requiring stakeholder input:

```markdown
## Open Questions

- [Technology choice needing decision]
- [Feature behavior needing clarification]
- [Business rule requiring input]
```

## Writing Quality Standards

### User Story Quality

**Good user story (with PRD code prefix):**
```markdown
### PRD-003-US-001: User logs into account
**Description:** As a registered user, I want to log in so that I can access my dashboard.

**Acceptance Criteria:**
- [ ] Login form validates email format before submission
- [ ] Error message "Invalid email" displayed below field for malformed emails
- [ ] Submit button disabled until both fields have content
- [ ] Loading spinner shown while authentication in progress
```

**Poor acceptance criteria:**
```markdown
- [ ] Login should work properly
- [ ] Good error handling
- [ ] Nice user experience
```

### Functional Requirement Quality

**Good requirements:**
```markdown
- FR-1: System must validate email format using standard pattern before form submission
- FR-2: System must display loading indicator during API calls exceeding 200ms
- FR-3: Guest-created data must persist in browser session until registration
```

**Poor requirements:**
```markdown
- FR-1: System should handle emails correctly
- FR-2: Loading states should be nice
- FR-3: Guest flow should work well
```

## Output

- **Format:** Markdown (`.md`)
- **Location:** `docs/specs/`
- **Filename:** `prd-XXX-[feature-name].md` (e.g., `prd-001-user-auth.md`)

## Checklist Before Saving

- [ ] Scanned existing PRDs to determine next sequential code (PRD-XXX)
- [ ] Asked clarifying questions with lettered options
- [ ] PRD code included after title (`**Code:** PRD-XXX`)
- [ ] Introduction clearly describes product and value proposition
- [ ] User stories prefixed with PRD code (PRD-XXX-US-001, PRD-XXX-US-002, etc.)
- [ ] Acceptance criteria are specific and testable
- [ ] Functional requirements numbered and categorized (FR-1, FR-2, etc.)
- [ ] Non-goals explicitly define what's out of scope
- [ ] Design considerations organized by screen/component
- [ ] Success metrics are measurable
- [ ] Saved to `docs/specs/prd-XXX-[feature-name].md`

## Next Steps

After completing the PRD, suggest the appropriate next step:

### For New Projects (no existing codebase)
Recommend creating a **Technical Design Document (TDD)** that defines technology stack, architecture, database schema, and API design.

**Workflow:** PRD (what to build) → TDD (how to set up) → Implementation

### For Existing Projects
Proceed directly to implementing user stories starting with US-001.

## Additional Resources

### Reference Files

For complete templates and detailed guidance:
- **`references/prd-template.md`** - Comprehensive PRD template with all sections

### Examples

Working examples demonstrating best practices:
- **`examples/prd-llm-website-generator.md`** - Full PRD for an LLM website generator feature
