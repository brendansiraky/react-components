import type { Descendant } from 'slate'
import type { TextMark, BlockType } from './types'

/**
 * Keyboard shortcuts for text formatting.
 * Uses 'mod' which maps to Cmd on Mac and Ctrl on Windows/Linux.
 */
export const HOTKEYS: Record<string, TextMark> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

/**
 * Block types that represent lists.
 */
export const LIST_TYPES: readonly BlockType[] = ['numbered-list', 'bulleted-list']

/**
 * Text alignment options.
 */
export const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'] as const

/**
 * Default initial value for the editor.
 */
export const DEFAULT_INITIAL_VALUE: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text: ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
]
