'use client'
import { useState, useRef } from 'react'

const DISH_EMOJIS: Record<string, string> = {
  'Kimchi Fried Rice': '🍳', 'Bulgogi': '🥩', 'Kimchi Jjigae': '🍲',
  'Bibimbap': '🥗', 'Doenjang Jjigae': '🍲', 'Tteokbokki': '🍢',
  'Japchae': '🍜', 'Sundubu Jjigae': '🥘', 'Egg Rice Bowl': '🍳',
  'Steamed Egg': '🥚', 'Kimchi Pancake': '🥞', 'Galbitang': '🍖',
  'Dakgalbi': '🍗', 'Kongnamul Muchim': '🌱', 'Gyeran Mari': '🥚',
  'Dakdoritang': '🍗', 'Sigeumchi Namul': '🌿', 'Gamja Tang': '🦴',
  'Budae Jjigae': '🍲', 'Hobak Jeon': '🥒', 'Jangjorim': '🥩',
  'Miyeok Guk': '🌊', 'Sogogi Muguk': '🍜', 'Ramyeon Upgrade': '🍜',
  'Dubu Jorim': '⬜', 'Oi Muchim': '🥒',
}

interface Dish {
  id: string
  slug: string
  name_en: string
  name_ko: string
  description: string
  cooking_time_min: number
  difficulty: string
  calories: number
  hero_image_url?: string
}

interface DishCarouselProps {
  dishes: Dish[]
  onSelect: (dish: Dish) => void
}

export default function DishCarousel({ dishes, onSelect }: DishCarouselProps) {
  const [centerIndex, setCenterIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const getCardStyle = (offset: number) => {
    const absOffset = Math.abs(offset)
    const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.76 : 0.6
    const translateX = offset * 110
    const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.7 : 0.4
    const zIndex = 10 - absOffset * 3
    const rotateY = offset * -14

    return {
      position: 'absolute' as const,
      left: '50%',
      top: 0,
      transform: `
        translateX(calc(-50% + ${translateX}px))
        perspective(700px)
        rotateY(${rotateY}deg)
        scale(${scale})
      `,
      opacity,
      zIndex,
      transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      cursor: 'pointer',
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCenterIndex(prev => Math.min(prev + 1, dishes.length - 1))
      else setCenterIndex(prev => Math.max(prev - 1, 0))
    }
    touchStartX.current = null
  }

  const visibleItems = []
  for (let offset = -2; offset <= 2; offset++) {
    const idx = centerIndex + offset
    if (idx >= 0 && idx < dishes.length) {
      visibleItems.push({ dish: dishes[idx], offset })
    }
  }

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 9H14M4 9L7 6M4 9L7 12" stroke="#9E9E9E" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9E9E9E' }}>
          Swipe left or right to browse
        </span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M14 9H4M14 9L11 6M14 9L11 12" stroke="#9E9E9E" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>

      <div
        style={{ position: 'relative', height: 340 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {visibleItems.map(({ dish, offset }) => {
          const isCenter = offset === 0
          const emoji = DISH_EMOJIS[dish.name_en] ?? '🍲'

          return (
            <div
              key={dish.id}
              style={getCardStyle(offset)}
              onClick={() => {
                if (isCenter) onSelect(dish)
                else setCenterIndex(centerIndex + offset)
              }}
            >
              <div style={{
                width: 200,
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                overflow: 'hidden',
                border: '1.5px solid #E8E0D0',
                boxShadow: isCenter
                  ? '0 12px 40px rgba(0,0,0,0.14)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <div style={{
                  height: 160,
                  backgroundColor: '#3D2B1A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 72,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {dish.hero_image_url ? (
                    <img src={dish.hero_image_url} alt={dish.name_en}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <span>{emoji}</span>}

                  {isCenter && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: 20,
                      padding: '3px 10px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#C4622D',
                    }}>
                      📊 {dish.difficulty.charAt(0).toUpperCase() + dish.difficulty.slice(1)}
                    </div>
                  )}

                  {isCenter && (
                    <button style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}>
                      ♡
                    </button>
                  )}
                </div>

                <div style={{ padding: '14px 14px 16px' }}>
                  <h3 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#1A1A1A',
                    margin: '0 0 4px',
                    textAlign: 'center',
                  }}>
                    {dish.name_en}
                  </h3>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    color: '#9E9E9E',
                    margin: '0 0 8px',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}>
                    {dish.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B' }}>
                      ⏱ {dish.cooking_time_min} min
                    </span>
                    {dish.calories && (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B' }}>
                        🔥 {dish.calories} kcal
                      </span>
                    )}
                  </div>

                  {isCenter && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(dish) }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#C4622D',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 12,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
        {Array.from({ length: Math.min(dishes.length, 5) }).map((_, i) => {
          const sectionSize = Math.ceil(dishes.length / 5)
          const isActive = Math.floor(centerIndex / sectionSize) === i
          return (
            <div key={i} style={{
              width: isActive ? 20 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: isActive ? '#C4622D' : '#D0C8B8',
              transition: 'all 0.2s',
            }} />
          )
        })}
      </div>
    </div>
  )
}
