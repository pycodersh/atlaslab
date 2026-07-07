'use client'

/**
 * EssayRenderer — pure visual layer for essay annotations.
 *
 * ARCHITECTURE:
 *   DB stores only semantic data: { type, subType, fragment, replacement, note }
 *   ALL visual decisions live here. Updating this file restykes every past review.
 *
 * CONTROLLED RANDOM RENDERING:
 *   Each subType has a pool of 2-3 distinct visual styles.
 *   Style is chosen deterministically from (fragment hash + essay seed),
 *   so the same annotation always renders the same way, but varies across annotations.
 *   No two consecutive annotations ever share the same style.
 *
 * STYLE POOLS:
 *   tense / agreement / verbForm  → circle · underCorrect · strikeCorrect
 *   article                       → insertCaret · strikeReplace · bubble
 *   preposition / vocabulary      → strikeReplace · betterWord · underCorrect
 *   missing                       → insertCaret · ghostInsert · insertArrow
 *   expression (type)             → wavyUnderline · betterNote · softSuggest
 *   spelling / capitalization     → strikeCorrect · circle
 *   punctuation / wordOrder       → insertCaret · circle
 *   strength (type)               → highlight (fixed)
 *   typical (type)                → strikeCorrect (fixed)
 */

import { useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { Annotation, AnnotationSubType } from '@/lib/essays/storage'

// ── Ink palette — CSS custom properties (light/dark auto via globals.css) ─────

const INK_G_VARS  = ['var(--ann-red-1)',    'var(--ann-red-2)',    'var(--ann-red-3)']
const INK_E_VARS  = ['var(--ann-purple-1)', 'var(--ann-purple-2)']
const INK_S       = 'var(--ann-green-1)'   // strength — fixed

function pickColor(vars: string[], fragHash: number, annIdx: number, essayHash: number): string {
  if (vars.length === 1) return vars[0]
  return vars[(fragHash + annIdx * 13 + essayHash) % vars.length]
}

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

// ── Controlled random ─────────────────────────────────────────────────────────

type StyleName =
  | 'circle' | 'underCorrect' | 'strikeCorrect'
  | 'insertCaret' | 'strikeReplace' | 'bubble'
  | 'betterWord' | 'ghostInsert' | 'insertArrow'
  | 'wavyUnderline' | 'betterNote' | 'softSuggest'

const STYLE_POOLS: Record<string, StyleName[]> = {
  tense:          ['circle', 'underCorrect', 'strikeCorrect'],
  agreement:      ['circle', 'underCorrect', 'strikeCorrect'],
  verbForm:       ['circle', 'strikeCorrect', 'underCorrect'],
  article:        ['insertCaret', 'strikeReplace', 'bubble'],
  preposition:    ['strikeReplace', 'betterWord', 'underCorrect'],
  vocabulary:     ['strikeReplace', 'betterWord', 'underCorrect'],
  vocab:          ['strikeReplace', 'betterWord', 'underCorrect'],  // legacy alias
  missing:        ['insertCaret', 'ghostInsert', 'insertArrow'],
  spelling:       ['circle', 'strikeCorrect'],
  capitalization: ['strikeCorrect', 'bubble'],
  punctuation:    ['insertCaret', 'circle'],
  wordOrder:      ['circle', 'underCorrect'],
}

const EXPRESSION_POOL: StyleName[] = ['wavyUnderline', 'betterNote', 'softSuggest']

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function pickStyle(
  pool: StyleName[],
  fragHash: number,
  annIdx: number,
  essayHash: number,
  prevStyle?: StyleName,
): StyleName {
  if (pool.length === 1) return pool[0]
  // Mix annotation index, fragment hash, and essay-level seed
  const idx = (fragHash + annIdx * 7 + essayHash) % pool.length
  const candidate = pool[idx]
  // Never repeat consecutively
  if (candidate === prevStyle) return pool[(idx + 1) % pool.length]
  return candidate
}

function resolvePool(ann: Annotation): StyleName[] {
  if (ann.type === 'expression') return EXPRESSION_POOL
  if (ann.type !== 'grammar')    return ['circle']  // strength / typical handled separately
  const sub = ann.subType as AnnotationSubType | undefined
  return STYLE_POOLS[sub ?? ''] ?? ['circle']
}

// ── Shared style objects ──────────────────────────────────────────────────────

const CAVEAT: React.CSSProperties = {
  fontFamily: 'var(--font-caveat, cursive)',
  fontSize: 16,
  fontWeight: 700,
  lineHeight: 1,
}

function floatAbove(bottom: number, color: string, extra?: React.CSSProperties): React.CSSProperties {
  return {
    position: 'absolute',
    left: 0,
    bottom,
    ...CAVEAT,
    fontSize: 15,
    color,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    maxWidth: 'min(220px, 62vw)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    pointerEvents: 'none',
    ...extra,
  }
}

// ── Individual style renderers ────────────────────────────────────────────────

interface SP { text: string; ann: Annotation; yShift: number; color: string; colorFade: string; colorBg: string; colorBorder: string }

// 1. Red organic circle border + correction floating above ↓
function RenderCircle({ text, ann, yShift, color }: SP) {
  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      {ann.replacement && (
        <span style={floatAbove(3 + yShift, color)}>{ann.replacement} ↓</span>
      )}
      <span style={{
        border: `1.5px solid ${color}`,
        borderRadius: '52% 48% 47% 53% / 46% 54% 46% 54%',
        padding: '0 3px 1px',
      }}>
        {text}
      </span>
    </span>
  )
}

// 2. Wavy underline + correction floating above ↓
function RenderUnderCorrect({ text, ann, yShift, color }: SP) {
  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      {ann.replacement && (
        <span style={floatAbove(3 + yShift, color)}>{ann.replacement} ↓</span>
      )}
      <span style={{
        textDecoration: 'underline wavy',
        textDecorationColor: color,
        textUnderlineOffset: '4px',
        textDecorationThickness: '1.5px',
      }}>
        {text}
      </span>
    </span>
  )
}

// 3. Strikethrough + replacement inline (Caveat font)
function RenderStrikeCorrect({ text, ann, color, colorFade }: SP) {
  return (
    <span>
      <span style={{
        textDecoration: 'line-through',
        textDecorationColor: color,
        textDecorationThickness: '1.5px',
        color: colorFade,
      }}>
        {text}
      </span>
      {ann.replacement && (
        <span style={{ ...CAVEAT, color, marginLeft: 4 }}>
          {ann.replacement}
        </span>
      )}
    </span>
  )
}

// 4. Caret (∧) insertion marker + word above
function RenderInsertCaret({ text, ann, yShift, color }: SP) {
  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      {ann.replacement && (
        <span style={floatAbove(3 + yShift, color, { left: 'auto', right: 0 })}>
          {ann.replacement} ↓
        </span>
      )}
      <span>{text}</span>
      <span style={{ ...CAVEAT, fontSize: 15, color, letterSpacing: '-0.02em' }}>∧</span>
    </span>
  )
}

// 5. Strikethrough fragment + replacement inline (same font, not Caveat)
function RenderStrikeReplace({ text, ann, color, colorFade }: SP) {
  return (
    <span>
      <span style={{
        textDecoration: 'line-through',
        textDecorationColor: color,
        textDecorationThickness: '1.5px',
        color: colorFade,
      }}>
        {text}
      </span>
      {ann.replacement && (
        <span style={{ ...CAVEAT, color, marginLeft: 4 }}>
          {ann.replacement}
        </span>
      )}
    </span>
  )
}

// 6. Small inline bubble/pill showing the correction after the word
function RenderBubble({ text, ann, color, colorBg, colorBorder }: SP) {
  return (
    <span>
      {text}
      {ann.replacement && (
        <span style={{
          display: 'inline-block',
          background: colorBg,
          border: `1px solid ${colorBorder}`,
          borderRadius: 4,
          padding: '0 4px',
          marginLeft: 3,
          ...CAVEAT,
          fontSize: 13,
          color,
          verticalAlign: '0.1em',
          lineHeight: 1.5,
        }}>
          {ann.replacement}
        </span>
      )}
    </span>
  )
}

// 7. Wavy underline + "→ better" after word
function RenderBetterWord({ text, ann, color }: SP) {
  return (
    <span>
      <span style={{
        textDecoration: 'underline wavy',
        textDecorationColor: color,
        textUnderlineOffset: '4px',
        textDecorationThickness: '1.5px',
      }}>
        {text}
      </span>
      {ann.replacement && (
        <span style={{ ...CAVEAT, fontSize: 15, color, marginLeft: 5 }}>
          → {ann.replacement}
        </span>
      )}
    </span>
  )
}

// 8. Ghost / faded replacement shown inline after anchor word
function RenderGhostInsert({ text, ann, colorFade }: SP) {
  return (
    <span>
      {text}
      {ann.replacement && (
        <span style={{
          ...CAVEAT,
          fontSize: 15,
          color: colorFade,
          fontStyle: 'italic',
          marginLeft: 3,
        }}>
          [{ann.replacement}]
        </span>
      )}
    </span>
  )
}

// 9. Small ↑ arrow after word + replacement floating above
function RenderInsertArrow({ text, ann, yShift, color }: SP) {
  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      {ann.replacement && (
        <span style={floatAbove(3 + yShift, color, { left: 'auto', right: 0 })}>
          {ann.replacement}
        </span>
      )}
      <span>{text}</span>
      <span style={{ color, fontSize: 11, fontWeight: 700, marginLeft: 1 }}>↑</span>
    </span>
  )
}

// 10. Purple wavy underline + replacement above ↓
function RenderWavyUnderline({ text, ann, yShift, color }: SP) {
  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      {ann.replacement && (
        <span style={floatAbove(3 + yShift, color)}>{ann.replacement} ↓</span>
      )}
      <span style={{
        textDecoration: 'underline wavy',
        textDecorationColor: color,
        textUnderlineOffset: '4px',
        textDecorationThickness: '1.5px',
      }}>
        {text}
      </span>
    </span>
  )
}

// 11. Purple solid underline + "→ better" inline after word
function RenderBetterNote({ text, ann, color }: SP) {
  return (
    <span>
      <span style={{
        textDecoration: 'underline',
        textDecorationColor: color,
        textUnderlineOffset: '4px',
        textDecorationThickness: '1.5px',
      }}>
        {text}
      </span>
      {ann.replacement && (
        <span style={{ ...CAVEAT, fontSize: 15, color, marginLeft: 5 }}>
          → {ann.replacement}
        </span>
      )}
    </span>
  )
}

// 12. Purple dashed underline + replacement floating above ↓
function RenderSoftSuggest({ text, ann, yShift, color }: SP) {
  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      {ann.replacement && (
        <span style={floatAbove(3 + yShift, color)}>{ann.replacement} ↓</span>
      )}
      <span style={{
        textDecoration: 'underline dashed',
        textDecorationColor: color,
        textUnderlineOffset: '4px',
        textDecorationThickness: '1.5px',
      }}>
        {text}
      </span>
    </span>
  )
}

// ── Style dispatcher ──────────────────────────────────────────────────────────

const EV = [0, 2, -1, 3, -2, 1, -3, 2, 0, -1, 3, -2, 1, 0, -1]

function renderAnnotation(
  text: string,
  ann: Annotation,
  style: StyleName,
  segIdx: number,
  fragHash: number,
  annIdx: number,
  essayHash: number,
): React.ReactNode {
  const yShift = EV[segIdx % EV.length]
  const isExpr = ann.type === 'expression'
  const color = isExpr
    ? pickColor(INK_E_VARS, fragHash, annIdx, essayHash)
    : pickColor(INK_G_VARS, fragHash, annIdx, essayHash)
  const colorFade   = isExpr ? 'var(--ann-purple-fade)' : 'var(--ann-red-fade)'
  const colorBg     = isExpr ? 'var(--ann-purple-bg)'   : 'var(--ann-red-bg)'
  const colorBorder = isExpr ? 'var(--ann-purple-border)' : 'var(--ann-red-border)'
  const sp: SP = { text, ann, yShift, color, colorFade, colorBg, colorBorder }

  // ── Strength — always yellow highlight ────────────────────────────────────
  if (ann.type === 'strength') {
    return (
      <span style={{ position: 'relative', display: 'inline' }}>
        <span style={floatAbove(3 + yShift, INK_S)}>{ann.note ?? '⭐'} ↓</span>
        <mark style={{ background: 'rgba(255,210,60,0.25)', borderRadius: 2, padding: '0 2px', color: 'inherit' }}>
          {text}
        </mark>
      </span>
    )
  }

  // ── Typical — always strikethrough + replacement ──────────────────────────
  if (ann.type === 'typical') {
    const typicalColor = pickColor(INK_G_VARS, fragHash, annIdx, essayHash)
    return (
      <span>
        <span style={{ textDecoration: 'line-through', textDecorationColor: typicalColor, textDecorationThickness: '1.5px', color: 'var(--ann-red-fade)' }}>
          {text}
        </span>
        {ann.replacement && (
          <span style={{ ...CAVEAT, color: typicalColor, marginLeft: 4 }}>{ann.replacement}</span>
        )}
      </span>
    )
  }

  switch (style) {
    case 'circle':        return <RenderCircle        {...sp} />
    case 'underCorrect':  return <RenderUnderCorrect  {...sp} />
    case 'strikeCorrect': return <RenderStrikeCorrect {...sp} />
    case 'insertCaret':   return <RenderInsertCaret   {...sp} />
    case 'strikeReplace': return <RenderStrikeReplace {...sp} />
    case 'bubble':        return <RenderBubble        {...sp} />
    case 'betterWord':    return <RenderBetterWord    {...sp} />
    case 'ghostInsert':   return <RenderGhostInsert   {...sp} />
    case 'insertArrow':   return <RenderInsertArrow   {...sp} />
    case 'wavyUnderline': return <RenderWavyUnderline {...sp} />
    case 'betterNote':    return <RenderBetterNote    {...sp} />
    case 'softSuggest':   return <RenderSoftSuggest   {...sp} />
    default:              return <RenderCircle        {...sp} />
  }
}

// ── Annotated manuscript ──────────────────────────────────────────────────────

export function AnnotatedManuscript({
  body,
  annotations,
  essayId = '',
}: {
  body: string
  annotations: Annotation[]
  essayId?: string
}) {
  const segments = buildSegments(body, annotations)
  const essayHash = hashStr(essayId || body.slice(0, 20))

  let prevStyle: StyleName | undefined
  let annIdx = 0

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
        const ann = seg.annotation

        const fragHash = hashStr(ann.fragment)

        // strength / typical — fixed style, no pool
        if (ann.type === 'strength' || ann.type === 'typical') {
          const node = renderAnnotation(seg.text, ann, 'circle', i, fragHash, annIdx, essayHash)
          annIdx++
          return <span key={i}>{node}</span>
        }

        const pool = resolvePool(ann)
        const style = pickStyle(pool, fragHash, annIdx, essayHash, prevStyle)
        prevStyle = style
        const node = renderAnnotation(seg.text, ann, style, i, fragHash, annIdx, essayHash)
        annIdx++

        return <span key={i}>{node}</span>
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
      <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', color: 'var(--pm2)', margin: '0 0 10px' }}>
        EDITOR&apos;S MARKS
      </p>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {grammar    > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: 'var(--ann-red-1)', fontWeight: 700 }}>○</span>Grammar · {grammar}</span>}
        {expression > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: 'var(--ann-purple-1)', fontWeight: 700 }}>～</span>Expression · {expression}</span>}
        {typical    > 0 && <span style={{ fontSize: 12, color: 'var(--pm)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: 'var(--ann-red-1)', fontWeight: 700 }}>- -</span>Typical · {typical}</span>}
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
      <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.28em', color: 'var(--pm)', margin: '0 0 6px' }}>
        ONE NATURAL REVISION
      </p>
      <p style={{ fontSize: 10, color: 'var(--pm2)', margin: '0 0 20px', lineHeight: 1.5 }}>
        All corrections applied — one possible natural version.
      </p>
      <div style={{ padding: '20px', borderRadius: 14, background: 'var(--pd)' }}>
        <p style={{ fontSize: 15, lineHeight: 2.0, color: 'var(--pt)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          marginTop: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          width: '100%', padding: '13px 0', borderRadius: 12,
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
