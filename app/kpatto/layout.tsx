import type { Metadata, Viewport } from 'next'
import { Baloo_2, Plus_Jakarta_Sans } from 'next/font/google'

import { ThemeProvider } from '@/components/ThemeProvider'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { KPattoTabBar } from '@/components/kpatto/KPattoTabBar'

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['800'],
  variable: '--font-jakarta',
})

const baloo2 = Baloo_2({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-baloo',
})

export const metadata: Metadata = {
  title: 'K-PATTO — 한국어 학습',
  description: '웹툰 스토리로 배우는 한국어 패턴 학습 앱',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FF6B8C',
  viewportFit: 'cover',
}

export default function KPattoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`antialiased ${jakartaSans.variable} ${baloo2.variable}`}>
      <ThemeProvider>
        <PreferencesProvider>
          <AuthProvider>
            <div style={{ position: 'relative', minHeight: '100vh', background: '#f4f4f4' }}>
              {children}
              <KPattoTabBar />
            </div>
          </AuthProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </div>
  )
}
