import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cn } from '../../../lib/utils'
import type { ItemProps } from '../types'

export function Item({ className, ...props }: ItemProps) {
  return (
    <AccordionPrimitive.Item
      className={cn('border-b border-neutral-200', className)}
      {...props}
    />
  )
}
