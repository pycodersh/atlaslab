import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolAbout } from '../ToolAbout'
import { WorldTime } from './WorldTime'

const URL = 'https://www.atlaslabstudios.com/tools/seoul-world-time'
const TITLE = 'Seoul Time vs Your Hometown | World Time Zone Comparison'
const DESCRIPTION = 'Compare Seoul time with New York, Los Angeles, London, Paris, Sydney and Singapore on day and night cards, and find a good time to call home.'

// About this tool — 예전 FAQ 의 핵심을 2~3문장으로. 참고 문구(기준일 · 확인 안내 · 출처)는 위젯 밑에서 옮겨 왔다
const ABOUT = "Drag the slider to a time in Seoul and see what time it is back home, with each city marked as likely awake, in the evening or asleep, so you know when to call. Korea uses Korea Standard Time (UTC+9) all year with no daylight saving, so the gap with cities that change their clocks shifts during the year."
const NOTE = (
  <>Note: Times are worked out in your browser from your device’s clock, so the tool keeps working offline.</>
)

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
      <h1 className="tl-h1">Seoul vs World Time Comparison</h1>
      <p className="tl-lead">See when to call home. Works offline, right in your browser.</p>
      <WorldTime />
      <ToolAbout text={ABOUT} note={NOTE} />
      <WidgetActionChips tool="world-time" />
      <MoreTools current="/tools/seoul-world-time" />
    </div>
  )
}
