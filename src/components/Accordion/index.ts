import { Root } from './components/Root'
import { Item } from './components/Item'
import { Header } from './components/Header'
import { Trigger } from './components/Trigger'
import { Content } from './components/Content'

export const Accordion = { Root, Item, Header, Trigger, Content }

export type {
  RootProps as AccordionRootProps,
  ItemProps as AccordionItemProps,
  HeaderProps as AccordionHeaderProps,
  TriggerProps as AccordionTriggerProps,
  ContentProps as AccordionContentProps,
} from './types'
