/**
 * 매크로 브리핑 — 금융 터미널 스타일 단독 애널리스트 쇼츠 (1080×1920, 30fps, 음성 길이에 맞춰 ≈55초)
 *
 * 대본   remotion/ProAnalyst/lines.json (text=자막, say=TTS 발음, cyan/amber=하이라이트 용어, board=중앙 시각화)
 * 음성   python scripts/bullbear/generate-voice.py pro → public/audio/pro-analyst/NN.mp3 + audio.generated.json
 * 렌더   npm run render:pro-analyst → out/remotion/pro-analyst-briefing.mp4
 *
 * 캐릭터 PNG 없이 황소·곰은 배경의 기하학 라인아트 워터마크(0.08)로만 쓴다. 하락 구간은 곰 쪽에 붉은/청색 림라이트.
 * 모든 수치는 가상 시황 시뮬레이션 — 마지막에 고지 문구를 띄운다.
 */
import { useEffect, useState, type ReactNode } from 'react'
import {
  AbsoluteFill,
  Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
} from 'remotion'
import AUDIO from './audio.generated.json'
import LINES from './lines.json'

type Line = { scene: string; title: string; text: string; say?: string; cyan: string[]; amber: string[]; board: string }
type Clip = { file: string; total: number; start: number; end: number }

const FPS = 30
const INTRO = 20
const GAP = 14
const OUTRO = 96

const C = {
  bg: '#0B0F17',
  panel: 'rgba(15,23,42,0.62)',
  border: 'rgba(148,163,184,0.18)',
  text: '#E5E7EB',
  dim: '#94A3B8',
  faint: '#475569',
  cyan: '#38BDF8',
  amber: '#F59E0B',
  red: '#F43F5E',
  green: '#22C55E',
  blue: '#3B82F6',
}
const SANS = "Pretendard, 'Noto Sans KR', 'Malgun Gothic', sans-serif"
const MONO = "'JetBrains Mono', 'Consolas', monospace"

const lines = LINES as Line[]
const clips = AUDIO as Clip[]

export function proAnalystLayout() {
  let at = INTRO
  const scenes = lines.map((line, i) => {
    const clip = clips[i]
    const dur = Math.ceil((clip.end - clip.start) * FPS) + 3
    const s = { line, clip, voiceAt: at, dur, from: i === 0 ? 0 : at - 6 }
    at += dur + GAP
    return s
  })
  return { scenes, outroAt: at, total: at + OUTRO }
}

export const PRO_ANALYST = { width: 1080, height: 1920, fps: FPS, durationInFrames: proAnalystLayout().total }

const FONT_LINKS = [
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700;800&display=swap',
]
function useFonts() {
  const [handle] = useState(() => delayRender('pro-analyst fonts'))
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
    Promise.all(sheets)
      .then(() => Promise.all([
        document.fonts.load('800 60px Pretendard', '가나다ABC'),
        document.fonts.load('600 40px Pretendard', '가나다ABC'),
        document.fonts.load('700 40px "JetBrains Mono"', '0123456789%'),
      ]))
      .then(finish, finish)
    const t = setTimeout(finish, 6000)
    return () => clearTimeout(t)
  }, [handle])
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp)
const pop = (f: number, delay = 0) => spring({ frame: f - delay, fps: FPS, config: { damping: 16, stiffness: 150 } })
const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

// ───────────────────────── 배경 ─────────────────────────

/** 기하학 라인아트 황소 머리(400×400) */
const BULL = [
  'M40,90 Q55,150 132,146', 'M360,90 Q345,150 268,146',
  'M132,140 L268,140 L292,205 L262,300 L232,362 L168,362 L138,300 L108,205 Z',
  'M108,175 L58,192 L110,214', 'M292,175 L342,192 L290,214',
  'M200,140 L168,362', 'M200,140 L232,362', 'M108,205 L262,300', 'M292,205 L138,300',
  'M165,322 L235,322', 'M150,230 L172,236', 'M250,230 L228,236',
]
/** 기하학 라인아트 곰 머리(400×400) */
const BEAR = [
  'M108,118 L118,72 L162,62 L178,104', 'M292,118 L282,72 L238,62 L222,104',
  'M120,110 L280,110 L322,190 L302,292 L242,352 L158,352 L98,292 L78,190 Z',
  'M158,250 L242,250 L254,300 L200,334 L146,300 Z', 'M186,262 L214,262 L200,282 Z',
  'M200,110 L158,250', 'M200,110 L242,250', 'M78,190 L158,250', 'M322,190 L242,250', 'M98,292 L146,300', 'M302,292 L254,300',
  'M150,195 L170,200', 'M250,195 L230,200',
]

function Silhouette({ paths, stroke, width }: { paths: string[]; stroke: string; width: number }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </g>
  )
}

function Backdrop({ frame, red, blue }: { frame: number; red: number; blue: number }) {
  const breathe = 0.85 + 0.15 * Math.sin(frame / 18)
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 45%, #111827 0%, ${C.bg} 62%)` }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid" width={54} height={54} patternUnits="userSpaceOnUse">
            <path d="M54,0 L0,0 L0,54" fill="none" stroke="rgba(148,163,184,0.07)" strokeWidth={1} />
          </pattern>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(frame / 2) % 8} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <rect width={1080} height={1920} fill="url(#grid)" />
        {/* 황소(좌) · 곰(우) 마주 보는 워터마크 */}
        <g transform="translate(40 640) scale(1.2)" opacity={0.08}>
          <Silhouette paths={BULL} stroke="#FFFFFF" width={3} />
        </g>
        <g transform="translate(560 640) scale(1.2)">
          <g filter="url(#glow)" opacity={0.34 * red * breathe}><Silhouette paths={BEAR} stroke={C.red} width={9} /></g>
          <g filter="url(#glow)" opacity={0.34 * blue * breathe}><Silhouette paths={BEAR} stroke={C.blue} width={9} /></g>
          <g opacity={0.08 + 0.05 * Math.max(red, blue)}><Silhouette paths={BEAR} stroke="#FFFFFF" width={3} /></g>
        </g>
        <rect width={1080} height={1920} filter="url(#noise)" opacity={0.05} />
      </svg>
    </AbsoluteFill>
  )
}

// ───────────────────────── 헤더 · 티커 ─────────────────────────

const TICKS = [
  { k: 'KOSPI', v: '5,000', up: false },
  { k: 'NASDAQ', v: '-5.2%', up: false },
  { k: 'NVDA', v: '-14.1%', up: false },
  { k: 'FED', v: '+50bp', up: true },
  { k: 'GOLD', v: '연중 최저', up: false },
  { k: 'BTC', v: '연중 최저', up: false },
]

const TICK_W = 370

function Header({ frame }: { frame: number }) {
  const inY = interpolate(pop(frame), [0, 1], [-170, 0])
  // 항목마다 고정 폭(TICK_W)이라 한 바퀴 길이가 정확하다 — 글자 폭에 맡기면 반복분이 겹친다(1차 렌더)
  const span = TICK_W * TICKS.length
  const off = -((frame * 3.2) % span)
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${inY}px)` }}>
      <div style={{ height: 100, background: '#0F172A', display: 'flex', alignItems: 'center', padding: '0 44px', borderBottom: `2px solid ${C.amber}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: 1 }}>MACRO BRIEFING</div>
        <div style={{ width: 2, height: 36, background: C.faint, margin: '0 20px' }} />
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.amber }}>가상 시황 시뮬레이션</div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 14, height: 14, borderRadius: 7, background: C.red, opacity: frame % 30 < 18 ? 1 : 0.25, marginRight: 10 }} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.dim }}>SIM</div>
      </div>
      <div style={{ height: 64, background: '#060A12', borderBottom: `1px solid ${C.border}`, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: off, display: 'flex', height: 64, alignItems: 'center', whiteSpace: 'nowrap' }}>
          {[0, 1, 2].map(rep => (
            <div key={rep} style={{ display: 'flex', width: span }}>
              {TICKS.map(t => (
                <div key={t.k} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, width: TICK_W, flexShrink: 0, display: 'flex', gap: 12 }}>
                  <span style={{ color: C.text }}>{t.k}</span>
                  <span style={{ color: t.up ? C.green : C.red, fontFamily: `${MONO}, ${SANS}` }}>{t.v} {t.up ? '▲' : '▼'}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ color: C.faint, marginRight: 26 }}>|</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SceneTitle({ idx, line, f }: { idx: number; line: Line; f: number }) {
  const p = Math.max(0.35, pop(f + 3))
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 212, opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: C.bg, background: C.cyan, padding: '2px 12px', borderRadius: 6 }}>{String(idx + 1).padStart(2, '0')} / {String(lines.length).padStart(2, '0')}</span>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.cyan }}>{line.scene}</span>
      </div>
      <div style={{ marginTop: 14, fontFamily: SANS, fontWeight: 800, fontSize: 70, color: '#fff', letterSpacing: -1 }}>{line.title}</div>
      <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
        {lines.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < idx ? C.faint : i === idx ? C.amber : 'rgba(71,85,105,0.35)' }} />
        ))}
      </div>
    </div>
  )
}

// ───────────────────────── 중앙 시각화 ─────────────────────────

const W = 960
const H = 1000

function Panel({ children, f }: { children: ReactNode; f: number }) {
  const p = Math.max(0.35, pop(f + 3)) // 씬 전환 때 화면이 잠깐 비지 않게 35% 에서 시작
  return (
    <div
      style={{
        position: 'absolute', left: 60, top: 440, width: W, height: H,
        background: C.panel, border: `1px solid ${C.border}`, borderRadius: 24,
        boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        opacity: p, transform: `translateY(${(1 - p) * 50}px) scale(${0.95 + 0.05 * p})`,
        overflow: 'hidden',
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill={C.cyan} />
          </marker>
          <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FB7185" />
            <stop offset="1" stopColor="#BE123C" />
          </linearGradient>
        </defs>
        {children}
      </svg>
    </div>
  )
}

function Chip({ x, y, w, h = 64, text, color, p, fill }: { x: number; y: number; w: number; h?: number; text: string; color: string; p: number; fill?: boolean }) {
  return (
    <g opacity={p} transform={`translate(${x + (w / 2) * (1 - p)} ${y}) scale(${p} 1)`}>
      <rect width={w} height={h} rx={h / 2} fill={fill ? color : 'rgba(2,6,23,0.6)'} stroke={color} strokeWidth={2} />
      <text x={w / 2} y={h / 2 + 11} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={fill ? C.bg : color}>{text}</text>
    </g>
  )
}

// Scene 1 — 9,000 돌파 뒤 5,000 붕괴 캔들
const CLOSES = [6000, 6250, 6150, 6500, 6800, 6700, 7100, 7450, 7300, 7800, 8200, 8100, 8600, 9050, 8500, 7800, 7900, 7100, 6300, 6500, 5600, 4980]
function KospiBoard({ f, len }: { f: number; len: number }) {
  const top = 330, bottom = 930, lo = 4500, hi = 9500
  const y = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top)
  const step = 36
  const x0 = 70
  const reveal = (len * 0.62) / CLOSES.length
  const shown = Math.min(CLOSES.length, Math.max(0, (f - 8) / reveal))
  const k = Math.max(0, Math.min(CLOSES.length - 1, Math.floor(shown)))
  const prevC = CLOSES[Math.max(0, k - 1)]
  const live = k === 0 ? CLOSES[0] : interpolate(shown - k, [0, 1], [prevC, CLOSES[k]], clamp)
  const peakI = CLOSES.indexOf(Math.max(...CLOSES))
  const crashP = ease(shown, peakI + 1, CLOSES.length)
  const done = shown >= CLOSES.length - 0.2
  const badge = pop(f, 8 + reveal * CLOSES.length)
  return (
    <g>
      <text x={48} y={84} fontFamily={MONO} fontWeight={700} fontSize={30} fill={C.dim}>KOSPI · INDEX</text>
      <text x={48} y={196} fontFamily={MONO} fontWeight={800} fontSize={118} fill={k > peakI ? C.red : C.text}>{fmt(done ? 5000 : live)}</text>
      <g opacity={badge} transform={`translate(${600 + 300 * (1 - badge)} 120)`}>
        <rect width={300} height={84} rx={14} fill={C.red} />
        <text x={150} y={58} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={50} fill="#fff">-44.4%</text>
      </g>
      <text x={48} y={256} fontFamily={MONO} fontWeight={500} fontSize={28} fill={C.dim}>9,000 → 5,000 붕괴</text>
      {[5000, 7000, 9000].map(v => (
        <g key={v}>
          <line x1={60} x2={900} y1={y(v)} y2={y(v)} stroke={v === 5000 ? C.red : C.border} strokeWidth={v === 5000 ? 2 : 1} strokeDasharray={v === 5000 ? '10 10' : '4 8'} />
          <text x={910} y={y(v) + 9} fontFamily={MONO} fontSize={24} fill={v === 5000 ? C.red : C.faint}>{v / 1000}K</text>
        </g>
      ))}
      {CLOSES.map((c, i) => {
        const o = i === 0 ? c - 180 : CLOSES[i - 1]
        const r = (n: string) => random(`k${i}${n}`) * 160
        const h1 = Math.max(o, c) + 60 + r('h')
        const l1 = Math.min(o, c) - 60 - r('l')
        const p = spring({ frame: f - 8 - i * reveal, fps: FPS, config: { damping: 14, stiffness: 200 } })
        if (p <= 0.001) return null
        const up = c >= o
        const col = up ? C.green : C.red
        const cx = x0 + i * step + step / 2
        const yo = y(o), yc = y(c)
        const bodyTop = Math.min(yo, yc)
        const bodyH = Math.max(4, Math.abs(yc - yo)) * p
        return (
          <g key={i} opacity={Math.min(1, p * 1.5)}>
            <line x1={cx} x2={cx} y1={y(h1)} y2={y(l1)} stroke={col} strokeWidth={3} />
            <rect x={cx - 12} y={up ? yc + (Math.abs(yc - yo) - bodyH) : bodyTop} width={24} height={bodyH} fill={col} rx={2} />
          </g>
        )
      })}
      {crashP > 0 && (
        <line
          x1={x0 + peakI * step + step / 2} y1={y(9300)}
          x2={x0 + peakI * step + step / 2 + (CLOSES.length - 1 - peakI) * step * crashP} y2={y(9300) + (y(4800) - y(9300)) * crashP}
          stroke={C.red} strokeWidth={4} strokeDasharray="14 10"
        />
      )}
      <text x={48} y={980} fontFamily={MONO} fontSize={22} fill={C.faint}>* 가상 시뮬레이션 지수</text>
    </g>
  )
}

// Scene 2 — 연준 월러 · +50bp · 기대 게이지
function FedBoard({ f, len }: { f: number; len: number }) {
  const big = pop(f, 10)
  const g1 = ease(f, len * 0.35, len * 0.6)
  const g2 = ease(f, len * 0.5, len * 0.85)
  const gauge = (y: number, label: string, from: number, to: number, p: number, color: string, arrow: string) => {
    const w = 820 * (from + (to - from) * p)
    return (
      <g transform={`translate(70 ${y})`} opacity={ease(f, len * 0.3, len * 0.4)}>
        <text x={0} y={0} fontFamily={SANS} fontWeight={700} fontSize={34} fill={C.text}>{label}</text>
        <text x={820} y={0} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={34} fill={color}>{arrow}</text>
        <rect x={0} y={22} width={820} height={30} rx={15} fill="rgba(71,85,105,0.35)" />
        <rect x={0} y={22} width={w} height={30} rx={15} fill={color} />
      </g>
    )
  }
  return (
    <g>
      <Chip x={60} y={50} w={260} text="FED SPEAKER" color={C.cyan} p={pop(f, 4)} />
      <text x={60} y={186} fontFamily={SANS} fontWeight={800} fontSize={54} fill="#fff" opacity={pop(f, 6)}>월러 연준 이사</text>
      <text x={60} y={236} fontFamily={SANS} fontWeight={600} fontSize={32} fill={C.dim} opacity={pop(f, 8)}>“12월 FOMC 빅스텝 인상 필요”</text>
      <g transform={`translate(480 430) scale(${0.6 + 0.4 * big})`} opacity={big}>
        <text x={0} y={0} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={190} fill={C.amber}>+50bp</text>
        <text x={0} y={70} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={36} fill={C.dim}>DEC · RATE HIKE CALL</text>
      </g>
      {gauge(640, '인플레이션 재점화 우려', 0.35, 0.9, g1, C.red, '▲ 확대')}
      {gauge(800, '시장 금리 인하 기대', 0.8, 0.12, g2, C.cyan, '▼ 소멸')}
      <text x={70} y={960} fontFamily={MONO} fontSize={22} fill={C.faint}>* 게이지는 방향성 표시</text>
    </g>
  )
}

/** n단계 인과 플로우(세로) */
function Flow({ f, len, steps, top = 50, last = C.red }: { f: number; len: number; steps: { t: string; s: string }[]; top?: number; last?: string }) {
  const boxH = 128
  const gap = 46
  const each = (len * 0.6) / steps.length
  return (
    <g>
      {steps.map((st, i) => {
        const at = 6 + i * each
        const p = pop(f, at)
        const y = top + i * (boxH + gap)
        const isLast = i === steps.length - 1
        const active = f >= at && (i === steps.length - 1 || f < at + each)
        const col = isLast ? last : C.cyan
        return (
          <g key={i}>
            {i > 0 && (
              <line x1={480} x2={480} y1={y - gap + 4} y2={y - gap + 4 + (gap - 14) * ease(f, at - 8, at)} stroke={C.cyan} strokeWidth={4} markerEnd={f >= at ? 'url(#arr)' : undefined} />
            )}
            <g opacity={p} transform={`translate(${(1 - p) * 60} 0)`}>
              <rect x={70} y={y} width={820} height={boxH} rx={18} fill={active ? 'rgba(56,189,248,0.12)' : 'rgba(2,6,23,0.55)'} stroke={active || isLast ? col : C.border} strokeWidth={active ? 3 : 2} />
              {isLast && <rect x={70} y={y} width={820} height={boxH} rx={18} fill="rgba(244,63,94,0.14)" />}
              <text x={110} y={y + 78} fontFamily={MONO} fontWeight={800} fontSize={40} fill={col}>{String(i + 1).padStart(2, '0')}</text>
              <text x={200} y={y + 62} fontFamily={SANS} fontWeight={800} fontSize={46} fill="#fff">{st.t}</text>
              <text x={200} y={y + 104} fontFamily={SANS} fontWeight={600} fontSize={28} fill={C.dim}>{st.s}</text>
            </g>
          </g>
        )
      })}
    </g>
  )
}

// Scene 3 — 안전자산 역설
function FlowBoard({ f, len }: { f: number; len: number }) {
  const tail = len * 0.62
  return (
    <g>
      <Flow f={f} len={len} steps={[
        { t: '빅스텝 공포', s: 'FED +50bp 리스크 반영' },
        { t: '유동성 경색', s: '레버리지 · 단기자금 위축' },
        { t: '마진콜 현금화', s: '증거금 부족 → 강제 매도' },
        { t: '금 · BTC 동반 투매', s: '팔 수 있는 자산부터 매도' },
      ]} />
      <Chip x={70} y={770} w={390} text="GOLD ▼ 연중 최저" color={C.red} p={pop(f, tail)} />
      <Chip x={500} y={770} w={390} text="BTC ▼ 연중 최저" color={C.red} p={pop(f, tail + 6)} />
      <g opacity={pop(f, tail + 16)} transform={`translate(480 ${930}) rotate(-3) scale(${0.7 + 0.3 * pop(f, tail + 16)})`}>
        <rect x={-260} y={-56} width={520} height={92} rx={12} fill="none" stroke={C.amber} strokeWidth={5} />
        <text x={0} y={12} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={54} fill={C.amber}>CASH IS KING</text>
      </g>
    </g>
  )
}

// Scene 4 — NVDA vs NASDAQ 낙폭 비교
function AiBoard({ f, len }: { f: number; len: number }) {
  const base = 250
  const scale = 32 // 1%p = 32px — NVDA 값 라벨이 아래 경고 배지와 겹치지 않게
  const bars = [
    { k: 'NVDA', v: -14.1, x: 170, d: 14 },
    { k: 'NASDAQ', v: -5.2, x: 570, d: 26 },
  ]
  const warn = pop(f, len * 0.55)
  return (
    <g>
      <Chip x={60} y={50} w={380} text="CEO 교체 불확실성" color={C.amber} p={pop(f, 4)} />
      <text x={900} y={92} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={26} fill={C.dim}>1D CHANGE</text>
      <line x1={60} x2={900} y1={base} y2={base} stroke={C.dim} strokeWidth={2} />
      <text x={60} y={base - 14} fontFamily={MONO} fontSize={22} fill={C.faint}>0%</text>
      {bars.map(b => {
        const p = spring({ frame: f - b.d, fps: FPS, config: { damping: 18, stiffness: 90 } })
        const h = -b.v * scale * p
        return (
          <g key={b.k}>
            <rect x={b.x} y={base} width={220} height={h} rx={8} fill="url(#barRed)" />
            <text x={b.x + 110} y={base + h + 64} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={58} fill={C.red}>{(b.v * p).toFixed(1)}%</text>
            <text x={b.x + 110} y={base - 22} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={38} fill="#fff">{b.k}</text>
          </g>
        )
      })}
      <g opacity={warn} transform={`translate(70 ${880 + (1 - warn) * 30})`}>
        <rect width={820} height={92} rx={14} fill="rgba(245,158,11,0.12)" stroke={C.amber} strokeWidth={3} opacity={0.75 + 0.25 * Math.sin(f / 5)} />
        <path d="M46,68 L72,22 L98,68 Z" fill="none" stroke={C.amber} strokeWidth={4} strokeLinejoin="round" />
        <text x={72} y={62} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={28} fill={C.amber}>!</text>
        <text x={126} y={60} fontFamily={SANS} fontWeight={800} fontSize={36} fill={C.amber}>할인율 ↑ · 밸류에이션 재평가 경고</text>
      </g>
    </g>
  )
}

// Scene 5 — 국내 전이 매트릭스(2×2, ㄷ자 경로)
function KoreaBoard({ f, len }: { f: number; len: number }) {
  const cells = [
    { t: '미 금리 인상', s: 'FED +50bp 압박', x: 60, y: 60 },
    { t: '한은 동결·압박', s: '인하 카드 봉쇄', x: 500, y: 60 },
    { t: '주담대 이자 상승', s: '가계부채 상환 부담', x: 500, y: 400 },
    { t: '부동산 하방 압력', s: '영끌 매물 · 가격 조정', x: 60, y: 400 },
  ]
  const cw = 400, ch = 280
  const each = (len * 0.55) / cells.length
  const links = [
    `M${60 + cw + 6},${60 + ch / 2} L${500 - 10},${60 + ch / 2}`,
    `M${500 + cw / 2},${60 + ch + 6} L${500 + cw / 2},${400 - 10}`,
    `M${500 - 6},${400 + ch / 2} L${60 + cw + 10},${400 + ch / 2}`,
  ]
  const strat = pop(f, len * 0.62)
  return (
    <g>
      {cells.map((c, i) => {
        const at = 6 + i * each
        const p = pop(f, at)
        const last = i === cells.length - 1
        const col = last ? C.red : C.cyan
        return (
          <g key={i}>
            {i > 0 && (
              <path d={links[i - 1]} stroke={C.cyan} strokeWidth={4} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(f, at - 8, at)} markerEnd={f >= at ? 'url(#arr)' : undefined} />
            )}
            <g opacity={p} transform={`translate(${c.x + (cw / 2) * (1 - p)} ${c.y + (ch / 2) * (1 - p)}) scale(${p})`}>
              <rect width={cw} height={ch} rx={20} fill={last ? 'rgba(244,63,94,0.14)' : 'rgba(2,6,23,0.55)'} stroke={col} strokeWidth={3} />
              <text x={30} y={66} fontFamily={MONO} fontWeight={800} fontSize={38} fill={col}>{String(i + 1).padStart(2, '0')}</text>
              <text x={30} y={160} fontFamily={SANS} fontWeight={800} fontSize={44} fill="#fff">{c.t}</text>
              <text x={30} y={214} fontFamily={SANS} fontWeight={600} fontSize={28} fill={C.dim}>{c.s}</text>
            </g>
          </g>
        )
      })}
      <g opacity={strat} transform={`translate(60 ${760 + (1 - strat) * 30})`}>
        <rect width={840} height={150} rx={20} fill="rgba(245,158,11,0.10)" stroke={C.amber} strokeWidth={3} />
        <text x={36} y={56} fontFamily={MONO} fontWeight={800} fontSize={28} fill={C.amber}>STRATEGY</text>
        <text x={36} y={118} fontFamily={SANS} fontWeight={800} fontSize={48} fill="#fff">수익률보다 <tspan fill={C.amber}>현금 비중 관리</tspan></text>
      </g>
    </g>
  )
}

function Board({ kind, f, len }: { kind: string; f: number; len: number }) {
  if (kind === 'kospi') return <KospiBoard f={f} len={len} />
  if (kind === 'fed') return <FedBoard f={f} len={len} />
  if (kind === 'flow') return <FlowBoard f={f} len={len} />
  if (kind === 'ai') return <AiBoard f={f} len={len} />
  if (kind === 'korea') return <KoreaBoard f={f} len={len} />
  return null
}

// ───────────────────────── 자막 ─────────────────────────

/** 문장 → 2줄(≈34자) 이내 조각 */
function chunks(text: string, max = 32) {
  const out: string[] = []
  for (const s of text.split(/(?<=[.?!])\s+/)) {
    if (s.length <= max) { out.push(s); continue }
    let cur = ''
    for (const w of s.split(/(?<=,)\s+/)) {
      if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w } else cur = cur ? `${cur} ${w}` : w
    }
    if (cur.length <= max) { out.push(cur); continue }
    // 쉼표가 없는 긴 조각은 가운데 가까운 띄어쓰기에서 자른다
    const mid = cur.length / 2
    let cut = -1
    for (let i = 0; i < cur.length; i++) if (cur[i] === ' ' && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i
    out.push(cur.slice(0, cut), cur.slice(cut + 1))
  }
  return out
}

function Highlighted({ text, line }: { text: string; line: Line }) {
  const terms = [...line.cyan.map(t => ({ t, c: C.cyan })), ...line.amber.map(t => ({ t, c: C.amber }))].sort((a, b) => b.t.length - a.t.length)
  const re = new RegExp(`(${terms.map(x => x.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  return (
    <>
      {text.split(re).map((part, i) => {
        const hit = terms.find(x => x.t === part)
        return <span key={i} style={hit ? { color: hit.c } : undefined}>{part}</span>
      })}
    </>
  )
}

function Subtitle({ line, f, dur }: { line: Line; f: number; dur: number }) {
  const parts = chunks(line.text)
  const w = parts.map(p => p.replace(/\s/g, '').length)
  const sum = w.reduce((a, b) => a + b, 0)
  let acc = 0
  let idx = parts.length - 1
  let startOf = ((sum - w[w.length - 1]) / sum) * dur
  for (let i = 0; i < parts.length; i++) {
    const end = acc + w[i]
    if (f < (end / sum) * dur) { idx = i; startOf = (acc / sum) * dur; break }
    acc = end
  }
  const p = ease(f - startOf, 0, 6)
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1520, height: 230, background: 'rgba(2,6,23,0.72)', borderTop: `2px solid rgba(56,189,248,0.45)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 70px' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: C.cyan }} />
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, lineHeight: 1.38, color: '#F8FAFC', textAlign: 'center', wordBreak: 'keep-all', opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>
        <Highlighted text={parts[idx]} line={line} />
      </div>
    </div>
  )
}

// ───────────────────────── 본편 ─────────────────────────

const GLOW: Record<string, [number, number]> = { kospi: [1, 0], fed: [0, 1], flow: [1, 0.2], ai: [1, 0], korea: [0.2, 1] }

export function ProAnalystBriefing() {
  useFonts()
  const frame = useCurrentFrame()
  const { scenes, outroAt, total } = proAnalystLayout()
  const outro = frame >= outroAt
  let cur = 0
  for (let i = 0; i < scenes.length; i++) if (frame >= scenes[i].from) cur = i
  const s = scenes[cur]
  const sf = frame - s.from
  const len = (scenes[cur + 1]?.from ?? outroAt) - s.from
  const talking = frame >= s.voiceAt && frame < s.voiceAt + s.dur

  // 곰 림라이트 — 씬이 바뀌면 20프레임 동안 이전 색에서 새 색으로
  const prevG = cur > 0 ? GLOW[scenes[cur - 1].line.board] : [0, 0]
  const nowG = outro ? [0, 0] : GLOW[s.line.board] ?? [0, 0]
  const t = outro ? ease(frame - outroAt, 0, 20) : ease(sf, 0, 20)
  const fromG = outro ? GLOW[scenes[scenes.length - 1].line.board] : prevG
  const red = fromG[0] + (nowG[0] - fromG[0]) * t
  const blue = fromG[1] + (nowG[1] - fromG[1]) * t
  const fade = interpolate(frame, [total - 10, total], [1, 0], clamp)

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade }}>
      <Backdrop frame={frame} red={red} blue={blue} />
      <Header frame={frame} />
      {!outro && <SceneTitle key={cur} idx={cur} line={s.line} f={sf} />}
      {!outro && (
        <Panel key={`p${cur}`} f={sf}>
          <Board kind={s.line.board} f={sf} len={len} />
        </Panel>
      )}
      {!outro && talking && <Subtitle line={s.line} f={frame - s.voiceAt} dur={s.dur} />}
      {outro && <Outro f={frame - outroAt} />}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.faint }}>
        가상 시황 시뮬레이션 · 투자 권유 아님
      </div>
      {scenes.map((sc, i) => (
        <Sequence key={i} from={sc.voiceAt} durationInFrames={sc.dur} layout="none">
          <Audio src={staticFile(sc.clip.file)} startFrom={Math.round(sc.clip.start * FPS)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}

function Outro({ f }: { f: number }) {
  const p = pop(f, 4)
  const q = pop(f, 18)
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 640, textAlign: 'center' }}>
      <div style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.cyan, letterSpacing: 4 }}>KEY TAKEAWAY</div>
        <div style={{ marginTop: 24, fontFamily: SANS, fontWeight: 800, fontSize: 68, lineHeight: 1.3, color: '#fff' }}>
          유동성이 마르면<br />
          <span style={{ color: C.amber }}>안전자산도 현금화 대상</span>
        </div>
      </div>
      <div style={{ marginTop: 90, opacity: q, padding: '30px 36px', border: `1px solid ${C.border}`, borderRadius: 18, background: 'rgba(2,6,23,0.6)', fontFamily: SANS, fontWeight: 700, fontSize: 34, lineHeight: 1.5, color: C.text, wordBreak: 'keep-all' }}>
        ※ 본 영상은 이해를 돕기 위한<br />가상 시황 시뮬레이션 해설입니다.
      </div>
    </div>
  )
}
