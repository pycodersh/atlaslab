'use client'

import { useRouter } from 'next/navigation'
import type { MagazineStory } from '@/types/magazine'
import type { StoryRoundData } from '@/lib/srs/story-round'
import { nextReviewLabel } from '@/lib/srs/story-round'
import { useTheme } from '@/components/ThemeProvider'
import { useT } from '@/hooks/useT'

type Props = {
  story: MagazineStory
  roundData: StoryRoundData
}

export function StoryCompletionScreen({ story, roundData }: Props) {
  const router   = useRouter()
  const t        = useT()
  const { theme } = useTheme()
  const isDark   = theme === 'dark'

  const isMastered   = roundData.isMastered
  const reviewLabel  = nextReviewLabel(roundData)
  const textPrimary  = isDark ? 'rgba(255,255,255,0.95)' : '#1a1a2e'
  const textSecondary= isDark ? 'rgba(255,255,255,0.55)' : '#5a5a7a'
  const accent       = isDark ? '#8FABFF' : '#8EA7FF'

  return (
    <div style={{
      padding: '36px 24px 48px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 6 }}>
        {isMastered ? '🎉' : '✅'}
      </div>

      <h2 style={{
        margin: 0, fontSize: 20, fontWeight: 800, color: textPrimary, textAlign: 'center',
      }}>
        {isMastered ? t('storyComplete') : t('home_done_title')}
      </h2>

      <p style={{ margin: '4px 0 0', fontSize: 13, color: textSecondary, textAlign: 'center' }}>
        {story.title} · 패턴 {story.patterns.length}개
      </p>

      {!isMastered && reviewLabel && (
        <div style={{
          marginTop: 14, padding: '10px 22px', borderRadius: 12,
          background: isDark ? 'rgba(143,171,255,0.14)' : 'rgba(142,167,255,0.10)',
          border: `1px solid ${accent}44`,
        }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: accent, textAlign: 'center' }}>
            {t('nextReview')}: {reviewLabel}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 22, width: '100%' }}>
        <button
          type="button"
          onClick={() => router.push('/patto/home')}
          style={{
            flex: 1, height: 48, borderRadius: 14, cursor: 'pointer',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(142,167,255,0.28)'}`,
            background: 'transparent',
            fontSize: 14, fontWeight: 600, color: textPrimary, fontFamily: 'inherit',
          }}
        >
          {t('goHome')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/patto/essays')}
          style={{
            flex: 1, height: 48, borderRadius: 14, cursor: 'pointer',
            border: 'none', background: accent,
            fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'inherit',
          }}
        >
          {t('tryWriting')}
        </button>
      </div>
    </div>
  )
}
