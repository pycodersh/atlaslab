'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sun, Moon, Mic, Globe, BookOpen, Check, Waves, Play, Square } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useTheme } from '@/components/ThemeProvider'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useT } from '@/hooks/useT'
import {
  type SpeechRate, type VoiceKey, type AppLang, type TranslationLang,
  SPEECH_RATE_LABELS, VOICE_LABELS, APP_LANG_LABELS, TRANSLATION_LANG_LABELS,
} from '@/lib/settings/preferences'
import { BrowserTTSProvider, getPitchForKey } from '@/lib/tts'

const PREVIEW_TEXT = "Hello. Welcome to PATTO. Let's read today's story."
const _previewProvider = new BrowserTTSProvider()

// ── iOS-style Toggle ──────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 26, borderRadius: 13,
        background: on ? 'var(--pa)' : 'var(--pd)',
        border: 'none', cursor: 'pointer',
        position: 'relative', flexShrink: 0, padding: 0,
        transition: 'background 0.22s ease',
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        transition: 'left 0.22s ease',
        display: 'block',
      }} />
    </button>
  )
}

// ── Toggle Row ────────────────────────────────────────────────────────────────
function ToggleRow({ icon: Icon, label, desc, on, onChange, last }: {
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  label: string; desc: string; on: boolean
  onChange: (v: boolean) => void; last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0',
      borderBottom: last ? 'none' : '1px solid var(--pd)',
    }}>
      <Icon style={{ width: 17, height: 17, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={1.5} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 1px' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>{desc}</p>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

// ── Nav Row (opens Bottom Sheet) ──────────────────────────────────────────────
function NavRow({ icon: Icon, label, desc, displayValue, onClick, last }: {
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>
  label: string; desc: string; displayValue: string
  onClick: () => void; last?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0',
        width: '100%', background: 'none', border: 'none',
        borderBottom: last ? 'none' : '1px solid var(--pd)',
        cursor: 'pointer', textAlign: 'left',
      }}
    >
      <Icon style={{ width: 17, height: 17, color: 'var(--pa)', flexShrink: 0 }} strokeWidth={1.5} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 1px' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>{desc}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: 'var(--pm)', fontWeight: 500 }}>{displayValue}</span>
        <ChevronRight style={{ width: 14, height: 14, color: 'var(--pm2)' }} strokeWidth={1.4} />
      </div>
    </button>
  )
}

// ── Bottom Sheet ──────────────────────────────────────────────────────────────
function BottomSheet<T extends string>({
  open, title, options, value, onSelect, onClose, renderRight,
}: {
  open: boolean
  title: string
  options: { label: string; value: T }[]
  value: T
  onSelect: (v: T) => void
  onClose: () => void
  renderRight?: (opt: { label: string; value: T }) => React.ReactNode
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />
      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
        background: 'var(--pb)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}>
        {/* Handle */}
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ width: 36, height: 4, background: 'var(--pd)', borderRadius: 2, margin: '0 auto' }} />
        </div>
        {/* Section label as title */}
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
          color: 'var(--pa)', textTransform: 'uppercase',
          margin: '20px 24px 4px',
        }}>
          {title}
        </p>
        {/* Options */}
        <div style={{ padding: '0 24px' }}>
          {options.map((opt, i) => (
            <div key={opt.value}>
              {i > 0 && <div style={{ height: 1, background: 'var(--pd)' }} />}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => { onSelect(opt.value); onClose() }}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 0', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{
                    fontSize: 14,
                    fontWeight: opt.value === value ? 600 : 400,
                    color: opt.value === value ? 'var(--pa)' : 'var(--pt)',
                  }}>
                    {opt.label}
                  </span>
                  {opt.value === value && (
                    <Check style={{ width: 15, height: 15, color: 'var(--pa)', flexShrink: 0, marginLeft: 8 }} strokeWidth={2.5} />
                  )}
                </button>
                {renderRight && (
                  <div style={{ flexShrink: 0, marginLeft: 8 }}>
                    {renderRight(opt)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
      color: 'var(--pa)', textTransform: 'uppercase',
      margin: '36px 0 0', paddingBottom: 10,
    }}>
      {children}
    </p>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
type Sheet = 'speechRate' | 'voice' | 'appLang' | 'translation' | null

export default function PreferencesPage() {
  const { theme, setTheme }         = useTheme()
  const { prefs, update }           = usePreferences()
  const [sheet, setSheet]           = useState<Sheet>(null)
  const [previewing, setPreviewing] = useState<VoiceKey | null>(null)
  const t = useT()

  function handleVoicePreview(key: VoiceKey) {
    if (previewing === key) {
      _previewProvider.stop(); setPreviewing(null); return
    }
    _previewProvider.stop()
    setPreviewing(key)
    _previewProvider.speak({
      texts: [PREVIEW_TEXT], voiceKey: key,
      rate: 0.95, pitch: getPitchForKey(key), volume: 1.0,
      onEnd:  () => setPreviewing(null),
      onError: () => setPreviewing(null),
    })
  }

  function closeSheet() {
    _previewProvider.stop()
    setPreviewing(null)
    setSheet(null)
  }

  const speechRateOptions = (['slow', 'normal', 'fast'] as SpeechRate[])
    .map(v => ({ label: SPEECH_RATE_LABELS[v], value: v }))

  const voiceOptions = (['us-female', 'us-male', 'uk-female', 'uk-male'] as VoiceKey[])
    .map(v => ({ label: VOICE_LABELS[v], value: v }))

  const appLangOptions = (Object.keys(APP_LANG_LABELS) as AppLang[])
    .map(v => ({ label: APP_LANG_LABELS[v], value: v }))

  const translationOptions = (Object.keys(TRANSLATION_LANG_LABELS) as TranslationLang[])
    .map(v => ({ label: TRANSLATION_LANG_LABELS[v], value: v }))

  const ThemeIcon = theme === 'light' ? Sun : Moon

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)' }}>
      <TopNav />

      <div style={{
        maxWidth: 480, margin: '0 auto',
        paddingTop: 'calc(var(--pnav-h) + 28px)',
        paddingLeft: 24, paddingRight: 24, paddingBottom: 100,
        boxSizing: 'border-box',
      }}>

        {/* Back */}
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--pm)', textDecoration: 'none',
            marginBottom: 32, width: 'fit-content',
          }}
        >
          <ChevronLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          <span style={{ fontSize: 10, letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase' }}>
            {t('back')}
          </span>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 className="font-playfair" style={{
            fontSize: 'clamp(1.7rem, 7vw, 2.2rem)',
            fontWeight: 900, lineHeight: 1, color: 'var(--pt)',
            margin: 0, letterSpacing: '-0.02em',
          }}>
            {t('pref_title')}
          </h1>
          <p style={{ fontSize: 11, color: 'var(--pm)', marginTop: 8, lineHeight: 1.5 }}>
            {t('pref_desc')}
          </p>
        </div>

        {/* ── DISPLAY ──────────────────────────────────────────────────── */}
        <SectionLabel>{t('display')}</SectionLabel>
        <div style={{ borderTop: '1px solid var(--pd)' }}>
          <ToggleRow
            icon={ThemeIcon}
            label={t('theme')}
            desc={t('theme_desc')}
            on={theme === 'dark'}
            onChange={v => setTheme(v ? 'dark' : 'light')}
            last
          />
        </div>

        {/* ── AUDIO ────────────────────────────────────────────────────── */}
        <SectionLabel>{t('audio')}</SectionLabel>
        <div style={{ borderTop: '1px solid var(--pd)' }}>
          <NavRow
            icon={Mic}
            label={t('speech_rate')}
            desc={t('speech_rate_desc')}
            displayValue={SPEECH_RATE_LABELS[prefs.speechRate]}
            onClick={() => setSheet('speechRate')}
          />
          <NavRow
            icon={Mic}
            label={t('voice')}
            desc={t('voice_desc')}
            displayValue={VOICE_LABELS[prefs.voice]}
            onClick={() => setSheet('voice')}
          />
          <ToggleRow
            icon={Waves}
            label="Story Ambience"
            desc={t('ambience_desc')}
            on={prefs.ambienceDefault === 'on'}
            onChange={v => update({ ambienceDefault: v ? 'on' : 'off' })}
            last
          />
        </div>

        {/* ── LANGUAGE ─────────────────────────────────────────────────── */}
        <SectionLabel>{t('language')}</SectionLabel>
        <div style={{ borderTop: '1px solid var(--pd)' }}>
          <NavRow
            icon={Globe}
            label={t('app_language')}
            desc={t('app_language_desc')}
            displayValue={APP_LANG_LABELS[prefs.appLang]}
            onClick={() => setSheet('appLang')}
          />
          <NavRow
            icon={BookOpen}
            label={t('translation')}
            desc={t('translation_desc')}
            displayValue={TRANSLATION_LANG_LABELS[prefs.translationLang]}
            onClick={() => setSheet('translation')}
            last
          />
        </div>

      </div>

      {/* ── Bottom Sheets ─────────────────────────────────────────────── */}
      <BottomSheet
        open={sheet === 'speechRate'}
        title={t('speech_rate')}
        options={speechRateOptions}
        value={prefs.speechRate}
        onSelect={v => update({ speechRate: v })}
        onClose={closeSheet}
      />

      <BottomSheet
        open={sheet === 'voice'}
        title={t('voice')}
        options={voiceOptions}
        value={prefs.voice}
        onSelect={v => update({ voice: v })}
        onClose={closeSheet}
        renderRight={opt => (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); handleVoicePreview(opt.value as VoiceKey) }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: '50%',
              background: previewing === opt.value ? 'var(--pal)' : 'var(--pc)',
              border: 'none', cursor: 'pointer', flexShrink: 0,
            }}
          >
            {previewing === opt.value
              ? <Square style={{ width: 9, height: 9, color: 'var(--pa)' }} fill="currentColor" strokeWidth={0} />
              : <Play   style={{ width: 9, height: 9, color: 'var(--pm)' }} fill="currentColor" strokeWidth={0} />
            }
          </button>
        )}
      />

      <BottomSheet
        open={sheet === 'appLang'}
        title={t('app_language')}
        options={appLangOptions}
        value={prefs.appLang}
        onSelect={v => update({ appLang: v })}
        onClose={closeSheet}
      />

      <BottomSheet
        open={sheet === 'translation'}
        title={t('translation')}
        options={translationOptions}
        value={prefs.translationLang}
        onSelect={v => update({ translationLang: v })}
        onClose={closeSheet}
      />
    </div>
  )
}
