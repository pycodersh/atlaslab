/** 도구 목록 단일 출처 — 홈 배너의 개수, /tools 허브, 도구 페이지의 More tools 가 함께 쓴다 */
export type ToolGroup = 'Survival' | 'Planning'
export type ToolId = 'order-builder' | 'subway-timer' | 'krw-converter' | 'transit-guide' | 'weather' | 'kpop-calendar' | 'world-time' | 'hotspot-finder' | 'holiday-calendar' | 'size-units'
export type Tool = { id: ToolId; title: string; desc: string; group: ToolGroup }

export const TOOLS: Tool[] = [
  { id: 'order-builder', title: 'K-Food Order Builder', desc: 'Build polite ordering phrases for 28 dishes and show staff.', group: 'Survival' },
  { id: 'subway-timer', title: '15-Min Subway Timer', desc: 'Tapped the wrong gate? Track Seoul Metro free re-entry rules.', group: 'Survival' },
  // 환율은 하루 한 번 갱신된다 — 'Real-time' 이라 쓰지 않는다
  { id: 'krw-converter', title: 'KRW Price Sense', desc: 'Daily-rate Won converter with street food & meal price benchmarks.', group: 'Survival' },
  { id: 'transit-guide', title: 'Intercity Transit Guide', desc: 'Compare KTX, flights, and buses with arrival hub connection tips.', group: 'Planning' },
  { id: 'weather', title: 'Korea Weather', desc: '7-day forecasts for ten cities, with rain chances and what to wear.', group: 'Planning' },
  { id: 'kpop-calendar', title: 'K-Pop Event Calendar', desc: 'Upcoming concerts, global ticketing links, and arena venue guides.', group: 'Planning' },
  { id: 'world-time', title: 'Seoul & World Time', desc: 'Compare Seoul time with hometowns via interactive day/night cards.', group: 'Planning' },
  { id: 'hotspot-finder', title: 'Regional Hotspot Finder', desc: 'Curated walking clusters across Seoul and 10 regional cities with visual previews and instant transit tips.', group: 'Planning' },
  { id: 'holiday-calendar', title: 'Korea Holiday & Peak Calendar', desc: 'Public holidays, Seollal/Chuseok shutdowns, and KTX peak booking warnings.', group: 'Planning' },
  { id: 'size-units', title: 'Korea Size & Travel Units', desc: 'Shoe sizes (mm), clothing fits, K-BBQ gram portions, and Pyeong room sizes.', group: 'Survival' },
]

/** /tools 허브의 노출 순서 — 여행 중 실제로 자주 여는 순서 */
export const HUB_ORDER: ToolId[] = ['hotspot-finder', 'transit-guide', 'kpop-calendar', 'krw-converter', 'order-builder', 'weather', 'holiday-calendar', 'size-units', 'subway-timer', 'world-time']

/**
 * 도구별 공개 주소(검색용 슬러그). 폴더 이름(app/tools/슬러그)과 같아야 한다.
 * 2026-11-10 에 바꾼 옛 주소는 next.config.ts 에서 301 로 넘긴다.
 */
export const TOOL_SLUG: Record<ToolId, string> = {
  'hotspot-finder': 'regional-hotspots',
  'transit-guide': 'intercity-transit',
  'kpop-calendar': 'kpop-calendar',
  'krw-converter': 'krw-price-sense',
  'order-builder': 'k-food-order-builder',
  weather: 'korea-weather',
  'holiday-calendar': 'korea-holidays',
  'size-units': 'korea-size-converter',
  'subway-timer': 'subway-timer',
  'world-time': 'seoul-world-time',
}

export const toolHref = (id: ToolId) => `/tools/${TOOL_SLUG[id]}`
