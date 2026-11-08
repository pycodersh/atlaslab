import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { KrwConverter, type Rates } from './KrwConverter'

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

const FALLBACK_RATES: Rates = {
  USD: 0.000738, EUR: 0.000659, JPY: 0.116589, CNY: 0.004926, GBP: 0.00055, AUD: 0.00107, CAD: 0.001037, SGD: 0.000946,
  HKD: 0.005792, TWD: 0.02413, THB: 0.024759, VND: 18.840794, PHP: 0.04634, MYR: 0.002987, IDR: 13.304043, INR: 0.069205,
}
const FALLBACK_DATE = '2026-11-08'

async function loadRates(): Promise<{ rates: Rates; updated: string }> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/KRW', {
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string }
    const updated = new Date(json.time_last_update_utc ?? '')
    const live = json.rates
    if (json.result !== 'success' || !live || Number.isNaN(updated.getTime())) throw new Error('unexpected response')
    // 한 통화라도 비면 폴백 값으로 메운다 — 선택지가 사라지거나 NaN 이 나오지 않게
    const rates = Object.fromEntries(Object.entries(FALLBACK_RATES).map(([code, fallback]) => {
      const value = live[code]
      return [code, typeof value === 'number' && value > 0 ? value : fallback]
    }))
    return { rates, updated: updated.toISOString().slice(0, 10) }
  } catch {
    return { rates: FALLBACK_RATES, updated: FALLBACK_DATE }
  }
}

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
