'use client'

import { useRef, useState } from 'react'
import { PreorderModal } from './PreorderModal'

/**
 * 가격 카드의 구매 버튼.
 * Gumroad 상품 URL 이 있으면 class="gumroad-button" 링크 — gumroad.js 가 오버레이 결제창으로 띄운다
 * (스크립트가 막히거나 늦게 뜨면 평범한 링크로 새 창에서 열린다).
 * URL 이 비어 있으면 사전 주문 모달을 연다.
 */
export function BuyButton({ href, label, product, price, className }: {
  href: string
  label: string
  product: string
  price: string
  className: string
}) {
  const [open, setOpen] = useState(false)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  if (href) {
    return (
      <a href={href} className={`gumroad-button ${className}`} target="_blank" rel="noopener noreferrer" data-gumroad-overlay-checkout="true">
        {label}
      </a>
    )
  }

  return (
    <>
      <button type="button" ref={openerRef} className={className} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <PreorderModal
          product={product}
          price={price}
          onClose={() => { setOpen(false); openerRef.current?.focus() }}
        />
      )}
    </>
  )
}
