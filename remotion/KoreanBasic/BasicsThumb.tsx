import { AbsoluteFill } from 'remotion'
import type { BasicsVideoData } from './TemplateVideo'
import { C2, useBasicsFonts } from './TemplateVideoV2'

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
 * v2 목록 썸네일 — 큰 글자형 하나로 통일. 배경 #111111, 한국어 핵심 표현 크림 큰 글씨, 아래 로마자 회색, 맨 아래 레드 배지에 영문 뜻.
 * 두 문법 비교 글은 표현 두 개를 위아래로 두고 두 번째만 레드. 문구는 videos.json 의 thumb.
 */
function ThumbV2({ data }: { data: BasicsVideoData }) {
  useBasicsFonts()
  const t = data.thumb ?? { lines: [{ ko: data.contrast.cards[0].ko, rom: data.contrast.cards[0].rom }], en: data.hook.cue.word }
  const two = t.lines.length > 1
  const longest = Math.max(...t.lines.map(l => [...l.ko].length))
  const size = Math.min(two ? 250 : 320, Math.floor((two ? 1500 : 1600) / longest))
  return (
    <AbsoluteFill style={{ background: C2.ink, fontFamily: FONT, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {t.lines.map((l, i) => (
        <div key={i} style={{ marginTop: i ? 34 : 0 }}>
          <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, whiteSpace: 'nowrap', color: two && i === 1 ? C2.red : C2.bg }}>{l.ko}</div>
          <div style={{ marginTop: 14, fontFamily: "'DM Sans', sans-serif", fontSize: two ? 48 : 60, fontWeight: 500, color: '#9A9A9A' }}>{l.rom}</div>
        </div>
      ))}
      <div style={{ marginTop: two ? 48 : 64, padding: '16px 46px', borderRadius: 999, background: C2.red, color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 50, fontWeight: 700 }}>{t.en}</div>
    </AbsoluteFill>
  )
}
