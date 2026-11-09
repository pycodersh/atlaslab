import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { KoreaUnitsModal } from './KoreaUnitsModal'

const URL = 'https://www.atlaslabstudios.com/tools/size-units'
const TITLE = 'Korea Size & Travel Units — Atlas Lab'
const DESCRIPTION = 'Convert Korean shoe sizes in millimeters, clothing sizes, K-BBQ gram portions and pyeong room sizes for your trip.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export default function Page() {
  return (
    <div className="tl-wrap ku-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">Korea Size &amp; Travel Units</h1>
      <p className="tl-lead">Shoes, clothes, meat portions and room sizes, converted in a second.</p>
      <KoreaUnitsModal />
      <MoreTools current="/tools/size-units" />
    </div>
  )
}
