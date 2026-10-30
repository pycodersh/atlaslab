import Link from 'next/link'
import { ctaForPost } from '@/lib/blog/appCta'

const BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const RED = '#C8102E'

/**
 * 글 안에 자연스럽게 놓이는 앱 연계 CTA.
 *
 * 카테고리에 따라 K-Patto / K-Pantry / Patto 로 붙는다(매핑은 lib/blog/appCta).
 * 팝업이 아니라 본문 흐름의 일부처럼 보이는 인라인 카드다.
 *
 * 스타일은 컴포넌트가 들고 다닌다(인라인 · 자체 <style>) — 글 상세 라우트가 두 개고 각자 <style> 을
 * 갖고 있어, 라우트 쪽 클래스로 두면 한쪽에만 규칙이 생기는 사고가 난다.
 *
 * variant
 *   'card'   본문 최하단 카드(기본) — italki 배너와 같은 카드: 왼쪽 카피 · 오른쪽 레드 버튼, 폰은 세로로 쌓는다
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

  // 카드 모양 · 간격 · 꺾이는 폭(640px)은 바로 위의 ItalkiBanner 와 같게 맞춘다 — 버튼만 사이트 레드
  return (
    <aside className="kpc-banner">
      <style>{`
        .kpc-banner {
          background: #FBFBFA;
          border: 1px solid rgba(229,229,229,.8);
          border-radius: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
          padding: 24px;
          margin: 48px 0;
          font-family: ${BODY};
        }
        .kpc-row { display: flex; flex-direction: column; align-items: stretch; justify-content: space-between; gap: 20px; }
        .kpc-eyebrow { display: block; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: ${RED}; margin: 0 0 8px; }
        .kpc-title { font-size: 18px; font-weight: 600; line-height: 1.35; color: #171717; margin: 0; }
        .kpc-note { font-size: 14px; line-height: 1.6; color: #525252; margin: 6px 0 0; max-width: 576px; }
        /* 버튼 크기는 italki 배너와 같다: 폰 가로 전체 × 48, 넓은 화면 190 × 48 */
        .kpc-btn {
          display: flex; align-items: center; justify-content: center; white-space: nowrap;
          width: 100%; height: 48px; padding: 0 16px; box-sizing: border-box; border-radius: 12px;
          background: ${RED}; color: #fff; text-decoration: none;
          font-size: 14px; font-weight: 600; line-height: 1.2;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
          transition: background-color .15s;
        }
        .kpc-btn:hover { background: #A30D25; color: #fff; }
        .kpc-btn:focus-visible { outline: 3px solid #171717; outline-offset: 2px; }
        @media (min-width: 640px) {
          .kpc-banner { padding: 32px; }
          .kpc-row { flex-direction: row; align-items: center; gap: 24px; }
          .kpc-btn { width: 190px; flex-shrink: 0; }
          .kpc-title { font-size: 20px; }
        }
      `}</style>
      <div className="kpc-row">
        <div>
          <span className="kpc-eyebrow" translate="no">{cta.label}</span>
          <p className="kpc-title">{cta.blurb}</p>
          {cta.note && <p className="kpc-note">{cta.note}</p>}
        </div>
        <Link href={cta.href} className="kpc-btn">
          {cta.button}
        </Link>
      </div>
    </aside>
  )
}
