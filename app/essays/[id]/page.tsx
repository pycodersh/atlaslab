'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Copy, Check, RefreshCw } from 'lucide-react'
import { NAV_HEIGHT } from '@/components/TopNav'
import { type Essay, type Annotation, getEssay, deleteEssay, saveReview, resetDailyReviewCount } from '@/lib/essays/storage'
import { useT } from '@/hooks/useT'
import { usePreferences } from '@/contexts/PreferencesContext'

const IS_DEV = process.env.NODE_ENV === 'development'

// ── Editor color palette — dark ink-on-paper feel ────────────────────────────
const PEN_RED    = '#8B1A1A'  // dark burgundy red (grammar, typical)
const PEN_PURPLE = '#6C2D82'  // deep violet (expression)
const PEN_GREEN  = '#1a7a3a'  // forest green (strength)

// ── Fixed editor personality — subtle y-variation only (no rotation/drift) ───
const EV_LUT = [0, 2, -1, 3, -2, 1, -3, 2, 0, -1, 3, -2, 1, 0, -1]
function ev(i: number): number { return EV_LUT[i % EV_LUT.length] }

// ── Build segments ────────────────────────────────────────────────────────────
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

// ── Annotated manuscript body ─────────────────────────────────────────────────
function AnnotatedManuscript({ body, annotations }: { body: string; annotations: Annotation[] }) {
  const segments = buildSegments(body, annotations)

  return (
    <p style={{
      fontSize: 16,
      lineHeight: 4.0,
      color: 'var(--pt)',
      margin: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {segments.map((seg, i) => {
        if (!seg.annotation) return <span key={i}>{seg.text}</span>

        const ann    = seg.annotation
        // Subtle y-variation per annotation (no rotation — keeps text inside bounds)
        const yShift = ev(i)

        // Base ink style — word-level wrapping, max 2 lines
        const inkBase: React.CSSProperties = {
          position: 'absolute',
          bottom: `calc(100% + ${3 + yShift}px)`,
          left: 0,
          fontFamily: 'var(--font-caveat, cursive)',
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.4,
          whiteSpace: 'normal',
          wordBreak: 'normal',
          overflowWrap: 'break-word',
          maxWidth: 'min(200px, 60vw)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          pointerEvents: 'none',
        }

        // ── Grammar: oval circle (wrong word circled) + fix written above ─────
        // style: 동그라미 — the classic red-pen circle
        if (ann.type === 'grammar') {
          const hasReplacement = !!ann.replacement
          return (
            <span key={i} style={{ position: 'relative', display: 'inline' }}>
              <span style={{ ...inkBase, color: PEN_RED }}>
                {hasReplacement ? ann.replacement : '—'}{' '}↓
              </span>
              {hasReplacement ? (
                <span style={{
                  border: `1.5px solid ${PEN_RED}`,
                  borderRadius: '52% 48% 47% 53% / 46% 54% 46% 54%',
                  padding: '0 3px 1px',
                  display: 'inline',
                  color: 'var(--pt)',
                }}>
                  {seg.text}
                </span>
              ) : (
                // deletion — strikethrough (취소선)
                <span style={{
                  textDecoration: 'line-through',
                  textDecorationColor: PEN_RED,
                  textDecorationThickness: '1.5px',
                  color: 'rgba(0,0,0,0.3)',
                }}>
                  {seg.text}
                </span>
              )}
            </span>
          )
        }

        // ── Expression: wavy underline + natural suggestion above ─────────────
        // style: 물결 밑줄 — "this could flow better"
        if (ann.type === 'expression') {
          return (
            <span key={i} style={{ position: 'relative' }}>
              {ann.replacement && (
                <span style={{ ...inkBase, color: PEN_PURPLE }}>
                  {ann.replacement}{' '}↓
                </span>
              )}
              <span style={{
                textDecoration: 'underline',
                textDecorationColor: PEN_PURPLE,
                textDecorationStyle: 'wavy',
                textUnderlineOffset: '4px',
                textDecorationThickness: '1.5px',
              }}>
                {seg.text}
              </span>
            </span>
          )
        }

        // ── Strength: yellow highlight + ⭐ memo above ────────────────────────
        // style: 형광펜 — the one good moment
        if (ann.type === 'strength') {
          const memo = ann.note ?? '⭐ Good.'
          return (
            <span key={i} style={{ position: 'relative' }}>
              <span style={{ ...inkBase, color: PEN_GREEN }}>
                {memo}{' '}↓
              </span>
              <mark style={{
                background: 'rgba(255, 210, 60, 0.25)',
                borderRadius: 2,
                padding: '0 2px',
                color: 'inherit',
              }}>
                {seg.text}
              </mark>
            </span>
          )
        }

        // ── Typical: dashed underline + "Typ. ↓" never wraps ─────────────────
        // style: 점선 밑줄 — "this repeats; find the rest yourself"
        if (ann.type === 'typical') {
          // Separate style: nowrap guarantees single-line label
          const typInk: React.CSSProperties = {
            position: 'absolute',
            bottom: `calc(100% + ${3 + yShift}px)`,
            left: 0,
            fontFamily: 'var(--font-caveat, cursive)',
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            color: PEN_RED,
            pointerEvents: 'none',
          }
          const label = ann.replacement ? `${ann.replacement} Typ. ↓` : 'Typ. ↓'
          return (
            <span key={i} style={{ position: 'relative', display: 'inline' }}>
              <span style={typInk}>{label}</span>
              <span style={{
                textDecoration: 'underline',
                textDecorationColor: PEN_RED,
                textDecorationStyle: 'dashed',
                textUnderlineOffset: '3px',
                textDecorationThickness: '1.5px',
                color: 'rgba(0,0,0,0.45)',
              }}>
                {seg.text}
              </span>
            </span>
          )
        }

        return <span key={i}>{seg.text}</span>
      })}
    </p>
  )
}

// ── Editor's Marks — count summary only ──────────────────────────────────────
function EditorNotes({ annotations }: { annotations: Annotation[] }) {
  if (annotations.length === 0) return null

  const grammar    = annotations.filter(a => a.type === 'grammar').length
  const expression = annotations.filter(a => a.type === 'expression').length
  const strength   = annotations.filter(a => a.type === 'strength').length
  const typical    = annotations.filter(a => a.type === 'typical').length

  return (
    <div style={{ marginTop: 28 }}>
      <p style={{
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.28em',
        color: 'var(--pm2)',
        margin: '0 0 10px',
      }}>
        EDITOR&apos;S MARKS
      </p>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {grammar > 0 && (
          <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: PEN_RED, fontWeight: 700 }}>○</span>
            Grammar · {grammar}
          </span>
        )}
        {expression > 0 && (
          <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: PEN_PURPLE, fontWeight: 700 }}>～</span>
            Expression · {expression}
          </span>
        )}
        {typical > 0 && (
          <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: PEN_RED, fontWeight: 700 }}>- -</span>
            Typical · {typical}
          </span>
        )}
        {strength > 0 && (
          <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>⭐</span>
            Strength · {strength}
          </span>
        )}
      </div>
    </div>
  )
}

// ── One Natural Revision ──────────────────────────────────────────────────────
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
      <p style={{
        fontSize: 8.5, fontWeight: 700, letterSpacing: '0.28em',
        color: 'var(--pm)', margin: '0 0 6px',
      }}>
        ONE NATURAL REVISION
      </p>
      <p style={{
        fontSize: 10, color: 'var(--pm2)', margin: '0 0 20px', lineHeight: 1.5,
      }}>
        All corrections applied — one possible natural version.
      </p>

      {/* Revised text */}
      <div style={{
        padding: '20px 20px',
        borderRadius: 14,
        background: 'var(--pd)',
      }}>
        <p style={{
          fontSize: 15, lineHeight: 2.0,
          color: 'var(--pt)', margin: 0,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {text}
        </p>
      </div>

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        style={{
          marginTop: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          width: '100%', padding: '13px 0',
          borderRadius: 12, border: '1.5px solid var(--pd)',
          background: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: 'var(--pm)',
          fontFamily: 'inherit', transition: 'color 0.15s',
        }}
      >
        {copied
          ? <><Check style={{ width: 12, height: 12 }} strokeWidth={2} /> Copied</>
          : <><Copy style={{ width: 12, height: 12 }} strokeWidth={1.8} /> Copy Revision</>
        }
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EssayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const t = useT()

  const { prefs } = usePreferences()
  const [essay, setEssay] = useState<Essay | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [rereviewing, setRereviewing] = useState(false)
  const [devMsg, setDevMsg] = useState('')

  useEffect(() => { setEssay(getEssay(id)) }, [id])

  async function handleRereview() {
    if (!essay || rereviewing) return
    setRereviewing(true)
    setDevMsg('Calling Claude…')
    try {
      const res = await fetch('/api/essays/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayId: essay.id,
          essayBody: essay.body,
          essayTitle: essay.title,
          language: prefs.language ?? 'ko',
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setDevMsg(`Error ${res.status}: ${err.error ?? 'unknown'}`)
        return
      }
      const data = await res.json()
      const updated = saveReview(essay.id, data.review)
      if (updated) setEssay(updated)
      setDevMsg('Re-review saved!')
      setTimeout(() => setDevMsg(''), 3000)
    } catch (e) {
      setDevMsg(`Failed: ${String(e)}`)
    } finally {
      setRereviewing(false)
    }
  }

  function handleResetCount() {
    resetDailyReviewCount()
    setDevMsg('Daily review count reset!')
    setTimeout(() => setDevMsg(''), 2000)
  }

  if (!essay) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--pb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--pm)', fontSize: 14 }}>Essay not found.</p>
      </div>
    )
  }

  const review = essay.review
  const challenges = review
    ? Array.isArray(review.nextChallenge)
      ? review.nextChallenge
      : [review.nextChallenge]
    : []

  function handleDelete() {
    deleteEssay(id)
    router.push('/essays')
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
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
          onClick={() => router.push('/essays')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}
        >
          <ArrowLeft style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={1.8} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--pm)' }}>
            ESSAYS
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!review && (
            <button
              type="button"
              onClick={() => router.push(`/essays/new?edit=${id}`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
              title="Edit"
            >
              <Pencil style={{ width: 14, height: 14, color: 'var(--pm)' }} strokeWidth={1.8} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
            title="Delete"
          >
            <Trash2 style={{ width: 14, height: 14, color: 'var(--pm2)' }} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* ── Article ─────────────────────────────────────────────────────── */}
      <article style={{
        maxWidth: 580,
        margin: '0 auto',
        padding: `${NAV_HEIGHT + 28}px 24px 80px`,
        boxSizing: 'border-box',
      }}>

        {/* Detected style badge */}
        {review && (
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
        )}

        {/* Essay title */}
        <h1 className="font-playfair" style={{
          fontSize: 'clamp(1.6rem, 6.5vw, 2.2rem)',
          fontWeight: 900, lineHeight: 1.2,
          color: 'var(--pt)', margin: '0 0 6px',
          letterSpacing: '-0.01em',
        }}>
          {essay.title}
        </h1>

        <p style={{ fontSize: 10, color: 'var(--pm2)', margin: '0 0 28px' }}>
          {new Date(essay.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--pd)', marginBottom: 28 }} />

        {/* ── Manuscript (annotated or plain) ─────────────────────────── */}
        {review
          ? <AnnotatedManuscript body={essay.body} annotations={review.annotations} />
          : <p style={{ fontSize: 16, lineHeight: 1.9, color: 'var(--pt)', whiteSpace: 'pre-wrap' }}>{essay.body}</p>
        }

        {/* ── Editor's Marks ───────────────────────────────────────────── */}
        {review && <EditorNotes annotations={review.annotations} />}

        {/* ── Editor's Comment ─────────────────────────────────────────── */}
        {review && (
          <div style={{ marginTop: 44, borderTop: '1px solid var(--pd)', paddingTop: 32 }}>
            <p style={{
              fontSize: 8.5, fontWeight: 700, letterSpacing: '0.28em',
              color: 'var(--pm)', margin: '0 0 14px',
            }}>
              {t('essays_editor_comment')}
            </p>
            <p className="font-playfair" style={{
              fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
              fontStyle: 'italic',
              color: 'var(--pt)',
              lineHeight: 1.75,
              margin: 0,
            }}>
              &ldquo;{review.editorComment}&rdquo;
            </p>
          </div>
        )}

        {/* ── Next Challenge ───────────────────────────────────────────── */}
        {review && challenges.length > 0 && (
          <div style={{
            marginTop: 32,
            padding: '22px 22px',
            borderRadius: 16,
            background: 'var(--pd)',
          }}>
            <p style={{
              fontSize: 8.5, fontWeight: 700, letterSpacing: '0.28em',
              color: 'var(--pa)', margin: '0 0 14px',
            }}>
              {t('essays_next_challenge')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {challenges.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 3,
                    border: '1.5px solid var(--pm2)',
                    flexShrink: 0, marginTop: 2,
                    display: 'inline-block',
                  }} />
                  <span style={{
                    fontSize: 14, lineHeight: 1.6,
                    color: 'var(--pt)',
                    fontFamily: 'inherit',
                    fontWeight: 400,
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── One Natural Revision ─────────────────────────────────────── */}
        {review?.suggestedVersion && (
          <SuggestedVersion text={review.suggestedVersion} />
        )}

        {/* No review yet */}
        {!review && (
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <p className="font-playfair" style={{
              fontSize: 14, fontStyle: 'italic',
              color: 'var(--pm)', lineHeight: 1.8,
            }}>
              {t('essays_no_review')}
            </p>
          </div>
        )}

        {/* ── DEV TOOLS (development only) ─────────────────────────────── */}
        {IS_DEV && (
          <div style={{
            marginTop: 60,
            borderTop: '1px dashed var(--pd)',
            paddingTop: 20,
          }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--pm2)', margin: '0 0 14px' }}>
              DEV TOOLS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={handleRereview}
                disabled={rereviewing}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '12px 0', borderRadius: 10,
                  border: '1.5px solid #c0392b',
                  background: 'none', cursor: rereviewing ? 'default' : 'pointer',
                  fontSize: 12, fontWeight: 700,
                  color: '#c0392b', fontFamily: 'inherit',
                  opacity: rereviewing ? 0.5 : 1,
                }}
              >
                <RefreshCw style={{ width: 12, height: 12 }} strokeWidth={2} />
                {rereviewing ? 'Reviewing…' : 'Re-review (Regenerate)'}
              </button>
              <button
                type="button"
                onClick={handleResetCount}
                style={{
                  padding: '12px 0', borderRadius: 10,
                  border: '1.5px solid var(--pd)',
                  background: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--pm)', fontFamily: 'inherit',
                }}
              >
                Reset Daily Review Count
              </button>
              {devMsg && (
                <p style={{ fontSize: 11, color: 'var(--pa)', margin: 0, textAlign: 'center' }}>
                  {devMsg}
                </p>
              )}
            </div>
          </div>
        )}

      </article>

      {/* ── Delete confirm ───────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.38)',
            zIndex: 50, display: 'flex',
            alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 0 env(safe-area-inset-bottom, 0px)',
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: 'var(--pb)',
              borderRadius: '22px 22px 0 0',
              padding: '32px 28px 36px',
              width: '100%',
              maxWidth: 540,
              boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: 'var(--pd)', margin: '0 auto 28px',
            }} />

            <p style={{
              fontSize: 17, fontWeight: 800,
              color: 'var(--pt)', margin: '0 0 10px',
              lineHeight: 1.3, letterSpacing: '-0.01em',
            }}>
              {t('essays_delete_title')}
            </p>
            <p style={{
              fontSize: 13, color: 'var(--pm)',
              margin: '0 0 32px', lineHeight: 1.65,
            }}>
              {t('essays_delete_desc')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  width: '100%', padding: '15px 0', borderRadius: 14,
                  border: 'none', background: 'var(--pa)',
                  cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  color: '#fff', fontFamily: 'inherit',
                  letterSpacing: '0.03em',
                }}
              >
                {t('essays_delete_confirm')}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  width: '100%', padding: '15px 0', borderRadius: 14,
                  border: '1.5px solid var(--pd)', background: 'none',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  color: 'var(--pm)', fontFamily: 'inherit',
                }}
              >
                {t('essays_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
