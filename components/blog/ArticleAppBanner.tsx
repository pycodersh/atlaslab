import Link from 'next/link'
import { ctaForPost } from '@/lib/blog/appCta'
import { promoCardStyle, promoEyebrowStyle, promoTitleStyle } from '@/lib/blog/promoTheme'

const BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const RED = '#C8102E'

/**
 * 글 안에 자연스럽게 놓이는 앱 연계 CTA.
 *
 * 카테고리에 따라 K-Patto / K-Pantry / Patto 로 붙는다(매핑은 lib/blog/appCta).
 * 팝업이 아니라 본문 흐름의 일부처럼 보이는 인라인 카드다.
 *
 * 스타일은 인라인으로 들고 다닌다 — 글 상세 라우트가 두 개고 각자 <style> 을
 * 갖고 있어, 클래스로 두면 한쪽에만 규칙이 생기는 사고가 난다.
 *
 * variant
 *   'card'   본문 최하단 풀위드 카드(기본)
 *   'inline' 본문 중간에 끼우는 한 줄짜리 서브 배너
 */
export function ArticleAppBanner({
  app,
  category,
  locale,
  variant = 'card',
}: {
  app: string
  category: string | null
  locale: string
  variant?: 'card' | 'inline'
}) {
  const cta = ctaForPost(app, category, locale)

  if (variant === 'inline') {
    return (
      <aside
        style={{
          margin: '32px 0',
          padding: '14px 0 14px 18px',
          borderLeft: `3px solid ${RED}`,
        }}
      >
        <p
          style={{
            fontFamily: BODY,
            fontSize: 14.5,
            lineHeight: 1.7,
            color: '#444',
            margin: 0,
          }}
        >
          {cta.blurb}{' '}
          <Link
            href={cta.href}
            style={{ color: RED, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            {cta.button}
          </Link>
        </p>
      </aside>
    )
  }

  return (
    <aside className="promo-card" style={promoCardStyle}>
      <p style={promoEyebrowStyle} translate="no">{cta.label}</p>
      <h2 style={promoTitleStyle}>{cta.blurb}</h2>
      <Link href={cta.href} className="promo-btn">
        {cta.button}
      </Link>
      {cta.note && (
        <p style={{ fontFamily: BODY, fontSize: 13, lineHeight: 1.5, color: '#6B6B6B', margin: '12px 0 0' }}>{cta.note}</p>
      )}
    </aside>
  )
}
