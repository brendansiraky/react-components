import { useState, useCallback } from 'react'
import { useSlate } from 'slate-react'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '../../../lib/utils'
import {
  insertTableRow,
  insertTableColumn,
  deleteTableRow,
  deleteTableColumn,
  deleteTable,
} from '../utils'
import {
  TableRowInsertIcon,
  TableRowDeleteIcon,
  TableColumnInsertIcon,
  TableColumnDeleteIcon,
  TableDeleteIcon,
} from '../icons'
import type { TablePopoverProps } from '../types'

interface ActionButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
  variant?: 'default' | 'danger'
}

function ActionButton({ onClick, icon, label, variant = 'default' }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        variant === 'default' && [
          'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700',
        ],
        variant === 'danger' && [
          'text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30',
        ]
      )}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  )
}

export function TablePopover({ children, attributes }: TablePopoverProps) {
  const editor = useSlate()
  const [open, setOpen] = useState(false)

  const handleInsertRow = useCallback(() => {
    insertTableRow(editor)
    setOpen(false)
  }, [editor])

  const handleDeleteRow = useCallback(() => {
    deleteTableRow(editor)
    setOpen(false)
  }, [editor])

  const handleInsertColumn = useCallback(() => {
    insertTableColumn(editor)
    setOpen(false)
  }, [editor])

  const handleDeleteColumn = useCallback(() => {
    deleteTableColumn(editor)
    setOpen(false)
  }, [editor])

  const handleDeleteTable = useCallback(() => {
    deleteTable(editor)
    setOpen(false)
  }, [editor])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <table
          className="my-2 w-full border-collapse border border-gray-300 dark:border-gray-600"
          {...attributes}
        >
          {children}
        </table>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={8}
          className={cn(
            'z-50 flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg',
            'dark:border-gray-700 dark:bg-gray-800',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
          onOpenAutoFocus={(e) => {
            // Prevent focus from moving to popover to keep selection in editor
            e.preventDefault()
          }}
        >
          <ActionButton
            onClick={handleInsertRow}
            icon={<TableRowInsertIcon />}
            label="Insert row below"
          />
          <ActionButton
            onClick={handleDeleteRow}
            icon={<TableRowDeleteIcon />}
            label="Delete row"
          />
          <div className="mx-0.5 h-5 w-px bg-gray-200 dark:bg-gray-700" role="separator" />
          <ActionButton
            onClick={handleInsertColumn}
            icon={<TableColumnInsertIcon />}
            label="Insert column right"
          />
          <ActionButton
            onClick={handleDeleteColumn}
            icon={<TableColumnDeleteIcon />}
            label="Delete column"
          />
          <div className="mx-0.5 h-5 w-px bg-gray-200 dark:bg-gray-700" role="separator" />
          <ActionButton
            onClick={handleDeleteTable}
            icon={<TableDeleteIcon />}
            label="Delete table"
            variant="danger"
          />
          <Popover.Arrow className="fill-white dark:fill-gray-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
