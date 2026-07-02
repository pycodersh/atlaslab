'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { NAV_HEIGHT } from '@/components/TopNav'
import { saveEssay, saveReview, canReview, incrementDailyReviewCount } from '@/lib/essays/storage'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useT } from '@/hooks/useT'

const MAX_WORDS = 300
const MIN_WORDS = 10

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

type ValidationError = 'not_english' | 'too_short' | 'too_long' | 'limit_reached' | 'service_unavailable' | null

export default function NewEssayPage() {
  const router = useRouter()
  const { prefs } = usePreferences()
  const t = useT()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ValidationError>(null)

  const wc = wordCount(body)
  const wcColor = wc > MAX_WORDS ? 'var(--pa)' : wc >= MIN_WORDS ? 'var(--pm)' : 'var(--pm2)'

  const errorMessages: Record<NonNullable<ValidationError>, string> = {
    not_english:         t('essays_not_english'),
    too_short:           t('essays_too_short'),
    too_long:            t('essays_too_long'),
    limit_reached:       t('essays_limit_reached'),
    service_unavailable: "Editor's Review is temporarily unavailable.",
  }

  async function handleSubmit() {
    setError(null)

    if (!canReview()) { setError('limit_reached'); return }

    const wc = wordCount(body)
    if (wc < MIN_WORDS) { setError('too_short'); return }
    if (wc > MAX_WORDS) { setError('too_long'); return }

    // Save draft first
    const essay = saveEssay({ title, body })

    setLoading(true)
    try {
      const res = await fetch('/api/essays/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayId: essay.id,
          essayBody: body,
          essayTitle: title || 'Untitled',
          language: prefs.language,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errCode = data.error as string
        if (errCode === 'not_english' || errCode === 'too_short' || errCode === 'too_long' || errCode === 'service_unavailable') {
          setError(errCode)
        } else {
          setError('service_unavailable')
        }
        setLoading(false)
        return
      }

      saveReview(essay.id, data.review)
      incrementDailyReviewCount()
      router.push(`/essays/${essay.id}`)
    } catch {
      setLoading(false)
      setError('service_unavailable')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Minimal top bar ───────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: NAV_HEIGHT,
        background: 'var(--pb)',
        borderBottom: '1px solid var(--pd)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 40,
        marginTop: 'env(safe-area-inset-top, 0px)',
      }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}
        >
          <ArrowLeft style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={1.8} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--pm)' }}>
            ESSAYS
          </span>
        </button>

        <span style={{ fontSize: wc > MAX_WORDS ? 11 : 10, fontWeight: 600, color: wcColor, transition: 'color 0.2s' }}>
          {t('essays_word_count', { n: wc })}
        </span>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        maxWidth: 580,
        width: '100%',
        margin: '0 auto',
        padding: `${NAV_HEIGHT + 28}px 24px 160px`,
        boxSizing: 'border-box',
      }}>

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('essays_title_placeholder')}
          disabled={loading}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 'clamp(1.5rem, 6vw, 2rem)',
            fontWeight: 800,
            color: 'var(--pt)',
            marginBottom: 4,
            padding: 0,
            fontFamily: 'inherit',
          }}
        />

        <div style={{ height: 1, background: 'var(--pd)', marginBottom: 24 }} />

        {/* Body textarea */}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={t('essays_body_placeholder')}
          disabled={loading}
          rows={16}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            fontSize: 16,
            lineHeight: 1.85,
            color: 'var(--pt)',
            fontFamily: 'inherit',
            padding: 0,
          }}
        />

        {/* Validation error */}
        {error && (
          <p style={{
            fontSize: 12,
            color: 'var(--pa)',
            marginTop: 12,
            fontStyle: 'italic',
          }}>
            {errorMessages[error]}
          </p>
        )}
      </div>

      {/* ── Bottom action bar ─────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 24px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
        background: 'var(--pb)',
        borderTop: '1px solid var(--pd)',
      }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || body.trim().length === 0}
            style={{
              width: '100%',
              padding: '15px 0',
              borderRadius: 14,
              border: 'none',
              background: loading || body.trim().length === 0 ? 'var(--pd)' : 'var(--pa)',
              color: loading || body.trim().length === 0 ? 'var(--pm2)' : '#fff',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              cursor: loading || body.trim().length === 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.18s, color 0.18s',
              fontFamily: 'inherit',
            }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                {t('essays_reviewing')}
              </>
            ) : (
              t('essays_submit')
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
