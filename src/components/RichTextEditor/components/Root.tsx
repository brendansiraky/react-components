import { useMemo, useCallback } from 'react'
import type { Descendant } from 'slate'
import { createEditor } from 'slate'
import { Slate, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { cn } from '../../../lib/utils'
import { EditorContext } from '../context'
import { DEFAULT_INITIAL_VALUE } from '../constants'
import type { RootProps, CustomEditor } from '../types'

export function Root({
  children,
  className,
  initialValue = DEFAULT_INITIAL_VALUE,
  onChange,
  ...props
}: RootProps) {
  const editor = useMemo<CustomEditor>(
    () => withHistory(withReact(createEditor())),
    []
  )

  const handleChange = useCallback(
    (value: Descendant[]) => {
      onChange?.(value)
    },
    [onChange]
  )

  return (
    <div
      className={cn(
        'w-full rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900',
        className
      )}
      {...props}
    >
      <EditorContext.Provider value={editor}>
        <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
          {children}
        </Slate>
      </EditorContext.Provider>
    </div>
  )
}
