import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolAbout } from '../ToolAbout'
import { SubwayTimer } from './SubwayTimer'
import { SubwayRules } from './SubwayRules'

const URL = 'https://www.atlaslabstudios.com/tools/subway-timer'
const TITLE = 'Seoul Subway 15-Min Free Re-Entry Timer | Wrong Gate Refund Guide'
const DESCRIPTION = 'Tapped the wrong gate in Seoul Metro? Track your 15-minute free re-entry window and check subway transfer rules instantly.'

// About this tool — 예전 FAQ 의 핵심을 2~3문장으로. 참고 문구(기준일 · 확인 안내 · 출처)는 위젯 밑에서 옮겨 왔다
const ABOUT = "Tapped out by mistake? Start the timer right after you tap out, then tap back in at the same station on the same line within 15 minutes and the ₩1,550 base fare is waived. It works with T-money and other transit cards, once per trip, but not with single-journey tickets or passes, AREX, the Shinbundang Line or the Incheon lines. If re-entry doesn’t work, press the Help bell on the gate."
const NOTE = (
  <>Note: This timer is a guide only; the gate system’s clock decides, so leave yourself a margin and use the same gate if you can. Official notices don’t say how any extra distance fare is handled, or what happens if you tapped in at the wrong gate without tapping out, so ask the staff. Korail lines joined on June 20, 2026; Seoul Metro lines moved to 15 minutes on October 7, 2023. Sources:{' '}<a href="https://www.korea.kr/news/policyNewsView.do?newsId=148966539" rel="noopener noreferrer" target="_blank">Korea.kr (June 15, 2026)</a>,{' '}<a href="https://www.koreajoongangdaily.com/korea/less-running-to-toilet-as-seoul-lengthens-free-subway-reentry-time/11290623" rel="noopener noreferrer" target="_blank">Korea JoongAng Daily (Sept. 25, 2023)</a>.</>
)

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
      <h1 className="tl-h1">Seoul Metro 15-Minute Free Re-Entry Timer &amp; Rules</h1>
      <p className="tl-lead">Tapped out by mistake? Re-enter within 15 minutes and the base fare is waived. Start the timer right after you tap out.</p>

      <SubwayTimer />

      <SubwayRules />

      <ToolAbout text={ABOUT} note={NOTE} />

      <WidgetActionChips tool="subway-timer" />
      <MoreTools current="/tools/subway-timer" />
    </div>
  )
}
