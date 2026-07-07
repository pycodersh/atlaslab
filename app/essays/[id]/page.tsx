'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Sparkles, Trash2, Copy, Check, RefreshCw } from 'lucide-react'
import { NAV_HEIGHT } from '@/components/TopNav'
import { TopNav } from '@/components/TopNav'
import {
  type Essay, type Annotation,
  getEssay, updateEssay, deleteEssay, saveReview,
  canReview, recordReviewUsed, autoTitle,
  resetDailyReviewCount, getReviewsRemaining, getFreeReviewTotal,
} from '@/lib/essays/storage'
import { getPlan, FREE_MAX_ESSAY_WORDS, PREMIUM_MAX_ESSAY_WORDS, FREE_REVIEW_LIFETIME } from '@/lib/subscription/storage'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'

const IS_DEV = process.env.NODE_ENV === 'development'

// ── Annotation rendering ──────────────────────────────────────────────────────
const PEN_RED    = '#8B1A1A'
const PEN_PURPLE = '#6C2D82'
const PEN_GREEN  = '#1a7a3a'

const EV_LUT = [0, 2, -1, 3, -2, 1, -3, 2, 0, -1, 3, -2, 1, 0, -1]
function ev(i: number): number { return EV_LUT[i % EV_LUT.length] }

type Segment = { text: string; annotation?: Annotation }

function buildSegments(body: string, annotations: Annotation[]): Segment[] {
  const positioned = annotations
    .map(a => ({ annotation: a, index: body.indexOf(a.fragment) }))
    .filter(p => p.index >= 0)
    .sort((a, b) => a.index - b.index)

  const segments: Segment[] = []
  let cursor = 0
  for (const { annotation, index } of positioned) {
    if (index < cursor) continue
    if (index > cursor) segments.push({ text: body.slice(cursor, index) })
    segments.push({ text: annotation.fragment, annotation })
    cursor = index + annotation.fragment.length
  }
  if (cursor < body.length) segments.push({ text: body.slice(cursor) })
  return segments
}

function AnnotatedManuscript({ body, annotations }: { body: string; annotations: Annotation[] }) {
  const segments = buildSegments(body, annotations)
  const inkBase: React.CSSProperties = {
    position: 'absolute', left: 0,
    fontFamily: 'var(--font-caveat, cursive)',
    fontSize: 15, fontWeight: 700, lineHeight: 1.4,
    whiteSpace: 'normal', wordBreak: 'normal', overflowWrap: 'break-word',
    maxWidth: 'min(200px, 60vw)',
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
    overflow: 'hidden', pointerEvents: 'none',
  }

  return (
    <p style={{ fontSize: 16, lineHeight: 4.0, color: 'var(--pt)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {segments.map((seg, i) => {
        if (!seg.annotation) return <span key={i}>{seg.text}</span>
        const ann = seg.annotation
        const yShift = ev(i)
        const above = { ...inkBase, bottom: `calc(100% + ${3 + yShift}px)` }

        if (ann.type === 'grammar') {
          return (
            <span key={i} style={{ position: 'relative', display: 'inline' }}>
              <span style={{ ...above, color: PEN_RED }}>{ann.replacement ?? '—'}{' '}↓</span>
              {ann.replacement
                ? <span style={{ border: `1.5px solid ${PEN_RED}`, borderRadius: '52% 48% 47% 53% / 46% 54% 46% 54%', padding: '0 3px 1px' }}>{seg.text}</span>
                : <span style={{ textDecoration: 'line-through', textDecorationColor: PEN_RED, textDecorationThickness: '1.5px', color: 'rgba(0,0,0,0.3)' }}>{seg.text}</span>
              }
            </span>
          )
        }
        if (ann.type === 'expression') {
          return (
            <span key={i} style={{ position: 'relative' }}>
              {ann.replacement && <span style={{ ...above, color: PEN_PURPLE }}>{ann.replacement}{' '}↓</span>}
              <span style={{ textDecoration: 'underline', textDecorationColor: PEN_PURPLE, textDecorationStyle: 'wavy', textUnderlineOffset: '4px', textDecorationThickness: '1.5px' }}>{seg.text}</span>
            </span>
          )
        }
        if (ann.type === 'strength') {
          return (
            <span key={i} style={{ position: 'relative' }}>
              <span style={{ ...above, color: PEN_GREEN }}>{ann.note ?? '⭐ Good.'}{' '}↓</span>
              <mark style={{ background: 'rgba(255,210,60,0.25)', borderRadius: 2, padding: '0 2px', color: 'inherit' }}>{seg.text}</mark>
            </span>
          )
        }
        if (ann.type === 'typical') {
          const typInk: React.CSSProperties = {
            position: 'absolute', bottom: `calc(100% + ${3 + yShift}px)`, left: 0,
            fontFamily: 'var(--font-caveat, cursive)', fontSize: 14, fontWeight: 700,
            lineHeight: 1.4, whiteSpace: 'nowrap', color: PEN_RED, pointerEvents: 'none',
          }
          return (
            <span key={i} style={{ position: 'relative', display: 'inline' }}>
              <span style={typInk}>{ann.replacement ? `${ann.replacement} Typ. ↓` : 'Typ. ↓'}</span>
              <span style={{ textDecoration: 'underline', textDecorationColor: PEN_RED, textDecorationStyle: 'dashed', textUnderlineOffset: '3px', textDecorationThickness: '1.5px', color: 'rgba(0,0,0,0.45)' }}>{seg.text}</span>
            </span>
          )
        }
        return <span key={i}>{seg.text}</span>
      })}
    </p>
  )
}

function EditorNotes({ annotations }: { annotations: Annotation[] }) {
  if (annotations.length === 0) return null
  const grammar    = annotations.filter(a => a.type === 'grammar').length
  const expression = annotations.filter(a => a.type === 'expression').length
  const strength   = annotations.filter(a => a.type === 'strength').length
  const typical    = annotations.filter(a => a.type === 'typical').length
  return (
    <div style={{ marginTop: 28 }}>
      <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', color: 'var(--pm2)', margin: '0 0 10px' }}>EDITOR&apos;S MARKS</p>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {grammar    > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: PEN_RED,    fontWeight: 700 }}>○</span>Grammar · {grammar}</span>}
        {expression > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: PEN_PURPLE, fontWeight: 700 }}>～</span>Expression · {expression}</span>}
        {typical    > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: PEN_RED,    fontWeight: 700 }}>- -</span>Typical · {typical}</span>}
        {strength   > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span>⭐</span>Strength · {strength}</span>}
      </div>
    </div>
  )
}

function SuggestedVersion({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div style={{ marginTop: 44, borderTop: '1px solid var(--pd)', paddingTop: 32 }}>
      <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.28em', color: 'var(--pm)', margin: '0 0 6px' }}>ONE NATURAL REVISION</p>
      <p style={{ fontSize: 10, color: 'var(--pm2)', margin: '0 0 20px', lineHeight: 1.5 }}>All corrections applied — one possible natural version.</p>
      <div style={{ padding: '20px', borderRadius: 14, background: 'var(--pd)' }}>
        <p style={{ fontSize: 15, lineHeight: 2.0, color: 'var(--pt)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</p>
      </div>
      <button type="button" onClick={handleCopy}
        style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '13px 0', borderRadius: 12, border: '1.5px solid var(--pd)', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit' }}>
        {copied ? <><Check style={{ width: 12, height: 12 }} strokeWidth={2} /> Copied</> : <><Copy style={{ width: 12, height: 12 }} strokeWidth={1.8} /> Copy Revision</>}
      </button>
    </div>
  )
}

// ── Glass button ──────────────────────────────────────────────────────────────
function glassBtn(extra?: React.CSSProperties): React.CSSProperties {
  return {
    flex: 1, padding: '13px 0', borderRadius: 14,
    background: 'var(--pglass)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid var(--pglass-border)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    transition: 'filter 0.15s',
    ...extra,
  }
}

type ValidationError = 'not_english' | 'too_short' | 'too_long' | 'limit_reached' | 'service_unavailable' | null

const MIN_WORDS = 30
function wordCount(t: string) { return t.trim().split(/\s+/).filter(Boolean).length }

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EssayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const t       = useT()
  const { prefs } = usePreferences()

  const [essay, setEssay]               = useState<Essay | null>(null)
  const [title, setTitle]               = useState('')
  const [body, setBody]                 = useState('')
  const [loading, setLoading]           = useState(false)
  const [saveFlash, setSaveFlash]       = useState(false)
  const [error, setError]               = useState<ValidationError>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [devMsg, setDevMsg]             = useState('')

  const titleManuallyEdited = useRef(false)
  const originalTitle = useRef('')
  const originalBody  = useRef('')

  useEffect(() => {
    const e = getEssay(id)
    if (!e) return
    setEssay(e)
    setTitle(e.title)
    setBody(e.body)
    originalTitle.current = e.title
    originalBody.current  = e.body
  }, [id])

  // Auto-title when body changes (only if title not manually set)
  useEffect(() => {
    if (titleManuallyEdited.current) return
    const generated = autoTitle(body)
    if (generated) setTitle(generated)
  }, [body])

  const plan = typeof window !== 'undefined' ? getPlan() : 'free'
  const MAX_WORDS = plan === 'premium' ? PREMIUM_MAX_ESSAY_WORDS : FREE_MAX_ESSAY_WORDS
  const reviewsLeft = typeof window !== 'undefined' ? getReviewsRemaining() : (plan === 'free' ? FREE_REVIEW_LIFETIME : 5)

  const wc = wordCount(body)
  const wcColor = wc > MAX_WORDS ? '#C0392B' : wc >= MIN_WORDS ? '#6E6E73' : '#B0B0B8'
  const isDirty = title !== originalTitle.current || body !== originalBody.current

  const limitMsg = plan === 'free'
    ? `Free plan: ${FREE_REVIEW_LIFETIME} lifetime reviews used up. Upgrade to Premium for 5/day.`
    : "You've used all 5 reviews for today. Come back tomorrow!"

  const errorMessages: Record<NonNullable<ValidationError>, string> = {
    not_english:         t('essays_not_english'),
    too_short:           t('essays_too_short'),
    too_long:            t('essays_too_long'),
    limit_reached:       limitMsg,
    service_unavailable: "Editor's Review is temporarily unavailable.",
  }

  // Save — update same essay, no new essay created
  function handleSave() {
    if (!body.trim() || !essay) return
    const updated = updateEssay(id, { title, body })
    if (updated) {
      setEssay(updated)
      originalTitle.current = updated.title
      originalBody.current  = updated.body
      setTitle(updated.title)
      setSaveFlash(true)
      setTimeout(() => setSaveFlash(false), 1500)
    }
  }

  // Review — update same essay + re-review, never creates a new essay
  async function handleReview() {
    if (!essay) return
    setError(null)
    if (!canReview()) { setError('limit_reached'); return }
    if (wc < MIN_WORDS) { setError('too_short'); return }
    if (wc > MAX_WORDS) { setError('too_long'); return }

    // Save current edits first
    updateEssay(id, { title, body })

    setLoading(true)
    try {
      const res = await fetch('/api/essays/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayId: id, essayBody: body, essayTitle: title || essay.title, language: prefs.language }),
      })
      const data = await res.json()
      if (!res.ok) {
        const errCode = data.error as string
        setError((['not_english','too_short','too_long','service_unavailable'] as const).includes(errCode as never)
          ? errCode as ValidationError : 'service_unavailable')
        setLoading(false)
        return
      }
      const updated = saveReview(id, data.review)
      if (updated) {
        setEssay(updated)
        originalTitle.current = updated.title
        originalBody.current  = updated.body
      }
      recordReviewUsed()
    } catch {
      setError('service_unavailable')
    }
    setLoading(false)
  }

  // Delete
  function handleDelete() {
    deleteEssay(id)
    router.push('/essays')
  }

  // Dev: re-review
  async function handleDevRereview() {
    if (!essay || loading) return
    setDevMsg('Calling Claude…')
    setLoading(true)
    try {
      const res = await fetch('/api/essays/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayId: id, essayBody: body, essayTitle: title, language: prefs.language ?? 'ko' }),
      })
      if (!res.ok) { setDevMsg(`Error ${res.status}`); return }
      const data = await res.json()
      const updated = saveReview(id, data.review)
      if (updated) setEssay(updated)
      setDevMsg('Re-review saved!')
      setTimeout(() => setDevMsg(''), 3000)
    } catch (e) { setDevMsg(`Failed: ${String(e)}`) }
    setLoading(false)
  }

  if (!essay) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--pm)', fontSize: 14 }}>Essay not found.</p>
      </div>
    )
  }

  const review = essay.review
  const challenges = review
    ? Array.isArray(review.nextChallenge) ? review.nextChallenge : [review.nextChallenge]
    : []

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <TopNav />

      {/* Sub-bar: back + word count + delete */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 20px 10px',
        maxWidth: 580, width: '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>
        <button
          type="button"
          onClick={() => router.push('/essays')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 0' }}
        >
          <ArrowLeft style={{ width: 13, height: 13, color: 'var(--pm)' }} strokeWidth={1.8} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', color: 'var(--pm)' }}>ESSAYS</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {isDirty && (
            <span style={{ fontSize: 9.5, fontWeight: 600, color: '#B0B0B8', letterSpacing: '0.08em' }}>● Editing</span>
          )}
          <span style={{ fontSize: 10, fontWeight: 600, color: wcColor, transition: 'color 0.2s', letterSpacing: '0.02em' }}>
            {wc} words
          </span>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            <Trash2 style={{ width: 14, height: 14, color: 'var(--pm2)' }} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div style={{
        flex: 1, maxWidth: 580, width: '100%',
        margin: '0 auto', padding: '4px 28px 80px', boxSizing: 'border-box',
      }}>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => { titleManuallyEdited.current = true; setTitle(e.target.value) }}
          disabled={loading}
          style={{
            width: '100%', border: 'none', outline: 'none',
            background: 'transparent',
            fontSize: 'clamp(1.15rem, 4.5vw, 1.55rem)',
            fontWeight: 800, color: 'var(--pt)',
            marginBottom: 14, padding: 0, fontFamily: 'inherit',
          }}
        />

        {/* Body */}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
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

        {/* Validation error */}
        {error && (
          <p style={{ fontSize: 12, color: 'var(--pa)', marginTop: 12, fontStyle: 'italic' }}>
            {errorMessages[error]}
          </p>
        )}

        {/* Action buttons */}
        <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
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
            {saveFlash ? '✓ Saved' : 'Save'}
          </button>

          {/* Review */}
          <button
            type="button"
            onClick={handleReview}
            disabled={loading || wc < MIN_WORDS}
            style={{
              ...glassBtn(),
              opacity: loading || wc < MIN_WORDS ? 0.45 : 1,
              cursor: loading || wc < MIN_WORDS ? 'default' : 'pointer',
              fontSize: 13, fontWeight: 700, color: '#5A5A62',
            }}
            onMouseEnter={e => { if (!loading && wc >= MIN_WORDS) e.currentTarget.style.filter = 'brightness(0.97)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
          >
            {loading
              ? <><Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />{t('essays_reviewing')}</>
              : <><Sparkles style={{ width: 12, height: 12, strokeWidth: 1.8 }} />{review ? 'Re-review' : t('essays_submit')}</>
            }
          </button>
        </div>

        {wc > 0 && wc < MIN_WORDS && (
          <p style={{ fontSize: 10, color: '#B0B0B8', marginTop: 8, fontStyle: 'italic', textAlign: 'right' }}>
            {MIN_WORDS - wc} more words for Review
          </p>
        )}

        {/* ── Review panel (reference — shown below editor) ── */}
        {review && (
          <div style={{ marginTop: 56, borderTop: '1px solid var(--pd)', paddingTop: 36 }}>

            {/* Style badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm)' }}>
                {t('essays_detected_style')}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: 'var(--pa)',
                background: 'var(--pal)', padding: '3px 10px',
                borderRadius: 20, letterSpacing: '0.04em',
              }}>
                {review.detectedStyle}
              </span>
            </div>

            {/* Annotated manuscript */}
            <AnnotatedManuscript body={essay.body} annotations={review.annotations} />

            {/* Editor marks */}
            <EditorNotes annotations={review.annotations} />

            {/* Editor comment */}
            <div style={{ marginTop: 44, borderTop: '1px solid var(--pd)', paddingTop: 32 }}>
              <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.28em', color: 'var(--pm)', margin: '0 0 14px' }}>
                {t('essays_editor_comment')}
              </p>
              <p className="font-playfair" style={{
                fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', fontStyle: 'italic',
                color: 'var(--pt)', lineHeight: 1.75, margin: 0,
              }}>
                &ldquo;{review.editorComment}&rdquo;
              </p>
            </div>

            {/* Next challenge */}
            {challenges.length > 0 && (
              <div style={{ marginTop: 32, padding: '22px', borderRadius: 16, background: 'var(--pd)' }}>
                <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.28em', color: 'var(--pa)', margin: '0 0 14px' }}>
                  {t('essays_next_challenge')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {challenges.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ width: 16, height: 16, borderRadius: 3, border: '1.5px solid var(--pm2)', flexShrink: 0, marginTop: 2, display: 'inline-block' }} />
                      <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--pt)', fontWeight: 400 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested version */}
            {review.suggestedVersion && <SuggestedVersion text={review.suggestedVersion} />}
          </div>
        )}

        {/* Dev tools */}
        {IS_DEV && (
          <div style={{ marginTop: 60, borderTop: '1px dashed var(--pd)', paddingTop: 20 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--pm2)', margin: '0 0 14px' }}>DEV TOOLS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={handleDevRereview} disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 0', borderRadius: 10, border: '1.5px solid #c0392b', background: 'none', cursor: loading ? 'default' : 'pointer', fontSize: 12, fontWeight: 700, color: '#c0392b', fontFamily: 'inherit', opacity: loading ? 0.5 : 1 }}>
                <RefreshCw style={{ width: 12, height: 12 }} strokeWidth={2} />
                {loading ? 'Reviewing…' : 'Re-review (Regenerate)'}
              </button>
              <button type="button" onClick={() => { resetDailyReviewCount(); setDevMsg('Daily review count reset!'); setTimeout(() => setDevMsg(''), 2000) }}
                style={{ padding: '12px 0', borderRadius: 10, border: '1.5px solid var(--pd)', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit' }}>
                Reset Daily Review Count
              </button>
              {devMsg && <p style={{ fontSize: 11, color: 'var(--pa)', margin: 0, textAlign: 'center' }}>{devMsg}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 env(safe-area-inset-bottom, 0px)' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{ background: 'var(--pb)', borderRadius: '22px 22px 0 0', padding: '32px 28px 36px', width: '100%', maxWidth: 540, boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--pd)', margin: '0 auto 28px' }} />
            <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--pt)', margin: '0 0 10px', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{t('essays_delete_title')}</p>
            <p style={{ fontSize: 13, color: 'var(--pm)', margin: '0 0 32px', lineHeight: 1.65 }}>{t('essays_delete_desc')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={handleDelete}
                style={{ width: '100%', padding: '15px 0', borderRadius: 14, background: 'var(--pglass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--pglass-border)', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--pa)', fontFamily: 'inherit', letterSpacing: '0.03em' }}>
                {t('essays_delete_confirm')}
              </button>
              <button type="button" onClick={() => setShowDeleteConfirm(false)}
                style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: '1.5px solid var(--pd)', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit' }}>
                {t('essays_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
