'use client'

import Link from 'next/link'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPATTO_PATTERNS } from '@/data/kpatto/patterns'
import type { KPattoLanguage } from '@/data/kpatto/types'

export default function KPattoPatternsPage() {
  const { prefs } = usePreferences()
  const lang = (prefs.language ?? 'en') as KPattoLanguage

  return (
    <div style={{ minHeight: '100vh', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 24 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/kpatto/library" style={{ color: 'var(--pt)', textDecoration: 'none', fontSize: 20 }}>‹</Link>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pm)' }}>LIBRARY</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>PATTERNS</h1>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {KPATTO_PATTERNS.map((pattern) => (
          <div
            key={pattern.id}
            style={{
              background: 'var(--pb)',
              border: '1px solid var(--border, rgba(0,0,0,0.08))',
              borderRadius: 16,
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                background: '#EEF2FF',
                color: '#4F46E5',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 99,
              }}>
                {pattern.level.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--pt)', marginBottom: 4 }}>
              {pattern.korean}
            </div>
            <div style={{ fontSize: 12, color: 'var(--pm)', marginBottom: 6 }}>{pattern.structure}</div>
            {pattern.translations[lang] && (
              <div style={{ fontSize: 14, color: '#6366F1', fontWeight: 600 }}>
                {pattern.translations[lang]}
              </div>
            )}
            {pattern.examples.length > 0 && (
              <div style={{
                marginTop: 12,
                padding: '10px 12px',
                background: 'var(--pb-alt, rgba(0,0,0,0.03))',
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--pt)' }}>
                  {pattern.examples[0].korean}
                </div>
                {pattern.examples[0].translations[lang] && (
                  <div style={{ fontSize: 11, color: 'var(--pm)', marginTop: 2 }}>
                    {pattern.examples[0].translations[lang]}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
