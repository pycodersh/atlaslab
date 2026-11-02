import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * 홈 세 섹션 맨 아래 공통 버튼 — 전폭 브랜드 레드, 12px 상하 여백, 14px 글씨, 둥근 모서리 12px.
 * 호버·누름 색은 layout 의 :is(a):hover 가 --kp-accent 를 바꿔서 처리한다.
 */
export default function SectionButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      marginTop: 16,
      padding: '12px 16px',
      borderRadius: 12,
      backgroundColor: 'var(--kp-accent)',
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      whiteSpace: 'nowrap',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      textDecoration: 'none',
      transition: 'background-color 0.15s',
    }}>
      {children}
      <ArrowRight size={16} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
    </Link>
  )
}
