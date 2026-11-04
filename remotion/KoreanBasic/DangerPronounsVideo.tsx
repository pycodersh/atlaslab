/**
 * '너 vs 당신' 12초 쇼트 — Basics 글 korean-never-say-dangsin-neo 상단 영상.
 *
 *   Scene 1 (0~4s)  English YOU → 너 · 당신 카드 → 2초에 빨간 X 도장 + 경고 자막
 *   Scene 2 (4~8s)  두 단어가 실제로 어떻게 들리는지 · 하단 경고 배너 펄스
 *   Scene 3 (8~12s) 배경이 옅은 그린으로 바뀌고 대안 카드 3장(이름+씨 · 호칭 · 생략)
 *
 * 블로그에서는 components/blog/DangerPronounsPlayer 가 <Player> 로 띄우고,
 * MP4 는 `npm run render:dangsin` (remotion/index.ts 의 DangerPronouns 컴포지션)으로 뽑는다.
 * 영어 보이스오버(0 / 3.5 / 8초에 한 줄씩)는 scripts/generate-dangsin-voiceover.py 가 12초 한 파일로 만든다.
 * Tailwind 가 없는 렌더 환경이라 스타일은 전부 인라인이다.
 */
import type { CSSProperties, ReactNode } from 'react'
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

export const DANGER_PRONOUNS = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 360,
} as const

const SCENE = 120

const C = {
  bg: '#FAF8F5',
  bgSolution: '#ECFDF5',
  ink: '#1C1917',
  muted: '#A8A29E',
  body: '#57534E',
  rule: '#E7E5E4',
  red: '#C8102E',
  redTint: '#FDECEE',
  navy: '#1E3A8A',
  green: '#059669',
  card: '#FFFFFF',
} as const

const FONT = "Pretendard, Inter, 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif"

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** 장면 끝 10프레임 동안 다음 장면으로 넘어가며 사라진다 */
function useSceneFade(dur = SCENE) {
  const f = useCurrentFrame()
  return interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp)
}

function usePop(delay: number, damping = 12) {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: f - delay, fps, config: { damping, mass: 0.8 } })
}

export function DangerPronounsVideo() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT, color: C.ink }}>
      <Audio src={staticFile('audio/korean-basic/dangsin-guide.mp3')} volume={1} />
      <Sequence durationInFrames={SCENE} name="Hook & Warning">
        <HookScene />
      </Sequence>
      <Sequence from={SCENE} durationInFrames={SCENE} name="Real Consequence">
        <ConsequenceScene />
      </Sequence>
      <Sequence from={SCENE * 2} durationInFrames={SCENE} name="Golden Solution">
        <SolutionScene />
      </Sequence>
    </AbsoluteFill>
  )
}

/* ───────── Scene 1: Hook & Warning ───────── */

const STAMP_AT = 60

function HookScene() {
  const f = useCurrentFrame()
  const fade = useSceneFade()
  const youIn = interpolate(f, [0, 15], [0, 1], clamp)
  const arrow = interpolate(f, [12, 26], [0, 1], clamp)
  const cardA = usePop(22)
  const cardB = usePop(30)
  const stamp = usePop(STAMP_AT, 9)
  // 도장이 찍히는 순간 15프레임 동안 줄어드는 진동
  const shakeT = f - STAMP_AT
  const shake = shakeT >= 0 && shakeT < 15 ? Math.sin(shakeT * 2.4) * 18 * (1 - shakeT / 15) : 0
  const warnIn = usePop(STAMP_AT + 4, 14)

  return (
    <AbsoluteFill style={{ opacity: fade, alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          position: 'absolute',
          top: 110,
          fontSize: 72,
          fontWeight: 800,
          color: C.red,
          letterSpacing: -1,
          opacity: warnIn,
          transform: `translateY(${(1 - warnIn) * -40}px)`,
        }}
      >
        ⚠️ Almost NEVER use these in Korea!
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 120 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 500,
            color: C.muted,
            opacity: youIn,
            transform: `translateY(${(1 - youIn) * 20}px)`,
          }}
        >
          English: <span style={{ color: C.ink, fontWeight: 700 }}>YOU</span>
        </div>

        <svg width={60} height={110} viewBox="0 0 60 110" style={{ margin: '24px 0 36px', opacity: arrow }}>
          <line x1={30} y1={0} x2={30} y2={96 * arrow} stroke={C.muted} strokeWidth={6} strokeLinecap="round" />
          <path d="M10 78 L30 100 L50 78" fill="none" stroke={C.muted} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={arrow} />
        </svg>

        <div style={{ position: 'relative', display: 'flex', gap: 64, transform: `translateX(${shake}px)` }}>
          <PronounCard ko="너" rom="Neo" scale={cardA} />
          <PronounCard ko="당신" rom="Dangshin" scale={cardB} />
          <XMark progress={stamp} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

function PronounCard({ ko, rom, scale }: { ko: string; rom: string; scale: number }) {
  return (
    <div
      style={{
        width: 420,
        height: 280,
        borderRadius: 32,
        background: C.card,
        border: `3px solid ${C.rule}`,
        boxShadow: '0 24px 60px rgba(28,25,23,0.10)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
        opacity: Math.min(1, scale * 1.5),
      }}
    >
      <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1 }}>{ko}</div>
      <div style={{ fontSize: 40, fontWeight: 500, color: C.muted, marginTop: 18 }}>({rom})</div>
    </div>
  )
}

/** 두 카드를 덮는 커다란 X — 크게 나타났다가 스프링으로 '찰칵' 내려앉는다 */
function XMark({ progress }: { progress: number }) {
  if (progress <= 0) return null
  const scale = interpolate(progress, [0, 1], [2.6, 1])
  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 520,
        height: 520,
        marginLeft: -260,
        marginTop: -260,
        transform: `scale(${scale}) rotate(${(1 - progress) * -12}deg)`,
        opacity: Math.min(1, progress * 2),
        filter: 'drop-shadow(0 12px 24px rgba(200,16,46,0.35))',
      }}
    >
      <path d="M14 14 L86 86 M86 14 L14 86" stroke={C.red} strokeWidth={13} strokeLinecap="round" />
    </svg>
  )
}

/* ───────── Scene 2: The Real Consequence ───────── */

function ConsequenceScene() {
  const f = useCurrentFrame()
  const fade = useSceneFade()
  const a = usePop(6, 16)
  const b = usePop(20, 16)
  const banner = usePop(48, 14)
  const pulse = f > 60 ? 1 + Math.sin((f - 60) / 4.5) * 0.035 : 1

  return (
    <AbsoluteFill style={{ opacity: fade, alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
      <div style={{ position: 'absolute', top: 96, fontSize: 52, fontWeight: 700, color: C.body, opacity: a }}>
        What Koreans actually hear
      </div>

      <div style={{ display: 'flex', gap: 56, marginTop: -40 }}>
        <ConsequenceCard
          progress={a}
          from={-1}
          ko="너"
          rom="Neo"
          lines={[
            <>Sounds <b style={{ color: C.red }}>rude</b> — like you&rsquo;re picking a fight</>,
            <>…unless you&rsquo;re best friends of the <b style={{ color: C.ink }}>SAME age</b></>,
          ]}
        />
        <ConsequenceCard
          progress={b}
          from={1}
          ko="당신"
          rom="Dangshin"
          lines={[
            <>Heard in <b style={{ color: C.red }}>drama fights</b></>,
            <>…or between old married couples <b style={{ color: C.ink }}>ONLY</b></>,
          ]}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 92,
          padding: '26px 64px',
          borderRadius: 999,
          background: C.red,
          color: '#fff',
          fontSize: 56,
          fontWeight: 800,
          opacity: banner,
          transform: `translateY(${(1 - banner) * 60}px) scale(${pulse})`,
          boxShadow: `0 0 0 ${(pulse - 1) * 600}px rgba(200,16,46,0.12), 0 20px 50px rgba(200,16,46,0.30)`,
        }}
      >
        Stranger + 당신 = Instant Fight 🥊
      </div>
    </AbsoluteFill>
  )
}

function ConsequenceCard({
  progress,
  from,
  ko,
  rom,
  lines,
}: {
  progress: number
  from: -1 | 1
  ko: string
  rom: string
  lines: ReactNode[]
}) {
  return (
    <div
      style={{
        width: 760,
        padding: '52px 56px',
        borderRadius: 32,
        background: C.card,
        borderTop: `10px solid ${C.red}`,
        boxShadow: '0 24px 60px rgba(28,25,23,0.10)',
        opacity: progress,
        transform: `translateX(${(1 - progress) * 160 * from}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
        <span style={{ fontSize: 108, fontWeight: 800, color: C.red, lineHeight: 1 }}>{ko}</span>
        <span style={{ fontSize: 40, color: C.muted }}>({rom})</span>
        <span style={{ marginLeft: 'auto', fontSize: 64, color: C.muted }}>➔</span>
      </div>
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: 44, lineHeight: 1.3, color: C.body }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────── Scene 3: The Golden Solution ───────── */

const SOLUTIONS = [
  { n: '1', title: 'Name + 씨', rom: '(ssi)', ex: '민호 씨', exRom: 'Minho-ssi' },
  { n: '2', title: 'Title / Role', rom: '', ex: '선생님 · 기사님 · 사장님', exRom: 'teacher · driver · boss' },
  { n: '3', title: 'Just Drop It!', rom: '', ex: '식사하셨어요?', exRom: '“Have [you] eaten?” — no “you” needed' },
] as const

function SolutionScene() {
  const f = useCurrentFrame()
  const bg = interpolateColors(f, [0, 18], [C.bg, C.bgSolution])
  const contentIn = interpolate(f, [0, 10], [0, 1], clamp)
  const head = usePop(4, 14)
  const slogan = usePop(70, 14)

  return (
    <AbsoluteFill style={{ backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: contentIn }}>
      <div
        style={{
          position: 'absolute',
          top: 72,
          fontSize: 76,
          fontWeight: 800,
          color: C.navy,
          letterSpacing: -1,
          opacity: head,
          transform: `translateY(${(1 - head) * -30}px)`,
        }}
      >
        The Golden Solution
      </div>

      <div style={{ display: 'flex', gap: 36, marginTop: 10 }}>
        {SOLUTIONS.map((s, i) => (
          <SolutionCard key={s.n} {...s} delay={14 + i * 10} />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 64,
          fontSize: 58,
          fontWeight: 800,
          color: C.green,
          opacity: slogan,
          transform: `scale(${0.9 + slogan * 0.1})`,
        }}
      >
        When in doubt, just omit &lsquo;YOU&rsquo; entirely! ✅
      </div>
    </AbsoluteFill>
  )
}

function SolutionCard({
  n,
  title,
  rom,
  ex,
  exRom,
  delay,
}: {
  n: string
  title: string
  rom: string
  ex: string
  exRom: string
  delay: number
}) {
  const p = usePop(delay, 15)
  const highlight = n === '3'
  return (
    <div
      style={{
        width: 540,
        height: 620,
        padding: '44px 44px',
        borderRadius: 32,
        background: C.card,
        border: `4px solid ${highlight ? C.green : 'transparent'}`,
        boxShadow: '0 24px 60px rgba(5,150,105,0.14)',
        display: 'flex',
        flexDirection: 'column',
        opacity: p,
        transform: `translateX(${(1 - p) * 240}px)`,
      }}
    >
      <Badge color={highlight ? C.green : C.navy}>{n}</Badge>
      <div style={{ marginTop: 32, fontSize: 58, fontWeight: 800, color: C.navy, lineHeight: 1.1 }}>
        {title} {rom && <span style={{ fontSize: 40, fontWeight: 500, color: C.muted }}>{rom}</span>}
      </div>
      <div style={{ marginTop: 'auto', height: 250, paddingTop: 28, borderTop: `3px dashed ${C.rule}`, wordBreak: 'keep-all' }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: C.muted, letterSpacing: 2 }}>E.G.</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: C.ink, marginTop: 8, lineHeight: 1.25 }}>{ex}</div>
        <div style={{ fontSize: 30, color: C.body, marginTop: 10, lineHeight: 1.3 }}>{exRom}</div>
      </div>
    </div>
  )
}

function Badge({ color, children }: { color: string; children: ReactNode }) {
  const s: CSSProperties = {
    width: 76,
    height: 76,
    borderRadius: 999,
    background: color,
    color: '#fff',
    fontSize: 40,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  return <div style={s}>{children}</div>
}
