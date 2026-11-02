import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  desc: string
  /** 오른쪽 'View all →' 링크(없으면 생략) */
  viewAllHref?: string
}

/**
 * 섹션 사이 구분선(위아래 32px) — 각 섹션이 자기 맨 위에 그린다.
 * 페이지에 따로 두면 데이터가 없어 섹션이 안 그려질 때 선만 남는다.
 */
export function SectionDivider() {
  return <div role="separator" style={{ borderTop: '1px solid rgba(231, 229, 228, 0.6)', margin: '32px 0' }} />
}

/** 홈 세 섹션이 같이 쓰는 헤더 — 빨간 17px 아이콘 · 세리프 19px 굵은 제목 · 설명 13px 회색 · 아래 간격 12px */
export default function SectionHeader({ icon: Icon, title, desc, viewAllHref }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{
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
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          lineHeight: 1.45,
          color: '#78716C',
          margin: '3px 0 0',
        }}>
          {desc}
        </p>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          style={{
            flexShrink: 0,
            marginTop: 4,
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: '#78716C',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          View all <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
