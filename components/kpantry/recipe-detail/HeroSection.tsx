'use client'
import { useRouter } from 'next/navigation'

interface HeroSectionProps {
  nameEn: string
  nameKo: string
  description: string
  category: string
  cookingTimeMin: number
  difficulty: string
  heroImageUrl?: string
  isSaved: boolean
  onToggleSave: () => void
}

const CATEGORY_TAGS: Record<string, string[]> = {
  meat: ['Beef', 'Stir-fry', 'Korean BBQ'],
  stews: ['Stew', 'Korean Comfort'],
  rice: ['Rice', 'Korean Bowl'],
  noodles: ['Noodles', 'Korean'],
  side_dishes: ['Side Dish', 'Korean'],
  street_food: ['Street Food', 'Korean'],
  vegetables: ['Vegetables', 'Korean'],
}

export default function HeroSection({
  nameEn, nameKo, description, category,
  cookingTimeMin, difficulty, heroImageUrl,
  isSaved, onToggleSave,
}: HeroSectionProps) {
  const router = useRouter()
  const tags = CATEGORY_TAGS[category] ?? ['Korean']

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        height: 280,
        backgroundColor: '#2D1A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 100,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={nameEn}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>🍲</span>
        )}

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.75) 100%)',
        }} />

        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute',
            top: 52,
            left: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div style={{
          position: 'absolute',
          top: 52,
          right: 16,
          display: 'flex',
          gap: 8,
        }}>
          <button
            onClick={onToggleSave}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 16L2 9.5C2 6.46 4.46 4 7.5 4C8.46 4 9.36 4.26 10.12 4.72C10.88 4.26 11.78 4 12.75 4C15.65 4 18 6.35 18 9.25C18 12.15 15.5 14.65 13 16L9 16Z"
                stroke={isSaved ? '#E53E3E' : '#1A1A1A'}
                strokeWidth="1.5"
                fill={isSaved ? '#E53E3E' : 'none'}
              />
            </svg>
          </button>
          <button style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M12 3L15 6L12 9" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M15 6H7C5.34 6 4 7.34 4 9V15" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
        }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#FFFFFF',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                padding: '3px 10px',
                border: '1px solid rgba(255,255,255,0.4)',
              }}>
                {tag}
              </span>
            ))}
          </div>

          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 28,
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
            lineHeight: 1.1,
          }}>
            {nameEn}
          </h1>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 16,
            color: 'rgba(255,255,255,0.7)',
            margin: '4px 0 8px',
            fontStyle: 'italic',
          }}>
            {nameKo}
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: 'rgba(255,255,255,0.8)',
            margin: 0,
          }}>
            {description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/>
              <path d="M8 4.5V8L10.5 10" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              {cookingTimeMin} min
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
