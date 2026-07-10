'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Sparkles, Copy, Check, X } from 'lucide-react'
import {
  getDraft, clearDraft, saveEssay, saveReview,
  canReview, recordReviewUsed, getReviewsRemaining, autoTitle,
  type Essay,
} from '@/lib/essays/storage'
import {
  getPlan,
  FREE_MAX_ESSAY_WORDS, PREMIUM_MAX_ESSAY_WORDS,
} from '@/lib/subscription/storage'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useT } from '@/hooks/useT'

const MIN_WORDS = 30
const NATIVE_RATIO_WARN = 0.35

function wordCount(text: string) { return text.trim().split(/\s+/).filter(Boolean).length }
function nonAsciiRatio(text: string) {
  if (!text.trim()) return 0
  return (text.match(/[^\x00-\x7F]/g) ?? []).length / text.length
}
function detectNativeSentence(body: string) {
  const parts = body.split(/(?<=[.!?\n])/).map(s => s.trim()).filter(Boolean)
  const last = parts[parts.length - 1] ?? ''
  return nonAsciiRatio(last) > 0.3 && last.length > 2 ? last : ''
}

type ValidationError = 'not_english' | 'too_short' | 'too_long' | 'limit_reached' | 'daily_limit' | 'unauthenticated' | 'service_unavailable' | null

type Props = {
  onClose: () => void
  onSaved: (essay: Essay) => void
  onReviewed: (essayId: string) => void
}

export function EssayComposerPanel({ onClose, onSaved, onReviewed }: Props) {
  const { prefs } = usePreferences()
  const t = useT()

  const [title, setTitle]   = useState('')
  const [body, setBody]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<ValidationError>(null)
  const [saveFlash, setSaveFlash]   = useState(false)
  const [plan, setPlan]             = useState<'free' | 'premium'>('free')
  const [reviewsLeft, setReviewsLeft] = useState(0)

  const [nativeSentence, setNativeSentence] = useState('')
  const [suggestion, setSuggestion]         = useState('')
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [copied, setCopied]                 = useState(false)

  const titleManuallyEdited = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setPlan(getPlan())
    setReviewsLeft(getReviewsRemaining())
    const draft = getDraft()
    if (draft?.body) {
      setBody(draft.body)
      if (draft.title) { setTitle(draft.title); titleManuallyEdited.current = true }
    }
  }, [])

  useEffect(() => {
    if (titleManuallyEdited.current) return
    setTitle(autoTitle(body))
  }, [body])

  useEffect(() => {
    const detected = detectNativeSentence(body)
    if (detected !== nativeSentence) { setNativeSentence(detected); setSuggestion(''); setCopied(false) }
  }, [body, nativeSentence])

  const maxWords   = plan === 'premium' ? PREMIUM_MAX_ESSAY_WORDS : FREE_MAX_ESSAY_WORDS
  const wc = wordCount(body)
  const wcColor = wc > maxWords ? '#C0392B' : wc >= MIN_WORDS ? '#6E6E73' : '#B0B0B8'
  const showNativeWarning = nonAsciiRatio(body) > NATIVE_RATIO_WARN && body.trim().length > 20

  const errorMessages: Record<NonNullable<ValidationError>, string> = {
    not_english:         t('essays_not_english'),
    too_short:           t('essays_too_short'),
    too_long:            plan === 'premium'
      ? `Premium reviews support up to ${PREMIUM_MAX_ESSAY_WORDS} words.`
      : `Free users can review essays up to ${FREE_MAX_ESSAY_WORDS} words.`,
    limit_reached:       t('essays_limit_reached'),
    daily_limit:         t('essays_limit_reached'),
    unauthenticated:     t('auth_required'),
    service_unavailable: "Editor's Review is temporarily unavailable.",
  }

  function handleSave() {
    if (!body.trim()) return
    const essay = saveEssay({ title, body })
    clearDraft()
    setSaveFlash(true)
    setTimeout(() => onSaved(essay), 400)
  }

  async function handleSuggest() {
    if (!nativeSentence || suggestLoading) return
    setSuggestLoading(true); setSuggestion('')
    try {
      const res = await fetch('/api/essays/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: nativeSentence, language: prefs.language }) })
      const data = await res.json()
      if (res.ok && data.suggestion) setSuggestion(data.suggestion)
    } catch {}
    setSuggestLoading(false)
  }

  function handleInsert() {
    if (!suggestion) return
    const updated = body.replace(nativeSentence, suggestion)
    setBody(updated !== body ? updated : body + '\n' + suggestion)
    setSuggestion(''); setNativeSentence(''); textareaRef.current?.focus()
  }

  function handleCopy() {
    if (!suggestion) return
    navigator.clipboard.writeText(suggestion).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  async function handleReview() {
    setError(null)
    const reviewCheck = canReview()
    if (!reviewCheck.allowed) { setError('limit_reached'); return }
    if (wc < MIN_WORDS) { setError('too_short'); return }
    if (wc > maxWords) { setError('too_long'); return }

    const essay = saveEssay({ title, body })
    clearDraft()
    setLoading(true)
    try {
      const res = await fetch('/api/essays/review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayId: essay.id, essayBody: body, essayTitle: essay.title, language: prefs.language, plan }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch {}
      if (!res.ok) {
        const errCode = data.error as string
        const known = ['not_english','too_short','too_long','limit_reached','daily_limit','unauthenticated','service_unavailable'] as const
        setError(known.includes(errCode as never) ? errCode as ValidationError : 'service_unavailable')
        setLoading(false); return
      }
      saveReview(essay.id, data.review as Parameters<typeof saveReview>[1])
      if (!data.cached) recordReviewUsed()
      onReviewed(essay.id)
    } catch { setError('service_unavailable') }
    setLoading(false)
  }

  const glass: React.CSSProperties = {
    background: 'var(--pglass)', backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid var(--pglass-border)',
  }

  return (
    <div style={{ ...glass, borderRadius: 24, padding: '28px 32px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', animation: 'panelIn 0.25s cubic-bezier(0.22,1,0.36,1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm2)', textTransform: 'uppercase' }}>New Essay</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: wcColor, transition: 'color 0.2s' }}>{wc} / {maxWords} words</span>
          <span style={{ fontSize: 10, color: reviewsLeft === 0 ? '#C0392B' : '#B0B0B8' }}>
            {reviewsLeft > 0 ? `${reviewsLeft} review${reviewsLeft === 1 ? '' : 's'} left` : 'No reviews left'}
          </span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--pm2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, transition: 'opacity 0.15s' }} onMouseEnter={e => { e.currentTarget.style.opacity = '0.6' }} onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
            <X style={{ width: 16, height: 16 }} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text" value={title}
        onChange={e => { titleManuallyEdited.current = true; setTitle(e.target.value) }}
        placeholder={t('essays_title_placeholder')}
        disabled={loading}
        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 'clamp(1.1rem,3vw,1.4rem)', fontWeight: 800, color: 'var(--pt)', marginBottom: 14, padding: 0, fontFamily: 'inherit' }}
      />

      <div style={{ height: 1, background: 'var(--pd)', marginBottom: 14 }} />

      {/* Body */}
      <textarea
        ref={textareaRef} value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={t('essays_body_placeholder')}
        disabled={loading} rows={12}
        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', resize: 'none', fontSize: 15.5, lineHeight: 1.72, color: 'var(--pt)', fontFamily: 'inherit', padding: 0, letterSpacing: '0.005em' }}
      />

      {showNativeWarning && !nativeSentence && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--pd)', background: 'var(--pd)' }}>
          <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0, lineHeight: 1.6 }}>Try writing in English first. Use your native language only when you&apos;re really stuck.</p>
        </div>
      )}

      {nativeSentence && (
        <div style={{ marginTop: 14, borderRadius: 12, border: '1px solid var(--pd)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: suggestion ? '1px solid var(--pd)' : 'none', background: 'var(--pd)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Sparkles style={{ width: 12, height: 12, color: 'var(--pa)' }} strokeWidth={1.8} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--pm)' }}>STUCK? GET AN EXPRESSION</span>
            </div>
            {!suggestion && (
              <button type="button" onClick={handleSuggest} disabled={suggestLoading} style={{ background: 'var(--pglass)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--pglass-border)', borderRadius: 8, padding: '5px 12px', cursor: suggestLoading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                {suggestLoading ? <Loader2 style={{ width: 11, height: 11, color: 'var(--pa)', animation: 'spin 1s linear infinite' }} /> : <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pa)' }}>Suggest →</span>}
              </button>
            )}
          </div>
          <div style={{ padding: '8px 14px 0', background: 'transparent' }}>
            <p style={{ fontSize: 11, color: 'var(--pm2)', margin: '0 0 2px', letterSpacing: '0.06em' }}>DETECTED</p>
            <p style={{ fontSize: 13, color: 'var(--pm)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{nativeSentence}</p>
          </div>
          {suggestion && (
            <div style={{ padding: '10px 14px 12px', background: 'transparent' }}>
              <p style={{ fontSize: 11, color: 'var(--pa)', margin: '0 0 4px', letterSpacing: '0.06em', fontWeight: 700 }}>IN ENGLISH</p>
              <p style={{ fontSize: 15, color: 'var(--pt)', margin: '0 0 12px', lineHeight: 1.6, fontWeight: 500 }}>{suggestion}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={handleInsert} style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pglass-border)', fontSize: 12, fontWeight: 700, color: 'var(--pa)', cursor: 'pointer', fontFamily: 'inherit' }}>Insert into Essay</button>
                <button type="button" onClick={handleCopy} style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid var(--pd)', background: 'none', fontSize: 12, fontWeight: 600, color: 'var(--pm)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {copied ? <><Check style={{ width: 11, height: 11 }} /> Copied</> : <><Copy style={{ width: 11, height: 11 }} /> Copy</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p style={{ fontSize: 12, color: 'var(--pa)', marginTop: 12, fontStyle: 'italic' }}>{errorMessages[error]}</p>}

      {/* Actions */}
      <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
        <button type="button" onClick={handleSave} disabled={!body.trim() || loading}
          style={{ flex: 1, padding: '13px 0', borderRadius: 14, ...glass, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: !body.trim() || loading ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#8E8E93', opacity: !body.trim() || loading ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {saveFlash ? '✓ Saved' : 'Save'}
        </button>
        <button type="button" onClick={handleReview} disabled={loading || wc < MIN_WORDS}
          style={{ flex: 1, padding: '13px 0', borderRadius: 14, ...glass, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: loading || wc < MIN_WORDS ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#5A5A62', opacity: loading || wc < MIN_WORDS ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          {loading ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />{t('essays_reviewing')}</> : <><Sparkles style={{ width: 13, height: 13, strokeWidth: 1.8 }} />{t('essays_submit')}</>}
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes panelIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}
