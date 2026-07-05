'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { getMissionItems, type MissionItem, type MissionItemType } from '@/lib/srs/engine'

const TYPE_LABEL: Record<MissionItemType, string> = {
  new_story:          'New Story',
  in_progress_story:  'Story',
  review_pattern:     'Review',
}

type Props = { currentStoryId: number }

export function TodayMissionBar({ currentStoryId }: Props) {
  const router = useRouter()
  const [items,    setItems]    = useState<MissionItem[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => { setItems(getMissionItems()) }, [currentStoryId])

  if (items.length === 0) return null

  const doneCount   = items.filter(i => i.done).length
  const firstPending = items.find(i => !i.done)

  return (
    <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--pd)' }}>

      {/* ── 헤더 행 (접힌 상태 요약) ─────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', width: '100%',
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', gap: 5, textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
          color: 'var(--pm2)', textTransform: 'uppercase',
        }}>
          Today&apos;s Mission
        </span>
        <span style={{ fontSize: 9, color: 'var(--pd)', marginLeft: 2 }}>·</span>
        <span style={{
          fontSize: 9, fontWeight: 700, color: 'var(--pm)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {doneCount} / {items.length}
        </span>

        {/* 접힌 상태일 때 첫 번째 미완료 항목 미리보기 */}
        {!expanded && firstPending && (
          <>
            <span style={{ fontSize: 9, color: 'var(--pd)', marginLeft: 2 }}>·</span>
            <span style={{
              fontSize: 9, fontWeight: 600, color: 'var(--pt2)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            }}>
              {TYPE_LABEL[firstPending.type]} {firstPending.storyId}
            </span>
          </>
        )}

        <span style={{ marginLeft: 'auto', color: 'var(--pm2)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {expanded
            ? <ChevronUp  style={{ width: 11, height: 11 }} strokeWidth={2} />
            : <ChevronDown style={{ width: 11, height: 11 }} strokeWidth={2} />}
        </span>
      </button>

      {/* ── 펼친 상태 — 미션 항목 목록 ───────────────────────────── */}
      {expanded && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {items.map((item, i) => {
            const isCurrent = item.storyId === currentStoryId && !item.done
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (!item.done) router.push(item.href)
                  setExpanded(false)
                }}
                disabled={item.done}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'none', border: 'none', padding: '1px 0',
                  cursor: item.done ? 'default' : 'pointer', textAlign: 'left', width: '100%',
                }}
              >
                {/* 상태 아이콘 */}
                {item.done ? (
                  <Check style={{ width: 10, height: 10, color: '#6E6E73', flexShrink: 0 }} strokeWidth={2.5} />
                ) : isCurrent ? (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--pt2)', flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', border: '1px solid var(--pm2)', flexShrink: 0 }} />
                )}

                {/* 항목 라벨 */}
                <span style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : item.done ? 400 : 500,
                  color: item.done ? 'var(--pm2)' : isCurrent ? 'var(--pt)' : 'var(--pt2)',
                  textDecoration: item.done ? 'line-through' : 'none',
                  letterSpacing: '0.01em',
                }}>
                  {TYPE_LABEL[item.type]} {item.storyId}
                </span>

                {/* 현재 진행 중 표시 */}
                {isCurrent && (
                  <span style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: '0.14em',
                    color: 'var(--pm)', textTransform: 'uppercase', marginLeft: 2,
                  }}>
                    Now
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
