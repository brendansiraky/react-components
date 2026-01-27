import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion } from '.'

const meta = {
  title: 'Components/Accordion',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
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
          Yes. It comes with default styles that match the design system.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Is it animated?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. It's animated by default, but you can disable it if you prefer.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
}

export const Multiple: Story = {
  render: () => (
    <Accordion.Root type="multiple" className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>Can I open multiple items?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. Set <code className="bg-neutral-100 px-1 rounded">type="multiple"</code> to allow multiple items to be open at the same time.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>What about keyboard navigation?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Full keyboard support is included. Use arrow keys to navigate between items and Enter/Space to toggle.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Is it composable?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. Each part can be customized or replaced as needed while maintaining accessibility.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
}

export const DefaultOpen: Story = {
  render: () => (
    <Accordion.Root type="single" defaultValue="item-2" collapsible className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>First item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          This item is closed by default.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Second item (default open)</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          This item is open by default because <code className="bg-neutral-100 px-1 rounded">defaultValue="item-2"</code> is set.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Third item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          This item is closed by default.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Accordion.Root type="single" collapsible className="w-96">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>Enabled item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          This item can be opened and closed.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2" disabled>
        <Accordion.Header>
          <Accordion.Trigger>Disabled item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          This content won't be accessible.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Header>
          <Accordion.Trigger>Another enabled item</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          This item can also be opened and closed.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  ),
}
