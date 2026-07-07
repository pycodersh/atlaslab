'use client'

/**
 * EssayRenderer — pure rendering layer for essay review annotations.
 *
 * ARCHITECTURE RULE:
 *   DB stores only semantic data: { type, fragment, replacement, note }
 *   ALL visual decisions (colors, underlines, circles, ink style) live HERE.
 *
 *   Updating this file is the only thing needed to restyle every past review.
 *   Never store CSS, colors, or layout in the DB.
 */

import { useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { Annotation } from '@/lib/essays/storage'

// ── Ink palette ───────────────────────────────────────────────────────────────
// Change these to restyle every annotation across all past essays instantly.

const INK_GRAMMAR    = '#8B1A1A'   // red pen — grammar errors
const INK_EXPRESSION = '#6C2D82'   // purple pen — expression suggestions
const INK_STRENGTH   = '#1a7a3a'   // green pen — strength highlights
const INK_TYPICAL    = '#8B1A1A'   // red pen (same as grammar) — recurring errors

// ── Jitter table — slight vertical offsets for handwritten feel ───────────────
const EV_LUT = [0, 2, -1, 3, -2, 1, -3, 2, 0, -1, 3, -2, 1, 0, -1]
function ev(i: number): number { return EV_LUT[i % EV_LUT.length] }

// ── Segment builder ───────────────────────────────────────────────────────────
type Segment = { text: string; annotation?: Annotation }

export function buildSegments(body: string, annotations: Annotation[]): Segment[] {
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

// ── Annotated manuscript ──────────────────────────────────────────────────────

export function AnnotatedManuscript({
  body,
  annotations,
}: {
  body: string
  annotations: Annotation[]
}) {
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
              <span style={{ ...above, color: INK_GRAMMAR }}>{ann.replacement ?? '—'}{' '}↓</span>
              {ann.replacement
                ? <span style={{ border: `1.5px solid ${INK_GRAMMAR}`, borderRadius: '52% 48% 47% 53% / 46% 54% 46% 54%', padding: '0 3px 1px' }}>{seg.text}</span>
                : <span style={{ textDecoration: 'line-through', textDecorationColor: INK_GRAMMAR, textDecorationThickness: '1.5px', color: 'rgba(0,0,0,0.3)' }}>{seg.text}</span>
              }
            </span>
          )
        }

        if (ann.type === 'expression') {
          return (
            <span key={i} style={{ position: 'relative' }}>
              {ann.replacement && <span style={{ ...above, color: INK_EXPRESSION }}>{ann.replacement}{' '}↓</span>}
              <span style={{ textDecoration: 'underline', textDecorationColor: INK_EXPRESSION, textDecorationStyle: 'wavy', textUnderlineOffset: '4px', textDecorationThickness: '1.5px' }}>{seg.text}</span>
            </span>
          )
        }

        if (ann.type === 'strength') {
          return (
            <span key={i} style={{ position: 'relative' }}>
              <span style={{ ...above, color: INK_STRENGTH }}>{ann.note ?? '⭐ Good.'}{' '}↓</span>
              <mark style={{ background: 'rgba(255,210,60,0.25)', borderRadius: 2, padding: '0 2px', color: 'inherit' }}>{seg.text}</mark>
            </span>
          )
        }

        if (ann.type === 'typical') {
          const typInk: React.CSSProperties = {
            position: 'absolute', bottom: `calc(100% + ${3 + yShift}px)`, left: 0,
            fontFamily: 'var(--font-caveat, cursive)', fontSize: 14, fontWeight: 700,
            lineHeight: 1.4, whiteSpace: 'nowrap', color: INK_TYPICAL, pointerEvents: 'none',
          }
          return (
            <span key={i} style={{ position: 'relative', display: 'inline' }}>
              <span style={typInk}>{ann.replacement ? `${ann.replacement} Typ. ↓` : 'Typ. ↓'}</span>
              <span style={{ textDecoration: 'underline', textDecorationColor: INK_TYPICAL, textDecorationStyle: 'dashed', textUnderlineOffset: '3px', textDecorationThickness: '1.5px', color: 'rgba(0,0,0,0.45)' }}>{seg.text}</span>
            </span>
          )
        }

        return <span key={i}>{seg.text}</span>
      })}
    </p>
  )
}

// ── Editor marks legend ───────────────────────────────────────────────────────

export function EditorNotes({ annotations }: { annotations: Annotation[] }) {
  if (annotations.length === 0) return null
  const grammar    = annotations.filter(a => a.type === 'grammar').length
  const expression = annotations.filter(a => a.type === 'expression').length
  const strength   = annotations.filter(a => a.type === 'strength').length
  const typical    = annotations.filter(a => a.type === 'typical').length
  return (
    <div style={{ marginTop: 28 }}>
      <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', color: 'var(--pm2)', margin: '0 0 10px' }}>EDITOR&apos;S MARKS</p>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {grammar    > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: INK_GRAMMAR,    fontWeight: 700 }}>○</span>Grammar · {grammar}</span>}
        {expression > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: INK_EXPRESSION, fontWeight: 700 }}>～</span>Expression · {expression}</span>}
        {typical    > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: INK_TYPICAL,    fontWeight: 700 }}>- -</span>Typical · {typical}</span>}
        {strength   > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span>⭐</span>Strength · {strength}</span>}
      </div>
    </div>
  )
}

// ── Suggested version ─────────────────────────────────────────────────────────

export function SuggestedVersion({ text }: { text: string }) {
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
      <button
        type="button"
        onClick={handleCopy}
        style={{
          marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, width: '100%', padding: '13px 0', borderRadius: 12,
          border: '1.5px solid var(--pd)', background: 'none',
          cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--pm)', fontFamily: 'inherit',
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
