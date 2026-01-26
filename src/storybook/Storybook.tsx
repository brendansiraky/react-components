import { useState } from 'react'
import { cn } from '../lib/utils'
import { getStories } from './stories'
import type { ComponentStories, Story } from './types'

export function Storybook() {
  const allStories = getStories()
  const [selected, setSelected] = useState<{ component: string; story: string } | null>(
    allStories[0] ? { component: allStories[0].title, story: allStories[0].stories[0]?.name } : null
  )

  const selectedStories = allStories.find((c) => c.title === selected?.component)
  const selectedStory = selectedStories?.stories.find((s) => s.name === selected?.story)

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h1 className="text-lg font-semibold text-gray-900 mb-4">Components</h1>
        <nav className="space-y-4">
          {allStories.map((component) => (
            <ComponentSection
              key={component.title}
              component={component}
              selected={selected}
              onSelect={setSelected}
            />
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {selectedStory ? (
          <div>
            <header className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selected?.component}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{selected?.story}</p>
            </header>
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <selectedStory.component />
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Select a story from the sidebar</div>
        )}
      </main>
    </div>
  )
}

function ComponentSection({
  component,
  selected,
  onSelect,
}: {
  component: ComponentStories
  selected: { component: string; story: string } | null
  onSelect: (selection: { component: string; story: string }) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-1">{component.title}</h3>
      <ul className="space-y-1">
        {component.stories.map((story) => (
          <StoryItem
            key={story.name}
            story={story}
            isSelected={selected?.component === component.title && selected?.story === story.name}
            onSelect={() => onSelect({ component: component.title, story: story.name })}
          />
        ))}
      </ul>
    </div>
  )
}

function StoryItem({
  story,
  isSelected,
  onSelect,
}: {
  story: Story
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        onClick={onSelect}
        className={cn(
          'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
          isSelected
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        {story.name}
      </button>
    </li>
  )
}
