import { cn } from '../../../lib/utils'
import type { SeparatorProps } from '../types'

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <div
      className={cn('mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700', className)}
      role="separator"
      aria-orientation="vertical"
      {...props}
    />
  )
}
