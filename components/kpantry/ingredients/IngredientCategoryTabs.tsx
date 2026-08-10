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

export default function IngredientCategoryTabs({ selected, onChange }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      padding: '0 16px',
      scrollbarWidth: 'none',
    }}>
      {CATEGORIES.map(cat => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          style={{
            flexShrink: 0,
            padding: '8px 16px',
            borderRadius: 20,
            border: selected === cat.key ? 'none' : '1px solid #E8E0D0',
            backgroundColor: selected === cat.key ? '#2D5016' : '#FFFFFF',
            color: selected === cat.key ? '#FFFFFF' : '#6B6B6B',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: selected === cat.key ? 600 : 400,
            cursor: 'pointer',
          } as React.CSSProperties}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
