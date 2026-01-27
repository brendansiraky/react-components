import type { PointerEvent } from 'react'
import { useSlate } from 'slate-react'
import { cn } from '../../../lib/utils'
import { isBlockActive, toggleBlock, isAlignType } from '../utils'
import type { BlockButtonProps } from '../types'

export function BlockButton({ format, icon, className, ...props }: BlockButtonProps) {
  const editor = useSlate()
  const isActive = isBlockActive(editor, format, isAlignType(format) ? 'align' : 'type')

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
      aria-label={`Toggle ${format}`}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        event.preventDefault()
      }}
      onClick={() => toggleBlock(editor, format)}
      {...props}
    >
      {icon}
    </button>
  )
}
