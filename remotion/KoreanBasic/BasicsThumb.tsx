import { AbsoluteFill } from 'remotion'
import type { BasicsVideoData } from './TemplateVideo'
import { C2, useBasicsFonts } from './TemplateVideoV2'
import { Character } from './scene/Characters'

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
 * v2 목록 썸네일 — 크림 배경(영상과 같은 #F7F5F2) · 먹색 한국어(두 번째 표현만 레드) · 로마자 · 레드 배지(영문 뜻).
 * 문구는 videos.json 의 thumb({ lines, en }). 구도는 영상과 맞춘다(2026-11-19):
 *   scene 있는 글  영상에 두 캐릭터가 나오므로 왼쪽에 캐릭터 펜화, 오른쪽에 표현
 *   scene 없는 글  캐릭터 없이 정중앙 정렬 타이포 카드 — 표현을 더 크게(에디토리얼)
 */
const EN_FONT = "'DM Sans', sans-serif"

function ThumbV2({ data }: { data: BasicsVideoData }) {
  useBasicsFonts()
  const t = data.thumb ?? { lines: [{ ko: data.contrast.cards[0].ko, rom: data.contrast.cards[0].rom }], en: data.hook.cue.word }
  const two = t.lines.length > 1
  const longest = Math.max(...t.lines.map(l => [...l.ko].length))
  const withCast = !!data.scene
  // 가운데 카드는 빈칸을 반 글자로 센다 — 'ㄱ · ㅋ · ㄲ' 처럼 띄어 쓴 낱자가 작아지지 않게
  const width = Math.max(...t.lines.map(l => [...l.ko].reduce((n, ch) => n + (ch === ' ' ? 0.5 : 1), 0)))
  const size = withCast ? Math.min(two ? 190 : 250, Math.floor(1000 / longest)) : Math.min(two ? 228 : 340, Math.floor(1560 / width))
  const romSize = withCast ? (two ? 56 : 66) : two ? 62 : 76
  const lines = t.lines.map((l, i) => (
    <div key={i} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, whiteSpace: 'nowrap', color: i === 1 ? C2.red : C2.ink }}>{l.ko}</div>
      <div style={{ marginTop: withCast ? 16 : 20, fontFamily: EN_FONT, fontSize: romSize, fontWeight: 500, color: C2.muted, whiteSpace: 'nowrap' }}>{l.rom}</div>
    </div>
  ))
  const badge = (
    <div style={{ marginTop: withCast ? 14 : 30, padding: withCast ? '16px 46px' : '18px 54px', borderRadius: 999, background: C2.red, color: '#fff', fontFamily: EN_FONT, fontSize: withCast ? 50 : 56, fontWeight: 700, whiteSpace: 'nowrap' }}>{t.en}</div>
  )
  if (!withCast) {
    return (
      <AbsoluteFill style={{ background: C2.bg, fontFamily: FONT, alignItems: 'center', justifyContent: 'center', gap: two ? 26 : 0 }}>
        {lines}
        {badge}
      </AbsoluteFill>
    )
  }
  return (
    <AbsoluteFill style={{ background: C2.bg, fontFamily: FONT }}>
      <div style={{ position: 'absolute', left: 30, bottom: -60, display: 'flex', alignItems: 'flex-end' }}>
        <Character who="A" expression={data.cast?.a ?? 'smile'} since={12} gesture={data.cast?.aGesture} height={720} />
        <div style={{ marginLeft: -70 }}>
          <Character who="B" expression={data.cast?.b ?? 'smile'} since={12} gesture={data.cast?.bGesture} height={720} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 860, right: 60, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        {lines}
        {badge}
      </div>
    </AbsoluteFill>
  )
}
