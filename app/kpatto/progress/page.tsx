'use client'

import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'

export default function KPattoProgressPage() {
  const totalStories = ALL_STORIES.length
  const totalPatterns = KPATTO_PATTERNS.length

  return (
    <div style={{ minHeight: '100vh', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pm)' }}>
          K-PATTO
        </div>
        <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>
          PROGRESS
        </h1>
      </div>

      {/* Stats grid */}
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: '완료 에피소드', value: 0, total: totalStories, emoji: '📚' },
          { label: '학습한 패턴', value: 0, total: totalPatterns, emoji: '✏️' },
          { label: '연속 학습일', value: 0, total: null, emoji: '🔥' },
          { label: '오늘 학습 시간', value: 0, total: null, unit: '분', emoji: '⏱️' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--pb)',
              border: '1px solid var(--border, rgba(0,0,0,0.08))',
              borderRadius: 16,
              padding: '16px 14px',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.emoji}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--pt)', lineHeight: 1 }}>
              {stat.value}
              {stat.total !== null && (
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pm)' }}>
                  /{stat.total}
                </span>
              )}
              {stat.unit && (
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pm)' }}>
                  {stat.unit}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--pm)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Episode progress list */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--pm)', marginBottom: 12 }}>
          EPISODE PROGRESS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALL_STORIES.map((story) => (
            <div
              key={story.id}
              style={{
                background: 'var(--pb)',
                border: '1px solid var(--border, rgba(0,0,0,0.08))',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'var(--pb-alt, rgba(0,0,0,0.05))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--pm)',
                flexShrink: 0,
              }}>
                {String(story.episode).padStart(2, '0')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--pt)' }}>{story.title}</div>
                <div style={{ fontSize: 11, color: 'var(--pm)', marginTop: 2 }}>
                  {story.panels.length}컷 · 패턴 {story.tags.length}개
                </div>
              </div>
              {/* Progress bar placeholder */}
              <div style={{
                width: 52,
                height: 6,
                background: 'var(--pb-alt, rgba(0,0,0,0.07))',
                borderRadius: 99,
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                <div style={{
                  width: '0%',
                  height: '100%',
                  background: '#FF6B8C',
                  borderRadius: 99,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
