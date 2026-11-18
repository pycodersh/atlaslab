import { STORE_LEVEL_LABEL, type PriceTier, type StoreLevel } from '@/lib/kpantry/buyInfo'

/**
 * 어디서 사는지 + 미국 기준 상대 가격대 — 칩 없이 텍스트 한 줄(2026-11-18 2차).
 *   full:    "Where to buy: Korean or Asian market · Typical US price: $$"
 *   compact: "Korean or Asian market · $$"  (목록 행)
 * 숫자 가격은 쓰지 않는다.
 */
export default function StoreLine({ level, price, compact = false }: { level: StoreLevel; price?: PriceTier | null; compact?: boolean }) {
  if (compact) {
    return (
      <span className="kpb-small">
        {STORE_LEVEL_LABEL[level]}{price ? ` · ${price}` : ''}
      </span>
    )
  }
  return (
    <p className="kpb-p" style={{ fontSize: 14 }}>
      <span style={{ color: 'var(--kp-buy-muted)' }}>Where to buy:</span>{' '}
      <strong style={{ fontWeight: 600, color: 'var(--kp-buy-ink)' }}>{STORE_LEVEL_LABEL[level]}</strong>
      {price && (
        <>
          <span style={{ color: 'var(--kp-buy-muted)' }}> · Typical US price: </span>
          <strong style={{ fontWeight: 600, color: 'var(--kp-buy-ink)' }} aria-label={`${price.length} out of 3`}>{price}</strong>
        </>
      )}
    </p>
  )
}
