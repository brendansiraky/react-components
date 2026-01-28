import type { PointerEvent } from 'react'
import { useSlate } from 'slate-react'
import { cn } from '../../../lib/utils'
import { isTableActive, insertTable } from '../utils'
import type { TableButtonProps } from '../types'

export function TableButton({
  icon,
  rows = 3,
  columns = 3,
  className,
  ...props
}: TableButtonProps) {
  const editor = useSlate()
  const isActive = isTableActive(editor)

  return (
    <button
      type="button"
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        isActive && 'bg-gray-200 text-blue-600 dark:bg-gray-700 dark:text-blue-400',
        !isActive && 'text-gray-600 dark:text-gray-400',
        className
      )}
      aria-pressed={isActive}
      aria-label="Insert table"
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        event.preventDefault()
      }}
      onClick={() => insertTable(editor, rows, columns)}
      {...props}
    >
      {icon}
    </button>
  )
}
