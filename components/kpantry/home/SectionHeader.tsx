import Link from 'next/link'

interface Props {
  /** 제목 위 작은 대문자 태그 — 기능의 성격(FRIDGE MATCH · 103 RECIPES · BY INGREDIENT). 번호·순서는 쓰지 않는다 */
  eyebrow: string
  title: string
  desc: string
  id?: string
}

/**
 * 홈 세 섹션 머리 — 레드 대문자 아이브로우 · 세리프 제목 · 짧은 설명.
 * 세 기능은 동등하다: 번호·순서 표시 없이 아이브로우로 성격만 구분한다(2026-11-18).
 */
export default function SectionHeader({ eyebrow, title, desc, id }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: '#C8102E', margin: '0 0 6px',
      }}>
        {eyebrow}
      </p>
      <h2 id={id} style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 22,
        fontWeight: 700,
        lineHeight: 1.2,
        color: '#1A1A1A',
        margin: 0,
      }}>
        {title}
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.45, color: '#78716C', margin: '4px 0 0' }}>
        {desc}
      </p>
    </div>
  )
}

/** 섹션 맨 아래 텍스트 링크 — 섹션마다 행선지에 맞는 다른 문구 */
export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'inline-block', marginTop: 16,
      fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#C8102E', textDecoration: 'none',
    }}>
      {children} <span aria-hidden="true">→</span>
    </Link>
  )
}

/** 세 섹션의 세로 간격 — 카드 상자 대신 넉넉한 여백으로 구역을 나눈다 */
export const HOME_SECTION_PAD = '40px 16px'
