'use client'
import { UNDERLINE_TABS_CSS } from '@/components/kpantry/ui/underlineTabs'

/**
 * key 는 pantry_recipes.category 값. vegetables(9개)는 요청 목록에 없었지만 빼면
 * All 에서만 보이는 레시피가 생겨서 맨 끝에 둔다.
 */
export const EXPLORE_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'stews', label: 'Stews & Soups' },
  { key: 'rice', label: 'Rice' },
  { key: 'noodles', label: 'Noodles' },
  { key: 'meat', label: 'Meat' },
  { key: 'side_dishes', label: 'Side Dishes' },
  { key: 'street_food', label: 'Street Food' },
  { key: 'vegetables', label: 'Vegetables' },
]

interface CategoryTabsProps {
  selected: string
  onChange: (key: string) => void
  /** 탭 옆 괄호 숫자 — 넘긴 키만 붙는다 */
  counts?: Record<string, number>
}

/** 재료 화면(IngredientCategoryTabs)과 같은 언더라인 탭 */
export default function CategoryTabs({
  selected,
  onChange,
  counts = {},
}: CategoryTabsProps) {
  return (
    <>
      <style>{UNDERLINE_TABS_CSS}</style>
      <div
        role="tablist"
        aria-label="Recipe categories"
        className="kp-utabs"
        style={{
          display: 'flex',
          gap: 24,
          overflowX: 'auto',
          padding: '0 16px',
          borderBottom: '1px solid #E7E5E4',
        }}
      >
        {EXPLORE_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            type="button"
            role="tab"
            aria-selected={selected === cat.key}
            className="kp-utab"
            onClick={() => onChange(cat.key)}
          >
            {cat.label}{counts[cat.key] != null ? ` (${counts[cat.key]})` : ''}
          </button>
        ))}
      </div>
    </>
  )
}
