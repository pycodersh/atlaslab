import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { ToolFaq, type FaqItem } from '../ToolFaq'
import { KoreaHolidayModal } from './KoreaHolidayModal'

const URL = 'https://www.atlaslabstudios.com/tools/korea-holidays'
const TITLE = 'Korea Public Holidays & Peak Travel Calendar | Seollal & Chuseok Alerts'
const DESCRIPTION = 'Check Korean public holidays, seasonal business closures during Seollal and Chuseok, and KTX peak booking warning dates.'

const FAQ: FaqItem[] = [
  { q: 'When are Seollal and Chuseok in 2027?', a: 'Seollal runs from February 6 to 8, 2027, with a substitute day off on February 9. Chuseok runs from September 14 to 16, 2027.' },
  { q: 'Are shops closed during Seollal and Chuseok?', a: 'Many small shops, restaurants and traditional markets close, and trains and highways are very busy. Major royal palaces have usually opened for free.' },
  { q: 'What is a substitute holiday?', a: 'When a holiday falls on a weekend, the next weekday usually becomes a day off. Seollal and Chuseok get one only when they overlap a Sunday.' },
]

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
      <ToolFaq items={FAQ} />
      <MoreTools current="/tools/korea-holidays" />
    </div>
  )
}
