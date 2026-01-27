import { cn } from '../../../lib/utils'
import type { ToolbarProps } from '../types'

export function Toolbar({ children, className, ...props }: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 dark:border-gray-700',
        className
      )}
      role="toolbar"
      aria-label="Formatting options"
      {...props}
    >
      {children}
    </div>
  )
}
