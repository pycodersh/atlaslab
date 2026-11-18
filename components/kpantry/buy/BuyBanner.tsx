'use client'
import { ShoppingBasket } from 'lucide-react'
import { uniqueBuyIngredients, type RecipeBuyIngredient } from './RecipeBuySection'
import { BuyStyles } from './BuyStyles'

/** "Gochujang, Bean Sprouts" / "Gochujang, Bean Sprouts and 1 more" */
function nameList(names: string[]) {
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`
}

/**
 * 재료 목록 바로 아래 한 줄 배너 — 펼쳐진 구매 섹션 대신(2026-11-18 2차).
 * 한인 마트가 필요한 재료가 있으면 배너 전체가 버튼(누르면 구매 시트), 없으면 링크 없는 한 줄.
 */
export default function BuyBanner({ ingredients, onOpen }: { ingredients: RecipeBuyIngredient[]; onOpen: (el: HTMLElement) => void }) {
  const korean = uniqueBuyIngredients(ingredients).filter(i => i.store_level === 'korean_asian')
  const icon = <ShoppingBasket size={16} strokeWidth={1.75} color="#78716C" aria-hidden="true" style={{ flexShrink: 0 }} />

  if (korean.length === 0) {
    return (
      <div style={{ padding: '0 16px 20px' }}>
        <BuyStyles />
        <p className="kpb-banner">{icon}All ingredients are available at regular grocery stores</p>
      </div>
    )
  }

  const n = korean.length
  return (
    <div style={{ padding: '0 16px 20px' }}>
      <BuyStyles />
      <button type="button" className="kpb-banner" aria-haspopup="dialog" onClick={e => onOpen(e.currentTarget)}>
        {icon}
        <span>
          {n} {n === 1 ? 'ingredient needs' : 'ingredients need'} a Korean market — {nameList(korean.map(i => i.name))}
        </span>
        <span className="kpb-banner-go">Where to buy ›</span>
      </button>
    </div>
  )
}
