'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { usePreferences } from '@/contexts/PreferencesContext'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { LESSONS } from '@/data/kpatto/precourse/lessons'
import { getUI } from '@/lib/kpatto/ui-strings'
import { getStreak, getRecord, getActivityByDate, localDateStr } from '@/lib/srs/storage'

const T1    = '#111111'
const T2    = '#999999'
const DIV   = '#F2F2F2'
const ACCENT = '#D4873A'

const BANNERS = [
  { src: '/kpatto/banners/banner-1.png', label: 'Bukchon Hanok Village',  text: 'Where tradition meets the Seoul skyline' },
  { src: '/kpatto/banners/banner-2.png', label: 'Seoul Metro',            text: 'Navigate the city like a local' },
  { src: '/kpatto/banners/banner-3.png', label: 'Traditional Market',     text: 'Taste Korea, one street at a time' },
  { src: '/kpatto/banners/banner-4.png', label: 'Korean Café',            text: 'Find your perfect cup in Seoul' },
  { src: '/kpatto/banners/banner-5.png', label: 'Han River Park',         text: "Seoul's favorite place to breathe" },
]

const TOTAL_LESSONS = LESSONS.length
const REQUIRED_LESSONS = LESSONS.filter(l => l.required).length

function loadPrecourseProgress(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem('kpatto.precourse.v1')
    if (!raw) return 0
    const data = JSON.parse(raw) as { lessons?: Record<string, { completed?: boolean }> }
    return Object.values(data.lessons ?? {}).filter(l => l?.completed).length
  } catch {
    return 0
  }
}

export default function KPattoHomePage() {
  const { prefs } = usePreferences()
  const ui = getUI(prefs.language)

  const [bannerIdx, setBannerIdx] = useState(() => new Date().getHours() % BANNERS.length)
  const [streak, setStreak] = useState(0)
  const [epViews, setEpViews] = useState(0)
  const [lessonsCompleted, setLessonsCompleted] = useState(0)
  const [weekActivity, setWeekActivity] = useState<boolean[]>(Array(7).fill(false))

  useEffect(() => {
    setStreak(getStreak())
    const rec = getRecord('story', '1')
    setEpViews(rec?.repeatCount ?? 0)
    setLessonsCompleted(loadPrecourseProgress())

    // build this-week activity (Mon–Sun of current week)
    const activity = getActivityByDate()
    const today = new Date()
    const dow = today.getDay() // 0=Sun
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dow + 6) % 7))
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return (activity[localDateStr(d)] ?? 0) > 0
    })
    setWeekActivity(week)

    // advance banner every hour
    const now = new Date()
    const msUntilNextHour = (60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000
    const timer = setTimeout(() => {
      setBannerIdx(new Date().getHours() % BANNERS.length)
    }, msUntilNextHour)
    return () => clearTimeout(timer)
  }, [])

  const featured = ALL_STORIES[0]
  const precoursePercent = Math.round((lessonsCompleted / TOTAL_LESSONS) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32 }}>
      <KPattoHeader />

      {/* ── Banner Slider ── */}
      <div style={{ padding: '16px 16px 0' }}>
      <div style={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden', background: '#F2F2F2', borderRadius: 20 }}>
        {BANNERS.map((b, i) => (
          <div
            key={b.src}
            style={{
              position: 'absolute', inset: 0,
              opacity: i === bannerIdx ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          >
            <Image
              src={b.src}
              alt={b.label}
              fill
              style={{ objectFit: 'cover' }}
              sizes="100vw"
              priority={i === 0}
            />
            {/* Bottom gradient + text overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '0 16px 40px',
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, marginBottom: 4, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                {b.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                {b.text}
              </div>
            </div>
          </div>
        ))}

        {/* Dot indicators */}
        <div style={{
          position: 'absolute', bottom: 12, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 6,
        }}>
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIdx(i)}
              style={{
                width: i === bannerIdx ? 20 : 6,
                height: 6,
                borderRadius: 99,
                background: i === bannerIdx ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
      </div>

      {/* ── Today's Episode ── */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: T2, textTransform: 'uppercase', marginBottom: 12 }}>
          Today's Episode
        </div>

        <div style={{
          display: 'flex', alignItems: 'stretch',
          borderRadius: 16,
          border: '1px solid #E0E0E0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          background: '#FFFFFF',
          overflow: 'hidden',
          minHeight: 100,
        }}>
          {/* Thumbnail */}
          <div style={{ padding: '10px 0 10px 10px', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 120, height: 80, borderRadius: 12, overflow: 'hidden', background: '#F7F7F7' }}>
              <Image
                src="/kpatto/banners/ep1.png"
                alt={featured.title}
                fill
                style={{ objectFit: 'cover', objectPosition: 'center center' }}
                sizes="120px"
              />
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0, padding: '12px 12px 12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: '0.06em', marginBottom: 4 }}>
                EP {String(featured.episode).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {featured.title}
              </div>
            </div>

            <div>
              {/* Progress bar */}
              <div style={{ height: 3, background: DIV, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: epViews > 0 ? '60%' : '0%', background: ACCENT, borderRadius: 2, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: T2 }}>
                  {epViews > 0 ? 'In progress' : 'Not started yet'}
                </span>
                <Link href={`/kpatto/story/${featured.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <ChevronRight size={20} color="#999999" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pre-Course ── */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: T2, textTransform: 'uppercase', marginBottom: 12 }}>
          Pre-Course · Hangeul
        </div>

        <div style={{
          display: 'flex', alignItems: 'center',
          borderRadius: 16,
          border: '1px solid #E0E0E0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          background: '#FFFFFF',
          padding: '10px 12px 10px 16px',
          minHeight: 100,
        }}>
          {/* Left: text + progress bar */}
          <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T1, marginBottom: 2 }}>
              Master Hangeul Reading
            </div>
            <div style={{ fontSize: 12, color: T2, marginBottom: 10 }}>
              {lessonsCompleted} / {TOTAL_LESSONS} lessons complete
            </div>
            <div style={{ height: 4, background: DIV, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${precoursePercent}%`, background: ACCENT, borderRadius: 2, transition: 'width 0.4s ease' }} />
            </div>
          </div>
          {/* Right: circle + chevron */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: `3px solid ${lessonsCompleted >= REQUIRED_LESSONS ? ACCENT : DIV}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800,
              color: lessonsCompleted >= REQUIRED_LESSONS ? ACCENT : T2,
            }}>
              {precoursePercent}%
            </div>
            <Link href="/kpatto/pre-course" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={20} color="#999999" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Streak widget ── */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: T2, textTransform: 'uppercase', marginBottom: 12 }}>
          Streak · This Week
        </div>
      </div>
      <div style={{ margin: '0 16px 0', borderRadius: 16, border: '1px solid #E0E0E0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)', background: '#FFFFFF', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Fire + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#FFF3E0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>🔥</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T1, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {streak}
              </div>
            </div>
          </div>

          {/* Week grid */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {['M','T','W','T','F','S','S'].map((day, i) => {
              const today = new Date()
              const dow = today.getDay()
              const todayIdx = (dow + 6) % 7  // 0=Mon
              const isToday = i === todayIdx
              const done = weekActivity[i]
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: done ? ACCENT : isToday ? '#1A1A1A' : '#F2F2F2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span style={{ fontSize: 13, fontWeight: 600, color: isToday ? '#FFFFFF' : '#1A1A1A' }}>{day}</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}
