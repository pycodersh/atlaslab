import { permanentRedirect } from 'next/navigation'
import { LANDING_PATH, PRICING_ANCHOR } from '@/lib/kpatto/purchase'

/** 옛 E-Book 판매 페이지 — 판매는 /kpatto 랜딩 한 곳으로 모았다. 기존 링크는 가격 섹션으로 보낸다. */
export default function KPattoPurchaseRedirect() {
  permanentRedirect(`${LANDING_PATH}#${PRICING_ANCHOR}`)
}
