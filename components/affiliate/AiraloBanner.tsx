import type { ReactNode } from 'react'
import { AIRALO_URL } from '@/lib/affiliate/links'

/** Airalo 포인트 오렌지 — 버튼에만 쓴다(카드 자체는 italki 배너와 같은 중립 톤) */
const ORANGE = '#FF6600'
const ORANGE_DARK = '#E05A00'

/**
 * Airalo eSIM 제휴 배너 — Explore Korea · Food · Life 글 본문 바로 아래(italki 배너 자리).
 * 노출 그룹과 글당 제휴 배너 2개 상한은 글 상세 라우트가 정한다.
 *
 * 카드 모양 · 간격 · 꺾이는 폭(640px)은 ItalkiBanner 와 같다 — 버튼만 Airalo 오렌지.
 * 본문 .blog-prose 바깥에 놓이므로 스타일을 컴포넌트 안에 둔다.
 */
export function AiraloBanner() {
  return (
    <aside className="arl-banner" aria-label="Sponsored">
      <style>{`
        .arl-banner {
          background: #FBFBFA;
          border: 1px solid rgba(229,229,229,.8);
          border-radius: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
          padding: 24px;
          margin: 48px 0;
        }
        .arl-row { display: flex; flex-direction: column; align-items: stretch; justify-content: space-between; gap: 20px; }
        .arl-eyebrow { display: block; font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: #737373; margin: 0 0 8px; }
        .arl-title { font-size: 18px; font-weight: 600; line-height: 1.35; color: #171717; margin: 0; }
        .arl-desc { font-size: 14px; line-height: 1.6; color: #525252; margin: 4px 0 0; max-width: 576px; }
        .arl-btn {
          display: block; text-align: center; white-space: nowrap;
          padding: 12px 20px; border-radius: 12px;
          background: ${ORANGE}; color: #fff; text-decoration: none;
          font-size: 14px; font-weight: 600; line-height: 1.2;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
          transition: background-color .15s;
        }
        .arl-btn:hover { background: ${ORANGE_DARK}; color: #fff; }
        .arl-btn:focus-visible { outline: 3px solid #171717; outline-offset: 2px; }
        @media (min-width: 640px) {
          .arl-banner { padding: 32px; }
          .arl-row { flex-direction: row; align-items: center; gap: 24px; }
          .arl-btn { display: inline-block; flex-shrink: 0; }
          .arl-title { font-size: 20px; }
        }
      `}</style>
      <div className="arl-row">
        <div>
          <span className="arl-eyebrow">Travel essential</span>
          <p className="arl-title">Stay Connected Across Korea with Airalo eSIM</p>
          <p className="arl-desc">
            Instant connectivity upon landing. No physical SIM card swaps, no airport queues. Fast 4G/5G data coverage
            nationwide.
          </p>
        </div>
        <a href={AIRALO_URL} target="_blank" rel="noopener noreferrer sponsored" className="arl-btn">
          Get Korea eSIM →
        </a>
      </div>
    </aside>
  )
}

/**
 * 본문(MDX) 안의 Airalo 인라인 링크 — <AiraloLink>Airalo eSIM</AiraloLink>.
 * 주소를 원고에 박지 않고 AIRALO_URL 을 읽어서, 추적 링크로 바꿀 때 글을 다시 발행하지 않아도 된다.
 */
export function AiraloLink({ children }: { children?: ReactNode }) {
  return (
    <a href={AIRALO_URL} target="_blank" rel="noopener noreferrer sponsored">
      {children}
    </a>
  )
}
