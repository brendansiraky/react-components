# React Components

A development playground for building and testing React UI components with Storybook.

## Design Philosophy

**Compositional Primitives with Styled Defaults**

This library follows the compositional pattern established by [Radix UI Primitives](https://www.radix-ui.com/primitives), but with styled defaults rather than headless components.

### Core Principles

1. **Export primitive building blocks** - Components are broken into composable parts (Root, Trigger, Content, Item, etc.) that consumers assemble themselves
2. **Styled by default** - Unlike Radix's headless approach, our primitives come with Tailwind styles baked in
3. **Escape hatches via `className`** - All components accept a `className` prop for customization, merged with defaults using `cn()`

### Example: Dialog Component

```tsx
// Component exports individual primitives
export const Dialog = { Root, Trigger, Portal, Overlay, Content, Title, Description, Close }

// Consumer composes them together
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Why Composition?

- **Flexibility** - Consumers control structure, ordering, and what parts to include
- **Accessibility** - Each primitive handles its own a11y concerns
- **Customization** - Easy to style, wrap, or replace individual parts
- **Predictability** - Explicit structure, no magic or hidden DOM elements

## Tech Stack

- **React 19** with TypeScript
- **Vite** for dev server and bundling
- **Storybook 10** for component development and documentation
- **Tailwind CSS v4** for styling (via `@tailwindcss/vite` plugin)
- **classnames** + **tailwind-merge** for class composition
- **Vitest** for testing (integrated with Storybook)

## Commands

```bash
npm run dev             # Start dev server (http://localhost:5173)
npm run storybook       # Start Storybook (http://localhost:6006)
npm run build           # Type-check and build for production
npm run build-storybook # Build static Storybook site
npm run preview         # Preview production build
npm run typecheck       # Run TypeScript compiler (no emit)
npm run lint            # Run ESLint
```

## Project Structure

```
src/
├── components/          # React components organized by feature
│   └── [ComponentName]/
│       ├── index.ts              # Public exports (namespace object + types)
│       ├── ComponentName.tsx     # Re-exports from components/
│       ├── ComponentName.stories.tsx # Storybook stories (CSF3 format)
│       ├── types.ts              # TypeScript type definitions
│       ├── constants.ts          # Component constants
│       └── components/           # Primitive components
│           ├── Root.tsx
│           ├── Trigger.tsx
│           ├── Content.tsx
│           └── ...
├── lib/
│   └── utils.ts         # Utility functions (cn helper)
├── App.tsx              # Root app
├── main.tsx             # React entry point
└── index.css            # Tailwind CSS import

.storybook/
├── main.ts              # Storybook configuration
├── preview.ts           # Global decorators and parameters
└── vitest.setup.ts      # Vitest integration setup
```

## Adding a New Component

Use the `component-builder` agent (`.claude/agents/component-builder.md`) to create new components. It handles the complete file structure, types, and primitives following the project's compositional pattern.

Use the `storybook-writer` agent (`.claude/agents/storybook-writer.md`) to create Storybook stories with interactive tests using play functions.

## Utilities

### `cn()` - Class Name Utility

Located at `src/lib/utils.ts`. Combines `classnames` and `tailwind-merge` for conflict-free class composition.

```tsx
import { cn } from './lib/utils'

cn('px-4 py-2', 'bg-blue-500')           // Basic usage
cn('btn', isActive && 'btn-active')       // Conditional classes
cn('px-2', 'px-4')                        // Conflict resolution → 'px-4'
```

## Styling Conventions

- Use Tailwind utility classes for all styling
- Use `cn()` when merging classes or handling conditionals
- Component variants should use conditional classes via `cn()`

## After Code Changes

**IMPORTANT:** After completing any code changes, run these verification steps:

1. **TypeScript check** - Verify there are no type errors:
   ```bash
   npm run typecheck
   ```

2. **Dev server** - Boot up the dev server to verify the app runs:
   ```bash
   npm run dev
   ```

Do not consider a task complete until both checks pass without errors.
