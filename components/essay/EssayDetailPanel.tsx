'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Loader2, Sparkles, Trash2, RefreshCw, X,
  ChevronDown, BookOpen, Zap, GraduationCap, GitCompare, Pencil,
} from 'lucide-react'
import {
  type Essay, type VocabItem, type ChunkItem, type GrammarTip,
  getEssay, updateEssay, deleteEssay, saveReview,
  canReview, recordReviewUsed, autoTitle,
  resetDailyReviewCount,
} from '@/lib/essays/storage'
import { getPlan, FREE_MAX_ESSAY_WORDS, PREMIUM_MAX_ESSAY_WORDS } from '@/lib/subscription/storage'
import { addMySentence } from '@/lib/sentences/storage'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { AnnotatedManuscript } from '@/components/essay/EssayRenderer'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'

const IS_DEV = process.env.NODE_ENV === 'development'
const MIN_WORDS = 30
function wordCount(t: string) { return t.trim().split(/\s+/).filter(Boolean).length }

type ValidationError = 'not_english' | 'too_short' | 'too_long' | 'limit_reached' | 'daily_limit' | 'unauthenticated' | 'service_unavailable' | null

const glassCard: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid var(--pglass-border)',
  borderRadius: 18,
  padding: '20px',
}
const sectionLabel: React.CSSProperties = {
  fontSize: 8.5, fontWeight: 700, letterSpacing: '0.22em',
  color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 12px',
}

// ── Word-level diff ───────────────────────────────────────────────────────────
function DiffText({ original, corrected }: { original: string; corrected: string }) {
  const origWords = original.trim().split(/\s+/)
  const corrWords = corrected.trim().split(/\s+/)
  const n = origWords.length, m = corrWords.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i][j] = origWords[i-1].toLowerCase().replace(/[.,!?;:"']/g, '') ===
                 corrWords[j-1].toLowerCase().replace(/[.,!?;:"']/g, '')
        ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1])
  const changed = new Array(m).fill(true)
  let i = n, j = m
  while (i > 0 && j > 0) {
    if (origWords[i-1].toLowerCase().replace(/[.,!?;:"']/g, '') ===
        corrWords[j-1].toLowerCase().replace(/[.,!?;:"']/g, '')) {
      changed[j-1] = false; i--; j--
    } else if (dp[i-1][j] >= dp[i][j-1]) { i-- } else { j-- }
  }
  return (
    <p style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--pt)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {corrWords.map((word, idx) => (
        <span key={idx}>
          {idx > 0 ? ' ' : ''}
          {changed[idx]
            ? <mark style={{ background: 'rgba(52,199,89,0.18)', color: '#1A7A35', borderRadius: 3, padding: '0 2px', fontWeight: 600 }}>{word}</mark>
            : word}
        </span>
      ))}
    </p>
  )
}

function ScoreRing({ score }: { score: number }) {
  const r = 32, circ = 2 * Math.PI * r
  const color = score >= 80 ? '#34C759' : score >= 60 ? '#FF9F0A' : '#FF3B30'
  return (
    <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
      <svg width={88} height={88} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={44} cy={44} r={r} fill="none" stroke="var(--pd)" strokeWidth={6} />
        <circle cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: 'var(--pm2)', fontWeight: 600, letterSpacing: '0.04em' }}>/100</span>
      </div>
    </div>
  )
}

function CollapsibleSection({ icon, title, count, color, children }: {
  icon: React.ReactNode; title: string; count?: number; color: string; children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderTop: '1px solid var(--pd)' }}>
      <button type="button" onClick={() => setOpen(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '18px 0', background: 'none', border: 'none',
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      }}>
        <span style={{ color, flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--pt)' }}>{title}</span>
        {count !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, borderRadius: 20, padding: '2px 9px' }}>{count}</span>
        )}
        <ChevronDown style={{ width: 14, height: 14, color: 'var(--pm2)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} strokeWidth={2.2} />
      </button>
      {open && <div style={{ paddingBottom: 20 }}>{children}</div>}
    </div>
  )
}

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  tense: { bg: 'rgba(255,59,48,0.10)', color: '#C0392B' },
  agreement: { bg: 'rgba(255,59,48,0.10)', color: '#C0392B' },
  verbForm: { bg: 'rgba(255,59,48,0.10)', color: '#C0392B' },
  article: { bg: 'rgba(255,149,0,0.12)', color: '#B36200' },
  preposition: { bg: 'rgba(255,149,0,0.12)', color: '#B36200' },
  vocabulary: { bg: 'rgba(88,86,214,0.12)', color: '#4B44C4' },
  vocab: { bg: 'rgba(88,86,214,0.12)', color: '#4B44C4' },
  missing: { bg: 'rgba(255,59,48,0.10)', color: '#C0392B' },
  spelling: { bg: 'rgba(255,59,48,0.10)', color: '#C0392B' },
  punctuation: { bg: 'rgba(90,90,100,0.10)', color: '#5A5A64' },
  capitalization: { bg: 'rgba(90,90,100,0.10)', color: '#5A5A64' },
  wordOrder: { bg: 'rgba(88,86,214,0.12)', color: '#4B44C4' },
  pronoun: { bg: 'rgba(88,86,214,0.12)', color: '#4B44C4' },
  plural: { bg: 'rgba(255,59,48,0.10)', color: '#C0392B' },
}
const TAG_LABELS: Record<string, string> = {
  tense: 'Tense', agreement: 'Agreement', verbForm: 'Verb Form',
  article: 'Article', preposition: 'Preposition', vocabulary: 'Vocabulary',
  vocab: 'Vocabulary', missing: 'Missing', spelling: 'Spelling',
  punctuation: 'Punctuation', capitalization: 'Capital', wordOrder: 'Word Order',
  pronoun: 'Pronoun', plural: 'Plural',
}

const REVIEW_STEPS = ['Checking grammar', 'Improving vocabulary', 'Enhancing natural expressions', 'Preparing feedback']

function ReviewOverlay({ visible }: { visible: boolean }) {
  const [step, setStep] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  useEffect(() => {
    if (!visible) return
    setStep(0); setFadeOut(false)
    const timers = REVIEW_STEPS.map((_, i) => setTimeout(() => setStep(i), i * 1400))
    return () => timers.forEach(clearTimeout)
  }, [visible])
  useEffect(() => { if (!visible) setFadeOut(true) }, [visible])
  if (!visible && fadeOut) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', animation: fadeOut ? 'overlayFadeOut 0.35s ease forwards' : 'overlayFadeIn 0.3s ease' }}>
      <div style={{ background: 'var(--pglass)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', border: '1px solid var(--pglass-border)', borderRadius: 28, padding: '40px 36px', width: 'min(320px, calc(100vw - 48px))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, animation: fadeOut ? 'overlayScaleOut 0.35s ease forwards' : 'overlayScaleIn 0.3s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <svg width={56} height={56} style={{ animation: 'spin 1.4s linear infinite', position: 'absolute', inset: 0 }}>
            <circle cx={28} cy={28} r={24} fill="none" stroke="var(--pglass-border)" strokeWidth={3} />
            <circle cx={28} cy={28} r={24} fill="none" stroke="var(--pa)" strokeWidth={3} strokeDasharray="40 110" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles style={{ width: 18, height: 18, color: 'var(--pa)' }} strokeWidth={1.8} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--pt)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>Reviewing your essay...</p>
          <p key={step} style={{ fontSize: 12, color: 'var(--pm)', margin: 0, minHeight: 18, animation: 'stepFade 0.4s ease' }}>{REVIEW_STEPS[step]}</p>
        </div>
        <div style={{ width: '100%', height: 3, background: 'var(--pglass-border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '40%', borderRadius: 99, background: 'var(--pa)', animation: 'progressSlide 1.6s ease-in-out infinite' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {REVIEW_STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 16 : 6, height: 6, borderRadius: 99, background: i <= step ? 'var(--pa)' : 'var(--pglass-border)', transition: 'all 0.4s ease' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────
type Props = {
  id: string
  onClose: () => void
  onDeleted: () => void
}

export function EssayDetailPanel({ id, onClose, onDeleted }: Props) {
  const t = useT()
  const { prefs } = usePreferences()
  const trainer = useTrainerSafe()

  const [essay, setEssay]                   = useState<Essay | null>(null)
  const [title, setTitle]                   = useState('')
  const [body, setBody]                     = useState('')
  const [isEditing, setIsEditing]           = useState(false)
  const [loading, setLoading]               = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [error, setError]                   = useState<ValidationError>(null)

  const [showCompare, setShowCompare]       = useState(false)
  const [showAllFeedback, setShowAllFeedback] = useState(false)
  const [devMsg, setDevMsg]                 = useState('')

  const titleManuallyEdited = useRef(false)

  useEffect(() => {
    const e = getEssay(id)
    if (!e) return
    setEssay(e); setTitle(e.title); setBody(e.body)
    if (!e.review) setIsEditing(true)
  }, [id])

  useEffect(() => {
    if (titleManuallyEdited.current || !isEditing) return
    const generated = autoTitle(body)
    if (generated) setTitle(generated)
  }, [body, isEditing])

  const plan = typeof window !== 'undefined' ? getPlan() : 'free'
  const MAX_WORDS = plan === 'premium' ? PREMIUM_MAX_ESSAY_WORDS : FREE_MAX_ESSAY_WORDS
  const wc = wordCount(body)
  const wcColor = wc > MAX_WORDS ? '#C0392B' : wc >= MIN_WORDS ? '#6E6E73' : '#B0B0B8'

  const errorMessages: Record<NonNullable<ValidationError>, string> = {
    not_english: t('essays_not_english'),
    too_short: t('essays_too_short'),
    too_long: t('essays_too_long'),
    limit_reached: t('essays_limit_reached'),
    daily_limit: t('essays_limit_reached'),
    unauthenticated: t('auth_required'),
    service_unavailable: "Editor's Review is temporarily unavailable.",
  }

  function autoSave() {
    if (!essay || !body.trim()) return
    updateEssay(id, { title, body })
  }

  async function handleReview() {
    if (!essay) return
    setError(null)
    const reviewCheck = canReview()
    if (!reviewCheck.allowed) { setError('limit_reached'); return }
    if (wc < MIN_WORDS) { setError('too_short'); return }
    if (wc > MAX_WORDS) { setError('too_long'); return }

    autoSave()
    setLoading(true); setOverlayVisible(true)
    const minDelay = new Promise(r => setTimeout(r, 700))
    try {
      const res = await fetch('/api/essays/review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayId: id, essayBody: body, essayTitle: title || essay.title, language: prefs.language }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch {}
      await minDelay
      setOverlayVisible(false)
      await new Promise(r => setTimeout(r, 350))
      if (!res.ok) {
        const errCode = data.error as string
        const knownErrors = ['not_english','too_short','too_long','limit_reached','daily_limit','unauthenticated','service_unavailable'] as const
        setError(knownErrors.includes(errCode as never) ? errCode as ValidationError : 'service_unavailable')
        setLoading(false); return
      }
      const updated = saveReview(id, data.review as Parameters<typeof saveReview>[1])
      if (updated) { setEssay(updated); setTitle(updated.title); setBody(updated.body) }
      if (!data.cached) recordReviewUsed()
      if (data.cached) { trainer?.showMessage(t('essays_no_change'), 3500) }
      setIsEditing(false)
    } catch { await minDelay; setOverlayVisible(false); setError('service_unavailable') }
    setLoading(false)
  }

  async function handleDevRereview() {
    if (!essay || loading) return
    setDevMsg('Calling API…'); setLoading(true)
    try {
      const res = await fetch('/api/essays/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ essayId: id, essayBody: body, essayTitle: title, language: prefs.language ?? 'ko' }) })
      if (!res.ok) { setDevMsg(`Error ${res.status}`); setLoading(false); return }
      const data = await res.json()
      const updated = saveReview(id, data.review)
      if (updated) { setEssay(updated); setIsEditing(false) }
      setDevMsg('Done!'); setTimeout(() => setDevMsg(''), 3000)
    } catch (e) { setDevMsg(`Failed: ${String(e)}`) }
    setLoading(false)
  }

  function handleDelete() {
    deleteEssay(id)
    trainer?.showMessage('Removed.', 1500)
    setTimeout(() => { onDeleted(); onClose() }, 300)
  }

  function confirmDelete() {
    trainer?.ask('Remove this item?', [
      { label: 'Cancel', onClick: () => {} },
      { label: 'Remove', primary: true, onClick: handleDelete },
    ])
  }

  function handleEditClick() {
    autoSave(); setIsEditing(true); setError(null)
  }

  if (!essay) {
    return (
      <div style={{ background: 'var(--pglass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--pglass-border)', borderRadius: 24, padding: '40px', textAlign: 'center', animation: 'panelIn 0.25s cubic-bezier(0.22,1,0.36,1)' }}>
        <p style={{ color: 'var(--pm)', fontSize: 14 }}>Essay not found.</p>
      </div>
    )
  }

  const review = essay.review
  const grammarAnns = review?.annotations.filter(a => a.type === 'grammar') ?? []
  const FEEDBACK_INITIAL = 5
  const hasReviewContent = review
    ? (review.score !== undefined || review.commentOverall || review.editorComment ||
       (review.commentStrengths?.length ?? 0) > 0 || (review.commentImprovements?.length ?? 0) > 0)
    : false

  return (
    <div style={{ background: 'var(--pglass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--pglass-border)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', animation: 'panelIn 0.25s cubic-bezier(0.22,1,0.36,1)' }}>

      {/* Panel header / sub-bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 12px', borderBottom: '1px solid var(--pd)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm2)', textTransform: 'uppercase' }}>
            {essay.title || 'Untitled Essay'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isEditing && (
            <span style={{ fontSize: 10, fontWeight: 600, color: wcColor, transition: 'color 0.2s', letterSpacing: '0.02em' }}>{wc} words</span>
          )}
          {!isEditing && review && (
            <button type="button" onClick={handleEditClick}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit' }}>
              <Pencil style={{ width: 10, height: 10 }} strokeWidth={2} />
              Edit Essay
            </button>
          )}
          <button type="button" onClick={confirmDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 style={{ width: 14, height: 14, color: 'var(--pm2)' }} strokeWidth={1.8} />
          </button>
          <button type="button" onClick={onClose}
            style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--pm2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, transition: 'opacity 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.6' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
            <X style={{ width: 16, height: 16 }} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 24px 32px' }}>

        {/* Edit view */}
        {isEditing && (
          <div>
            <div style={{ ...glassCard, padding: '16px 18px', marginBottom: 8 }}>
              <input
                type="text" value={title}
                onChange={e => { titleManuallyEdited.current = true; setTitle(e.target.value) }}
                disabled={loading} placeholder="Title"
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 15, fontWeight: 700, color: 'var(--pt)', marginBottom: 12, padding: 0, fontFamily: 'inherit' }}
              />
              <div style={{ height: 1, background: 'var(--pd)', marginBottom: 14 }} />
              <textarea
                value={body} onChange={e => setBody(e.target.value)}
                disabled={loading} placeholder={t('essays_body_placeholder')}
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', resize: 'none', fontSize: 14.5, lineHeight: 1.75, color: 'var(--pt)', fontFamily: 'inherit', padding: 0, minHeight: 180, overflow: 'hidden' }}
                rows={Math.max(8, body.split('\n').length + (body.length / 60 | 0))}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: wcColor, fontWeight: 600 }}>{wc} words</span>
              </div>
            </div>
            {wc > 0 && wc < MIN_WORDS && (
              <p style={{ fontSize: 10, color: '#B0B0B8', marginBottom: 6, textAlign: 'right', fontStyle: 'italic' }}>{MIN_WORDS - wc} more words for Review</p>
            )}
            {error && <p style={{ fontSize: 12, color: 'var(--pa)', marginBottom: 8, fontStyle: 'italic' }}>{errorMessages[error]}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" onClick={autoSave} disabled={loading}
                style={{ flex: 1, padding: '15px 0', borderRadius: 14, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.45 : 1, fontSize: 14, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                Save
              </button>
              <button type="button" onClick={handleReview} disabled={loading || wc < MIN_WORDS}
                style={{ flex: 1, padding: '15px 0', borderRadius: 14, background: loading || wc < MIN_WORDS ? 'var(--pglass)' : 'var(--pa)', border: loading || wc < MIN_WORDS ? '1px solid var(--pglass-border)' : '1px solid transparent', cursor: loading || wc < MIN_WORDS ? 'default' : 'pointer', opacity: loading || wc < MIN_WORDS ? 0.45 : 1, fontSize: 14, fontWeight: 700, color: loading || wc < MIN_WORDS ? 'var(--pm)' : '#fff', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.2s' }}>
                {loading ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />{t('essays_reviewing')}</> : <><Sparkles style={{ width: 13, height: 13, strokeWidth: 1.8 }} />{t('essays_submit')}</>}
              </button>
            </div>
          </div>
        )}

        {/* Report view */}
        {!isEditing && review && (
          <div>
            {review.annotations.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={sectionLabel}>Editor&apos;s Marks</p>
                <div style={{ ...glassCard, lineHeight: 2.6 }}>
                  <AnnotatedManuscript body={essay.body} annotations={review.annotations} essayId={essay.id} />
                </div>
              </div>
            )}

            {grammarAnns.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={sectionLabel}>Detailed Feedback</p>
                <div style={{ ...glassCard, padding: '4px 20px 12px' }}>
                  {(showAllFeedback ? grammarAnns : grammarAnns.slice(0, FEEDBACK_INITIAL)).map((ann, i) => {
                    const tag = TAG_COLORS[ann.subType ?? ''] ?? { bg: 'rgba(90,90,100,0.10)', color: '#5A5A64' }
                    const label = TAG_LABELS[ann.subType ?? ''] ?? 'Other'
                    const visibleCount = showAllFeedback ? grammarAnns.length : Math.min(grammarAnns.length, FEEDBACK_INITIAL)
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 16px 1fr auto', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: i < visibleCount - 1 ? '1px solid var(--pd)' : 'none' }}>
                        <span style={{ fontSize: 12, color: 'var(--ann-red-fade)', textDecoration: 'line-through', wordBreak: 'break-word' }}>{ann.fragment}</span>
                        <span style={{ fontSize: 11, color: 'var(--pm2)', textAlign: 'center' }}>→</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1A7A35', wordBreak: 'break-word' }}>{ann.replacement ?? '—'}</span>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: tag.color, background: tag.bg, borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap' }}>{label}</span>
                      </div>
                    )
                  })}
                  {grammarAnns.length > FEEDBACK_INITIAL && (
                    <button type="button" onClick={() => setShowAllFeedback(v => !v)} style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--pa)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {showAllFeedback ? 'Show less' : `+ ${grammarAnns.length - FEEDBACK_INITIAL} more`}
                      <ChevronDown style={{ width: 11, height: 11, transition: 'transform 0.2s', transform: showAllFeedback ? 'rotate(180deg)' : 'none' }} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {hasReviewContent && (
              <div style={{ marginBottom: 20 }}>
                <p style={sectionLabel}>Editor&apos;s Review</p>
                <div style={{ ...glassCard }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {review.score !== undefined && <ScoreRing score={review.score} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {(review.commentOverall || review.editorComment) && (
                        <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--pt)', margin: '0 0 14px', fontStyle: 'italic' }}>{review.commentOverall ?? review.editorComment}</p>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {review.commentStrengths && review.commentStrengths.length > 0 && (
                          <div>
                            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#3A7A4A', margin: '0 0 8px' }}>✓ Strengths</p>
                            {review.commentStrengths.map((s, i) => <p key={i} style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--pt2)', margin: '0 0 5px' }}>• {s}</p>)}
                          </div>
                        )}
                        {review.commentImprovements && review.commentImprovements.length > 0 && (
                          <div>
                            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#B36200', margin: '0 0 8px' }}>▲ Areas to Improve</p>
                            {review.commentImprovements.map((s, i) => <p key={i} style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--pt2)', margin: '0 0 5px' }}>• {s}</p>)}
                          </div>
                        )}
                      </div>
                      {review.nextChallenge && !review.commentStrengths?.length && (
                        <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(88,86,214,0.07)', borderRadius: 10 }}>
                          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#5856D6', margin: '0 0 5px' }}>▶ Next Challenge</p>
                          <p style={{ fontSize: 12, color: 'var(--pt2)', margin: 0, lineHeight: 1.55 }}>
                            {Array.isArray(review.nextChallenge) ? review.nextChallenge.join(' ') : review.nextChallenge}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {review.suggestedVersion && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ ...sectionLabel, margin: 0 }}>Corrected Essay</p>
                    <Sparkles style={{ width: 11, height: 11, color: '#34C759' }} strokeWidth={2} />
                  </div>
                  <button type="button" onClick={() => setShowCompare(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 20, background: showCompare ? 'var(--pa)' : 'var(--pglass)', border: showCompare ? 'none' : '1px solid var(--pglass-border)', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: showCompare ? '#fff' : 'var(--pm)', fontFamily: 'inherit' }}>
                    <GitCompare style={{ width: 10, height: 10 }} strokeWidth={2} />
                    Compare
                  </button>
                </div>
                <div style={{ ...glassCard }}>
                  {showCompare ? <DiffText original={essay.body} corrected={review.suggestedVersion} /> : <p style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--pt)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{review.suggestedVersion}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => {
                        addMySentence({ text: review.suggestedVersion!, source: 'writing-studio' })
                        trainer?.showMessage('⭐ My Sentences에 저장됐어요.', 2000)
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--pglass-border)', borderRadius: 20, padding: '4px 11px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit' }}
                    >
                      ⭐ 이 문장 저장
                    </button>
                    <p style={{ fontSize: 10, color: 'var(--pm2)', margin: 0 }}>{wordCount(review.suggestedVersion)} words</p>
                  </div>
                </div>
              </div>
            )}

            {(review.vocabulary?.length || review.usefulChunks?.length || review.grammarTips?.length) ? (
              <div style={{ ...glassCard, padding: '0 20px', marginBottom: 20 }}>
                {review.vocabulary && review.vocabulary.length > 0 && (
                  <CollapsibleSection icon={<BookOpen style={{ width: 13, height: 13 }} strokeWidth={1.8} />} title="Vocabulary" count={review.vocabulary.length} color="#FF9F0A">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {review.vocabulary.map((v: VocabItem, i: number) => (
                        <div key={i} style={{ paddingBottom: 12, borderBottom: i < (review.vocabulary?.length ?? 0) - 1 ? '1px solid var(--pd)' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)' }}>{v.word}</span>
                            <span style={{ fontSize: 12, color: 'var(--pm2)' }}>{v.meaning}</span>
                          </div>
                          <p style={{ fontSize: 11.5, color: 'var(--pt2)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>&ldquo;{v.example}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
                {review.usefulChunks && review.usefulChunks.length > 0 && (
                  <CollapsibleSection icon={<Zap style={{ width: 13, height: 13 }} strokeWidth={1.8} />} title="Useful Chunks" count={review.usefulChunks.length} color="#5856D6">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {review.usefulChunks.map((c: ChunkItem, i: number) => (
                        <div key={i} style={{ paddingBottom: 10, borderBottom: i < (review.usefulChunks?.length ?? 0) - 1 ? '1px solid var(--pd)' : 'none' }}>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#5856D6', margin: '0 0 3px', fontFamily: 'var(--font-caveat, cursive)' }}>{c.expression}</p>
                          <p style={{ fontSize: 11.5, color: 'var(--pt2)', margin: 0, lineHeight: 1.5 }}>{c.usage}</p>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
                {review.grammarTips && review.grammarTips.length > 0 && (
                  <CollapsibleSection icon={<GraduationCap style={{ width: 13, height: 13 }} strokeWidth={1.8} />} title="Grammar Tips" count={review.grammarTips.length} color="#34C759">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {review.grammarTips.map((tip: GrammarTip, i: number) => (
                        <div key={i} style={{ paddingBottom: 14, borderBottom: i < (review.grammarTips?.length ?? 0) - 1 ? '1px solid var(--pd)' : 'none' }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#34C759', margin: '0 0 4px', letterSpacing: '0.03em' }}>{tip.point}</p>
                          <p style={{ fontSize: 12, color: 'var(--pt)', margin: '0 0 5px', lineHeight: 1.55 }}>{tip.explanation}</p>
                          <p style={{ fontSize: 11, color: 'var(--pm2)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>{tip.example}</p>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
              </div>
            ) : null}

            {IS_DEV && (
              <div style={{ marginTop: 40, borderTop: '1px dashed var(--pd)', paddingTop: 20 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--pm2)', margin: '0 0 14px' }}>DEV TOOLS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button type="button" onClick={handleDevRereview} disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 0', borderRadius: 10, border: '1.5px solid #c0392b', background: 'none', cursor: loading ? 'default' : 'pointer', fontSize: 12, fontWeight: 700, color: '#c0392b', fontFamily: 'inherit', opacity: loading ? 0.5 : 1 }}>
                    <RefreshCw style={{ width: 12, height: 12 }} strokeWidth={2} />
                    {loading ? 'Reviewing…' : 'Re-review (Regenerate)'}
                  </button>
                  <button type="button" onClick={() => { resetDailyReviewCount(); setDevMsg('Reset!'); setTimeout(() => setDevMsg(''), 2000) }}
                    style={{ padding: '12px 0', borderRadius: 10, border: '1.5px solid var(--pd)', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit' }}>
                    Reset Daily Count
                  </button>
                  {devMsg && <p style={{ fontSize: 11, color: 'var(--pa)', margin: 0, textAlign: 'center' }}>{devMsg}</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ReviewOverlay visible={overlayVisible} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes panelIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes overlayFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes overlayFadeOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes overlayScaleIn { from { opacity: 0; transform: scale(0.88) } to { opacity: 1; transform: scale(1) } }
        @keyframes overlayScaleOut { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.92) } }
        @keyframes progressSlide { 0% { transform: translateX(-100%) } 50% { transform: translateX(160%) } 100% { transform: translateX(160%) } }
        @keyframes stepFade { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}
