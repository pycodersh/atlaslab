'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Check } from 'lucide-react'
import { usePreferences } from '@/contexts/PreferencesContext'
import { APP_LANGUAGE_KEY, type Language } from '@/lib/settings/preferences'
import { useTheme } from '@/components/ThemeProvider'

const LANGUAGES: { code: Language; name: string; continueLabel: string }[] = [
  { code: 'ko',    name: '한국어',   continueLabel: '계속하기'  },
  { code: 'ja',    name: '日本語',   continueLabel: '続ける'    },
  { code: 'zh-cn', name: '简体中文', continueLabel: '继续'      },
  { code: 'zh-tw', name: '繁體中文', continueLabel: '繼續'      },
  { code: 'es',    name: 'Español',  continueLabel: 'Continuar' },
  { code: 'fr',    name: 'Français', continueLabel: 'Continuer' },
  { code: 'de',    name: 'Deutsch',  continueLabel: 'Weiter'    },
  { code: 'en',    name: 'English',  continueLabel: 'Continue'  },
]

function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('ko'))                                   return 'ko'
  if (lang.startsWith('ja'))                                   return 'ja'
  if (lang === 'zh-tw' || lang === 'zh-hk' || lang === 'zh-mo') return 'zh-tw'
  if (lang.startsWith('zh'))                                   return 'zh-cn'
  if (lang.startsWith('es'))                                   return 'es'
  if (lang.startsWith('fr'))                                   return 'fr'
  if (lang.startsWith('de'))                                   return 'de'
  if (lang.startsWith('en'))                                   return 'en'
  return 'en'
}

export default function LanguageSelectPage() {
  const router    = useRouter()
  const { update } = usePreferences()
  const { theme } = useTheme()
  const isDark    = theme === 'dark'

  const [selected, setSelected] = useState<Language>('en')
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    // 이미 언어 설정된 재방문자 → 홈으로
    if (localStorage.getItem(APP_LANGUAGE_KEY)) {
      router.replace('/patto/home')
      return
    }
    setSelected(detectBrowserLanguage())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleContinue() {
    localStorage.setItem(APP_LANGUAGE_KEY, selected)
    update({ language: selected })
    router.replace('/patto/home')
  }

  if (!mounted) return null

  const entry = LANGUAGES.find(l => l.code === selected)!

  const cardBg     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
  const selBg      = isDark ? 'rgba(99,102,241,0.18)'  : 'rgba(99,102,241,0.08)'
  const textMuted  = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px 48px',
    }}>
      {/* Globe icon */}
      <Globe
        style={{ width: 44, height: 44, color: '#6366F1', marginBottom: 36 }}
        strokeWidth={1.4}
      />

      {/* Language list */}
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
        {LANGUAGES.map(lang => {
          const isSelected = selected === lang.code
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setSelected(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 14,
                border: isSelected
                  ? '2px solid #6366F1'
                  : `1px solid ${cardBorder}`,
                background: isSelected ? selBg : cardBg,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                outline: 'none',
              }}
            >
              <span style={{
                fontSize: 16,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? '#6366F1' : 'var(--pt)',
                letterSpacing: '-0.01em',
              }}>
                {lang.name}
              </span>
              {isSelected && (
                <Check style={{ width: 18, height: 18, color: '#6366F1', flexShrink: 0 }} strokeWidth={2.5} />
              )}
            </button>
          )
        })}
      </div>

      {/* Continue button */}
      <button
        type="button"
        onClick={handleContinue}
        style={{
          width: '100%',
          maxWidth: 360,
          padding: '15px 0',
          borderRadius: 16,
          border: 'none',
          background: '#6366F1',
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '-0.01em',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        {entry.continueLabel}
      </button>

      {/* Subtle bottom hint */}
      <p style={{ marginTop: 20, fontSize: 11, color: textMuted, textAlign: 'center', lineHeight: 1.5 }}>
        You can change this later in Settings.
      </p>
    </div>
  )
}
