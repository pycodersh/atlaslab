'use client'
import { CookingPot, Flame, ShoppingBasket } from 'lucide-react'
import { trackHomePathClick } from '@/lib/kpantry/analytics'
import { HOME_SECTION_IDS } from './SectionHeader'

const CSS = `
/* 세 개가 한 줄에 다 들어가게 — 균등 폭, 375px 에서는 글자·여백을 줄인다(가로 스크롤 없음) */
.kp-anchors { display: flex; gap: 6px; }
.kp-anchor { flex: 1 1 0; min-width: 0; display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 9px 6px; border-radius: 999px;
  background: #FFFFFF; border: 1px solid #E7E5E4; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600; color: #292524;
  text-decoration: none; white-space: nowrap; transition: border-color .15s, color .15s; }
@media (min-width: 420px) { .kp-anchors { gap: 8px; } .kp-anchor { gap: 6px; padding: 10px 12px; font-size: 13px; } }
.kp-anchor:hover, .kp-anchor:focus-visible { border-color: #C8102E; color: #C8102E; }
`

/**
 * 히어로 바로 아래 한 줄 — 홈의 세 기능으로 바로 내려가는 알약 3개(누르면 그 섹션으로 부드럽게 스크롤).
 * 링크는 #섹션id 라 스크립트 없이도 이동한다. GA4 home_path_click(path) 은 그대로 남긴다.
 */
export default function HomeAnchorBar({ recipeCount }: { recipeCount: number | null }) {
  const items = [
    { path: 'have' as const, id: HOME_SECTION_IDS.have, label: 'Fridge Match', Icon: CookingPot },
    { path: 'browse' as const, id: HOME_SECTION_IDS.browse, label: recipeCount ? `${recipeCount} Recipes` : 'All Recipes', Icon: Flame },
    { path: 'by_ingredient' as const, id: HOME_SECTION_IDS.by, label: 'By Ingredient', Icon: ShoppingBasket },
  ]

  const go = (e: React.MouseEvent, id: string, path: (typeof items)[number]['path']) => {
    trackHomePathClick({ path })
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav aria-label="Jump to a section">
      <style>{CSS}</style>
      <div className="kp-anchors">
        {items.map(({ path, id, label, Icon }) => (
          <a key={path} href={`#${id}`} className="kp-anchor" onClick={e => go(e, id, path)}>
            <Icon size={14} strokeWidth={2} color="#C8102E" aria-hidden="true" style={{ flexShrink: 0 }} />
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}
