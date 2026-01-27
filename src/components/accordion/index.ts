import { Content } from './components/Content'
import { Header } from './components/Header'
import { Item } from './components/Item'
import { Root } from './components/Root'
import { Trigger } from './components/Trigger'

export const Accordion = { Content, Header, Item, Root, Trigger }

export type {
  ContentProps as AccordionContentProps,
  HeaderProps as AccordionHeaderProps,
  ItemProps as AccordionItemProps,
  RootProps as AccordionRootProps,
  TriggerProps as AccordionTriggerProps,
} from './types'
