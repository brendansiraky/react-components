# PRD Template

Use this template as a starting point for new PRDs. Replace bracketed text with actual content.

---

# PRD: [Product/Feature Name]

## Introduction

[2-4 sentences describing what the product/feature is and its core value proposition. Include:
- What it does
- Who it's for
- What makes the approach unique or valuable]

## Goals

- [Goal 1: User-focused outcome - what users will be able to do]
- [Goal 2: Experience goal - how the experience should feel]
- [Goal 3: Capability goal - what the system enables]
- [Goal 4: Business goal - why this matters for the product]

## User Stories

### US-001: [First user interaction/entry point]
**Description:** As a [user type], I want to [action] so that [benefit].

**Acceptance Criteria:**
- [ ] [Primary UI element exists and is visible]
- [ ] [User can perform core action]
- [ ] [Feedback is provided during processing]
- [ ] [Result is displayed correctly]

### US-002: [Core workflow step]
**Description:** As a [user type], I want to [action] so that [benefit].

**Acceptance Criteria:**
- [ ] [UI layout requirement]
- [ ] [Content display requirement]
- [ ] [Interaction behavior]
- [ ] [Navigation element]

### US-003: [Secondary feature]
**Description:** As a [user type], I want to [action] so that [benefit].

**Acceptance Criteria:**
- [ ] [Feature availability condition]
- [ ] [User input requirement]
- [ ] [System behavior on input]
- [ ] [Confirmation or feedback]

### US-004: [Another feature]
**Description:** As a [user type], I want to [action] so that [benefit].

**Acceptance Criteria:**
- [ ] [Trigger condition]
- [ ] [UI element placement]
- [ ] [State change behavior]
- [ ] [Error handling if applicable]

[Continue with additional user stories as needed...]

## Functional Requirements

### [Category 1: Core Functionality]
- FR-1: System must [primary behavior]
- FR-2: System must [secondary behavior]
- FR-3: System must [supporting behavior]

### [Category 2: User Interface]
- FR-4: [UI layout requirement]
- FR-5: [Navigation requirement]
- FR-6: [Feedback/state display requirement]

### [Category 3: Authentication/Authorization]
- FR-7: System must [auth requirement]
- FR-8: System must [permission requirement]

### [Category 4: Data/State Management]
- FR-9: [Data persistence requirement]
- FR-10: [Session handling requirement]

[Continue with additional categories as needed...]

## Non-Goals

- [Feature that might be expected but is explicitly excluded]
- [Capability deferred to future versions]
- [Integration not supported]
- [Edge case not handled]
- [Advanced feature out of scope for MVP]

## Design Considerations

### [Screen/View 1]
- [Layout: describe visual hierarchy and placement]
- [Key elements: list prominent UI components]
- [Interactions: describe behaviors on hover, click, etc.]

### [Screen/View 2]
- [Layout description]
- [Element placement]
- [Interaction patterns]

### [Screen/View 3]
- [Layout description]
- [Component organization]
- [User flow]

## Technical Considerations

- [Data storage: where and how data is persisted]
- [Security: how content is sandboxed or protected]
- [Performance: indexing, caching, or optimization needs]
- [Session management: how state is maintained]
- [Integration: external services or APIs]
- [Future considerations: areas to revisit later]

## Success Metrics

- [User efficiency: "User can complete X in under Y seconds/clicks"]
- [Conversion: "X% of users who do A proceed to do B"]
- [Quality: "Feature works correctly across all modern browsers"]
- [Performance: "Page loads in under X seconds"]

## Open Questions

- [Technology decision: "What service/tool should be used for X?"]
- [Feature decision: "Should there be a Y option for Z?"]
- [Business decision: "How long should X persist before Y?"]
- [UX decision: "Should Z show a watermark/badge?"]
- [Scope decision: "What is the maximum size/limit for X?"]

---

## Template Usage Notes

### User Story Guidelines

**Numbering:** Use sequential three-digit format (US-001, US-002, etc.) for easy reference.

**Order stories by user journey:**
1. Entry point / first-time experience
2. Core workflow (main value delivery)
3. Iteration / refinement features
4. Account / persistence features
5. Settings and management
6. Sharing / collaboration
7. Administrative features

**Each acceptance criterion should be:**
- Testable (can verify pass/fail)
- Specific (no ambiguity)
- Independent (stands alone)
- Complete (covers the stated behavior)

### Functional Requirement Guidelines

**Derive from acceptance criteria:** Each FR should trace back to one or more acceptance criteria.

**Use consistent language:**
- "System must..." for required behaviors
- "System must not..." for prohibited behaviors
- Include conditions: "When X, system must Y"

**Common categories:**
- Core Functionality
- User Interface
- Authentication
- Authorization
- Guest/Anonymous Flow
- Data Management
- Sharing/Publishing
- Error Handling

### Non-Goals Guidelines

Include anything that:
- Might reasonably be expected but isn't included
- Is explicitly deferred to future versions
- Would add complexity without sufficient value for MVP
- Requires additional infrastructure not yet available

### Design Considerations Guidelines

**Organize by screen/view** to help designers understand the full picture.

For each screen, describe:
- Overall layout and visual hierarchy
- Key interactive elements
- Important feedback states
- Navigation patterns

### Technical Considerations Guidelines

Keep implementation-agnostic where possible. Focus on:
- What needs to happen, not how
- Constraints and requirements
- Security implications
- Performance expectations

### Success Metrics Guidelines

Metrics should be:
- Measurable (can be quantified)
- Specific (includes targets where possible)
- Relevant (directly related to feature goals)
- Time-bound or event-bound

### Open Questions Guidelines

Use for genuinely unresolved decisions that:
- Require stakeholder input
- Depend on factors outside the PRD scope
- Could reasonably go multiple ways
- Need research or experimentation to answer
