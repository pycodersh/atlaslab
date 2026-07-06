'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MagazineEngine } from '@/components/MagazineEngine'
import { getPlan, FREE_STORY_LIMIT } from '@/lib/subscription/storage'
import type { MagazineStory } from '@/types/magazine'
import type { PracticeExample } from '@/data/pattern-examples'

type Props = {
  story: MagazineStory
  allStories: MagazineStory[]
  initialView?: 'story' | 'patterns'
  patternExamples?: Record<string, PracticeExample[]>
}

function UpgradeWall({ storyTitle }: { storyTitle: string }) {
  const router = useRouter()
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 32px', textAlign: 'center',
      background: 'var(--pb)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, marginBottom: 20,
        background: 'rgba(74,111,168,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>🔒</div>
      <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--pt)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
        Premium Story
      </p>
      <p style={{ fontSize: 13, color: 'var(--pm)', margin: '0 0 6px', lineHeight: 1.6, maxWidth: 280 }}>
        "{storyTitle}"
      </p>
      <p style={{ fontSize: 12, color: 'var(--pm2)', margin: '0 0 32px', lineHeight: 1.6, maxWidth: 280 }}>
        Free plan includes the first {FREE_STORY_LIMIT} stories.{'\n'}Upgrade to unlock all stories.
      </p>
      <button
        type="button"
        onClick={() => router.push('/settings/subscription')}
        style={{
          background: '#4A6FA8', color: '#fff', border: 'none',
          borderRadius: 14, padding: '13px 32px',
          fontSize: 13.5, fontWeight: 700, letterSpacing: '0.06em',
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 18px rgba(74,111,168,0.30)',
          marginBottom: 14,
        }}
      >
        Upgrade to Premium
      </button>
      <button
        type="button"
        onClick={() => router.back()}
        style={{
          background: 'none', border: 'none', color: 'var(--pm)',
          fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: '8px',
        }}
      >
        ← Go back
      </button>
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
      initialView={initialView}
      patternExamples={patternExamples}
    />
  )
}
