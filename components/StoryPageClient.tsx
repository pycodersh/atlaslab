'use client'

import { useState } from 'react'
import { MagazineEngine } from '@/components/MagazineEngine'
import { IntroVideoScreen } from '@/components/IntroVideoScreen'
import type { MagazineStory } from '@/types/magazine'

type Props = {
  story: MagazineStory
  allStories: MagazineStory[]
  initialView?: 'story' | 'patterns'
}

export function StoryPageClient({ story, allStories, initialView = 'story' }: Props) {
  const intro    = story.introVideo
  const eligible = intro?.enabled === true && !!intro.url

  const [introDone, setIntroDone] = useState(false)

  return (
    <>
      <MagazineEngine
        story={story}
        allStories={allStories}
        initialView={initialView}
      />

      {eligible && !introDone && intro && (
        <IntroVideoScreen
          story={story}
          intro={intro}
          onComplete={() => setIntroDone(true)}
        />
      )}
    </>
  )
}
