# React Components

A development playground for building and testing React UI components with a custom storybook system.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for dev server and bundling
- **Tailwind CSS v4** for styling (via `@tailwindcss/vite` plugin)
- **classnames** + **tailwind-merge** for class composition

## Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Type-check and build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── components/          # React components organized by feature
│   └── [component]/
│       ├── Component.tsx        # Component implementation
│       ├── Component.stories.tsx # Story definitions
│       └── index.ts             # Public exports
├── storybook/           # Custom storybook system
│   ├── Storybook.tsx    # Main storybook UI
│   ├── types.ts         # Type definitions
│   ├── stories.ts       # Story registry
│   └── index.ts         # Public exports
├── lib/
│   └── utils.ts         # Utility functions (cn helper)
├── App.tsx              # Root app (renders Storybook)
├── main.tsx             # React entry point
└── index.css            # Tailwind CSS import
```

## Component Pattern

Each component lives in its own folder under `src/components/` with three files:

**Component.tsx** - The component implementation:
```tsx
export function Button({ children, ...props }) {
  return <button {...props}>{children}</button>
}
```

**Component.stories.tsx** - Story definitions:
```tsx
import { Button } from './Button'

export default {
  title: 'Button',
  component: Button,
}

export const Default = () => <Button>Click me</Button>
export const Primary = () => <Button className="bg-blue-500">Primary</Button>
```

**index.ts** - Public exports:
```tsx
export { Button } from './Button'
```

## Custom Storybook System

This project uses a lightweight custom storybook (not the Storybook library). The system provides:

- Two-panel layout with sidebar navigation and preview area
- Component grouping with collapsible story items
- Interactive story selection

**Key files:**
- `src/storybook/types.ts` - Type definitions for stories
- `src/storybook/stories.ts` - Story registry (import and register stories here)
- `src/storybook/Storybook.tsx` - Main UI component

## Adding a New Component

1. Create folder: `src/components/ComponentName/`
2. Add three files:
   - `ComponentName.tsx` - Component implementation
   - `ComponentName.stories.tsx` - Stories with default metadata + named exports
   - `index.ts` - Re-export the component
3. Register in `src/storybook/stories.ts`:
   ```tsx
   import * as ComponentNameStories from '../components/ComponentName/ComponentName.stories'

   const storyModules: StoryModule[] = [
     // ... existing stories
     ComponentNameStories,
   ]
   ```

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
