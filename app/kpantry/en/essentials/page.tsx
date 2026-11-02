import type { Metadata } from 'next'
import HomeLink from '@/components/kpantry/layout/HomeLink'
import EssentialsGrid from '@/components/kpantry/essentials/EssentialsGrid'

export const metadata: Metadata = {
  title: 'The 8 Korean Essentials · K-Pantry',
}

/** 기본 양념·재료 8가지 — 하나를 고르면 그 재료가 들어가는 레시피 목록으로 */
export default function EssentialsPage() {
  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', padding: '40px 16px 24px' }}>
      <div style={{ padding: '0 4px 20px' }}>
        <div style={{ marginBottom: 14 }}><HomeLink /></div>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.2,
          color: '#1C1917',
          margin: 0,
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
