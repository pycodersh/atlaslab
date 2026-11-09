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
        <div className="kc-quick notranslate" translate="no">
          {QUICK_AMOUNTS.map(a => (
            <button key={a} type="button" className="kc-chip" aria-pressed={amount === a} onClick={() => setRaw(String(a))}>{won(a)}</button>
          ))}
        </div>
        <div className="kc-panel">
          <p className="kc-result notranslate" translate="no" aria-live="polite">{money(amount * rate, currency)}</p>
          <p className="kc-sub notranslate" translate="no">{won(1000)} = {money(1000 * rate, currency)}</p>
        </div>
      </section>

      <section className="tl-card" aria-live="polite">
        <h2 className="tl-h2">What it buys</h2>
        <div className="kc-buys">
          {BUYS.map(b => {
            const count = howMany(amount / b.price)
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
