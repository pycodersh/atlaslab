'use client'

import Link from 'next/link'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { SAMPLE_VOCABULARY } from '@/data/kpatto/sample-episode'
import type { KPattoLanguage } from '@/data/kpatto/types'

export default function KPattoVocabularyPage() {
  const { prefs } = usePreferences()
  const lang = (prefs.language ?? 'en') as KPattoLanguage

  // Group by category
  const byCategory = SAMPLE_VOCABULARY.reduce<Record<string, typeof SAMPLE_VOCABULARY>>((acc, v) => {
    if (!acc[v.category]) acc[v.category] = []
    acc[v.category].push(v)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/kpatto/library" style={{ color: 'var(--pt)', textDecoration: 'none', fontSize: 20 }}>‹</Link>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pm)' }}>LIBRARY</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>VOCABULARY</h1>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {Object.entries(byCategory).map(([category, words]) => (
          <div key={category} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--pm)',
              marginBottom: 8,
            }}>
              {category}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {words.map((word) => (
                <div
                  key={word.id}
                  style={{
                    background: 'var(--pb)',
                    border: '1px solid var(--border, rgba(0,0,0,0.08))',
                    borderRadius: 14,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--pt)' }}>{word.korean}</div>
                    {word.translations[lang] && (
                      <div style={{ fontSize: 13, color: 'var(--pm)', marginTop: 2 }}>
                        {word.translations[lang]}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: '#FFF7ED',
                    color: '#D97706',
                  }}>
                    {word.level.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
