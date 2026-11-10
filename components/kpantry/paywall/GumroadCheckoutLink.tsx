'use client'
import Script from 'next/script'

/**
 * K-Pantry 결제 링크 — Gumroad 오버레이(gumroad.js)로 페이지 위에 결제창을 띄운다.
 *
 * gumroad.js 가 로드되면 *.gumroad.com/l/ 상품 링크의 클릭을 가로채 페이지 위 iframe 으로 상품 결제창을 연다.
 * data-gumroad-overlay-checkout 은 붙이지 않는다 — 지금 gumroad.js 는 그 속성이 있으면 오버레이 대신
 * 주소만 결제 페이지(?wanted=true)로 바꿔 그냥 이동시킨다(2026-11-10, assets.gumroad.com/js/gumroad-bundle.js 확인).
 * 스크립트가 막히거나 늦으면 그냥 링크라 새 탭으로 Gumroad 상품 페이지가 열린다(결제는 그대로 된다).
 *
 * 스크립트는 이 링크가 있는 화면에서만 불러온다 — 전역으로 넣으면 K-PATTO 링크까지 오버레이로 바뀐다
 * (K-PATTO 는 새 탭 방식을 유지: app/kpatto/_landing/BuyButton.tsx).
 * next/script 는 같은 id 를 한 번만 불러오므로 링크가 여러 개여도 스크립트는 하나다.
 */
export default function GumroadCheckoutLink({
  href, className, style, children,
}: {
  href: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <>
      <Script id="gumroad-js" src="https://gumroad.com/js/gumroad.js" strategy="afterInteractive" />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
      >
        {children}
      </a>
    </>
  )
}
