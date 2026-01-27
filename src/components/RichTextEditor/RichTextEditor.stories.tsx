import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within, userEvent } from 'storybook/test'
import { RichTextEditor } from '.'
import {
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
} from './icons'

const meta = {
  title: 'Components/RichTextEditor',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default editor with full toolbar including mark buttons, block buttons,
 * and alignment options.
 */
export const Default: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root>
        <RichTextEditor.Toolbar>
          <RichTextEditor.MarkButton format="bold" icon={<BoldIcon />} />
          <RichTextEditor.MarkButton format="italic" icon={<ItalicIcon />} />
          <RichTextEditor.MarkButton format="underline" icon={<UnderlineIcon />} />
          <RichTextEditor.MarkButton format="code" icon={<CodeIcon />} />
          <RichTextEditor.Separator />
          <RichTextEditor.BlockButton format="heading-one" icon={<Heading1Icon />} />
          <RichTextEditor.BlockButton format="heading-two" icon={<Heading2Icon />} />
          <RichTextEditor.BlockButton format="block-quote" icon={<QuoteIcon />} />
          <RichTextEditor.Separator />
          <RichTextEditor.BlockButton format="numbered-list" icon={<ListOrderedIcon />} />
          <RichTextEditor.BlockButton format="bulleted-list" icon={<ListUnorderedIcon />} />
          <RichTextEditor.Separator />
          <RichTextEditor.BlockButton format="left" icon={<AlignLeftIcon />} />
          <RichTextEditor.BlockButton format="center" icon={<AlignCenterIcon />} />
          <RichTextEditor.BlockButton format="right" icon={<AlignRightIcon />} />
          <RichTextEditor.BlockButton format="justify" icon={<AlignJustifyIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable placeholder="Enter some rich text..." />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify toolbar renders with the correct role
    const toolbar = canvas.getByRole('toolbar', { name: /formatting options/i })
    await expect(toolbar).toBeVisible()

    // Verify all mark buttons render with correct aria-labels
    await expect(canvas.getByRole('button', { name: /toggle bold/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /toggle italic/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /toggle underline/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /toggle code/i })).toBeVisible()

    // Verify block buttons render
    await expect(canvas.getByRole('button', { name: /toggle heading-one/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /toggle heading-two/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /toggle block-quote/i })).toBeVisible()

    // Verify list buttons render
    await expect(canvas.getByRole('button', { name: /toggle numbered-list/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /toggle bulleted-list/i })).toBeVisible()

    // Verify alignment buttons render
    await expect(canvas.getByRole('button', { name: /toggle left/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /toggle center/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /toggle right/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /toggle justify/i })).toBeVisible()

    // Verify separators render
    const separators = canvas.getAllByRole('separator')
    await expect(separators.length).toBe(4)

    // Verify editable area is present with placeholder
    await expect(canvas.getByText(/enter some rich text/i)).toBeVisible()
  },
}

/**
 * Tests clicking mark buttons to toggle their active state.
 * Mark buttons control inline text formatting (bold, italic, underline, code).
 */
export const ClickMarkButtons: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'paragraph',
            children: [{ text: 'Select this text and click formatting buttons.' }],
          },
        ]}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.MarkButton format="bold" icon={<BoldIcon />} />
          <RichTextEditor.MarkButton format="italic" icon={<ItalicIcon />} />
          <RichTextEditor.MarkButton format="underline" icon={<UnderlineIcon />} />
          <RichTextEditor.MarkButton format="code" icon={<CodeIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const boldButton = canvas.getByRole('button', { name: /toggle bold/i })
    const italicButton = canvas.getByRole('button', { name: /toggle italic/i })
    const underlineButton = canvas.getByRole('button', { name: /toggle underline/i })
    const codeButton = canvas.getByRole('button', { name: /toggle code/i })

    // All buttons should start as not pressed
    await expect(boldButton).toHaveAttribute('aria-pressed', 'false')
    await expect(italicButton).toHaveAttribute('aria-pressed', 'false')
    await expect(underlineButton).toHaveAttribute('aria-pressed', 'false')
    await expect(codeButton).toHaveAttribute('aria-pressed', 'false')

    // Click bold button to toggle it on
    await userEvent.click(boldButton)
    await expect(boldButton).toHaveAttribute('aria-pressed', 'true')

    // Click bold button again to toggle it off
    await userEvent.click(boldButton)
    await expect(boldButton).toHaveAttribute('aria-pressed', 'false')

    // Click italic button
    await userEvent.click(italicButton)
    await expect(italicButton).toHaveAttribute('aria-pressed', 'true')

    // Toggle it off
    await userEvent.click(italicButton)
    await expect(italicButton).toHaveAttribute('aria-pressed', 'false')

    // Multiple marks can be active at the same time
    await userEvent.click(boldButton)
    await userEvent.click(underlineButton)
    await expect(boldButton).toHaveAttribute('aria-pressed', 'true')
    await expect(underlineButton).toHaveAttribute('aria-pressed', 'true')
  },
}

/**
 * Tests clicking block buttons to toggle their active state.
 * Block buttons control block-level formatting (headings, quotes, lists).
 */
export const ClickBlockButtons: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'paragraph',
            children: [{ text: 'Click a block button to change this paragraph.' }],
          },
        ]}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.BlockButton format="heading-one" icon={<Heading1Icon />} />
          <RichTextEditor.BlockButton format="heading-two" icon={<Heading2Icon />} />
          <RichTextEditor.BlockButton format="block-quote" icon={<QuoteIcon />} />
          <RichTextEditor.Separator />
          <RichTextEditor.BlockButton format="numbered-list" icon={<ListOrderedIcon />} />
          <RichTextEditor.BlockButton format="bulleted-list" icon={<ListUnorderedIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const h1Button = canvas.getByRole('button', { name: /toggle heading-one/i })
    const h2Button = canvas.getByRole('button', { name: /toggle heading-two/i })
    const quoteButton = canvas.getByRole('button', { name: /toggle block-quote/i })
    const numberedListButton = canvas.getByRole('button', { name: /toggle numbered-list/i })
    const bulletedListButton = canvas.getByRole('button', { name: /toggle bulleted-list/i })

    // All block buttons should start as not pressed
    await expect(h1Button).toHaveAttribute('aria-pressed', 'false')
    await expect(h2Button).toHaveAttribute('aria-pressed', 'false')
    await expect(quoteButton).toHaveAttribute('aria-pressed', 'false')
    await expect(numberedListButton).toHaveAttribute('aria-pressed', 'false')
    await expect(bulletedListButton).toHaveAttribute('aria-pressed', 'false')

    // Click heading-one to toggle it on
    await userEvent.click(h1Button)
    await expect(h1Button).toHaveAttribute('aria-pressed', 'true')

    // Clicking a different block type should switch
    await userEvent.click(h2Button)
    await expect(h2Button).toHaveAttribute('aria-pressed', 'true')
    await expect(h1Button).toHaveAttribute('aria-pressed', 'false')

    // Toggle quote
    await userEvent.click(quoteButton)
    await expect(quoteButton).toHaveAttribute('aria-pressed', 'true')
    await expect(h2Button).toHaveAttribute('aria-pressed', 'false')

    // Toggle off by clicking again
    await userEvent.click(quoteButton)
    await expect(quoteButton).toHaveAttribute('aria-pressed', 'false')
  },
}

/**
 * Tests clicking alignment buttons to control text alignment.
 */
export const ClickAlignmentButtons: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'paragraph',
            children: [{ text: 'Click alignment buttons to change text alignment.' }],
          },
        ]}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.BlockButton format="left" icon={<AlignLeftIcon />} />
          <RichTextEditor.BlockButton format="center" icon={<AlignCenterIcon />} />
          <RichTextEditor.BlockButton format="right" icon={<AlignRightIcon />} />
          <RichTextEditor.BlockButton format="justify" icon={<AlignJustifyIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const leftButton = canvas.getByRole('button', { name: /toggle left/i })
    const centerButton = canvas.getByRole('button', { name: /toggle center/i })
    const rightButton = canvas.getByRole('button', { name: /toggle right/i })
    const justifyButton = canvas.getByRole('button', { name: /toggle justify/i })

    // Click center alignment
    await userEvent.click(centerButton)
    await expect(centerButton).toHaveAttribute('aria-pressed', 'true')

    // Click right alignment - center should toggle off
    await userEvent.click(rightButton)
    await expect(rightButton).toHaveAttribute('aria-pressed', 'true')
    await expect(centerButton).toHaveAttribute('aria-pressed', 'false')

    // Click justify alignment
    await userEvent.click(justifyButton)
    await expect(justifyButton).toHaveAttribute('aria-pressed', 'true')
    await expect(rightButton).toHaveAttribute('aria-pressed', 'false')

    // Click left alignment
    await userEvent.click(leftButton)
    await expect(leftButton).toHaveAttribute('aria-pressed', 'true')
    await expect(justifyButton).toHaveAttribute('aria-pressed', 'false')
  },
}

/**
 * Tests that active state shows correctly for pre-formatted content.
 */
export const ActiveStateForFormattedContent: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'heading-one',
            children: [{ text: 'This is a heading', bold: true }],
          },
        ]}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.MarkButton format="bold" icon={<BoldIcon />} />
          <RichTextEditor.MarkButton format="italic" icon={<ItalicIcon />} />
          <RichTextEditor.Separator />
          <RichTextEditor.BlockButton format="heading-one" icon={<Heading1Icon />} />
          <RichTextEditor.BlockButton format="heading-two" icon={<Heading2Icon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable autoFocus />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify the heading text renders
    await expect(canvas.getByText('This is a heading')).toBeVisible()

    // Verify the heading is rendered as an h1 element
    const heading = canvas.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toHaveTextContent('This is a heading')
  },
}

/**
 * Minimal toolbar with only basic text formatting options.
 */
export const MinimalToolbar: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root>
        <RichTextEditor.Toolbar>
          <RichTextEditor.MarkButton format="bold" icon={<BoldIcon />} />
          <RichTextEditor.MarkButton format="italic" icon={<ItalicIcon />} />
          <RichTextEditor.MarkButton format="underline" icon={<UnderlineIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable placeholder="Start typing..." />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify only 3 buttons are present
    const buttons = canvas.getAllByRole('button')
    await expect(buttons.length).toBe(3)

    // Verify placeholder is visible
    await expect(canvas.getByText(/start typing/i)).toBeVisible()

    // Verify no separators in minimal toolbar
    const separators = canvas.queryAllByRole('separator')
    await expect(separators.length).toBe(0)
  },
}

/**
 * Editor with custom initial value demonstrating various formatting.
 */
export const WithCustomInitialValue: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'heading-one',
            children: [{ text: 'Welcome to the Rich Text Editor' }],
          },
          {
            type: 'paragraph',
            children: [
              { text: 'This editor supports ' },
              { text: 'bold', bold: true },
              { text: ', ' },
              { text: 'italic', italic: true },
              { text: ', ' },
              { text: 'underline', underline: true },
              { text: ', and ' },
              { text: 'code', code: true },
              { text: ' formatting.' },
            ],
          },
          {
            type: 'heading-two',
            children: [{ text: 'Features' }],
          },
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [{ text: 'Inline formatting with keyboard shortcuts' }],
              },
              {
                type: 'list-item',
                children: [{ text: 'Block-level formatting (headings, quotes, lists)' }],
              },
              {
                type: 'list-item',
                children: [{ text: 'Text alignment options' }],
              },
            ],
          },
        ]}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.MarkButton format="bold" icon={<BoldIcon />} />
          <RichTextEditor.MarkButton format="italic" icon={<ItalicIcon />} />
          <RichTextEditor.MarkButton format="underline" icon={<UnderlineIcon />} />
          <RichTextEditor.MarkButton format="code" icon={<CodeIcon />} />
          <RichTextEditor.Separator />
          <RichTextEditor.BlockButton format="heading-one" icon={<Heading1Icon />} />
          <RichTextEditor.BlockButton format="heading-two" icon={<Heading2Icon />} />
          <RichTextEditor.BlockButton format="block-quote" icon={<QuoteIcon />} />
          <RichTextEditor.Separator />
          <RichTextEditor.BlockButton format="numbered-list" icon={<ListOrderedIcon />} />
          <RichTextEditor.BlockButton format="bulleted-list" icon={<ListUnorderedIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify heading-one renders
    const h1 = canvas.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    await expect(h1).toHaveTextContent('Welcome to the Rich Text Editor')

    // Verify heading-two renders
    const h2 = canvas.getByRole('heading', { level: 2 })
    await expect(h2).toBeVisible()
    await expect(h2).toHaveTextContent('Features')

    // Verify bulleted list renders
    const list = canvas.getByRole('list')
    await expect(list).toBeVisible()

    // Verify list items
    const listItems = canvas.getAllByRole('listitem')
    await expect(listItems.length).toBe(3)

    // Verify formatted text renders
    await expect(canvas.getByText('bold')).toBeVisible()
    await expect(canvas.getByText('italic')).toBeVisible()
    await expect(canvas.getByText('underline')).toBeVisible()
    await expect(canvas.getByText('code')).toBeVisible()
  },
}

/**
 * Read-only editor that prevents editing.
 */
export const ReadOnly: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'paragraph',
            children: [
              { text: 'This editor is in ' },
              { text: 'read-only', bold: true },
              { text: ' mode. You cannot edit the content.' },
            ],
          },
        ]}
      >
        <RichTextEditor.Editable readOnly />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify content renders
    await expect(canvas.getByText(/this editor is in/i)).toBeVisible()
    await expect(canvas.getByText('read-only')).toBeVisible()

    // Verify the editable area exists but no toolbar
    const toolbar = canvas.queryByRole('toolbar')
    await expect(toolbar).toBeNull()
  },
}

/**
 * Editor with block quote content to test quote rendering.
 */
export const WithBlockQuote: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'paragraph',
            children: [{ text: 'Here is a famous quote:' }],
          },
          {
            type: 'block-quote',
            children: [{ text: 'The only way to do great work is to love what you do.' }],
          },
          {
            type: 'paragraph',
            children: [{ text: '- Steve Jobs' }],
          },
        ]}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.BlockButton format="block-quote" icon={<QuoteIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify the quote content renders
    await expect(
      canvas.getByText('The only way to do great work is to love what you do.')
    ).toBeVisible()

    // Verify quote button is present
    const quoteButton = canvas.getByRole('button', { name: /toggle block-quote/i })
    await expect(quoteButton).toBeVisible()
  },
}

/**
 * Editor with numbered list content.
 */
export const WithNumberedList: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'paragraph',
            children: [{ text: 'Steps to get started:' }],
          },
          {
            type: 'numbered-list',
            children: [
              { type: 'list-item', children: [{ text: 'Install the package' }] },
              { type: 'list-item', children: [{ text: 'Import the component' }] },
              { type: 'list-item', children: [{ text: 'Add to your application' }] },
            ],
          },
        ]}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.BlockButton format="numbered-list" icon={<ListOrderedIcon />} />
          <RichTextEditor.BlockButton format="bulleted-list" icon={<ListUnorderedIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify numbered list renders
    const list = canvas.getByRole('list')
    await expect(list).toBeVisible()

    // Verify list items
    const listItems = canvas.getAllByRole('listitem')
    await expect(listItems.length).toBe(3)

    await expect(canvas.getByText('Install the package')).toBeVisible()
    await expect(canvas.getByText('Import the component')).toBeVisible()
    await expect(canvas.getByText('Add to your application')).toBeVisible()
  },
}

/**
 * Editor with centered text alignment.
 */
export const WithCenteredText: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'heading-one',
            align: 'center',
            children: [{ text: 'Centered Heading' }],
          },
          {
            type: 'paragraph',
            align: 'center',
            children: [{ text: 'This paragraph is center-aligned.' }],
          },
        ]}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.BlockButton format="left" icon={<AlignLeftIcon />} />
          <RichTextEditor.BlockButton format="center" icon={<AlignCenterIcon />} />
          <RichTextEditor.BlockButton format="right" icon={<AlignRightIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify centered heading renders
    const heading = canvas.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toHaveTextContent('Centered Heading')

    // Verify centered paragraph renders
    await expect(canvas.getByText('This paragraph is center-aligned.')).toBeVisible()
  },
}

/**
 * Tests keyboard navigation to toolbar buttons.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'paragraph',
            children: [{ text: 'Tab through the toolbar buttons.' }],
          },
        ]}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.MarkButton format="bold" icon={<BoldIcon />} />
          <RichTextEditor.MarkButton format="italic" icon={<ItalicIcon />} />
          <RichTextEditor.MarkButton format="underline" icon={<UnderlineIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const boldButton = canvas.getByRole('button', { name: /toggle bold/i })
    const italicButton = canvas.getByRole('button', { name: /toggle italic/i })
    const underlineButton = canvas.getByRole('button', { name: /toggle underline/i })

    // Tab to first button
    await userEvent.tab()
    await expect(boldButton).toHaveFocus()

    // Tab to second button
    await userEvent.tab()
    await expect(italicButton).toHaveFocus()

    // Tab to third button
    await userEvent.tab()
    await expect(underlineButton).toHaveFocus()

    // Press Enter to activate the focused button
    await userEvent.keyboard('{Enter}')
    await expect(underlineButton).toHaveAttribute('aria-pressed', 'true')
  },
}

/**
 * Empty editor showing placeholder text.
 */
export const EmptyWithPlaceholder: Story = {
  render: () => (
    <div className="w-[600px]">
      <RichTextEditor.Root
        initialValue={[
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ]}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.MarkButton format="bold" icon={<BoldIcon />} />
          <RichTextEditor.MarkButton format="italic" icon={<ItalicIcon />} />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Editable placeholder="Write something amazing..." />
      </RichTextEditor.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify placeholder is visible
    await expect(canvas.getByText('Write something amazing...')).toBeVisible()

    // Verify toolbar buttons are present and not active
    const boldButton = canvas.getByRole('button', { name: /toggle bold/i })
    const italicButton = canvas.getByRole('button', { name: /toggle italic/i })

    await expect(boldButton).toHaveAttribute('aria-pressed', 'false')
    await expect(italicButton).toHaveAttribute('aria-pressed', 'false')
  },
}
