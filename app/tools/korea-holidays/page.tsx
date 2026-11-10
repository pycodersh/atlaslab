import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { KoreaHolidayModal } from './KoreaHolidayModal'

const URL = 'https://www.atlaslabstudios.com/tools/holiday-calendar'
const TITLE = 'Korea Holiday & Peak Calendar — Atlas Lab'
const DESCRIPTION = 'Korean public holidays for 2026 and 2027, with Seollal and Chuseok shutdowns, crowd levels and KTX peak booking warnings.'

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
      <h1 className="tl-h1">Korea Holiday &amp; Peak Calendar</h1>
      <p className="tl-lead">See which holidays will affect your trip, and what to do about them.</p>
      <KoreaHolidayModal />
      <MoreTools current="/tools/holiday-calendar" />
    </div>
  )
}
