import Link from 'next/link'
import { ArrowRight, CookingPot } from 'lucide-react'
import SectionHeader from './SectionHeader'

/**
 * 홈 섹션 1 — 재료로 레시피 찾기. 머리는 섹션 2·3 과 같은 SectionHeader,
 * 본문은 그 아래 풀 폭 버튼 하나(/ingredients).
 */
export default function CookWithIngredientsCard() {
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
          width: '100%',
          boxSizing: 'border-box',
          padding: '14px 16px',
          borderRadius: 12,
          backgroundColor: 'var(--kp-accent)',
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        Select Ingredients &amp; Find Recipes
        <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
      </Link>
    </section>
  )
}
