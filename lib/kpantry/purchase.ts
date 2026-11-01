/**
 * K-Pantry Pro 판매 — Gumroad 평생 이용권(라이선스 키) 한 상품.
 *
 * 결제 링크·가격은 Gumroad 상품을 만든 뒤 환경 변수로 넣는다(2026-11-01 기준 상품 없음):
 *   NEXT_PUBLIC_KPANTRY_CHECKOUT_URL  Gumroad 상품 페이지(예: https://zizou7.gumroad.com/l/...)
 *   NEXT_PUBLIC_KPANTRY_PRICE         화면에 보일 가격(예: $9.99)
 *   GUMROAD_KPANTRY_PRODUCT_ID        서버 전용 — 키 확인용 상품 ID(lib/kpatto/gumroad.ts)
 * 결제 링크가 없으면 구매 버튼을 숨기고 키 입력만 보인다(가짜 버튼을 두지 않는다).
 */
const clean = (v: string | undefined) => (v ?? '').replace(/^﻿/, '').trim()

export const KPANTRY_CHECKOUT_URL = clean(process.env.NEXT_PUBLIC_KPANTRY_CHECKOUT_URL)
export const KPANTRY_PRICE = clean(process.env.NEXT_PUBLIC_KPANTRY_PRICE)

export const PRO_BENEFITS = [
  'See +1 / +2 ingredient suggestions',
  'Save unlimited recipes',
  'Shopping list with store finder',
  'Save your pantry ingredients',
]

export const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/kpantry/en/refund', label: 'Refund Policy' },
]
