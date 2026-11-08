import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { KpopCalendar } from './KpopCalendar'

const URL = 'https://www.atlaslabstudios.com/tools/kpop-calendar'
const TITLE = 'K-Pop Concert & Event Calendar — Atlas Lab'
const DESCRIPTION = 'Upcoming K-pop concerts in Korea with dates, venues, global ticketing links and arena guides.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export default function Page() {
  return (
    <div className="tl-wrap kp-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">K-Pop Concert &amp; Event Calendar</h1>
      <p className="tl-lead">Upcoming concerts in Korea, with global ticketing links and arena guides.</p>
      <KpopCalendar />
      <MoreTools current="/tools/kpop-calendar" />
    </div>
  )
}
