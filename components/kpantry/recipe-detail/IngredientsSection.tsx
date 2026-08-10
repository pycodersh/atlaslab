'use client'
import { useState } from 'react'

interface Ingredient {
  id: string
  amount: string
  type: 'essential' | 'recommended' | 'optional'
  ingredients: {
    id: string
    name: string
    name_ko: string
    image_url?: string
  }
}

interface IngredientsSectionProps {
  recipeIngredients: Ingredient[]
  userPantryIds?: string[]
  onAddToShoppingList?: (ingredientId: string, name: string) => void
}

const TYPE_TABS = [
  { key: 'essential', label: 'Essential' },
  { key: 'recommended', label: 'Recommended' },
  { key: 'optional', label: 'Optional' },
] as const

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

export default function IngredientsSection({
  recipeIngredients,
  userPantryIds = [],
  onAddToShoppingList,
}: IngredientsSectionProps) {
  const [activeTab, setActiveTab] = useState<'essential' | 'recommended' | 'optional'>('essential')

  const byType = {
    essential: recipeIngredients.filter(ri => ri.type === 'essential'),
    recommended: recipeIngredients.filter(ri => ri.type === 'recommended'),
    optional: recipeIngredients.filter(ri => ri.type === 'optional'),
  }

  const totalCount = recipeIngredients.length

  return (
    <section style={{ padding: '0 16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 18,
          fontWeight: 700,
          color: '#1A1A1A',
          margin: 0,
        }}>
          Ingredients
        </h2>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#C4622D',
          fontWeight: 500,
        }}>
          {totalCount} items
        </span>
      </div>

      <div style={{
        display: 'flex',
        backgroundColor: '#F0EAD8',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
      }}>
        {TYPE_TABS.map(tab => {
          const count = byType[tab.key].length
          if (count === 0) return null
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#FFFFFF' : 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#1A1A1A' : '#6B6B6B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {activeTab === tab.key && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#2D5016" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
              {tab.label} {count}
            </button>
          )
        })}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
      }}>
        {byType[activeTab].map(ri => {
          const ing = ri.ingredients
          const isOwned = userPantryIds.includes(ing.id)
          const emoji = INGREDIENT_EMOJIS[ing.name] ?? '🥘'

          return (
            <div
              key={ri.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: isOwned ? '#EDF4E8' : '#F5F0E8',
                border: isOwned ? '2px solid #2D5016' : '1.5px solid #E8E0D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                position: 'relative',
              }}>
                {ing.image_url ? (
                  <img src={ing.image_url} alt={ing.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                ) : (
                  <span>{emoji}</span>
                )}

                {isOwned ? (
                  <div style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: '#2D5016',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                ) : onAddToShoppingList && (
                  <button
                    onClick={() => onAddToShoppingList(ing.id, ing.name)}
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: '#C4622D',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 2V8M2 5H8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>

              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#1A1A1A',
                fontWeight: 500,
                margin: 0,
                textAlign: 'center',
                lineHeight: 1.3,
              }}>
                {ing.name}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#9E9E9E',
                margin: 0,
                textAlign: 'center',
              }}>
                {ri.amount}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
