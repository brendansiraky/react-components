import type { ComponentStories, StoryModule } from './types'

// Import all story files here
import * as ButtonStories from '../components/button/Button.stories'

const storyModules: StoryModule[] = [
  ButtonStories,
]

export function getStories(): ComponentStories[] {
  return storyModules.map((module) => {
    const { default: meta, ...stories } = module
    return {
      title: meta.title,
      stories: Object.entries(stories).map(([name, component]) => ({
        name,
        component: component as React.ComponentType,
      })),
    }
  })
}
