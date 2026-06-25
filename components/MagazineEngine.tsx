'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { BookmarkNav } from '@/components/BookmarkNav'
import { PatternsPage } from '@/components/PatternsPage'
import { StoryPage } from '@/components/StoryPage'
import { WheelPicker } from '@/components/WheelPicker'
import type { MagazineStory } from '@/types/magazine'

type MagazineEngineProps = {
  story: MagazineStory
  allStories: MagazineStory[]
}

export function MagazineEngine({ story, allStories }: MagazineEngineProps) {
  const router = useRouter()
  const [view, setView] = useState<'story' | 'patterns'>('story')
  const [showPicker, setShowPicker] = useState(false)

  function goToStory(id: number) {
    setView('story')
    router.push(`/stories/${id}`)
  }

  function goNextStory() {
    const next = allStories.find((s) => s.id === story.id + 1)
    if (next) {
      setView('story')
      router.push(`/stories/${next.id}`)
    }
  }

  function goPrevStory() {
    const prev = allStories.find((s) => s.id === story.id - 1)
    if (prev) {
      setView('story')
      router.push(`/stories/${prev.id}`)
    }
  }

  return (
    // Outer clip: exactly viewport height, hides the off-screen page
    <div className="w-full overflow-hidden" style={{ height: '100dvh' }}>
      {/* Fixed left bookmark nav */}
      <BookmarkNav activeTab="STUDY" />

      {/* Wheel picker overlay */}
      {showPicker && (
        <WheelPicker
          stories={allStories}
          currentId={story.id}
          onSelect={goToStory}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Sliding rail: 200% wide, two 50%-wide pages side by side */}
      <div
        className="flex h-full"
        style={{
          width: '200%',
          transform: view === 'story' ? 'translateX(0)' : 'translateX(-50%)',
          transition: 'transform 480ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        {/* Story page — left slot */}
        <div className="h-full overflow-hidden" style={{ width: '50%' }}>
          <StoryPage
            story={story}
            totalStories={allStories.length}
            onNext={() => setView('patterns')}
            onPrevStory={story.id > 1 ? goPrevStory : undefined}
            onOpenPicker={() => setShowPicker(true)}
          />
        </div>

        {/* Patterns page — right slot */}
        <div className="h-full overflow-hidden" style={{ width: '50%' }}>
          <PatternsPage
            story={story}
            totalStories={allStories.length}
            onPrev={() => setView('story')}
            onNext={goNextStory}
            onOpenPicker={() => setShowPicker(true)}
          />
        </div>
      </div>
    </div>
  )
}
