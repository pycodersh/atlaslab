import Link from 'next/link'

interface Props {
  /** 홈 "3가지 길" 카드와 같은 번호 — 섹션이 그 카드의 미리보기라는 걸 잇는다 */
  num: 1 | 2 | 3
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

/** 카드·섹션 번호 — 레드 테두리 원 안의 숫자 */
export function PathNumber({ num, size = 22 }: { num: 1 | 2 | 3; size?: number }) {
  return (
    <span aria-hidden="true" style={{
      width: size, height: size, flexShrink: 0, borderRadius: '50%',
      border: '1.5px solid #C8102E', color: '#C8102E',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', fontSize: Math.round(size * 0.52), fontWeight: 700, lineHeight: 1,
    }}>{num}</span>
  )
}

/**
 * 홈 세 섹션 머리 — 번호 · 세리프 19px 굵은 제목 · 설명 13px 회색.
 * 다른 화면으로 가는 길은 섹션 맨 아래 텍스트 링크(SectionLink) 하나로 통일한다.
 */
export default function SectionHeader({ num, title, desc, id }: Props) {
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
        gap: 8,
      }}>
        <PathNumber num={num} size={20} />
        {title}
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.45, color: '#78716C', margin: '4px 0 0' }}>
        {desc}
      </p>
    </div>
  )
}

/** 섹션 맨 아래 텍스트 링크 `See all … →` — 예전 연한 알약 버튼 대신 */
export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="kp-section-link" style={{
      display: 'inline-block', marginTop: 14,
      fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#C8102E', textDecoration: 'none',
    }}>
      {children} <span aria-hidden="true">→</span>
    </Link>
  )
}
