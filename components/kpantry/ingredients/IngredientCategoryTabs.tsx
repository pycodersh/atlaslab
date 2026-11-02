'use client'
import { UNDERLINE_TABS_CSS } from '@/components/kpantry/ui/underlineTabs'

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
    <>
      <style>{UNDERLINE_TABS_CSS}</style>
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
