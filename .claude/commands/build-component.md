---
description: Build a complete component with stories and documentation
argument-hint: <component description or requirements>
allowed-tools: Bash(npm run typecheck:*), Bash(npm run storybook:*)
---

Build a complete React component with Storybook stories and MDX documentation by running three specialized agents in sequence.

## Arguments

`$ARGUMENTS` should describe the component to build, including:
- Component name
- Desired primitives/parts
- Behavior and interactions
- Any Radix UI primitive to wrap (if applicable)

## Process

Execute these agents in order, waiting for each to complete before starting the next:

### Step 1: Build the Component

Use the Task tool to invoke the `component-builder` agent with this prompt:

```
Build a React component based on these requirements:

$ARGUMENTS

Follow the project's compositional primitives pattern. Create all required files:
- types.ts with JSDoc comments
- constants.ts
- components/*.tsx for each primitive
- [ComponentName].tsx re-exports
- index.ts namespace export
- Basic [ComponentName].stories.tsx

Run typecheck after completion to verify there are no errors.
```

**Wait for completion before proceeding.**

### Step 2: Write Storybook Stories

After the component is built, use the Task tool to invoke the `storybook-writer` agent:

```
Create comprehensive Storybook stories with play function tests for the component that was just created.

Component location: src/components/[ComponentName]/ (determine from step 1 output)

Read the component implementation to understand:
- All primitives and their props
- User interactions to test
- Keyboard navigation patterns
- State changes

Write stories that test:
- Default rendering
- Click interactions
- Keyboard navigation
- Toggle/expand behavior
- Any edge cases (disabled states, etc.)

Use descriptive story names and ensure all play functions include proper assertions.
```

**Wait for completion before proceeding.**

### Step 3: Write MDX Documentation

After stories are complete, use the Task tool to invoke the `docs-writer` agent:

```
Create MDX documentation for the component that was just created.

Component location: src/components/[ComponentName]/ (determine from previous steps)

Read these files to understand the component:
- types.ts for prop interfaces and JSDoc
- All primitives in components/
- The stories file for existing examples

Create [ComponentName].mdx with:
- Title and subtitle
- Description from JSDoc
- Primary story and controls
- Usage examples with code
- Anatomy section explaining each primitive
- Canvas blocks for each story
- ArgTypes for each primitive
- Accessibility notes
- Related links (Radix docs if applicable)
```

## Verification & Launch

After all three agents complete:

1. Run `npm run typecheck` to verify no type errors
2. Start Storybook with `npm run storybook` so the user can see the new component

## Output

Report the component name and paths to all created files:
- Component directory: `src/components/[ComponentName]/`
- Stories file: `src/components/[ComponentName]/[ComponentName].stories.tsx`
- Documentation: `src/components/[ComponentName]/[ComponentName].mdx`

## Example Usage

```
/build-component A Dialog component that wraps @radix-ui/react-dialog with styled overlay and content. Should include Root, Trigger, Portal, Overlay, Content, Title, Description, and Close primitives.
```

```
/build-component A Tabs component for switching between content panels. Include Root, List, Trigger, and Content primitives. Support keyboard navigation with arrow keys.
```
