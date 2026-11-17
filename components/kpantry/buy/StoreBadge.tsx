import { Store } from 'lucide-react'
import { PRICE_AS_OF, STORE_LEVEL_LABEL, type PriceTier, type StoreLevel } from '@/lib/kpantry/buyInfo'

/** 어디서 사는지 배지 + 미국 기준 상대 가격대. 숫자 가격은 쓰지 않는다 */
export default function StoreBadge({ level, price, showAsOf = false }: { level: StoreLevel; price?: PriceTier | null; showAsOf?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span className="kpb-badge" data-level={level}>
        <Store size={11} strokeWidth={2.2} aria-hidden="true" />
        {STORE_LEVEL_LABEL[level]}
      </span>
      {price && (
        <span className="kpb-small" aria-label={`Typical US price ${price.length} out of 3`}>
          Typical US price: <strong style={{ color: '#44403C' }}>{price}</strong>{showAsOf ? ` · as of ${PRICE_AS_OF}` : ''}
        </span>
      )}
    </span>
  )
}
