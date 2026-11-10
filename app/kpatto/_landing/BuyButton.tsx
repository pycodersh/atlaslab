import GumroadOverlayLink from '@/components/checkout/GumroadOverlayLink'

/**
 * 가격 카드의 구매 버튼 — Gumroad 오버레이로 랜딩 위에 결제창을 띄운다(K-Pantry 와 같은 방식).
 * 예전엔 새 탭으로 열었다. 오버레이 조건(target 없음 · data-gumroad-overlay-checkout 없음)은
 * components/checkout/GumroadOverlayLink.tsx 주석 참고. 스크립트가 막히면 같은 탭에서 Gumroad 상품 페이지로 간다.
 * 사전 주문(출시 알림) 모달은 상품이 정식 출시되면서 없앴다.
 */
export function BuyButton({ href, label, className }: { href: string; label: string; className: string }) {
  return (
    <GumroadOverlayLink href={href} className={className}>
      {label}
    </GumroadOverlayLink>
  )
}
