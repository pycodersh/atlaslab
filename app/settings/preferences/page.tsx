'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Sun, Moon, Type, Mic, Globe, BookOpen } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.22em] text-[#8B2246] font-bold mb-4 mt-8 first:mt-0">
      {children}
    </p>
  )
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-colors cursor-pointer ${
            value === o.value
              ? 'bg-[#8B2246] text-white border-[#8B2246]'
              : 'bg-transparent text-[#9B9490] border-[#D8D0C8] hover:border-[#8B2246] hover:text-[#8B2246]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SettingRow({
  icon: Icon,
  label,
  desc,
  value,
  last,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  desc: string
  value: string
  last?: boolean
}) {
  return (
    <div className={`flex items-start gap-4 py-5 ${last ? '' : 'border-b border-[#EDE5DC]'}`}>
      <div className="w-9 h-9 rounded-xl bg-[#F5EFE9] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-[#8B2246]" strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] text-[#1A1A1A] leading-snug">{label}</p>
        <p className="text-[11.5px] text-[#9B9490] mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <span className="text-[13px] text-[#8B2246] font-semibold shrink-0 mt-1">{value}</span>
    </div>
  )
}

export default function PreferencesPage() {
  const [theme, setTheme] = useState('light')
  const [fontSize, setFontSize] = useState('medium')

  return (
    <div className="min-h-dvh bg-[#FAF8F4]">
      <TopNav />

      <div className="px-7 pb-24 max-w-sm mx-auto pt-20">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-[#9B9490] hover:text-[#8B2246] transition-colors mb-8 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.18em] font-bold">SETTINGS</span>
        </Link>

        <div className="mb-10">
          <h1 className="font-playfair text-[1.9rem] font-black leading-none text-[#1A1A1A] tracking-tight">
            PREFERENCES
          </h1>
          <p className="text-[0.78rem] text-[#9B9490] mt-2 tracking-wide">
            Customize your learning experience
          </p>
        </div>

        {/* APPEARANCE */}
        <SectionLabel>APPEARANCE</SectionLabel>
        <div className="border-t border-[#EDE5DC]">
          <div className="flex items-start gap-4 pt-5 pb-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5EFE9] flex items-center justify-center shrink-0 mt-0.5">
              {theme === 'light'
                ? <Sun className="w-4 h-4 text-[#8B2246]" strokeWidth={1.6} />
                : <Moon className="w-4 h-4 text-[#8B2246]" strokeWidth={1.6} />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[14px] text-[#1A1A1A]">Theme</p>
              <p className="text-[11.5px] text-[#9B9490] mt-0.5">Choose your preferred visual mode</p>
              <ChipGroup
                options={[{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }]}
                value={theme}
                onChange={setTheme}
              />
            </div>
          </div>
          <div className="h-px bg-[#EDE5DC]" />
          <div className="flex items-start gap-4 pt-5 pb-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5EFE9] flex items-center justify-center shrink-0 mt-0.5">
              <Type className="w-4 h-4 text-[#8B2246]" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[14px] text-[#1A1A1A]">Font Size</p>
              <p className="text-[11.5px] text-[#9B9490] mt-0.5">Adjust reading comfort</p>
              <ChipGroup
                options={[
                  { label: 'Small', value: 'small' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Large', value: 'large' },
                ]}
                value={fontSize}
                onChange={setFontSize}
              />
            </div>
          </div>
        </div>

        {/* AUDIO */}
        <SectionLabel>AUDIO</SectionLabel>
        <div className="border-t border-[#EDE5DC]">
          <SettingRow
            icon={Mic}
            label="Speech Rate"
            desc="Reading speed for audio playback"
            value="Normal"
          />
          <SettingRow
            icon={Mic}
            label="Voice"
            desc="Text-to-speech voice accent"
            value="en-US"
            last
          />
        </div>

        {/* LANGUAGE */}
        <SectionLabel>LANGUAGE</SectionLabel>
        <div className="border-t border-[#EDE5DC]">
          <SettingRow
            icon={Globe}
            label="App Language"
            desc="Interface display language"
            value="한국어"
          />
          <SettingRow
            icon={BookOpen}
            label="Translation"
            desc="Story translation target language"
            value="Korean"
            last
          />
        </div>
      </div>
    </div>
  )
}
