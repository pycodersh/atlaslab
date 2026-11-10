'use client'

import { useEffect, useMemo, useState } from 'react'

type GroupId = 'bbq' | 'soups' | 'noodles' | 'street'
type Counter = 'order' | 'serving' | 'whole' | 'plate' | 'roll' | 'skewer'
type Dish = {
  id: string
  group: GroupId
  label: string          // 카드에 보이는 영문 이름
  koLabel?: string       // 카드의 한글이 주문 문장과 다를 때만
  ko: string             // 주문 문장에 들어가는 이름
  roman: string
  en: string
  counter: Counter
}
type Phrase = { id: string; label: string; ko: string; roman: string; en: string }
type SpicePhrase = Phrase & { koLabel: string }
type Line = { ko: string; roman: string; en: string }
type Count = { ko: string; roman: string; en: string }

const MAX_QTY = 4

const FILTERS: { id: 'all' | GroupId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'bbq', label: 'BBQ' },
  { id: 'soups', label: 'Soups' },
  { id: 'noodles', label: 'Noodles/Rice' },
  { id: 'street', label: 'Street' },
]

const DISHES: Dish[] = [
  { id: 'samgyeopsal', group: 'bbq', label: 'Samgyeopsal', ko: '삼겹살', roman: 'Samgyeopsal', en: 'pork belly', counter: 'serving' },
  { id: 'moksal', group: 'bbq', label: 'Moksal', ko: '목살', roman: 'Moksal', en: 'pork neck', counter: 'serving' },
  { id: 'dwaeji-galbi', group: 'bbq', label: 'Dwaeji-galbi', ko: '돼지갈비', roman: 'Dwaeji-galbi', en: 'marinated pork ribs', counter: 'serving' },
  // 소고기는 한우 전문점이 아닌 곳에서도 틀리지 않는 말이라 문장에는 이쪽을 쓴다
  { id: 'hanwoo', group: 'bbq', label: 'Hanwoo / Beef', koLabel: '한우/소고기', ko: '소고기', roman: 'Sogogi', en: 'beef', counter: 'serving' },
  { id: 'bulgogi', group: 'bbq', label: 'Bulgogi', ko: '불고기', roman: 'Bulgogi', en: 'bulgogi', counter: 'serving' },
  { id: 'dak-galbi', group: 'bbq', label: 'Dak-galbi', ko: '닭갈비', roman: 'Dak-galbi', en: 'spicy stir-fried chicken', counter: 'serving' },
  { id: 'jeyuk', group: 'bbq', label: 'Jeyuk-bokkeum', ko: '제육볶음', roman: 'Jeyuk-bokkeum', en: 'spicy stir-fried pork', counter: 'order' },

  { id: 'kimchi', group: 'soups', label: 'Kimchi-jjigae', ko: '김치찌개', roman: 'Kimchi-jjigae', en: 'kimchi stew', counter: 'order' },
  { id: 'doenjang', group: 'soups', label: 'Doenjang-jjigae', ko: '된장찌개', roman: 'Doenjang-jjigae', en: 'soybean paste stew', counter: 'order' },
  { id: 'sundubu', group: 'soups', label: 'Sundubu-jjigae', ko: '순두부찌개', roman: 'Sundubu-jjigae', en: 'soft tofu stew', counter: 'order' },
  { id: 'gukbap', group: 'soups', label: 'Gukbap', ko: '국밥', roman: 'Gukbap', en: 'gukbap (rice soup)', counter: 'order' },
  { id: 'budae', group: 'soups', label: 'Budae-jjigae', ko: '부대찌개', roman: 'Budae-jjigae', en: 'army stew', counter: 'serving' },
  { id: 'gamjatang', group: 'soups', label: 'Gamjatang', ko: '감자탕', roman: 'Gamjatang', en: 'pork bone stew', counter: 'serving' },
  { id: 'samgyetang', group: 'soups', label: 'Samgyetang', ko: '삼계탕', roman: 'Samgyetang', en: 'ginseng chicken soup', counter: 'order' },
  { id: 'seolleongtang', group: 'soups', label: 'Seolleongtang', ko: '설렁탕', roman: 'Seolleongtang', en: 'ox bone soup', counter: 'order' },
  { id: 'dak-hanmari', group: 'soups', label: 'Dak-hanmari', ko: '닭한마리', roman: 'Dak-hanmari', en: 'whole chicken hot pot', counter: 'order' },

  { id: 'bibimbap', group: 'noodles', label: 'Bibimbap', ko: '비빔밥', roman: 'Bibimbap', en: 'bibimbap', counter: 'order' },
  { id: 'dolsot', group: 'noodles', label: 'Dolsot-bibimbap', ko: '돌솥비빔밥', roman: 'Dolsot-bibimbap', en: 'stone-pot bibimbap', counter: 'order' },
  { id: 'naengmyeon', group: 'noodles', label: 'Naengmyeon', ko: '냉면', roman: 'Naengmyeon', en: 'cold noodles', counter: 'order' },
  { id: 'kalguksu', group: 'noodles', label: 'Kalguksu', ko: '칼국수', roman: 'Kalguksu', en: 'knife-cut noodles', counter: 'order' },
  { id: 'jajangmyeon', group: 'noodles', label: 'Jajangmyeon', ko: '자장면', roman: 'Jajangmyeon', en: 'black bean noodles', counter: 'order' },
  { id: 'jjamppong', group: 'noodles', label: 'Jjamppong', ko: '짬뽕', roman: 'Jjamppong', en: 'spicy seafood noodles', counter: 'order' },
  { id: 'mandu', group: 'noodles', label: 'Mandu', ko: '만두', roman: 'Mandu', en: 'dumplings', counter: 'plate' },

  { id: 'tteokbokki', group: 'street', label: 'Tteokbokki', ko: '떡볶이', roman: 'Tteokbokki', en: 'tteokbokki', counter: 'serving' },
  { id: 'gimbap', group: 'street', label: 'Gimbap', ko: '김밥', roman: 'Gimbap', en: 'gimbap', counter: 'roll' },
  { id: 'pajeon', group: 'street', label: 'Haemul-pajeon', ko: '해물파전', roman: 'Haemul-pajeon', en: 'seafood scallion pancake', counter: 'order' },
  { id: 'chicken', group: 'street', label: 'Chimaek / Fried Chicken', koLabel: '치킨', ko: '치킨', roman: 'Chikin', en: 'whole fried chicken', counter: 'whole' },
  { id: 'eomuk', group: 'street', label: 'Eomuk / Fish Cake', koLabel: '어묵', ko: '어묵', roman: 'Eomuk', en: 'fish cake', counter: 'skewer' },
]

// 메뉴 카드의 이모지. 묶음 기본값을 쓰고, 묶음과 어긋나는 메뉴만 따로 적는다(Noodles/Rice 안의 비빔밥 · 만두 등)
const GROUP_EMOJI: Record<GroupId, string> = { bbq: '🥩', soups: '🍲', noodles: '🍜', street: '🥟' }
const DISH_EMOJI: Record<string, string> = { bibimbap: '🍚', dolsot: '🍚', mandu: '🥟', chicken: '🍗' }

const SPICE: SpicePhrase[] = [
  { id: 'none', label: 'Not spicy', koLabel: '안 맵게', ko: '안 맵게 해 주세요', roman: 'An maepge hae juseyo', en: 'Not spicy, please.' },
  { id: 'less', label: 'Less spicy', koLabel: '덜 맵게', ko: '덜 맵게 해 주세요', roman: 'Deol maepge hae juseyo', en: 'Less spicy, please.' },
  { id: 'extra', label: 'Spicy', koLabel: '기본 맵게', ko: '맵게 해 주세요', roman: 'Maepge hae juseyo', en: 'Make it spicy, please.' },
]

const REQUESTS: Phrase[] = [
  { id: 'cilantro', label: 'No cilantro', ko: '고수 빼 주세요', roman: 'Gosu ppae juseyo', en: 'No cilantro, please.' },
  { id: 'scallion', label: 'No green onion', ko: '파 빼 주세요', roman: 'Pa ppae juseyo', en: 'No green onion, please.' },
  { id: 'onion', label: 'No onion', ko: '양파 빼 주세요', roman: 'Yangpa ppae juseyo', en: 'No onion, please.' },
  { id: 'garlic', label: 'No garlic', ko: '마늘 빼 주세요', roman: 'Maneul ppae juseyo', en: 'No garlic, please.' },
  { id: 'egg', label: 'No egg', ko: '계란 빼 주세요', roman: 'Gyeran ppae juseyo', en: 'No egg, please.' },
  { id: 'pork', label: 'No pork', ko: '돼지고기 빼 주세요', roman: 'Dwaejigogi ppae juseyo', en: 'No pork, please.' },
  { id: 'salt', label: 'Less salty', ko: '덜 짜게 해 주세요', roman: 'Deol jjage hae juseyo', en: 'Less salty, please.' },
  // 알레르기는 안전 문제라 '못 먹어요'(선호로 들릴 수 있다) 대신 알레르기임과 '들어가면 안 된다'를 두 문장으로 못 박는다
  { id: 'peanut', label: 'Peanut allergy', ko: '땅콩 알레르기가 있어요. 땅콩이 조금이라도 들어가면 안 돼요', roman: 'Ttangkong allereugiga isseoyo. Ttangkongi jogeumirado deureogamyeon an dwaeyo', en: 'I have a peanut allergy. Not even a little peanut, please.' },
  { id: 'seafood', label: "Can't eat seafood", ko: '해산물 알레르기가 있어요. 해산물이 들어가면 안 돼요', roman: 'Haesanmul allereugiga isseoyo. Haesanmuri deureogamyeon an dwaeyo', en: 'I have a seafood allergy. No seafood in it, please.' },
  { id: 'meat', label: "Can't eat meat", ko: '고기는 못 먹어요', roman: 'Gogineun mot meogeoyo', en: "I can't eat meat." },
  { id: 'sauce', label: 'Sauce on the side', ko: '소스는 따로 주세요', roman: 'Soseuneun ttaro juseyo', en: 'Sauce on the side, please.' },
  { id: 'togo', label: 'To go', ko: '포장해 주세요', roman: 'Pojanghae juseyo', en: 'To go, please.' },
]

// 메뉴마다 세는 말이 다르다: 김밥은 줄, 치킨은 마리, 만두는 판, 고기는 N인분
const nth = (en: [string, string, string, string], ko: [string, string, string, string], roman: [string, string, string, string]): Count[] =>
  en.map((e, i) => ({ en: e, ko: ko[i], roman: roman[i] }))

const PIECES_KO: [string, string, string, string] = ['하나', '두 개', '세 개', '네 개']
const PIECES_ROMAN: [string, string, string, string] = ['hana', 'du gae', 'se gae', 'ne gae']
const ORDERS_EN: [string, string, string, string] = ['One order', 'Two orders', 'Three orders', 'Four orders']

const COUNTS: Record<Counter, Count[]> = {
  order: nth(ORDERS_EN, PIECES_KO, PIECES_ROMAN),
  skewer: nth(['One skewer', 'Two skewers', 'Three skewers', 'Four skewers'], PIECES_KO, PIECES_ROMAN),
  serving: nth(['One serving', 'Two servings', 'Three servings', 'Four servings'], ['1인분', '2인분', '3인분', '4인분'], ['il-inbun', 'i-inbun', 'sam-inbun', 'sa-inbun']),
  whole: nth(ORDERS_EN, ['한 마리', '두 마리', '세 마리', '네 마리'], ['han mari', 'du mari', 'se mari', 'ne mari']),
  plate: nth(['One plate', 'Two plates', 'Three plates', 'Four plates'], ['한 판', '두 판', '세 판', '네 판'], ['han pan', 'du pan', 'se pan', 'ne pan']),
  roll: nth(['One roll', 'Two rolls', 'Three rolls', 'Four rolls'], ['한 줄', '두 줄', '세 줄', '네 줄'], ['han jul', 'du jul', 'se jul', 'ne jul']),
}

function dishLine(dish: Dish, qty: number): Line {
  const n = COUNTS[dish.counter][qty - 1]
  return {
    ko: `${dish.ko} ${n.ko} 주세요`,
    roman: `${dish.roman} ${n.roman} juseyo`,
    en: `${n.en} of ${dish.en}, please.`,
  }
}

export function OrderBuilder() {
  const [filter, setFilter] = useState<'all' | GroupId>('all')
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

  const visibleDishes = filter === 'all' ? DISHES : DISHES.filter(d => d.group === filter)
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
        .ob-tabs { display: flex; gap: 18px; overflow-x: auto; scrollbar-width: none; border-bottom: 1px solid #E5E7EB; margin-bottom: 14px; }
        .ob-tabs::-webkit-scrollbar { display: none; }
        .ob-tab {
          flex: none; min-height: 44px; padding: 0; background: none; border: 0; border-bottom: 2px solid transparent; margin-bottom: -1px;
          font: 500 14px "DM Sans", Inter, system-ui, sans-serif; color: #6B7280; cursor: pointer;
        }
        .ob-tab[aria-pressed="true"] { color: #111827; font-weight: 700; border-bottom-color: #111827; }

        .ob-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .ob-dish {
          display: flex; align-items: center; gap: 8px; min-height: 64px; padding: 10px; text-align: left;
          border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; cursor: pointer; transition: border-color .15s, background .15s, box-shadow .15s;
          font-family: "DM Sans", Inter, system-ui, sans-serif;
        }
        .ob-dish[aria-pressed="true"] { border-color: #F43F5E; background: #FFF1F2; box-shadow: 0 0 0 2px #FECDD3; }
        .ob-dish-emoji { flex: none; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; font-size: 18px; line-height: 1; }
        .ob-dish-emoji.is-bbq { background: #FFE4E6; }
        .ob-dish-emoji.is-soups { background: #FFEDD5; }
        .ob-dish-emoji.is-noodles { background: #FEF3C7; }
        .ob-dish-emoji.is-street { background: #ECFCCB; }
        .ob-dish-text { display: flex; flex-direction: column; min-width: 0; overflow-wrap: anywhere; }
        /* 폰 2열은 칸이 좁아 Seolleongtang 같은 긴 이름이 글자 중간에서 끊기지 않게 줄인다 */
        @media (max-width: 639px) {
          .ob-dish { gap: 6px; padding: 8px; }
          .ob-dish-emoji { width: 26px; height: 26px; border-radius: 8px; font-size: 15px; }
          .ob-dish .ob-dish-en { font-size: 13px; }
        }
        .ob-dish-en { font-size: 14px; font-weight: 600; line-height: 1.3; color: #111827; }
        .ob-dish[aria-pressed="true"] .ob-dish-en { color: #4C0519; }
        .ob-dish-ko { font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: 12px; color: #6B7280; margin-top: 2px; }

        .ob-picked { margin-top: 16px; }
        .ob-stepper { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid #F3F4F6; }
        .ob-picked-name { font-size: 14px; font-weight: 600; min-width: 0; }
        .ob-unit { display: block; font-size: 12px; font-weight: 400; color: #6B7280; }
        .ob-qty { display: flex; align-items: center; gap: 4px; flex: none; }
        .ob-qty button { width: 44px; height: 44px; border-radius: 10px; border: 1px solid #E5E7EB; background: #fff; font-size: 20px; color: #111827; cursor: pointer; }
        .ob-qty button:disabled { color: #D1D5DB; cursor: default; }
        .ob-qty span { width: 28px; text-align: center; font-weight: 700; }

        /* 맵기는 단계마다 색이 있고, 윗선 길이가 1/3 → 2/3 → 꽉 참으로 늘어난다. 고른 단계는 같은 색으로 꽉 채운다 */
        .ob-segment { display: flex; gap: 8px; }
        .ob-seg {
          position: relative; overflow: hidden; flex: 1 1 0; min-width: 0; min-height: 60px; padding: 12px 4px 8px; text-align: center; background: var(--seg-soft); border: 1px solid var(--seg-line); border-radius: 12px; cursor: pointer;
          font: 600 14px "DM Sans", Inter, system-ui, sans-serif; color: var(--seg-ink); transition: background .15s, color .15s, border-color .15s;
        }
        .ob-seg::before { content: ""; position: absolute; top: 0; left: 0; height: 4px; width: var(--seg-bar); background: var(--seg-solid); }
        .ob-seg-none { --seg-soft: #ECFDF5; --seg-line: #A7F3D0; --seg-ink: #065F46; --seg-solid: #047857; --seg-bar: 33.4%; }
        .ob-seg-less { --seg-soft: #FFFBEB; --seg-line: #FCD34D; --seg-ink: #92400E; --seg-solid: #B45309; --seg-bar: 66.7%; }
        .ob-seg-extra { --seg-soft: #FFF1F2; --seg-line: #FDA4AF; --seg-ink: #9F1239; --seg-solid: #BE123C; --seg-bar: 100%; }
        .ob-seg-ko { display: block; font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: 12px; font-weight: 500; margin-top: 1px; }
        .ob-seg[aria-pressed="true"] { background: var(--seg-solid); border-color: var(--seg-solid); color: #fff; font-weight: 700; }
        .ob-seg[aria-pressed="true"]::before { background: rgba(255,255,255,.55); }

        .ob-requests { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .ob-request {
          display: flex; align-items: center; justify-content: space-between; gap: 6px; min-height: 44px; padding: 10px 14px; text-align: left;
          border: 1px solid #E5E7EB; border-radius: 12px; background: #fff; cursor: pointer; transition: border-color .15s, background .15s;
          font: 500 12px/1.3 "DM Sans", Inter, system-ui, sans-serif; color: #374151;
        }
        .ob-request[aria-pressed="true"] { border-color: #111827; background: #F9FAFB; color: #111827; }
        .ob-check { flex: none; font-size: 13px; font-weight: 700; color: #111827; visibility: hidden; }
        .ob-request[aria-pressed="true"] .ob-check { visibility: visible; }

        @media (hover: hover) {
          .ob-tab:hover { color: #1F2937; }
          .ob-seg:not([aria-pressed="true"]):hover { border-color: var(--seg-solid); }
          .ob-dish:hover, .ob-request:hover { border-color: #9CA3AF; }
          .ob-dish[aria-pressed="true"]:hover { border-color: #F43F5E; }
          .ob-request[aria-pressed="true"]:hover { border-color: #111827; }
          .ob-primary:not(:disabled):hover { background: #1F2937; border-color: #1F2937; }
        }
        .ob-tab:focus-visible, .ob-dish:focus-visible, .ob-seg:focus-visible, .ob-request:focus-visible, .ob-primary:focus-visible, .ob-secondary:focus-visible, .ob-qty button:focus-visible {
          outline: 2px solid #C8102E; outline-offset: 2px;
        }

        .ob-receipt { border: 1px solid #E5E7EB; background: rgba(249,250,251,.7); border-radius: 16px; padding: 24px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
        .ob-line { padding: 14px 0; border-top: 1px dashed #D1D5DB; }
        .ob-line:first-of-type { border-top: 0; padding-top: 0; }
        .ob-ko { font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: 20px; font-weight: 700; line-height: 1.625; color: #111827; margin: 0; word-break: keep-all; }
        .ob-roman { font-size: 13px; color: #4B5563; margin: 2px 0 0; }
        .ob-en { font-size: 13px; color: #6B7280; margin: 2px 0 0; }
        .ob-empty { font-size: 14px; color: #6B7280; margin: 0; }
        .ob-receipt .tl-actions { margin-top: 18px; }
        .ob-receipt .tl-note { margin-top: 14px; }
        .ob-primary, .ob-secondary { border-radius: 12px; padding: 12px 20px; min-height: 48px; font: 700 15px "DM Sans", Inter, system-ui, sans-serif; cursor: pointer; transition: background .15s; }
        .ob-primary { background: #000; border: 1px solid #000; color: #fff; }
        .ob-secondary { background: #fff; border: 1px solid #D1D5DB; color: #374151; }
        .ob-primary:disabled, .ob-secondary:disabled { background: #F3F4F6; border-color: #E5E7EB; color: #9CA3AF; cursor: default; }

        .ob-show { position: fixed; inset: 0; z-index: 1000; background: #fff; display: flex; flex-direction: column; padding: 20px; }
        .ob-show-lines { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; margin: 8px 0 16px; padding: 12px 0; }
        .ob-show-lines > :first-child { margin-top: auto; }
        .ob-show-lines > :last-child { margin-bottom: auto; }
        .ob-show-ko { font-family: Pretendard, "DM Sans", system-ui, sans-serif; font-size: clamp(30px, 8vw, 56px); line-height: 1.25; font-weight: 800; color: #111827; margin: 0; word-break: keep-all; text-align: center; }

        @media (min-width: 640px) {
          .ob-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .ob-requests { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .ob-request { font-size: 14px; }
          .ob-ko { font-size: 24px; }
        }
        @media (min-width: 768px) { .ob-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
      `}</style>

      <section className="tl-card">
        <h2 className="tl-h2">1. Choose your dishes</h2>
        <div className="ob-tabs" role="group" aria-label="Filter dishes by restaurant type">
          {FILTERS.map(f => (
            <button key={f.id} type="button" className="ob-tab" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        <div className="ob-grid">
          {visibleDishes.map(d => (
            <button key={d.id} type="button" className="ob-dish" aria-pressed={!!qty[d.id]} onClick={() => toggleDish(d.id)}>
              <span className={`ob-dish-emoji is-${d.group}`} aria-hidden="true">{DISH_EMOJI[d.id] ?? GROUP_EMOJI[d.group]}</span>
              <span className="ob-dish-text">
                <span className="ob-dish-en notranslate" translate="no">{d.label}</span>
                <span className="ob-dish-ko notranslate" translate="no" lang="ko">{d.koLabel ?? d.ko}</span>
              </span>
            </button>
          ))}
        </div>
        {orderedDishes.length > 0 && (
          <div className="ob-picked">
            {orderedDishes.map(d => (
              <div key={d.id} className="ob-stepper">
                <span className="ob-picked-name">
                  <span className="notranslate" translate="no">{d.label}</span>
                  {/* key: 자동 번역이 글자 노드를 바꿔 끼워도 수량이 바뀌면 새로 그려지게 */}
                  <span key={qty[d.id]} className="ob-unit">{COUNTS[d.counter][qty[d.id] - 1].en}</span>
                </span>
                <div className="ob-qty">
                  <button type="button" aria-label={`One less ${d.label}`} onClick={() => changeQty(d.id, -1)}>−</button>
                  <span className="notranslate" translate="no">{qty[d.id]}</span>
                  <button type="button" aria-label={`One more ${d.label}`} disabled={qty[d.id] >= MAX_QTY} onClick={() => changeQty(d.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="tl-card">
        <h2 className="tl-h2">2. Spice level</h2>
        <div className="ob-segment" role="group" aria-label="Spice level">
          {SPICE.map(s => (
            <button key={s.id} type="button" className={`ob-seg ob-seg-${s.id}`} aria-pressed={spice === s.id} onClick={() => setSpice(v => v === s.id ? null : s.id)}>
              {s.id === 'extra' && <span aria-hidden="true">🌶️ </span>}{s.label}
              <span className="ob-seg-ko notranslate" translate="no" lang="ko">{s.koLabel}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="tl-card">
        <h2 className="tl-h2">3. Requests</h2>
        <div className="ob-requests">
          {REQUESTS.map(r => (
            <button key={r.id} type="button" className="ob-request" aria-pressed={requests.includes(r.id)} onClick={() => toggleRequest(r.id)}>
              <span>{r.label}</span>
              <span className="ob-check" aria-hidden="true">✓</span>
            </button>
          ))}
        </div>
      </section>

      <section className="ob-receipt" aria-live="polite">
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
          <button type="button" className="ob-primary" disabled={lines.length === 0} onClick={() => setShowing(true)}>Show to staff</button>
          <button key={copied ? 'copied' : 'copy'} type="button" className="ob-secondary" disabled={lines.length === 0} onClick={copy}>{copied ? 'Copied' : 'Copy Korean'}</button>
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
          <button type="button" className="ob-secondary" autoFocus onClick={() => setShowing(false)}>Close</button>
        </div>
      )}
    </>
  )
}
