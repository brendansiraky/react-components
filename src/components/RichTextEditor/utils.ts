import { Editor, Element as SlateElement, Transforms } from 'slate'
import type {
  CustomEditor,
  TextMark,
  BlockFormat,
  TextAlign,
  BlockType,
  CustomElement,
  TableElement,
  TableRowElement,
  TableCellElement,
} from './types'
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

/**
 * Check if cursor is currently inside a table.
 */
export function isTableActive(editor: CustomEditor): boolean {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table',
    })
  )

  return !!match
}

/**
 * Create an empty table cell.
 */
function createTableCell(): TableCellElement {
  return {
    type: 'table-cell',
    children: [{ text: '' }],
  }
}

/**
 * Create a table row with the specified number of cells.
 */
function createTableRow(columns: number): TableRowElement {
  return {
    type: 'table-row',
    children: Array.from({ length: columns }, () => createTableCell()),
  }
}

/**
 * Create a table with the specified dimensions.
 */
function createTable(rows: number, columns: number): TableElement {
  return {
    type: 'table',
    children: Array.from({ length: rows }, () => createTableRow(columns)),
  }
}

/**
 * Insert a table at the current selection.
 */
export function insertTable(editor: CustomEditor, rows = 3, columns = 3): void {
  if (isTableActive(editor)) {
    return // Don't insert nested tables
  }

  const table = createTable(rows, columns)
  Transforms.insertNodes(editor, table)
}

/**
 * Delete the table at the current selection.
 */
export function deleteTable(editor: CustomEditor): void {
  Transforms.removeNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table',
  })
}

/**
 * Insert a row below the current row.
 */
export function insertTableRow(editor: CustomEditor): void {
  const { selection } = editor
  if (!selection) return

  const [tableEntry] = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table',
    })
  )

  if (!tableEntry) return

  const [rowEntry] = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-row',
    })
  )

  if (!rowEntry) return

  const [rowNode, rowPath] = rowEntry
  const rowElement = rowNode as TableRowElement
  const columnCount = rowElement.children.length

  const newRow = createTableRow(columnCount)
  const insertPath = [...rowPath.slice(0, -1), rowPath[rowPath.length - 1] + 1]

  Transforms.insertNodes(editor, newRow, { at: insertPath })
}

/**
 * Insert a column to the right of the current column.
 */
export function insertTableColumn(editor: CustomEditor): void {
  const { selection } = editor
  if (!selection) return

  const [tableEntry] = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table',
    })
  )

  if (!tableEntry) return

  const [cellEntry] = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-cell',
    })
  )

  if (!cellEntry) return

  const [, cellPath] = cellEntry
  const columnIndex = cellPath[cellPath.length - 1]

  const [tableNode] = tableEntry
  const tableElement = tableNode as TableElement

  // Insert a new cell in each row at columnIndex + 1
  tableElement.children.forEach((_, rowIndex) => {
    const newCell = createTableCell()
    const insertPath = [cellPath[0], rowIndex, columnIndex + 1]
    Transforms.insertNodes(editor, newCell, { at: insertPath })
  })
}

/**
 * Delete the current row.
 */
export function deleteTableRow(editor: CustomEditor): void {
  const [tableEntry] = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table',
    })
  )

  if (!tableEntry) return

  const [tableNode] = tableEntry
  const tableElement = tableNode as TableElement

  // Don't delete if only one row
  if (tableElement.children.length <= 1) {
    deleteTable(editor)
    return
  }

  Transforms.removeNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-row',
  })
}

/**
 * Delete the current column.
 */
export function deleteTableColumn(editor: CustomEditor): void {
  const { selection } = editor
  if (!selection) return

  const [tableEntry] = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table',
    })
  )

  if (!tableEntry) return

  const [cellEntry] = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-cell',
    })
  )

  if (!cellEntry) return

  const [, cellPath] = cellEntry
  const columnIndex = cellPath[cellPath.length - 1]

  const [tableNode, tablePath] = tableEntry
  const tableElement = tableNode as TableElement

  // Don't delete if only one column
  if (tableElement.children[0]?.children.length <= 1) {
    deleteTable(editor)
    return
  }

  // Remove the cell at columnIndex from each row
  for (let rowIndex = tableElement.children.length - 1; rowIndex >= 0; rowIndex--) {
    const removePath = [...tablePath, rowIndex, columnIndex]
    Transforms.removeNodes(editor, { at: removePath })
  }
}
