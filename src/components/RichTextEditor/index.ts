import { Root } from './components/Root'
import { Toolbar } from './components/Toolbar'
import { MarkButton } from './components/MarkButton'
import { BlockButton } from './components/BlockButton'
import { TableButton } from './components/TableButton'
import { TablePopover } from './components/TablePopover'
import { Editable } from './components/Editable'
import { Separator } from './components/Separator'

export const RichTextEditor = {
  Root,
  Toolbar,
  MarkButton,
  BlockButton,
  TableButton,
  TablePopover,
  Editable,
  Separator,
}

// Re-export icons for convenience
export {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  QuoteIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  TableIcon,
  TableRowInsertIcon,
  TableRowDeleteIcon,
  TableColumnInsertIcon,
  TableColumnDeleteIcon,
  TableDeleteIcon,
} from './icons'

// Re-export constants
export { DEFAULT_INITIAL_VALUE, HOTKEYS, LIST_TYPES, TEXT_ALIGN_TYPES } from './constants'

// Re-export table utilities for advanced usage
export {
  isTableActive,
  insertTable,
  deleteTable,
  insertTableRow,
  insertTableColumn,
  deleteTableRow,
  deleteTableColumn,
} from './utils'

export type {
  RootProps as RichTextEditorRootProps,
  ToolbarProps as RichTextEditorToolbarProps,
  MarkButtonProps as RichTextEditorMarkButtonProps,
  BlockButtonProps as RichTextEditorBlockButtonProps,
  TableButtonProps as RichTextEditorTableButtonProps,
  TablePopoverProps as RichTextEditorTablePopoverProps,
  EditableProps as RichTextEditorEditableProps,
  SeparatorProps as RichTextEditorSeparatorProps,
  CustomEditor as RichTextEditorCustomEditor,
  CustomElement as RichTextEditorCustomElement,
  CustomText as RichTextEditorCustomText,
  TextMark as RichTextEditorTextMark,
  BlockType as RichTextEditorBlockType,
  BlockFormat as RichTextEditorBlockFormat,
  TextAlign as RichTextEditorTextAlign,
} from './types'
