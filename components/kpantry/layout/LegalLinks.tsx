import Link from 'next/link'
import { LEGAL_LINKS } from '@/lib/kpantry/purchase'

interface Props {
  /** 앞에 붙일 문장(가입 모달의 동의 문구 등) */
  prefix?: string
  style?: React.CSSProperties
}

/** Privacy · Terms · Refund Policy 링크 한 줄 — 푸터·결제·가입 화면이 같이 쓴다 */
export default function LegalLinks({ prefix, style }: Props) {
  return (
    <p style={{
      fontFamily: 'Inter, sans-serif',
      fontSize: 12,
      lineHeight: 1.6,
      color: '#6B6B6B',
      textAlign: 'center',
      margin: 0,
      ...style,
    }}>
      {prefix && <>{prefix}{' '}</>}
      {LEGAL_LINKS.map((l, i) => (
        <span key={l.href}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          <Link href={l.href} style={{ color: '#2D5016', fontWeight: 600, textDecoration: 'underline' }}>
            {l.label}
          </Link>
        </span>
      ))}
    </p>
  )
}
