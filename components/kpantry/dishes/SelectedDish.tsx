'use client'
import { useRouter } from 'next/navigation'

const DISH_EMOJIS: Record<string, string> = {
  'Kimchi Fried Rice': '🍳', 'Bulgogi': '🥩', 'Kimchi Jjigae': '🍲',
  'Bibimbap': '🥗', 'Tteokbokki': '🍢', 'Japchae': '🍜',
}

interface Props {
  dish: {
    id: string
    slug: string
    nameEn: string
    cookingTimeMin: number
    difficulty: string
    description: string
    heroImageUrl?: string
  }
  onChange: () => void
}

export default function SelectedDish({ dish, onChange }: Props) {
  const router = useRouter()
  const emoji = DISH_EMOJIS[dish.nameEn] ?? '🍲'

  return (
    <div style={{
      margin: '16px 16px 0',
      backgroundColor: '#FDF5EE',
      borderRadius: 16,
      padding: '14px',
      border: '1px solid #F0E0D0',
    }}>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        color: '#C4622D',
        margin: '0 0 8px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        Selected Dish
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          backgroundColor: '#F5E0C8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {dish.heroImageUrl ? (
            <img src={dish.heroImageUrl} alt={dish.nameEn}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : emoji}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 16,
            fontWeight: 700,
            color: '#1A1A1A',
            margin: '0 0 4px',
          }}>
            {dish.nameEn}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B' }}>
              ⏱ {dish.cookingTimeMin} min
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B' }}>
              📊 {dish.difficulty.charAt(0).toUpperCase() + dish.difficulty.slice(1)}
            </span>
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: '#9E9E9E',
            margin: '4px 0 0',
            lineHeight: 1.4,
          }}>
            {dish.description}
          </p>
        </div>

        <button
          onClick={onChange}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#C4622D',
            background: 'none',
            border: '1.5px solid #C4622D',
            borderRadius: 10,
            padding: '6px 12px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Change
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          color: '#6B6B6B',
          margin: '0 0 8px',
        }}>
          You'll see in the recipe
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { icon: '🧺', label: 'Ingredients list' },
            { icon: '📷', label: 'Step-by-step photos' },
            { icon: '📊', label: 'Nutrition info' },
            { icon: '💡', label: 'Tips & Variations' },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 4px',
              backgroundColor: '#FFFFFF',
              borderRadius: 10,
              border: '1px solid #F0E0D0',
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 9,
                color: '#6B6B6B',
                textAlign: 'center',
                lineHeight: 1.3,
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => router.push(`/kpantry/en/recipes/${dish.slug}`)}
        style={{
          marginTop: 12,
          width: '100%',
          padding: '14px',
          backgroundColor: '#C4622D',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 12,
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        📖 View Recipe
      </button>
    </div>
  )
}
