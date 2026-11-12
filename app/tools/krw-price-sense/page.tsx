import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolFaq, type FaqItem } from '../ToolFaq'
import { KrwConverter } from './KrwConverter'
import { loadRates } from './rates'

const URL = 'https://www.atlaslabstudios.com/tools/krw-price-sense'
const TITLE = 'Korean Won Price Sense Tool | Street Food & Meal Price Guide (KRW to USD)'
const DESCRIPTION = 'Daily-rate Won converter with realistic price benchmarks for Korean street food, meals, convenience stores, and transit.'

const FAQ: FaqItem[] = [
  { q: 'How often are the exchange rates updated?', a: 'The reference rate comes from ExchangeRate-API and updates once a day. Your card or exchange booth will apply its own rate and fees.' },
  { q: 'How much does a meal cost in Seoul?', a: 'In September 2026, a bowl of bibimbap averaged about ₩12,000 in Seoul and a gimbap roll about ₩3,923, according to the Korea Consumer Agency’s price portal.' },
  { q: 'How much is a subway ride in Seoul?', a: 'The base fare is ₩1,550 for the first 10 km with a transit card. Longer trips add a distance fare.' },
]

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
      <h1 className="tl-h1">Korean Won (KRW) Price Sense &amp; Daily Travel Benchmark</h1>
      <p className="tl-lead">Convert Korean Won to your currency and see what that amount buys in Korea.</p>
      <KrwConverter rates={rates} updated={updated} />
      <WidgetActionChips tool="krw-converter" />
      <ToolFaq items={FAQ} />
      <MoreTools current="/tools/krw-price-sense" />
    </div>
  )
}
