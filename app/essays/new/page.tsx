'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, Copy, Check, ArrowLeft } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { saveEssay, saveReview, canReview, incrementDailyReviewCount } from '@/lib/essays/storage'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useT } from '@/hooks/useT'

const MAX_WORDS  = 300
const MIN_WORDS  = 30
const DRAFT_KEY  = 'patto_essay_draft'
const NATIVE_RATIO_WARN = 0.35

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function nonAsciiRatio(text: string): number {
  if (!text.trim()) return 0
  const nonAscii = (text.match(/[^\x00-\x7F]/g) ?? []).length
  return nonAscii / text.length
}

function detectNativeSentence(body: string): string {
  const parts = body.split(/(?<=[.!?\n])/).map(s => s.trim()).filter(Boolean)
  const last = parts[parts.length - 1] ?? ''
  if (nonAsciiRatio(last) > 0.3 && last.length > 2) return last
  return ''
}

type ValidationError = 'not_english' | 'too_short' | 'too_long' | 'limit_reached' | 'service_unavailable' | null
type SaveStatus = 'idle' | 'editing' | 'saved'

// Shared glass button style
function glassBtn(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: '100%', padding: '13px 0', borderRadius: 14,
    background: 'rgba(255,255,255,0.68)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.82)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    transition: 'filter 0.15s',
    ...extra,
  }
}

export default function NewEssayPage() {
  const router = useRouter()
  const { prefs } = usePreferences()
  const t = useT()

  const [title, setTitle]   = useState('')
  const [body, setBody]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<ValidationError>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [savedEssayId, setSavedEssayId] = useState<string | null>(null)

  // Expression suggestion
  const [nativeSentence, setNativeSentence] = useState('')
  const [suggestion, setSuggestion]         = useState('')
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [copied, setCopied]                 = useState(false)

  // Unsaved-changes dialog
  const [leaveDialog, setLeaveDialog] = useState(false)
  const pendingNavRef = useRef<(() => void) | null>(null)

  const titleManuallyEdited = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const latestBody  = useRef(body)
  const latestTitle = useRef(title)

  useEffect(() => { latestBody.current  = body  }, [body])
  useEffect(() => { latestTitle.current = title }, [title])

  // Restore draft on mount
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

  // Auto-title from first sentence
  useEffect(() => {
    if (titleManuallyEdited.current) return
    const first = body.trim().split(/[.!?\n]/)[0].trim()
    if (!first) { setTitle(''); return }
    setTitle(first.length > 60 ? first.slice(0, 57) + '…' : first)
  }, [body])

  // Mark editing when content changes
  useEffect(() => {
    if (body.trim() || title.trim()) setSaveStatus('editing')
  }, [body, title])

  // Detect native sentence
  useEffect(() => {
    const detected = detectNativeSentence(body)
    if (detected !== nativeSentence) {
      setNativeSentence(detected)
      setSuggestion('')
      setCopied(false)
    }
  }, [body, nativeSentence])

  const wc = wordCount(body)
  const wcColor = wc > MAX_WORDS ? '#C0392B' : wc >= MIN_WORDS ? '#6E6E73' : '#B0B0B8'
  const showNativeWarning = nonAsciiRatio(body) > NATIVE_RATIO_WARN && body.trim().length > 20
  const isDirty = saveStatus === 'editing'

  const errorMessages: Record<NonNullable<ValidationError>, string> = {
    not_english:         t('essays_not_english'),
    too_short:           t('essays_too_short'),
    too_long:            t('essays_too_long'),
    limit_reached:       t('essays_limit_reached'),
    service_unavailable: "Editor's Review is temporarily unavailable.",
  }

  // Navigation guard
  function tryNavigate(action: () => void) {
    if (isDirty) {
      pendingNavRef.current = action
      setLeaveDialog(true)
    } else {
      action()
    }
  }

  function handleLeaveDialogSave() {
    handleSaveOnly()
    setLeaveDialog(false)
    pendingNavRef.current?.()
    pendingNavRef.current = null
  }
  function handleLeaveDialogDiscard() {
    setLeaveDialog(false)
    pendingNavRef.current?.()
    pendingNavRef.current = null
  }
  function handleLeaveDialogCancel() {
    setLeaveDialog(false)
    pendingNavRef.current = null
  }

  // Save only (no review)
  function handleSaveOnly() {
    if (!body.trim()) return
    const essay = saveEssay({ title, body })
    setSavedEssayId(essay.id)
    setSaveStatus('saved')
    // Store draft key cleared
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    setTimeout(() => setSaveStatus('idle'), 1500)
  }

  // Suggestion
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

  // Editor Review
  async function handleEditorReview() {
    setError(null)
    if (!canReview()) { setError('limit_reached'); return }
    if (wc < MIN_WORDS) { setError('too_short'); return }
    if (wc > MAX_WORDS) { setError('too_long'); return }

    // Save first if not already saved
    let essayId = savedEssayId
    if (!essayId) {
      const essay = saveEssay({ title, body })
      essayId = essay.id
      setSavedEssayId(essay.id)
    }

    setLoading(true)
    try {
      const res = await fetch('/api/essays/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayId,
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
      saveReview(essayId, data.review)
      incrementDailyReviewCount()
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
      router.push(`/essays/${essayId}`)
    } catch {
      setLoading(false)
      setError('service_unavailable')
    }
  }

  const estimatedMin = wc > 0 ? Math.ceil(wc / 200) : 0

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <TopNav />

      {/* ── Sub-bar: back + word count ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 20px 10px',
        maxWidth: 580, width: '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>
        <button
          type="button"
          onClick={() => tryNavigate(() => router.push('/essays'))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 0' }}
        >
          <ArrowLeft style={{ width: 13, height: 13, color: 'var(--pm)' }} strokeWidth={1.8} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', color: 'var(--pm)' }}>
            ESSAYS
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Save status indicator */}
          {saveStatus === 'editing' && (
            <span style={{ fontSize: 9.5, fontWeight: 600, color: '#B0B0B8', letterSpacing: '0.08em' }}>
              ● Editing
            </span>
          )}
          {saveStatus === 'saved' && (
            <span style={{ fontSize: 9.5, fontWeight: 600, color: '#4A7A6A', letterSpacing: '0.08em' }}>
              ✓ Saved
            </span>
          )}
          {/* Word count */}
          <span style={{ fontSize: 10, fontWeight: 600, color: wcColor, transition: 'color 0.2s', letterSpacing: '0.02em' }}>
            {wc} words
          </span>
        </div>
      </div>

      {/* ── Paper area ── */}
      <div style={{
        flex: 1,
        maxWidth: 580,
        width: '100%',
        margin: '0 auto',
        padding: '4px 28px 80px',
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
            fontSize: 'clamp(1.15rem, 4.5vw, 1.55rem)',
            fontWeight: 800, color: 'var(--pt)',
            marginBottom: 14, padding: 0, fontFamily: 'inherit',
          }}
        />

        {/* Body textarea — auto-grow */}
        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={t('essays_body_placeholder')}
          disabled={loading}
          rows={18}
          style={{
            width: '100%', border: 'none', outline: 'none',
            background: 'transparent', resize: 'none',
            fontSize: 15.5, lineHeight: 1.72,
            color: 'var(--pt)', fontFamily: 'inherit', padding: 0,
            letterSpacing: '0.005em',
          }}
        />

        {/* Native language warning */}
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

        {/* Native sentence suggestion UI */}
        {nativeSentence && (
          <div style={{ marginTop: 14, borderRadius: 12, border: '1px solid var(--pd)', overflow: 'hidden' }}>
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
                    background: 'rgba(255,255,255,0.68)',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.82)',
                    borderRadius: 8, padding: '5px 12px',
                    cursor: suggestLoading ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  {suggestLoading
                    ? <Loader2 style={{ width: 11, height: 11, color: 'var(--pa)', animation: 'spin 1s linear infinite' }} />
                    : <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pa)' }}>Suggest →</span>
                  }
                </button>
              )}
            </div>
            <div style={{ padding: '8px 14px 0', background: 'var(--pb)' }}>
              <p style={{ fontSize: 11, color: 'var(--pm2)', margin: '0 0 2px', letterSpacing: '0.06em' }}>DETECTED</p>
              <p style={{ fontSize: 13, color: 'var(--pm)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                {nativeSentence}
              </p>
            </div>
            {suggestion && (
              <div style={{ padding: '10px 14px 12px', background: 'var(--pb)' }}>
                <p style={{ fontSize: 11, color: 'var(--pa)', margin: '0 0 4px', letterSpacing: '0.06em', fontWeight: 700 }}>IN ENGLISH</p>
                <p style={{ fontSize: 15, color: 'var(--pt)', margin: '0 0 12px', lineHeight: 1.6, fontWeight: 500 }}>{suggestion}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={handleInsert}
                    style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.82)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', fontSize: 12, fontWeight: 700, color: 'var(--pa)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Insert into Essay
                  </button>
                  <button type="button" onClick={handleCopy}
                    style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid var(--pd)', background: 'none', fontSize: 12, fontWeight: 600, color: 'var(--pm)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {copied ? <><Check style={{ width: 11, height: 11 }} /> Copied</> : <><Copy style={{ width: 11, height: 11 }} /> Copy</>}
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

        {/* ── Inline actions — ordered: stats · Editor Review · Save ── */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Estimated info */}
          {wc > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#B0B0B8', fontWeight: 500 }}>
                {estimatedMin > 0 ? `Estimated ${estimatedMin} min read` : ''}
              </span>
              {wc > 0 && wc < MIN_WORDS && (
                <span style={{ fontSize: 10, color: '#B0B0B8', fontStyle: 'italic' }}>
                  {MIN_WORDS - wc} more words for Editor Review
                </span>
              )}
            </div>
          )}

          {/* Editor Review button */}
          <button
            type="button"
            onClick={handleEditorReview}
            disabled={loading || wc < MIN_WORDS}
            style={{
              ...glassBtn(),
              opacity: loading || wc < MIN_WORDS ? 0.45 : 1,
              cursor: loading || wc < MIN_WORDS ? 'default' : 'pointer',
              fontSize: 13, fontWeight: 700, color: '#5A5A62', letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { if (!loading && wc >= MIN_WORDS) e.currentTarget.style.filter = 'brightness(0.97)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
          >
            {loading
              ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />{t('essays_reviewing')}</>
              : <><Sparkles style={{ width: 13, height: 13, strokeWidth: 1.8 }} /> {t('essays_submit')}</>
            }
          </button>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSaveOnly}
            disabled={!body.trim() || loading}
            style={{
              ...glassBtn(),
              opacity: !body.trim() || loading ? 0.40 : 1,
              cursor: !body.trim() || loading ? 'default' : 'pointer',
              fontSize: 13, fontWeight: 600, color: '#8E8E93',
            }}
            onMouseEnter={e => { if (body.trim() && !loading) e.currentTarget.style.filter = 'brightness(0.97)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
          >
            {saveStatus === 'saved' ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── Unsaved changes dialog ── */}
      {leaveDialog && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(0,0,0,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 24px',
          }}
          onClick={handleLeaveDialogCancel}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(32px) saturate(200%)',
              WebkitBackdropFilter: 'blur(32px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.90)',
              borderRadius: 22,
              boxShadow: '0 8px 40px rgba(30,40,70,0.14)',
              padding: '28px 24px 22px',
              width: '100%', maxWidth: 360,
            }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ fontSize: 15, fontWeight: 800, color: '#1C1C1E', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
              저장하지 않은 변경사항이 있습니다.
            </p>
            <p style={{ fontSize: 12, color: '#8E8E93', margin: '0 0 22px', lineHeight: 1.6 }}>
              이 글을 저장하고 나가시겠습니까?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button type="button" onClick={handleLeaveDialogSave}
                style={{ ...glassBtn({ fontSize: 14, fontWeight: 700, color: '#3A3A3C' }) }}>
                저장
              </button>
              <button type="button" onClick={handleLeaveDialogDiscard}
                style={{ ...glassBtn({ fontSize: 14, fontWeight: 600, color: '#8E8E93', background: 'rgba(140,140,150,0.07)', boxShadow: 'none', border: '1px solid rgba(140,140,150,0.15)' }) }}>
                저장 안 함
              </button>
              <button type="button" onClick={handleLeaveDialogCancel}
                style={{ ...glassBtn({ fontSize: 14, fontWeight: 500, color: '#B0B0B8', background: 'none', boxShadow: 'none', border: 'none' }) }}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
