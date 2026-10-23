import Link from 'next/link'
import { PURCHASE_PATH, VOICE_NAME } from '@/lib/kpatto/purchase'
import { promoBodyStyle, promoCardStyle, promoEyebrowStyle, promoTitleStyle } from '@/lib/blog/promoTheme'

/**
 * 글 하단 프로모션 — K-PATTO PDF 패키지 안내.
 * Korean 글(phrases·basics)의 본문 끝에 붙는다(붙일지는 글 상세 라우트가 판단).
 * 디자인 토큰은 ArticleAppBanner 와 공유한다(lib/blog/promoTheme) — 두 박스가 한 세트로 보이도록.
 */
export function PdfPromoBanner() {
  return (
    <aside aria-label="K-PATTO e-book package" className="promo-card" style={promoCardStyle}>
      <p style={promoEyebrowStyle} translate="no">K-PATTO E-Book Package</p>
      <h2 style={promoTitleStyle}>Master 300 Essential Korean Patterns</h2>
      <p style={promoBodyStyle}>
        Get the ultimate K-PATTO e-book package featuring 300 high-frequency patterns,
        900 native audio examples (voiced by {VOICE_NAME}), and dual formats for tablet and mobile.
      </p>
      <Link href={PURCHASE_PATH} className="promo-btn">
        Get the Premium PDF Package →
      </Link>
    </aside>
  )
}
