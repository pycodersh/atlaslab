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
      lineHeight: 2.1,
      color: 'var(--pt)',
      margin: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {segments.map((seg, i) => {
        if (!seg.annotation) return <span key={i}>{seg.text}</span>

        const ann = seg.annotation
        const cfg = ANN[ann.type] ?? ANN.grammar

        if (ann.type === 'grammar') {
          return (
            <span key={i} style={{ display: 'inline' }}>
              {/* Crossed-out original */}
              <span style={{
                textDecoration: `line-through`,
                textDecorationColor: cfg.decorColor,
                color: 'rgba(0,0,0,0.28)',
              }}>
                {seg.text}
              </span>
              {/* Red-pen replacement inline */}
              {ann.replacement && (
                <span style={{
                  fontFamily: 'var(--font-caveat, cursive)',
                  color: cfg.inkColor,
                  fontSize: 15,
                  fontWeight: 600,
                  marginLeft: 5,
                  paddingBottom: 1,
                  borderBottom: cfg.underline,
                  letterSpacing: '0.01em',
                }}>
                  {ann.replacement}
                </span>
              )}
            </span>
          )
        }

        if (ann.type === 'expression') {
          return (
            <span key={i} style={{ display: 'inline' }}>
              {/* Underlined original */}
              <span style={{ borderBottom: cfg.underline, paddingBottom: 1 }}>
                {seg.text}
              </span>
              {/* Purple suggestion inline */}
              {ann.replacement && (
                <span style={{
                  fontFamily: 'var(--font-caveat, cursive)',
                  color: cfg.inkColor,
                  fontSize: 14,
                  marginLeft: 5,
                  opacity: 0.9,
                }}>
                  ✦ {ann.replacement}
                </span>
              )}
            </span>
          )
        }

        if (ann.type === 'strength') {
          return (
            <span key={i} style={{
              background: 'rgba(255, 210, 80, 0.22)',
              borderRadius: 3,
              padding: '1px 2px',
            }}>
              {seg.text}
            </span>
          )
        }

        return <span key={i}>{seg.text}</span>
      })}
    </p>
  )
}

// ── Editor's Notes (handwritten style) ───────────────────────────────────────
function EditorNotes({ annotations }: { annotations: Annotation[] }) {
  if (annotations.length === 0) return null

  return (
    <div style={{ marginTop: 36 }}>
      {/* Section label */}
      <p style={{
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.28em',
        color: 'var(--pm2)',
        margin: '0 0 14px',
      }}>
        EDITOR&apos;S MARKS
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {annotations.map((ann, i) => {
          const cfg = ANN[ann.type] ?? ANN.grammar
          return (
            <div key={i} style={{
              display: 'flex',
              gap: 14,
              padding: '13px 0',
              borderBottom: i < annotations.length - 1 ? '1px solid var(--pd)' : 'none',
            }}>
              {/* Icon */}
              <span style={{
                fontSize: ann.type === 'strength' ? 16 : 14,
                color: cfg.inkColor,
                flexShrink: 0,
                width: 20,
                paddingTop: 2,
              }}>
                {cfg.icon}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Original text */}
                <p style={{
                  margin: '0 0 3px',
                  fontSize: 12,
                  color: 'var(--pm2)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  &ldquo;{ann.fragment}&rdquo;
                </p>

                {/* Replacement */}
                {ann.replacement && (
                  <p style={{
                    margin: '0 0 3px',
                    fontFamily: 'var(--font-caveat, cursive)',
                    fontSize: 17,
                    fontWeight: 600,
                    color: cfg.inkColor,
                    lineHeight: 1.3,
                    letterSpacing: '0.01em',
                  }}>
                    → {ann.replacement}
                  </p>
                )}

                {/* Note */}
                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-caveat, cursive)',
                  fontSize: 14,
                  color: cfg.inkColor,
                  opacity: ann.type === 'strength' ? 1 : 0.78,
                  lineHeight: 1.45,
                }}>
                  {ann.note}
                </p>
              </div>
            </div>
          )
        })}
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
            background: 'rgba(0,0,0,0.45)',
            zIndex: 50, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '0 32px',
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: 'var(--pb)', borderRadius: 20,
              padding: '28px 24px', width: '100%', maxWidth: 320,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--pt)', margin: '0 0 10px' }}>
              {t('essays_delete')}?
            </p>
            <p style={{ fontSize: 13, color: 'var(--pm)', margin: '0 0 24px', lineHeight: 1.6 }}>
              This essay and its review will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12,
                  border: '1px solid var(--pd)', background: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  color: 'var(--pm)', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12,
                  border: 'none', background: '#c0392b',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  color: '#fff', fontFamily: 'inherit',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
