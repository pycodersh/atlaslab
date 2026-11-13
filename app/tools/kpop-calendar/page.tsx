import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolAbout } from '../ToolAbout'
import { KpopCalendar } from './KpopCalendar'

const URL = 'https://www.atlaslabstudios.com/tools/kpop-calendar'
const TITLE = 'K-Pop Event Calendar 2026 | Upcoming Concerts, Tickets & Arena Guides'
const DESCRIPTION = 'Track upcoming K-pop concerts in Seoul, find global ticketing links, and check transport guides for major arena venues.'

// About this tool — 예전 FAQ 의 핵심을 2~3문장으로. 참고 문구(기준일 · 확인 안내 · 출처)는 위젯 밑에서 옮겨 왔다
const ABOUT = "Browse upcoming K-pop concerts in Korea by date, each with a ticket link and a quick guide to the venue. Many shows sell to international fans through NOL World (formerly Interpark Global). For KSPO DOME, take Line 5 or 9 to Olympic Park Station; for Gocheok Sky Dome, take Line 1 to Guil Station, where express trains don’t stop."
const NOTE = (
  <>Note: Dates and venues were checked November 8, 2026 and can change, so confirm with the organizer before you book or travel. “Upcoming” means the date is listed, not that tickets are on sale; ticket buttons open the show page where we’ve confirmed one, and otherwise the NOL World K-pop listing. Sources:{' '}<a href="https://www.soompi.com/article/1797016wpp/2026-k-pop-tour-masterlist-concerts-fan-meetings-and-more" rel="noopener noreferrer" target="_blank">Soompi</a>,{' '}<a href="https://www.koreatimes.co.kr/entertainment/k-pop/20261014/mma2026-brings-26-k-pop-acts-to-gocheok-dome-for-2-night-spectacle" rel="noopener noreferrer" target="_blank">The Korea Times</a>,{' '}<a href="https://sports.khan.co.kr/en/article/202610110728007" rel="noopener noreferrer" target="_blank">Sports Kyunghyang</a>,{' '}<a href="https://www.slist.kr/news/articleView.html?idxno=777842" rel="noopener noreferrer" target="_blank">Singlelist</a>.</>
)

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
      <ToolAbout text={ABOUT} note={NOTE} />
      <WidgetActionChips tool="kpop-calendar" />
      <MoreTools current="/tools/kpop-calendar" />
    </div>
  )
}
