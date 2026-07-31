'use client'

import { CheckCircle2, Unlock, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { usePreferences } from '@/contexts/PreferencesContext'
import { getUI } from '@/lib/kpatto/ui-strings'

interface LessonCompleteProps {
  lessonId: number
  passed: boolean
  score?: number
  total?: number
  onRetry?: () => void
  onContinue: () => void
}

export function LessonComplete({ lessonId, passed, score, total, onRetry, onContinue }: LessonCompleteProps) {
  const { prefs } = usePreferences()
  const t = getUI(prefs.language)

  const isStoryUnlock = lessonId === 6 && passed
  const hasQuiz = total !== undefined && total > 0

  return (
    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        {passed
          ? isStoryUnlock
            ? <Unlock size={44} strokeWidth={1.8} color="#D4873A" />
            : <CheckCircle2 size={44} strokeWidth={1.8} color="#D4873A" />
          : <RefreshCw size={44} strokeWidth={1.8} color="#888888" />
        }
      </div>

      {hasQuiz && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 4,
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: passed ? '#D4873A' : '#888888' }}>
            {score}
          </span>
          <span style={{ fontSize: 22, color: '#AAAAAA' }}>/ {total}</span>
        </div>
      )}

      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>
        {passed
          ? isStoryUnlock ? t.lc_master : t.lc_passed
          : t.lc_failed}
      </h2>

      <p style={{ margin: '0 0 28px', fontSize: 14, color: '#888888', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
        {passed
          ? isStoryUnlock
            ? t.lc_body_unlock
            : t.lc_body_passed
          : hasQuiz
            ? t.lc_body_failed(score ?? 0, total!)
            : t.lc_body_passed}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
        {isStoryUnlock && (
          <Link
            href="/kpatto/story/kp-ep-001?welcome=1"
            style={{
              display: 'block',
              background: '#D4873A',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              padding: '14px 20px',
              borderRadius: 12,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            {t.lc_cta_story}
          </Link>
        )}

        {passed && !isStoryUnlock && (
          <button
            onClick={onContinue}
            style={{
              background: '#D4873A',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t.lc_cta_next}
          </button>
        )}

        {!passed && onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: '#D4873A',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t.lc_cta_retry}
          </button>
        )}

        <button
          onClick={onContinue}
          style={{
            background: 'none',
            border: '1.5px solid rgba(0,0,0,0.10)',
            borderRadius: 12,
            padding: '12px 20px',
            cursor: 'pointer',
            color: '#888888',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {t.lc_cta_list}
        </button>
      </div>
    </div>
  )
}
