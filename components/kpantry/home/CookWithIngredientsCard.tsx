'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CookingPot } from 'lucide-react'
import { getPantryEssentials } from '@/lib/kpantry/ingredients'
import SectionHeader from './SectionHeader'

/** 냉장고에 흔히 있는 재료 미리보기 — 사진이 오기 전·없을 때는 이모지(두부는 맞는 이모지가 없어 사진만 의미가 있다) */
const STAPLES = [
  { name: 'Rice',   emoji: '🍚' },
  { name: 'Kimchi', emoji: '🥬' },
  { name: 'Egg',    emoji: '🥚' },
  { name: 'Onion',  emoji: '🧅' },
  { name: 'Beef',   emoji: '🥩' },
  { name: 'Tofu',   emoji: '⬜' },
]

/**
 * 홈 섹션 1 — 재료로 레시피 찾기. 머리는 섹션 2·3 과 같은 SectionHeader,
 * 본문은 재료 칩 미리보기 + 빨간 버튼이 든 카드. 카드 전체가 /ingredients 링크다.
 */
export default function CookWithIngredientsCard() {
  const [images, setImages] = useState<Record<string, string>>({})

  useEffect(() => {
    getPantryEssentials(STAPLES.map(s => s.name))
      .then(rows => setImages(Object.fromEntries(
        (rows ?? []).filter(r => r.image_url).map(r => [r.name, r.image_url as string]),
      )))
      .catch(() => {})
  }, [])

  return (
    <section style={{ padding: '12px 16px 0' }}>
      <SectionHeader
        icon={CookingPot}
        title="Cook with What You Have"
        desc="Select ingredients in your fridge to discover matching recipes."
      />

      <Link
        href="/kpantry/en/ingredients"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 16,
          backgroundColor: '#FAFAF9',
          border: '1px solid rgba(231, 229, 228, 0.8)',
          borderRadius: 16,
          textDecoration: 'none',
        }}
      >
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          fontWeight: 600,
          color: '#78716C',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Popular Fridge Staples
        </span>

        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STAPLES.map(s => (
            <span key={s.name} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px 6px 6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E5E4',
              borderRadius: 8,
              boxShadow: '0 1px rgba(0,0,0,0.05)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              color: '#44403C',
            }}>
              {images[s.name] ? (
                <img src={images[s.name]} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span aria-hidden="true" style={{ width: 18, textAlign: 'center', fontSize: 13, lineHeight: 1 }}>{s.emoji}</span>
              )}
              {s.name}
            </span>
          ))}
        </span>

        <span style={{
          padding: '12px 16px',
          borderRadius: 12,
          backgroundColor: 'var(--kp-accent)',
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}>
          Select Ingredients &amp; Find Recipes
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </Link>
    </section>
  )
}
