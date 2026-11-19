/**
 * 「Korean Slow Read-Along」 릴스 / 쇼츠 — 1080×1920 세로, Typecast 한국어 한 목소리, 영어 해설 없음.
 *
 *   Opening  OPEN 초    타이틀 + 진행 그리드만
 *   항목 ×12  LEAD(글자 먼저) → 음성(앞뒤 무음 뺀 실제 길이) → PAUSE(따라 말하는 호흡)
 *   Ending   END 초     마무리 카드
 * 총 길이는 오디오 길이로 저절로 정해진다(배속·여백을 줄여 맞추지 않는다).
 *
 * 데이터 readalong.json, 오디오 길이 audio.generated.json(scripts/generate-slow-read-typecast.mjs).
 * 세이프 존: 위 230px(릴스 상단 바), 아래 20%(y > 1536, 캡션), 오른쪽 15%(x > 918, 버튼) 에는 아무것도 두지 않는다.
 * 렌더: npx remotion render remotion/index.ts slow-read-months out/remotion/slow-read-months.mp4
 */
import type { ReactNode } from 'react'
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { useBasicsFonts } from '../KoreanBasic/TemplateVideoV2'
import AUDIO from './audio.generated.json'
import DATA from './readalong.json'

export const SR = {
  bg: '#F7F5F2',
  card: '#FFFFFF',
  ink: '#111111',
  muted: '#6B6B6B',
  faint: '#A8A29E',
  rule: '#E5E1DC',
  coral: '#F2643D',
  coralSoft: '#FDE8E1',
} as const

const KO = "Pretendard, 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif"
const EN = `'DM Sans', ${KO}`
const SERIF = `'Playfair Display', Georgia, ${KO}`

export const SLOW_READ_VIDEO = { width: 1080, height: 1920, fps: 30 } as const
const FPS = SLOW_READ_VIDEO.fps
const OPEN = 1.2 // 타이틀만 보이는 시간
const LEAD = 0.25 // 카드가 바뀌고 음성이 나오기까지
const PAUSE = 0.8 // 따라 말하는 호흡 여백
const END = 1.6

// 세이프 존 안 콘텐츠 열: x 72 ~ 918
const COL = { left: 72, width: 846 } as const

export type SlowReadItem = { ko: string; roman: string; en: string; highlight?: boolean; badge?: string }
export type SlowReadData = { title: string; subtitle: string; items: SlowReadItem[] }
type Clip = { file: string; total: number; start: number; end: number }

export const SLOW_READS = DATA as Record<string, SlowReadData>
const CLIPS = AUDIO as Record<string, Clip[]>

const f = (s: number) => Math.round(s * FPS)

export function slowReadLayout(id: string) {
  const clips = CLIPS[id]
  if (!clips) throw new Error(`audio.generated.json 에 ${id} 없음 — generate-slow-read-typecast.mjs 를 먼저 돌린다`)
  let t = f(OPEN)
  const slots = clips.map(c => {
    const speech = Math.max(1, f(c.end - c.start))
    const slot = { from: t, voiceAt: t + f(LEAD), speechEnd: t + f(LEAD) + speech, dur: f(LEAD) + speech + f(PAUSE), clip: c }
    t += slot.dur
    return slot
  })
  return { slots, endFrom: t, total: t + f(END) }
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

export function SlowReadVideo({ id }: { id: string }) {
  useBasicsFonts()
  const frame = useCurrentFrame()
  const data = SLOW_READS[id]
  const { slots, endFrom } = slowReadLayout(id)
  const cur = slots.findIndex(s => frame >= s.from && frame < s.from + s.dur)
  const ended = frame >= endFrom

  return (
    <AbsoluteFill style={{ background: SR.bg, fontFamily: EN, color: SR.ink }}>
      {slots.map((s, i) => (
        <Sequence key={i} from={s.voiceAt} durationInFrames={s.dur} layout="none">
          <Audio src={staticFile(s.clip.file)} startFrom={f(s.clip.start)} />
        </Sequence>
      ))}

      <Title data={data} />

      <div style={{ position: 'absolute', left: COL.left, width: COL.width, top: 490, height: 690 }}>
        {cur >= 0 && <WordCard key={cur} item={data.items[cur]} index={cur} count={data.items.length} slot={slots[cur]} />}
        {ended && <EndCard count={data.items.length} from={endFrom} />}
        {cur < 0 && !ended && <ReadyCard />}
      </div>

      <Grid items={data.items} cur={cur} done={ended ? data.items.length : cur} />
    </AbsoluteFill>
  )
}

/* ───────── 타이틀 ───────── */

function Title({ data }: { data: SlowReadData }) {
  const frame = useCurrentFrame()
  const op = interpolate(frame, [0, 10], [0, 1], clamp)
  const y = interpolate(frame, [0, 10], [10, 0], clamp)
  return (
    <div style={{ position: 'absolute', left: COL.left, width: COL.width, top: 250, textAlign: 'center', opacity: op, transform: `translateY(${y}px)` }}>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 6, color: SR.coral }}>KOREAN SLOW READ-ALONG</div>
      <div style={{ fontSize: 76, fontWeight: 700, marginTop: 18, lineHeight: 1.05 }}>{data.title}</div>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 52, color: SR.muted, marginTop: 10 }}>{data.subtitle}</div>
    </div>
  )
}

/* ───────── 가운데 카드 ───────── */

function Card({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: SR.card,
        borderRadius: 44,
        border: `3px solid ${accent ? SR.coral : SR.rule}`,
        boxShadow: '0 10px 36px rgba(17,17,17,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  )
}

type Slot = ReturnType<typeof slowReadLayout>['slots'][number]

function WordCard({ item, index, count, slot }: { item: SlowReadItem; index: number; count: number; slot: Slot }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const local = frame - slot.from
  const pop = spring({ frame: local, fps, config: { damping: 15, mass: 0.6 } })
  const op = interpolate(local, [0, 5], [0, 1], clamp)
  const hl = !!item.highlight
  const speaking = frame >= slot.voiceAt && frame < slot.speechEnd
  const yourTurn = frame >= slot.speechEnd
  const turnLeft = interpolate(frame, [slot.speechEnd, slot.from + slot.dur], [1, 0], clamp)
  const badgePop = spring({ frame: local - 4, fps, config: { damping: 12, mass: 0.6 } })

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, transform: `scale(${0.96 + 0.04 * pop})` }}>
      <Card accent={hl}>
        <div style={{ position: 'absolute', top: 34, left: 40, fontSize: 30, fontWeight: 700, color: SR.faint, letterSpacing: 2 }}>
          {String(index + 1).padStart(2, '0')} <span style={{ color: SR.rule }}>/</span> {count}
        </div>

        <div style={{ fontFamily: KO, fontSize: item.ko.length > 3 ? 180 : 205, fontWeight: 800, lineHeight: 1, color: hl ? SR.coral : SR.ink, letterSpacing: -4, marginTop: 30 }}>
          {item.ko}
        </div>
        <div style={{ fontSize: 54, fontWeight: 500, color: SR.muted, marginTop: 30 }}>{item.roman}</div>
        <div style={{ fontSize: 62, fontWeight: 700, marginTop: 6 }}>{item.en}</div>

        <div style={{ height: 78, marginTop: 24, display: 'flex', alignItems: 'center' }}>
          {item.badge && (
            <div
              style={{
                transform: `scale(${badgePop})`,
                background: SR.coral,
                color: '#fff',
                fontFamily: KO,
                fontSize: 40,
                fontWeight: 700,
                padding: '12px 30px',
                borderRadius: 999,
              }}
            >
              {item.badge}
            </div>
          )}
        </div>

        <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 5, color: yourTurn ? SR.ink : SR.faint, display: 'flex', alignItems: 'center', gap: 14 }}>
            {!yourTurn && <Bars on={speaking} />}
            {yourTurn ? 'YOUR TURN' : 'LISTEN'}
          </div>
          <div style={{ width: 260, height: 8, borderRadius: 4, background: SR.rule, overflow: 'hidden', opacity: yourTurn ? 1 : 0 }}>
            <div style={{ width: `${turnLeft * 100}%`, height: '100%', background: hl ? SR.coral : SR.ink }} />
          </div>
        </div>
      </Card>
    </div>
  )
}

function Bars({ on }: { on: boolean }) {
  const frame = useCurrentFrame()
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30 }}>
      {[0, 1, 2, 3].map(i => {
        const h = on ? 10 + 18 * Math.abs(Math.sin(frame / 3 + i * 1.3)) : 8
        return <span key={i} style={{ width: 6, height: h, borderRadius: 3, background: on ? SR.ink : SR.faint }} />
      })}
    </span>
  )
}

function ReadyCard() {
  const frame = useCurrentFrame()
  const op = interpolate(frame, [6, 16], [0, 1], clamp)
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op }}>
      <Card>
        <div style={{ fontSize: 58, fontWeight: 700 }}>Listen, then say it</div>
        <div style={{ fontFamily: KO, fontSize: 46, color: SR.muted, marginTop: 20 }}>듣고 따라 말해 보세요</div>
      </Card>
    </div>
  )
}

function EndCard({ count, from }: { count: number; from: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const pop = spring({ frame: frame - from, fps, config: { damping: 15, mass: 0.6 } })
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: pop, transform: `scale(${0.96 + 0.04 * pop})` }}>
      <Card>
        <div style={{ fontFamily: KO, fontSize: 120, fontWeight: 800 }}>잘했어요!</div>
        <div style={{ fontSize: 56, fontWeight: 700, marginTop: 24 }}>All {count} done</div>
        <div style={{ fontSize: 40, color: SR.muted, marginTop: 14 }}>Watch again and say them faster</div>
      </Card>
    </div>
  )
}

/* ───────── 진행 그리드 4 × 3 ───────── */

function Grid({ items, cur, done }: { items: SlowReadItem[]; cur: number; done: number }) {
  const frame = useCurrentFrame()
  const op = interpolate(frame, [4, 14], [0, 1], clamp)
  const GAP = 14
  const w = (COL.width - GAP * 3) / 4
  return (
    <div style={{ position: 'absolute', left: COL.left, width: COL.width, top: 1208, display: 'flex', flexWrap: 'wrap', gap: GAP, opacity: op }}>
      {items.map((it, i) => {
        const isCur = i === cur
        const isDone = i < done && !isCur
        const hl = !!it.highlight
        const bg = isCur ? (hl ? SR.coral : SR.ink) : isDone ? SR.card : 'transparent'
        const color = isCur ? '#fff' : isDone ? (hl ? SR.coral : SR.ink) : SR.faint
        const border = isCur ? (hl ? SR.coral : SR.ink) : hl ? SR.coral : SR.rule
        return (
          <div
            key={i}
            style={{
              width: w,
              height: 92,
              borderRadius: 20,
              background: bg,
              border: `3px solid ${border}`,
              borderStyle: !isCur && !isDone && hl ? 'dashed' : 'solid',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: KO,
              fontSize: 36,
              fontWeight: isCur ? 800 : 600,
              color,
            }}
          >
            {it.ko}
          </div>
        )
      })}
    </div>
  )
}
