import { Editor, Element as SlateElement, Transforms } from 'slate'
import type { CustomEditor, TextMark, BlockFormat, TextAlign, BlockType, CustomElement } from './types'
import { LIST_TYPES, TEXT_ALIGN_TYPES } from './constants'

/**
 * Check if a format is a text alignment type.
 */
export function isAlignType(format: BlockFormat): format is TextAlign {
  return TEXT_ALIGN_TYPES.includes(format as TextAlign)
}

/**
 * Check if a format is a list type.
 */
export function isListType(format: BlockFormat): format is 'bulleted-list' | 'numbered-list' {
  return LIST_TYPES.includes(format as BlockType)
}

/**
 * Check if an element has an align property.
 */
export function isAlignElement(
  element: CustomElement
): element is CustomElement & { align: TextAlign } {
  return 'align' in element && element.align !== undefined
}

/**
 * Check if a text mark is currently active.
 */
export function isMarkActive(editor: CustomEditor, format: TextMark): boolean {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

/**
 * Check if a block format is currently active.
 */
export function isBlockActive(
  editor: CustomEditor,
  format: BlockFormat,
  blockType: 'type' | 'align' = 'type'
): boolean {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        if (!SlateElement.isElement(n)) return false
        if (blockType === 'align') {
          return 'align' in n && n.align === format
        }
        return n.type === format
      },
    })
  )

  return !!match
}

/**
 * Toggle a text mark on/off.
 */
export function toggleMark(editor: CustomEditor, format: TextMark): void {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

/**
 * Toggle a block format on/off.
 */
export function toggleBlock(editor: CustomEditor, format: BlockFormat): void {
  const isActive = isBlockActive(editor, format, isAlignType(format) ? 'align' : 'type')
  const isList = isListType(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      isListType(n.type) &&
      !isAlignType(format),
    split: true,
  })

  let newProperties: Partial<SlateElement>

  if (isAlignType(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }

  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}
