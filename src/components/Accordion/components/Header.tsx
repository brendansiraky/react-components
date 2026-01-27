import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cn } from '../../../lib/utils'
import type { HeaderProps } from '../types'

export function Header({ className, ...props }: HeaderProps) {
  return (
    <AccordionPrimitive.Header
      className={cn('flex', className)}
      {...props}
    />
  )
}
