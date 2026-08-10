'use client'

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
  image_url?: string
}

interface Props {
  selectedIngredients: Ingredient[]
  onRemove: (id: string) => void
}

export default function SelectedIngredients({ selectedIngredients, onRemove }: Props) {
  if (selectedIngredients.length === 0) return null

  return (
    <div style={{
      margin: '0 16px',
      backgroundColor: '#F0EAD8',
      borderRadius: 16,
      padding: '14px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: 600,
          color: '#1A1A1A',
        }}>
          Selected {selectedIngredients.length} ingredients
        </span>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          color: '#9E9E9E',
        }}>
          Tap to remove
        </span>
      </div>

      <div style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {selectedIngredients.map(ing => {
          const emoji = INGREDIENT_EMOJIS[ing.name] ?? '🥘'
          return (
            <div key={ing.id} style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E8E0D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  overflow: 'hidden',
                }}>
                  {ing.image_url ? (
                    <img src={ing.image_url} alt={ing.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : emoji}
                </div>
                <button
                  onClick={() => onRemove(ing.id)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: '#2D5016',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M3 3L7 7M7 3L3 7" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#6B6B6B',
                textAlign: 'center',
                maxWidth: 52,
              }}>
                {ing.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
