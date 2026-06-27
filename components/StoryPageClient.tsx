'use client'

import { MagazineEngine } from '@/components/MagazineEngine'
import type { MagazineStory } from '@/types/magazine'

type Props = {
  story: MagazineStory
  allStories: MagazineStory[]
  initialView?: 'story' | 'patterns'
}

export function StoryPageClient({ story, allStories, initialView = 'story' }: Props) {
  return (
    <MagazineEngine
      story={story}
      allStories={allStories}
      initialView={initialView}
    />
  )
}
