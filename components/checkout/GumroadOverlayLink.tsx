'use client'
import Script from 'next/script'

/**
 * Gumroad 결제 링크 — gumroad.js 오버레이로 지금 페이지 위에 결제창을 띄운다(K-PATTO · K-Pantry 공용).
 *
 * gumroad.js 가 로드되면 *.gumroad.com/l/ 상품 링크의 클릭을 가로채(preventDefault) 페이지 위 iframe 으로
 * 상품 결제창을 연다. 페이지 안에서 나중에 생긴 링크(모달 속 버튼)도 MutationObserver 로 잡는다.
 *
 * data-gumroad-overlay-checkout 은 붙이지 않는다 — 지금 gumroad.js 는 그 속성이 있으면 오버레이 대신
 * 주소만 결제 페이지(?wanted=true)로 바꿔 그냥 이동시킨다(2026-11-10, assets.gumroad.com/js/gumroad-bundle.js 확인).
 * target="_blank" 도 두지 않는다 — 스크립트가 막히면 같은 탭에서 Gumroad 상품 페이지로 가서 결제는 그대로 된다.
 *
 * 스크립트는 이 링크가 있는 화면에서만 불러온다. next/script 는 같은 id 를 한 번만 불러오므로 링크가 여러 개여도 하나다.
 * 주의: 스크립트는 그 페이지의 모든 *.gumroad.com/l/ 링크를 오버레이로 바꾼다.
 */
export default function GumroadOverlayLink({
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
      <a href={href} className={className} style={style}>
        {children}
      </a>
    </>
  )
}
