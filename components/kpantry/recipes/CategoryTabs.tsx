'use client'

const EXPLORE_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'stews', label: 'Stews' },
  { key: 'rice', label: 'Rice' },
  { key: 'noodles', label: 'Noodles' },
  { key: 'side_dishes', label: 'Side Dishes' },
  { key: 'meat', label: 'Meat' },
  { key: 'vegetables', label: 'Vegetables' },
]

interface CategoryTabsProps {
  selected: string
  onChange: (key: string) => void
  accentColor?: string
}

export default function CategoryTabs({
  selected,
  onChange,
  accentColor = '#2D5016',
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
          onClick={() => onChange(cat.key)}
          style={{
            flexShrink: 0,
            padding: '8px 16px',
            borderRadius: 20,
            border: selected === cat.key ? 'none' : '1px solid #E8E0D0',
            backgroundColor: selected === cat.key ? accentColor : '#FFFFFF',
            color: selected === cat.key ? '#FFFFFF' : '#6B6B6B',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: selected === cat.key ? 600 : 400,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
