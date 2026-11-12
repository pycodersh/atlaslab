import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolFaq, type FaqItem } from '../ToolFaq'
import { KpopCalendar } from './KpopCalendar'

const URL = 'https://www.atlaslabstudios.com/tools/kpop-calendar'
const TITLE = 'K-Pop Event Calendar 2026 | Upcoming Concerts, Tickets & Arena Guides'
const DESCRIPTION = 'Track upcoming K-pop concerts in Seoul, find global ticketing links, and check transport guides for major arena venues.'

const FAQ: FaqItem[] = [
  { q: 'Where can foreigners buy K-pop concert tickets?', a: 'Many shows sell to international fans through NOL World (formerly Interpark Global). Each card links to the show page where we have confirmed one.' },
  { q: 'How do I get to KSPO DOME?', a: 'Take Line 5 or 9 to Olympic Park Station and use Exit 3 or 4. It is about a 5 to 7 minute walk.' },
  { q: 'How do I get to Gocheok Sky Dome?', a: 'Take Line 1 to Guil Station and use Exit 2. It is about a 3 minute walk, but express trains skip Guil.' },
]

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
      <h1 className="tl-h1">K-Pop Concerts &amp; Arena Venue Guide</h1>
      <p className="tl-lead">Upcoming concerts in Korea, with global ticketing links and arena guides.</p>
      <KpopCalendar />
      <WidgetActionChips tool="kpop-calendar" />
      <ToolFaq items={FAQ} />
      <MoreTools current="/tools/kpop-calendar" />
    </div>
  )
}
