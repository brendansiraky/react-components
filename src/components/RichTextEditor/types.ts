import type { ComponentPropsWithoutRef, ReactNode, JSX } from 'react'
import type { BaseEditor, Descendant } from 'slate'
import type { ReactEditor, RenderElementProps, RenderLeafProps } from 'slate-react'
import type { HistoryEditor } from 'slate-history'

/**
 * Text alignment options for block elements.
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify'

/**
 * Inline text formatting marks.
 */
export type TextMark = 'bold' | 'italic' | 'underline' | 'code'

/**
 * Block element types supported by the editor.
 */
export type BlockType =
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'block-quote'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'

/**
 * Block format including both block types and alignment.
 */
export type BlockFormat = BlockType | TextAlign

/**
 * Custom text node with formatting marks.
 */
export interface CustomText {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  code?: boolean
}

/**
 * Base custom element interface.
 */
interface BaseCustomElement {
  children: CustomText[] | CustomElement[]
}

/**
 * Paragraph element.
 */
export interface ParagraphElement extends BaseCustomElement {
  type: 'paragraph'
  align?: TextAlign
  children: CustomText[]
}

/**
 * Heading one element.
 */
export interface HeadingOneElement extends BaseCustomElement {
  type: 'heading-one'
  align?: TextAlign
  children: CustomText[]
}

/**
 * Heading two element.
 */
export interface HeadingTwoElement extends BaseCustomElement {
  type: 'heading-two'
  align?: TextAlign
  children: CustomText[]
}

/**
 * Block quote element.
 */
export interface BlockQuoteElement extends BaseCustomElement {
  type: 'block-quote'
  align?: TextAlign
  children: CustomText[]
}

/**
 * Bulleted list element.
 */
export interface BulletedListElement extends BaseCustomElement {
  type: 'bulleted-list'
  align?: TextAlign
  children: ListItemElement[]
}

/**
 * Numbered list element.
 */
export interface NumberedListElement extends BaseCustomElement {
  type: 'numbered-list'
  align?: TextAlign
  children: ListItemElement[]
}

/**
 * List item element.
 */
export interface ListItemElement extends BaseCustomElement {
  type: 'list-item'
  align?: TextAlign
  children: CustomText[]
}

/**
 * Union of all custom element types.
 */
export type CustomElement =
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | BlockQuoteElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement

/**
 * Custom editor type combining Slate's BaseEditor with React and History plugins.
 */
export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

/**
 * Type augmentation for Slate to use our custom types.
 */
declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}

/**
 * Props for the RichTextEditor Root component.
 * Wraps the Slate provider and manages editor state.
 *
 * @see https://docs.slatejs.org/walkthroughs/01-installing-slate
 */
export interface RootProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /**
   * Initial content for the editor.
   */
  initialValue?: Descendant[]
  /**
   * Callback fired when the editor content changes.
   */
  onChange?: (value: Descendant[]) => void
  /**
   * Child components (Toolbar, Editable, etc.)
   */
  children: ReactNode
}

/**
 * Props for the Toolbar component.
 * Container for formatting buttons.
 *
 * @see https://docs.slatejs.org/walkthroughs/02-adding-event-handlers
 */
export interface ToolbarProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Toolbar content (MarkButton, BlockButton, Separator, etc.)
   */
  children: ReactNode
}

/**
 * Props for the MarkButton component.
 * Button for toggling inline text formatting (bold, italic, underline, code).
 *
 * @see https://docs.slatejs.org/walkthroughs/03-defining-custom-elements
 */
export interface MarkButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  /**
   * The text mark format to toggle.
   */
  format: TextMark
  /**
   * Icon element to display in the button.
   */
  icon: ReactNode
}

/**
 * Props for the BlockButton component.
 * Button for toggling block-level formatting (headings, lists, alignment, etc.).
 *
 * @see https://docs.slatejs.org/walkthroughs/03-defining-custom-elements
 */
export interface BlockButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  /**
   * The block format to toggle.
   */
  format: BlockFormat
  /**
   * Icon element to display in the button.
   */
  icon: ReactNode
}

/**
 * Props for the Editable component.
 * The actual editable content area.
 *
 * @see https://docs.slatejs.org/api/slate-react/editable
 */
export interface EditableProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /**
   * Placeholder text shown when the editor is empty.
   */
  placeholder?: string
  /**
   * Whether to auto-focus the editor on mount.
   */
  autoFocus?: boolean
  /**
   * Whether to enable spell checking.
   */
  spellCheck?: boolean
  /**
   * Whether the editor is read-only.
   */
  readOnly?: boolean
  /**
   * Custom element renderer.
   */
  renderElement?: (props: RenderElementProps) => JSX.Element
  /**
   * Custom leaf (text) renderer.
   */
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
}

/**
 * Props for the Separator component.
 * Visual divider for toolbar sections.
 */
export interface SeparatorProps extends ComponentPropsWithoutRef<'div'> {}

/**
 * Editor context value.
 */
export interface EditorContextValue {
  editor: CustomEditor
}
