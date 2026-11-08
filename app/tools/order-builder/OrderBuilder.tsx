'use client'

import { useEffect, useMemo, useState } from 'react'

type Dish = { id: string; ko: string; roman: string; en: string; servings?: boolean }
type Phrase = { id: string; label: string; ko: string; roman: string; en: string }
type Line = { ko: string; roman: string; en: string }

const MAX_QTY = 4

const DISHES: Dish[] = [
  { id: 'kimchi', ko: '김치찌개', roman: 'Kimchi-jjigae', en: 'kimchi stew' },
  { id: 'doenjang', ko: '된장찌개', roman: 'Doenjang-jjigae', en: 'soybean paste stew' },
  { id: 'sundubu', ko: '순두부찌개', roman: 'Sundubu-jjigae', en: 'soft tofu stew' },
  { id: 'bibimbap', ko: '비빔밥', roman: 'Bibimbap', en: 'bibimbap' },
  { id: 'gukbap', ko: '국밥', roman: 'Gukbap', en: 'gukbap (rice soup)' },
  { id: 'naengmyeon', ko: '냉면', roman: 'Naengmyeon', en: 'cold noodles' },
  { id: 'kalguksu', ko: '칼국수', roman: 'Kalguksu', en: 'knife-cut noodles' },
  { id: 'samgyetang', ko: '삼계탕', roman: 'Samgyetang', en: 'ginseng chicken soup' },
  { id: 'jeyuk', ko: '제육볶음', roman: 'Jeyuk-bokkeum', en: 'spicy stir-fried pork' },
  { id: 'tteokbokki', ko: '떡볶이', roman: 'Tteokbokki', en: 'tteokbokki' },
  { id: 'gimbap', ko: '김밥', roman: 'Gimbap', en: 'gimbap' },
  { id: 'samgyeopsal', ko: '삼겹살', roman: 'Samgyeopsal', en: 'pork belly', servings: true },
  { id: 'bulgogi', ko: '불고기', roman: 'Bulgogi', en: 'bulgogi', servings: true },
  { id: 'dakgalbi', ko: '닭갈비', roman: 'Dak-galbi', en: 'spicy stir-fried chicken', servings: true },
]

const SPICE: Phrase[] = [
  { id: 'less', label: 'Less spicy', ko: '덜 맵게 해 주세요', roman: 'Deol maepge hae juseyo', en: 'Less spicy, please.' },
  { id: 'none', label: 'Not spicy', ko: '안 맵게 해 주세요', roman: 'An maepge hae juseyo', en: 'Not spicy, please.' },
  { id: 'extra', label: 'Spicy', ko: '맵게 해 주세요', roman: 'Maepge hae juseyo', en: 'Make it spicy, please.' },
]

const REQUESTS: Phrase[] = [
  { id: 'cilantro', label: 'No cilantro', ko: '고수 빼 주세요', roman: 'Gosu ppae juseyo', en: 'No cilantro, please.' },
  { id: 'scallion', label: 'No green onion', ko: '파 빼 주세요', roman: 'Pa ppae juseyo', en: 'No green onion, please.' },
  { id: 'onion', label: 'No onion', ko: '양파 빼 주세요', roman: 'Yangpa ppae juseyo', en: 'No onion, please.' },
  { id: 'garlic', label: 'No garlic', ko: '마늘 빼 주세요', roman: 'Maneul ppae juseyo', en: 'No garlic, please.' },
  { id: 'egg', label: 'No egg', ko: '계란 빼 주세요', roman: 'Gyeran ppae juseyo', en: 'No egg, please.' },
  { id: 'pork', label: 'No pork', ko: '돼지고기 빼 주세요', roman: 'Dwaejigogi ppae juseyo', en: 'No pork, please.' },
  { id: 'salt', label: 'Less salty', ko: '덜 짜게 해 주세요', roman: 'Deol jjage hae juseyo', en: 'Less salty, please.' },
  { id: 'peanut', label: 'Peanut allergy', ko: '땅콩 알레르기가 있어요', roman: 'Ttangkong allereugiga isseoyo', en: 'I have a peanut allergy.' },
  { id: 'seafood', label: "Can't eat seafood", ko: '해산물 못 먹어요', roman: 'Haesanmul mot meogeoyo', en: "I can't eat seafood." },
  { id: 'meat', label: "Can't eat meat", ko: '고기는 못 먹어요', roman: 'Gogineun mot meogeoyo', en: "I can't eat meat." },
  { id: 'sauce', label: 'Sauce on the side', ko: '소스는 따로 주세요', roman: 'Soseuneun ttaro juseyo', en: 'Sauce on the side, please.' },
  { id: 'togo', label: 'To go', ko: '포장해 주세요', roman: 'Pojanghae juseyo', en: 'To go, please.' },
]

// 숫자 뒤 낱말이 달라 표로 둔다: 하나 / 두 개 · 세 개 · 네 개, 고기 메뉴는 N인분
const PIECES = [
  { ko: '하나', roman: 'hana', en: 'One order' },
  { ko: '두 개', roman: 'du gae', en: 'Two orders' },
  { ko: '세 개', roman: 'se gae', en: 'Three orders' },
  { ko: '네 개', roman: 'ne gae', en: 'Four orders' },
]
const SERVINGS = [
  { ko: '1인분', roman: 'il-inbun', en: 'One serving' },
  { ko: '2인분', roman: 'i-inbun', en: 'Two servings' },
  { ko: '3인분', roman: 'sam-inbun', en: 'Three servings' },
  { ko: '4인분', roman: 'sa-inbun', en: 'Four servings' },
]

function dishLine(dish: Dish, qty: number): Line {
  const n = (dish.servings ? SERVINGS : PIECES)[qty - 1]
  return {
    ko: `${dish.ko} ${n.ko} 주세요`,
    roman: `${dish.roman} ${n.roman} juseyo`,
    en: `${n.en} of ${dish.en}, please.`,
  }
}

export function OrderBuilder() {
  const [qty, setQty] = useState<Record<string, number>>({})
  const [spice, setSpice] = useState<string | null>(null)
  const [requests, setRequests] = useState<string[]>([])
  const [showing, setShowing] = useState(false)
  const [copied, setCopied] = useState(false)

  const lines = useMemo<Line[]>(() => [
    ...DISHES.filter(d => qty[d.id]).map(d => dishLine(d, qty[d.id])),
    ...SPICE.filter(s => s.id === spice),
    ...REQUESTS.filter(r => requests.includes(r.id)),
  ], [qty, spice, requests])

  const orderedDishes = DISHES.filter(d => qty[d.id])

  useEffect(() => {
    if (!showing) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowing(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [showing])

  const toggleDish = (id: string) => setQty(q => {
    const next = { ...q }
    if (next[id]) delete next[id]
    else next[id] = 1
    return next
  })
  const changeQty = (id: string, delta: number) => setQty(q => {
    const value = (q[id] ?? 0) + delta
    const next = { ...q }
    if (value <= 0) delete next[id]
    else next[id] = Math.min(value, MAX_QTY)
    return next
  })
  const toggleRequest = (id: string) => setRequests(r => r.includes(id) ? r.filter(x => x !== id) : [...r, id])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lines.map(l => l.ko).join('\n'))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch { /* 클립보드 권한이 없으면 화면 보여 주기로 충분하다 */ }
  }

  const hasAllergyLine = requests.some(r => r === 'peanut' || r === 'seafood')

  return (
    <>
      <style>{`
        .ob-stepper { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid #F3F4F6; }
        .ob-picked { margin-top: 16px; }
        .ob-dish-name { font-size: 15px; font-weight: 600; min-width: 0; }
        .ob-qty { display: flex; align-items: center; gap: 4px; flex: none; }
        .ob-qty button { width: 44px; height: 44px; border-radius: 10px; border: 1px solid #E5E7EB; background: #fff; font-size: 20px; color: #111827; cursor: pointer; }
        .ob-qty button:disabled { color: #D1D5DB; cursor: default; }
        .ob-qty span { width: 28px; text-align: center; font-weight: 700; }
        .ob-line { padding: 12px 0; border-top: 1px solid #F3F4F6; }
        .ob-line:first-of-type { border-top: 0; padding-top: 0; }
        .ob-ko { font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: 20px; font-weight: 700; line-height: 1.35; color: #111827; margin: 0; }
        .ob-roman { font-size: 13px; color: #C8102E; margin: 3px 0 0; }
        .ob-en { font-size: 13px; color: #6B7280; margin: 2px 0 0; }
        .ob-empty { font-size: 14px; color: #6B7280; margin: 0; }
        .ob-result .tl-actions { margin-top: 16px; }
        .ob-result .tl-note { margin-top: 14px; }
        .ob-show { position: fixed; inset: 0; z-index: 1000; background: #fff; display: flex; flex-direction: column; padding: 20px; }
        .ob-show-lines { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; margin: 8px 0 16px; padding: 12px 0; }
        .ob-show-lines > :first-child { margin-top: auto; }
        .ob-show-lines > :last-child { margin-bottom: auto; }
        .ob-show-ko { font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: clamp(30px, 8vw, 56px); line-height: 1.25; font-weight: 800; color: #111827; margin: 0; word-break: keep-all; text-align: center; }
      `}</style>

      <section className="tl-card">
        <h2 className="tl-h2">1. Choose your dishes</h2>
        <div className="tl-chips">
          {DISHES.map(d => (
            <button key={d.id} type="button" className="tl-chip" aria-pressed={!!qty[d.id]} onClick={() => toggleDish(d.id)}>
              {d.roman}
            </button>
          ))}
        </div>
        {orderedDishes.length > 0 && (
          <div className="ob-picked">
            {orderedDishes.map(d => (
              <div key={d.id} className="ob-stepper">
                <span className="ob-dish-name">{d.roman}{d.servings ? ' (servings)' : ''}</span>
                <div className="ob-qty">
                  <button type="button" aria-label={`One less ${d.roman}`} onClick={() => changeQty(d.id, -1)}>−</button>
                  <span className="notranslate" translate="no">{qty[d.id]}</span>
                  <button type="button" aria-label={`One more ${d.roman}`} disabled={qty[d.id] >= MAX_QTY} onClick={() => changeQty(d.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="tl-card">
        <h2 className="tl-h2">2. Spice level</h2>
        <div className="tl-chips">
          {SPICE.map(s => (
            <button key={s.id} type="button" className="tl-chip" aria-pressed={spice === s.id} onClick={() => setSpice(v => v === s.id ? null : s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="tl-card">
        <h2 className="tl-h2">3. Requests</h2>
        <div className="tl-chips">
          {REQUESTS.map(r => (
            <button key={r.id} type="button" className="tl-chip" aria-pressed={requests.includes(r.id)} onClick={() => toggleRequest(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
      </section>

      <section className="tl-card ob-result" aria-live="polite">
        <h2 className="tl-h2">Your order in Korean</h2>
        {lines.length === 0
          ? <p className="ob-empty">Your Korean phrases will appear here.</p>
          : lines.map(l => (
            <div key={l.ko} className="ob-line">
              <p className="ob-ko notranslate" translate="no" lang="ko">{l.ko}</p>
              <p className="ob-roman notranslate" translate="no">{l.roman}</p>
              <p className="ob-en">{l.en}</p>
            </div>
          ))}
        <div className="tl-actions">
          <button type="button" className="tl-btn" disabled={lines.length === 0} onClick={() => setShowing(true)}>Show to staff</button>
          <button type="button" className="tl-btn tl-btn-ghost" disabled={lines.length === 0} onClick={copy}>{copied ? 'Copied' : 'Copy Korean'}</button>
        </div>
        {hasAllergyLine && (
          <p className="tl-note">
            These phrases tell staff what you need, but they can&apos;t guarantee a dish is free of traces or cross-contamination.
            With a severe allergy, confirm with staff and carry your medication.
          </p>
        )}
      </section>

      {showing && (
        <div className="ob-show" role="dialog" aria-modal="true" aria-label="Order to show staff">
          <div className="ob-show-lines">
            {lines.map(l => <p key={l.ko} className="ob-show-ko notranslate" translate="no" lang="ko">{l.ko}</p>)}
          </div>
          <button type="button" className="tl-btn tl-btn-ghost" autoFocus onClick={() => setShowing(false)}>Close</button>
        </div>
      )}
    </>
  )
}
