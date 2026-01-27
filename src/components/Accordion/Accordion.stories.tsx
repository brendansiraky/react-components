import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within, userEvent } from 'storybook/test'
import { Accordion } from '.'

const meta = {
  title: 'Components/Accordion',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Accordion.Root type="single" collapsible className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. It adheres to the WAI-ARIA design pattern.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Is it styled?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. It comes with default styles that match the other components.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Is it animated?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. It uses CSS animations for smooth expand and collapse transitions.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // All items should be collapsed initially
    const triggers = canvas.getAllByRole('button')
    expect(triggers).toHaveLength(3)

    // Verify all triggers have aria-expanded="false" initially
    for (const trigger of triggers) {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    }
  },
}

export const ClickToExpand: Story = {
  render: () => (
    <Accordion.Root type="single" collapsible className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. It adheres to the WAI-ARIA design pattern.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Is it styled?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. It comes with default styles that match the other components.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstTrigger = canvas.getByRole('button', { name: /is it accessible/i })

    // Click to expand
    await userEvent.click(firstTrigger)
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText(/adheres to the WAI-ARIA/i)).toBeVisible()
  },
}

export const ClickToCollapse: Story = {
  render: () => (
    <Accordion.Root type="single" collapsible className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. It adheres to the WAI-ARIA design pattern.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Is it styled?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. It comes with default styles that match the other components.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstTrigger = canvas.getByRole('button', { name: /is it accessible/i })

    // Click to expand
    await userEvent.click(firstTrigger)
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')

    // Click again to collapse (collapsible mode)
    await userEvent.click(firstTrigger)
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false')
  },
}

export const SingleModeClosesOthers: Story = {
  render: () => (
    <Accordion.Root type="single" collapsible className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>First item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>First item content</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Second item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Second item content</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstTrigger = canvas.getByRole('button', { name: /first item/i })
    const secondTrigger = canvas.getByRole('button', { name: /second item/i })

    // Open first item
    await userEvent.click(firstTrigger)
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'false')

    // Open second item - first should close
    await userEvent.click(secondTrigger)
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false')
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true')
  },
}

export const MultipleMode: Story = {
  render: () => (
    <Accordion.Root type="multiple" className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>Can I open multiple items?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. Set type to "multiple" to allow multiple items to be open simultaneously.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>What about single mode?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          In single mode, only one item can be open at a time. Opening another item closes the previous one.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>What is collapsible?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          When collapsible is true in single mode, clicking an open item will close it. Otherwise, one item must always remain open.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstTrigger = canvas.getByRole('button', { name: /can i open multiple/i })
    const secondTrigger = canvas.getByRole('button', { name: /what about single/i })

    // Open first item
    await userEvent.click(firstTrigger)
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')

    // Open second item - first should remain open
    await userEvent.click(secondTrigger)
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true')

    // Both contents should be visible
    await expect(canvas.getByText(/set type to "multiple"/i)).toBeVisible()
    await expect(canvas.getByText(/only one item can be open/i)).toBeVisible()
  },
}

export const KeyboardNavigation: Story = {
  render: () => (
    <Accordion.Root type="single" collapsible className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>First section</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>First section content</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Second section</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Second section content</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Third section</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Third section content</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstTrigger = canvas.getByRole('button', { name: /first section/i })
    const secondTrigger = canvas.getByRole('button', { name: /second section/i })

    // Tab to first trigger
    await userEvent.tab()
    await expect(firstTrigger).toHaveFocus()

    // Press Enter to expand
    await userEvent.keyboard('{Enter}')
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByText(/first section content/i)).toBeVisible()

    // Tab to second trigger
    await userEvent.tab()
    await expect(secondTrigger).toHaveFocus()

    // Press Space to expand second (closes first in single mode)
    await userEvent.keyboard(' ')
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false')
  },
}

export const DisabledItem: Story = {
  render: () => (
    <Accordion.Root type="single" collapsible className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>Enabled item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>This item can be expanded.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2" disabled>
        <Accordion.Header>
          <Accordion.Trigger>Disabled item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>This content should not be reachable.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Another enabled item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>This item can also be expanded.</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const enabledTrigger = canvas.getByRole('button', { name: /enabled item/i })
    const disabledTrigger = canvas.getByRole('button', { name: /disabled item/i })

    // Disabled trigger should have disabled attribute
    await expect(disabledTrigger).toBeDisabled()

    // Click on disabled trigger should not expand
    await userEvent.click(disabledTrigger)
    await expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false')

    // Enabled trigger should work
    await userEvent.click(enabledTrigger)
    await expect(enabledTrigger).toHaveAttribute('aria-expanded', 'true')
  },
}

export const DefaultExpanded: Story = {
  render: () => (
    <Accordion.Root type="single" collapsible defaultValue="item-2" className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>First item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>First item content</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Second item (default open)</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          This item is expanded by default using defaultValue.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Third item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Third item content</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstTrigger = canvas.getByRole('button', { name: /first item/i })
    const secondTrigger = canvas.getByRole('button', { name: /second item/i })
    const thirdTrigger = canvas.getByRole('button', { name: /third item/i })

    // Second item should be expanded by default
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false')
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(thirdTrigger).toHaveAttribute('aria-expanded', 'false')

    // Content should be visible
    await expect(canvas.getByText(/expanded by default/i)).toBeVisible()
  },
}

export const DefaultExpandedMultiple: Story = {
  render: () => (
    <Accordion.Root type="multiple" defaultValue={['item-1', 'item-3']} className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>First item (default open)</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>First item is open by default.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Second item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Second item content</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Third item (default open)</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Third item is also open by default.</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstTrigger = canvas.getByRole('button', { name: /first item/i })
    const secondTrigger = canvas.getByRole('button', { name: /second item/i })
    const thirdTrigger = canvas.getByRole('button', { name: /third item/i })

    // First and third should be expanded by default
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'false')
    await expect(thirdTrigger).toHaveAttribute('aria-expanded', 'true')

    // Both default-open contents should be visible
    await expect(canvas.getByText(/first item is open/i)).toBeVisible()
    await expect(canvas.getByText(/third item is also open/i)).toBeVisible()
  },
}

export const ArrowKeyNavigation: Story = {
  render: () => (
    <Accordion.Root type="single" collapsible className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>First section</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>First section content</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Second section</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Second section content</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Third section</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Third section content</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstTrigger = canvas.getByRole('button', { name: /first section/i })
    const secondTrigger = canvas.getByRole('button', { name: /second section/i })
    const thirdTrigger = canvas.getByRole('button', { name: /third section/i })

    // Focus first trigger
    await userEvent.tab()
    await expect(firstTrigger).toHaveFocus()

    // Arrow down moves to next trigger
    await userEvent.keyboard('{ArrowDown}')
    await expect(secondTrigger).toHaveFocus()

    // Arrow down again
    await userEvent.keyboard('{ArrowDown}')
    await expect(thirdTrigger).toHaveFocus()

    // Arrow down wraps to first
    await userEvent.keyboard('{ArrowDown}')
    await expect(firstTrigger).toHaveFocus()

    // Arrow up wraps to last
    await userEvent.keyboard('{ArrowUp}')
    await expect(thirdTrigger).toHaveFocus()
  },
}

export const HomeEndKeyNavigation: Story = {
  render: () => (
    <Accordion.Root type="single" collapsible className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>First section</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>First section content</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Second section</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Second section content</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Third section</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Third section content</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const firstTrigger = canvas.getByRole('button', { name: /first section/i })
    const thirdTrigger = canvas.getByRole('button', { name: /third section/i })

    // Focus first trigger
    await userEvent.tab()
    await expect(firstTrigger).toHaveFocus()

    // End key moves to last trigger
    await userEvent.keyboard('{End}')
    await expect(thirdTrigger).toHaveFocus()

    // Home key moves to first trigger
    await userEvent.keyboard('{Home}')
    await expect(firstTrigger).toHaveFocus()
  },
}
