import Link from 'next/link'

interface Props {
  title: string
  desc: string
  id?: string
}

/**
 * 홈 세 섹션 머리 — 에디토리얼 2단 구분선 · 세리프 제목 · 짧은 설명.
 * 구분선: 컨테이너 전체 폭 1px 웜그레이(#DFDAD2) 위, 왼쪽 시작점에 44×3px 브랜드 레드 바가 겹친다(2026-11-21).
 * 세 기능은 동등하다: 번호·대문자 라벨 없이 제목으로만 시작점을 잡는다.
 */
export default function SectionHeader({ title, desc, id }: Props) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div aria-hidden="true" style={{ position: 'relative', height: 3, marginBottom: 18 }}>
        <span style={{ position: 'absolute', left: 0, right: 0, top: 1, height: 1, background: '#DFDAD2' }} />
        <span style={{ position: 'absolute', left: 0, top: 0, width: 44, height: 3, background: '#C8102E' }} />
      </div>
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

/**
 * 세 구역 사이 — 구분선은 각 구역 머리(SectionHeader)가 그린다.
 * 아래 여백 48px: 구역 맨 아래 버튼과 다음 구역 구분선 사이를 넉넉히(2026-11-21).
 */
export function sectionStyle(first = false): React.CSSProperties {
  return { padding: first ? '32px 16px 48px' : '0 16px 48px' }
}
