'use client'

import { useState } from 'react'
import { Footprints, Maximize2, Shirt, Utensils, type LucideIcon } from 'lucide-react'

type Tab = 'shoes' | 'clothes' | 'meat' | 'room'
type Gender = 'women' | 'men'

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'shoes', label: 'Shoes', icon: Footprints },
  { id: 'clothes', label: 'Clothes', icon: Shirt },
  { id: 'meat', label: 'Meat Portions', icon: Utensils },
  { id: 'room', label: 'Room / Pyeong', icon: Maximize2 },
]

// 대형 스포츠 브랜드 표를 기준으로 한 일반값. 브랜드마다 반 치수쯤 다를 수 있다 — [mm, US, UK, EU]
const SHOES: Record<Gender, [number, number, number, number][]> = {
  women: [[230, 6, 3.5, 36.5], [235, 6.5, 4, 37.5], [240, 7, 4.5, 38], [245, 7.5, 5, 38.5], [250, 8, 5.5, 39], [255, 8.5, 6, 40], [260, 9, 6.5, 40.5], [265, 9.5, 7, 41], [270, 10, 7.5, 42], [275, 10.5, 8, 42.5], [280, 11, 8.5, 43], [285, 11.5, 9, 44], [290, 12, 9.5, 44.5]],
  men: [[230, 5, 4, 37.5], [235, 5.5, 4.5, 38], [240, 6, 5, 38.5], [245, 6.5, 5.5, 39], [250, 7, 6, 40], [255, 7.5, 6.5, 40.5], [260, 8, 7, 41], [265, 8.5, 7.5, 42], [270, 9, 8, 42.5], [275, 9.5, 8.5, 43], [280, 10, 9, 44], [285, 10.5, 9.5, 44.5], [290, 11, 10, 45]],
}
const CLOTHES: Record<Gender, [string, string][]> = {
  women: [['44', 'XS'], ['55', 'S'], ['66', 'M'], ['77', 'L']],
  men: [['90', 'S'], ['95', 'M'], ['100', 'L'], ['105', 'XL'], ['110', 'XXL']],
}

const SERVING_LOW = 150
const SERVING_HIGH = 180
const MAX_SERVINGS = 6
const OZ_PER_G = 1 / 28.3495
const LB_PER_G = 1 / 453.592

const M2_PER_PYEONG = 3.305785
const SQFT_PER_M2 = 10.7639
const ROOMS = [
  { pyeong: 6, label: 'One-room', feel: 'A small one-room: bed, desk and a compact bath.' },
  { pyeong: 10, label: 'Studio', feel: 'A roomy studio, with space for a sofa or table.' },
  { pyeong: 20, label: 'Apartment', feel: 'A family apartment, often with two or three bedrooms.' },
]

const round = (n: number, digits = 1) => n.toLocaleString('en-US', { maximumFractionDigits: digits })

function GenderToggle({ gender, onChange }: { gender: Gender; onChange: (g: Gender) => void }) {
  return (
    <div className="ku-toggle" role="group" aria-label="Sizing">
      {(['women', 'men'] as const).map(g => <button key={g} type="button" className="ku-chip" aria-pressed={gender === g} onClick={() => onChange(g)}>{g === 'women' ? 'Women' : 'Men'}</button>)}
    </div>
  )
}

function Stats({ items }: { items: [string, string][] }) {
  return (
    <dl className="ku-stats notranslate" translate="no">
      {items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  )
}

function Shoes() {
  const [gender, setGender] = useState<Gender>('women')
  const [mm, setMm] = useState(240)
  const size = SHOES[gender].find(s => s[0] === mm) ?? SHOES[gender][0]
  return (
    <>
      <GenderToggle gender={gender} onChange={setGender} />
      <div className="ku-chips notranslate" translate="no" role="group" aria-label="Korean shoe size in millimeters">
        {SHOES[gender].map(([value]) => <button key={value} type="button" className="ku-chip" aria-pressed={value === mm} onClick={() => setMm(value)}>{value}</button>)}
      </div>
      <Stats items={[['Korea', `${mm} mm`], ['US', String(size[1])], ['UK', String(size[2])], ['EU', String(size[3])]]} />
      <p className="ku-tip">Korean shoes are measured in exact foot length in millimeters. Sizes vary a little by brand, so try them on when you can.</p>
    </>
  )
}

function Clothes() {
  const [gender, setGender] = useState<Gender>('women')
  return (
    <>
      <GenderToggle gender={gender} onChange={setGender} />
      <table key={gender} className="ku-table notranslate" translate="no">
        <thead><tr><th scope="col">Korea</th><th scope="col">Global</th></tr></thead>
        <tbody>{CLOTHES[gender].map(([kr, global]) => <tr key={kr}><td>{kr}</td><td>{global}</td></tr>)}</tbody>
      </table>
      <p className="ku-tip">Online size charts list flat measurements in cm (단면), taken across one side of the garment. Double the chest or waist figure to compare it with your body. Many Korean brands also run slim, so size up if you are between sizes.</p>
    </>
  )
}

function Meat() {
  const [servings, setServings] = useState(3)
  const low = servings * SERVING_LOW
  const high = servings * SERVING_HIGH
  const scale = MAX_SERVINGS * SERVING_HIGH
  return (
    <>
      <div className="ku-chips is-six notranslate" translate="no" role="group" aria-label="Number of servings">
        {Array.from({ length: MAX_SERVINGS }, (_, i) => i + 1).map(n => <button key={n} type="button" className="ku-chip" aria-pressed={n === servings} onClick={() => setServings(n)}>{n}</button>)}
      </div>
      <p className="ku-label">Servings (인분). One serving is usually {SERVING_LOW}–{SERVING_HIGH} g.</p>
      <Stats items={[['Weight', `${low}–${high} g`], ['Ounces', `${round(low * OZ_PER_G)}–${round(high * OZ_PER_G)} oz`], ['Pounds', `${round(low * LB_PER_G, 2)}–${round(high * LB_PER_G, 2)} lb`]]} />
      <div className="ku-gauge" role="img" aria-label={`${low} to ${high} grams`}>
        <span className="ku-gauge-low" style={{ width: `${low / scale * 100}%` }} />
        <span className="ku-gauge-high" style={{ left: `${low / scale * 100}%`, width: `${(high - low) / scale * 100}%` }} />
      </div>
      <p className="ku-tip">For two people, 3 servings (about 450–540 g) is a common order. Many BBQ places ask for at least 2 servings, and the menu usually prints the grams.</p>
    </>
  )
}

function Room() {
  const [raw, setRaw] = useState('10')
  const pyeong = Number(raw) || 0
  const m2 = pyeong * M2_PER_PYEONG
  const preset = ROOMS.find(r => r.pyeong === pyeong)
  return (
    <>
      <label className="ku-label" htmlFor="ku-pyeong">Size in pyeong (평)</label>
      <input id="ku-pyeong" className="tl-input notranslate" translate="no" inputMode="decimal" autoComplete="off" value={raw}
        onChange={e => setRaw(e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 6))} />
      <Stats items={[['Square meters', `${round(m2)} m²`], ['Square feet', `${round(m2 * SQFT_PER_M2, 0)} sq ft`]]} />
      <div className="ku-chips is-three" role="group" aria-label="Common room sizes">
        {ROOMS.map(r => <button key={r.pyeong} type="button" className="ku-chip" aria-pressed={r.pyeong === pyeong} onClick={() => setRaw(String(r.pyeong))}><span className="notranslate" translate="no">{r.pyeong} 평</span> · {r.label}</button>)}
      </div>
      <p key={preset?.pyeong ?? 'custom'} className="ku-tip">{preset ? preset.feel : 'Korean listings often quote pyeong, and hotel pages usually quote square meters.'} <span className="notranslate" translate="no">1 Pyeong (평) = 3.3 m² = 35.6 sq ft.</span></p>
    </>
  )
}

export function KoreaUnitsModal() {
  const [tab, setTab] = useState<Tab>('shoes')
  return (
    <>
      <style>{`
        .tl-wrap.ku-wrap { max-width: 640px; }
        .ku-root { max-width: 640px; margin: 0 auto; }
        .ku-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border-bottom: 1px solid #F1F5F9; margin-bottom: 18px; }
        .ku-tab { min-height: 52px; padding: 6px 4px; border: 0; border-bottom: 2px solid transparent; margin-bottom: -1px; background: none; color: #94A3B8; cursor: pointer; font: 500 13px/1.25 "DM Sans", Inter, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; gap: 6px; transition: color .15s; }
        .ku-tab svg { flex: none; }
        @media (hover: hover) { .ku-tab:not([aria-selected="true"]):hover { color: #475569; } }
        @media (max-width: 479px) { .ku-tab { flex-direction: column; gap: 4px; } }
        .ku-tab[aria-selected="true"] { color: #0F766E; border-bottom-color: #0F766E; font-weight: 700; }
        .ku-toggle { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
        .ku-chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); gap: 6px; }
        .ku-chips.is-six { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        .ku-chips.is-three { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 16px; }
        .ku-chip { min-height: 44px; padding: 6px 4px; border: 1px solid #E2E8F0; border-radius: 10px; background: #fff; color: #334155; cursor: pointer; font: 600 13px/1.2 "DM Sans", Inter, system-ui, sans-serif; transition: background .15s, border-color .15s, color .15s; }
        .ku-chip[aria-pressed="true"] { background: #0F766E; border-color: #0F766E; color: #fff; }
        @media (hover: hover) { .ku-chip:not([aria-pressed="true"]):hover { border-color: #5EEAD4; background: #F0FDFA; } }
        .ku-tab:focus-visible, .ku-chip:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .ku-label { display: block; margin: 8px 0 8px; font-size: 13px; color: #64748B; }
        .ku-stats { display: flex; margin: 18px 0 0; padding: 14px 0; border-top: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9; }
        .ku-stats > div { flex: 1; min-width: 0; text-align: center; }
        .ku-stats > div + div { border-left: 1px solid #F1F5F9; }
        .ku-stats dt { font-size: 12px; color: #64748B; margin-bottom: 2px; }
        .ku-stats dd { margin: 0; padding: 0 4px; font-size: 22px; font-weight: 800; line-height: 1.2; color: #111827; }
        .ku-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .ku-table th { padding: 8px 0; font-size: 12px; font-weight: 600; color: #64748B; border-bottom: 1px solid #F1F5F9; }
        .ku-table td { padding: 11px 0; text-align: center; font-size: 18px; font-weight: 700; color: #111827; border-bottom: 1px solid #F1F5F9; }
        .ku-gauge { position: relative; height: 10px; margin-top: 14px; border-radius: 5px; background: #F1F5F9; overflow: hidden; }
        .ku-gauge span { position: absolute; top: 0; bottom: 0; }
        .ku-gauge-low { left: 0; background: #0D9488; }
        .ku-gauge-high { background: #99F6E4; }
        .ku-tip { margin: 14px 0 0; font-size: 13px; line-height: 1.55; color: #475569; }
        @media (max-width: 479px) { .ku-stats dd { font-size: 17px; } .ku-chips.is-three .ku-chip { font-size: 12px; } }
      `}</style>

      <div className="ku-root">
        <div className="ku-tabs" role="tablist" aria-label="Size and unit type">
          {TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" className="ku-tab" aria-selected={tab === id} onClick={() => setTab(id)}><Icon size={16} strokeWidth={1.75} aria-hidden="true" />{label}</button>)}
        </div>
        {/* key: 자동 번역이 글자 노드를 바꿔 끼우므로 탭이 바뀌면 새로 그린다 */}
        <div key={tab} role="tabpanel">
          {tab === 'shoes' && <Shoes />}
          {tab === 'clothes' && <Clothes />}
          {tab === 'meat' && <Meat />}
          {tab === 'room' && <Room />}
        </div>
      </div>
    </>
  )
}
