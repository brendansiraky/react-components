import type { ComponentPropsWithoutRef } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

/**
 * Props for the Accordion Root component.
 * Container that holds all accordion sections. Supports single or multiple expanded items.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/accordion#root
 */
export type RootProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>

/**
 * Props for the Accordion Item component.
 * Wraps a collapsible section containing a trigger and content.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/accordion#item
 */
export type ItemProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>

/**
 * Props for the Accordion Header component.
 * Semantic wrapper for the trigger element, typically rendered as an h3.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/accordion#header
 */
export type HeaderProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>

/**
 * Props for the Accordion Trigger component.
 * Button that toggles the expanded state of the associated content section.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/accordion#trigger
 */
export type TriggerProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>

/**
 * Props for the Accordion Content component.
 * Container for the collapsible content area with animated height transitions.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/accordion#content
 */
export type ContentProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
