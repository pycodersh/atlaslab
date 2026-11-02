import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/*
 * 아웃라인 버튼 — 빨간 면이 음식 사진과 겹쳐 피로해서 흰 바탕 + 얇은 회색 테두리로, 빨강은 화살표에만.
 * 호버·누름은 인라인으로 못 써서 클래스에 둔다. 누름 축소는 움직임 줄이기 설정이면 끈다.
 */
const BUTTON_CSS = `
.kp-section-btn { background: #FFFFFF; border: 1px solid #D6D3D1; transition: background-color 0.15s, border-color 0.15s, transform 0.15s; }
.kp-section-btn:hover, .kp-section-btn:focus-visible { background: #FAFAF9; border-color: #A8A29E; }
.kp-section-btn:active { transform: scale(0.99); }
@media (prefers-reduced-motion: reduce) { .kp-section-btn { transition: none; } .kp-section-btn:active { transform: none; } }
`

/** 홈 세 섹션 맨 아래 공통 버튼 — 전폭, 12px 상하 여백, 14px 글씨, 둥근 모서리 12px */
export default function SectionButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <>
      <style>{BUTTON_CSS}</style>
      <Link href={href} className="kp-section-btn" style={{
        marginTop: 16,
        padding: '12px 16px',
        borderRadius: 12,
        color: '#292524',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        textDecoration: 'none',
      }}>
        {children}
        <ArrowRight size={16} strokeWidth={2} color="#B91C1C" aria-hidden="true" style={{ flexShrink: 0 }} />
      </Link>
    </>
  )
}
