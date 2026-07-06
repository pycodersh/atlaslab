'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronRight, Clock, BookOpen, RotateCcw } from 'lucide-react'
import { getMissionItems, getTodayMission } from '@/lib/srs/engine'

const POPUP_KEY = 'patto-mission-popup-shown'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, letterSpacing: '0.12em',
  color: 'var(--pt)', textTransform: 'uppercase', margin: '0 0 10px',
  display: 'flex', alignItems: 'center', gap: 6,
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
          background: 'rgba(0,0,0,0.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Center modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 71,
        transform: open
          ? 'translate(-50%, -50%) scale(1)'
          : 'translate(-50%, -48%) scale(0.96)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.22s ease',
        width: 'min(92vw, 380px)',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border: '1px solid rgba(255,255,255,0.90)',
        borderRadius: 24,
        boxShadow: '0 8px 40px rgba(30,40,70,0.14), inset 0 1px 0 rgba(255,255,255,0.95)',
        maxHeight: '85dvh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '22px 22px 0' }}>
          <div>
            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
              color: 'var(--pm2)', margin: 0, textTransform: 'uppercase',
            }}>
              Today&apos;s Mission
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'var(--pc)', border: 'none', cursor: 'pointer', marginTop: 2,
            }}
          >
            <X style={{ width: 14, height: 14, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>

        <div style={{ padding: '18px 22px 22px' }}>
          {/* New Learning */}
          {newItems.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={sectionLabel}>
                <BookOpen style={{ width: 11, height: 11 }} strokeWidth={2.5} />
                New Learning
              </p>
              {newItems.map(item => (
                <div key={item.storyId} style={{ padding: '9px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm2)', textTransform: 'uppercase' }}>
                      Story {String(item.storyId).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--pm2)', textTransform: 'uppercase' }}>
                      {item.type === 'in_progress_story' ? 'Continue' : 'New'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#8D234C', margin: 0, lineHeight: 1.35 }}>
                    {item.storyTitle}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Review */}
          {reviewItems.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={sectionLabel}>
                <RotateCcw style={{ width: 11, height: 11 }} strokeWidth={2.5} />
                Review — {reviewItems.length} {reviewItems.length === 1 ? 'Story' : 'Stories'}
              </p>
              {reviewItems.map(item => (
                <div key={item.storyId} style={{ padding: '9px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pm2)', textTransform: 'uppercase' }}>
                      Story {String(item.storyId).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: item.done ? '#27AE60' : 'var(--pm2)' }}>
                      {item.done ? '✓' : '○'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#8D234C', margin: 0, lineHeight: 1.35 }}>
                    {item.storyTitle}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Estimated time */}
          {estimatedMinutes > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: 18, padding: '10px 13px',
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
              width: '100%', padding: '14px 0',
              background: 'rgba(255,255,255,0.68)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.82)',
              boxShadow: '0 2px 14px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
              borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700,
              color: '#5F6368', letterSpacing: '0.02em',
              transition: 'all 0.15s',
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
