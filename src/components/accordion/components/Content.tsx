import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cn } from '../../../lib/utils'
import type { ContentProps } from '../types'

export function Content({ className, children, ...props }: ContentProps) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        'overflow-hidden text-sm',
        'data-[state=closed]:animate-accordion-up',
        'data-[state=open]:animate-accordion-down',
        className
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </AccordionPrimitive.Content>
  )
}
