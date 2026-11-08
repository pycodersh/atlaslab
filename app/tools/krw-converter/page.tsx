import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { KrwConverter } from './KrwConverter'
import { loadRates } from './rates'

const URL = 'https://www.atlaslabstudios.com/tools/krw-converter'
const TITLE = 'KRW Price Sense — Atlas Lab'
const DESCRIPTION = 'Convert Korean Won to your currency and see what it buys, with everyday Korean meal price benchmarks.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

// 공개 환율은 하루 한 번 갱신된다. 6시간마다 다시 구우면 충분하다
export const revalidate = 21600

export default async function Page() {
  const { rates, updated } = await loadRates()
  return (
    <div className="tl-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">KRW Price Sense</h1>
      <p className="tl-lead">Convert Korean Won to your currency and see what that amount buys in Korea.</p>
      <KrwConverter rates={rates} updated={updated} />
      <MoreTools current="/tools/krw-converter" />
    </div>
  )
}
