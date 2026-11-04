/**
 * Basics 글 상단 12초 쇼트 공통 템플릿 — 글마다 videos.json 의 한 항목만 바꿔 끼운다.
 *
 *   Scene 1 Hook     (0~4s)  English 단서 → 흔한 실수 카드 2장 → 2초에 빨간 X 도장 + 경고 자막
 *   Scene 2 Contrast (4~8s)  규칙을 가르는 대조 카드 2장 · 하단 배너 펄스
 *   Scene 3 Takeaway (8~12s) 배경이 옅은 그린으로 바뀌고 실전 카드 3장 + 마무리 한 줄
 *
 * 모션 · 색 · 크기는 첫 영상('너 vs 당신')에서 그대로 옮겼다. 한국어 카드는 글자 수에 맞춰 글씨 크기만 줄인다.
 * 본문 줄의 **굵게** 는 카드 색으로 칠한다. 보이스오버는 data.audio(public 기준 경로) 한 파일이다.
 *
 * 길이: data.timing(이중 보이스 생성기가 써 넣는 장면별 [시작, 끝] 초)이 있으면 장면 길이 · 전체 길이를 그 오디오에 맞춘다
 * (14~18초 안팎). 없으면 예전처럼 4초씩 12초다 — 영어 한 목소리로 만든 33편이 이쪽이다.
 * Tailwind 가 없는 렌더 환경이라 스타일은 전부 인라인이다.
 */
import type { ReactNode } from 'react'
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

export const BASICS_VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 360,
} as const

export type Tone = 'red' | 'navy' | 'green'

export type BasicsVideoData = {
  /** public/ 기준 오디오 경로 */
  audio: string
  hook: {
    cue: { label: string; word: string }
    cards: [KoCard, KoCard]
    caption: string
  }
  contrast: {
    heading: string
    cards: [ContrastCard, ContrastCard]
    banner: { text: string; tone: Tone }
  }
  takeaway: {
    title: string
    cards: [TakeawayCard, TakeawayCard, TakeawayCard]
    slogan: string
  }
  /** [시작 초, 영어 대사] — 영어 한 목소리 12초판. scripts/generate-basics-voiceover.py 가 읽는다 */
  narration?: [number, string][]
  /** 장면 3개 × [언어, 문장] 조각 — 이중 보이스판(en 해설 + ko 원어민 발음). 생성기가 읽는다 */
  voice?: [Lang, string][][]
  /** 이중 보이스 생성기가 써 넣는다 — 장면별 [시작, 끝] 초와 전체 길이 */
  timing?: { scenes: [number, number][]; total: number }
}
type Lang = 'en' | 'ko'
type KoCard = { ko: string; rom: string }
type ContrastCard = KoCard & { tone: Tone; lines: string[] }
type TakeawayCard = { title: string; rom?: string; ex: string; exRom: string }

const SCENE = 120

const C = {
  bg: '#FAF8F5',
  bgSolution: '#ECFDF5',
  ink: '#1C1917',
  muted: '#A8A29E',
  body: '#57534E',
  rule: '#E7E5E4',
  red: '#C8102E',
  navy: '#1E3A8A',
  green: '#059669',
  card: '#FFFFFF',
} as const

const TONE: Record<Tone, string> = { red: C.red, navy: C.navy, green: C.green }
const TONE_RGB: Record<Tone, string> = { red: '200,16,46', navy: '30,58,138', green: '5,150,105' }

const FONT = "Pretendard, Inter, 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif"

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** 카드 속 한국어 글씨 크기 — 한 단어(너)는 크게, 문장은 카드 안에 들어가게 */
function koSize(text: string, sizes: [number, number, number, number]) {
  const n = [...text].length
  return n <= 2 ? sizes[0] : n <= 5 ? sizes[1] : n <= 9 ? sizes[2] : sizes[3]
}

/** '**굵게**' 만 지원하는 한 줄 마크업 */
function Rich({ text, color }: { text: string; color: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith('**') ? (
          <b key={i} style={{ color }}>
            {part.slice(2, -2)}
          </b>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

/** 장면 끝 10프레임 동안 다음 장면으로 넘어가며 사라진다 */
function useSceneFade(dur: number) {
  const f = useCurrentFrame()
  return interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp)
}

function usePop(delay: number, damping = 12) {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: f - delay, fps, config: { damping, mass: 0.8 } })
}

/**
 * 장면별 [시작 프레임, 길이]와 전체 프레임 수. timing 이 없으면 4초 × 3.
 * 장면 안 연출(2초 도장 · 슬로건 등)이 4초 기준이라 한 장면을 4초보다 짧게 두지 않는다.
 */
export function videoLayout(data: BasicsVideoData): { scenes: { from: number; dur: number }[]; total: number } {
  const fps = BASICS_VIDEO.fps
  if (!data.timing) {
    return { scenes: [0, 1, 2].map(i => ({ from: i * SCENE, dur: SCENE })), total: SCENE * 3 }
  }
  const total = Math.round(data.timing.total * fps)
  const starts = data.timing.scenes.map(([s]) => Math.round(s * fps))
  const scenes = starts.map((from, i) => {
    const end = i + 1 < starts.length ? starts[i + 1] : total
    return { from, dur: Math.max(SCENE, end - from) }
  })
  return { scenes, total: Math.max(total, scenes[2].from + scenes[2].dur) }
}

export function TemplateVideo({ data }: { data: BasicsVideoData }) {
  const { scenes } = videoLayout(data)
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT, color: C.ink }}>
      <Audio src={staticFile(data.audio)} volume={1} />
      <Sequence from={scenes[0].from} durationInFrames={scenes[0].dur} name="Hook">
        <HookScene hook={data.hook} dur={scenes[0].dur} />
      </Sequence>
      <Sequence from={scenes[1].from} durationInFrames={scenes[1].dur} name="Contrast">
        <ContrastScene contrast={data.contrast} dur={scenes[1].dur} />
      </Sequence>
      <Sequence from={scenes[2].from} durationInFrames={scenes[2].dur} name="Takeaway">
        <TakeawayScene takeaway={data.takeaway} />
      </Sequence>
    </AbsoluteFill>
  )
}

/* ───────── Scene 1: Hook ───────── */

const STAMP_AT = 60

function HookScene({ hook, dur }: { hook: BasicsVideoData['hook']; dur: number }) {
  const f = useCurrentFrame()
  const fade = useSceneFade(dur)
  const cueIn = interpolate(f, [0, 15], [0, 1], clamp)
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
        {hook.caption}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 120 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 500,
            color: C.muted,
            opacity: cueIn,
            transform: `translateY(${(1 - cueIn) * 20}px)`,
          }}
        >
          {hook.cue.label} <span style={{ color: C.ink, fontWeight: 700 }}>{hook.cue.word}</span>
        </div>

        <svg width={60} height={110} viewBox="0 0 60 110" style={{ margin: '24px 0 36px', opacity: arrow }}>
          <line x1={30} y1={0} x2={30} y2={96 * arrow} stroke={C.muted} strokeWidth={6} strokeLinecap="round" />
          <path d="M10 78 L30 100 L50 78" fill="none" stroke={C.muted} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={arrow} />
        </svg>

        <div style={{ position: 'relative', display: 'flex', gap: 64, transform: `translateX(${shake}px)` }}>
          <MistakeCard {...hook.cards[0]} scale={cardA} />
          <MistakeCard {...hook.cards[1]} scale={cardB} />
          <XMark progress={stamp} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

function MistakeCard({ ko, rom, scale }: KoCard & { scale: number }) {
  return (
    <div
      style={{
        minWidth: 420,
        maxWidth: 780,
        height: 280,
        padding: '0 56px',
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
      <div style={{ fontSize: koSize(ko, [132, 100, 76, 60]), fontWeight: 800, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{ko}</div>
      <div style={{ fontSize: 40, fontWeight: 500, color: C.muted, marginTop: 18, whiteSpace: 'nowrap' }}>({rom})</div>
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

/* ───────── Scene 2: Contrast ───────── */

function ContrastScene({ contrast, dur }: { contrast: BasicsVideoData['contrast']; dur: number }) {
  const f = useCurrentFrame()
  const fade = useSceneFade(dur)
  const a = usePop(6, 16)
  const b = usePop(20, 16)
  const banner = usePop(48, 14)
  const pulse = f > 60 ? 1 + Math.sin((f - 60) / 4.5) * 0.035 : 1
  const tone = contrast.banner.tone

  return (
    <AbsoluteFill style={{ opacity: fade, alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
      <div style={{ position: 'absolute', top: 96, fontSize: 52, fontWeight: 700, color: C.body, opacity: a }}>
        {contrast.heading}
      </div>

      <div style={{ display: 'flex', gap: 56, marginTop: -40 }}>
        <ContrastCardView {...contrast.cards[0]} progress={a} from={-1} />
        <ContrastCardView {...contrast.cards[1]} progress={b} from={1} />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 92,
          padding: '26px 64px',
          borderRadius: 999,
          background: TONE[tone],
          color: '#fff',
          fontSize: 52,
          fontWeight: 800,
          whiteSpace: 'nowrap',
          opacity: banner,
          transform: `translateY(${(1 - banner) * 60}px) scale(${pulse})`,
          boxShadow: `0 0 0 ${(pulse - 1) * 600}px rgba(${TONE_RGB[tone]},0.12), 0 20px 50px rgba(${TONE_RGB[tone]},0.30)`,
        }}
      >
        {contrast.banner.text}
      </div>
    </AbsoluteFill>
  )
}

function ContrastCardView({
  ko,
  rom,
  tone,
  lines,
  progress,
  from,
}: ContrastCard & { progress: number; from: -1 | 1 }) {
  const color = TONE[tone]
  // 한 단어(너 · 로)는 로마자를 옆에, 그보다 길면 잘리지 않게 아랫줄에 둔다
  const stacked = [...ko].length > 3
  return (
    <div
      style={{
        width: 760,
        padding: '52px 56px',
        borderRadius: 32,
        background: C.card,
        borderTop: `10px solid ${color}`,
        boxShadow: '0 24px 60px rgba(28,25,23,0.10)',
        opacity: progress,
        transform: `translateX(${(1 - progress) * 160 * from}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: koSize(ko, [108, 84, 68, 56]), fontWeight: 800, color, lineHeight: 1 }}>{ko}</span>
        {!stacked && <span style={{ fontSize: 40, color: C.muted }}>({rom})</span>}
        <span style={{ marginLeft: 'auto', fontSize: 64, color: C.muted }}>➔</span>
      </div>
      {stacked && <div style={{ fontSize: 36, color: C.muted, marginTop: 12 }}>({rom})</div>}
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18, wordBreak: 'keep-all' }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: 44, lineHeight: 1.3, color: C.body }}>
            <Rich text={l} color={color} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────── Scene 3: Takeaway ───────── */

function TakeawayScene({ takeaway }: { takeaway: BasicsVideoData['takeaway'] }) {
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
        {takeaway.title}
      </div>

      <div style={{ display: 'flex', gap: 36, marginTop: 10 }}>
        {takeaway.cards.map((c, i) => (
          <TakeawayCardView key={i} n={i + 1} {...c} delay={14 + i * 10} />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 64,
          fontSize: 58,
          fontWeight: 800,
          color: C.green,
          whiteSpace: 'nowrap',
          opacity: slogan,
          transform: `scale(${0.9 + slogan * 0.1})`,
        }}
      >
        {takeaway.slogan}
      </div>
    </AbsoluteFill>
  )
}

function TakeawayCardView({ n, title, rom, ex, exRom, delay }: TakeawayCard & { n: number; delay: number }) {
  const p = usePop(delay, 15)
  // 마지막 카드가 결론이라 초록 테두리로 띄운다
  const highlight = n === 3
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
        <div style={{ fontSize: koSize(ex, [48, 48, 48, 42]), fontWeight: 700, color: C.ink, marginTop: 8, lineHeight: 1.25 }}>{ex}</div>
        <div style={{ fontSize: 30, color: C.body, marginTop: 10, lineHeight: 1.3 }}>{exRom}</div>
      </div>
    </div>
  )
}

function Badge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div
      style={{
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
      }}
    >
      {children}
    </div>
  )
}
