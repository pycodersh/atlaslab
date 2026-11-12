import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolFaq, type FaqItem } from '../ToolFaq'
import { SubwayTimer } from './SubwayTimer'
import { SubwayRules } from './SubwayRules'

const URL = 'https://www.atlaslabstudios.com/tools/subway-timer'
const TITLE = 'Seoul Subway 15-Min Free Re-Entry Timer | Wrong Gate Refund Guide'
const DESCRIPTION = 'Tapped the wrong gate in Seoul Metro? Track your 15-minute free re-entry window and check subway transfer rules instantly.'

const FAQ: FaqItem[] = [
  { q: 'How does free re-entry work on the Seoul subway?', a: 'If you tap out by mistake, tap back in at the same station on the same line within 15 minutes and the ₩1,550 base fare is waived. It works with T-money and other transit cards, once per trip.' },
  { q: 'Which tickets and lines are not covered?', a: 'Single-journey paper tickets and passes are not covered, and neither are AREX, the Shinbundang Line, the Incheon lines and some light rail lines. Line 7 between Kkachiul and Seoknam is also excluded.' },
  { q: 'What should I do if re-entry does not work?', a: 'Press the Help bell button on the gate and ask the staff. The gate system\'s clock decides, so leave yourself a margin.' },
]

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

      <WidgetActionChips tool="subway-timer" />

      <ToolFaq items={FAQ} />
      <MoreTools current="/tools/subway-timer" />
    </div>
  )
}
