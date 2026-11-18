import Link from 'next/link'

interface Props {
  title: string
  desc: string
  id?: string
}

/**
 * 홈 세 섹션 머리 — 제목 위 짧은 레드 포인트 바(32×2px) · 큰 세리프 제목 · 짧은 설명.
 * 세 기능은 동등하다: 번호·대문자 라벨 없이 제목으로만 시작점을 잡는다(2026-11-18).
 */
export default function SectionHeader({ title, desc, id }: Props) {
  return (
    <div style={{ marginBottom: 18 }}>
      <span aria-hidden="true" style={{ display: 'block', width: 32, height: 2, background: '#C8102E', borderRadius: 1, marginBottom: 12 }} />
      <h2 id={id} style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 22,
        fontWeight: 800,
        lineHeight: 1.18,
        letterSpacing: '-0.01em',
        color: '#1A1A1A',
        margin: 0,
      }}>
        {title}
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.5, color: '#78716C', margin: '6px 0 0' }}>
        {desc}
      </p>
    </div>
  )
}

const BUTTON_CSS = `
.kp-sec-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; box-sizing: border-box; margin-top: 22px; padding: 14px 18px;
  border-radius: 14px; background: #FFFFFF; border: 1px solid #D6D3D1; color: #1C1917; font-family: Inter, sans-serif; font-size: 15px; font-weight: 600;
  text-decoration: none; transition: border-color .15s, color .15s; }
.kp-sec-btn:hover, .kp-sec-btn:focus-visible { border-color: #C8102E; color: #C8102E; }
@media (min-width: 640px) { .kp-sec-btn { width: auto; min-width: 280px; margin-left: auto; margin-right: auto; } }
`

/** 섹션 맨 아래 단일 진입 버튼 — 세 섹션이 같은 아웃라인 버튼 하나씩(텍스트 링크 대신) */
export function SectionButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <>
      <style href="kp-sec-btn" precedence="default">{BUTTON_CSS}</style>
      <Link href={href} className="kp-sec-btn">
        {children} <span aria-hidden="true">→</span>
      </Link>
    </>
  )
}

/** 세 구역 사이 — 넉넉한 여백만. 구역 머리의 빨간 짧은 선이 구분을 맡아 위 헤어라인은 뺐다(2026-11-18) */
export function sectionStyle(first = false): React.CSSProperties {
  return { padding: first ? '36px 16px 44px' : '44px 16px' }
}
