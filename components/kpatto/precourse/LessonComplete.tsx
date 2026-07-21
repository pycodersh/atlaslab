'use client'

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
      {passed && (
        <div style={{ fontSize: 32, marginBottom: 16, animation: 'kp-bounce 0.6s ease' }}>
          {isStoryUnlock ? '🎊' : '🎉'}
        </div>
      )}
      {!passed && (
        <div style={{ fontSize: 32, marginBottom: 16 }}>😅</div>
      )}

      {hasQuiz && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 4,
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: passed ? '#4CAF50' : '#EF5350' }}>
            {score}
          </span>
          <span style={{ fontSize: 22, color: 'var(--pm)' }}>/ {total}</span>
        </div>
      )}

      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>
        {passed
          ? isStoryUnlock ? t.lc_master : t.lc_passed
          : t.lc_failed}
      </h2>

      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--pm)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
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
              background: 'linear-gradient(135deg, #FF6B8C, #FF8C6B)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              padding: '14px 20px',
              borderRadius: 14,
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
              background: 'linear-gradient(135deg, #FF6B8C, #FF8C6B)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              padding: '14px 20px',
              borderRadius: 14,
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
              background: 'linear-gradient(135deg, #FF6B8C, #FF8C6B)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              padding: '14px 20px',
              borderRadius: 14,
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
            border: '1.5px solid var(--border, rgba(0,0,0,0.1))',
            borderRadius: 14,
            padding: '12px 20px',
            cursor: 'pointer',
            color: 'var(--pm)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {t.lc_cta_list}
        </button>
      </div>

      <style>{`
        @keyframes kp-bounce {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
