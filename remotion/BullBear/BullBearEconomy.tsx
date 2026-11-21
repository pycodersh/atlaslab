/**
 * 황소 · 곰 경제 쇼츠 — "왜 다 같이 무너졌나?" (1080×1920, 30fps, 오디오 길이에 맞춰 ≈57초)
 *
 * 대본      remotion/BullBear/lines.json (text=자막, say=TTS 발음, hl=노란 강조어, board=상단 도식)
 * 음성      scripts/bullbear/generate-voice.py → public/audio/bull-bear/NN.mp3 + audio.generated.json
 * 캐릭터    scripts/bullbear/cut-3d.py → public/images/characters/{bear,bull}.png (3D 클레이, 포즈 1개씩)
 * 렌더      npm run render:bullbear → out/remotion/bull-bear-economy-crash.mp4
 *
 * 씬 길이는 음성 길이(앞뒤 무음 제외)에서 계산한다 — 대사를 고치고 음성을 다시 만들면 타이밍이 따라온다.
 */
import { useEffect, useState, type ReactNode } from 'react'
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import AUDIO from './audio.generated.json'
import LINES from './lines.json'

type Who = 'bull' | 'bear'
type Mood = 'shocked' | 'explain' | 'curious' | 'panic' | 'worried' | 'calm'
type Line = { who: Who; mood: Mood; text: string; say?: string; hl: string[]; board: string }
type Clip = { file: string; total: number; start: number; end: number }

const FPS = 30
const INTRO = 15 // 첫 대사 전 — 제목·도식이 먼저 들어온다
const GAP = 9 // 대사 사이 숨
const OUTRO = 75 // 한 줄 정리 엔드카드

const C = {
  bg: '#F7F5F2',
  ink: '#2B2622',
  soft: '#8A817A',
  red: '#E03131',
  redSoft: '#FFE3E3',
  blue: '#1C7ED6',
  yellow: '#FFD43B',
  yellowSoft: '#FFF3BF',
  line: '#E6E0D8',
}
// Gaegu 는 폰 화면에서 획이 너무 가늘었다(1차 렌더) → 도식 글씨도 굵은 손글씨체 Jua 로
const HAND = "'Jua', 'Gaegu', 'Malgun Gothic', sans-serif"
const BOLD = "'Jua', 'Gaegu', 'Malgun Gothic', sans-serif"

const lines = LINES as Line[]
const clips = AUDIO as Clip[]

/** 씬별 시작 프레임 · 음성 길이 — 첫 씬 화면은 0 부터, 음성은 INTRO 부터 */
export function bullBearLayout() {
  let at = INTRO
  const scenes = lines.map((line, i) => {
    const clip = clips[i]
    const dur = Math.ceil((clip.end - clip.start) * FPS) + 2
    const s = { line, clip, voiceAt: at, dur, from: i === 0 ? 0 : at }
    at += dur + GAP
    return s
  })
  return { scenes, outroAt: at, total: at + OUTRO }
}

export const BULL_BEAR = { width: 1080, height: 1920, fps: FPS, durationInFrames: bullBearLayout().total }

const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Jua&display=swap'
function useFonts() {
  const [handle] = useState(() => delayRender('bullbear fonts'))
  useEffect(() => {
    let done = false
    const finish = () => { if (!done) { done = true; continueRender(handle) } }
    let link = document.querySelector<HTMLLinkElement>('link[href*="Gaegu"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = FONT_CSS
      document.head.appendChild(link)
    }
    const sheet = link.sheet ? Promise.resolve() : new Promise<void>(r => { link!.addEventListener('load', () => r()); link!.addEventListener('error', () => r()) })
    sheet
      .then(() => Promise.all([
        document.fonts.load('700 60px "Gaegu"', '가나다KOSPI'),
        document.fonts.load('400 60px "Gaegu"', '가나다'),
        document.fonts.load('400 60px "Jua"', '가나다0123'),
      ]))
      .then(finish, finish)
    const t = setTimeout(finish, 5000)
    return () => clearTimeout(t)
  }, [handle])
}

// ───────────────────────── 연필 드로잉 도구 ─────────────────────────

/** 손으로 그은 듯 살짝 흔들리는 사각형(두 번 겹쳐 긋는다) */
function roughRect(x: number, y: number, w: number, h: number, seed: string, pass = 0) {
  const j = (k: string) => (random(`${seed}-${pass}-${k}`) - 0.5) * 7
  return `M${x + j('a')},${y + j('b')} L${x + w + j('c')},${y + j('d')} L${x + w + j('e')},${y + h + j('f')} L${x + j('g')},${y + h + j('h')} Z`
}

function PencilDefs() {
  return (
    <defs>
      <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="3.2" />
      </filter>
      <marker id="head" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10" fill="none" stroke={C.ink} strokeWidth="1.6" />
      </marker>
      <marker id="headRed" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10" fill="none" stroke={C.red} strokeWidth="1.8" />
      </marker>
    </defs>
  )
}

/** pathLength=1 로 0→1 그려지는 선 */
function Draw({ d, p, color = C.ink, width = 5, dash, marker }: { d: string; p: number; color?: string; width?: number; dash?: boolean; marker?: string }) {
  const v = Math.max(0, Math.min(1, p))
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dash ? undefined : '1 1'}
      strokeDashoffset={dash ? undefined : 1 - v}
      opacity={dash ? v : 1}
      style={dash ? { strokeDasharray: '10 12' } : undefined}
      markerEnd={marker && v > 0.97 ? `url(#${marker})` : undefined}
    />
  )
}

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

/** 인과관계 사슬 — 노드가 차례로 그려지고 사이 화살표가 이어진다 */
function Chain({ nodes, f, len, top = 150 }: { nodes: { t: string; tone?: 'ink' | 'red' | 'yellow'; sub?: string }[]; f: number; len: number; top?: number }) {
  const n = nodes.length
  const boxH = n >= 5 ? 80 : n === 4 ? 104 : 108
  const arrow = n >= 5 ? 32 : 36
  const step = (len * 0.72) / n
  return (
    <g>
      {nodes.map((node, i) => {
        const at = i * step
        const p = ease(f, at, at + 12)
        const y = top + i * (boxH + arrow)
        const fill = node.tone === 'red' ? C.redSoft : node.tone === 'yellow' ? C.yellowSoft : '#FFFFFF'
        const stroke = node.tone === 'red' ? C.red : C.ink
        return (
          <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 14})`}>
            {i > 0 && <Draw d={`M480,${y - arrow + 4} L480,${y - 6}`} p={ease(f, at - 6, at + 2)} marker="head" width={5} />}
            <path d={roughRect(110, y, 740, boxH, `n${i}${node.t}`)} fill={fill} stroke={stroke} strokeWidth={4.5} filter="url(#pencil)" />
            <path d={roughRect(110, y, 740, boxH, `n${i}${node.t}`, 1)} fill="none" stroke={stroke} strokeWidth={2} opacity={0.5} filter="url(#pencil)" />
            <text x={480} y={y + boxH / 2 + (node.sub ? -2 : 16)} textAnchor="middle" fontFamily={HAND} fontSize={n >= 5 ? 46 : 52} fill={node.tone === 'red' ? C.red : C.ink}>
              {node.t}
            </text>
            {node.sub && (
              <text x={480} y={y + boxH / 2 + 32} textAnchor="middle" fontFamily={HAND} fontSize={28} fill={C.soft}>
                {node.sub}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

function Title({ children, color = C.ink, y = 92, size = 62 }: { children: ReactNode; color?: string; y?: number; size?: number }) {
  return (
    <text x={480} y={y} textAnchor="middle" fontFamily={BOLD} fontSize={size} fill={color}>
      {children}
    </text>
  )
}

/** 빨간 하락 도장 */
function Stamp({ x, y, text, p, size = 120, rot = -6 }: { x: number; y: number; text: string; p: number; size?: number; rot?: number }) {
  const s = interpolate(p, [0, 0.6, 1], [2.2, 0.92, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={Math.min(1, p * 2)}>
      <text x={0} y={size * 0.35} textAnchor="middle" fontFamily={BOLD} fontSize={size} fill={C.red}>
        {text}
      </text>
    </g>
  )
}

// ───────────────────────── 씬별 상단 도식 ─────────────────────────

function Board({ kind, f, len }: { kind: string; f: number; len: number }) {
  const draw = (a: number, b: number) => ease(f, a, b)
  switch (kind) {
    case 'kospi': {
      // 9,000 돌파 뒤 5,000 선 아래로 꺾이는 KOSPI
      const pts = [[90, 560], [200, 480], [300, 400], [390, 290], [470, 210], [540, 280], [610, 360], [690, 480], [760, 530], [850, 615]]
      const d = 'M' + pts.map(p => p.join(',')).join(' L')
      const p = draw(10, len * 0.6)
      return (
        <g>
          <Title>KOSPI</Title>
          <Draw d="M70,640 L900,640" p={draw(0, 10)} width={4} color={C.soft} />
          <Draw d="M70,560 L900,560" p={draw(4, 20)} dash color={C.red} width={3} />
          <text x={110} y={604} fontFamily={HAND} fontSize={34} fill={C.red} opacity={draw(8, 20)}>5,000선</text>
          <Draw d={d} p={p} width={8} color={C.ink} />
          <g opacity={draw(len * 0.25, len * 0.32)}>
            <circle cx={470} cy={210} r={12} fill={C.ink} />
            <text x={470} y={182} textAnchor="middle" fontFamily={BOLD} fontSize={48} fill={C.ink}>9,000 돌파</text>
          </g>
          <Stamp x={790} y={315} text="5,000 붕괴" p={draw(len * 0.55, len * 0.7)} size={66} />
        </g>
      )
    }
    case 'trigger':
      return (
        <g>
          <Title color={C.red}>US Fed 월러 이사</Title>
          <Chain f={f} len={len} nodes={[{ t: '“12월 빅스텝 인상”', tone: 'yellow', sub: '인플레이션 재점화 우려' }, { t: '돈줄 조이기 신호', sub: '금리 0.5%p가 문제가 아니다' }, { t: '유동성 축소 공포', tone: 'red' }]} />
        </g>
      )
    case 'safe':
      return (
        <g>
          <Title>안전자산이면 괜찮다?</Title>
          {[{ x: 250, t: '금', c: '#F2B705' }, { x: 710, t: '비트코인', c: '#F7931A' }].map((a, i) => {
            const p = draw(6 + i * 10, 22 + i * 10)
            return (
              <g key={a.t} opacity={p}>
                <path d={roughRect(a.x - 190, 170, 380, 330, a.t)} fill="#fff" stroke={C.ink} strokeWidth={4.5} filter="url(#pencil)" />
                <circle cx={a.x} cy={290} r={78} fill={a.c} opacity={0.85} filter="url(#pencil)" />
                <text x={a.x} y={308} textAnchor="middle" fontFamily={BOLD} fontSize={a.t.length > 2 ? 40 : 64} fill="#fff">{a.t}</text>
                <Draw d={`M${a.x - 110},400 L${a.x - 40},440 L${a.x + 10},415 L${a.x + 110},470`} p={draw(20 + i * 10, 40 + i * 10)} color={C.red} width={8} marker="headRed" />
              </g>
            )
          })}
          <Stamp x={480} y={590} text="연중 최저가" p={draw(len * 0.45, len * 0.62)} size={86} rot={-3} />
        </g>
      )
    case 'margin':
      return (
        <g>
          <Title>왜 금까지 팔렸나</Title>
          <Chain f={f} len={len} top={130} nodes={[{ t: '빅스텝 공포' }, { t: '유동성 경색 · 돈이 마른다' }, { t: '마진콜 · 빚투 증거금 부족', tone: 'yellow' }, { t: '현금 확보 투매', tone: 'red' }, { t: '금 · 코인까지 동반 하락', tone: 'red' }]} />
        </g>
      )
    case 'nvda':
      return (
        <g>
          <Title>밤사이 미국 증시</Title>
          <g opacity={draw(4, 14)}>
            <path d={roughRect(250, 140, 460, 74, 'ceo')} fill={C.yellowSoft} stroke={C.ink} strokeWidth={4} filter="url(#pencil)" />
            <text x={480} y={192} textAnchor="middle" fontFamily={HAND} fontSize={46} fill={C.ink}>엔비디아 새 CEO 임명</text>
          </g>
          <Stamp x={480} y={330} text="NVIDIA −14%" p={draw(10, 26)} size={116} rot={-4} />
          <Stamp x={480} y={510} text="NASDAQ −5%" p={draw(len * 0.45, len * 0.6)} size={96} rot={3} />
        </g>
      )
    case 'valuation':
      return (
        <g>
          <Title>AI 주도주가 무너진 구조</Title>
          <g opacity={draw(4, 16)}>
            <text x={480} y={200} textAnchor="middle" fontFamily={HAND} fontSize={50} fill={C.ink}>오늘 가치 = 미래 이익 ÷ 금리</text>
            <Draw d="M320,222 L640,222" p={draw(10, 24)} color={C.yellow} width={14} />
          </g>
          <g transform="translate(0 60)">
            <Chain f={Math.max(0, f - 18)} len={len - 18} top={200} nodes={[{ t: '금리 ↑ → 미래 이익 할인 ↑' }, { t: '+ CEO 교체 불확실성', tone: 'yellow' }, { t: '시장 버팀목 붕괴', tone: 'red', sub: 'AI 밸류에이션 재평가' }]} />
          </g>
        </g>
      )
    case 'house-q':
      return (
        <g>
          <text x={240} y={330} textAnchor="middle" fontFamily={BOLD} fontSize={92} fill={C.blue} opacity={draw(2, 12)}>美 금리</text>
          <text x={730} y={330} textAnchor="middle" fontFamily={BOLD} fontSize={92} fill={C.ink} opacity={draw(10, 20)}>우리 집값</text>
          <Draw d="M410,300 C470,240 500,240 560,300" p={draw(14, 30)} dash width={5} color={C.soft} />
          <text x={485} y={500} textAnchor="middle" fontFamily={BOLD} fontSize={180} fill={C.red} opacity={draw(24, 34)}>?</text>
        </g>
      )
    case 'housing':
      return (
        <g>
          <Title color={C.red}>국내 부동산 전이 경로</Title>
          <Chain f={f} len={len} top={140} nodes={[{ t: '美 빅스텝 압박' }, { t: '한은 금리 인하 봉쇄', sub: '내리면 환율 급등 · 자본 유출' }, { t: '변동금리 주담대 이자 ↑', tone: 'yellow' }, { t: '영끌 급매 · 집값 하락 위험', tone: 'red' }]} />
        </g>
      )
    case 'summary':
      return (
        <g>
          <Title>지금 먼저 볼 것</Title>
          <text x={480} y={300} textAnchor="middle" fontFamily={BOLD} fontSize={92} fill={C.soft} opacity={draw(4, 14)}>수익률</text>
          <text x={480} y={420} textAnchor="middle" fontFamily={BOLD} fontSize={92} fill={C.ink} opacity={draw(12, 22)}>{'<'}</text>
          <text x={480} y={560} textAnchor="middle" fontFamily={BOLD} fontSize={118} fill={C.red} opacity={draw(18, 28)}>현금 흐름</text>
          <Draw d="M250,590 C380,610 600,600 720,585" p={draw(26, 44)} color={C.yellow} width={16} />
        </g>
      )
    default:
      return null
  }
}

// ───────────────────────── 캐릭터 ─────────────────────────

const CHAR = {
  bear: { src: 'images/characters/bear.png', w: 464, h: 654, x: 70, label: '곰 · 거시 애널리스트' },
  bull: { src: 'images/characters/bull.png', w: 566, h: 692, x: 560, label: '황소 · 낙관론자' },
} as const
const CHAR_H = 500
const CHAR_BOTTOM = 1545

function MoodMark({ mood, f, side }: { mood: Mood; f: number; side: 'l' | 'r' }) {
  const p = spring({ frame: f, fps: FPS, config: { damping: 12 } })
  const x = side === 'l' ? 10 : 330
  const wob = Math.sin(f / 5) * 6
  if (mood === 'shocked')
    return (
      <svg width={160} height={180} style={{ position: 'absolute', left: x, top: 40 + wob, transform: `scale(${p * 0.8})` }}>
        <path d="M80,20 C110,70 125,95 110,125 C95,150 60,148 52,120 C45,95 60,70 80,20 Z" fill="#74C0FC" stroke={C.ink} strokeWidth={4} filter="url(#pencil)" />
      </svg>
    )
  if (mood === 'curious')
    return (
      <div style={{ position: 'absolute', left: x + 20, top: -40 + wob, fontFamily: BOLD, fontSize: 150, color: C.blue, transform: `scale(${p}) rotate(10deg)` }}>?</div>
    )
  if (mood === 'panic')
    return (
      <div style={{ position: 'absolute', left: x + 40, top: -10 + wob, fontFamily: BOLD, fontSize: 120, color: C.red, transform: `scale(${p}) rotate(-8deg)` }}>!!</div>
    )
  if (mood === 'worried')
    return (
      <svg width={200} height={140} style={{ position: 'absolute', left: x - 20, top: -30 + wob, transform: `scale(${p})` }}>
        <path d="M20,90 C10,50 60,30 80,50 C95,15 150,20 155,55 C190,55 190,100 160,105 L40,108 C25,108 18,100 20,90 Z" fill="#DEE2E6" stroke={C.ink} strokeWidth={4} filter="url(#pencil)" />
        <path d="M60,75 C80,60 100,90 120,72 C135,60 150,80 150,80" fill="none" stroke={C.ink} strokeWidth={3} />
      </svg>
    )
  return null
}

function Character({ who, active, talking, mood, f, sceneF }: { who: Who; active: boolean; talking: boolean; mood: Mood; f: number; sceneF: number }) {
  const c = CHAR[who]
  const w = (c.w / c.h) * CHAR_H
  const bob = talking ? -Math.abs(Math.sin((f / FPS) * Math.PI * 2.6)) * 12 : Math.sin(f / 22) * 3
  const shake = active && (mood === 'shocked' || mood === 'panic') && sceneF < 18 ? Math.sin(sceneF * 2.4) * 10 * (1 - sceneF / 18) : 0
  const scale = active ? 1.06 : 0.92
  return (
    <div
      style={{
        position: 'absolute',
        left: c.x,
        top: CHAR_BOTTOM - CHAR_H,
        width: Math.max(w, 460),
        height: CHAR_H,
        transform: `translate(${shake}px, ${bob}px) scale(${scale})`,
        transformOrigin: '50% 100%',
        opacity: active ? 1 : 0.55,
        filter: active ? 'none' : 'saturate(0.5)',
      }}
    >
      <div style={{ position: 'absolute', left: (Math.max(w, 460) - w) / 2 - 10, bottom: -18, width: w + 20, height: 40, borderRadius: '50%', background: 'rgba(60,40,20,0.12)' }} />
      <Img src={staticFile(c.src)} style={{ position: 'absolute', left: (Math.max(w, 460) - w) / 2, bottom: 0, width: w, height: CHAR_H }} />
      {active && <MoodMark mood={mood} f={sceneF} side={who === 'bear' ? 'l' : 'r'} />}
    </div>
  )
}

// ───────────────────────── 자막 ─────────────────────────

function chunks(text: string) {
  const out: string[] = []
  for (const s of text.split(/(?<=[.?!])\s+/)) {
    if (s.length <= 24) { out.push(s); continue }
    const parts = s.split(/(?<=,)\s+/)
    let cur = ''
    for (const p of parts) {
      if (cur && (cur + ' ' + p).length > 26) { out.push(cur); cur = p } else cur = cur ? cur + ' ' + p : p
    }
    if (cur) out.push(cur)
  }
  return out
}

function Highlighted({ text, hl }: { text: string; hl: string[] }) {
  const terms = hl.filter(Boolean).sort((a, b) => b.length - a.length)
  if (!terms.length) return <>{text}</>
  const re = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  return (
    <>
      {text.split(re).map((part, i) => (terms.includes(part) ? <span key={i} style={{ color: C.yellow }}>{part}</span> : <span key={i}>{part}</span>))}
    </>
  )
}

function Subtitle({ line, f, dur }: { line: Line; f: number; dur: number }) {
  const parts = chunks(line.text)
  const weights = parts.map(p => p.replace(/\s/g, '').length)
  const sum = weights.reduce((a, b) => a + b, 0)
  let acc = 0
  let idx = parts.length - 1
  for (let i = 0; i < parts.length; i++) {
    acc += weights[i]
    if (f < (acc / sum) * dur) { idx = i; break }
  }
  let startOf = 0
  for (let i = 0; i < idx; i++) startOf += (weights[i] / sum) * dur
  const pop = spring({ frame: f - startOf, fps: FPS, config: { damping: 14, stiffness: 180 } })
  const color = line.who === 'bull' ? '#E8590C' : '#5C3D2E'
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1585, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontFamily: BOLD, fontSize: 36, color, marginBottom: 10 }}>{line.who === 'bull' ? '황소 · 낙관론자' : '곰 · 거시 애널리스트'}</div>
      <div
        style={{
          background: 'rgba(24,20,18,0.9)',
          borderRadius: 30,
          padding: '22px 38px',
          fontFamily: BOLD,
          fontSize: 62,
          lineHeight: 1.32,
          color: '#fff',
          textAlign: 'center',
          wordBreak: 'keep-all',
          transform: `scale(${0.9 + 0.1 * pop})`,
          opacity: pop,
          maxWidth: 980,
        }}
      >
        <Highlighted text={parts[idx]} hl={line.hl} />
      </div>
    </div>
  )
}

// ───────────────────────── 배경 · 안개 ─────────────────────────

function Paper() {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={0} x2={1080} y1={80 + i * 64} y2={80 + i * 64} stroke={C.line} strokeWidth={2} opacity={0.55} />
        ))}
      </svg>
    </AbsoluteFill>
  )
}

function Fog({ f, strength }: { f: number; strength: number }) {
  const blobs = [
    { x: 100, y: 300, r: 420, s: 0.6 },
    { x: 760, y: 520, r: 480, s: -0.5 },
    { x: 380, y: 900, r: 520, s: 0.4 },
    { x: 900, y: 1200, r: 420, s: -0.7 },
  ]
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: strength }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(52,58,64,0.28), rgba(52,58,64,0.06) 70%, rgba(0,0,0,0))' }} />
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x - b.r / 2 + Math.sin(f / 40 + i) * 40 + f * b.s,
            top: b.y - b.r / 2,
            width: b.r,
            height: b.r * 0.6,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(134,142,150,0.55), rgba(134,142,150,0))',
            filter: 'blur(18px)',
          }}
        />
      ))}
    </AbsoluteFill>
  )
}

// ───────────────────────── 본편 ─────────────────────────

export function BullBearEconomy() {
  useFonts()
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const { scenes, outroAt } = bullBearLayout()
  const outro = frame >= outroAt
  let cur = 0
  for (let i = 0; i < scenes.length; i++) if (frame >= scenes[i].from) cur = i
  const s = scenes[cur]
  const next = scenes[cur + 1]
  const sceneEnd = next ? next.from : outroAt
  const sf = frame - s.from
  const len = sceneEnd - s.from
  const talking = frame >= s.voiceAt && frame < s.voiceAt + s.dur
  const boardIn = spring({ frame: sf, fps: FPS, config: { damping: 15, stiffness: 140 } })
  const fogIdx = scenes.findIndex(x => x.line.board === 'housing')
  const fog = fogIdx < 0 ? 0 : interpolate(frame, [scenes[fogIdx].from, scenes[fogIdx].from + 30, outroAt - 10, outroAt + 10], [0, 1, 1, 0.35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ fontFamily: HAND, color: C.ink, opacity: fadeOut }}>
      <Paper />
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <PencilDefs />
      </svg>

      {/* 머리말 */}
      <div style={{ position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: C.red, color: '#fff', fontFamily: BOLD, fontSize: 40, padding: '8px 26px', borderRadius: 14, transform: 'rotate(-2deg)' }}>어제오늘 경제 쇼크</div>
        <div style={{ marginTop: 14, fontFamily: BOLD, fontSize: 84, color: C.ink }}>왜 다 같이 무너졌나?</div>
      </div>

      {/* 상단 도식 */}
      <div style={{ position: 'absolute', left: 60, top: 290, width: 960, height: 720, transform: `scale(${0.94 + 0.06 * boardIn})`, opacity: boardIn }}>
        <svg width={960} height={720} viewBox="0 0 960 720">
          <PencilDefs />
          <path d={roughRect(12, 12, 936, 696, 'board')} fill="rgba(255,255,255,0.72)" stroke={C.ink} strokeWidth={5} filter="url(#pencil)" />
          <path d={roughRect(12, 12, 936, 696, 'board', 1)} fill="none" stroke={C.ink} strokeWidth={2} opacity={0.4} filter="url(#pencil)" />
          {outro ? (
            <g>
              <Title y={150} size={58}>한 줄 정리</Title>
              <text x={480} y={330} textAnchor="middle" fontFamily={BOLD} fontSize={78} fill={C.ink}>돈줄이 마르면</text>
              <text x={480} y={460} textAnchor="middle" fontFamily={BOLD} fontSize={78} fill={C.red}>안전자산도 예외 없다</text>
              <Draw d="M180,490 C360,512 600,505 780,486" p={ease(frame - outroAt, 6, 26)} color={C.yellow} width={16} />
              <text x={480} y={640} textAnchor="middle" fontFamily={HAND} fontSize={36} fill={C.soft}>투자 권유가 아닌 시장 해설입니다</text>
            </g>
          ) : (
            <Board kind={s.line.board} f={sf} len={len} />
          )}
        </svg>
      </div>

      {fog > 0 && <Fog f={frame} strength={fog} />}

      {/* 캐릭터 — 곰 왼쪽, 황소 오른쪽. 말하는 쪽이 커지고 들썩인다 */}
      {(['bear', 'bull'] as Who[]).map(who => (
        <Character
          key={who}
          who={who}
          active={outro || s.line.who === who}
          talking={!outro && talking && s.line.who === who}
          mood={outro ? 'calm' : s.line.mood}
          f={frame}
          sceneF={outro ? frame - outroAt : sf}
        />
      ))}

      {!outro && talking && <Subtitle line={s.line} f={frame - s.voiceAt} dur={s.dur} />}

      {scenes.map((sc, i) => (
        <Sequence key={i} from={sc.voiceAt} durationInFrames={sc.dur} layout="none">
          <Audio src={staticFile(sc.clip.file)} startFrom={Math.round(sc.clip.start * FPS)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
