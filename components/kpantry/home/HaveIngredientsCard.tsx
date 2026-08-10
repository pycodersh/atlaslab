'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPantryEssentials } from '@/lib/kpantry/ingredients'

const MY_INGREDIENTS = [
  { name: 'Kimchi',       emoji: '🥬' },
  { name: 'Egg',          emoji: '🥚' },
  { name: 'Rice',         emoji: '🍚' },
  { name: 'Green Onion',  emoji: '🌿' },
  { name: 'Onion',        emoji: '🧅' },
]
const EXTRA_COUNT = 4

const IMG_URL = process.env.NEXT_PUBLIC_IMG_INGREDIENTS

type IngRow = { id: string; name: string; image_url: string | null }

export default function HaveIngredientsCard() {
  const router = useRouter()
  const [dbData, setDbData] = useState<IngRow[]>([])

  useEffect(() => {
    getPantryEssentials(MY_INGREDIENTS.map(i => i.name))
      .then(data => setDbData((data as IngRow[]) ?? []))
      .catch(() => {})
  }, [])

  // Merge hardcoded list with DB image_url
  const ingredients = MY_INGREDIENTS.map(item => {
    const row = dbData.find(d => d.name === item.name)
    return { ...item, imageUrl: row?.image_url ?? null }
  })

  return (
    <div style={{
      margin: '20px 16px 12px',
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #E8E0D0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: '#EDF4E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="15" rx="2" stroke="#2D5016" strokeWidth="1.5"/>
              <path d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6" stroke="#2D5016" strokeWidth="1.5"/>
              <path d="M8 11H16M8 15H12" stroke="#2D5016" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 22,
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
            lineHeight: 1.2,
          }}>
            I Have<br />Ingredients
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#6B6B6B',
            margin: '6px 0 0',
          }}>
            Find recipes with<br />the ingredients you have.
          </p>
        </div>

        {/* Right card image */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#F0EAD8',
        }}>
          {IMG_URL ? (
            <img src={IMG_URL} alt="Ingredients"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 52,
            }}>🧺</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
            My Ingredients
          </span>
          <button
            onClick={() => router.push('/kpantry/en/ingredients')}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: '#2D5016',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Edit
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto' }}>
          {ingredients.map((ing) => (
            <div key={ing.name} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
            }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: '#F5F0E8',
                border: '1px solid #E8E0D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                overflow: 'hidden',
              }}>
                {ing.imageUrl ? (
                  <img
                    src={ing.imageUrl}
                    alt={ing.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        e.currentTarget.style.display = 'none'
                        const span = document.createElement('span')
                        span.textContent = ing.emoji
                        parent.appendChild(span)
                      }
                    }}
                  />
                ) : (
                  <span>{ing.emoji}</span>
                )}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#6B6B6B', textAlign: 'center' }}>
                {ing.name}
              </span>
            </div>
          ))}

          {/* +N badge */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: '#F5F0E8',
              border: '1px solid #E8E0D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: '#6B6B6B',
            }}>
              +{EXTRA_COUNT}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push('/kpantry/en/recipes?mode=pantry')}
        style={{
          marginTop: 16,
          width: '100%',
          padding: '16px',
          backgroundColor: '#111111',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 14,
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        Find Recipes
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5"/>
          <path d="M8 6L12 10L8 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <p style={{
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        color: '#9E9E9E',
        margin: '8px 0 0',
      }}>
        💡 See what you can cook with what you have!
      </p>
    </div>
  )
}
