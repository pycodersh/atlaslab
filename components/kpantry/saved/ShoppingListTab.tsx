'use client'
import { MapPin, ShoppingCart, Store, X } from 'lucide-react'
import { PLACEHOLDER_ICON } from '@/components/kpantry/ui/icon'
import { useState } from 'react'
import { toggleShoppingItem, deleteShoppingItem, clearCheckedItems } from '@/lib/kpantry/saved'

const INGREDIENT_EMOJIS: Record<string, string> = {
  Kimchi: '🥬', Egg: '🥚', Rice: '🍚', 'Green Onion': '🌿',
  Onion: '🧅', Garlic: '🧄', 'Soy Sauce': '🫙', 'Sesame Oil': '🫒',
  'Sesame Seeds': '🌰', Tofu: '⬜', Beef: '🥩', Pork: '🥩',
  Chicken: '🍗', Tuna: '🐟', Spam: '🥫', Potato: '🥔',
  Zucchini: '🥒', Mushroom: '🍄', Carrot: '🥕', Spinach: '🌿',
}

interface ShoppingItem {
  id: string
  quantity?: string
  is_checked: boolean
  pantry_ingredients: { id: string; name: string; name_ko?: string; image_url?: string }
  pantry_recipes?: { id: string; name_en: string }
}

interface Props {
  items: ShoppingItem[]
  userId: string
  onRefresh: () => void
}

export default function ShoppingListTab({ items, userId, onRefresh }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggle = async (item: ShoppingItem) => {
    setLoadingId(item.id)
    await toggleShoppingItem(item.id, !item.is_checked)
    onRefresh()
    setLoadingId(null)
  }

  const handleDelete = async (itemId: string) => {
    await deleteShoppingItem(itemId)
    onRefresh()
  }

  const handleClearChecked = async () => {
    await clearCheckedItems(userId)
    onRefresh()
  }

  const unchecked = items.filter(i => !i.is_checked)
  const checked = items.filter(i => i.is_checked)

  if (items.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <ShoppingCart size={44} {...PLACEHOLDER_ICON} />
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          color: '#1A1A1A',
          margin: '12px 0 4px',
        }}>
          Your shopping list is empty
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#9E9E9E',
          margin: 0,
        }}>
          Tap + on any ingredient in a recipe to add it here.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '16px 0 12px',
      }}>
        <h3 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          fontWeight: 700,
          color: '#1A1A1A',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          Shopping List
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: 'var(--kp-accent)',
            fontWeight: 600,
          }}>
            {unchecked.length}
          </span>
        </h3>
        {checked.length > 0 && (
          <button
            onClick={handleClearChecked}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: '#9E9E9E',
              background: 'none',
              border: '1px solid var(--kp-rule)',
              borderRadius: 20,
              padding: '4px 10px',
              cursor: 'pointer',
            }}
          >
            Clear checked ({checked.length})
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {unchecked.map(item => {
          const ing = item.pantry_ingredients
          const emoji = INGREDIENT_EMOJIS[ing.name] ?? '🥘'

          return (
            <div key={item.id} style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              padding: '12px 14px',
              border: '1px solid var(--kp-rule)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <button
                onClick={() => handleToggle(item)}
                disabled={loadingId === item.id}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: '1.5px solid #D4D4D4',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />

              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: 'var(--kp-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
                overflow: 'hidden',
              }}>
                {ing.image_url ? (
                  <img src={ing.image_url} alt={ing.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : emoji}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1A1A1A',
                  margin: 0,
                }}>
                  {ing.name}
                </p>
                {item.pantry_recipes && (
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    color: '#9E9E9E',
                    margin: '2px 0 0',
                    fontStyle: 'italic',
                  }}>
                    For {item.pantry_recipes.name_en}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {item.quantity && (
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    color: '#6B6B6B',
                    backgroundColor: 'var(--kp-bg)',
                    borderRadius: 8,
                    padding: '3px 8px',
                  }}>
                    {item.quantity}
                  </span>
                )}
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: 'var(--kp-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}>
                  <Store size={14} strokeWidth={2} color="var(--kp-icon)" aria-hidden="true" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {checked.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: '#9E9E9E',
            margin: '0 0 8px',
          }}>
            Purchased ({checked.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {checked.map(item => {
              const ing = item.pantry_ingredients
              const emoji = INGREDIENT_EMOJIS[ing.name] ?? '🥘'

              return (
                <div key={item.id} style={{
                  backgroundColor: '#FAFAFA',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: '1px solid var(--kp-surface-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  opacity: 0.6,
                }}>
                  <button
                    onClick={() => handleToggle(item)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: 'var(--kp-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>

                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    backgroundColor: 'var(--kp-surface-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {emoji}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#9E9E9E',
                      margin: 0,
                      textDecoration: 'line-through',
                    }}>
                      {ing.name}
                    </p>
                    {item.pantry_recipes && (
                      <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 12,
                        color: '#8A8A8A',
                        margin: '2px 0 0',
                        fontStyle: 'italic',
                      }}>
                        For {item.pantry_recipes.name_en}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: '#D4D4D4',
                      padding: 4,
                    }}
                  >
                    <X size={14} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: 'var(--kp-accent-soft)',
        borderRadius: 16,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid var(--kp-rule)',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={20} strokeWidth={2} color="#C8102E" aria-hidden="true" />
          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--kp-accent)',
              margin: 0,
            }}>
              Find Nearby Stores
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: '#9E9E9E',
              margin: '2px 0 0',
            }}>
              Find Korean or Asian grocery stores near you.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(pos => {
                const { latitude, longitude } = pos.coords
                window.open(
                  `https://www.google.com/maps/search/Korean+grocery+store/@${latitude},${longitude},14z`,
                  '_blank'
                )
              })
            }
          }}
          style={{
            flexShrink: 0,
            padding: '10px 16px',
            backgroundColor: 'var(--kp-accent)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Find Stores
        </button>
      </div>
    </div>
  )
}
