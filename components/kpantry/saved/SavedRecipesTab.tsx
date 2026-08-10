'use client'
import { useRouter } from 'next/navigation'

const DISH_EMOJIS: Record<string, string> = {
  'Kimchi Fried Rice': '🍳', 'Bulgogi': '🥩', 'Kimchi Jjigae': '🍲',
  'Bibimbap': '🥗', 'Tteokbokki': '🍢', 'Japchae': '🍜',
  'Sundubu Jjigae': '🥘', 'Doenjang Jjigae': '🍲',
}

interface SavedRecipe {
  id: string
  created_at: string
  recipes: {
    id: string
    slug: string
    name_en: string
    name_ko: string
    description: string
    cooking_time_min: number
    difficulty: string
    hero_image_url?: string
  }
}

interface Props {
  savedRecipes: SavedRecipe[]
  onUnsave: (recipeId: string) => void
  plan?: 'free' | 'pro'
  onUpgrade?: () => void
}

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Saved today'
  if (days === 1) return 'Saved yesterday'
  if (days < 7) return `Saved ${days} days ago`
  if (days < 14) return 'Saved 1 week ago'
  return `Saved ${Math.floor(days / 7)} weeks ago`
}

const FREE_LIMIT = 3

export default function SavedRecipesTab({ savedRecipes, onUnsave, plan = 'free', onUpgrade }: Props) {
  const router = useRouter()
  const isFree = plan === 'free'
  const displayedRecipes = isFree ? savedRecipes.slice(0, FREE_LIMIT) : savedRecipes
  const hiddenCount = isFree ? Math.max(0, savedRecipes.length - FREE_LIMIT) : 0

  if (savedRecipes.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <span style={{ fontSize: 48 }}>🍽</span>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          color: '#1A1A1A',
          margin: '12px 0 4px',
        }}>
          No saved recipes yet
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#9E9E9E',
          margin: '0 0 20px',
        }}>
          Tap ♡ on any recipe to save it here.
        </p>
        <button
          onClick={() => router.push('/kpantry/en/recipes')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2D5016',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Explore Recipes
        </button>
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
          Saved Recipes
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#2D5016',
            fontWeight: 600,
          }}>
            {savedRecipes.length}
          </span>
        </h3>
        <button style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#6B6B6B',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}>
          Edit
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginBottom: 16,
      }}>
        {displayedRecipes.map(({ id, created_at, recipes: recipe }) => {
          const emoji = DISH_EMOJIS[recipe.name_en] ?? '🍲'
          return (
            <div
              key={id}
              onClick={() => router.push(`/kpantry/en/recipes/${recipe.slug}`)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid #E8E0D0',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div style={{
                height: 90,
                backgroundColor: '#3D2B1A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {recipe.hero_image_url ? (
                  <img src={recipe.hero_image_url} alt={recipe.name_en}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <span>{emoji}</span>}

                <button
                  onClick={e => { e.stopPropagation(); onUnsave(recipe.id) }}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#E53E3E',
                  }}
                >
                  ♥
                </button>
              </div>

              <div style={{ padding: '8px 8px 10px' }}>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#1A1A1A',
                  margin: '0 0 2px',
                  lineHeight: 1.3,
                }}>
                  {recipe.name_en}
                </p>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 10,
                  color: '#9E9E9E',
                  margin: '0 0 4px',
                }}>
                  {recipe.description?.slice(0, 30)}...
                </p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#6B6B6B' }}>
                    ⏱ {recipe.cooking_time_min}m
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#6B6B6B' }}>
                    📊 {recipe.difficulty}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 10,
                  color: '#B0A890',
                  margin: '4px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  🔖 {getTimeAgo(created_at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {isFree && hiddenCount > 0 && (
        <div style={{
          backgroundColor: '#FDF5EE',
          borderRadius: 16,
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          border: '1.5px solid #C4622D',
        }}>
          <span style={{ fontSize: 28 }}>🔒</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>
              {hiddenCount} more recipe{hiddenCount > 1 ? 's' : ''} hidden
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B', margin: 0 }}>
              Free plan shows 3 recipes. Upgrade for unlimited.
            </p>
          </div>
          <button
            onClick={onUpgrade}
            style={{
              flexShrink: 0,
              padding: '8px 14px',
              backgroundColor: '#C4622D',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Upgrade
          </button>
        </div>
      )}

      {isFree && savedRecipes.length >= FREE_LIMIT && (
        <div style={{
          backgroundColor: '#F5F0E8',
          borderRadius: 14,
          padding: '12px 14px',
          marginBottom: 16,
          border: '1px dashed #C8C0B0',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9E9E9E', margin: 0 }}>
            Free plan: {savedRecipes.length}/{FREE_LIMIT} recipe slots used
          </p>
        </div>
      )}

      <div style={{
        backgroundColor: '#F0EAD8',
        borderRadius: 14,
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}>
        <span style={{ fontSize: 24 }}>📖</span>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#1A1A1A',
            margin: '0 0 2px',
          }}>
            Find more recipes to save
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: '#6B6B6B',
            margin: 0,
          }}>
            Explore new recipes and save your favorites for later.
          </p>
        </div>
        <button
          onClick={() => router.push('/kpantry/en/recipes')}
          style={{
            flexShrink: 0,
            padding: '8px 14px',
            backgroundColor: '#2D5016',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Explore
        </button>
      </div>
    </div>
  )
}
