'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronRight, Clock, BookOpen, RotateCcw } from 'lucide-react'
import { getMissionItems, getTodayMission } from '@/lib/srs/engine'

const POPUP_KEY = 'patto-mission-popup-shown'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function TodayMissionPopup() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<ReturnType<typeof getMissionItems>>([])
  const [estimatedMinutes, setEstimatedMinutes] = useState(0)

  useEffect(() => {
    const shown = localStorage.getItem(POPUP_KEY)
    if (shown === todayStr()) return

    const missionItems = getMissionItems()
    const allDone = missionItems.length > 0 && missionItems.every(i => i.done)
    if (missionItems.length === 0 || allDone) return

    const mission = getTodayMission()
    setItems(missionItems)
    setEstimatedMinutes(mission.estimatedMinutes)
    setOpen(true)
    localStorage.setItem(POPUP_KEY, todayStr())
  }, [])

  function handleStart() {
    const first = items.find(i => !i.done)
    if (first) router.push(first.href)
    setOpen(false)
  }

  const newItems    = items.filter(i => i.type === 'new_story' || i.type === 'in_progress_story')
  const reviewItems = items.filter(i => i.type === 'review_pattern')

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 71,
        background: 'var(--pb)', borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.14)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '80dvh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ width: 36, height: 4, background: 'var(--pd)', borderRadius: 2, margin: '0 auto' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
          <div>
            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
              color: 'var(--pa)', margin: '0 0 4px', textTransform: 'uppercase',
            }}>
              Today&apos;s Mission
            </p>
            <p className="font-playfair" style={{
              fontSize: 'clamp(1.4rem, 5.5vw, 1.7rem)', fontWeight: 900,
              color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em',
            }}>
              Let&apos;s learn today
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--pc)', border: 'none', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X style={{ width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* New Learning */}
          {newItems.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 10px',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <BookOpen style={{ width: 10, height: 10 }} strokeWidth={2} />
                New Learning
              </p>
              {newItems.map(item => (
                <div key={item.storyId} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 0', borderBottom: '1px solid var(--pd)',
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                    color: 'var(--pm2)', width: 22, flexShrink: 0,
                  }}>
                    {String(item.storyId).padStart(2, '0')}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)' }}>
                    {item.storyTitle}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                    color: item.type === 'in_progress_story' ? 'var(--pa)' : 'var(--pm2)',
                    textTransform: 'uppercase',
                  }}>
                    {item.type === 'in_progress_story' ? 'Continue' : 'New'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Review */}
          {reviewItems.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 10px',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <RotateCcw style={{ width: 10, height: 10 }} strokeWidth={2} />
                Review · {reviewItems.length} stories
              </p>
              {reviewItems.map(item => (
                <div key={item.storyId} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 0', borderBottom: '1px solid var(--pd)',
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                    color: 'var(--pm2)', width: 22, flexShrink: 0,
                  }}>
                    {String(item.storyId).padStart(2, '0')}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--pt2)' }}>
                    {item.storyTitle}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: item.done ? '#27AE60' : 'var(--pm2)',
                    letterSpacing: '0.1em',
                  }}>
                    {item.done ? '✓' : '○'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Estimated time */}
          {estimatedMinutes > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: 20, padding: '10px 14px',
              background: 'var(--pc)', borderRadius: 10,
            }}>
              <Clock style={{ width: 13, height: 13, color: 'var(--pm2)', flexShrink: 0 }} strokeWidth={1.8} />
              <span style={{ fontSize: 12, color: 'var(--pm2)' }}>
                Estimated time&nbsp;
                <strong style={{ color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
                  ~{estimatedMinutes} min
                </strong>
              </span>
            </div>
          )}

          {/* Start button */}
          <button
            type="button"
            onClick={handleStart}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '15px 0',
              background: 'var(--pa)', borderRadius: 12, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              color: '#fff', letterSpacing: '0.02em',
            }}
          >
            Start Learning
            <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  )
}
