import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolAbout } from '../ToolAbout'
import { TransitGuide } from './TransitGuide'

const URL = 'https://www.atlaslabstudios.com/tools/intercity-transit'
const TITLE = 'Korea Intercity Transit Guide | Compare KTX, Express Buses & Flights'
const DESCRIPTION = 'Compare travel times, booking links, and arrival hub transfers for KTX high-speed trains, express buses, and domestic flights across Korea.'

// About this tool — 예전 FAQ 의 핵심을 2~3문장으로. 참고 문구(기준일 · 확인 안내 · 출처)는 위젯 밑에서 옮겨 왔다
const ABOUT = "Choose a city on the map to compare the KTX, express bus and domestic flight side by side, with typical travel times, estimated fares and the Seoul station or terminal each one leaves from. Seoul to Busan, for example, takes about 2h 15m to 3h by KTX for about ₩54,400, or 4h to 4h 40m by express bus for ₩23,000 to ₩44,000; for Jeju, fly. Each card links to the right booking site, and Korail’s English website takes foreign cards."
const NOTE = (
  <>Note: Fares are approximate one-way fares and durations are typical, checked November 8, 2026; KTX fares changed with the September 2026 KTX–SRT merger, so confirm on <a href="https://www.korail.com" rel="noopener noreferrer" target="_blank">Korail</a> or the bus operator before booking, and check a map app for local bus numbers. The map is illustrative and not to scale. Sources:{' '}<a href="https://www.rome2rio.com" rel="noopener noreferrer" target="_blank">Rome2Rio</a>,{' '}<a href="https://welcome-busan.com/guide/transport/seoul-to-busan-ktx-guide/" rel="noopener noreferrer" target="_blank">Welcome Busan</a>,{' '}<a href="https://mileasia.com/korea/ktx-train-guide/" rel="noopener noreferrer" target="_blank">MileAsia KTX</a>,{' '}<a href="https://mileasia.com/korea/seoul-to-jeju/" rel="noopener noreferrer" target="_blank">MileAsia Jeju</a>,{' '}<a href="https://www.asiaodysseytravel.com/south-korea/seoul-to-jeonju.html" rel="noopener noreferrer" target="_blank">Asia Odyssey</a>.</>
)

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
      <ToolAbout text={ABOUT} note={NOTE} />
      <WidgetActionChips tool="transit-guide" />
      <MoreTools current="/tools/intercity-transit" />
    </div>
  )
}
