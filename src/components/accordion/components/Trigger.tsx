import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cn } from '../../../lib/utils'
import type { TriggerProps } from '../types'

export function Trigger({ className, children, ...props }: TriggerProps) {
  return (
    <AccordionPrimitive.Trigger
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-sm font-medium',
        'transition-all hover:underline',
        '[&[data-state=open]>svg]:rotate-180',
        'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
      <ChevronIcon className="h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
