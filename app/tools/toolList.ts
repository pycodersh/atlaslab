/** 도구 목록 단일 출처 — 홈 배너의 개수, /tools 허브, 도구 페이지의 More tools 가 함께 쓴다 */
export type ToolGroup = 'Survival' | 'Planning'
export type ToolId = 'order-builder' | 'subway-timer' | 'krw-converter' | 'transit-guide' | 'weather' | 'kpop-calendar' | 'world-time' | 'hotspot-finder' | 'holiday-calendar'
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
  { id: 'hotspot-finder', title: 'Regional Hotspot Finder', desc: 'Curated walking clusters across Seoul and 10 regional cities with zero photo bloat.', group: 'Planning' },
  { id: 'holiday-calendar', title: 'Korea Holiday & Peak Calendar', desc: 'Public holidays, Seollal/Chuseok shutdowns, and KTX peak booking warnings.', group: 'Planning' },
]

/** /tools 허브의 노출 순서 — 여행 중 실제로 자주 여는 순서 */
export const HUB_ORDER: ToolId[] = ['hotspot-finder', 'transit-guide', 'kpop-calendar', 'krw-converter', 'order-builder', 'weather', 'holiday-calendar', 'subway-timer', 'world-time']

export const toolHref = (id: ToolId) => `/tools/${id}`
