'use client'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { uniqueBuyIngredients, type RecipeBuyIngredient } from './RecipeBuySection'
import { BuyStyles } from './BuyStyles'

const BUTTON_CSS = `
.kpb-entry { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; box-sizing: border-box; padding: 14px 18px;
  border-radius: 14px; background: #FFFFFF; border: 1px solid #D6D3D1; color: #1C1917; font-family: Inter, sans-serif; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: border-color .15s, color .15s; }
.kpb-entry:hover, .kpb-entry:focus-visible { border-color: #C8102E; color: #C8102E; }
`

/** "Gochujang, Bean Sprouts" / "Gochujang, Bean Sprouts and 1 more" */
function nameList(names: string[]) {
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`
}

/**
 * 재료 그리드 바로 아래 — "Where to buy these ingredients →" 직사각형 아웃라인 버튼(홈 섹션 버튼과 같은 모양).
 * 누르면 구매 시트. 장보기 안내 문구(BuySummary)는 본문이 아니라 시트 맨 위에 있다(2026-11-21).
 */
export default function BuyEntryButton({ onOpen }: { onOpen: (el: HTMLElement) => void }) {
  return (
    <div style={{ padding: '0 16px 24px' }}>
      <style href="kpb-entry" precedence="default">{BUTTON_CSS}</style>
      <button type="button" className="kpb-entry" aria-haspopup="dialog" onClick={e => onOpen(e.currentTarget)}>
        <ShoppingBag size={17} strokeWidth={1.8} aria-hidden="true" />
        Where to buy these ingredients
        <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}

/** 구매 시트 맨 위 장보기 안내 — 한인 마트가 필요한 재료 요약, 없으면 "일반 마트에서 다 산다" */
export function BuySummary({ ingredients }: { ingredients: RecipeBuyIngredient[] }) {
  const korean = uniqueBuyIngredients(ingredients).filter(i => i.store_level === 'korean_asian')
  const n = korean.length
  return (
    <p className="kpb-p" style={{ fontSize: 14, margin: '0 0 22px', padding: '12px 14px', background: '#FFFFFF', border: '1px solid var(--kp-buy-rule)', borderRadius: 12 }}>
      <BuyStyles />
      {n === 0
        ? 'All ingredients are available at regular grocery stores.'
        : `${n} ${n === 1 ? 'ingredient needs' : 'ingredients need'} a Korean or Asian market — ${nameList(korean.map(i => i.name))}. Everything else is at a regular grocery store.`}
    </p>
  )
}
