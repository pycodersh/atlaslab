'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
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

// Shared Full-screen State button tokens (mirrors CompletionScreen)
const FS_PRIMARY: React.CSSProperties = {
  width: '100%', height: 56, borderRadius: 18,
  border: 'none',
  background: '#2C2C32',
  fontSize: 15, fontWeight: 700,
  color: '#FFFFFF',
  cursor: 'pointer', fontFamily: 'inherit',
}

const FS_SECONDARY: React.CSSProperties = {
  width: '100%', height: 48,
  border: 'none', background: 'transparent',
  fontSize: 13.5, fontWeight: 500,
  color: 'var(--pm)',
  cursor: 'pointer', fontFamily: 'inherit',
}

function UpgradeWall({ storyTitle, storyId }: { storyTitle: string; storyId: number }) {
  const router = useRouter()
  const prevId = storyId > 1 ? storyId - 1 : null
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
        background: 'rgba(142,167,255,0.10)',
        border: '1px solid rgba(142,167,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Lock size={28} strokeWidth={1.8} color="#5C6BC0" />
      </div>

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
        <button
          type="button"
          onClick={() => router.push('/patto/settings/subscription')}
          className="trainer-btn trainer-btn-primary"
          style={{ height: 52, fontSize: 15, fontWeight: 700, borderRadius: 14, flex: 'none', width: '100%' }}
        >
          Upgrade to Premium
        </button>
        <button
          type="button"
          onClick={() => router.push(prevId ? `/patto/stories/${prevId}` : '/patto/stories/1')}
          className="trainer-btn trainer-btn-secondary"
          style={{ height: 44, fontSize: 14, borderRadius: 14, flex: 'none', width: '100%' }}
        >
          Go back
        </button>
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

  if (locked) return <UpgradeWall storyTitle={story.title} storyId={story.id} />

  return (
    <MagazineEngine
      story={story}
      allStories={allStories}
      patternExamples={patternExamples}
    />
  )
}
