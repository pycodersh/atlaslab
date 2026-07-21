'use client'

import { use } from 'react'
import { notFound, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePreferences } from '@/contexts/PreferencesContext'
import { StoryPanel } from '@/components/kpatto/StoryPanel'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'
import type { KPattoLanguage } from '@/data/kpatto/types'

// Build a pattern lookup map
const PATTERN_MAP = Object.fromEntries(KPATTO_PATTERNS.map(p => [p.id, p]))

interface PageProps {
  params: Promise<{ id: string }>
}

function WelcomeBanner() {
  return (
    <div style={{
      margin: '0 16px 16px',
      background: 'linear-gradient(135deg, #22C55E18, #16A34A18)',
      border: '1.5px solid #22C55E40',
      borderRadius: 14,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{ fontSize: 22 }}>🎉</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>한글 기초 완료!</div>
        <div style={{ fontSize: 12, color: '#16A34A' }}>이제 웹툰 스토리로 한국어를 배워요.</div>
      </div>
    </div>
  )
}

export default function KPattoStoryPage({ params }: PageProps) {
  const { id } = use(params)
  const { prefs } = usePreferences()
  const searchParams = useSearchParams()
  const showWelcome = searchParams.get('welcome') === '1'
  const story = ALL_STORIES.find(s => s.id === id)

  if (!story) notFound()

  // Map PATTO's Language type to KPattoLanguage (they share the same values)
  const displayLang = (prefs.language ?? 'en') as KPattoLanguage

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32,
      maxWidth: 600,
      margin: '0 auto',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--pb)',
        borderBottom: '1px solid var(--border, rgba(0,0,0,0.06))',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <Link
          href="/kpatto/story"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'var(--pb-alt, rgba(0,0,0,0.05))',
            textDecoration: 'none',
            color: 'var(--pt)',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          ‹
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: 'var(--pm)', fontWeight: 700, letterSpacing: '0.06em' }}>
            EP {String(story.episode).padStart(2, '0')} · {story.theme}
          </div>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--pt)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {story.title}
          </div>
        </div>
      </div>

      {/* Welcome banner (shown after pre-course completion) */}
      {showWelcome && <WelcomeBanner />}

      {/* Story panels — vertical scroll */}
      <div style={{ paddingTop: showWelcome ? 0 : 16 }}>
        {story.panels.map((panel, index) => (
          <StoryPanel
            key={panel.id}
            panel={panel}
            panelIndex={index}
            patterns={PATTERN_MAP}
            displayLang={displayLang}
          />
        ))}
      </div>

      {/* Completion footer */}
      <div style={{
        margin: '24px 16px 0',
        background: 'linear-gradient(135deg, #FF6B8C 0%, #FF8C6B 100%)',
        borderRadius: 20,
        padding: '24px 20px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>에피소드 완료!</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.85 }}>
          패턴 {story.tags.length}개를 학습했어요
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link
            href="/kpatto/story"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              padding: '9px 18px',
              borderRadius: 99,
              textDecoration: 'none',
            }}
          >
            목록으로
          </Link>
          <Link
            href="/kpatto/progress"
            style={{
              background: '#fff',
              color: '#FF6B8C',
              fontWeight: 700,
              fontSize: 13,
              padding: '9px 18px',
              borderRadius: 99,
              textDecoration: 'none',
            }}
          >
            진행현황 보기
          </Link>
        </div>
      </div>
    </div>
  )
}
