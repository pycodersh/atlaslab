/**
 * 매크로 브리핑 · 에디토리얼판 — 경제 잡지 톤의 밝은 브리핑 (1080×1920, 30fps, 음성 길이에 맞춰)
 *
 * 다크 터미널판(ProAnalystBriefing)과 같은 내용을 밝은 지면 · 세리프 헤드라인 · 미니멀 선 그래프로 다시 짰다.
 * 대본   remotion/ProAnalyst/lines-light.json — 씬마다 sentences(문장 = 음성 클립 1개), amber/crimson = 형광펜 밑줄 용어
 * 음성   python scripts/bullbear/generate-voice.py pro-light → 도윤(차분한 해설 톤), 템포 0.93
 *        → public/audio/pro-analyst-light/NN.mp3 + audio-light.generated.json
 * 호흡   문장 사이 PAUSE(0.35초), 씬 사이는 그만큼 더 두고 페이드 + 미세한 위아래 모션으로 잇는다
 * 렌더   npm run render:pro-light → out/remotion/pro-analyst-light.mp4
 */
import { useEffect, useState, type ReactNode } from 'react'
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, Easing, staticFile, useCurrentFrame } from 'remotion'
import AUDIO from './audio-light.generated.json'
import LINES from './lines-light.json'

type Sentence = { text: string; say?: string }
type Scene = { scene: string; title: string; amber: string[]; crimson: string[]; board: string; sentences: Sentence[] }
type Clip = { file: string; total: number; start: number; end: number }

const FPS = 30
const INTRO = 24
const PAUSE = Math.round(0.35 * FPS) // 문장 사이 정적
const SCENE_GAP = 14 // 씬 사이에 더 두는 숨(페이드가 들어갈 자리)
const OUTRO = 110
const FADE_IN = 18
const FADE_OUT = 14

const C = {
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
const SANS = "Pretendard, 'Noto Sans KR', 'Malgun Gothic', sans-serif"
const SERIF = "'Noto Serif KR', 'Nanum Myeongjo', serif"

const scenesData = LINES as Scene[]
const clips = AUDIO as Clip[]

type Said = { text: string; clip: Clip; voiceAt: number; dur: number }
export function proLightLayout() {
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

export const PRO_LIGHT = { width: 1080, height: 1920, fps: FPS, durationInFrames: proLightLayout().total }

const FONT_LINKS = [
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@600;700;900&display=swap',
]
function useFonts() {
  const [handle] = useState(() => delayRender('pro-light fonts'))
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
    // 실제로 쓰는 글자를 넘겨야 Noto Serif KR 의 해당 unicode-range 조각까지 받아 둔다
    const sample = scenesData.map(s => s.title + s.scene + s.sentences.map(x => x.text).join('')).join('') + '0123456789,.%+−→핵심요약가상시황시뮬레이션해설입니다결론'
    Promise.all(sheets)
      .then(() => Promise.all([
        document.fonts.load('800 54px Pretendard', sample),
        document.fonts.load('600 30px Pretendard', sample),
        document.fonts.load('900 76px "Noto Serif KR"', sample),
        document.fonts.load('700 40px "Noto Serif KR"', sample),
      ]))
      .then(finish, finish)
    const t = setTimeout(finish, 8000)
    return () => clearTimeout(t)
  }, [handle])
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const soft = Easing.bezier(0.22, 1, 0.36, 1)
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: soft })
const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

// ───────────────────────── 배경 워터마크 · 지면 ─────────────────────────

/** 잉크 펜화 황소(옆모습, 400×300) */
const BULL = [
  'M40,190 C60,140 110,110 170,108 C230,106 280,120 320,150 C345,168 360,190 362,214',
  'M362,214 C364,236 350,252 330,256 L300,258', 'M170,108 C150,80 120,62 84,58 C70,57 62,64 70,72 C90,90 118,96 140,112',
  'M300,150 C318,118 346,100 378,98', 'M318,140 C330,128 342,124 354,124',
  'M40,190 C30,230 40,262 62,280', 'M120,262 L118,300', 'M160,268 L160,300', 'M262,262 L262,300', 'M300,258 L302,300',
  'M62,280 C90,268 120,262 160,268 C200,274 240,272 262,262', 'M330,190 C334,196 334,202 330,206', 'M58,200 C48,214 44,232 46,250',
]
/** 잉크 펜화 곰(옆모습, 400×300) */
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
        {/* 황소(좌) · 곰(우)이 마주 보는 펜화 — 0.06 */}
        <g opacity={0.06}>
          <g transform="translate(20 760) scale(1.3)"><Ink paths={BULL} /></g>
          <g transform="translate(540 760) scale(1.3)"><Ink paths={BEAR} /></g>
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// ───────────────────────── 머리 · 시세 띠 ─────────────────────────

const TICKS = [
  { k: 'KOSPI', v: '5,000', up: false },
  { k: 'NASDAQ', v: '−5.2%', up: false },
  { k: 'NVDA', v: '−14.1%', up: false },
  { k: 'FED', v: '+50bp', up: true },
  { k: 'GOLD', v: '연중 최저', up: false },
  { k: 'BTC', v: '연중 최저', up: false },
]
const TICK_W = 330

function Masthead({ frame }: { frame: number }) {
  const p = ease(frame, 0, 24)
  const span = TICK_W * TICKS.length
  const off = -((frame * 1.6) % span)
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: p, transform: `translateY(${(1 - p) * -12}px)` }}>
      <div style={{ height: 118, display: 'flex', alignItems: 'flex-end', padding: '0 60px 18px' }}>
        <div style={{ width: 20, height: 20, background: C.crimson, marginRight: 16, marginBottom: 9 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 40, color: C.ink, letterSpacing: 3 }}>MACRO BRIEFING</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: C.mute, marginBottom: 6 }}>가상 시황 시뮬레이션</div>
      </div>
      <div style={{ height: 2, background: C.ink, margin: '0 60px' }} />
      <div style={{ height: 1, background: C.ink, margin: '3px 60px 0' }} />
      <div style={{ height: 60, margin: '0 60px', borderBottom: `1px solid ${C.rule}`, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: off, top: 0, height: 60, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          {[0, 1, 2].map(r => TICKS.map(t => (
            <div key={`${r}${t.k}`} style={{ width: TICK_W, flexShrink: 0, display: 'flex', alignItems: 'center', fontFamily: SANS, fontSize: 26 }}>
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

// ───────────────────────── 씬 시각화(카드 960×900) ─────────────────────────

const W = 960
const H = 900

function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', left: 60, top: 470, width: W, height: H, background: C.card, border: `1px solid ${C.rule}`, borderRadius: 6, boxShadow: '0 1px 2px rgba(17,24,39,0.04)' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M1,1 L9,5 L1,9" fill="none" stroke={C.ink} strokeWidth="1.4" />
          </marker>
        </defs>
        {children}
      </svg>
    </div>
  )
}

/** 작은 대문자 라벨 */
const Kicker = ({ x, y, children, color = C.mute, anchor = 'start' }: { x: number; y: number; children: ReactNode; color?: string; anchor?: 'start' | 'middle' | 'end' }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontWeight={700} fontSize={24} letterSpacing={3} fill={color}>{children}</text>
)

const KOSPI = [6000, 6250, 6150, 6500, 6800, 6700, 7100, 7450, 7300, 7800, 8200, 8100, 8600, 9050, 8500, 7800, 7900, 7100, 6300, 6500, 5600, 4980]
function KospiCard({ f, len }: { f: number; len: number }) {
  const top = 300, bottom = 800, lo = 4500, hi = 9500, x0 = 60, x1 = 840
  const X = (i: number) => x0 + (i / (KOSPI.length - 1)) * (x1 - x0)
  const Y = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top)
  const peak = KOSPI.indexOf(Math.max(...KOSPI))
  const p = ease(f, 10, len * 0.7) * (KOSPI.length - 1)
  const k = Math.floor(p)
  const live = k >= KOSPI.length - 1 ? KOSPI[KOSPI.length - 1] : KOSPI[k] + (KOSPI[k + 1] - KOSPI[k]) * (p - k)
  const rise = KOSPI.slice(0, Math.min(k, peak) + 1).map((v, i) => `${X(i)},${Y(v)}`)
  if (p < peak) rise.push(`${X(p)},${Y(live)}`)
  const fall = p > peak ? KOSPI.slice(peak, k + 1).map((v, i) => `${X(peak + i)},${Y(v)}`) : []
  if (p > peak && k < KOSPI.length - 1) fall.push(`${X(p)},${Y(live)}`)
  const done = p >= KOSPI.length - 1.01
  const tag = ease(f, len * 0.7, len * 0.8)
  return (
    <g>
      <Kicker x={60} y={80}>KOSPI · 지수</Kicker>
      <text x={60} y={190} fontFamily={SERIF} fontWeight={900} fontSize={104} fill={p > peak ? C.crimson : C.ink}>{fmt(done ? 5000 : live)}</text>
      <g opacity={tag}>
        <text x={900} y={190} textAnchor="end" fontFamily={SERIF} fontWeight={900} fontSize={72} fill={C.crimson}>−44.4%</text>
      </g>
      <text x={60} y={240} fontFamily={SANS} fontWeight={600} fontSize={28} fill={C.mute}>9,000 돌파 이후 5,000 붕괴</text>
      {[5000, 7000, 9000].map(v => (
        <g key={v}>
          <line x1={x0} x2={x1 + 20} y1={Y(v)} y2={Y(v)} stroke={v === 5000 ? C.crimson : C.rule} strokeWidth={1} strokeDasharray={v === 5000 ? '6 6' : undefined} />
          <text x={900} y={Y(v) + 8} textAnchor="end" fontFamily={SANS} fontWeight={600} fontSize={22} fill={v === 5000 ? C.crimson : C.faint}>{fmt(v)}</text>
        </g>
      ))}
      <polyline points={rise.join(' ')} fill="none" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {fall.length > 1 && <polyline points={fall.join(' ')} fill="none" stroke={C.crimson} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />}
      <circle cx={X(Math.min(p, KOSPI.length - 1))} cy={Y(live)} r={6} fill={p > peak ? C.crimson : C.ink} />
      <g opacity={ease(f, 10 + (len * 0.7 - 10) * (peak / (KOSPI.length - 1)), 10 + (len * 0.7 - 10) * (peak / (KOSPI.length - 1)) + 10)}>
        <line x1={X(peak)} x2={X(peak)} y1={Y(9050) - 12} y2={Y(9050) - 44} stroke={C.ink} strokeWidth={1} />
        <text x={X(peak)} y={Y(9050) - 54} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} fill={C.ink}>9,000 돌파</text>
      </g>
      <text x={60} y={860} fontFamily={SANS} fontSize={20} fill={C.faint}>가상 시뮬레이션 지수 · 일간</text>
    </g>
  )
}

function FedCard({ f, len }: { f: number; len: number }) {
  const g = (y: number, label: string, from: number, to: number, a: number, b: number, color: string, note: string) => {
    const t = ease(f, a, b)
    const w = 840 * (from + (to - from) * t)
    return (
      <g transform={`translate(60 ${y})`} opacity={ease(f, a - 10, a)}>
        <text x={0} y={0} fontFamily={SANS} fontWeight={700} fontSize={32} fill={C.ink}>{label}</text>
        <text x={840} y={0} textAnchor="end" fontFamily={SANS} fontWeight={700} fontSize={28} fill={color}>{note}</text>
        <line x1={0} x2={840} y1={34} y2={34} stroke={C.rule} strokeWidth={2} />
        <line x1={0} x2={w} y1={34} y2={34} stroke={color} strokeWidth={6} strokeLinecap="round" />
      </g>
    )
  }
  return (
    <g>
      <Kicker x={60} y={80}>연준 · 월러 이사</Kicker>
      <g opacity={ease(f, 6, 22)}>
        <text x={60} y={170} fontFamily={SERIF} fontWeight={700} fontSize={46} fill={C.body}>“12월에 한 번 더,</text>
        <text x={60} y={232} fontFamily={SERIF} fontWeight={700} fontSize={46} fill={C.body}>크게 올려야 한다”</text>
      </g>
      <g opacity={ease(f, 16, 34)} transform={`translate(0 ${(1 - ease(f, 16, 34)) * 16})`}>
        <text x={60} y={440} fontFamily={SERIF} fontWeight={900} fontSize={176} fill={C.crimson}>+50bp</text>
        <text x={66} y={492} fontFamily={SANS} fontWeight={600} fontSize={28} fill={C.mute}>12월 기준금리 인상 주장 · 빅스텝</text>
      </g>
      {g(620, '인플레이션 재점화 우려', 0.35, 0.9, len * 0.35, len * 0.6, C.crimson, '확대')}
      {g(760, '시장의 금리 인하 기대', 0.8, 0.12, len * 0.5, len * 0.82, C.ink, '소멸')}
      <text x={60} y={860} fontFamily={SANS} fontSize={20} fill={C.faint}>막대는 방향성만 표시</text>
    </g>
  )
}

/** 번호 매긴 세로 인과 목록 — 가는 선과 화살표만 */
function Steps({ f, len, items, top, rowH = 118 }: { f: number; len: number; items: { t: string; s: string }[]; top: number; rowH?: number }) {
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

/** 작은 하락 선 그래프 */
function Spark({ x, y, p, label }: { x: number; y: number; p: number; label: string }) {
  const pts = [[0, 20], [40, 14], [80, 30], [120, 24], [160, 48], [200, 44], [240, 70]]
  const n = Math.max(1, Math.floor(p * (pts.length - 1)))
  return (
    <g transform={`translate(${x} ${y})`} opacity={Math.min(1, p * 3)}>
      <text x={0} y={0} fontFamily={SANS} fontWeight={800} fontSize={32} fill={C.ink}>{label}</text>
      <text x={0} y={40} fontFamily={SANS} fontWeight={600} fontSize={24} fill={C.crimson}>연중 최저</text>
      <polyline transform="translate(170 -28)" points={pts.slice(0, n + 1).map(q => q.join(',')).join(' ')} fill="none" stroke={C.crimson} strokeWidth={2.5} strokeLinejoin="round" />
    </g>
  )
}

function FlowCard({ f, len }: { f: number; len: number }) {
  const t = len * 0.6
  return (
    <g>
      <Kicker x={60} y={80}>왜 안전자산까지 팔렸나</Kicker>
      <Steps f={f} len={len} top={120} items={[
        { t: '빅스텝 공포', s: '연준 +50bp 리스크가 가격에 반영' },
        { t: '유동성 경색', s: '레버리지와 단기자금이 동시에 위축' },
        { t: '마진콜과 현금화', s: '증거금이 부족하면 팔리는 것부터 매도' },
        { t: '금 · 비트코인 동반 투매', s: '안전자산도 현금 마련 창구가 된다' },
      ]} />
      <line x1={60} x2={900} y1={610} y2={610} stroke={C.ink} strokeWidth={1} opacity={ease(f, t, t + 10)} />
      <Spark x={60} y={680} p={ease(f, t, t + 30)} label="금" />
      <Spark x={500} y={680} p={ease(f, t + 8, t + 38)} label="비트코인" />
      <text x={480} y={830} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={52} fill={C.ink} opacity={ease(f, t + 24, t + 44)}>Cash is King</text>
    </g>
  )
}

function AiCard({ f, len }: { f: number; len: number }) {
  const rows = [
    { k: 'NVDA', v: -14.1, y: 300, d: 14, col: C.crimson },
    { k: 'NASDAQ', v: -5.2, y: 450, d: 26, col: '#E35D5D' },
  ]
  const scale = 34 // 1%p = 34px — NVDA 막대 끝에 값 라벨이 카드 안에 들어오게
  const note = ease(f, len * 0.5, len * 0.62)
  return (
    <g>
      <Kicker x={60} y={80}>하루 등락률</Kicker>
      <g opacity={ease(f, 4, 18)}>
        <text x={60} y={170} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.body}>새 CEO 임명, 리더십 불확실성</text>
        <line x1={60} x2={60 + 520 * ease(f, 12, 30)} y1={186} y2={186} stroke={C.amber} strokeWidth={8} opacity={0.5} />
      </g>
      <line x1={220} x2={220} y1={250} y2={560} stroke={C.ink} strokeWidth={1.5} />
      <text x={220} y={590} textAnchor="middle" fontFamily={SANS} fontSize={20} fill={C.faint}>0%</text>
      {rows.map(r => {
        const t = ease(f, r.d, r.d + 34)
        const w = -r.v * scale * t
        return (
          <g key={r.k}>
            <text x={196} y={r.y + 48} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={32} fill={C.ink}>{r.k}</text>
            <rect x={222} y={r.y} width={w} height={74} fill={r.col} />
            <text x={222 + w + 16} y={r.y + 54} fontFamily={SERIF} fontWeight={900} fontSize={50} fill={r.col}>{(r.v * t).toFixed(1)}%</text>
          </g>
        )
      })}
      <g opacity={note} transform={`translate(60 ${660 + (1 - note) * 14})`}>
        <rect x={0} y={0} width={6} height={140} fill={C.crimson} />
        <text x={36} y={56} fontFamily={SANS} fontWeight={800} fontSize={36} fill={C.ink}>할인율 상승 · 밸류에이션 재평가</text>
        <text x={36} y={108} fontFamily={SANS} fontWeight={500} fontSize={28} fill={C.mute}>먼 미래 이익일수록 현재 가치가 크게 줄어든다</text>
      </g>
    </g>
  )
}

function KoreaCard({ f, len }: { f: number; len: number }) {
  const cells = [
    { t: '미 금리 인상', s: '연준 +50bp 압박', x: 60, y: 120 },
    { t: '한은 동결·압박', s: '인하 카드 봉쇄', x: 490, y: 120 },
    { t: '주담대 이자 상승', s: '가계부채 상환 부담', x: 490, y: 400 },
    { t: '부동산 하방 압력', s: '영끌 매물 · 가격 조정', x: 60, y: 400 },
  ]
  const cw = 410, ch = 250
  const each = (len * 0.5) / cells.length
  const links = [
    `M${60 + cw + 4},${120 + ch / 2} L${490 - 6},${120 + ch / 2}`,
    `M${490 + cw / 2},${120 + ch + 4} L${490 + cw / 2},${400 - 6}`,
    `M${490 - 4},${400 + ch / 2} L${60 + cw + 6},${400 + ch / 2}`,
  ]
  const end = ease(f, len * 0.6, len * 0.72)
  return (
    <g>
      <Kicker x={60} y={80}>국내 전이 경로</Kicker>
      {cells.map((c, i) => {
        const at = 8 + i * each
        const p = ease(f, at, at + 16)
        const last = i === cells.length - 1
        return (
          <g key={i}>
            {i > 0 && <path d={links[i - 1]} fill="none" stroke={C.ink} strokeWidth={1.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(f, at - 10, at)} markerEnd={f > at ? 'url(#tip)' : undefined} />}
            <g opacity={p} transform={`translate(${c.x} ${c.y + (1 - p) * 14})`}>
              <rect width={cw} height={ch} fill={last ? '#FEF2F2' : C.card} stroke={last ? C.crimson : C.rule} strokeWidth={1.5} />
              <text x={28} y={70} fontFamily={SERIF} fontWeight={900} fontSize={46} fill={last ? C.crimson : C.faint}>{i + 1}</text>
              <text x={28} y={150} fontFamily={SANS} fontWeight={800} fontSize={38} fill={last ? C.crimson : C.ink}>{c.t}</text>
              <text x={28} y={198} fontFamily={SANS} fontWeight={500} fontSize={26} fill={C.mute}>{c.s}</text>
            </g>
          </g>
        )
      })}
      <g opacity={end} transform={`translate(60 ${720 + (1 - end) * 14})`}>
        <rect x={0} y={0} width={6} height={120} fill={C.amber} />
        <text x={36} y={46} fontFamily={SANS} fontWeight={700} fontSize={24} letterSpacing={3} fill={C.amber}>결론</text>
        <text x={36} y={100} fontFamily={SERIF} fontWeight={900} fontSize={46} fill={C.ink}>수익률보다, 현금 비중 관리</text>
      </g>
    </g>
  )
}

function Board({ kind, f, len }: { kind: string; f: number; len: number }) {
  if (kind === 'kospi') return <KospiCard f={f} len={len} />
  if (kind === 'fed') return <FedCard f={f} len={len} />
  if (kind === 'flow') return <FlowCard f={f} len={len} />
  if (kind === 'ai') return <AiCard f={f} len={len} />
  if (kind === 'korea') return <KoreaCard f={f} len={len} />
  return null
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

function Marked({ text, sc, p }: { text: string; sc: Scene; p: number }) {
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

function Caption({ s, sc, f, hold }: { s: Said; sc: Scene; f: number; hold: number }) {
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
    <div style={{ position: 'absolute', left: 70, right: 70, top: 1440, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p * hold, transform: `translateY(${(1 - p) * 10}px)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, lineHeight: 1.42, color: C.ink, textAlign: 'center', wordBreak: 'keep-all', letterSpacing: -0.5 }}>
        <Marked text={parts[idx]} sc={sc} p={ease(local, 6, 22)} />
      </div>
    </div>
  )
}

// ───────────────────────── 본편 ─────────────────────────

export function ProAnalystLight() {
  useFonts()
  const frame = useCurrentFrame()
  const { scenes, outroAt, total } = proLightLayout()
  const ends = scenes.map((s, i) => scenes[i + 1]?.from ?? outroAt)
  const fadeAll = interpolate(frame, [total - 14, total], [1, 0], clamp)

  return (
    <AbsoluteFill style={{ background: C.paper, opacity: fadeAll }}>
      <Paper />
      <Masthead frame={frame} />

      {/* 씬 — 다음 씬과 FADE_OUT 프레임 겹치며 페이드 + 위아래 미세 이동 */}
      {scenes.map((sc, i) => {
        const from = sc.from
        const end = ends[i]
        if (frame < from || frame >= end + FADE_OUT) return null
        const f = frame - from
        const len = end - from
        // 들어오는 씬은 나가는 씬이 거의 사라진 뒤에 — 두 제목이 겹쳐 보이지 않게(1차 렌더)
        const fin = i === 0 ? ease(f, 0, FADE_IN) : ease(f, FADE_OUT - 4, FADE_OUT - 4 + FADE_IN)
        const fout = ease(frame - end, 0, FADE_OUT)
        const op = fin * (1 - fout)
        const dy = (1 - fin) * 22 - fout * 16
        // 문장 사이 정적(0.35초) 동안에는 직전 문장 자막을 그대로 둔다 — 깜빡이지 않게
        let cur: Said | null = null
        for (const x of sc.said) if (frame >= x.voiceAt) cur = x
        const hold = cur ? 1 : 0
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: op, transform: `translateY(${dy}px)` }}>
            <div style={{ position: 'absolute', left: 60, right: 60, top: 236 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 34, color: C.crimson }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.mute, letterSpacing: 1 }}>{sc.data.scene}</span>
              </div>
              <div style={{ marginTop: 10, fontFamily: SERIF, fontWeight: 900, fontSize: 74, color: C.ink, letterSpacing: -1.5 }}>{sc.data.title}</div>
              <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
                {scenes.map((_, j) => <div key={j} style={{ flex: 1, height: 2, background: j === i ? C.crimson : j < i ? C.ink : C.rule }} />)}
              </div>
            </div>
            <Card>
              <Board kind={sc.data.board} f={f} len={len} />
            </Card>
            {cur && <Caption s={cur} sc={sc.data} f={frame - cur.voiceAt} hold={hold} />}
          </div>
        )
      })}

      {frame >= outroAt && <Outro f={frame - outroAt} />}

      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 60, borderTop: `1px solid ${C.rule}`, paddingTop: 18, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.faint }}>
        <span>MACRO BRIEFING</span>
        <span>가상 시황 시뮬레이션 · 투자 권유 아님</span>
      </div>

      {scenes.flatMap(sc => sc.said).map((s, i) => (
        <Sequence key={i} from={s.voiceAt} durationInFrames={s.dur} layout="none">
          <Audio src={staticFile(s.clip.file)} startFrom={Math.round(s.clip.start * FPS)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}

function Outro({ f }: { f: number }) {
  const a = ease(f, 4, 26)
  const b = ease(f, 22, 44)
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 560 }}>
      <div style={{ opacity: a, transform: `translateY(${(1 - a) * 18}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: C.crimson }}>핵심 요약</div>
        <div style={{ marginTop: 22, height: 2, width: 80, background: C.ink }} />
        <div style={{ marginTop: 34, fontFamily: SERIF, fontWeight: 900, fontSize: 70, lineHeight: 1.32, color: C.ink, letterSpacing: -1 }}>
          유동성이 마르면,<br />안전자산도<br />
          <span style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.45), rgba(245,158,11,0.45))', backgroundRepeat: 'no-repeat', backgroundPosition: '0 90%', backgroundSize: `${ease(f, 24, 44) * 100}% 0.3em` }}>현금화 대상</span>이 된다
        </div>
      </div>
      <div style={{ marginTop: 110, opacity: b, borderTop: `1px solid ${C.rule}`, paddingTop: 30, fontFamily: SANS, fontWeight: 600, fontSize: 32, lineHeight: 1.6, color: C.body, wordBreak: 'keep-all' }}>
        ※ 본 영상은 이해를 돕기 위한<br />가상 시황 시뮬레이션 해설입니다.
      </div>
    </div>
  )
}
