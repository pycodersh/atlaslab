import { AbsoluteFill } from 'remotion'
import type { BasicsVideoData } from './TemplateVideo'

/**
 * Basics 목록 카드 전용 정지 화면 — 영상에는 없는 구도 2종(scripts/render-basics-thumbnails.mjs 가 뽑는다).
 *   example  Takeaway 의 결론 예문을 말풍선으로 크게
 *   keyword  규칙의 핵심 형태를 가운데 큰 글자로
 * 영상 프레임이 아니라 애니메이션 중간 상태가 잡힐 일이 없다. 대비 카드 구도는 영상 Scene 2 에서 그대로 뽑는다.
 * Hook 의 카드는 '틀린 예'일 수 있어 큰 글자로 쓰지 않는다 — 규칙 쪽 contrast 카드를 쓴다.
 */
export type BasicsThumbVariant = 'example' | 'keyword'

const FONT = "Pretendard, Inter, 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif"

/** 글자 수에 맞춰 1920 폭 안에 들어가게 */
const fit = (text: string, max: number, room: number) => Math.min(max, Math.floor(room / [...text].length))

export function BasicsThumb({ data, variant }: { data: BasicsVideoData; variant: BasicsThumbVariant }) {
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
