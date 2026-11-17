import { AbsoluteFill } from 'remotion'
import type { BasicsVideoData } from './TemplateVideo'
import { C2, useBasicsFonts } from './TemplateVideoV2'
import { Character, type CharTheme } from './scene/Characters'

/**
 * Basics 목록 카드 전용 정지 화면 — 영상에는 없는 구도 2종(scripts/render-basics-thumbnails.mjs 가 뽑는다).
 *   example  Takeaway 의 결론 예문을 말풍선으로 크게
 *   keyword  규칙의 핵심 형태를 가운데 큰 글자로
 * 영상 프레임이 아니라 애니메이션 중간 상태가 잡힐 일이 없다. 대비 카드 구도는 영상 Scene 2 에서 그대로 뽑는다.
 * Hook 의 카드는 '틀린 예'일 수 있어 큰 글자로 쓰지 않는다 — 규칙 쪽 contrast 카드를 쓴다.
 */
export type BasicsThumbVariant = 'example' | 'keyword' | 'v2'

const FONT = "Pretendard, Inter, 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif"

/** 글자 수에 맞춰 1920 폭 안에 들어가게 */
const fit = (text: string, max: number, room: number) => Math.min(max, Math.floor(room / [...text].length))

export function BasicsThumb({ data, variant }: { data: BasicsVideoData; variant: BasicsThumbVariant }) {
  if (variant === 'v2') return <ThumbV2 data={data} />
  if (variant === 'example') {
    const { ex, exRom } = data.takeaway.cards[2]
    return (
      <AbsoluteFill style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', fontFamily: FONT, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', maxWidth: 1640, padding: '84px 112px', borderRadius: 64, background: '#fff', boxShadow: '0 32px 80px rgba(5,150,105,.18)', textAlign: 'center' }}>
          <div style={{ fontSize: fit(ex, 150, 1400 / 1.0), fontWeight: 800, lineHeight: 1.2, color: '#1C1917', wordBreak: 'keep-all' }}>{ex}</div>
          <div style={{ marginTop: 32, fontSize: 56, fontWeight: 500, lineHeight: 1.25, color: '#047857' }}>{exRom}</div>
          <div style={{ position: 'absolute', left: 170, bottom: -58, width: 0, height: 0, borderLeft: '40px solid transparent', borderRight: '40px solid transparent', borderTop: '64px solid #fff' }} />
        </div>
      </AbsoluteFill>
    )
  }

  const { ko, rom } = data.contrast.cards[0]
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #1E1B4B, #312E81)', fontFamily: FONT, alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff' }}>
      <div style={{ fontSize: fit(ko, 340, 1600), fontWeight: 800, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{ko}</div>
      <div style={{ marginTop: 28, fontSize: 64, fontWeight: 500, color: '#C7D2FE' }}>{rom}</div>
      <div style={{ marginTop: 56, padding: '16px 48px', borderRadius: 999, background: '#FDE68A', color: '#1E1B4B', fontSize: 52, fontWeight: 800 }}>{data.hook.cue.word}</div>
    </AbsoluteFill>
  )
}

/**
 * v2 목록 썸네일 — 사이트 색 3종 × 구도 3종. 문구 · 배경은 videos.json 의 thumb({ lines, en, bg }).
 *
 *   배경  black #111111(흰 글씨) · red #C8102E(흰 글씨, 강조는 검정) · cream #F7F5F2(검정 글씨, 강조만 빨강)
 *         기본은 Hangul & Pronunciation = cream, Core Grammar = black, 핵심 글 일부(15~20%)만 red.
 *         목록(3열)에서 같은 배경이 가로 · 세로 3개 이어지지 않게 정했다(scripts/basics-thumb-colors.mjs).
 *   구도  word    표현 하나를 크게
 *         compare 표현 두 개를 좌우로, 가운데 vs — 두 번째가 강조색
 *         scene   상황극이 있는 글: 왼쪽에 두 캐릭터 라인아트, 오른쪽에 표현
 */
type ThumbBg = 'black' | 'red' | 'cream'
const PAL: Record<ThumbBg, { bg: string; text: string; accent: string; rom: string; badgeBg: string; char: CharTheme }> = {
  black: { bg: C2.ink, text: C2.bg, accent: C2.red, rom: '#B5B1AC', badgeBg: C2.red, char: { ink: C2.bg, paper: C2.ink, accent: C2.red, hair: '#6B6B6B' } },
  red: { bg: C2.red, text: '#FFFFFF', accent: C2.ink, rom: 'rgba(255,255,255,0.82)', badgeBg: C2.ink, char: { ink: '#FFFFFF', paper: C2.red, accent: C2.ink, hair: C2.ink } },
  cream: { bg: C2.bg, text: C2.ink, accent: C2.red, rom: C2.muted, badgeBg: C2.red, char: { ink: C2.ink, paper: '#FFFFFF', accent: C2.red } },
}
const EN_FONT = "'DM Sans', sans-serif"

function ThumbV2({ data }: { data: BasicsVideoData }) {
  useBasicsFonts()
  const t = data.thumb ?? { lines: [{ ko: data.contrast.cards[0].ko, rom: data.contrast.cards[0].rom }], en: data.hook.cue.word }
  const pal = PAL[(t.bg as ThumbBg) ?? 'black']
  const layout = data.scene ? 'scene' : t.lines.length > 1 ? 'compare' : 'word'
  const badge = (
    <div style={{ padding: '16px 46px', borderRadius: 999, background: pal.badgeBg, color: '#fff', fontFamily: EN_FONT, fontSize: 50, fontWeight: 700, whiteSpace: 'nowrap' }}>{t.en}</div>
  )
  const Expr = ({ ko, rom, size, color, romSize }: { ko: string; rom: string; size: number; color: string; romSize: number }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, whiteSpace: 'nowrap', color }}>{ko}</div>
      <div style={{ marginTop: 16, fontFamily: EN_FONT, fontSize: romSize, fontWeight: 500, color: pal.rom, whiteSpace: 'nowrap' }}>{rom}</div>
    </div>
  )
  const len = (s: string) => [...s].length

  if (layout === 'scene') {
    // 캐릭터는 왼쪽 아래에서 잘리고, 오른쪽에 표현 1~2개를 위아래로
    const longest = Math.max(...t.lines.map(l => len(l.ko)))
    const size = Math.min(t.lines.length > 1 ? 190 : 250, Math.floor(1000 / longest))
    return (
      <AbsoluteFill style={{ background: pal.bg, fontFamily: FONT }}>
        <div style={{ position: 'absolute', left: 30, bottom: -60, display: 'flex', alignItems: 'flex-end' }}>
          <Character who="A" expression="smile" height={720} theme={pal.char} />
          <div style={{ marginLeft: -70 }}><Character who="B" expression="smile" height={720} theme={pal.char} /></div>
        </div>
        <div style={{ position: 'absolute', left: 860, right: 60, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
          {t.lines.map((l, i) => (
            <Expr key={i} ko={l.ko} rom={l.rom} size={size} romSize={t.lines.length > 1 ? 56 : 66} color={i === 1 ? pal.accent : pal.text} />
          ))}
          <div style={{ marginTop: 14 }}>{badge}</div>
        </div>
      </AbsoluteFill>
    )
  }

  if (layout === 'compare') {
    const longest = Math.max(...t.lines.map(l => len(l.ko)))
    const size = Math.min(240, Math.floor(760 / longest))
    return (
      <AbsoluteFill style={{ background: pal.bg, fontFamily: FONT, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 70 }}>
          <Expr ko={t.lines[0].ko} rom={t.lines[0].rom} size={size} romSize={62} color={pal.text} />
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 84, fontWeight: 700, color: pal.rom }}>vs</div>
          <Expr ko={t.lines[1].ko} rom={t.lines[1].rom} size={size} romSize={62} color={pal.accent} />
        </div>
        <div style={{ marginTop: 70 }}>{badge}</div>
      </AbsoluteFill>
    )
  }

  const size = Math.min(320, Math.floor(1600 / len(t.lines[0].ko)))
  return (
    <AbsoluteFill style={{ background: pal.bg, fontFamily: FONT, alignItems: 'center', justifyContent: 'center' }}>
      <Expr ko={t.lines[0].ko} rom={t.lines[0].rom} size={size} romSize={72} color={pal.text} />
      <div style={{ marginTop: 64 }}>{badge}</div>
    </AbsoluteFill>
  )
}
