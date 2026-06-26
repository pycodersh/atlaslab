'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sun, Moon, Mic, Globe, BookOpen, Check, Waves } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useTheme } from '@/components/ThemeProvider'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useT } from '@/hooks/useT'
import {
  type SpeechRate, type VoiceKey, type AppLang, type TranslationLang, type AmbienceDefault,
  SPEECH_RATE_LABELS, VOICE_LABELS, APP_LANG_LABELS, TRANSLATION_LANG_LABELS,
} from '@/lib/settings/preferences'

// ── Section label ─────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.22em] text-[var(--pa)] font-bold mb-4 mt-8 first:mt-0">
      {children}
    </p>
  )
}

// ── Chip group (small option set) ─────────────────────────────────────────
function ChipGroup<T extends string>({
  options, value, onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-colors cursor-pointer ${
            value === o.value
              ? 'bg-[var(--pa)] text-white border-[var(--pa)]'
              : 'bg-transparent text-[var(--pm)] border-[var(--pd)] hover:border-[var(--pa)] hover:text-[var(--pa)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Setting row with expandable chips ─────────────────────────────────────
function ChipRow<T extends string>({
  icon: Icon, label, desc, options, value, onChange, last,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  desc: string
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
  last?: boolean
}) {
  return (
    <div className={`flex items-start gap-4 py-5 ${last ? '' : 'border-b border-[var(--pd)]'}`}>
      <div className="w-9 h-9 rounded-xl bg-[var(--pc2)] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-[var(--pa)]" strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] text-[var(--pt)] leading-snug">{label}</p>
        <p className="text-[11.5px] text-[var(--pm)] mt-0.5 leading-relaxed">{desc}</p>
        <ChipGroup options={options} value={value} onChange={onChange} />
      </div>
    </div>
  )
}

// ── Bottom Sheet ──────────────────────────────────────────────────────────
function BottomSheet<T extends string>({
  title, options, value, onSelect, onClose,
}: {
  title: string
  options: { label: string; value: T }[]
  value: T
  onSelect: (v: T) => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl pb-10 shadow-2xl"
        style={{ background: 'var(--pb)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-2">
          <p className="text-[10px] tracking-[0.22em] text-[var(--pa)] font-bold">{title}</p>
        </div>
        <div className="px-6">
          {options.map((opt, i) => (
            <div key={opt.value}>
              {i > 0 && <div className="h-px bg-[var(--pd)]" />}
              <button
                type="button"
                onClick={() => { onSelect(opt.value); onClose() }}
                className="w-full flex items-center justify-between py-4 cursor-pointer hover:opacity-60 transition-opacity"
              >
                <span
                  className="text-[14px] font-medium"
                  style={{ color: opt.value === value ? 'var(--pa)' : 'var(--pt)' }}
                >
                  {opt.label}
                </span>
                {opt.value === value && (
                  <Check className="w-4 h-4 text-[var(--pa)]" strokeWidth={2} />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Select row (opens bottom sheet) ──────────────────────────────────────
function SelectRow({
  icon: Icon, label, desc, displayValue, onClick, last,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  desc: string
  displayValue: string
  onClick: () => void
  last?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 py-5 cursor-pointer hover:opacity-75 transition-opacity text-left ${last ? '' : 'border-b border-[var(--pd)]'}`}
    >
      <div className="w-9 h-9 rounded-xl bg-[var(--pc2)] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[var(--pa)]" strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] text-[var(--pt)] leading-snug">{label}</p>
        <p className="text-[11.5px] text-[var(--pm)] mt-0.5">{desc}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[13px] text-[var(--pa)] font-semibold">{displayValue}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--pm2)]" strokeWidth={1.5} />
      </div>
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
type Sheet = 'appLang' | 'translation' | null

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme()
  const { prefs, update }   = usePreferences()
  const [sheet, setSheet]   = useState<Sheet>(null)
  const t = useT()

  const speechRateOptions = (
    ['slow', 'normal', 'fast'] as SpeechRate[]
  ).map(v => ({ label: SPEECH_RATE_LABELS[v], value: v }))

  const voiceOptions = (
    ['us-male', 'us-female', 'uk-male', 'uk-female'] as VoiceKey[]
  ).map(v => ({ label: VOICE_LABELS[v], value: v }))

  const appLangOptions = (
    Object.keys(APP_LANG_LABELS) as AppLang[]
  ).map(v => ({ label: APP_LANG_LABELS[v], value: v }))

  const translationOptions = (
    Object.keys(TRANSLATION_LANG_LABELS) as TranslationLang[]
  ).map(v => ({ label: TRANSLATION_LANG_LABELS[v], value: v }))

  return (
    <div className="min-h-dvh bg-[var(--pb)]">
      <TopNav />

      <div className="px-7 pb-24 max-w-sm mx-auto pt-20">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-[var(--pm)] hover:text-[var(--pa)] transition-colors mb-8 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.18em] font-bold">SETTINGS</span>
        </Link>

        <div className="mb-10">
          <h1 className="font-playfair text-[1.9rem] font-black leading-none text-[var(--pt)] tracking-tight">
            {t('pref_title')}
          </h1>
          <p className="text-[0.78rem] text-[var(--pm)] mt-2 tracking-wide">
            {t('pref_desc')}
          </p>
        </div>

        {/* ── DISPLAY ──────────────────────────────────────────────────── */}
        <SectionLabel>{t('display')}</SectionLabel>
        <div className="border-t border-[var(--pd)]">
          <div className="flex items-start gap-4 py-5">
            <div className="w-9 h-9 rounded-xl bg-[var(--pc2)] flex items-center justify-center shrink-0 mt-0.5">
              {theme === 'light'
                ? <Sun  className="w-4 h-4 text-[var(--pa)]" strokeWidth={1.6} />
                : <Moon className="w-4 h-4 text-[var(--pa)]" strokeWidth={1.6} />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[14px] text-[var(--pt)]">{t('theme')}</p>
              <p className="text-[11.5px] text-[var(--pm)] mt-0.5">{t('theme_desc')}</p>
              <ChipGroup
                options={[{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }]}
                value={theme}
                onChange={v => setTheme(v as 'light' | 'dark')}
              />
            </div>
          </div>
        </div>

        {/* ── AUDIO ────────────────────────────────────────────────────── */}
        <SectionLabel>{t('audio')}</SectionLabel>
        <div className="border-t border-[var(--pd)]">
          <ChipRow
            icon={Mic}
            label={t('speech_rate')}
            desc={t('speech_rate_desc')}
            options={speechRateOptions}
            value={prefs.speechRate}
            onChange={v => update({ speechRate: v })}
          />
          <ChipRow
            icon={Mic}
            label={t('voice')}
            desc={t('voice_desc')}
            options={voiceOptions}
            value={prefs.voice}
            onChange={v => update({ voice: v })}
          />
          <ChipRow
            icon={Waves}
            label="Story Ambience"
            desc="스토리를 열 때 배경 Ambience를 자동으로 켭니다"
            options={([
              { label: 'Off', value: 'off' },
              { label: 'On',  value: 'on'  },
            ] as { label: string; value: AmbienceDefault }[])}
            value={prefs.ambienceDefault}
            onChange={v => update({ ambienceDefault: v })}
            last
          />
        </div>

        {/* ── LANGUAGE ─────────────────────────────────────────────────── */}
        <SectionLabel>{t('language')}</SectionLabel>
        <div className="border-t border-[var(--pd)]">
          <SelectRow
            icon={Globe}
            label={t('app_language')}
            desc={t('app_language_desc')}
            displayValue={APP_LANG_LABELS[prefs.appLang]}
            onClick={() => setSheet('appLang')}
          />
          <SelectRow
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
      {sheet === 'appLang' && (
        <BottomSheet
          title="APP LANGUAGE"
          options={appLangOptions}
          value={prefs.appLang}
          onSelect={v => update({ appLang: v })}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'translation' && (
        <BottomSheet
          title="TRANSLATION LANGUAGE"
          options={translationOptions}
          value={prefs.translationLang}
          onSelect={v => update({ translationLang: v })}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  )
}
