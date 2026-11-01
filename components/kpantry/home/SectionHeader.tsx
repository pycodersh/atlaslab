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

/** 홈 세 섹션이 같이 쓰는 헤더 — 제목 17px · 설명 13px 회색 · 아래 간격 12px */
export default function SectionHeader({ icon: Icon, title, desc, viewAllHref }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 17,
          fontWeight: 700,
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
          color: '#6B6B6B',
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
            marginTop: 1,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--kp-secondary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          View all <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
