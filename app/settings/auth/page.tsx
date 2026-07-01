'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { useT } from '@/hooks/useT'

export default function AuthPage() {
  const [toast, setToast] = useState('')
  const t = useT()

  const PROVIDERS = [
    {
      id: 'naver',
      label: t('auth_continue_naver'),
      logo: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
          <rect width="24" height="24" rx="4" fill="#03C75A" />
          <path d="M13.74 12.27L10.14 7H7v10h3.26V11.73L14.86 17H18V7h-3.26v5.27z" fill="white" />
        </svg>
      ),
      bg: '#03C75A',
      text: 'white',
      border: '#03C75A',
      dark: false,
    },
    {
      id: 'kakao',
      label: t('auth_continue_kakao'),
      logo: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
          <rect width="24" height="24" rx="4" fill="#FEE500" />
          <path d="M12 5.5C8.13 5.5 5 7.97 5 11.03c0 1.93 1.2 3.63 3.01 4.67l-.77 2.87c-.07.26.22.47.45.33L11.1 17c.29.03.59.05.9.05 3.87 0 7-2.47 7-5.52S15.87 5.5 12 5.5z" fill="#3C1E1E" />
        </svg>
      ),
      bg: '#FEE500',
      text: '#3C1E1E',
      border: '#FEE500',
      dark: false,
    },
    {
      id: 'google',
      label: t('auth_continue_google'),
      logo: (
        <svg viewBox="0 0 24 24" className="w-4 h-4">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      ),
      bg: null,
      text: null,
      border: null,
      dark: false,
    },
    {
      id: 'apple',
      label: t('auth_continue_apple'),
      logo: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.28.07 2.17.74 2.93.8 1.12-.22 2.19-.91 3.39-.84 1.44.09 2.52.66 3.22 1.67-2.95 1.78-2.25 5.69.23 6.78-.52 1.56-1.2 3.12-1.77 4.45zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      ),
      bg: null,
      text: null,
      border: null,
      dark: true,
    },
  ]

  function handleLogin(provider: string) {
    setToast(`${provider} ${t('auth_coming_soon')}`)
    setTimeout(() => setToast(''), 2800)
  }

  return (
    <div className="min-h-dvh bg-[var(--pb)]">
      <TopNav />

      <div className="px-7 pb-24 max-w-sm mx-auto pt-20">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-[var(--pm)] hover:text-[var(--pa)] transition-colors mb-10 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.18em] font-bold">SETTINGS</span>
        </Link>

        <div className="mb-10">
          <h1 className="font-playfair text-[1.6rem] font-black leading-tight text-[var(--pt)] tracking-tight">
            Sign In / Create Account
          </h1>
          <p className="text-[0.8rem] text-[var(--pm)] mt-3 leading-relaxed">
            {t('auth_desc')}
          </p>
        </div>

        {/* Social login buttons */}
        <div className="space-y-3 mb-10">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleLogin(p.id)}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[13px] font-semibold transition-opacity active:opacity-70 cursor-pointer"
              style={
                p.bg
                  ? { background: p.bg, color: p.text, border: `2px solid ${p.border}` }
                  : p.dark
                  ? { background: 'var(--pt)', color: 'var(--pb)', border: '2px solid var(--pt)' }
                  : { background: 'var(--pw)', color: 'var(--pt2)', border: '2px solid var(--pd)' }
              }
            >
              <span className="shrink-0">{p.logo}</span>
              <span className="flex-1 text-center">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Footer agreement */}
        <p className="text-[10.5px] text-[var(--pm2)] leading-relaxed text-center">
          {t('auth_agree_pre')}{' '}
          <Link href="/settings/about/terms" className="underline text-[var(--pm)] hover:text-[var(--pa)] transition-colors">
            {t('auth_terms_link')}
          </Link>
          {t('auth_agree_mid')}
          <Link href="/settings/about/privacy" className="underline text-[var(--pm)] hover:text-[var(--pa)] transition-colors">
            {t('auth_privacy_link')}
          </Link>
          {t('auth_agree_post')}
        </p>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--pt)] text-[var(--pb)] text-[12px] px-5 py-2.5 rounded-full shadow-lg tracking-wide z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
