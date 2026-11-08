import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { HotspotFinder } from './HotspotFinder'

const URL = 'https://www.atlaslabstudios.com/tools/hotspot-finder'
const TITLE = 'Korea Regional Hotspot Finder — Atlas Lab'
const DESCRIPTION = 'Curated three-spot half-day clusters across nine Korean cities, with walking and transit tips.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export default function Page() {
  return (
    <div className="tl-wrap hs-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">Regional Hotspot Finder</h1>
      <p className="tl-lead">Three spots per city, grouped so you can see them in half a day.</p>
      <HotspotFinder />
      <MoreTools current="/tools/hotspot-finder" />
    </div>
  )
}
