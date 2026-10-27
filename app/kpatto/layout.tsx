import type { Metadata, Viewport } from 'next'
import { Baloo_2, Plus_Jakarta_Sans } from 'next/font/google'
import './kpatto.css'

import { ThemeProvider } from '@/components/ThemeProvider'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { KPattoTabBar } from '@/components/kpatto/KPattoTabBar'
import { LicenseToast } from '@/components/kpatto/LicenseToast'
import { KPattoInstallPromptCatcher } from '@/components/kpatto/InstallAppButton'

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
  // K-PATTO 전용 PWA 매니페스트 — 이게 있어야 안드로이드·데스크톱 Chrome 이 설치(beforeinstallprompt)를 연다.
  // 범위는 /kpatto/ 만, 시작은 앱 홈. (사이트 전체의 /manifest.json 은 Patto 용이다)
  manifest: '/kpatto/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'K-PATTO', statusBarStyle: 'default' },
  icons: { apple: '/icons/kpatto/icon-192.png' },
  title: 'K-PATTO — Learn Korean Through Webtoon Stories',
  description:
    'Learn real Korean through a 100-episode webtoon. 300+ essential expressions with native audio. First 10 episodes free.',
  openGraph: {
    title: 'K-PATTO — Learn Korean Through Webtoon Stories',
    description:
      'Learn real Korean through a 100-episode webtoon. 300+ essential expressions with native audio. First 10 episodes free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'K-PATTO — Learn Korean Through Webtoon Stories',
    description:
      'Learn real Korean through a 100-episode webtoon. 300+ essential expressions with native audio.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FF6B8C',
  viewportFit: 'cover',
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'K-PATTO',
  url: `${BASE_URL}/kpatto`,
  description:
    'Learn Korean through webtoon stories — real expressions, real context, with audio.',
  sameAs: [],
}

export default function KPattoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`antialiased kpatto-root ${jakartaSans.variable} ${baloo2.variable}`}>
      <ThemeProvider>
        <PreferencesProvider>
          <AuthProvider>
            <div style={{ position: 'relative', minHeight: '100vh', background: '#FFFFFF' }}>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
              />
              {children}
              <KPattoTabBar />
              <LicenseToast />
              <KPattoInstallPromptCatcher />
            </div>
          </AuthProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </div>
  )
}
