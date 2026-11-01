import Link from 'next/link'
import { Clock, UtensilsCrossed } from 'lucide-react'
import { META_ICON, PLACEHOLDER_ICON } from '@/components/kpantry/ui/icon'

interface Props {
  slug: string
  nameEn: string
  cookingTimeMin?: number | null
  heroImageUrl?: string | null
  /** 홈처럼 다른 섹션과 면적을 나눠 쓰는 곳 — 사진을 낮게(2:1), 글자·여백을 줄인다 */
  compact?: boolean
}

/** 2열 그리드용 레시피 카드 — 카드 전체가 상세로 가는 링크. 홈 Popular · /recipes Popular 가 같이 쓴다 */
export default function DishGridCard({ slug, nameEn, cookingTimeMin, heroImageUrl, compact = false }: Props) {
  return (
    <Link
      href={`/kpantry/en/recipes/${slug}`}
      style={{
        display: 'block',
        minWidth: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--kp-rule)',
        textDecoration: 'none',
      }}
    >
      <div style={{
        aspectRatio: compact ? '2 / 1' : '4 / 3',
        backgroundColor: 'var(--kp-surface-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {heroImageUrl ? (
          <img src={heroImageUrl} alt="" loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <UtensilsCrossed size={36} {...PLACEHOLDER_ICON} />
        )}
      </div>
      <div style={{ padding: compact ? '8px 10px 10px' : '10px 12px 12px' }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: compact ? 13 : 14,
          fontWeight: 600,
          color: '#1A1A1A',
          margin: compact ? '0 0 2px' : '0 0 4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {nameEn}
        </p>
        {cookingTimeMin != null && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B', margin: 0 }}>
            <Clock {...META_ICON} />{cookingTimeMin} min
          </p>
        )}
      </div>
    </Link>
  )
}
