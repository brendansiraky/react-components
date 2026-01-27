import { useCallback, type KeyboardEvent } from 'react'
import {
  Editable as SlateEditable,
  useSlate,
  type RenderElementProps,
  type RenderLeafProps,
} from 'slate-react'
import isHotkey from 'is-hotkey'
import { cn } from '../../../lib/utils'
import { HOTKEYS } from '../constants'
import { toggleMark, isAlignElement } from '../utils'
import type { EditableProps, CustomElement, CustomText, TextAlign } from '../types'

function DefaultElement({ attributes, children, element }: RenderElementProps) {
  const style: React.CSSProperties = {}
  if (isAlignElement(element as CustomElement)) {
    style.textAlign = (element as CustomElement & { align: TextAlign }).align
  }

  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote
          className="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400"
          style={style}
          {...attributes}
        >
          {children}
        </blockquote>
      )
    case 'bulleted-list':
      return (
        <ul className="ml-6 list-disc" style={style} {...attributes}>
          {children}
        </ul>
      )
    case 'heading-one':
      return (
        <h1 className="text-3xl font-bold" style={style} {...attributes}>
          {children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2 className="text-2xl font-bold" style={style} {...attributes}>
          {children}
        </h2>
      )
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case 'numbered-list':
      return (
        <ol className="ml-6 list-decimal" style={style} {...attributes}>
          {children}
        </ol>
      )
    default:
      return (
        <p className="mb-2 last:mb-0" style={style} {...attributes}>
          {children}
        </p>
      )
  }
}

function DefaultLeaf({ attributes, children, leaf }: RenderLeafProps) {
  const customLeaf = leaf as CustomText

  if (customLeaf.bold) {
    children = <strong>{children}</strong>
  }

  if (customLeaf.code) {
    children = (
      <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-800">
        {children}
      </code>
    )
  }

  if (customLeaf.italic) {
    children = <em>{children}</em>
  }

  if (customLeaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

export function Editable({
  className,
  placeholder = 'Enter some text...',
  autoFocus,
  spellCheck = true,
  readOnly,
  renderElement,
  renderLeaf,
  ...props
}: EditableProps) {
  const editor = useSlate()

  const handleRenderElement = useCallback(
    (props: RenderElementProps) => {
      if (renderElement) {
        return renderElement(props)
      }
      return <DefaultElement {...props} />
    },
    [renderElement]
  )

  const handleRenderLeaf = useCallback(
    (props: RenderLeafProps) => {
      if (renderLeaf) {
        return renderLeaf(props)
      }
      return <DefaultLeaf {...props} />
    },
    [renderLeaf]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault()
          const mark = HOTKEYS[hotkey]
          toggleMark(editor, mark)
        }
      }
    },
    [editor]
  )

  return (
    <SlateEditable
      className={cn(
        'min-h-[200px] p-4 text-gray-900 dark:text-gray-100',
        'focus:outline-none',
        'prose prose-sm dark:prose-invert max-w-none',
        className
      )}
      renderElement={handleRenderElement}
      renderLeaf={handleRenderLeaf}
      placeholder={placeholder}
      spellCheck={spellCheck}
      autoFocus={autoFocus}
      readOnly={readOnly}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}
