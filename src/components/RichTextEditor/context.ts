import { createContext, useContext } from 'react'
import type { CustomEditor } from './types'

/**
 * Context for sharing the Slate editor instance.
 */
export const EditorContext = createContext<CustomEditor | null>(null)

/**
 * Hook to access the Slate editor instance from context.
 * Must be used within a RichTextEditor.Root component.
 */
export function useEditor(): CustomEditor {
  const editor = useContext(EditorContext)
  if (!editor) {
    throw new Error('useEditor must be used within a RichTextEditor.Root')
  }
  return editor
}
