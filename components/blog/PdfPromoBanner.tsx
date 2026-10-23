import Link from 'next/link'
import { PURCHASE_PATH, VOICE_NAME } from '@/lib/kpatto/purchase'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", "Inter", system-ui, sans-serif'

// 웜 로즈 베이지 + 테라코타 브릭 + 에스프레소 — 에디토리얼 매거진 톤
const ROSE_BEIGE = '#F4E6E0'
const ROSE_LINE = '#E7CFC4'
const BRICK = '#B4502E'
const BRICK_DARK = '#9A4125'
const ESPRESSO = '#2B1D17'
const MUTED = '#6B544A'

/**
 * 글 하단 프로모션 — K-PATTO PDF 패키지 안내.
 * Korean phrases / Korean basics 글의 본문 끝에 붙는다(붙일지는 글 상세 라우트가 판단).
 * 글 상세가 라우트 두 개라 스타일은 인라인으로 들고 다닌다(ArticleAppBanner 와 같은 이유).
 */
export function PdfPromoBanner() {
  return (
    <aside
      aria-label="K-PATTO e-book package"
      style={{
        background: ROSE_BEIGE,
        border: `1px solid ${ROSE_LINE}`,
        borderTop: `4px solid ${BRICK}`,
        padding: '34px 20px 32px',
        margin: '40px 0 8px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: BODY, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: BRICK, margin: '0 0 12px',
        }}
      >
        K-PATTO E-Book Package
      </p>
      <h2
        style={{
          fontFamily: SERIF, fontSize: 26, fontWeight: 700, lineHeight: 1.25,
          letterSpacing: '-0.01em', color: ESPRESSO, margin: '0 auto 14px', maxWidth: 480,
        }}
      >
        Master 300 Essential Korean Patterns
      </h2>
      <p
        style={{
          fontFamily: BODY, fontSize: 15, lineHeight: 1.7, color: MUTED,
          margin: '0 auto 24px', maxWidth: 520,
        }}
      >
        Get the ultimate K-PATTO e-book package featuring 300 high-frequency patterns,
        900 native audio examples (voiced by {VOICE_NAME}), and dual formats for tablet and mobile.
      </p>
      <Link
        href={PURCHASE_PATH}
        style={{
          display: 'inline-block', background: BRICK, color: '#FFFFFF',
          padding: '13px 22px', fontFamily: BODY, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
          letterSpacing: '0.01em', textDecoration: 'none',
          boxShadow: `0 1px 0 ${BRICK_DARK}`,
        }}
      >
        Get the Premium PDF Package →
      </Link>
    </aside>
  )
}
