'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// One illustration per story — reused by all patterns in that story
const STORY_ILLUSTRATIONS: Record<number, string> = {
  1: '🌱', 2: '👋', 3: '☀️', 4: '🌙', 5: '☕',
  6: '🔀', 7: '🏔️', 8: '✈️', 9: '🎒', 10: '📚',
  11: '💬', 12: '🎁', 13: '📅', 14: '🏥', 15: '🏦',
  16: '🛒', 17: '🏨', 18: '🚕', 19: '🌤️', 20: '🏃',
}

function storyIllustration(storyId: number): string {
  return STORY_ILLUSTRATIONS[storyId] ?? STORY_ILLUSTRATIONS[((storyId - 1) % 20) + 1] ?? '✨'
}

import type { MagazinePattern } from '@/types/magazine'
import type { PracticeExample } from '@/data/pattern-examples'
import { usePreferences } from '@/contexts/PreferencesContext'
import { type VoiceKey } from '@/lib/settings/preferences'
import { PatternPracticeCard } from '@/components/PatternPracticeCard'

type Props = {
  storyId: number
  storyTitle: string
  narratorVoice?: VoiceKey
  pattern: MagazinePattern
  examples: PracticeExample[]
  patternIndex: number   // 1-based
  patternTotal: number
  prevPid: string | null
  nextPid: string | null
}

export function PatternDetail({
  storyId, storyTitle, narratorVoice, pattern, examples,
  patternIndex, patternTotal, prevPid, nextPid,
}: Props) {
  const router = useRouter()
  const { prefs } = usePreferences()
  const voice: VoiceKey = narratorVoice ?? prefs.voice

  // Show only first 3 examples for a cleaner learning flow
  const displayExamples = examples.slice(0, 3)

  return (
    <div style={{ minHeight: '100dvh', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px 4px' }}>
        <button
          type="button"
          aria-label="패턴 목록"
          onClick={() => router.push(`/stories/${storyId}?v=p`)}
          style={{
            padding: '8px',
            marginLeft: -8,
            borderRadius: '50%',
            color: 'var(--pm)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft style={{ width: 20, height: 20 }} strokeWidth={1.6} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 120px' }}>
        {/* ── 학습 흐름 헤더 ── */}
        <div style={{ paddingTop: 8, paddingBottom: 20 }}>
          <p style={{
            fontSize: 10,
            letterSpacing: '0.28em',
            fontWeight: 700,
            color: 'var(--pa)',
            marginBottom: 6,
          }}>
            STORY {String(storyId).padStart(2, '0')}
          </p>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--pt)',
            lineHeight: 1.15,
            marginBottom: 12,
            letterSpacing: '-0.02em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            {storyTitle}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--pm)',
            }}>
              Pattern {patternIndex} / {patternTotal}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {Array.from({ length: patternTotal }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    borderRadius: 9999,
                    transition: 'all 0.2s ease',
                    width: i + 1 === patternIndex ? 16 : 6,
                    height: 6,
                    background: i + 1 === patternIndex ? 'var(--pa)' : 'var(--pd)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Pattern Card (glass) ── */}
        <div className="glass-card" style={{ padding: '20px 22px 24px', marginBottom: 12 }}>
          {/* Story illustration */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: 14,
              background: 'var(--pal)',
              border: '1px solid var(--pacb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              {storyIllustration(storyId)}
            </div>
          </div>
          <PatternPracticeCard
            storyId={storyId}
            storyTitle={storyTitle}
            voice={voice}
            pattern={pattern}
            examples={displayExamples}
            index={patternIndex}
            active
            onRequestPlay={() => {}}
          />
        </div>

        {/* ── 이전 / 다음 Pattern ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <button
          type="button"
          aria-label="이전 패턴"
          onClick={() => prevPid && router.push(`/stories/${storyId}/patterns/${prevPid}`)}
          disabled={!prevPid}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            border: 'none',
            cursor: prevPid ? 'pointer' : 'not-allowed',
            color: prevPid ? 'var(--pm)' : 'var(--pd)',
            background: prevPid ? 'var(--pal)' : 'transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={1.8} /> 이전 패턴
        </button>

        <span style={{
          fontSize: 10,
          letterSpacing: '0.15em',
          color: 'var(--pm2)',
          fontWeight: 600,
        }}>
          {patternIndex} / {patternTotal}
        </span>

        <button
          type="button"
          aria-label="다음 패턴"
          onClick={() => nextPid && router.push(`/stories/${storyId}/patterns/${nextPid}`)}
          disabled={!nextPid}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            border: 'none',
            cursor: nextPid ? 'pointer' : 'not-allowed',
            color: nextPid ? 'var(--pm)' : 'var(--pd)',
            background: nextPid ? 'var(--pal)' : 'transparent',
            transition: 'all 0.15s ease',
          }}
        >
          다음 패턴 <ChevronRight style={{ width: 16, height: 16 }} strokeWidth={1.8} />
        </button>
        </div>
      </div>
    </div>
  )
}
