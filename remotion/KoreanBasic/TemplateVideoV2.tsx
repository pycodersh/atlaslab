/**
 * Basics 쇼트 v2 — 사이트 톤(크림 · 블랙 · 레드) 리디자인. videos.json 항목에 "v2": true 가 있는 글만 이쪽으로 그린다(시범 스위치).
 *
 *   (선택) Opening  0~7.5s  상황극: 배경 + 캐릭터 A·B → A 틀린 말(음성) → B 떨떠름 + 반응 말풍선, 틀린 말풍선에 취소선
 *                           → A 정답(음성), B 미소. 데이터는 항목의 "scene". 없으면 이 장면 없이 바로 Hook 부터.
 *   Hook      틀린 예 카드 2장 — 큰 X 대신 회색 + 왼쪽→오른쪽 빨간 취소선, 아래 한 줄 이유
 *   Contrast  대조 카드 2장(#111111 vs #C8102E) + 규칙 배너
 *   Takeaway  실전 카드 3장 + 마무리 한 줄
 *
 * 메인 보이스오버(data.audio)는 Opening 이 있으면 7.5초부터 시작하고, 뒤 세 장면도 그만큼 밀린다.
 * 대사 음성은 public/audio/korean-basic/lines/<slug>/scene-*.mp3(scripts/generate-basics-lines.py).
 *
 * 공통 규칙: 화면 아래 15%(y > 918)에는 글자 · 카드를 두지 않는다(플레이어 컨트롤 · 그라데이션 자리).
 *            테두리는 #E5E1DC(1920 폭 기준 3px = 화면에서 약 1px), 그림자는 아주 옅게, 상단 컬러 보더 없음.
 *            장면 전환은 페이드 + 8px 위로, 9프레임(300ms). 이모지는 쓰지 않는다(데이터에 있으면 걷어 낸다).
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import {
  AbsoluteFill,
  Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { Background, type SceneBackground } from './scene/Backgrounds'
import { Character, type Cast, type Expression, type Speaker } from './scene/Characters'
import type { BasicsVideoData, Tone } from './TemplateVideo'

export const C2 = {
  bg: '#F7F5F2',
  card: '#FFFFFF',
  ink: '#111111',
  muted: '#6B6B6B',
  rule: '#E5E1DC',
  red: '#C8102E',
  redDeep: '#A30D25',
} as const

const KO = "Pretendard, Inter, 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif"
const EN = `'DM Sans', ${KO}`
const SERIF = `'Playfair Display', Georgia, ${KO}`
const BORDER = `3px solid ${C2.rule}`
const SHADOW = '0 6px 24px rgba(17,17,17,0.05)'
const SAFE_BOTTOM = 918 // 1080 × 0.85

/** 두 문법 구분은 #111111 vs #C8102E 두 가지로만 */
const TONE2: Record<Tone, string> = { navy: C2.ink, green: C2.red, red: C2.red }

export const SCENE_FRAMES = 225 // 7.5s

export type SceneLine = { speaker: Speaker; ko: string; audio: string; dur?: number }
export type SceneData = {
  background: SceneBackground
  wrong: SceneLine
  reaction: { speaker: Speaker; expression: Expression; text: string }
  correct: SceneLine
  ending: { speaker: Speaker; expression: Expression }
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu
export const noEmoji = (s: string) => s.replace(EMOJI, '').replace(/\s{2,}/g, ' ').trim()

/* ───────── 글꼴 — 스틸 렌더(썸네일 · 프레임)에서도 DM Sans · Playfair 가 잡히도록 ───────── */

const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap'
export function useBasicsFonts() {
  const [handle] = useState(() => delayRender('basics fonts'))
  useEffect(() => {
    let done = false
    const finish = () => { if (!done) { done = true; continueRender(handle) } }
    let link = document.querySelector<HTMLLinkElement>('link[href*="DM+Sans"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = FONT_CSS
      document.head.appendChild(link)
    }
    // @font-face 가 들어온 뒤에 load 해야 실제 글꼴을 기다린다(시트 전이면 빈 결과로 바로 끝난다)
    const sheet = link.sheet ? Promise.resolve() : new Promise<void>(r => { link!.addEventListener('load', () => r()); link!.addEventListener('error', () => r()) })
    sheet
      .then(() =>
        Promise.all([
          document.fonts.load('700 60px "Playfair Display"'),
          document.fonts.load('400 40px "DM Sans"'),
          document.fonts.load('500 40px "DM Sans"'),
          document.fonts.load('700 40px "DM Sans"'),
        ]),
      )
      .then(finish, finish)
    const t = setTimeout(finish, 4000) // 글꼴을 못 받아도 렌더는 멈추지 않는다
    return () => clearTimeout(t)
  }, [handle])
}

/* ───────── 공통 모션 ───────── */

function usePop(delay: number, damping = 16) {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: f - delay, fps, config: { damping, mass: 0.7 } })
}

/** 장면 들어올 때 페이드 + 8px 위로, 나갈 때 페이드 — 9프레임 */
function SceneShell({ dur, children, style }: { dur: number; children: ReactNode; style?: CSSProperties }) {
  const f = useCurrentFrame()
  const op = interpolate(f, [0, 9, dur - 9, dur], [0, 1, 1, 0], clamp)
  const y = interpolate(f, [0, 9], [8, 0], clamp)
  return <AbsoluteFill style={{ opacity: op, transform: `translateY(${y}px)`, ...style }}>{children}</AbsoluteFill>
}

/** 왼쪽 → 오른쪽 빨간 취소선 + 글자는 회색으로 */
function Struck({ children, progress, thickness = 7 }: { children: ReactNode; progress: number; thickness?: number }) {
  const color = interpolate(progress, [0, 0.4], [0, 1], clamp)
  return (
    <span style={{ position: 'relative', display: 'inline-block', color: color > 0 ? `rgb(${Math.round(17 + (107 - 17) * color)},${Math.round(17 + (107 - 17) * color)},${Math.round(17 + (107 - 17) * color)})` : C2.ink }}>
      {children}
      <span
        style={{
          position: 'absolute',
          left: -6,
          top: '54%',
          height: thickness,
          marginTop: -thickness / 2,
          width: `calc(${progress * 100}% + ${progress * 12}px)`,
          background: C2.red,
          borderRadius: thickness,
        }}
      />
    </span>
  )
}

function Rich({ text, color }: { text: string; color: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith('**') ? <b key={i} style={{ color }}>{part.slice(2, -2)}</b> : <span key={i}>{part}</span>,
      )}
    </>
  )
}

function koSize(text: string, sizes: [number, number, number, number]) {
  const n = [...text].length
  return n <= 2 ? sizes[0] : n <= 5 ? sizes[1] : n <= 9 ? sizes[2] : sizes[3]
}

/* ───────── 전체 ───────── */

export function TemplateVideoV2({ data, layout }: { data: BasicsVideoData; layout: { scenes: { from: number; dur: number }[]; offset: number } }) {
  useBasicsFonts()
  const { scenes, offset } = layout
  const scene = data.scene
  return (
    <AbsoluteFill style={{ backgroundColor: C2.bg, fontFamily: KO, color: C2.ink }}>
      {scene && (
        <Sequence durationInFrames={SCENE_FRAMES} name="Opening">
          <OpeningScene scene={scene} cast={data.cast} />
        </Sequence>
      )}
      {/* 오디오는 미리 마운트해 둔다 — 장면이 열리는 순간 불러오면 첫 재생에서 첫 음절이 잘린다 */}
      <Sequence from={offset} name="Voiceover" premountFor={Math.max(1, Math.min(offset, 60))}>
        <Audio src={staticFile(data.audio)} volume={1} />
      </Sequence>
      <Sequence from={scenes[0].from} durationInFrames={scenes[0].dur} name="Hook">
        <HookScene hook={data.hook} dur={scenes[0].dur} />
      </Sequence>
      <Sequence from={scenes[1].from} durationInFrames={scenes[1].dur} name="Contrast">
        <ContrastScene contrast={data.contrast} dur={scenes[1].dur} />
      </Sequence>
      <Sequence from={scenes[2].from} durationInFrames={scenes[2].dur} name="Takeaway">
        <TakeawayScene takeaway={data.takeaway} dur={scenes[2].dur} />
      </Sequence>
    </AbsoluteFill>
  )
}

/* ───────── Opening: 상황극 ───────── */

/** 프레임 기준 타임라인(30fps) — 지시서 4-4 의 초 단위를 그대로 옮겼다 */
export const OPENING = {
  enter: 0, // 0.0s 배경 + 캐릭터
  wrong: 30, // 1.0s 틀린 말풍선 + 음성
  reaction: 105, // 3.5s 반응 + 취소선
  correct: 150, // 5.0s 정답 말풍선 + 음성
  smile: 165, // 5.5s B 미소
  end: SCENE_FRAMES, // 7.5s
  voiceLead: 3, // 말풍선이 뜨고 음성이 나오기까지
  /** 대사 파일 앞에 넣은 무음(0.2초) — 브라우저가 재생을 시작하며 먹는 앞부분이 무음이 되게. 그만큼 일찍 튼다 */
  preroll: 6,
} as const

const CHAR_H = 640
const CHAR_TOP = 490
const X_A = 600
const X_B = 1320

function OpeningScene({ scene, cast }: { scene: SceneData; cast?: Cast }) {
  const f = useCurrentFrame()
  const T = OPENING
  const bgIn = interpolate(f, [0, 18], [0, 1], clamp)
  const aIn = usePop(4, 18)
  const bIn = usePop(10, 18)
  const out = interpolate(f, [T.end - 10, T.end], [1, 0], clamp)

  const wrongPop = usePop(T.wrong, 14)
  const strike = interpolate(f, [T.reaction, T.reaction + 14], [0, 1], clamp)
  const reactPop = usePop(T.reaction + 2, 14)
  const reactOut = interpolate(f, [T.correct - 6, T.correct + 4], [1, 0], clamp)
  const wrongOut = interpolate(f, [T.correct - 6, T.correct + 4], [1, 0], clamp)
  const correctPop = usePop(T.correct + 2, 14)

  // 끝 표정은 글마다 고른 배역 표정(cast)이 있으면 그것 — 없으면 장면 데이터의 ending
  const bExpr: Expression = f < T.reaction ? 'neutral' : f < T.smile ? scene.reaction.expression : (cast?.b ?? scene.ending.expression)
  const bSince = f < T.reaction ? f : f < T.smile ? f - T.reaction : f - T.smile
  const aExpr: Expression = f < T.reaction ? 'neutral' : f < T.correct ? 'awkward' : (cast?.a ?? 'smile')
  const aSince = f < T.correct ? f : f - T.correct
  const late = f >= T.correct

  const pos = (who: Speaker) => (who === 'A' ? X_A : X_B)

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ opacity: bgIn }}>
        <Background name={scene.background} />
      </AbsoluteFill>

      {/* 캐릭터 — 아래는 화면 밖으로 잘린다(글자가 아니라 안전 영역 규칙과 무관) */}
      <div style={{ position: 'absolute', top: CHAR_TOP, left: X_A - (CHAR_H * 400) / 560 / 2, opacity: aIn, transform: `translateX(${(1 - aIn) * -60}px)` }}>
        <Character who="A" expression={aExpr} since={aSince} height={CHAR_H} gesture={late ? cast?.aGesture : undefined} />
      </div>
      <div style={{ position: 'absolute', top: CHAR_TOP, left: X_B - (CHAR_H * 400) / 560 / 2, opacity: bIn, transform: `translateX(${(1 - bIn) * 60}px)` }}>
        <Character who="B" expression={bExpr} since={bSince} height={CHAR_H} gesture={late ? cast?.bGesture : undefined} />
      </div>

      {/* A 틀린 말 → 취소선 */}
      <Bubble x={pos(scene.wrong.speaker)} top={170} pop={wrongPop} fade={wrongOut} side={scene.wrong.speaker}>
        <span style={{ fontSize: 84, fontWeight: 800, letterSpacing: -1, whiteSpace: 'nowrap' }}>
          <Struck progress={strike}>{scene.wrong.ko}</Struck>
        </span>
      </Bubble>
      {/* B 반응(글자만, 음성 없음) */}
      <Bubble x={pos(scene.reaction.speaker)} top={360} pop={reactPop} fade={reactOut} side={scene.reaction.speaker}>
        <span style={{ fontFamily: EN, fontSize: 58, fontWeight: 500, color: C2.muted, fontStyle: 'italic', whiteSpace: 'nowrap' }}>{scene.reaction.text}</span>
      </Bubble>
      {/* A 정답 */}
      <Bubble x={pos(scene.correct.speaker)} top={170} pop={correctPop} side={scene.correct.speaker}>
        <span style={{ fontSize: 84, fontWeight: 800, letterSpacing: -1, color: C2.red, whiteSpace: 'nowrap' }}>{scene.correct.ko}</span>
      </Bubble>

      {/* 대사 오디오는 장면 시작부터 미리 마운트하고(premountFor), 0.2초 무음이 붙은 파일을 그만큼 일찍 튼다 — 말이 시작되는 시점은 그대로 */}
      <Sequence from={T.wrong + T.voiceLead - T.preroll} premountFor={T.wrong + T.voiceLead - T.preroll} name="Wrong line">
        <Audio src={staticFile(scene.wrong.audio)} />
      </Sequence>
      <Sequence from={T.correct + T.voiceLead - T.preroll} premountFor={T.correct + T.voiceLead - T.preroll} name="Correct line">
        <Audio src={staticFile(scene.correct.audio)} />
      </Sequence>
    </AbsoluteFill>
  )
}

/** 흰 말풍선 + 꼬리. x 는 말하는 사람 머리 중심, 풍선은 그 위에 놓이되 화면 밖으로 나가지 않게 민다 */
function Bubble({ x, top, pop, fade = 1, side, children }: { x: number; top: number; pop: number; fade?: number; side: Speaker; children: ReactNode }) {
  if (pop <= 0.001 || fade <= 0.001) return null
  const scale = 0.92 + 0.08 * Math.min(1, pop)
  // 풍선 가운데를 머리보다 화면 안쪽으로 조금 — A 는 오른쪽으로, B 는 왼쪽으로
  const cx = side === 'A' ? x + 80 : x - 60
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: cx,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: side === 'A' ? '30% 100%' : '70% 100%',
        opacity: Math.min(1, pop * 1.4) * fade,
        maxWidth: 1180,
      }}
    >
      <div style={{ position: 'relative', padding: '34px 56px', background: C2.card, border: BORDER, borderRadius: 40, boxShadow: SHADOW }}>
        {children}
        {/* 꼬리 — 테두리 삼각형 위에 흰 삼각형 */}
        <svg width={70} height={54} viewBox="0 0 70 54" style={{ position: 'absolute', bottom: -51, left: side === 'A' ? '24%' : undefined, right: side === 'B' ? '24%' : undefined }}>
          <path d={side === 'A' ? 'M2 0 L18 52 L60 0' : 'M68 0 L52 52 L10 0'} fill={C2.card} stroke={C2.rule} strokeWidth={3} strokeLinejoin="round" />
          <path d={side === 'A' ? 'M5 0 H58' : 'M12 0 H65'} stroke={C2.card} strokeWidth={6} />
        </svg>
      </div>
    </div>
  )
}

/* ───────── Hook: 틀린 예 ───────── */

const STRIKE_AT = 54

function HookScene({ hook, dur }: { hook: BasicsVideoData['hook']; dur: number }) {
  const f = useCurrentFrame()
  const cueIn = interpolate(f, [0, 12], [0, 1], clamp)
  const a = usePop(12)
  const b = usePop(20)
  const capIn = usePop(4)
  const strike = interpolate(f, [STRIKE_AT, STRIKE_AT + 14], [0, 1], clamp)
  const strike2 = interpolate(f, [STRIKE_AT + 6, STRIKE_AT + 20], [0, 1], clamp)
  return (
    <SceneShell dur={dur}>
      <div style={{ position: 'absolute', top: 130, width: '100%', textAlign: 'center', fontFamily: SERIF, fontSize: 76, fontWeight: 700, color: C2.ink, opacity: capIn }}>
        {noEmoji(hook.caption)}
      </div>
      <div style={{ position: 'absolute', top: 280, width: '100%', textAlign: 'center', fontFamily: EN, fontSize: 52, fontWeight: 500, color: C2.muted, opacity: cueIn }}>
        {hook.cue.label} <span style={{ color: C2.ink, fontWeight: 700 }}>{hook.cue.word}</span>
      </div>
      <div style={{ position: 'absolute', top: 430, width: '100%', display: 'flex', justifyContent: 'center', gap: 56 }}>
        <MistakeCard {...hook.cards[0]} pop={a} strike={strike} />
        <MistakeCard {...hook.cards[1]} pop={b} strike={strike2} />
      </div>
    </SceneShell>
  )
}

function MistakeCard({ ko, rom, pop, strike }: { ko: string; rom: string; pop: number; strike: number }) {
  return (
    <div
      style={{
        minWidth: 520,
        maxWidth: 820,
        height: 330,
        padding: '0 60px',
        borderRadius: 28,
        background: C2.card,
        border: BORDER,
        boxShadow: SHADOW,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: Math.min(1, pop * 1.4),
        transform: `translateY(${(1 - pop) * 10}px)`,
      }}
    >
      <div style={{ fontSize: koSize(ko, [128, 100, 76, 62]), fontWeight: 800, lineHeight: 1.15, whiteSpace: 'nowrap' }}>
        <Struck progress={strike} thickness={8}>{ko}</Struck>
      </div>
      <div style={{ fontFamily: EN, fontSize: 38, fontWeight: 500, color: C2.muted, marginTop: 22, whiteSpace: 'nowrap', opacity: interpolate(strike, [0.6, 1], [0.5, 1], clamp) }}>{rom}</div>
    </div>
  )
}

/* ───────── Contrast ───────── */

function ContrastScene({ contrast, dur }: { contrast: BasicsVideoData['contrast']; dur: number }) {
  const f = useCurrentFrame()
  const a = usePop(4)
  const b = usePop(14)
  const banner = usePop(42)
  const pulse = f > 60 ? 1 + Math.sin((f - 60) / 6) * 0.012 : 1
  // 카드 한 장의 설명이 길면(줄바꿈이 생길 만큼) 글씨 · 여백을 줄여 배너 자리를 남긴다
  const dense = Math.max(...contrast.cards.map(c => c.lines.join(' ').replace(/\*\*/g, '').length)) > 62
  return (
    <SceneShell dur={dur}>
      <div style={{ position: 'absolute', top: 110, width: '100%', textAlign: 'center', fontFamily: SERIF, fontSize: 66, fontWeight: 700, color: C2.ink, opacity: a }}>
        {noEmoji(contrast.heading)}
      </div>
      {/* 카드 → 배너를 한 세로 흐름으로 — 카드 글이 길어도 배너가 카드 위에 겹치지 않는다(하단 안전 영역 918 안) */}
      <div style={{ position: 'absolute', top: 236, bottom: 1080 - SAFE_BOTTOM, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 56 }}>
        <ContrastCardView {...contrast.cards[0]} pop={a} dense={dense} />
        <ContrastCardView {...contrast.cards[1]} pop={b} dense={dense} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            padding: '22px 60px',
            borderRadius: 999,
            background: TONE2[contrast.banner.tone],
            color: '#fff',
            fontFamily: EN,
            fontSize: 48,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            opacity: banner,
            transform: `translateY(${(1 - banner) * 10}px) scale(${pulse})`,
          }}
        >
          {noEmoji(contrast.banner.text)}
        </div>
      </div>
      </div>
    </SceneShell>
  )
}

function ContrastCardView({ ko, rom, tone, lines, pop, dense }: { ko: string; rom: string; tone: Tone; lines: string[]; pop: number; dense?: boolean }) {
  const color = TONE2[tone]
  return (
    <div style={{ width: 780, minHeight: dense ? 0 : 430, padding: dense ? '40px 52px' : '48px 56px', borderRadius: 28, background: C2.card, border: BORDER, boxShadow: SHADOW, opacity: Math.min(1, pop * 1.4), transform: `translateY(${(1 - pop) * 10}px)` }}>
      <div style={{ fontSize: koSize(ko, [112, 88, 70, 58]), fontWeight: 800, color, lineHeight: 1.05, whiteSpace: 'nowrap' }}>{ko}</div>
      <div style={{ fontFamily: EN, fontSize: 36, color: C2.muted, marginTop: 14 }}>{rom}</div>
      <div style={{ marginTop: dense ? 24 : 30, paddingTop: dense ? 22 : 26, borderTop: BORDER, display: 'flex', flexDirection: 'column', gap: dense ? 10 : 14, wordBreak: 'keep-all' }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: EN, fontSize: dense ? 37 : 42, lineHeight: 1.3, color: C2.ink }}>
            <Rich text={noEmoji(l)} color={color} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────── Takeaway ───────── */

function TakeawayScene({ takeaway, dur }: { takeaway: BasicsVideoData['takeaway']; dur: number }) {
  const head = usePop(2)
  const slogan = usePop(66)
  return (
    <SceneShell dur={dur + 9 /* 마지막 장면은 끝까지 남긴다 */}>
      <div style={{ position: 'absolute', top: 88, width: '100%', textAlign: 'center', fontFamily: SERIF, fontSize: 76, fontWeight: 700, color: C2.ink, opacity: head }}>
        {noEmoji(takeaway.title)}
      </div>
      <div style={{ position: 'absolute', top: 230, width: '100%', display: 'flex', justifyContent: 'center', gap: 36 }}>
        {takeaway.cards.map((c, i) => (
          <TakeawayCardView key={i} n={i + 1} {...c} delay={10 + i * 8} />
        ))}
      </div>
      <div style={{ position: 'absolute', top: 826, width: '100%', textAlign: 'center', fontFamily: EN, fontSize: 54, fontWeight: 700, color: C2.red, whiteSpace: 'nowrap', opacity: slogan, transform: `translateY(${(1 - slogan) * 8}px)` }}>
        {noEmoji(takeaway.slogan)}
      </div>
    </SceneShell>
  )
}

function TakeawayCardView({ n, title, rom, ex, exRom, delay }: { n: number; title: string; rom?: string; ex: string; exRom: string; delay: number }) {
  const p = usePop(delay)
  const key = n === 3 // 마지막 카드가 결론 — 레드 테두리 · 배지
  return (
    <div
      style={{
        width: 540,
        height: 560,
        padding: '40px 44px',
        borderRadius: 28,
        background: C2.card,
        border: key ? `4px solid ${C2.red}` : BORDER,
        boxShadow: SHADOW,
        display: 'flex',
        flexDirection: 'column',
        opacity: Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * 10}px)`,
      }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 999, background: key ? C2.red : C2.ink, color: '#fff', fontFamily: EN, fontSize: 34, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
      <div style={{ marginTop: 28, fontFamily: EN, fontSize: 54, fontWeight: 700, color: C2.ink, lineHeight: 1.1 }}>
        {noEmoji(title)} {rom && <span style={{ fontSize: 38, fontWeight: 500, color: C2.muted }}>{rom}</span>}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 26, borderTop: BORDER, wordBreak: 'keep-all', minHeight: 220 }}>
        <div style={{ fontSize: koSize(ex, [48, 48, 48, 42]), fontWeight: 700, color: C2.ink, lineHeight: 1.25 }}>{ex}</div>
        <div style={{ fontFamily: EN, fontSize: 30, color: C2.muted, marginTop: 10, lineHeight: 1.3 }}>{noEmoji(exRom)}</div>
      </div>
    </div>
  )
}

export { SAFE_BOTTOM }
