import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cn } from '../../../lib/utils'
import type { RootProps } from '../types'

export function Root({ className, ...props }: RootProps) {
  return (
    <AccordionPrimitive.Root
      className={cn('w-full', className)}
      {...props}
    />
  )
}
