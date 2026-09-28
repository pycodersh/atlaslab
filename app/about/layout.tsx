import type { Metadata } from 'next'

const URL = 'https://www.atlaslabstudios.com/about'
const TITLE = 'About Atlas Lab'
const DESCRIPTION =
  'Atlas Lab builds AI-powered tools for skill mastery — Patto, K-Patto and K-Pantry — and publishes guides on Korean language, food and everyday life in Korea.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'website' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
