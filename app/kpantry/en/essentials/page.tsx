import type { Metadata } from 'next'
import HomeLink from '@/components/kpantry/layout/HomeLink'
import EssentialsGrid from '@/components/kpantry/essentials/EssentialsGrid'

export const metadata: Metadata = {
  title: 'The 8 Korean Essentials · K-Pantry',
}

/** 홈 목차 03 — 기본 양념·재료 8가지, 하나를 고르면 그 재료가 들어가는 레시피 목록으로 */
export default function EssentialsPage() {
  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', padding: '40px 16px 24px' }}>
      <div style={{ padding: '0 4px 20px' }}>
        <div style={{ marginBottom: 14 }}><HomeLink /></div>
        <p style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.04em',
          fontVariantNumeric: 'lining-nums',
          color: '#C8102E',
          margin: 0,
        }}>
          03
        </p>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.2,
          color: '#1C1917',
          margin: '4px 0 0',
        }}>
          The 8 Korean Essentials
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          lineHeight: 1.5,
          color: '#78716C',
          margin: '6px 0 0',
        }}>
          Tap a staple to see every dish made with it.
        </p>
      </div>

      <EssentialsGrid />
    </div>
  )
}
