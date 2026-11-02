'use client'

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
  accentColor?: string
}

export default function CategoryTabs({
  selected,
  onChange,
  counts = {},
  accentColor = 'var(--kp-accent)',
}: CategoryTabsProps) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      padding: '0 16px',
      scrollbarWidth: 'none',
    }}>
      {EXPLORE_CATEGORIES.map(cat => (
        <button
          key={cat.key}
          type="button"
          aria-pressed={selected === cat.key}
          onClick={() => onChange(cat.key)}
          style={{
            flexShrink: 0,
            padding: '8px 16px',
            borderRadius: 20,
            border: selected === cat.key ? '1px solid transparent' : '1px solid var(--kp-rule)',
            backgroundColor: selected === cat.key ? accentColor : '#FFFFFF',
            color: selected === cat.key ? '#FFFFFF' : '#6B6B6B',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: selected === cat.key ? 600 : 400,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {cat.label}{counts[cat.key] != null ? ` (${counts[cat.key]})` : ''}
        </button>
      ))}
    </div>
  )
}
