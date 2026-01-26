import type { ComponentType } from 'react'

export interface StoryMeta {
  title: string
  component: ComponentType
}

export interface StoryModule {
  default: StoryMeta
  [key: string]: StoryMeta | ComponentType
}

export interface Story {
  name: string
  component: ComponentType
}

export interface ComponentStories {
  title: string
  stories: Story[]
}
