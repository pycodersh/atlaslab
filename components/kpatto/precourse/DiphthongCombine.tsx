'use client'

import { useState } from 'react'
import type { DiphthongGridStep } from '@/data/kpatto/precourse/types'
import type { KPattoLanguage } from '@/data/kpatto/types'
import { precourseAudioUrl } from '@/lib/kpatto/audio-url'
import { getUI } from '@/lib/kpatto/ui-strings'
import { usePreferences } from '@/contexts/PreferencesContext'
import { AudioButton } from './AudioButton'

interface Props { step: DiphthongGridStep; lang: KPattoLanguage; lessonId: number }

export function DiphthongGrid({ step, lang, lessonId }: Props) {
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)
  const [tab, setTab] = useState<'primary' | 'secondary'>('primary')

  return (
    <div style={{ padding: '0 20px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--pt)' }}>
        {step.title[lang] ?? step.title.en}
      </h3>
      {step.note && (
        <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--pm)' }}>
          {step.note[lang] ?? step.note.en}
        </p>
      )}

      {/* Tab */}
      {step.secondary && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['primary', 'secondary'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                border: 'none',
                background: tab === t ? '#FF6B8C' : 'rgba(0,0,0,0.06)',
                color: tab === t ? '#fff' : 'var(--pm)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {t === 'primary' ? ui.dg_tab_core : ui.dg_tab_ref}
            </button>
          ))}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
      }}>
        {(tab === 'primary' ? step.primary : (step.secondary ?? [])).map((item, i) => (
          <div key={i} style={{
            background: 'var(--pb)',
            border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
            borderRadius: 14,
            padding: '12px 8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#FF6B8C', marginBottom: 4 }}>
              {item.char}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FF6B8C', marginBottom: 4 }}>
              {item.romanization}
            </div>
            {item.composition && (
              <div style={{
                marginBottom: 6,
                fontSize: 10,
                color: 'var(--pm)',
                background: 'rgba(255,107,140,0.08)',
                borderRadius: 6,
                padding: '2px 6px',
                display: 'inline-block',
              }}>
                {item.composition}
              </div>
            )}
            <div style={{ marginTop: 6 }}>
              <AudioButton id={`diph-${lessonId}-${item.char}`} audioUrl={precourseAudioUrl(lessonId, item.char)} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
