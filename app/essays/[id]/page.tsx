'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { NAV_HEIGHT } from '@/components/TopNav'
import { type Essay, type Annotation, getEssay, deleteEssay } from '@/lib/essays/storage'
import { useT } from '@/hooks/useT'

// ── Annotation visual config ──────────────────────────────────────────────────
const ANN = {
  grammar: {
    icon:        '✗',
    inkColor:    '#c0392b',
    inkBg:       'rgba(192,57,43,0.06)',
    underline:   '2px solid #e74c3c',
    decoration:  'line-through' as const,
    decorColor:  '#e74c3c',
  },
  expression: {
    icon:        '✦',
    inkColor:    '#7d3c98',
    inkBg:       'rgba(125,60,152,0.06)',
    underline:   '1.5px solid #7d3c98',
    decoration:  'none' as const,
    decorColor:  '#7d3c98',
  },
  strength: {
    icon:        '⭐',
    inkColor:    '#1e8449',
    inkBg:       'rgba(30,132,73,0.06)',
    underline:   'none',
    decoration:  'none' as const,
    decorColor:  'transparent',
  },
}

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
      // Extra line-height creates the "between-lines" space for above-line corrections
      lineHeight: 3.2,
      color: 'var(--pt)',
      margin: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {segments.map((seg, i) => {
        if (!seg.annotation) return <span key={i}>{seg.text}</span>

        const ann = seg.annotation

        if (ann.type === 'grammar') {
          return (
            // position: relative on inline allows the absolute replacement to anchor here
            <span key={i} style={{ position: 'relative' }}>
              {/* Correction written above the line — like red pen on paper */}
              {ann.replacement && (
                <span style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  fontFamily: 'var(--font-caveat, cursive)',
                  color: '#c0392b',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  letterSpacing: '0.01em',
                }}>
                  {ann.replacement}
                </span>
              )}
              {/* Original word — struck through in red */}
              <span style={{
                textDecoration: 'line-through',
                textDecorationColor: '#e74c3c',
                color: 'rgba(0,0,0,0.28)',
              }}>
                {seg.text}
              </span>
            </span>
          )
        }

        if (ann.type === 'expression') {
          return (
            <span key={i} style={{ position: 'relative' }}>
              {/* Suggestion written above — curved arrow feel via ✦ prefix */}
              {ann.replacement && (
                <span style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  fontFamily: 'var(--font-caveat, cursive)',
                  color: '#7d3c98',
                  fontSize: 12,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  opacity: 0.9,
                }}>
                  ✦ {ann.replacement}
                </span>
              )}
              {/* Original phrase — purple underline */}
              <span style={{
                borderBottom: '1.5px solid #7d3c98',
                paddingBottom: 1,
              }}>
                {seg.text}
              </span>
            </span>
          )
        }

        if (ann.type === 'strength') {
          return (
            // Warm highlight — no above-line text, just a ⭐ after
            <span key={i}>
              <span style={{
                background: 'rgba(255, 200, 60, 0.2)',
                borderRadius: 3,
                padding: '1px 3px',
              }}>
                {seg.text}
              </span>
              <span style={{
                fontFamily: 'var(--font-caveat, cursive)',
                color: '#1e8449',
                fontSize: 14,
                marginLeft: 3,
              }}>
                ⭐
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
            <span style={{ color: '#c0392b', fontWeight: 700 }}>✗</span>
            Grammar · {grammar}
          </span>
        )}
        {expression > 0 && (
          <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: '#7d3c98', fontWeight: 700 }}>✦</span>
            Expression · {expression}
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EssayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const t = useT()

  const [essay, setEssay] = useState<Essay | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => { setEssay(getEssay(id)) }, [id])

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
              fontSize: 'clamp(1rem, 3.8vw, 1.15rem)',
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
                    fontFamily: 'var(--font-caveat, cursive)',
                    fontWeight: 500,
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
