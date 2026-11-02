import type { Metadata } from 'next'
import HomeLink from '@/components/kpantry/layout/HomeLink'
import PageBanner from '@/components/kpantry/layout/PageBanner'
import EssentialsGrid from '@/components/kpantry/essentials/EssentialsGrid'

export const metadata: Metadata = {
  title: 'The 8 Korean Essentials · K-Pantry',
}

/** 기본 양념·재료 8가지 — 하나를 고르면 그 재료가 들어가는 레시피 목록으로 */
export default function EssentialsPage() {
  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24 }}>
      <PageBanner src="/kpantry/banner-essentials.jpg" back={<HomeLink />} />
      {/* 제목·간격은 Recipes·재료 화면과 같은 틀 — 배너 페이드 구간에 20px 겹친다 */}
      <div style={{ position: 'relative', marginTop: -20, padding: '0 20px 16px' }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 28,
          fontWeight: 700,
          color: '#1A1A1A',
          margin: 0,
        }}>
          The 8 Korean Essentials
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#6B6B6B',
          margin: '2px 0 0',
        }}>
          Tap a staple to see every dish made with it.
        </p>
      </div>

      <div style={{ padding: '0 16px' }}>
        <EssentialsGrid />
      </div>
    </div>
  )
}
