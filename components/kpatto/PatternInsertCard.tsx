'use client'

import type { KPattoPattern, KPattoLanguage } from '@/data/kpatto/types'

interface PatternInsertCardProps {
  pattern: KPattoPattern
  displayLang: KPattoLanguage
}

export function PatternInsertCard({ pattern, displayLang }: PatternInsertCardProps) {
  const translation = pattern.translations[displayLang]

  return (
    <div style={{
      margin: '20px 0',
      background: 'linear-gradient(135deg, var(--pk-light, #EEF2FF), var(--pb, #fff))',
      border: '2px solid var(--pk, #6B8CFF)',
      borderRadius: 16,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          background: 'var(--pk, #6B8CFF)',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.06em',
          padding: '3px 8px',
          borderRadius: 99,
        }}>
          PATTERN
        </span>
        <span style={{ fontSize: 11, color: 'var(--pm, #666)', fontWeight: 600 }}>
          {pattern.level.toUpperCase()}
        </span>
      </div>

      {/* Pattern */}
      <div style={{
        fontSize: 20,
        fontWeight: 800,
        color: 'var(--pt, #111)',
        marginBottom: 4,
        fontFamily: 'var(--font-baloo, sans-serif)',
      }}>
        {pattern.korean}
      </div>

      {/* Structure */}
      <div style={{
        fontSize: 12,
        color: 'var(--pm, #666)',
        background: 'rgba(107,140,255,0.08)',
        borderRadius: 8,
        padding: '4px 10px',
        display: 'inline-block',
        marginBottom: 8,
      }}>
        {pattern.structure}
      </div>

      {/* Translation */}
      {translation && (
        <div style={{
          fontSize: 14,
          color: 'var(--pk, #6B8CFF)',
          fontWeight: 600,
          marginBottom: 12,
        }}>
          {translation}
        </div>
      )}

      {/* Examples */}
      {pattern.examples.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(107,140,255,0.2)', paddingTop: 10 }}>
          {pattern.examples.map((ex, i) => (
            <div key={i} style={{ marginBottom: i < pattern.examples.length - 1 ? 8 : 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--pt, #111)' }}>
                {ex.korean}
              </div>
              {ex.translations[displayLang] && (
                <div style={{ fontSize: 12, color: 'var(--pm, #888)', marginTop: 2 }}>
                  {ex.translations[displayLang]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
