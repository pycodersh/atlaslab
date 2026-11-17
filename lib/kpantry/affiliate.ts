/**
 * K-Pantry 재료 구매 링크 — Amazon·Weee! 검색 결과로 보낸다(특정 상품 링크가 아니다).
 *
 * 제휴 태그는 환경변수로만 켠다. 둘 다 비어 있으면 일반 검색 링크이고 고지 문구도 숨는다.
 *   NEXT_PUBLIC_AMAZON_TAG        Amazon Associates 트래킹 ID (예: kpantry-20) → &tag=<값>
 *   NEXT_PUBLIC_WEEE_REF_PARAMS   Weee! 제휴 가입 후 받는 쿼리 그대로 (예: referral_id=ABC123) → &<값>
 *                                 Weee! 제휴 파라미터 이름이 공개돼 있지 않아 이름째로 받는다.
 * NEXT_PUBLIC_* 는 빌드 때 박히므로 값을 넣은 뒤 재배포해야 반영된다.
 *
 * 링크에는 태그 유무와 상관없이 rel="noopener sponsored" 를 붙인다(BUY_LINK_REL).
 */

const clean = (v: string | undefined) => (v ?? '').replace(/^﻿/, '').trim()

const AMAZON_TAG = clean(process.env.NEXT_PUBLIC_AMAZON_TAG)
const WEEE_REF_PARAMS = clean(process.env.NEXT_PUBLIC_WEEE_REF_PARAMS).replace(/^[?&]/, '')

export const BUY_LINK_REL = 'noopener sponsored'

export function buildAmazonIngredientUrl(query: string): string {
  const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`
  return AMAZON_TAG ? `${url}&tag=${encodeURIComponent(AMAZON_TAG)}` : url
}

/** weee.com 검색 — sayweee.com 도 이 주소로 리다이렉트된다(2026-11-17 확인) */
export function buildWeeeIngredientUrl(query: string): string {
  const url = `https://www.weee.com/en/search?keyword=${encodeURIComponent(query)}`
  return WEEE_REF_PARAMS ? `${url}&${WEEE_REF_PARAMS}` : url
}

export function isAffiliateActive(): boolean {
  return Boolean(AMAZON_TAG || WEEE_REF_PARAMS)
}
