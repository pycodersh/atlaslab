import Link from 'next/link'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'
import { SAMPLE_VOCABULARY } from '@/data/kpatto/sample-episode'

export default function KPattoLibraryPage() {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pm)' }}>
          K-PATTO
        </div>
        <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>
          LIBRARY
        </h1>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link
          href="/kpatto/library/patterns"
          style={{
            display: 'block',
            background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
            border: '1px solid #C7D2FE',
            borderRadius: 20,
            padding: '20px',
            textDecoration: 'none',
            color: 'var(--pt)',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>✏️</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>패턴</div>
          <div style={{ fontSize: 13, color: 'var(--pm)', marginTop: 4 }}>
            {KPATTO_PATTERNS.length}개 패턴
          </div>
          <div style={{ fontSize: 12, color: '#6366F1', marginTop: 8, fontWeight: 600 }}>
            패턴 목록 보기 →
          </div>
        </Link>

        <Link
          href="/kpatto/library/vocabulary"
          style={{
            display: 'block',
            background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
            border: '1px solid #FDE68A',
            borderRadius: 20,
            padding: '20px',
            textDecoration: 'none',
            color: 'var(--pt)',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📖</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>단어</div>
          <div style={{ fontSize: 13, color: 'var(--pm)', marginTop: 4 }}>
            {SAMPLE_VOCABULARY.length}개 단어
          </div>
          <div style={{ fontSize: 12, color: '#D97706', marginTop: 8, fontWeight: 600 }}>
            단어 목록 보기 →
          </div>
        </Link>
      </div>
    </div>
  )
}
