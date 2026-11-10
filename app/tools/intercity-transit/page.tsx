import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { TransitGuide } from './TransitGuide'

const URL = 'https://www.atlaslabstudios.com/tools/transit-guide'
const TITLE = 'Korea Intercity Transit Guide — Atlas Lab'
const DESCRIPTION = 'Compare KTX, flights and buses between Seoul, Busan, Daegu and ten major Korean destinations, in both directions, with arrival hub tips.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export default function Page() {
  return (
    <div className="tl-wrap tg-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">Korea Intercity Transit Guide</h1>
      <p className="tl-lead">Find the fastest and cheapest ways to travel between major Korean cities.</p>
      <TransitGuide />
      <MoreTools current="/tools/transit-guide" />
    </div>
  )
}
