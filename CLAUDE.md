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

## Component Pattern

Each component lives in its own folder under `src/components/` with the following strict structure:

```
src/components/Popover/
├── index.ts              # Public exports (namespace object + types)
├── Popover.tsx           # Re-exports from components/
├── Popover.stories.tsx   # Storybook stories (CSF3 format)
├── types.ts              # TypeScript type definitions
├── constants.ts          # Component constants
└── components/           # Primitive components
    ├── Anchor.tsx
    ├── Body.tsx
    ├── Close.tsx
    ├── Root.tsx
    └── Trigger.tsx
```

### File Contents

**components/Root.tsx** - Individual primitive implementation:
```tsx
import { cn } from '../../../lib/utils'
import type { RootProps } from '../types'

export function Root({ children, className, ...props }: RootProps) {
  return <div className={cn('base-styles', className)} {...props}>{children}</div>
}
```

**types.ts** - All type definitions for the component:
```tsx
import type { ComponentPropsWithoutRef } from 'react'

export interface RootProps extends ComponentPropsWithoutRef<'div'> {
  // component-specific props
}

export interface TriggerProps extends ComponentPropsWithoutRef<'button'> {
  // component-specific props
}

export interface AnchorProps extends ComponentPropsWithoutRef<'div'> {
  // component-specific props
}
```

**constants.ts** - Component constants:
```tsx
export const POPOVER_OFFSET = 8
export const ANIMATION_DURATION = 150
```

**Popover.tsx** - Re-exports primitives and types:
```tsx
export { Anchor } from './components/Anchor'
export { Body } from './components/Body'
export { Close } from './components/Close'
export { Root } from './components/Root'
export { Trigger } from './components/Trigger'

export type { AnchorProps, BodyProps, CloseProps, RootProps, TriggerProps } from './types'
```

**index.ts** - Public exports with namespace object:
```tsx
import { Anchor } from './components/Anchor'
import { Body } from './components/Body'
import { Close } from './components/Close'
import { Root } from './components/Root'
import { Trigger } from './components/Trigger'

export const Popover = { Anchor, Body, Close, Root, Trigger }

export type {
  AnchorProps as PopoverAnchorProps,
  BodyProps as PopoverBodyProps,
  CloseProps as PopoverCloseProps,
  RootProps as PopoverRootProps,
  TriggerProps as PopoverTriggerProps,
} from './types'
```

**Popover.stories.tsx** - Storybook stories using CSF3 format:
```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Popover } from './Popover'

const meta = {
  title: 'Components/Popover',
  component: Popover.Root,
  tags: ['autodocs'],
} satisfies Meta<typeof Popover.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Body>Content here</Popover.Body>
    </Popover.Root>
  ),
}
```

## Storybook

This project uses [Storybook](https://storybook.js.org/) for component development and documentation.

### Story Format (CSF3)

Stories use Component Story Format 3 (CSF3):

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],  // Enable auto-generated docs
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Simple story with default props
export const Default: Story = {}

// Story with specific args
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
}

// Story with custom render
export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Icon /> Click me
    </Button>
  ),
}
```

### Addons

The project includes these Storybook addons:
- **@storybook/addon-docs** - Auto-generated documentation
- **@storybook/addon-a11y** - Accessibility testing
- **@storybook/addon-vitest** - Test integration
- **@chromatic-com/storybook** - Visual regression testing (optional)

## Adding a New Component

1. Create folder structure:
   ```
   src/components/ComponentName/
   ├── index.ts
   ├── ComponentName.tsx
   ├── ComponentName.stories.tsx
   ├── types.ts
   ├── constants.ts
   └── components/
       └── (primitive files)
   ```

2. Create files in order:
   - `types.ts` - Define all prop interfaces
   - `constants.ts` - Define any constants
   - `components/*.tsx` - Implement each primitive component
   - `ComponentName.tsx` - Re-export primitives and types
   - `index.ts` - Export namespace object and prefixed types
   - `ComponentName.stories.tsx` - Storybook stories (CSF3 format)

3. Stories are auto-discovered by Storybook from `src/**/*.stories.tsx`

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

**IMPORTANT:** After completing any code changes, always run the TypeScript compiler to verify there are no type errors:

```bash
npm run typecheck
```

This ensures all types are correct and the code will compile successfully. Do not consider a task complete until `typecheck` passes without errors.
