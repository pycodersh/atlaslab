'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { saveEssay, saveReview, canReview, incrementDailyReviewCount } from '@/lib/essays/storage'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useT } from '@/hooks/useT'

const MAX_WORDS = 300
const MIN_WORDS = 30
const DRAFT_KEY  = 'patto_essay_draft'
// Secondary bar sits below TopNav
const BAR_HEIGHT = 40

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

type ValidationError = 'not_english' | 'too_short' | 'too_long' | 'limit_reached' | 'service_unavailable' | null

export default function NewEssayPage() {
  const router = useRouter()
  const { prefs } = usePreferences()
  const t = useT()

  const [title, setTitle] = useState('')
  const [body, setBody]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ValidationError>(null)
  const titleManuallyEdited = useRef(false)

  // ── Refs to always capture latest values for cleanup ─────────────────────
  const latestBody  = useRef(body)
  const latestTitle = useRef(title)
  useEffect(() => { latestBody.current  = body  }, [body])
  useEffect(() => { latestTitle.current = title }, [title])

  // ── Restore draft on mount ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const { title: t, body: b } = JSON.parse(saved) as { title: string; body: string }
        if (b) { setBody(b) }
        if (t) { setTitle(t); titleManuallyEdited.current = true }
      }
    } catch { /* ignore */ }
  }, [])

  // ── Auto-save draft on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      const b = latestBody.current
      const t = latestTitle.current
      if (b.trim()) {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: t, body: b })) } catch { /* ignore */ }
      }
    }
  }, [])

  // ── Auto-title from first sentence ────────────────────────────────────────
  useEffect(() => {
    if (titleManuallyEdited.current) return
    const first = body.trim().split(/[.!?\n]/)[0].trim()
    if (!first) { setTitle(''); return }
    setTitle(first.length > 60 ? first.slice(0, 57) + '…' : first)
  }, [body])

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

    const essay = saveEssay({ title, body })

    setLoading(true)
    try {
      const res = await fetch('/api/essays/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayId:   essay.id,
          essayBody: body,
          essayTitle: title || 'Untitled',
          language:  prefs.language,
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
      // Clear draft on successful submission
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
      router.push(`/essays/${essay.id}`)
    } catch {
      setLoading(false)
      setError('service_unavailable')
    }
  }

  const totalTopOffset = NAV_HEIGHT + BAR_HEIGHT

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Main tab nav (TODAY / STORY / ESSAYS / …) ───────────────────── */}
      <TopNav />

      {/* ── Secondary bar: word count — sits directly below TopNav ─────── */}
      <div style={{
        position: 'fixed',
        top: NAV_HEIGHT,
        left: 0,
        right: 0,
        height: BAR_HEIGHT,
        background: 'var(--pb)',
        borderBottom: '1px solid var(--pd)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 20px',
        zIndex: 39,
      }}>
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
        padding: `${totalTopOffset + 28}px 24px 160px`,
        boxSizing: 'border-box',
      }}>

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={e => { titleManuallyEdited.current = true; setTitle(e.target.value) }}
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
          {wc > 0 && wc < MIN_WORDS && !loading && (
            <p style={{
              textAlign: 'center',
              fontSize: 11.5,
              color: 'var(--pm2)',
              fontStyle: 'italic',
              marginBottom: 10,
              lineHeight: 1.6,
            }}>
              Keep writing.{' '}
              Write at least {MIN_WORDS} words to receive Editor&apos;s Review.
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || wc < MIN_WORDS}
            style={{
              width: '100%',
              padding: '15px 0',
              borderRadius: 14,
              border: 'none',
              background: loading || wc < MIN_WORDS ? 'var(--pd)' : 'var(--pa)',
              color: loading || wc < MIN_WORDS ? 'var(--pm2)' : '#fff',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              cursor: loading || wc < MIN_WORDS ? 'default' : 'pointer',
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
