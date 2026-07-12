'use client'

import { useState, useEffect, useRef } from 'react'
import { useTrainerSafe } from '@/contexts/TrainerContext'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Sun, Moon, Mic, Globe, Check, Waves, Bell, Clock } from 'lucide-react'
import OneSignal from 'react-onesignal'
import { TopNav } from '@/components/TopNav'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { useTheme } from '@/components/ThemeProvider'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useT } from '@/hooks/useT'
import {
  type SpeechRate, type Language,
  SPEECH_RATE_LABELS, LANGUAGE_LABELS,
} from '@/lib/settings/preferences'

// ── Shared ────────────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 20,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 4px 18px rgba(40,50,80,0.07)',
  overflow: 'hidden',
}

function IconCircle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <div style={{
      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
      background: isDark ? 'rgba(255,255,255,0.14)' : 'var(--pc)',
      border: isDark ? '1px solid rgba(255,255,255,0.20)' : '1px solid var(--pglass-border)',
      boxShadow: isDark ? '0 1px 6px rgba(0,0,0,0.25)' : '0 1px 4px rgba(40,50,80,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: isDark ? '#A6B8FF' : 'inherit',
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
        background: on ? 'var(--pa)' : 'rgba(140,145,165,0.22)',
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
  const { theme } = useTheme()
  const effectiveIconColor = theme === 'dark' ? '#A6B8FF' : iconColor
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 18px',
      borderBottom: last ? 'none' : '1px solid var(--pd)',
    }}>
      <IconCircle>
        <Icon style={{ width: 17, height: 17, color: effectiveIconColor }} strokeWidth={1.6} />
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
  const { theme } = useTheme()
  const effectiveIconColor = theme === 'dark' ? '#A6B8FF' : iconColor
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 18px', width: '100%',
        background: 'none', border: 'none',
        borderBottom: last ? 'none' : '1px solid var(--pd)',
        cursor: 'pointer', textAlign: 'left',
      }}
    >
      <IconCircle>
        <Icon style={{ width: 17, height: 17, color: effectiveIconColor }} strokeWidth={1.6} />
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
  const { theme } = useTheme()
  const effectiveIconColor = theme === 'dark' ? '#A6B8FF' : iconColor
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '16px 18px',
      borderBottom: last ? 'none' : '1px solid var(--pd)',
    }}>
      <IconCircle>
        <Icon style={{ width: 17, height: 17, color: effectiveIconColor }} strokeWidth={1.6} />
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

function SecTitle({ label, noUppercase }: { label: string; noUppercase?: boolean }) {
  return (
    <p style={{
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.20em',
      color: '#8E8E93', textTransform: noUppercase ? 'none' : 'uppercase',
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
        background: 'var(--pglass)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRadius: '22px 22px 0 0',
        border: '1px solid var(--pglass-border)',
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
              {i > 0 && <div style={{ height: 1, background: 'var(--pglass-border)' }} />}
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

// ── OneSignal helpers ─────────────────────────────────────────────────────────

const NOTIF_KEY = 'patto.notif'

function getNotifPrefs(): { enabled: boolean; time: string } {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) ?? '{}')
  } catch { return { enabled: false, time: '09:00' } }
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Sheet = 'speechRate' | 'language' | null

export default function PreferencesPage() {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const { theme, setTheme } = useTheme()
  const { prefs, update }   = usePreferences()
  const trainer = useTrainerSafe()
  const [sheet, setSheet]   = useState<Sheet>(null)
  const t = useT()

  const [notifEnabled, setNotifEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')
  const [osReady, setOsReady] = useState(false)
  useEffect(() => {
    const saved = getNotifPrefs()
    setNotifEnabled(saved.enabled ?? false)
    setReminderTime(saved.time ?? '09:00')
  }, [])

  // Poll until OneSignal is initialized (max 5s)
  useEffect(() => {
    let attempts = 0
    const id = setInterval(() => {
      attempts++
      try {
        if (OneSignal.Notifications !== undefined) {
          setOsReady(true)
          clearInterval(id)
        }
      } catch { /* not ready yet */ }
      if (attempts >= 25) clearInterval(id) // give up after 5s
    }, 200)
    return () => clearInterval(id)
  }, [])

  async function handleNotifToggle(on: boolean) {
    if (!osReady) return
    if (on) {
      if (OneSignal.Notifications.permissionNative === 'denied') {
        trainer?.showMessage('알림이 차단되어 있습니다. 브라우저 설정에서 허용해 주세요.', 4000)
        return
      }
      try {
        await OneSignal.Notifications.requestPermission()
        const granted = OneSignal.Notifications.permission
        if (granted) {
          await OneSignal.User.PushSubscription.optIn()
          await OneSignal.User.addTag('reminder_time', reminderTime)
          localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: true, time: reminderTime }))
          setNotifEnabled(true)
        }
      } catch { /* permission dialog dismissed */ }
    } else {
      try {
        await OneSignal.User.PushSubscription.optOut()
      } catch { /* ignore */ }
      localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: false, time: reminderTime }))
      setNotifEnabled(false)
    }
  }

  async function handleTimeChange(time: string) {
    setReminderTime(time)
    localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: notifEnabled, time }))
    if (notifEnabled && osReady) {
      try { await OneSignal.User.addTag('reminder_time', time) } catch { /* ignore */ }
    }
  }

  const langRef = useRef(prefs.language)
  useEffect(() => {
    if (langRef.current !== prefs.language) {
      langRef.current = prefs.language
      router.refresh()
    }
  }, [prefs.language, router])

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
        {isDesktop && (
          <button
            type="button"
            onClick={() => router.push('/patto/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--pa)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={2} />
            Profile
          </button>
        )}

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
            desc={t('ambience_desc')}
            on={prefs.ambienceDefault === 'on'}
            onChange={v => update({ ambienceDefault: v ? 'on' : 'off' })}
          />
          <SliderRow
            icon={Waves}
            label="Ambience Volume"
            desc={t('ambience_volume_desc')}
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

        {/* ── NOTIFICATIONS ── */}
        <SecTitle label="Notifications" />
        <div style={glassCard}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 18px',
            borderBottom: notifEnabled ? '1px solid var(--pd)' : 'none',
          }}>
            <IconCircle>
              <Bell style={{ width: 17, height: 17, color: theme === 'dark' ? '#A6B8FF' : '#4A6FA8' }} strokeWidth={1.6} />
            </IconCircle>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--pt)', margin: '0 0 1px' }}>Daily Reminder</p>
              <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0, lineHeight: 1.4 }}>{t('notif_reminder_desc')}</p>
            </div>
            {!osReady ? (
              <div style={{
                width: 46, height: 27, borderRadius: 14, flexShrink: 0,
                background: 'rgba(140,145,165,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(140,145,165,0.5)', borderTopColor: 'var(--pa)', animation: 'spin 0.7s linear infinite' }} />
              </div>
            ) : (
              <Toggle on={notifEnabled} onChange={handleNotifToggle} />
            )}
          </div>
          {notifEnabled && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              borderTop: '1px solid var(--pd)',
            }}>
              <IconCircle>
                <Clock style={{ width: 17, height: 17, color: theme === 'dark' ? '#A6B8FF' : '#4A6FA8' }} strokeWidth={1.6} />
              </IconCircle>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--pt)', margin: '0 0 1px' }}>Reminder Time</p>
                <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0, lineHeight: 1.4 }}>{t('notif_reminder_time_desc')}</p>
              </div>
              <input
                type="time"
                value={reminderTime}
                onChange={e => handleTimeChange(e.target.value)}
                style={{
                  fontSize: 14, fontWeight: 600,
                  color: 'var(--pt)',
                  background: 'var(--pc)',
                  border: '1px solid var(--pglass-border)',
                  borderRadius: 10,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  fontFamily: 'inherit',
                  colorScheme: 'light dark',
                }}
              />
            </div>
          )}
        </div>

        {/* Version */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#C0C0C8', margin: '40px 0 0', fontWeight: 500 }}>
          v1.0.0
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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
