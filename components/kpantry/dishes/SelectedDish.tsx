'use client'
import { BookOpen, Camera, ChartNoAxesColumn, ChefHat, Clock, Lightbulb, ShoppingBasket } from 'lucide-react'
import { META_ICON } from '@/components/kpantry/ui/icon'
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
      backgroundColor: 'var(--kp-accent-soft)',
      borderRadius: 16,
      padding: '14px',
      border: '1px solid var(--kp-rule)',
    }}>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--kp-accent)',
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
          backgroundColor: 'var(--kp-surface-muted)',
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
              <Clock {...META_ICON} />{dish.cookingTimeMin} min
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B' }}>
              <ChefHat {...META_ICON} />{dish.difficulty.charAt(0).toUpperCase() + dish.difficulty.slice(1)}
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
            color: 'var(--kp-secondary)',
            background: 'none',
            border: '1px solid var(--kp-secondary-border)',
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
            { icon: ShoppingBasket, label: 'Ingredients list' },
            { icon: Camera, label: 'Step-by-step photos' },
            { icon: ChartNoAxesColumn, label: 'Nutrition info' },
            { icon: Lightbulb, label: 'Tips & Variations' },
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
              border: '1px solid var(--kp-rule)',
            }}>
              <item.icon size={16} strokeWidth={2} color="var(--kp-icon)" aria-hidden="true" />
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
          backgroundColor: 'var(--kp-accent)',
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
        <BookOpen size={16} strokeWidth={2} aria-hidden="true" />View Recipe
      </button>
    </div>
  )
}
