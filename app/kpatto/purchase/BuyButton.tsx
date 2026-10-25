'use client'

import { CHECKOUT_URL } from '@/lib/kpatto/purchase'

export const PRICE = '$19.99'
export const LIST_PRICE = '$24.99'

/**
 * 히어로·결제 섹션이 함께 쓰는 단일 구매 버튼.
 * 결제가 아직 연동되지 않아 누르면 안내 alert 만 띄운다.
 * NEXT_PUBLIC_PDF_CHECKOUT_URL 이 채워지면 그 링크로 가는 버튼이 된다(코드 수정 없이 활성화).
 */
export function BuyButton() {
  const label = `Buy the Premium Package - ${PRICE}`
  if (CHECKOUT_URL) {
    return <a href={CHECKOUT_URL} className="pp-btn pp-buy" rel="noopener noreferrer">{label}</a>
  }
  return (
    <button
      type="button"
      className="pp-btn pp-buy"
      onClick={() => alert('Checkout coming soon! Stay tuned.')}
    >
      {label}
    </button>
  )
}
