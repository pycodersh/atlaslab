interface NutritionBarProps {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  servings?: number
}

const NUTRITION_ITEMS = [
  { key: 'calories',  label: 'kcal',    unit: '' },
  { key: 'proteinG',  label: 'Protein', unit: 'g' },
  { key: 'carbsG',    label: 'Carbs',   unit: 'g' },
  { key: 'fatG',      label: 'Fat',     unit: 'g' },
]

export default function NutritionBar({
  calories, proteinG, carbsG, fatG,
}: NutritionBarProps) {
  const values: Record<string, number> = { calories, proteinG, carbsG, fatG }

  return (
    <div style={{
      margin: '16px 16px 0',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {NUTRITION_ITEMS.map((item, idx) => (
        <div
          key={item.key}
          style={{
            flex: 1,
            textAlign: 'center',
            borderLeft: idx > 0 ? '1px solid #F0EBE3' : 'none',
          }}
        >
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            color: '#111111',
            margin: '0 0 3px',
            lineHeight: 1,
          }}>
            {values[item.key] ?? '—'}{item.unit}
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            color: '#999999',
            margin: 0,
          }}>
            {item.label}
          </p>
        </div>
      ))}
    </div>
  )
}
