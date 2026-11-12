import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolFaq, type FaqItem } from '../ToolFaq'
import { HotspotFinder } from './HotspotFinder'

const URL = 'https://www.atlaslabstudios.com/tools/regional-hotspots'
const TITLE = 'Korea Travel Hotspot Finder | Curated Neighborhood Walking Clusters'
const DESCRIPTION = 'Explore curated walking clusters across Seoul and 10 regional cities, including Busan, with visual previews and instant local transit tips.'

const FAQ: FaqItem[] = [
  { q: 'Which areas of Seoul are covered?', a: 'Six areas with four spots each: Jongno & Bukchon, Myeongdong & Central, Hongdae & Yeonnam, Seongsu & Seoul Forest, Yeouido & Yongsan, and Gangnam & Jamsil.' },
  { q: 'Which other cities are included?', a: 'Busan, Gyeongju, Jeonju, Gangneung, Sokcho, Yeosu, Daegu, Andong, Chuncheon and Jeju.' },
  { q: 'Are the spot images real photos?', a: 'No. They are AI-rendered previews for illustration. Use the Google Maps button on each card to see real photos and reviews.' },
]

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
      <h1 className="tl-h1">Korea Regional Hotspots &amp; Walking Clusters</h1>
      <p className="tl-lead">24 spots across 6 Seoul areas, plus the places worth the trip in 10 regional cities.</p>
      <HotspotFinder />
      <WidgetActionChips tool="hotspot-finder" />
      <ToolFaq items={FAQ} />
      <MoreTools current="/tools/regional-hotspots" />
    </div>
  )
}
