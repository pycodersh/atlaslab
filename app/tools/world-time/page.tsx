import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WorldTime } from './WorldTime'

const URL = 'https://www.atlaslabstudios.com/tools/world-time'
const TITLE = 'Seoul & World Time Buddy — Atlas Lab'
const DESCRIPTION = 'Compare Seoul time with New York, Los Angeles, London, Paris, Sydney and Singapore using interactive day and night cards.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export default function Page() {
  return (
    <div className="tl-wrap wt-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">Seoul &amp; World Time Buddy</h1>
      <p className="tl-lead">See when to call home. Works offline, right in your browser.</p>
      <WorldTime />
      <MoreTools current="/tools/world-time" />
    </div>
  )
}
