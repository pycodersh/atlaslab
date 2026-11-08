import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { SubwayTimer } from './SubwayTimer'
import { SubwayRules } from './SubwayRules'

const URL = 'https://www.atlaslabstudios.com/tools/subway-timer'
const TITLE = '15-Min Subway Timer — Atlas Lab'
const DESCRIPTION = "Check Seoul's free subway re-entry rule and start a 15-minute countdown the moment you tap out."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export default function Page() {
  return (
    <div className="tl-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">15-Min Subway Timer</h1>
      <p className="tl-lead">Tapped out by mistake? Re-enter within 15 minutes and the base fare is waived. Start the timer right after you tap out.</p>

      <SubwayTimer />

      <SubwayRules />

      <MoreTools current="/tools/subway-timer" />
    </div>
  )
}
