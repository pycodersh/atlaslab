/**
 * 에디토리얼 브리핑 공용 틀 — 밝은 지면(#F8F7F4) · 세리프 헤드라인 · 잉크 펜화 황소·곰 워터마크 · 형광펜 밑줄 자막
 *
 * 쓰는 곳  remotion/ProAnalyst/ProAnalystLight.tsx, remotion/Ipo/IpoLiquidityShock.tsx
 * 데이터    lines.json = 씬[] (scene, title, amber[], crimson[], board, sentences[{text, say}])
 *           audio.generated.json = 문장 클립[] (scripts/bullbear/generate-voice.py 가 만든다, 씬 → 문장 순)
 * 타이밍    문장 사이 PAUSE(0.35초), 씬 사이 SCENE_GAP 더, 씬 전환은 페이드 스루 + 미세 상하 모션
 */
import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { AbsoluteFill, Audio, Easing, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from 'remotion'

export type Sentence = { text: string; say?: string }
export type EditorialScene = { scene: string; title: string; amber: string[]; crimson: string[]; board: string; sentences: Sentence[] }
export type Clip = { file: string; total: number; start: number; end: number }
export type Tick = { k: string; v: string; up: boolean }
export type BoardProps = { kind: string; f: number; len: number }

export const FPS = 30
const INTRO = 24
const PAUSE = Math.round(0.35 * FPS) // 문장 사이 정적
const SCENE_GAP = 14
const OUTRO = 110
const FADE_IN = 18
const FADE_OUT = 14

export const C = {
  paper: '#F8F7F4',
  card: '#FFFFFF',
  rule: '#E5E7EB',
  ink: '#111827',
  body: '#374151',
  mute: '#6B7280',
  faint: '#9CA3AF',
  crimson: '#B91C1C',
  amber: '#D97706',
  green: '#15803D',
}
export const SANS = "Pretendard, 'Noto Sans KR', 'Malgun Gothic', sans-serif"
export const SERIF = "'Noto Serif KR', 'Nanum Myeongjo', serif"

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const soft = Easing.bezier(0.22, 1, 0.36, 1)
export const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: soft })
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

type Said = { text: string; clip: Clip; voiceAt: number; dur: number }

export function editorialLayout(scenesData: EditorialScene[], clips: Clip[]) {
  let at = INTRO
  let k = 0
  const scenes = scenesData.map((sc, i) => {
    if (i > 0) at += SCENE_GAP
    const said: Said[] = sc.sentences.map(s => {
      const clip = clips[k++]
      const dur = Math.ceil((clip.end - clip.start) * FPS) + 2
      const x = { text: s.text, clip, voiceAt: at, dur }
      at += dur + PAUSE
      return x
    })
    return { data: sc, said, from: i === 0 ? 0 : said[0].voiceAt - 12 }
  })
  const outroAt = at + 4
  return { scenes, outroAt, total: outroAt + OUTRO }
}

export const editorialConfig = (scenesData: EditorialScene[], clips: Clip[]) => ({
  width: 1080, height: 1920, fps: FPS, durationInFrames: editorialLayout(scenesData, clips).total,
})

const FONT_LINKS = [
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@600;700;900&display=swap',
]
/** sample = 화면에 실제로 나오는 글자 — Noto Serif KR 의 unicode-range 조각을 미리 받게 한다 */
function useEditorialFonts(sample: string) {
  const [handle] = useState(() => delayRender('editorial fonts'))
  useEffect(() => {
    let done = false
    const finish = () => { if (!done) { done = true; continueRender(handle) } }
    const sheets = FONT_LINKS.map(href => {
      let link = document.querySelector<HTMLLinkElement>(`link[href="${href}"]`)
      if (!link) {
        link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = href
        document.head.appendChild(link)
      }
      const l = link
      return l.sheet ? Promise.resolve() : new Promise<void>(r => { l.addEventListener('load', () => r()); l.addEventListener('error', () => r()) })
    })
    const s = sample + '0123456789,.%+−→$'
    Promise.all(sheets)
      .then(() => Promise.all([
        document.fonts.load('800 54px Pretendard', s),
        document.fonts.load('600 30px Pretendard', s),
        document.fonts.load('900 76px "Noto Serif KR"', s),
        document.fonts.load('700 40px "Noto Serif KR"', s),
      ]))
      .then(finish, finish)
    const t = setTimeout(finish, 8000)
    return () => clearTimeout(t)
  }, [handle, sample])
}

// ───────────────────────── 지면 · 워터마크 ─────────────────────────

/** 잉크 펜화 황소(옆모습, 오른쪽을 본다, 400×300) */
const BULL = [
  'M40,190 C60,140 110,110 170,108 C230,106 280,120 320,150 C345,168 360,190 362,214',
  'M362,214 C364,236 350,252 330,256 L300,258', 'M170,108 C150,80 120,62 84,58 C70,57 62,64 70,72 C90,90 118,96 140,112',
  'M300,150 C318,118 346,100 378,98', 'M318,140 C330,128 342,124 354,124',
  'M40,190 C30,230 40,262 62,280', 'M120,262 L118,300', 'M160,268 L160,300', 'M262,262 L262,300', 'M300,258 L302,300',
  'M62,280 C90,268 120,262 160,268 C200,274 240,272 262,262', 'M330,190 C334,196 334,202 330,206', 'M58,200 C48,214 44,232 46,250',
]
/** 잉크 펜화 곰(옆모습, 왼쪽을 본다, 400×300) */
const BEAR = [
  'M360,200 C350,150 310,118 250,112 C190,106 120,118 82,150 C60,170 52,190 50,206',
  'M50,206 C44,214 30,222 22,232 C16,240 20,250 30,250 C44,250 58,246 70,240', 'M70,240 C80,262 84,282 84,300',
  'M96,150 C92,136 98,124 110,122 C122,120 128,132 124,144', 'M44,222 C40,226 40,230 44,232',
  'M124,246 L124,300', 'M260,250 L262,300', 'M318,244 L322,300', 'M360,200 C366,222 360,242 346,252',
  'M84,300 C110,290 140,284 170,284 C210,284 240,270 262,252', 'M346,252 C330,258 314,256 300,250', 'M78,196 C82,192 88,192 90,196',
]

function Ink({ paths }: { paths: string[] }) {
  return (
    <g fill="none" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" filter="url(#ink)">
      {paths.map((d, i) => <path key={i} d={d} />)}
      {paths.map((d, i) => <path key={`b${i}`} d={d} transform="translate(1.4 0.8)" strokeWidth={0.8} opacity={0.6} />)}
    </g>
  )
}

function Paper() {
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
        </defs>
        <g opacity={0.06}>
          <g transform="translate(20 760) scale(1.3)"><Ink paths={BULL} /></g>
          <g transform="translate(540 760) scale(1.3)"><Ink paths={BEAR} /></g>
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// ───────────────────────── 머리 · 시세 띠 ─────────────────────────

function Masthead({ frame, ticks, tickW, right }: { frame: number; ticks: Tick[]; tickW: number; right: string }) {
  const p = ease(frame, 0, 24)
  const span = tickW * ticks.length
  const off = -((frame * 1.6) % span)
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: p, transform: `translateY(${(1 - p) * -12}px)` }}>
      <div style={{ height: 118, display: 'flex', alignItems: 'flex-end', padding: '0 60px 18px' }}>
        <div style={{ width: 20, height: 20, background: C.crimson, marginRight: 16, marginBottom: 9 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 40, color: C.ink, letterSpacing: 3 }}>MACRO BRIEFING</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: C.mute, marginBottom: 6 }}>{right}</div>
      </div>
      <div style={{ height: 2, background: C.ink, margin: '0 60px' }} />
      <div style={{ height: 1, background: C.ink, margin: '3px 60px 0' }} />
      <div style={{ height: 60, margin: '0 60px', borderBottom: `1px solid ${C.rule}`, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: off, top: 0, height: 60, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          {[0, 1, 2].map(r => ticks.map(t => (
            <div key={`${r}${t.k}`} style={{ width: tickW, flexShrink: 0, display: 'flex', alignItems: 'center', fontFamily: SANS, fontSize: 26 }}>
              <span style={{ fontWeight: 700, color: C.ink, letterSpacing: 1 }}>{t.k}</span>
              <span style={{ marginLeft: 12, fontWeight: 600, color: t.up ? C.green : C.crimson }}>{t.v}</span>
              <span style={{ flex: 1 }} />
              <span style={{ width: 1, height: 22, background: C.rule, marginRight: 24 }} />
            </div>
          )))}
        </div>
      </div>
    </div>
  )
}

// ───────────────────────── 카드 · 라벨 ─────────────────────────

export const CARD_W = 960
export const CARD_H = 900

function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', left: 60, top: 470, width: CARD_W, height: CARD_H, background: C.card, border: `1px solid ${C.rule}`, borderRadius: 6, boxShadow: '0 1px 2px rgba(17,24,39,0.04)' }}>
      <svg width={CARD_W} height={CARD_H} viewBox={`0 0 ${CARD_W} ${CARD_H}`}>
        <defs>
          <marker id="tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M1,1 L9,5 L1,9" fill="none" stroke={C.ink} strokeWidth="1.4" />
          </marker>
          <marker id="tipRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M1,1 L9,5 L1,9" fill="none" stroke={C.crimson} strokeWidth="1.4" />
          </marker>
        </defs>
        {children}
      </svg>
    </div>
  )
}

/** 작은 대문자 라벨 */
export const Kicker = ({ x, y, children, color = C.mute, anchor = 'start' }: { x: number; y: number; children: ReactNode; color?: string; anchor?: 'start' | 'middle' | 'end' }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontWeight={700} fontSize={24} letterSpacing={3} fill={color}>{children}</text>
)

/** 번호 매긴 세로 인과 목록 — 가는 선과 화살표만 */
export function Steps({ f, len, items, top, rowH = 118 }: { f: number; len: number; items: { t: string; s: string }[]; top: number; rowH?: number }) {
  const each = (len * 0.55) / items.length
  return (
    <g>
      {items.map((it, i) => {
        const at = 8 + i * each
        const p = ease(f, at, at + 16)
        const y = top + i * rowH
        const last = i === items.length - 1
        return (
          <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 14})`}>
            {i > 0 && <line x1={60} x2={900} y1={y - 14} y2={y - 14} stroke={C.rule} strokeWidth={1} />}
            <text x={60} y={y + 52} fontFamily={SERIF} fontWeight={900} fontSize={52} fill={last ? C.crimson : C.faint}>{i + 1}</text>
            <text x={130} y={y + 40} fontFamily={SANS} fontWeight={800} fontSize={40} fill={last ? C.crimson : C.ink}>{it.t}</text>
            <text x={130} y={y + 82} fontFamily={SANS} fontWeight={500} fontSize={27} fill={C.mute}>{it.s}</text>
            {!last && <line x1={872} x2={872} y1={y + 30} y2={y + 30 + 56 * ease(f, at + 10, at + 22)} stroke={C.ink} strokeWidth={1.5} markerEnd={f > at + 20 ? 'url(#tip)' : undefined} />}
          </g>
        )
      })}
    </g>
  )
}

// ───────────────────────── 자막(박스 없이, 형광펜 밑줄) ─────────────────────────

function chunks(text: string, max = 30) {
  const out: string[] = []
  for (const s of text.split(/(?<=[.?!])\s+/)) {
    if (s.length <= max) { out.push(s); continue }
    let cur = ''
    for (const w of s.split(/(?<=,)\s+/)) {
      if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w } else cur = cur ? `${cur} ${w}` : w
    }
    if (cur.length <= max) { out.push(cur); continue }
    const mid = cur.length / 2
    let cut = -1
    for (let i = 0; i < cur.length; i++) if (cur[i] === ' ' && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i
    out.push(cur.slice(0, cut), cur.slice(cut + 1))
  }
  return out
}

function Marked({ text, sc, p }: { text: string; sc: EditorialScene; p: number }) {
  const terms = [...sc.amber.map(t => ({ t, c: 'rgba(245,158,11,0.45)' })), ...sc.crimson.map(t => ({ t, c: 'rgba(220,38,38,0.26)' }))].sort((a, b) => b.t.length - a.t.length)
  const re = new RegExp(`(${terms.map(x => x.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  return (
    <>
      {text.split(re).map((part, i) => {
        const hit = terms.find(x => x.t === part)
        if (!hit) return <span key={i}>{part}</span>
        return (
          <span key={i} style={{ backgroundImage: `linear-gradient(${hit.c}, ${hit.c})`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 92%', backgroundSize: `${p * 100}% 0.32em`, padding: '0 2px' }}>
            {part}
          </span>
        )
      })}
    </>
  )
}

function Caption({ s, sc, f }: { s: Said; sc: EditorialScene; f: number }) {
  const parts = chunks(s.text)
  const w = parts.map(p => p.replace(/\s/g, '').length)
  const sum = w.reduce((a, b) => a + b, 0)
  let acc = 0
  let idx = parts.length - 1
  let startOf = ((sum - w[w.length - 1]) / sum) * s.dur
  for (let i = 0; i < parts.length; i++) {
    const end = acc + w[i]
    if (f < (end / sum) * s.dur) { idx = i; startOf = (acc / sum) * s.dur; break }
    acc = end
  }
  const local = f - startOf
  const p = ease(local, 0, 10)
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 1440, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, lineHeight: 1.42, color: C.ink, textAlign: 'center', wordBreak: 'keep-all', letterSpacing: -0.5 }}>
        <Marked text={parts[idx]} sc={sc} p={ease(local, 6, 22)} />
      </div>
    </div>
  )
}

/** 형광펜 밑줄이 그어지는 강조 구절(마무리 카드 등) */
export const Highlight = ({ children, p, color = 'rgba(245,158,11,0.45)' }: { children: ReactNode; p: number; color?: string }) => (
  <span style={{ backgroundImage: `linear-gradient(${color}, ${color})`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 90%', backgroundSize: `${p * 100}% 0.3em` }}>{children}</span>
)

// ───────────────────────── 본편 틀 ─────────────────────────

export function EditorialBriefing({ scenesData, clips, ticks, tickW = 330, mastRight, footRight, Board, Outro }: {
  scenesData: EditorialScene[]
  clips: Clip[]
  ticks: Tick[]
  tickW?: number
  mastRight: string
  footRight: string
  Board: ComponentType<BoardProps>
  Outro: ComponentType<{ f: number }>
}) {
  useEditorialFonts(scenesData.map(s => s.title + s.scene + s.sentences.map(x => x.text).join('')).join(''))
  const frame = useCurrentFrame()
  const { scenes, outroAt, total } = editorialLayout(scenesData, clips)
  const ends = scenes.map((_, i) => scenes[i + 1]?.from ?? outroAt)
  const fadeAll = interpolate(frame, [total - 14, total], [1, 0], clamp)

  return (
    <AbsoluteFill style={{ background: C.paper, opacity: fadeAll }}>
      <Paper />
      <Masthead frame={frame} ticks={ticks} tickW={tickW} right={mastRight} />

      {/* 씬 — 나가는 씬이 거의 사라진 뒤 들어오는 페이드 스루 + 위아래 미세 이동 */}
      {scenes.map((sc, i) => {
        const end = ends[i]
        if (frame < sc.from || frame >= end + FADE_OUT) return null
        const f = frame - sc.from
        const len = end - sc.from
        const fin = i === 0 ? ease(f, 0, FADE_IN) : ease(f, FADE_OUT - 4, FADE_OUT - 4 + FADE_IN)
        const fout = ease(frame - end, 0, FADE_OUT)
        const dy = (1 - fin) * 22 - fout * 16
        // 문장 사이 정적 동안에는 직전 문장 자막을 그대로 둔다
        let cur: Said | null = null
        for (const x of sc.said) if (frame >= x.voiceAt) cur = x
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: fin * (1 - fout), transform: `translateY(${dy}px)` }}>
            <div style={{ position: 'absolute', left: 60, right: 60, top: 236 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 34, color: C.crimson }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.mute, letterSpacing: 1 }}>{sc.data.scene}</span>
              </div>
              {/* 긴 제목은 한 줄에 들어오게 글자 크기를 줄인다(최대 74px) */}
              <div style={{ marginTop: 10, fontFamily: SERIF, fontWeight: 900, fontSize: Math.min(74, Math.floor(900 / (sc.data.title.length * 0.95))), color: C.ink, letterSpacing: -1.5, whiteSpace: 'nowrap' }}>{sc.data.title}</div>
              <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
                {scenes.map((_, j) => <div key={j} style={{ flex: 1, height: 2, background: j === i ? C.crimson : j < i ? C.ink : C.rule }} />)}
              </div>
            </div>
            <Card>
              <Board kind={sc.data.board} f={f} len={len} />
            </Card>
            {cur && <Caption s={cur} sc={sc.data} f={frame - cur.voiceAt} />}
          </div>
        )
      })}

      {frame >= outroAt && <Outro f={frame - outroAt} />}

      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 60, borderTop: `1px solid ${C.rule}`, paddingTop: 18, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.faint }}>
        <span>MACRO BRIEFING</span>
        <span>{footRight}</span>
      </div>

      {scenes.flatMap(sc => sc.said).map((s, i) => (
        <Sequence key={i} from={s.voiceAt} durationInFrames={s.dur} layout="none">
          <Audio src={staticFile(s.clip.file)} startFrom={Math.round(s.clip.start * FPS)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}

/** 마무리 카드 — 라벨 · 세리프 요약 · 아래 고지 */
export function EditorialOutro({ f, label, children, note }: { f: number; label: string; children: ReactNode; note: ReactNode }) {
  const a = ease(f, 4, 26)
  const b = ease(f, 22, 44)
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 560 }}>
      <div style={{ opacity: a, transform: `translateY(${(1 - a) * 18}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: C.crimson }}>{label}</div>
        <div style={{ marginTop: 22, height: 2, width: 80, background: C.ink }} />
        <div style={{ marginTop: 34, fontFamily: SERIF, fontWeight: 900, fontSize: 70, lineHeight: 1.32, color: C.ink, letterSpacing: -1 }}>{children}</div>
      </div>
      <div style={{ marginTop: 110, opacity: b, borderTop: `1px solid ${C.rule}`, paddingTop: 30, fontFamily: SANS, fontWeight: 600, fontSize: 32, lineHeight: 1.6, color: C.body, wordBreak: 'keep-all' }}>{note}</div>
    </div>
  )
}
