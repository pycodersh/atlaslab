'use client'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { firstSentence, guideHref, hasBuyLinks, type PriceTier, type StoreLevel } from '@/lib/kpantry/buyInfo'
import BuyButtons from './BuyButtons'
import StoreBadge from './StoreBadge'
import { BuyStyles } from './BuyStyles'

export interface PopoverIngredient {
  name: string
  name_ko?: string | null
  slug: string
  store_level: StoreLevel | null
  price_tier: PriceTier | null
  shopping_tip: string | null
  substitute: string | null
  buy_query: string | null
  weee_query?: string | null
}

interface Props {
  ingredient: PopoverIngredient
  /** 눌린 재료 이름의 화면 위치 — 데스크톱 팝오버를 그 아래(공간이 없으면 위)에 띄운다 */
  anchor: DOMRect
  recipeSlug?: string
  onClose: () => void
}

const SHEET_MAX_WIDTH = 640
const POP_WIDTH = 300

/** 재료 이름을 누르면 뜨는 구매 요약 — 데스크톱은 팝오버, 640px 미만은 바텀 드로어 */
export default function IngredientPopover({ ingredient: ing, anchor, recipeSlug, onClose }: Props) {
  const [sheet, setSheet] = useState(true)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const isSheet = window.innerWidth < SHEET_MAX_WIDTH
    setSheet(isSheet)
    if (isSheet || !ref.current) return
    const h = ref.current.offsetHeight
    const left = Math.min(Math.max(anchor.left + anchor.width / 2 - POP_WIDTH / 2, 8), window.innerWidth - POP_WIDTH - 8)
    const below = anchor.bottom + 8
    const top = below + h > window.innerHeight - 8 ? Math.max(8, anchor.top - h - 8) : below
    setPos({ top, left })
  }, [anchor])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    // 스크롤하면 기준점이 움직이므로 데스크톱 팝오버는 닫는다
    const onScroll = () => { if (window.innerWidth >= SHEET_MAX_WIDTH) onClose() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    // preventScroll — 포커스가 페이지를 스크롤시키면 위의 onScroll 이 팝오버를 바로 닫는다
    ref.current?.focus({ preventScroll: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [onClose])

  const sub = firstSentence(ing.substitute, 160)

  return (
    <>
      <BuyStyles />
      <div className="kpb-backdrop" data-sheet={sheet} onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal={sheet}
        aria-label={`${ing.name}: where to buy`}
        tabIndex={-1}
        className={`kpb-card ${sheet ? 'kpb-sheet' : 'kpb-pop'}`}
        style={sheet ? undefined : { top: pos?.top ?? anchor.bottom + 8, left: pos?.left ?? 8, visibility: pos ? 'visible' : 'hidden', outline: 'none' }}
      >
        {sheet && <div className="kpb-grab" aria-hidden="true" />}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <p className="kpb-h" style={{ fontSize: 18 }}>{ing.name}</p>
            {ing.name_ko && <p className="kpb-small" lang="ko">{ing.name_ko}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#A8A29E' }}>
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {ing.store_level && (
          <div style={{ marginTop: 10 }}>
            <StoreBadge level={ing.store_level} price={ing.price_tier} />
          </div>
        )}

        {ing.shopping_tip && <p className="kpb-p" style={{ fontSize: 13, marginTop: 10 }}>{ing.shopping_tip}</p>}
        {sub && (
          <p className="kpb-p" style={{ fontSize: 13, marginTop: 8 }}>
            <strong>No Korean market?</strong> {sub}
          </p>
        )}

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          {ing.store_level === 'common' ? (
            <span className="kpb-small">Available at any grocery store</span>
          ) : hasBuyLinks(ing) ? (
            <BuyButtons query={ing.buy_query} weeeQuery={ing.weee_query} ingredientSlug={ing.slug} ingredientName={ing.name} recipeSlug={recipeSlug} placement="popover" />
          ) : <span />}
          <Link href={guideHref(ing.slug)} className="kpb-link">Learn more →</Link>
        </div>
      </div>
    </>
  )
}
