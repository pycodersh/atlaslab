'use client'

import Link from 'next/link'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'

const LEVEL_COLORS = {
  beginner: { bg: '#E8F5E9', text: '#388E3C' },
  intermediate: { bg: '#FFF3E0', text: '#F57C00' },
  advanced: { bg: '#FCE4EC', text: '#C62828' },
}

export default function KPattoStoryListPage() {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pm)' }}>
          K-PATTO
        </div>
        <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>
          STORY
        </h1>
      </div>

      {/* Story list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ALL_STORIES.map((story) => {
          const level = LEVEL_COLORS[story.level]
          return (
            <Link
              key={story.id}
              href={`/kpatto/story/${story.id}`}
              style={{
                display: 'block',
                background: 'var(--pb)',
                border: '1px solid var(--border, rgba(0,0,0,0.08))',
                borderRadius: 16,
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'var(--pt)',
              }}
            >
              {/* Thumbnail placeholder */}
              {!story.thumbnail_url && (
                <div style={{
                  width: '100%',
                  height: 120,
                  background: 'linear-gradient(135deg, #FFE4EC 0%, #FFD0DE 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                }}>
                  🎬
                </div>
              )}

              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm)' }}>
                    EP {String(story.episode).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 99,
                    background: level.bg,
                    color: level.text,
                  }}>
                    {story.level.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--pm)' }}>{story.theme}</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{story.title}</div>
                <div style={{ fontSize: 12, color: 'var(--pm)', marginTop: 4 }}>
                  패턴 {story.tags.length}개 · 단어 {story.vocabulary_ids.length}개 · {story.panels.length}컷
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
