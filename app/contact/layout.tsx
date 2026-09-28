import type { Metadata } from 'next'

const URL = 'https://www.atlaslabstudios.com/contact'
const TITLE = 'Contact Atlas Lab'
const DESCRIPTION =
  'Get in touch with Atlas Lab for general questions, product support, media and business inquiries. We typically reply within 2–3 business days.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'website' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
