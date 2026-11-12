import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolFaq, type FaqItem } from '../ToolFaq'
import { TransitGuide } from './TransitGuide'

const URL = 'https://www.atlaslabstudios.com/tools/intercity-transit'
const TITLE = 'Korea Intercity Transit Guide | Compare KTX, Express Buses & Flights'
const DESCRIPTION = 'Compare travel times, booking links, and arrival hub transfers for KTX high-speed trains, express buses, and domestic flights across Korea.'

const FAQ: FaqItem[] = [
  { q: 'Is the KTX or the express bus better from Seoul to Busan?', a: 'The KTX takes about 2h 15m to 3h for about ₩54,400. The express bus takes about 4h to 4h 40m but costs about ₩23,000 to ₩44,000.' },
  { q: 'Can foreigners book KTX tickets online?', a: 'Yes. Korail’s English website lets you book with an email address, a passport and a card. Each card in this guide links to the right booking site.' },
  { q: 'How do I get from Seoul to Jeju?', a: 'Fly. Flights from Gimpo take about 55 minutes to 1h 10m in the air.' },
]

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
      <h1 className="tl-h1">Korea Intercity Transit &amp; Route Comparison Guide</h1>
      <p className="tl-lead">Find the fastest and cheapest ways to travel between major Korean cities.</p>
      <TransitGuide />
      <WidgetActionChips tool="transit-guide" />
      <ToolFaq items={FAQ} />
      <MoreTools current="/tools/intercity-transit" />
    </div>
  )
}
