'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { MagazineEngine } from '@/components/MagazineEngine'
import { getPlan, FREE_STORY_LIMIT } from '@/lib/subscription/storage'
import type { MagazineStory } from '@/types/magazine'
import type { PracticeExample } from '@/data/pattern-examples'

type Props = {
  story: MagazineStory
  allStories: MagazineStory[]
  initialView?: 'story' | 'patterns'  // kept for backwards compat, unused
  patternExamples?: Record<string, PracticeExample[]>
}


function UpgradeWall({ storyTitle }: { storyTitle: string }) {
  const router = useRouter()
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 32px', textAlign: 'center',
      background: 'transparent',
    }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 22, marginBottom: 20,
        background: 'rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32,
      }}>🔒</div>

      {/* Eyebrow */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pm)', margin: '0 0 8px' }}>
        Premium Story
      </p>

      {/* Title */}
      <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--pt)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
        &ldquo;{storyTitle}&rdquo;
      </p>

      {/* Description */}
      <p style={{ fontSize: 13.5, color: 'var(--pm)', margin: '0 0 36px', lineHeight: 1.7, maxWidth: 280 }}>
        Free plan includes the first {FREE_STORY_LIMIT} stories.<br />Upgrade to unlock all stories.
      </p>

      {/* Buttons */}
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Btn variant="primary" onClick={() => router.push('/patto/settings/subscription')} style={{ width: '100%' }}>Upgrade</Btn>
        <Btn variant="ghost" onClick={() => router.back()} style={{ width: '100%' }}>Go back</Btn>
      </div>
    </div>
  )
}

export function StoryPageClient({ story, allStories, initialView = 'story', patternExamples }: Props) {
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (getPlan() === 'free' && story.id > FREE_STORY_LIMIT) {
      setLocked(true)
    }
  }, [story.id])

  if (locked) return <UpgradeWall storyTitle={story.title} />

  return (
    <MagazineEngine
      story={story}
      allStories={allStories}
      patternExamples={patternExamples}
    />
  )
}
