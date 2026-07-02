'use client'

import { MagazineEngine } from '@/components/MagazineEngine'
import type { MagazineStory } from '@/types/magazine'
import type { PracticeExample } from '@/data/pattern-examples'

type Props = {
  story: MagazineStory
  allStories: MagazineStory[]
  initialView?: 'story' | 'patterns'
  patternExamples?: Record<string, PracticeExample[]>
}

export function StoryPageClient({ story, allStories, initialView = 'story', patternExamples }: Props) {
  return (
    <MagazineEngine
      story={story}
      allStories={allStories}
      initialView={initialView}
      patternExamples={patternExamples}
    />
  )
}
