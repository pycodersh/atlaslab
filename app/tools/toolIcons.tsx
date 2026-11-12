/** 도구별 작은 아이콘 — 홈 도구 그리드와 도구 페이지 하단 More tools 타일이 함께 쓴다. KRW 는 ₩ 글자로 그린다 */
import { CalendarDays, CloudSun, Globe, MapPin, Music, Ruler, Timer, TrainFront, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import type { ToolId } from './toolList'

const ICONS: Record<ToolId, LucideIcon | 'won'> = {
  'hotspot-finder': MapPin,
  'transit-guide': TrainFront,
  'kpop-calendar': Music,
  'krw-converter': 'won',
  'order-builder': UtensilsCrossed,
  weather: CloudSun,
  'holiday-calendar': CalendarDays,
  'size-units': Ruler,
  'subway-timer': Timer,
  'world-time': Globe,
}

export function ToolIcon({ id, size = 16, className }: { id: ToolId; size?: number; className?: string }) {
  const Icon = ICONS[id]
  if (Icon === 'won') {
    return (
      <span className={className} aria-hidden="true"
        style={{ display: 'inline-flex', width: size, justifyContent: 'center', fontSize: size - 2, fontWeight: 700, lineHeight: 1 }}>₩</span>
    )
  }
  return <Icon size={size} aria-hidden="true" className={className} />
}
