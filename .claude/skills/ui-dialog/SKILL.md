---
name: ui-dialog
description: This skill should be used when the user asks to "create a modal", "add a dialog", "implement a popup", "add confirmation dialog", "delete confirmation", "edit dialog", "form in modal", "AlertDialog pattern", "dialog with dropdown", "useModalInDropdown", or needs guidance on implementing dialogs and modals in React components using shadcn/ui Dialog and AlertDialog components, including dropdown menu integration patterns.
---

# UI Dialog

Patterns and conventions for implementing dialogs and modals in the frontend application.

## Key Concepts

### Core Principles

1. **Trigger-based activation**: Dialogs receive a `trigger` prop rather than being controlled externally
2. **Internal state management**: Dialogs manage their own `open` state via `useState`
3. **Callback coordination**: Use `onOpenChange` prop to notify parent components of state changes
4. **Dropdown integration**: Use `useModalInDropdown` hook when dialogs are triggered from dropdown menus

### Component Libraries

- `@bob/ui`: Dialog, AlertDialog, and related components from shadcn/ui
- `useModalInDropdown`: Custom hook for dropdown-dialog integration

### Dialog Types

| Type | Component | Use Case |
|------|-----------|----------|
| Form Dialog | `Dialog` | Creating or editing resources |
| Confirmation Dialog | `AlertDialog` | Destructive actions requiring confirmation |
| Information Dialog | `Dialog` | Displaying read-only content |

### Essential Props Interface

```typescript
interface DialogComponentProps {
    data?: DataType                        // Data to display/edit
    trigger?: React.ReactNode              // Element that opens the dialog
    onOpenChange?: (open: boolean) => void // Callback for state changes
}
```

### Dropdown Integration Pattern

When using dialogs in dropdowns, destructure the `useModalInDropdown` hook:

```typescript
const {
    contentProps,        // Apply to DropdownMenuContent
    dropdownProps,       // Apply to DropdownMenu
    dropdownTriggerRef,  // Apply to trigger Button
    onDialogItemSelect,  // Apply to DropdownMenuItem onSelect
    onModalOpenChange,   // Pass to dialog onOpenChange
} = useModalInDropdown()
```

## Additional Resources

### Reference Files

For complete implementation patterns, code examples, and detailed guidelines, consult:

- **`references/conventions.md`** - Complete dialog patterns including:
  - Full code examples for all dialog types
  - AlertDialog pattern for confirmations
  - Forms in dialogs pattern
  - Dropdown integration with useModalInDropdown
  - Accessibility considerations
  - State management best practices
