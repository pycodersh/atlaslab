import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

/** 홈 세 섹션의 id — 빠른 이동 바(HomeAnchorBar)가 이 id 로 스크롤한다. 서버·클라이언트가 같이 쓰므로 여기 둔다 */
export const HOME_SECTION_IDS = { have: 'kp-sec-have', browse: 'kp-sec-browse', by: 'kp-sec-by' } as const

/** 섹션 머리가 화면 맨 위에 딱 붙지 않게 — 이동 바로 스크롤했을 때 위쪽 여백 */
export const SECTION_SCROLL_MARGIN = 20

interface Props {
  icon: LucideIcon
  title: string
  desc: string
  id?: string
}

/**
 * 섹션 사이 구분선(위아래 32px) — 각 섹션이 자기 맨 위에 그린다.
 * 페이지에 따로 두면 데이터가 없어 섹션이 안 그려질 때 선만 남는다.
 */
export function SectionDivider() {
  return <div role="separator" style={{ borderTop: '1px solid rgba(231, 229, 228, 0.6)', margin: '32px 0' }} />
}

/**
 * 홈 세 섹션 머리 — 레드 17px 포인트 아이콘 · 세리프 19px 굵은 제목 · 짧은 설명 13px 회색.
 * 아이콘은 위 빠른 이동 바의 같은 섹션 아이콘과 같다(냄비 · 불꽃 · 장바구니).
 */
export default function SectionHeader({ icon: Icon, title, desc, id }: Props) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 id={id} style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 19,
        fontWeight: 700,
        lineHeight: 1.25,
        color: '#1A1A1A',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <Icon size={17} strokeWidth={2} color="#C8102E" aria-hidden="true" />
        {title}
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.45, color: '#78716C', margin: '3px 0 0' }}>
        {desc}
      </p>
    </div>
  )
}

/** 섹션 맨 아래 텍스트 링크 — 섹션마다 행선지에 맞는 다른 문구 */
export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'inline-block', marginTop: 14,
      fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#C8102E', textDecoration: 'none',
    }}>
      {children} <span aria-hidden="true">→</span>
    </Link>
  )
}
