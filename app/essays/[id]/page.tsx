'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { NAV_HEIGHT } from '@/components/TopNav'
import { type Essay, type Annotation, getEssay, deleteEssay } from '@/lib/essays/storage'
import { useT } from '@/hooks/useT'

// ── Annotation colors ─────────────────────────────────────────────────────────
const ANNOTATION_STYLE: Record<Annotation['type'], {
  highlight: string
  noteColor: string
  marker: string
}> = {
  grammar:    { highlight: 'rgba(220, 53, 69, 0.12)',  noteColor: '#c0392b', marker: '→' },
  expression: { highlight: 'rgba(108, 99, 255, 0.12)', noteColor: '#6c63ff', marker: '✦' },
  praise:     { highlight: 'rgba(39, 174, 96, 0.14)',  noteColor: '#219653', marker: '' },
}

// ── Build annotated segments ──────────────────────────────────────────────────
type Segment = {
  text: string
  annotation?: Annotation
}

function buildSegments(body: string, annotations: Annotation[]): Segment[] {
  // Sort by first occurrence in body
  const positioned = annotations
    .map(a => ({ annotation: a, index: body.indexOf(a.fragment) }))
    .filter(p => p.index >= 0)
    .sort((a, b) => a.index - b.index)

  const segments: Segment[] = []
  let cursor = 0

  for (const { annotation, index } of positioned) {
    if (index < cursor) continue  // overlapping — skip
    if (index > cursor) {
      segments.push({ text: body.slice(cursor, index) })
    }
    segments.push({ text: annotation.fragment, annotation })
    cursor = index + annotation.fragment.length
  }
  if (cursor < body.length) {
    segments.push({ text: body.slice(cursor) })
  }
  return segments
}

// ── Annotated essay body ──────────────────────────────────────────────────────
function AnnotatedBody({ body, annotations }: { body: string; annotations: Annotation[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const segments = buildSegments(body, annotations)

  // Map annotation index in segments
  const annotatedSegments = segments.filter(s => s.annotation)

  return (
    <div>
      <p style={{
        fontSize: 16,
        lineHeight: 1.9,
        color: 'var(--pt)',
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {segments.map((seg, i) => {
          if (!seg.annotation) {
            return <span key={i}>{seg.text}</span>
          }

          const ann = seg.annotation
          const style = ANNOTATION_STYLE[ann.type]
          const annIdx = annotatedSegments.indexOf(seg)
          const isActive = activeIdx === annIdx

          return (
            <span key={i} style={{ position: 'relative', display: 'inline' }}>
              <span
                onClick={() => setActiveIdx(isActive ? null : annIdx)}
                style={{
                  background: style.highlight,
                  borderBottom: ann.type === 'grammar' ? `1.5px solid ${style.noteColor}` : 'none',
                  borderRadius: 3,
                  padding: '1px 1px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {seg.text}
              </span>
              {/* Inline margin note */}
              {isActive && (
                <span style={{
                  display: 'inline-block',
                  marginLeft: 6,
                  padding: '3px 10px',
                  borderRadius: 12,
                  background: 'var(--pb)',
                  border: `1px solid ${style.noteColor}`,
                  fontSize: 11.5,
                  color: style.noteColor,
                  fontFamily: 'var(--font-caveat, cursive)',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  verticalAlign: 'middle',
                  whiteSpace: 'normal',
                  maxWidth: 200,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  position: 'relative',
                  zIndex: 10,
                }}>
                  {style.marker && `${style.marker} `}
                  {ann.note}
                  {ann.replacement && (
                    <span style={{ display: 'block', marginTop: 3, fontStyle: 'italic', opacity: 0.85 }}>
                      → {ann.replacement}
                    </span>
                  )}
                </span>
              )}
            </span>
          )
        })}
      </p>

      {/* Annotation legend */}
      {annotations.length > 0 && (
        <p style={{
          fontSize: 10,
          color: 'var(--pm2)',
          marginTop: 20,
          fontStyle: 'italic',
          fontFamily: 'var(--font-caveat, cursive)',
        }}>
          Tap highlighted text to read the editor&apos;s note.
        </p>
      )}
    </div>
  )
}

// ── Annotation summary cards ──────────────────────────────────────────────────
function AnnotationCards({ annotations }: { annotations: Annotation[] }) {
  if (annotations.length === 0) return null

  const grammar = annotations.filter(a => a.type === 'grammar')
  const expression = annotations.filter(a => a.type === 'expression')
  const praise = annotations.filter(a => a.type === 'praise')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
      {[
        { list: praise,     color: '#219653', bg: 'rgba(39,174,96,0.08)',  label: 'Well Done' },
        { list: grammar,    color: '#c0392b', bg: 'rgba(220,53,69,0.07)',  label: 'Grammar'   },
        { list: expression, color: '#6c63ff', bg: 'rgba(108,99,255,0.08)', label: 'Expression' },
      ].map(({ list, color, bg, label }) =>
        list.length > 0 && list.map((a, i) => (
          <div
            key={`${label}-${i}`}
            style={{
              padding: '13px 16px',
              borderRadius: 12,
              background: bg,
              borderLeft: `3px solid ${color}`,
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color, textTransform: 'uppercase' }}>
              {label}
            </p>
            <p style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--pt)',
              lineHeight: 1.6,
              fontFamily: 'var(--font-caveat, cursive)',
              fontWeight: 500,
            }}>
              {a.note}
            </p>
            {a.replacement && (
              <p style={{ margin: '5px 0 0', fontSize: 12, color, fontStyle: 'italic' }}>
                → {a.replacement}
              </p>
            )}
          </div>
        ))
      )}
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

  useEffect(() => {
    setEssay(getEssay(id))
  }, [id])

  if (!essay) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--pb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--pm)', fontSize: 14 }}>Essay not found.</p>
      </div>
    )
  }

  const review = essay.review

  function handleDelete() {
    deleteEssay(id)
    router.push('/essays')
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
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
            <span style={{
              fontSize: 8.5,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'var(--pm)',
            }}>
              {t('essays_detected_style')}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--pa)',
              background: 'var(--pal)',
              padding: '3px 10px',
              borderRadius: 20,
              letterSpacing: '0.04em',
            }}>
              {review.detectedStyle}
            </span>
          </div>
        )}

        {/* Essay title */}
        <h1 className="font-playfair" style={{
          fontSize: 'clamp(1.6rem, 6.5vw, 2.2rem)',
          fontWeight: 900,
          lineHeight: 1.2,
          color: 'var(--pt)',
          margin: '0 0 6px',
          letterSpacing: '-0.01em',
        }}>
          {essay.title}
        </h1>

        <p style={{ fontSize: 10, color: 'var(--pm2)', margin: '0 0 28px' }}>
          {new Date(essay.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--pd)', marginBottom: 28 }} />

        {/* Essay body with annotations */}
        {review ? (
          <AnnotatedBody body={essay.body} annotations={review.annotations} />
        ) : (
          <p style={{ fontSize: 16, lineHeight: 1.9, color: 'var(--pt)', whiteSpace: 'pre-wrap' }}>
            {essay.body}
          </p>
        )}

        {/* Annotation summary cards */}
        {review && <AnnotationCards annotations={review.annotations} />}

        {/* ── Editor's Comment ──────────────────────────────────────────── */}
        {review && (
          <div style={{ marginTop: 44, borderTop: '1px solid var(--pd)', paddingTop: 32 }}>
            <p style={{
              fontSize: 8.5,
              fontWeight: 700,
              letterSpacing: '0.28em',
              color: 'var(--pm)',
              margin: '0 0 14px',
            }}>
              {t('essays_editor_comment')}
            </p>
            <p className="font-playfair" style={{
              fontSize: 'clamp(1.05rem, 4vw, 1.25rem)',
              fontStyle: 'italic',
              color: 'var(--pt)',
              lineHeight: 1.65,
              margin: 0,
              fontFamily: 'var(--font-caveat, cursive)',
              fontWeight: 600,
            }}>
              &ldquo;{review.editorComment}&rdquo;
            </p>
          </div>
        )}

        {/* ── Next Challenge ─────────────────────────────────────────────── */}
        {review && review.nextChallenge && (
          <div style={{
            marginTop: 32,
            padding: '22px 22px',
            borderRadius: 16,
            background: 'var(--pd)',
          }}>
            <p style={{
              fontSize: 8.5,
              fontWeight: 700,
              letterSpacing: '0.28em',
              color: 'var(--pa)',
              margin: '0 0 10px',
            }}>
              {t('essays_next_challenge')}
            </p>
            <p style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--pt)',
              margin: 0,
              fontFamily: 'var(--font-caveat, cursive)',
              fontWeight: 600,
            }}>
              {review.nextChallenge}
            </p>
          </div>
        )}

        {/* No review yet — prompt to review */}
        {!review && (
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--pm)', fontStyle: 'italic', marginBottom: 16 }}>
              {t('essays_no_review')}
            </p>
          </div>
        )}

      </article>

      {/* ── Delete confirm dialog ─────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: 'var(--pb)',
              borderRadius: 20,
              padding: '28px 24px',
              width: '100%',
              maxWidth: 320,
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
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  border: '1px solid var(--pd)',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--pm)',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: '#c0392b',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: 'inherit',
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
