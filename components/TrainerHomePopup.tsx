'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell } from 'lucide-react'
import { magazineStories } from '@/data/magazine-stories'
import { getTodayRecommendedStoryId, getStoryRound } from '@/lib/srs/story-round'
import { useTheme } from '@/components/ThemeProvider'

const DISMISSED_KEY = 'patto-trainer-dismissed'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function wasDismissedToday(): boolean {
  try { return localStorage.getItem(DISMISSED_KEY) === todayIso() } catch { return false }
}

function dismissToday() {
  try { localStorage.setItem(DISMISSED_KEY, todayIso()) } catch {}
}

function hasStudiedToday(): boolean {
  const t = todayIso()
  return magazineStories.some(s => getStoryRound(s.id).lastCompletedAt === t)
}

export function TrainerHomePopup() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [show,    setShow]    = useState(false)
  const [storyId, setStoryId] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (wasDismissedToday())  return
    if (hasStudiedToday())    return
    const id = getTodayRecommendedStoryId(magazineStories.map(s => s.id))
    if (id === null) return
    setStoryId(id)
    const t = setTimeout(() => setShow(true), 450)
    return () => clearTimeout(t)
  }, [])

  function handleDismiss() {
    dismissToday()
    setShow(false)
  }

  function handleStart() {
    dismissToday()
    setShow(false)
    if (storyId) router.push(`/patto/stories/${storyId}`)
  }

  const story = storyId ? magazineStories.find(s => s.id === storyId) : null
  if (!show || !story) return null

  const sheetBg   = isDark ? 'rgba(22,18,46,0.96)' : 'rgba(255,255,255,0.92)'
  const textPri   = isDark ? 'rgba(255,255,255,0.95)' : '#1a1a2e'
  const textSec   = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(60,60,100,0.62)'
  const cardBg    = isDark ? 'rgba(107,143,255,0.12)' : 'rgba(107,143,255,0.08)'
  const cardBd    = isDark ? 'rgba(107,143,255,0.25)' : 'rgba(107,143,255,0.18)'
  const laterCol  = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(80,80,120,0.40)'

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(20,16,50,0.45)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: sheetBg,
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderRadius: '24px 24px 0 0',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.88)'}`,
        boxShadow: '0 -8px 40px rgba(20,16,50,0.20)',
        padding: `28px 24px calc(40px + env(safe-area-inset-bottom, 0px))`,
      }}>
        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 99,
          background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(142,167,255,0.22)',
          margin: '0 auto 22px',
        }} />

        {/* Trainer icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 16, marginBottom: 16,
          background: 'linear-gradient(135deg, #6B8FFF 0%, #B8A8F0 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 18px rgba(107,143,255,0.38)',
          flexShrink: 0,
        }}>
          <Dumbbell style={{ width: 26, height: 26, color: '#fff' }} strokeWidth={2} />
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 8px', fontSize: 20, fontWeight: 800,
          color: textPri, letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          안녕하세요! 👋 오늘도 함께해요
        </h2>

        {/* Description */}
        <p style={{
          margin: '0 0 20px', fontSize: 14, fontWeight: 400,
          lineHeight: 1.65, color: textSec,
        }}>
          오늘의 스토리가 준비됐어요.<br />
          함께 읽고, 듣고, 따라 말해볼게요!
        </p>

        {/* Today's story card */}
        <div style={{
          marginBottom: 20, padding: '13px 15px',
          borderRadius: 16,
          background: cardBg,
          border: `1px solid ${cardBd}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(107,143,255,0.80)' }}>
              Story {String(story.id).padStart(2, '0')}
            </p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {story.title}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: textSec }}>
              패턴 {story.patterns.length}개
            </p>
          </div>
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={handleStart}
          style={{
            width: '100%', height: 52, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6B8FFF 0%, #B8A8F0 100%)',
            fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'inherit',
            boxShadow: '0 4px 22px rgba(107,143,255,0.42)',
            letterSpacing: '0.01em', marginBottom: 10,
          }}
        >
          🏋️ 오늘 학습 시작하기
        </button>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            width: '100%', height: 44, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'transparent', fontSize: 14, fontWeight: 600,
            color: laterCol, fontFamily: 'inherit',
          }}
        >
          나중에 하기
        </button>
      </div>
    </>
  )
}
