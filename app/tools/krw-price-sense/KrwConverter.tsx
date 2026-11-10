'use client'

import { useEffect, useState } from 'react'

export type Rates = Record<string, number>

const STORAGE_KEY = 'atlas_krw_currency'
const CURRENCIES = ['USD', 'EUR', 'JPY', 'CNY', 'GBP', 'AUD', 'CAD', 'SGD', 'HKD', 'TWD', 'THB', 'VND', 'PHP', 'MYR', 'IDR', 'INR']
const NO_DECIMALS = new Set(['JPY', 'VND', 'IDR'])
const QUICK_AMOUNTS = [1000, 5000, 10000, 50000]

// 참가격(한국소비자원) 2026년 9월 평균 — fnnews 2026-10-19 보도. 값을 바꾸면 아래 출처 문구의 기준월도 함께 고친다
const BENCHMARKS: { name: string; scope: string; low: number; high?: number }[] = [
  { name: 'Gimbap, 1 roll', scope: 'Seoul average', low: 3923 },
  { name: 'Bibimbap', scope: 'Seoul average', low: 12000 },
  { name: 'Jajangmyeon', scope: 'National average', low: 7233 },
  { name: 'Kalguksu', scope: 'National average', low: 9071 },
  { name: 'Kimchi jjigae set', scope: 'National average', low: 9092 },
  { name: 'Naengmyeon', scope: 'National average', low: 10853 },
  { name: 'Samgyetang', scope: 'National average', low: 16875 },
  { name: 'Samgyeopsal, 200 g', scope: 'National average', low: 17906 },
  { name: 'Triangle gimbap', scope: 'Convenience store', low: 1200, high: 1500 },
  { name: 'Instant ramen', scope: 'Convenience store', low: 1500, high: 2000 },
  { name: 'Subway base fare', scope: 'First 10 km, transit card', low: 1550 },
]

// 위 BENCHMARKS 의 서울 평균 · 지하철 기본운임과 같은 값
const BUYS = [
  { price: 12000, one: 'Bibimbap', many: 'Bibimbaps', emoji: '🍚', tint: 'is-orange' },
  { price: 3923, one: 'Gimbap roll', many: 'Gimbap rolls', emoji: '🍙', tint: 'is-emerald' },
  { price: 1550, one: 'Subway ride', many: 'Subway rides', emoji: '🚇', tint: 'is-blue' },
]

// 타일 폭이 좁아 큰 수는 6.5M 처럼 줄인다
function howMany(count: number) {
  if (count >= 10000) return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(count)
  return (count < 10 ? Math.round(count * 10) / 10 : Math.round(count)).toLocaleString('en-US')
}

const won = (n: number) => `₩${Math.round(n).toLocaleString('en-US')}`

function money(value: number, currency: string) {
  const digits = NO_DECIMALS.has(currency) ? 0 : 2
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, currencyDisplay: 'code', minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(value).replace(/ /g, ' ')
}

type Mode = 'to-fx' | 'to-krw'
const USD_PRESETS = [5, 10, 20, 50]

// 고른 통화로 $5 · $10 · $20 · $50 쯤 되는 금액 — 10 미만은 정수, 그 위는 앞 두 자리를 5 단위로 둥글린다(¥735 → ¥750, ¥1,470 → ¥1,500)
const roundNice = (n: number) => {
  if (n < 10) return Math.max(1, Math.round(n))
  const p = 10 ** (Math.floor(Math.log10(n)) - 1)
  return Math.round(n / p / 5) * 5 * p
}
const fxPresets = (rates: Rates, currency: string) => USD_PRESETS.map(usd => roundNice(usd * rates[currency] / rates.USD))
const fxValue = (krw: number, rate: number, currency: string) =>
  String(NO_DECIMALS.has(currency) ? Math.round(krw * rate) : Math.round(krw * rate * 100) / 100)
const symbolMoney = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'symbol', maximumFractionDigits: 0 }).format(value)
// 1 외화가 몇 원인지 — 엔·동처럼 작은 단위는 소수점까지 보여 준다
const wonPrecise = (n: number) => `₩${n.toLocaleString('en-US', { maximumFractionDigits: n < 100 ? 2 : 0 })}`
// 입력값에 천 단위 쉼표를 넣되, 외화 모드에서 치는 중인 소수점은 그대로 둔다
const withCommas = (raw: string) => {
  if (raw === '') return ''
  const [int, frac] = raw.split('.')
  return `${Number(int || 0).toLocaleString('en-US')}${frac === undefined ? '' : `.${frac}`}`
}

export function KrwConverter({ rates, updated }: { rates: Rates; updated: string }) {
  const [raw, setRaw] = useState('10000')
  const [currency, setCurrency] = useState('USD')
  const [mode, setMode] = useState<Mode>('to-fx')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage 는 하이드레이션 뒤에만 읽을 수 있다
      if (saved && CURRENCIES.includes(saved)) setCurrency(saved)
    } catch { /* 기본값 USD 로 동작한다 */ }
  }, [])

  const chooseCurrency = (code: string) => {
    // 외화 → 원화 방향이면 입력이 그 통화 금액이므로, 같은 원화 가치를 새 통화로 옮겨 적는다
    if (mode === 'to-krw') {
      const krw = rates[currency] ? (Number(raw) || 0) / rates[currency] : 0
      setRaw(fxValue(krw, rates[code], code))
    }
    setCurrency(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch { /* 이번 방문에만 적용된다 */ }
  }

  const amount = Number(raw) || 0
  const rate = rates[currency]
  const toKrw = mode === 'to-krw'
  // 'What it buys' 와 결과는 언제나 원화 기준으로 계산한다
  const krwAmount = toKrw ? (rate ? amount / rate : 0) : amount
  const presets = toKrw ? fxPresets(rates, currency) : QUICK_AMOUNTS

  const onAmount = (value: string) => {
    if (!toKrw) return setRaw(value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 10))
    const clean = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').replace(/^0+(?=\d)/, '')
    const [int, frac] = clean.split('.')
    setRaw(`${int.slice(0, 9)}${frac === undefined ? '' : `.${frac.slice(0, NO_DECIMALS.has(currency) ? 0 : 2)}`}`)
  }

  // 방향을 바꿔도 같은 금액을 이어서 보여 준다(₩10,000 → USD 7.38)
  const swap = () => {
    setRaw(toKrw ? String(Math.round(krwAmount)) : fxValue(krwAmount, rate, currency))
    setMode(toKrw ? 'to-fx' : 'to-krw')
  }

  return (
    <>
      <style>{`
        .kc-fields { display: grid; grid-template-columns: minmax(0, 1fr) 44px 120px; gap: 10px; align-items: end; }
        .kc-swap { align-self: stretch; display: flex; align-items: flex-end; }
        .kc-swap button { width: 44px; height: 52px; padding: 0; border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; color: #172554; font-size: 18px; line-height: 1; cursor: pointer; transition: background .15s, border-color .15s; }
        @media (hover: hover) { .kc-swap button:hover { background: #EFF6FF; border-color: #93C5FD; } }
        .kc-swap button:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .kc-label { display: block; font-size: 13px; font-weight: 600; color: #4B5563; margin-bottom: 6px; }
        .kc-quick { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
        .kc-chip {
          min-height: 44px; padding: 8px 4px; border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; cursor: pointer; white-space: nowrap;
          font: 500 13px "DM Sans", Inter, system-ui, sans-serif; color: #111827; transition: background .15s, border-color .15s, color .15s;
        }
        .kc-chip[aria-pressed="true"] { background: #172554; border-color: #172554; color: #fff; font-weight: 700; }
        .kc-chip:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        @media (hover: hover) { .kc-chip:not([aria-pressed="true"]):hover { background: #EFF6FF; border-color: #93C5FD; color: #1E3A8A; } }
        .kc-panel { margin-top: 16px; padding: 24px; background: linear-gradient(135deg, rgba(239,246,255,.7), rgba(238,242,255,.5)); border: 1px solid rgba(219,234,254,.8); border-radius: 16px; }
        .kc-result { margin: 0; font-size: clamp(32px, 9vw, 44px); font-weight: 800; line-height: 1.15; color: #172554; overflow-wrap: anywhere; }
        .kc-sub { font-size: 14px; color: #475569; margin: 6px 0 0; }
        .kc-buys { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; text-align: center; }
        .kc-tile { padding: 14px 6px 16px; border: 1px solid; border-radius: 12px; }
        .kc-tile.is-orange { background: #FFF7ED; border-color: #FED7AA; color: #9A3412; }
        .kc-tile.is-emerald { background: #ECFDF5; border-color: #A7F3D0; color: #065F46; }
        .kc-tile.is-blue { background: #EFF6FF; border-color: #BFDBFE; color: #1E40AF; }
        .kc-emoji { display: block; font-size: 20px; line-height: 1; margin-bottom: 6px; }
        .kc-count { display: block; font-size: 24px; font-weight: 800; line-height: 1.2; }
        .kc-what { display: block; font-size: 12px; font-weight: 500; line-height: 1.3; margin-top: 4px; }
        .kc-row { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 14px 0; border-top: 1px solid #F3F4F6; }
        .kc-row:first-of-type { border-top: 0; padding-top: 0; }
        .kc-row:last-of-type { padding-bottom: 0; }
        .kc-name { font-size: 15px; font-weight: 600; color: #111827; min-width: 0; }
        .kc-scope { display: block; font-size: 12px; font-weight: 400; color: #4B5563; margin-top: 2px; }
        .kc-price { flex: none; text-align: right; font-size: 15px; font-weight: 700; color: #111827; white-space: nowrap; }
        .kc-conv { display: block; font-size: 12px; font-weight: 400; color: #4B5563; margin-top: 2px; }
        @media (min-width: 640px) { .kc-chip { padding: 8px 12px; font-size: 14px; } }
      `}</style>

      <section className="tl-card">
        <div className="kc-fields">
          <div>
            <label key={`${mode}-${currency}`} className="kc-label notranslate" translate="no" htmlFor="kc-amount">Amount in {toKrw ? currency : 'KRW'}</label>
            <input id="kc-amount" className="tl-input notranslate" translate="no" inputMode={toKrw ? 'decimal' : 'numeric'} autoComplete="off" value={withCommas(raw)}
              onChange={e => onAmount(e.target.value)} />
          </div>
          <div className="kc-swap">
            <button type="button" aria-label={toKrw ? `Convert KRW to ${currency}` : `Convert ${currency} to KRW`} onClick={swap}>⇄</button>
          </div>
          <div>
            <label key={mode} className="kc-label" htmlFor="kc-currency">{toKrw ? 'From' : 'To'}</label>
            <select id="kc-currency" className="tl-input notranslate" translate="no" value={currency} onChange={e => chooseCurrency(e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="kc-quick notranslate" translate="no">
          {presets.map((a, i) => (
            <button key={`${mode}-${i}`} type="button" className="kc-chip" aria-pressed={amount === a} onClick={() => setRaw(String(a))}>{toKrw ? symbolMoney(a, currency) : won(a)}</button>
          ))}
        </div>
        <div className="kc-panel">
          <p className="kc-result notranslate" translate="no" aria-live="polite">{toKrw ? won(krwAmount) : money(krwAmount * rate, currency)}</p>
          <p className="kc-sub notranslate" translate="no">{won(1000)} = {money(1000 * rate, currency)} · 1 {currency} ≈ {wonPrecise(1 / rate)}</p>
        </div>
      </section>

      <section className="tl-card" aria-live="polite">
        <h2 className="tl-h2">What it buys</h2>
        <div className="kc-buys">
          {BUYS.map(b => {
            const count = howMany(krwAmount / b.price)
            return (
              <div key={b.one} className={`kc-tile ${b.tint}`}>
                <span className="kc-emoji" aria-hidden="true">{b.emoji}</span>
                <span className="kc-count notranslate" translate="no">{count}</span>
                {/* key: 자동 번역이 글자 노드를 바꿔 끼워도 단수 · 복수가 바뀌면 새로 그려지게 */}
                <span key={count === '1' ? 'one' : 'many'} className="kc-what">{count === '1' ? b.one : b.many}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="tl-card">
        <h2 className="tl-h2">Everyday price benchmarks</h2>
        {BENCHMARKS.map(b => (
          <div key={b.name} className="kc-row">
            <span className="kc-name">{b.name}<span className="kc-scope">{b.scope}</span></span>
            <span className="kc-price notranslate" translate="no">
              {b.high ? `${won(b.low)}–${won(b.high).slice(1)}` : won(b.low)}
              <span className="kc-conv">
                {b.high ? `${money(b.low * rate, currency)} – ${money(b.high * rate, currency)}` : money(b.low * rate, currency)}
              </span>
            </span>
          </div>
        ))}
      </section>

      <p className="tl-note">
        Reference rate from <span className="notranslate" translate="no">{updated}</span>.{' '}
        <a href="https://www.exchangerate-api.com" rel="noopener noreferrer" target="_blank">Rates by Exchange Rate API</a>.
        Your card or exchange booth will use its own rate and fees. Meal averages are from Korea Consumer Agency&apos;s Price Portal for September 2026,{' '}
        <a href="https://www.fnnews.com/news/202610191207019169" rel="noopener noreferrer" target="_blank">as reported by Financial News</a>;
        convenience store prices are <a href="https://blog.namanecard.com/korea-meal-prices-seoul-2026-ko/" rel="noopener noreferrer" target="_blank">typical ranges</a>. Prices vary by shop.
      </p>
    </>
  )
}
