import { ArrowUpRight } from 'lucide-react'
import { META_ICON } from '@/components/kpantry/ui/icon'
import { KPANTRY_CHECKOUT_URL, KPANTRY_PRICE } from '@/lib/kpantry/purchase'

/** Gumroad 상품 페이지로 가는 구매 버튼(새 탭). 결제 링크가 설정되지 않았으면 아무것도 그리지 않는다 */
export default function BuyProButton() {
  if (!KPANTRY_CHECKOUT_URL) return null

  return (
    <a
      href={KPANTRY_CHECKOUT_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        width: '100%',
        padding: '16px',
        backgroundColor: 'var(--kp-accent)',
        color: '#FFFFFF',
        borderRadius: 14,
        fontFamily: 'Inter, sans-serif',
        fontSize: 15,
        fontWeight: 600,
        textAlign: 'center',
        textDecoration: 'none',
        boxSizing: 'border-box',
      }}
    >
      {KPANTRY_PRICE ? `Get K-Pantry Pro — ${KPANTRY_PRICE}` : 'Get K-Pantry Pro'}<ArrowUpRight {...META_ICON} style={{ ...META_ICON.style, marginRight: 0, marginLeft: 4 }} />
    </a>
  )
}
