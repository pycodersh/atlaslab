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

const BUYS = [
  { price: 12000, one: 'Seoul bibimbap', many: 'Seoul bibimbaps' },
  { price: 3923, one: 'roll of gimbap', many: 'rolls of gimbap' },
  { price: 1550, one: 'subway base fare', many: 'subway base fares' },
]

const won = (n: number) => `₩${Math.round(n).toLocaleString('en-US')}`

function money(value: number, currency: string) {
  const digits = NO_DECIMALS.has(currency) ? 0 : 2
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, currencyDisplay: 'code', minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(value).replace(/ /g, ' ')
}

export function KrwConverter({ rates, updated }: { rates: Rates; updated: string }) {
  const [raw, setRaw] = useState('10000')
  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage 는 하이드레이션 뒤에만 읽을 수 있다
      if (saved && CURRENCIES.includes(saved)) setCurrency(saved)
    } catch { /* 기본값 USD 로 동작한다 */ }
  }, [])

  const chooseCurrency = (code: string) => {
    setCurrency(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch { /* 이번 방문에만 적용된다 */ }
  }

  const amount = Number(raw) || 0
  const rate = rates[currency]
  const display = raw === '' ? '' : Number(raw).toLocaleString('en-US')

  return (
    <>
      <style>{`
        .kc-fields { display: grid; grid-template-columns: minmax(0, 1fr) 120px; gap: 10px; }
        .kc-label { display: block; font-size: 13px; font-weight: 600; color: #4B5563; margin-bottom: 6px; }
        .kc-quick { margin-top: 12px; }
        .kc-result { margin: 22px 0 0; font-size: clamp(30px, 8vw, 40px); font-weight: 700; line-height: 1.15; color: #111827; overflow-wrap: anywhere; }
        .kc-sub { font-size: 14px; color: #6B7280; margin: 6px 0 0; }
        .kc-buys { list-style: none; margin: 0; padding: 0; }
        .kc-buys li { padding: 10px 0; border-top: 1px solid #F3F4F6; font-size: 15px; color: #111827; }
        .kc-buys li:first-child { border-top: 0; padding-top: 0; }
        .kc-buys li:last-child { padding-bottom: 0; }
        .kc-row { display: flex; justify-content: space-between; gap: 14px; padding: 11px 0; border-top: 1px solid #F3F4F6; }
        .kc-row:first-of-type { border-top: 0; padding-top: 0; }
        .kc-name { font-size: 15px; font-weight: 600; color: #111827; }
        .kc-scope { display: block; font-size: 12.5px; font-weight: 400; color: #6B7280; margin-top: 2px; }
        .kc-price { text-align: right; font-size: 15px; font-weight: 700; color: #111827; white-space: nowrap; }
        .kc-conv { display: block; font-size: 12.5px; font-weight: 400; color: #6B7280; margin-top: 2px; }
      `}</style>

      <section className="tl-card">
        <div className="kc-fields">
          <div>
            <label className="kc-label" htmlFor="kc-amount">Amount in KRW</label>
            <input id="kc-amount" className="tl-input notranslate" translate="no" inputMode="numeric" autoComplete="off" value={display}
              onChange={e => setRaw(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 10))} />
          </div>
          <div>
            <label className="kc-label" htmlFor="kc-currency">To</label>
            <select id="kc-currency" className="tl-input notranslate" translate="no" value={currency} onChange={e => chooseCurrency(e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="tl-chips kc-quick notranslate" translate="no">
          {QUICK_AMOUNTS.map(a => (
            <button key={a} type="button" className="tl-chip" aria-pressed={amount === a} onClick={() => setRaw(String(a))}>{won(a)}</button>
          ))}
        </div>
        <p className="kc-result notranslate" translate="no" aria-live="polite">{money(amount * rate, currency)}</p>
        <p className="kc-sub notranslate" translate="no">{won(1000)} = {money(1000 * rate, currency)}</p>
      </section>

      <section className="tl-card" aria-live="polite">
        <h2 className="tl-h2">What it buys</h2>
        <ul className="kc-buys">
          {BUYS.map(b => {
            const count = amount / b.price
            const rounded = count < 10 ? Math.round(count * 10) / 10 : Math.round(count)
            return (
              <li key={b.one}>
                About <strong className="notranslate" translate="no">{rounded.toLocaleString('en-US')}</strong> {rounded === 1 ? b.one : b.many}
              </li>
            )
          })}
        </ul>
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
