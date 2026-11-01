'use client'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'vegetables', label: 'Vegetables' },
  { key: 'mushrooms', label: 'Mushrooms' },
  { key: 'meat_seafood', label: 'Meat & Seafood' },
  { key: 'pantry', label: 'Pantry' },
  { key: 'etc', label: 'etc.' },
]

interface Props {
  selected: string
  onChange: (key: string) => void
}

// 언더라인 탭 — 호버 색은 인라인 스타일로 못 주므로 클래스로 둔다
const TABS_CSS = `
.kp-utabs { scrollbar-width: none; }
.kp-utabs::-webkit-scrollbar { display: none; }
.kp-utab {
  flex-shrink: 0;
  padding: 0 0 8px;
  margin-bottom: -1px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #78716C;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.kp-utab:hover { color: #292524; }
.kp-utab[aria-selected="true"] {
  font-weight: 600;
  color: #1C1917;
  border-bottom-color: #C8102E;
}
`

export default function IngredientCategoryTabs({ selected, onChange }: Props) {
  return (
    <>
      <style>{TABS_CSS}</style>
      <div
        role="tablist"
        aria-label="Ingredient categories"
        className="kp-utabs"
        style={{
          display: 'flex',
          gap: 24,
          overflowX: 'auto',
          padding: '0 16px',
          borderBottom: '1px solid #E7E5E4',
        }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            type="button"
            role="tab"
            aria-selected={selected === cat.key}
            className="kp-utab"
            onClick={() => onChange(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </>
  )
}
