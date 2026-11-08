import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { loadRates } from './krw-converter/rates'
import { ToolsHub } from './ToolsHub'

const URL = 'https://www.atlaslabstudios.com/tools'
const TITLE = 'Smart Travel Tools for Korea — Atlas Lab'
const DESCRIPTION = 'Food ordering phrases, a subway timer, currency sense, intercity transit, weather and K-pop calendars for traveling Korea.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export const revalidate = 21600

export default async function Page() {
  const { rates, updated } = await loadRates()
  return <ToolsHub rates={rates} updated={updated} />
}
