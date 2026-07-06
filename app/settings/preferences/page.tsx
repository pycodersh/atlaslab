'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sun, Moon, Mic, Globe, Check, Waves } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useTheme } from '@/components/ThemeProvider'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useT } from '@/hooks/useT'
import {
  type SpeechRate, type Language,
  SPEECH_RATE_LABELS, LANGUAGE_LABELS,
} from '@/lib/settings/preferences'

// ── Shared ────────────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.86)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07)',
  overflow: 'hidden',
}

function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
      background: 'rgba(255,255,255,0.72)',
      border: '1px solid rgba(220,225,235,0.80)',
      boxShadow: '0 1px 4px rgba(40,50,80,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  )
}

// ── Toggle (accent blue) ──────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 46, height: 27, borderRadius: 14, flexShrink: 0,
        background: on ? '#4A6FA8' : 'rgba(140,145,165,0.22)',
        border: 'none', cursor: 'pointer', position: 'relative', padding: 0,
        transition: 'background 0.22s ease',
      }}
    >
      <span style={{
        position: 'absolute', top: 3.5,
        left: on ? 22 : 3.5,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
        transition: 'left 0.22s ease',
        display: 'block',
      }} />
    </button>
  )
}

// ── Card rows ─────────────────────────────────────────────────────────────────

function ToggleRow({ icon: Icon, iconColor = '#6E6E73', label, desc, on, onChange, last }: {
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  iconColor?: string
  label: string; desc: string; on: boolean
  onChange: (v: boolean) => void; last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 18px',
      borderBottom: last ? 'none' : '1px solid rgba(230,232,236,0.80)',
    }}>
      <IconCircle>
        <Icon style={{ width: 17, height: 17, color: iconColor }} strokeWidth={1.6} />
      </IconCircle>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--pt)', margin: '0 0 1px' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0, lineHeight: 1.4 }}>{desc}</p>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

function NavRow({ icon: Icon, iconColor = '#6E6E73', label, desc, displayValue, onClick, last }: {
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  iconColor?: string
  label: string; desc: string; displayValue: string
  onClick: () => void; last?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 18px', width: '100%',
        background: 'none', border: 'none',
        borderBottom: last ? 'none' : '1px solid rgba(230,232,236,0.80)',
        cursor: 'pointer', textAlign: 'left',
      }}
    >
      <IconCircle>
        <Icon style={{ width: 17, height: 17, color: iconColor }} strokeWidth={1.6} />
      </IconCircle>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--pt)', margin: '0 0 1px' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0, lineHeight: 1.4 }}>{desc}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 12.5, color: 'var(--pm)', fontWeight: 500 }}>{displayValue}</span>
        <ChevronRight style={{ width: 13, height: 13, color: 'var(--pm2)' }} strokeWidth={1.5} />
      </div>
    </button>
  )
}

function SliderRow({ icon: Icon, iconColor = '#6E6E73', label, desc, value, onChange, last }: {
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  iconColor?: string
  label: string; desc: string; value: number
  onChange: (v: number) => void; last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '16px 18px',
      borderBottom: last ? 'none' : '1px solid rgba(230,232,236,0.80)',
    }}>
      <IconCircle>
        <Icon style={{ width: 17, height: 17, color: iconColor }} strokeWidth={1.6} />
      </IconCircle>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--pt)', margin: 0 }}>{label}</p>
          <span style={{ fontSize: 12, color: '#4A6FA8', fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
            {value}%
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: '0 0 10px', lineHeight: 1.4 }}>{desc}</p>
        <input
          type="range" min={0} max={100} step={5}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#4A6FA8', cursor: 'pointer', height: 4 }}
        />
      </div>
    </div>
  )
}

// ── Section title ─────────────────────────────────────────────────────────────

function SecTitle({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.20em',
      color: '#8E8E93', textTransform: 'uppercase',
      margin: '24px 0 8px 2px',
    }}>
      {label}
    </p>
  )
}

// ── Bottom Sheet ──────────────────────────────────────────────────────────────

function BottomSheet<T extends string>({
  open, title, options, value, onSelect, onClose,
}: {
  open: boolean; title: string
  options: { label: string; value: T }[]
  value: T; onSelect: (v: T) => void; onClose: () => void
}) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.42)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.25s',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
        background: 'rgba(252,250,255,0.96)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRadius: '22px 22px 0 0',
        border: '1px solid rgba(255,255,255,0.90)',
        boxShadow: '0 -6px 32px rgba(0,0,0,0.10)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ width: 36, height: 4, background: 'rgba(140,145,165,0.28)', borderRadius: 2, margin: '0 auto' }} />
        </div>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.20em', color: '#8E8E93', textTransform: 'uppercase', margin: '18px 24px 4px' }}>
          {title}
        </p>
        <div style={{ padding: '0 24px' }}>
          {options.map((opt, i) => (
            <div key={opt.value}>
              {i > 0 && <div style={{ height: 1, background: 'rgba(230,232,236,0.80)' }} />}
              <button
                type="button"
                onClick={() => { onSelect(opt.value); onClose() }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '15px 0',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{
                  fontSize: 14, fontWeight: opt.value === value ? 600 : 400,
                  color: opt.value === value ? '#4A6FA8' : 'var(--pt)',
                }}>
                  {opt.label}
                </span>
                {opt.value === value && (
                  <Check style={{ width: 15, height: 15, color: '#4A6FA8', flexShrink: 0 }} strokeWidth={2.5} />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Sheet = 'speechRate' | 'language' | null

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme()
  const { prefs, update }   = usePreferences()
  const [sheet, setSheet]   = useState<Sheet>(null)
  const t = useT()

  const speechRateOptions = (['slow', 'normal', 'fast'] as SpeechRate[])
    .map(v => ({ label: SPEECH_RATE_LABELS[v], value: v }))

  const languageOptions = (Object.keys(LANGUAGE_LABELS) as Language[])
    .map(v => ({ label: LANGUAGE_LABELS[v], value: v }))

  const ThemeIcon = theme === 'light' ? Sun : Moon

  return (
    <div style={{ minHeight: '100dvh' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* ── DISPLAY ── */}
        <SecTitle label={t('display')} />
        <div style={glassCard}>
          <ToggleRow
            icon={ThemeIcon}
            iconColor={theme === 'dark' ? '#4A6FA8' : '#6E6E73'}
            label={t('theme')}
            desc={t('theme_desc')}
            on={theme === 'dark'}
            onChange={v => setTheme(v ? 'dark' : 'light')}
            last
          />
        </div>

        {/* ── AUDIO ── */}
        <SecTitle label={t('audio')} />
        <div style={glassCard}>
          <NavRow
            icon={Mic}
            label={t('speech_rate')}
            desc={t('speech_rate_desc')}
            displayValue={SPEECH_RATE_LABELS[prefs.speechRate]}
            onClick={() => setSheet('speechRate')}
          />
          <ToggleRow
            icon={Waves}
            label="Story Ambience"
            desc="스토리 배경음 자동 재생"
            on={prefs.ambienceDefault === 'on'}
            onChange={v => update({ ambienceDefault: v ? 'on' : 'off' })}
          />
          <SliderRow
            icon={Waves}
            label="Ambience Volume"
            desc="배경음 볼륨 조절"
            value={prefs.ambienceVolume ?? 50}
            onChange={v => update({ ambienceVolume: v })}
            last
          />
        </div>

        {/* ── LANGUAGE ── */}
        <SecTitle label={t('language')} />
        <div style={glassCard}>
          <NavRow
            icon={Globe}
            label={t('language')}
            desc={t('app_language_desc')}
            displayValue={LANGUAGE_LABELS[prefs.language]}
            onClick={() => setSheet('language')}
            last
          />
        </div>

        {/* Version */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#C0C0C8', margin: '40px 0 0', fontWeight: 500 }}>
          v1.0.0
        </p>
      </div>

      <BottomSheet
        open={sheet === 'speechRate'}
        title={t('speech_rate')}
        options={speechRateOptions}
        value={prefs.speechRate}
        onSelect={v => update({ speechRate: v })}
        onClose={() => setSheet(null)}
      />
      <BottomSheet
        open={sheet === 'language'}
        title={t('language')}
        options={languageOptions}
        value={prefs.language}
        onSelect={v => update({ language: v })}
        onClose={() => setSheet(null)}
      />
    </div>
  )
}
