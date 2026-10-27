/**
 * 가격 카드의 구매 버튼 — Gumroad 정식 상품 페이지를 새 탭으로 연다.
 * 랜딩을 떠나지 않게 새 탭이고, gumroad.js 오버레이는 쓰지 않는다(오버레이가 새 탭 대신 창을 띄우므로).
 * 사전 주문(출시 알림) 모달은 상품이 정식 출시되면서 없앴다.
 */
export function BuyButton({ href, label, className }: { href: string; label: string; className: string }) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  )
}
