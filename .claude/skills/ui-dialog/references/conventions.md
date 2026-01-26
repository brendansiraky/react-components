# Dialog Conventions

## Overview

Dialogs and modals in the application follow consistent patterns for trigger-based activation, state management, and integration with dropdown menus. This ensures a predictable user experience and maintainable code architecture.

## Dialog Architecture

### Core Libraries

- **@bob/ui**: Provides Dialog and AlertDialog components from shadcn/ui
- **react**: useState for local state management
- **useModalInDropdown**: Custom hook for integrating dialogs with dropdown menus

## Dialog Implementation Patterns

### 1. Basic Dialog Structure

All dialogs follow a trigger-based pattern with internal state management:

```typescript
// Required imports
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@bob/ui'
// For confirmation dialogs
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@bob/ui'
// For dropdown integration
import { useModalInDropdown } from '@/hooks/use-modal-in-dropdown'

interface DialogComponentProps {
    // Optional data to pass to the dialog
    data?: DataType
    // Optional trigger element (button, menu item, etc.)
    trigger?: React.ReactNode
    // Optional callback when dialog open state changes
    onOpenChange?: (open: boolean) => void
}

function DialogComponent({ data, trigger, onOpenChange }: DialogComponentProps) {
    const [open, setOpen] = useState(false)

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        onOpenChange?.(open)
    }

    const handleClose = () => handleOpenChange(false)

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Dialog Title</DialogTitle>
                </DialogHeader>
                {/* Dialog content */}
            </DialogContent>
        </Dialog>
    )
}
```

### 2. AlertDialog Pattern

For confirmation dialogs that require user action:

```typescript
interface DeleteDialogProps {
    item?: Item
    trigger?: React.ReactNode
    onOpenChange?: (open: boolean) => void
}

function DeleteDialog({ item, trigger, onOpenChange }: DeleteDialogProps) {
    const [open, setOpen] = useState(false)

    const deleteMutation = useDeleteItem({
        onSuccess: () => {
            toast.success('Item deleted successfully')
            handleOpenChange(false)
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        onOpenChange?.(open)
    }

    if (!item) return null

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete "{item.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
```

## Integration with Dropdown Menus

### Using useModalInDropdown Hook

When dialogs are triggered from dropdown menu items, use the `useModalInDropdown` hook to ensure proper interaction:

```typescript
function TableRow({ item }: TableRowProps) {
    const {
        contentProps,
        dropdownProps,
        dropdownTriggerRef,
        onDialogItemSelect,
        onModalOpenChange,
    } = useModalInDropdown()

    return (
        <DropdownMenu {...dropdownProps}>
            <DropdownMenuTrigger asChild>
                <Button ref={dropdownTriggerRef} variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent {...contentProps} align="end">
                {/* Edit Dialog */}
                <EditDialog
                    item={item}
                    onOpenChange={onModalOpenChange}
                    trigger={
                        <DropdownMenuItem onSelect={onDialogItemSelect}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                    }
                />

                <DropdownMenuSeparator />

                {/* Delete Dialog */}
                <DeleteDialog
                    item={item}
                    onOpenChange={onModalOpenChange}
                    trigger={
                        <DropdownMenuItem
                            onSelect={onDialogItemSelect}
                            variant="destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    }
                />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
```

### Key Points for Dropdown Integration

1. **Single useModalInDropdown instance**: All dialogs in a dropdown share the same hook instance
2. **onDialogItemSelect**: Prevents dropdown from closing when dialog opens
3. **onModalOpenChange**: Synchronizes dialog state with dropdown behavior
4. **contentProps & dropdownProps**: Apply to ensure proper interaction handling

## Dialog Content Patterns

### Forms in Dialogs

When embedding forms in dialogs, handle success callbacks to close the dialog:

```typescript
function FormDialog({ onOpenChange, trigger }: FormDialogProps) {
    const [open, setOpen] = useState(false)

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        onOpenChange?.(open)
    }

    const handleSuccess = () => {
        // Close dialog on successful form submission
        handleOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Form Title</DialogTitle>
                </DialogHeader>
                <FormComponent
                    onSuccess={handleSuccess}
                    onCancel={() => handleOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
```

## State Management Best Practices

### 1. Internal State Management

Dialogs manage their own open/closed state internally:

```typescript
// GOOD - Dialog manages its own state
function MyDialog({ trigger, onOpenChange }: MyDialogProps) {
    const [open, setOpen] = useState(false)

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        onOpenChange?.(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {/* ... */}
        </Dialog>
    )
}

// BAD - Parent manages dialog state
function ParentComponent() {
    const [dialogOpen, setDialogOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setDialogOpen(true)}>Open</Button>
            <MyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
    )
}
```

### 2. Trigger-Based Activation

Always use trigger props for dialog activation:

```typescript
// GOOD - Trigger-based
<FormDialog trigger={<Button>Open Form</Button>} />

// GOOD - Trigger in dropdown
<FormDialog
    trigger={
        <DropdownMenuItem onSelect={onDialogItemSelect}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
        </DropdownMenuItem>
    }
/>

// BAD - External state management
<Button onClick={() => setDialogOpen(true)}>Open</Button>
```

### 3. Callback Handling

Use callbacks for parent component notifications:

```typescript
function MyDialog({ onOpenChange, onSuccess }: MyDialogProps) {
    const handleSuccess = (data: any) => {
        onSuccess?.(data)  // Notify parent of success
        handleOpenChange(false)  // Close dialog
    }

    // ...
}
```

## Common Dialog Types

### 1. Form Dialogs

For creating or editing resources:
- Use Dialog component
- Include form with validation
- Handle success/cancel callbacks
- Show loading states on submit button

### 2. Confirmation Dialogs

For destructive actions:
- Use AlertDialog component
- Clear warning message in AlertDialogDescription
- Destructive styling for confirm button
- Loading state during action

### 3. Information Dialogs

For displaying read-only content:
- Use Dialog component
- No form elements
- Optional close button in footer
- May include copyable content

## Accessibility Considerations

1. **Focus Management**: Dialogs trap focus within them when open
2. **Escape Key**: Pressing Escape closes the dialog
3. **Click Outside**: Clicking the overlay closes the dialog (unless disabled)
4. **ARIA Labels**: DialogTitle provides accessible name for screen readers
5. **Keyboard Navigation**: All interactive elements must be keyboard accessible

## Guidelines

### Do

- Use trigger props for all dialogs
- Manage dialog state internally
- Provide onOpenChange callbacks for parent coordination
- Show loading states within dialogs
- Use AlertDialog for destructive actions
- Handle success callbacks to close dialogs
- Use useModalInDropdown for dropdown integration

### Avoid

- Managing dialog state in parent components
- Forgetting to handle loading states
- Using multiple useModalInDropdown instances in the same dropdown
- Omitting onSelect handlers for dropdown menu items
- Showing toasts for form validation errors in dialogs
- Forgetting to disable action buttons during async operations

## Complete Example

Here's a complete example showing both edit and delete dialogs in a table row:

```typescript
function TagsTableRow({ tag, isLast }: TagsTableRowProps) {
    // Single hook instance for all dialogs in dropdown
    const {
        contentProps,
        dropdownProps,
        dropdownTriggerRef,
        onDialogItemSelect,
        onModalOpenChange,
    } = useModalInDropdown()

    return (
        <TableRow>
            <TableCell>{tag.name}</TableCell>
            <TableCell>
                <DropdownMenu {...dropdownProps}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            ref={dropdownTriggerRef}
                            variant="ghost"
                            size="icon"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent {...contentProps} align="end">
                        {/* Edit Dialog */}
                        <TagFormDialog
                            tag={tag}
                            onOpenChange={onModalOpenChange}
                            trigger={
                                <DropdownMenuItem onSelect={onDialogItemSelect}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            }
                        />

                        <DropdownMenuSeparator />

                        {/* Delete Dialog */}
                        <DeleteTagDialog
                            tag={tag}
                            onOpenChange={onModalOpenChange}
                            trigger={
                                <DropdownMenuItem
                                    onSelect={onDialogItemSelect}
                                    variant="destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}
```

This pattern ensures consistent dialog behavior across the application while maintaining clean separation of concerns and proper state management.
