'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronRight } from 'lucide-react'
import { getMissionItems } from '@/lib/srs/engine'

const POPUP_KEY = 'patto-mission-popup-shown'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const label: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
  color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 7px',
}

export function TodayMissionPopup() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<ReturnType<typeof getMissionItems>>([])

  useEffect(() => {
    const shown = localStorage.getItem(POPUP_KEY)
    if (shown === todayStr()) return

    const missionItems = getMissionItems()
    const allDone = missionItems.length > 0 && missionItems.every(i => i.done)
    if (missionItems.length === 0 || allDone) return

    setItems(missionItems)
    setOpen(true)
    localStorage.setItem(POPUP_KEY, todayStr())
  }, [])

  function handleStart() {
    const first = items.find(i => !i.done)
    if (first) router.push(first.href)
    setOpen(false)
  }

  const newItems    = items.filter(i => i.type === 'new_story' || i.type === 'in_progress_story')
  const reviewItems = items.filter(i => i.type === 'review_pattern').slice(0, 3)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(0,0,0,0.38)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Glass modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 71,
        transform: open ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -48%) scale(0.96)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.22s ease',
        width: 'min(92vw, 360px)',
        background: 'var(--pglass)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid var(--pglass-border)',
        borderRadius: 24,
        boxShadow: '0 4px 32px rgba(40,50,80,0.10), inset 0 1px 0 rgba(255,255,255,0.95)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', margin: 0, textTransform: 'uppercase' }}>
            Today&apos;s Mission
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--pglass)',
              border: '1px solid var(--pglass-border)',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: 13, height: 13, color: 'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>

        <div style={{ padding: '18px 20px 20px' }}>

          {/* LEARN TODAY */}
          {newItems.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={label}>Learn Today</p>
              {newItems.map(item => (
                <div key={item.storyId} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: 'var(--pt)',
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    flexShrink: 0, lineHeight: 1.4, whiteSpace: 'nowrap',
                  }}>
                    Story {String(item.storyId).padStart(2, '0')} ·
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: 'var(--pt)',
                    letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1.4,
                  }}>
                    {item.storyTitle}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* REVIEW */}
          <div style={{ marginBottom: 20 }}>
            <p style={label}>Review</p>
            {reviewItems.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--pm2)', margin: 0 }}>No reviews today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {reviewItems.map(item => (
                  <p key={item.storyId} style={{ fontSize: 13, color: 'var(--pm)', margin: 0, lineHeight: 1.4 }}>
                    Story {String(item.storyId).padStart(2, '0')} · {item.storyTitle}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Glass button */}
          <button
            type="button"
            onClick={handleStart}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              width: '100%', padding: '13px 0',
              background: 'var(--pglass)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              border: '1px solid var(--pglass-border)',
              boxShadow: '0 2px 12px rgba(40,50,80,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
              borderRadius: 12, cursor: 'pointer',
              fontSize: 13, fontWeight: 700,
              color: 'var(--pt)', letterSpacing: '0.03em',
              transition: 'opacity 0.15s',
            }}
          >
            Continue
            <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  )
}
