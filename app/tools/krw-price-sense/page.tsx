import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolAbout } from '../ToolAbout'
import { KrwConverter } from './KrwConverter'
import { loadRates } from './rates'

const URL = 'https://www.atlaslabstudios.com/tools/krw-price-sense'
const TITLE = 'Korean Won Price Sense Tool | Street Food & Meal Price Guide (KRW to USD)'
const DESCRIPTION = 'Daily-rate Won converter with realistic price benchmarks for Korean street food, meals, convenience stores, and transit.'

// About this tool — 예전 FAQ 의 핵심을 2~3문장으로. 참고 문구(기준일 · 확인 안내 · 출처)는 위젯 밑에서 옮겨 왔다
const ABOUT = "Type an amount in Korean won to see it in your currency, or swap the two, and see what that money typically buys in Korea, from a convenience store snack to a sit-down meal. As a guide, a bowl of bibimbap averaged about ₩12,000 in Seoul in September 2026, and a subway ride starts at ₩1,550 with a transit card."

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
      <KrwConverter rates={rates} />
      <ToolAbout text={ABOUT} note={
        <>Note: Reference rate from <span className="notranslate" translate="no">{updated}</span>; your card or exchange booth will use its own rate and fees.{' '}<a href="https://www.exchangerate-api.com" rel="noopener noreferrer" target="_blank">Rates by Exchange Rate API</a>. Meal averages are from the Korea Consumer Agency’s Price Portal for September 2026,{' '}<a href="https://www.fnnews.com/news/202610191207019169" rel="noopener noreferrer" target="_blank">as reported by Financial News</a>; convenience store prices are{' '}<a href="https://blog.namanecard.com/korea-meal-prices-seoul-2026-ko/" rel="noopener noreferrer" target="_blank">typical ranges</a> and vary by shop.</>
      } />
      <WidgetActionChips tool="krw-converter" />
      <MoreTools current="/tools/krw-price-sense" />
    </div>
  )
}
