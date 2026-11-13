import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolAbout } from '../ToolAbout'
import { KoreaHolidayModal } from './KoreaHolidayModal'

const URL = 'https://www.atlaslabstudios.com/tools/korea-holidays'
const TITLE = 'Korea Public Holidays & Peak Travel Calendar | Seollal & Chuseok Alerts'
const DESCRIPTION = 'Check Korean public holidays, seasonal business closures during Seollal and Chuseok, and KTX peak booking warning dates.'

// About this tool — 예전 FAQ 의 핵심을 2~3문장으로. 참고 문구(기준일 · 확인 안내 · 출처)는 위젯 밑에서 옮겨 왔다
const ABOUT = "See every Korean public holiday for the year you pick, with what each one means for travel: which shops and restaurants close, when trains and highways jam, and when royal palaces have opened for free. Seollal and Chuseok matter most. In 2027, Seollal runs February 6 to 8 with a substitute day off on February 9, and Chuseok runs September 14 to 16."
const NOTE = (
  <>Note: Dates checked November 9, 2026. Store hours vary, so check a map app before you go. Sources:{' '}<a href="https://www.klook.com/blog/south-korea-public-holidays/" rel="noopener noreferrer" target="_blank">Klook, citing the official almanac</a>,{' '}<a href="https://www.koreatimes.co.kr/amp/southkorea/politics/20260331/labor-day-set-to-become-public-holiday-for-all-workers" rel="noopener noreferrer" target="_blank">The Korea Times</a>,{' '}<a href="https://www.koreajoongangdaily.com/korea/constitution-day-to-be-reinstated-as-public-holiday-starting-this-year/12427789" rel="noopener noreferrer" target="_blank">Korea JoongAng Daily</a>.</>
)

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export default function Page() {
  return (
    <div className="tl-wrap hc-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">Korea Public Holidays &amp; Peak Booking Calendar</h1>
      <p className="tl-lead">See which holidays will affect your trip, and what to do about them.</p>
      <KoreaHolidayModal />
      <ToolAbout text={ABOUT} note={NOTE} />
      <WidgetActionChips tool="holiday-calendar" />
      <MoreTools current="/tools/korea-holidays" />
    </div>
  )
}
