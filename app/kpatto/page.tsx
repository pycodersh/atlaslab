import type { Metadata } from 'next'
import KPattoHomePage from './home/page'
import { WelcomeOverlay } from '@/components/kpatto/WelcomeOverlay'

const CANONICAL = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com'}/kpatto`

export const metadata: Metadata = {
  alternates: { canonical: CANONICAL },
  openGraph:  { url: CANONICAL },
}

export default function KPattoPage() {
  return (
    <>
      <KPattoHomePage />
      <WelcomeOverlay />
    </>
  )
}
