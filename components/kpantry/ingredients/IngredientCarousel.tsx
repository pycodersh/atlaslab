'use client'
import { useState, useRef } from 'react'

const INGREDIENT_EMOJIS: Record<string, string> = {
  Kimchi: '🥬', Egg: '🥚', Rice: '🍚', 'Green Onion': '🌿',
  Onion: '🧅', Garlic: '🧄', 'Soy Sauce': '🫙', 'Sesame Oil': '🫒',
  'Sesame Seeds': '🌰', Gochugaru: '🌶', Gochujang: '🌶',
  Doenjang: '🫙', Sugar: '🍬', Salt: '🧂', Tofu: '⬜',
  Beef: '🥩', Pork: '🥩', Chicken: '🍗', Tuna: '🐟',
  Spam: '🥫', Potato: '🥔', Zucchini: '🥒', Mushroom: '🍄',
  Carrot: '🥕', Spinach: '🌿', 'Bean Sprouts': '🌱',
  'Glass Noodles': '🍜', 'Rice Cake': '🍡', 'Anchovy Broth': '🍵',
  'Perilla Oil': '🫒',
}

interface Ingredient {
  id: string
  name: string
  name_ko?: string
  image_url?: string
}

interface IngredientCarouselProps {
  ingredients: Ingredient[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export default function IngredientCarousel({
  ingredients,
  selectedIds,
  onToggle,
}: IngredientCarouselProps) {
  const [centerIndex, setCenterIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const getCardStyle = (offset: number) => {
    const absOffset = Math.abs(offset)
    const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.78 : 0.62
    const translateX = offset * 100
    const translateZ = absOffset === 0 ? 0 : absOffset === 1 ? -60 : -120
    const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.75 : 0.45
    const zIndex = 10 - absOffset * 3
    const rotateY = offset * -12

    return {
      position: 'absolute' as const,
      left: '50%',
      top: 0,
      transform: `
        translateX(calc(-50% + ${translateX}px))
        perspective(600px)
        rotateY(${rotateY}deg)
        scale(${scale})
        translateZ(${translateZ}px)
      `,
      opacity,
      zIndex,
      transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      cursor: 'pointer',
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCenterIndex(prev => Math.min(prev + 1, ingredients.length - 1))
    } else {
      setCenterIndex(prev => Math.max(prev - 1, 0))
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      handleSwipe(diff > 0 ? 'left' : 'right')
    }
    touchStartX.current = null
  }

  const visibleItems = []
  for (let offset = -2; offset <= 2; offset++) {
    const idx = centerIndex + offset
    if (idx >= 0 && idx < ingredients.length) {
      visibleItems.push({ ingredient: ingredients[idx], offset })
    }
  }

  return (
    <div style={{ padding: '8px 0 16px' }}>
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
        style={{
          position: 'relative',
          height: 220,
          overflow: 'visible',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {visibleItems.map(({ ingredient, offset }) => {
          const isCenter = offset === 0
          const isItemSelected = selectedIds.includes(ingredient.id)
          const emoji = INGREDIENT_EMOJIS[ingredient.name] ?? '🥘'

          return (
            <div
              key={ingredient.id}
              style={getCardStyle(offset)}
              onClick={() => {
                if (isCenter) {
                  onToggle(ingredient.id)
                } else {
                  setCenterIndex(centerIndex + offset)
                }
              }}
            >
              <div style={{
                width: 160,
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: '16px',
                border: isCenter && isItemSelected
                  ? '2.5px solid #2D5016'
                  : '1.5px solid #E8E0D0',
                boxShadow: isCenter
                  ? '0 8px 32px rgba(0,0,0,0.12)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 110,
                  height: 110,
                  borderRadius: 14,
                  backgroundColor: '#F5F0E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 56,
                  overflow: 'hidden',
                }}>
                  {ingredient.image_url ? (
                    <img src={ingredient.image_url} alt={ingredient.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : emoji}
                </div>

                <p style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1A1A1A',
                  margin: 0,
                  textAlign: 'center',
                }}>
                  {ingredient.name}
                </p>

                {isCenter && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 12px',
                    borderRadius: 20,
                    backgroundColor: isItemSelected ? '#EDF4E8' : '#F5F0E8',
                  }}>
                    {isItemSelected && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7L5.5 10.5L12 3.5" stroke="#2D5016" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      color: isItemSelected ? '#2D5016' : '#9E9E9E',
                    }}>
                      {isItemSelected ? 'Selected' : 'Tap to select'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
      }}>
        {Array.from({ length: Math.min(ingredients.length, 5) }).map((_, i) => {
          const sectionSize = Math.ceil(ingredients.length / 5)
          const isActive = Math.floor(centerIndex / sectionSize) === i
          return (
            <div key={i} style={{
              width: isActive ? 20 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: isActive ? '#2D5016' : '#D0C8B8',
              transition: 'all 0.2s',
            }} />
          )
        })}
      </div>
    </div>
  )
}
