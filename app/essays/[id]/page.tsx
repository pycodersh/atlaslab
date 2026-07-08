'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Loader2, Sparkles, Trash2, RefreshCw,
  ChevronDown, BookOpen, Zap, GraduationCap, GitCompare, Pencil,
} from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import {
  type Essay, type VocabItem, type ChunkItem, type GrammarTip,
  getEssay, updateEssay, deleteEssay, saveReview,
  canReview, recordReviewUsed, autoTitle,
  resetDailyReviewCount, resetFreeReviewTotal,
} from '@/lib/essays/storage'
import { getPlan, FREE_MAX_ESSAY_WORDS, PREMIUM_MAX_ESSAY_WORDS, FREE_REVIEW_LIFETIME } from '@/lib/subscription/storage'
import { AnnotatedManuscript } from '@/components/essay/EssayRenderer'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'

const IS_DEV = process.env.NODE_ENV === 'development'
const MIN_WORDS = 30
function wordCount(t: string) { return t.trim().split(/\s+/).filter(Boolean).length }

type ValidationError = 'not_english' | 'too_short' | 'too_long' | 'limit_reached' | 'service_unavailable' | null

// ── Shared styles ─────────────────────────────────────────────────────────────
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

// ── Score ring ────────────────────────────────────────────────────────────────
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

// ── Collapsible section ───────────────────────────────────────────────────────
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

// ── Feedback tag styles ───────────────────────────────────────────────────────
const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  tense:          { bg: 'rgba(255,59,48,0.10)',   color: '#C0392B' },
  agreement:      { bg: 'rgba(255,59,48,0.10)',   color: '#C0392B' },
  verbForm:       { bg: 'rgba(255,59,48,0.10)',   color: '#C0392B' },
  article:        { bg: 'rgba(255,149,0,0.12)',   color: '#B36200' },
  preposition:    { bg: 'rgba(255,149,0,0.12)',   color: '#B36200' },
  vocabulary:     { bg: 'rgba(88,86,214,0.12)',   color: '#4B44C4' },
  vocab:          { bg: 'rgba(88,86,214,0.12)',   color: '#4B44C4' },
  missing:        { bg: 'rgba(255,59,48,0.10)',   color: '#C0392B' },
  spelling:       { bg: 'rgba(255,59,48,0.10)',   color: '#C0392B' },
  punctuation:    { bg: 'rgba(90,90,100,0.10)',   color: '#5A5A64' },
  capitalization: { bg: 'rgba(90,90,100,0.10)',   color: '#5A5A64' },
  wordOrder:      { bg: 'rgba(88,86,214,0.12)',   color: '#4B44C4' },
  pronoun:        { bg: 'rgba(88,86,214,0.12)',   color: '#4B44C4' },
  plural:         { bg: 'rgba(255,59,48,0.10)',   color: '#C0392B' },
}
const TAG_LABELS: Record<string, string> = {
  tense: 'Tense', agreement: 'Agreement', verbForm: 'Verb Form',
  article: 'Article', preposition: 'Preposition', vocabulary: 'Vocabulary',
  vocab: 'Vocabulary', missing: 'Missing', spelling: 'Spelling',
  punctuation: 'Punctuation', capitalization: 'Capital', wordOrder: 'Word Order',
  pronoun: 'Pronoun', plural: 'Plural',
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EssayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const t = useT()
  const { prefs } = usePreferences()

  const [essay, setEssay] = useState<Essay | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isEditing, setIsEditing] = useState(false)   // report → edit toggle
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ValidationError>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [showAllFeedback, setShowAllFeedback] = useState(false)
  const [devMsg, setDevMsg] = useState('')

  const titleManuallyEdited = useRef(false)

  useEffect(() => {
    const e = getEssay(id)
    if (!e) return
    setEssay(e)
    setTitle(e.title)
    setBody(e.body)
    // Draft with no review → start in edit mode
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

  const limitMsg = plan === 'free'
    ? `Free plan: ${FREE_REVIEW_LIFETIME} lifetime reviews used up.`
    : "You've used all 5 reviews for today."
  const errorMessages: Record<NonNullable<ValidationError>, string> = {
    not_english:         t('essays_not_english'),
    too_short:           t('essays_too_short'),
    too_long:            t('essays_too_long'),
    limit_reached:       limitMsg,
    service_unavailable: "Editor's Review is temporarily unavailable.",
  }

  // Auto-save before review
  function autoSave() {
    if (!essay || !body.trim()) return
    updateEssay(id, { title, body })
  }

  async function handleReview() {
    if (!essay) return
    setError(null)
    if (!canReview()) { setError('limit_reached'); return }
    if (wc < MIN_WORDS) { setError('too_short'); return }
    if (wc > MAX_WORDS) { setError('too_long'); return }
    autoSave()
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
        setTitle(updated.title)
        setBody(updated.body)
      }
      recordReviewUsed()
      setIsEditing(false)  // switch to report mode
    } catch {
      setError('service_unavailable')
    }
    setLoading(false)
  }

  async function handleDevRereview() {
    if (!essay || loading) return
    setDevMsg('Calling API…')
    setLoading(true)
    try {
      const res = await fetch('/api/essays/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayId: id, essayBody: body, essayTitle: title, language: prefs.language ?? 'ko' }),
      })
      if (!res.ok) { setDevMsg(`Error ${res.status}`); setLoading(false); return }
      const data = await res.json()
      const updated = saveReview(id, data.review)
      if (updated) { setEssay(updated); setIsEditing(false) }
      setDevMsg('Done!')
      setTimeout(() => setDevMsg(''), 3000)
    } catch (e) { setDevMsg(`Failed: ${String(e)}`) }
    setLoading(false)
  }

  function handleDelete() {
    deleteEssay(id)
    router.push('/essays')
  }

  function handleEditClick() {
    autoSave()
    setIsEditing(true)
    setError(null)
  }

  if (!essay) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--pm)', fontSize: 14 }}>Essay not found.</p>
      </div>
    )
  }

  const review = essay.review
  const grammarAnns = review?.annotations.filter(a => a.type === 'grammar') ?? []
  const FEEDBACK_INITIAL = 5

  // ── Sub-bar ───────────────────────────────────────────────────────────────
  const subBar = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 20px 8px', maxWidth: 600, width: '100%', margin: '0 auto', boxSizing: 'border-box',
    }}>
      <div />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Edit mode: word count */}
        {isEditing && (
          <span style={{ fontSize: 10, fontWeight: 600, color: wcColor, transition: 'color 0.2s', letterSpacing: '0.02em' }}>{wc} words</span>
        )}
        {/* Report mode: Edit button */}
        {!isEditing && review && (
          <button type="button" onClick={handleEditClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'var(--pglass)', border: '1px solid var(--pglass-border)',
              borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit',
            }}>
            <Pencil style={{ width: 10, height: 10 }} strokeWidth={2} />
            Edit Essay
          </button>
        )}
        <button type="button" onClick={() => setShowDeleteConfirm(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
          <Trash2 style={{ width: 14, height: 14, color: 'var(--pm2)' }} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )

  // ── Edit mode ─────────────────────────────────────────────────────────────
  const editView = (
    <div style={{ flex: 1, maxWidth: 600, width: '100%', margin: '0 auto', padding: '0 20px calc(80px + env(safe-area-inset-bottom, 0px))', boxSizing: 'border-box' }}>
      <div style={{ ...glassCard, padding: '16px 18px', marginBottom: 8 }}>
        <input
          type="text"
          value={title}
          onChange={e => { titleManuallyEdited.current = true; setTitle(e.target.value) }}
          disabled={loading}
          placeholder="Title"
          style={{
            width: '100%', border: 'none', outline: 'none', background: 'transparent',
            fontSize: 15, fontWeight: 700, color: 'var(--pt)',
            marginBottom: 12, padding: 0, fontFamily: 'inherit',
          }}
        />
        <div style={{ height: 1, background: 'var(--pd)', marginBottom: 14 }} />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          disabled={loading}
          placeholder={t('essays_body_placeholder')}
          style={{
            width: '100%', border: 'none', outline: 'none', background: 'transparent',
            resize: 'none', fontSize: 14.5, lineHeight: 1.75,
            color: 'var(--pt)', fontFamily: 'inherit', padding: 0,
            minHeight: 180, overflow: 'hidden',
          }}
          rows={Math.max(8, body.split('\n').length + (body.length / 60 | 0))}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <span style={{ fontSize: 10, color: wcColor, fontWeight: 600 }}>{wc} words</span>
        </div>
      </div>

      {wc > 0 && wc < MIN_WORDS && (
        <p style={{ fontSize: 10, color: '#B0B0B8', marginBottom: 6, textAlign: 'right', fontStyle: 'italic' }}>
          {MIN_WORDS - wc} more words for Review
        </p>
      )}
      {error && (
        <p style={{ fontSize: 12, color: 'var(--pa)', marginBottom: 8, fontStyle: 'italic' }}>
          {errorMessages[error]}
        </p>
      )}

      {/* Inline Get Review button */}
      <button
        type="button"
        onClick={handleReview}
        disabled={loading || wc < MIN_WORDS}
        style={{
          width: '100%', padding: '15px 0', borderRadius: 14, marginTop: 8,
          background: loading || wc < MIN_WORDS ? 'var(--pglass)' : 'var(--pa)',
          border: loading || wc < MIN_WORDS ? '1px solid var(--pglass-border)' : '1px solid transparent',
          boxShadow: 'none',
          cursor: loading || wc < MIN_WORDS ? 'default' : 'pointer',
          opacity: loading || wc < MIN_WORDS ? 0.45 : 1,
          fontSize: 14, fontWeight: 700,
          color: loading || wc < MIN_WORDS ? 'var(--pm)' : '#fff',
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          transition: 'all 0.2s',
        }}
      >
        {loading
          ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />{t('essays_reviewing')}</>
          : <><Sparkles style={{ width: 13, height: 13, strokeWidth: 1.8 }} />{t('essays_submit')}</>
        }
      </button>
    </div>
  )

  // ── Report mode ───────────────────────────────────────────────────────────
  // Determine if there is any meaningful content in Editor's Review
  const hasReviewContent = review
    ? (review.score !== undefined || review.commentOverall || review.editorComment ||
       (review.commentStrengths?.length ?? 0) > 0 || (review.commentImprovements?.length ?? 0) > 0)
    : false

  const reportView = review ? (
    <div style={{ flex: 1, maxWidth: 600, width: '100%', margin: '0 auto', padding: `0 20px calc(${64}px + env(safe-area-inset-bottom, 0px))`, boxSizing: 'border-box' }}>

      {/* 1. Editor's Marks */}
      {review.annotations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={sectionLabel}>Editor&apos;s Marks</p>
          <div style={{ ...glassCard, lineHeight: 2.6 }}>
            <AnnotatedManuscript body={essay.body} annotations={review.annotations} essayId={essay.id} />
          </div>
        </div>
      )}

      {/* 2. Detailed Feedback */}
      {grammarAnns.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={sectionLabel}>Detailed Feedback</p>
          <div style={{ ...glassCard, padding: '4px 20px 12px' }}>
            {(showAllFeedback ? grammarAnns : grammarAnns.slice(0, FEEDBACK_INITIAL)).map((ann, i) => {
              const tag = TAG_COLORS[ann.subType ?? ''] ?? { bg: 'rgba(90,90,100,0.10)', color: '#5A5A64' }
              const label = TAG_LABELS[ann.subType ?? ''] ?? 'Other'
              const visibleCount = showAllFeedback ? grammarAnns.length : Math.min(grammarAnns.length, FEEDBACK_INITIAL)
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 16px 1fr auto',
                  alignItems: 'center', gap: 8,
                  padding: '10px 0',
                  borderBottom: i < visibleCount - 1 ? '1px solid var(--pd)' : 'none',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--ann-red-fade)', textDecoration: 'line-through', wordBreak: 'break-word' }}>{ann.fragment}</span>
                  <span style={{ fontSize: 11, color: 'var(--pm2)', textAlign: 'center' }}>→</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1A7A35', wordBreak: 'break-word' }}>{ann.replacement ?? '—'}</span>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: tag.color, background: tag.bg, borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
              )
            })}
            {grammarAnns.length > FEEDBACK_INITIAL && (
              <button type="button" onClick={() => setShowAllFeedback(v => !v)} style={{
                marginTop: 6, background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, color: 'var(--pa)', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {showAllFeedback ? 'Show less' : `+ ${grammarAnns.length - FEEDBACK_INITIAL} more`}
                <ChevronDown style={{ width: 11, height: 11, transition: 'transform 0.2s', transform: showAllFeedback ? 'rotate(180deg)' : 'none' }} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Editor's Review */}
      {hasReviewContent && (
        <div style={{ marginBottom: 20 }}>
          <p style={sectionLabel}>Editor&apos;s Review</p>
          <div style={{ ...glassCard }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {review.score !== undefined && <ScoreRing score={review.score} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* New structured comment, or legacy editorComment fallback */}
                {(review.commentOverall || review.editorComment) && (
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--pt)', margin: '0 0 14px', fontStyle: 'italic' }}>
                    {review.commentOverall ?? review.editorComment}
                  </p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {review.commentStrengths && review.commentStrengths.length > 0 && (
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#3A7A4A', margin: '0 0 8px' }}>✓ Strengths</p>
                      {review.commentStrengths.map((s, i) => (
                        <p key={i} style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--pt2)', margin: '0 0 5px' }}>• {s}</p>
                      ))}
                    </div>
                  )}
                  {review.commentImprovements && review.commentImprovements.length > 0 && (
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#B36200', margin: '0 0 8px' }}>▲ Areas to Improve</p>
                      {review.commentImprovements.map((s, i) => (
                        <p key={i} style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--pt2)', margin: '0 0 5px' }}>• {s}</p>
                      ))}
                    </div>
                  )}
                </div>
                {/* Legacy: nextChallenge */}
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

      {/* 4. Corrected Essay */}
      {review.suggestedVersion && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{ ...sectionLabel, margin: 0 }}>Corrected Essay</p>
              <Sparkles style={{ width: 11, height: 11, color: '#34C759' }} strokeWidth={2} />
            </div>
            <button type="button" onClick={() => setShowCompare(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 20,
              background: showCompare ? 'var(--pa)' : 'var(--pglass)',
              border: showCompare ? 'none' : '1px solid var(--pglass-border)',
              cursor: 'pointer', fontSize: 11, fontWeight: 600,
              color: showCompare ? '#fff' : 'var(--pm)', fontFamily: 'inherit',
            }}>
              <GitCompare style={{ width: 10, height: 10 }} strokeWidth={2} />
              Compare
            </button>
          </div>
          <div style={{ ...glassCard }}>
            {showCompare
              ? <DiffText original={essay.body} corrected={review.suggestedVersion} />
              : <p style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--pt)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{review.suggestedVersion}</p>
            }
            <p style={{ fontSize: 10, color: 'var(--pm2)', margin: '12px 0 0', textAlign: 'right' }}>
              {wordCount(review.suggestedVersion)} words
            </p>
          </div>
        </div>
      )}

      {/* 5-7. Expandable sections */}
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

      {/* Dev tools */}
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
            <button type="button" onClick={() => { resetFreeReviewTotal(); setDevMsg('Reset!'); setTimeout(() => setDevMsg(''), 2000) }}
              style={{ padding: '12px 0', borderRadius: 10, border: '1.5px solid var(--pd)', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit' }}>
              Reset Lifetime Count
            </button>
            {devMsg && <p style={{ fontSize: 11, color: 'var(--pa)', margin: 0, textAlign: 'center' }}>{devMsg}</p>}
          </div>
        </div>
      )}
    </div>
  ) : null

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--pb)' }}>
      <TopNav />
      {subBar}
      {isEditing ? editView : reportView}

      {/* Delete confirm sheet */}
      {showDeleteConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{ background: 'var(--pb)', borderRadius: '22px 22px 0 0', padding: '32px 28px calc(36px + env(safe-area-inset-bottom, 0px))', width: '100%', maxWidth: 540 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--pd)', margin: '0 auto 28px' }} />
            <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--pt)', margin: '0 0 10px' }}>{t('essays_delete_title')}</p>
            <p style={{ fontSize: 13, color: 'var(--pm)', margin: '0 0 32px', lineHeight: 1.65 }}>{t('essays_delete_desc')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={handleDelete}
                style={{ width: '100%', padding: '15px 0', borderRadius: 14, background: 'var(--pglass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--pglass-border)', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--pa)', fontFamily: 'inherit' }}>
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
