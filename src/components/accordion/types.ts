import type { ComponentPropsWithoutRef } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

/**
 * Props for the Root component.
 * Contains all accordion items and manages the expanded state.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/accordion#root
 */
export type RootProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>

/**
 * Props for the Item component.
 * Contains all parts of a collapsible section.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/accordion#item
 */
export interface ItemProps extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  value: string
}

/**
 * Props for the Header component.
 * Wraps the Trigger and provides appropriate heading semantics.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/accordion#header
 */
export type HeaderProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>

/**
 * Props for the Trigger component.
 * The button that toggles the collapsed state of an accordion item.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/accordion#trigger
 */
export type TriggerProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>

/**
 * Props for the Content component.
 * Contains the collapsible content for an accordion item.
 *
 * @see https://www.radix-ui.com/primitives/docs/components/accordion#content
 */
export interface ContentProps extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  forceMount?: true
}
