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
/** 런칭 특가 — Gumroad 상품 가격과 반드시 같게 둔다 */
export const KPANTRY_PRICE = clean(process.env.NEXT_PUBLIC_KPANTRY_PRICE) || '$14.99'
/** 취소선으로 보이는 정상가 */
export const KPANTRY_LIST_PRICE = clean(process.env.NEXT_PUBLIC_KPANTRY_LIST_PRICE) || '$24.99'

export const KPANTRY_PRODUCT_NAME = 'K-Pantry Lifetime All-Access Pass'

/** 환불 보증 기간 — app/kpantry/en/refund 의 정책 문구(7일)와 같아야 한다. 바꿀 땐 둘 다 바꾼다 */
export const REFUND_DAYS = 7

/**
 * 언락 모달의 혜택 목록 — 지금 앱에 실제로 있는 것만 적는다.
 * (요청안의 스마트 타이머·재료 대체 가이드·1~4인분 자동 계산은 아직 없는 기능이라 넣지 않았다)
 */
export const LIFETIME_BENEFITS = [
  'Complete access to all 103 authentic Korean recipes',
  'Step-by-step visual cooking guide for every dish',
  '+1 / +2 ingredient suggestions from your pantry',
  'Unlimited saved recipes and shopping list',
  'Lifetime updates with upcoming seasonal recipes',
]

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
