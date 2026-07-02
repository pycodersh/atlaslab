'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, Copy, Check, ArrowLeft } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { saveEssay, saveReview, canReview, incrementDailyReviewCount } from '@/lib/essays/storage'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useT } from '@/hooks/useT'

const MAX_WORDS  = 300
const MIN_WORDS  = 30
const DRAFT_KEY  = 'patto_essay_draft'
const BAR_HEIGHT = 40
// Warn if native language exceeds this share of the total body
const NATIVE_RATIO_WARN = 0.35

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function nonAsciiRatio(text: string): number {
  if (!text.trim()) return 0
  const nonAscii = (text.match(/[^\x00-\x7F]/g) ?? []).length
  return nonAscii / text.length
}

// Returns the last typed sentence that is predominantly non-English
function detectNativeSentence(body: string): string {
  // Split on sentence boundaries or newlines, take the last non-empty piece
  const parts = body.split(/(?<=[.!?\n])/).map(s => s.trim()).filter(Boolean)
  const last = parts[parts.length - 1] ?? ''
  if (nonAsciiRatio(last) > 0.3 && last.length > 2) return last
  return ''
}

type ValidationError = 'not_english' | 'too_short' | 'too_long' | 'limit_reached' | 'service_unavailable' | null

export default function NewEssayPage() {
  const router = useRouter()
  const { prefs } = usePreferences()
  const t = useT()

  const [title, setTitle] = useState('')
  const [body, setBody]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<ValidationError>(null)

  // Expression suggestion state
  const [nativeSentence, setNativeSentence]   = useState('')
  const [suggestion, setSuggestion]           = useState('')
  const [suggestLoading, setSuggestLoading]   = useState(false)
  const [copied, setCopied]                   = useState(false)

  const titleManuallyEdited = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Refs for unmount cleanup ──────────────────────────────────────────────
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
        if (b) setBody(b)
        if (t) { setTitle(t); titleManuallyEdited.current = true }
      }
    } catch { /* ignore */ }
  }, [])

  // ── Auto-save draft on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      const b = latestBody.current
      const tl = latestTitle.current
      if (b.trim()) {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: tl, body: b })) } catch { /* ignore */ }
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

  // ── Detect native sentence ────────────────────────────────────────────────
  useEffect(() => {
    const detected = detectNativeSentence(body)
    if (detected !== nativeSentence) {
      setNativeSentence(detected)
      setSuggestion('')   // clear old suggestion when text changes
      setCopied(false)
    }
  }, [body, nativeSentence])

  const wc = wordCount(body)
  const wcColor = wc > MAX_WORDS ? 'var(--pa)' : wc >= MIN_WORDS ? 'var(--pm)' : 'var(--pm2)'
  const showNativeWarning = nonAsciiRatio(body) > NATIVE_RATIO_WARN && body.trim().length > 20

  const errorMessages: Record<NonNullable<ValidationError>, string> = {
    not_english:         t('essays_not_english'),
    too_short:           t('essays_too_short'),
    too_long:            t('essays_too_long'),
    limit_reached:       t('essays_limit_reached'),
    service_unavailable: "Editor's Review is temporarily unavailable.",
  }

  async function handleSuggest() {
    if (!nativeSentence || suggestLoading) return
    setSuggestLoading(true)
    setSuggestion('')
    try {
      const res = await fetch('/api/essays/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nativeSentence, language: prefs.language }),
      })
      const data = await res.json()
      if (res.ok && data.suggestion) setSuggestion(data.suggestion)
    } catch { /* ignore */ }
    setSuggestLoading(false)
  }

  function handleInsert() {
    if (!suggestion) return
    // Replace the native sentence in the body with the English suggestion
    const updated = body.replace(nativeSentence, suggestion)
    setBody(updated !== body ? updated : body + '\n' + suggestion)
    setSuggestion('')
    setNativeSentence('')
    textareaRef.current?.focus()
  }

  function handleCopy() {
    if (!suggestion) return
    navigator.clipboard.writeText(suggestion).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
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
          essayId:    essay.id,
          essayBody:  body,
          essayTitle: title || 'Untitled',
          language:   prefs.language,
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
      <TopNav />

      {/* ── Secondary bar: back button + word count ──────────────────────── */}
      <div style={{
        position: 'fixed',
        top: NAV_HEIGHT, left: 0, right: 0,
        height: BAR_HEIGHT,
        background: 'var(--pb)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 39,
      }}>
        <button
          type="button"
          onClick={() => router.push('/essays')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 0' }}
        >
          <ArrowLeft style={{ width: 14, height: 14, color: 'var(--pm)' }} strokeWidth={1.8} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--pm)' }}>
            New Essay
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
        padding: `${totalTopOffset + 28}px 24px 200px`,
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
            width: '100%', border: 'none', outline: 'none',
            background: 'transparent',
            fontSize: 'clamp(1.5rem, 6vw, 2rem)',
            fontWeight: 800, color: 'var(--pt)',
            marginBottom: 20, padding: 0, fontFamily: 'inherit',
          }}
        />

        {/* Body textarea */}
        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={t('essays_body_placeholder')}
          disabled={loading}
          rows={16}
          style={{
            width: '100%', border: 'none', outline: 'none',
            background: 'transparent', resize: 'none',
            fontSize: 16, lineHeight: 1.85,
            color: 'var(--pt)', fontFamily: 'inherit', padding: 0,
          }}
        />

        {/* ── Native language warning ─────────────────────────────────────── */}
        {showNativeWarning && !nativeSentence && (
          <div style={{
            marginTop: 12, padding: '10px 14px',
            borderRadius: 10, border: '1px solid var(--pd)',
            background: 'var(--pd)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0, lineHeight: 1.6 }}>
              Try writing in English first.
              Use your native language only when you&apos;re really stuck.
            </p>
          </div>
        )}

        {/* ── Native sentence detected → suggest UI ──────────────────────── */}
        {nativeSentence && (
          <div style={{
            marginTop: 14,
            borderRadius: 12,
            border: '1px solid var(--pd)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: suggestion ? '1px solid var(--pd)' : 'none',
              background: 'var(--pd)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Sparkles style={{ width: 12, height: 12, color: 'var(--pa)' }} strokeWidth={1.8} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pm)' }}>
                  STUCK? GET AN EXPRESSION
                </span>
              </div>
              {!suggestion && (
                <button
                  type="button"
                  onClick={handleSuggest}
                  disabled={suggestLoading}
                  style={{
                    background: 'var(--pa)', border: 'none', borderRadius: 8,
                    padding: '5px 12px', cursor: suggestLoading ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  {suggestLoading
                    ? <Loader2 style={{ width: 11, height: 11, color: '#fff', animation: 'spin 1s linear infinite' }} />
                    : <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Suggest →</span>
                  }
                </button>
              )}
            </div>

            {/* Detected native sentence */}
            <div style={{ padding: '8px 14px 0', background: 'var(--pb)' }}>
              <p style={{ fontSize: 11, color: 'var(--pm2)', margin: '0 0 2px', letterSpacing: '0.06em' }}>
                DETECTED
              </p>
              <p style={{ fontSize: 13, color: 'var(--pm)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                {nativeSentence}
              </p>
            </div>

            {/* Suggestion result */}
            {suggestion && (
              <div style={{ padding: '10px 14px 12px', background: 'var(--pb)' }}>
                <p style={{ fontSize: 11, color: 'var(--pa)', margin: '0 0 4px', letterSpacing: '0.06em', fontWeight: 700 }}>
                  IN ENGLISH
                </p>
                <p style={{ fontSize: 15, color: 'var(--pt)', margin: '0 0 12px', lineHeight: 1.6, fontWeight: 500 }}>
                  {suggestion}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleInsert}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 9,
                      border: 'none', background: 'var(--pa)',
                      fontSize: 12, fontWeight: 700, color: '#fff',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Insert into Essay
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      padding: '9px 14px', borderRadius: 9,
                      border: '1.5px solid var(--pd)', background: 'none',
                      fontSize: 12, fontWeight: 600, color: 'var(--pm)',
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {copied
                      ? <><Check style={{ width: 11, height: 11 }} /> Copied</>
                      : <><Copy style={{ width: 11, height: 11 }} /> Copy</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation error */}
        {error && (
          <p style={{ fontSize: 12, color: 'var(--pa)', marginTop: 12, fontStyle: 'italic' }}>
            {errorMessages[error]}
          </p>
        )}
      </div>

      {/* ── Bottom action bar ─────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 24px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
        background: 'var(--pb)', borderTop: '1px solid var(--pd)',
      }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          {wc > 0 && wc < MIN_WORDS && !loading && (
            <p style={{
              textAlign: 'center', fontSize: 11.5, color: 'var(--pm2)',
              fontStyle: 'italic', marginBottom: 10, lineHeight: 1.6,
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
              width: '100%', padding: '15px 0', borderRadius: 14,
              border: 'none',
              background: loading || wc < MIN_WORDS ? 'var(--pd)' : 'var(--pa)',
              color: loading || wc < MIN_WORDS ? 'var(--pm2)' : '#fff',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
              cursor: loading || wc < MIN_WORDS ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.18s, color 0.18s', fontFamily: 'inherit',
            }}
          >
            {loading
              ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />{t('essays_reviewing')}</>
              : t('essays_submit')
            }
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
