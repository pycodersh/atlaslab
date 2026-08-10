'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSelectedDish, SelectedDish } from '@/lib/kpantry/dishes'

const IMG_URL = process.env.NEXT_PUBLIC_IMG_WANT_TO_COOK

export default function WantToCookCard() {
  const router = useRouter()
  const [selectedDish, setSelectedDish] = useState<SelectedDish | null>(null)

  useEffect(() => {
    setSelectedDish(getSelectedDish())
  }, [])

  const displayName = selectedDish?.nameEn ?? 'Bulgogi'
  const displayTime = selectedDish?.cookingTimeMin ?? 30
  const displayDiff = selectedDish
    ? selectedDish.difficulty.charAt(0).toUpperCase() + selectedDish.difficulty.slice(1)
    : 'Easy'

  return (
    <div style={{
      margin: '0 16px 12px',
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
            backgroundColor: '#FDF0E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#C4622D"/>
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
            I Want to<br />Cook
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#6B6B6B',
            margin: '6px 0 0',
          }}>
            Choose a dish you want<br />and get what you need.
          </p>
        </div>

        <div style={{
          width: 120,
          height: 120,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#F5E8D8',
        }}>
          {IMG_URL ? (
            <img src={IMG_URL} alt="Cooking"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 52,
            }}>🍳</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: '14px', backgroundColor: '#FDF5EE', borderRadius: 14, border: '1px solid #F0E0D0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 16,
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
          }}>
            {displayName}
          </p>
          <button
            onClick={() => router.push('/kpantry/en/dishes')}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: '#C4622D',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Change
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B' }}>⏱ {displayTime} min</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B' }}>📊 {displayDiff}</span>
        </div>
      </div>

      <button
        onClick={() => selectedDish
          ? router.push(`/kpantry/en/recipes/${selectedDish.slug}`)
          : router.push('/kpantry/en/dishes')
        }
        style={{
          marginTop: 12,
          width: '100%',
          padding: '16px',
          backgroundColor: '#C4622D',
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
        📖 View Recipe
      </button>
    </div>
  )
}
