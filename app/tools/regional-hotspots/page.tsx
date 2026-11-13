import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolAbout } from '../ToolAbout'
import { HotspotFinder } from './HotspotFinder'

const URL = 'https://www.atlaslabstudios.com/tools/regional-hotspots'
const TITLE = 'Korea Travel Hotspot Finder | Curated Neighborhood Walking Clusters'
const DESCRIPTION = 'Explore curated walking clusters across Seoul and 10 regional cities, including Busan, with visual previews and instant local transit tips.'

// About this tool — 예전 FAQ 의 핵심을 2~3문장으로. 참고 문구(기준일 · 확인 안내 · 출처)는 위젯 밑에서 옮겨 왔다
const ABOUT = "Choose a Seoul area or a regional city to see a cluster of spots you can walk between, each with the nearest station and a short tip. Seoul is split into six areas around the Han River, from Jongno & Bukchon to Gangnam & Jamsil, and ten more cities are covered, from Busan and Gyeongju to Jeju. Each card has a Google Maps button for real photos, reviews and directions."
const NOTE = (
  <>Note: Spot visuals are for illustrative purposes. Operating hours and closure days can change, so please check Google Maps before heading out.</>
)

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
      <ToolAbout text={ABOUT} note={NOTE} />
      <WidgetActionChips tool="hotspot-finder" />
      <MoreTools current="/tools/regional-hotspots" />
    </div>
  )
}
