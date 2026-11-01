'use client'
import { ingredientEmoji } from '@/lib/kpantry/ingredientEmoji'

interface Ingredient {
  id: string
  name: string
  name_ko?: string
  image_url?: string
}

interface IngredientGridProps {
  ingredients: Ingredient[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

// 열 최소 폭을 max(80px, 1/4 폭)으로 잡아 4열을 넘지 않고, 좁은 화면(~375px)에서는 3열로 떨어진다
const GRID_COLUMNS = 'repeat(auto-fill, minmax(max(80px, calc((100% - 30px) / 4)), 1fr))'

export default function IngredientGrid({
  ingredients,
  selectedIds,
  onToggle,
}: IngredientGridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: GRID_COLUMNS,
      gap: 10,
      padding: '12px 16px 16px',
    }}>
      {ingredients.map(ingredient => {
        const isSelected = selectedIds.includes(ingredient.id)

        return (
          <button
            key={ingredient.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(ingredient.id)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '8px 6px 10px',
              backgroundColor: isSelected ? '#EDF4E8' : '#FFFFFF',
              border: isSelected ? '2px solid #2D5016' : '1px solid #E8E0D0',
              // 테두리 두께(1px↔2px)가 바뀌어도 카드 크기가 흔들리지 않게 margin 으로 보정한다
              margin: isSelected ? 0 : 1,
              borderRadius: 14,
              cursor: 'pointer',
              transition: 'background-color 0.15s, border-color 0.15s',
            }}
          >
            <div style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: 10,
              backgroundColor: '#F5F0E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              overflow: 'hidden',
            }}>
              {ingredient.image_url ? (
                <img src={ingredient.image_url} alt="" loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : ingredientEmoji(ingredient.name)}
            </div>

            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: isSelected ? 600 : 500,
              color: '#1A1A1A',
              textAlign: 'center',
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {ingredient.name}
            </span>

            {isSelected && (
              <span aria-hidden="true" style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#2D5016',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L5.5 10.5L12 3.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
