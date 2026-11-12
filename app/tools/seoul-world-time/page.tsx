import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolFaq, type FaqItem } from '../ToolFaq'
import { WorldTime } from './WorldTime'

const URL = 'https://www.atlaslabstudios.com/tools/seoul-world-time'
const TITLE = 'Seoul Time vs Your Hometown | World Time Zone Comparison'
const DESCRIPTION = 'Compare Seoul time with New York, Los Angeles, London, Paris, Sydney and Singapore on day and night cards, and find a good time to call home.'

const FAQ: FaqItem[] = [
  { q: 'What time zone is Seoul in?', a: 'Korea uses Korea Standard Time (KST), which is UTC+9.' },
  { q: 'Does Korea use daylight saving time?', a: 'No. Korea stays on UTC+9 all year, so the time difference with cities that use daylight saving changes during the year.' },
  { q: 'When is a good time to call home?', a: 'Drag the slider to a Seoul time and each city card shows whether people there are likely awake, in the evening or asleep.' },
]

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
      <WidgetActionChips tool="world-time" />
      <ToolFaq items={FAQ} />
      <MoreTools current="/tools/seoul-world-time" />
    </div>
  )
}
