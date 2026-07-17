'use client'

import { useRouter } from 'next/navigation'
import type { MagazineStory } from '@/types/magazine'
import type { StoryRoundData } from '@/lib/srs/story-round'
import { nextReviewLabel } from '@/lib/srs/story-round'
import { useTheme } from '@/components/ThemeProvider'

type Props = {
  story: MagazineStory
  roundData: StoryRoundData
}

export function StoryCompletionScreen({ story, roundData }: Props) {
  const router   = useRouter()
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
        {isMastered ? '이 스토리 완전 마스터!' : '오늘 학습 완료!'}
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
            다음 복습: {reviewLabel}
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
          홈으로
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
          에세이 써보기
        </button>
      </div>
    </div>
  )
}
