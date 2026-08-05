'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { LESSONS } from '@/data/kpatto/precourse/lessons'
import { getAllRecords, getStreak, getActivityByDate, localDateStr } from '@/lib/srs/storage'

const ACCENT = '#D4873A'
const T1 = '#111111'
const T2 = '#888888'
const DIV = '#F2F2F2'

const TOTAL_LESSONS = LESSONS.length
const REQUIRED_LESSONS = LESSONS.filter(l => l.required).length

const DAILY_EXPRESSIONS = [
  { slug: 'juseyo',             ko: '주세요',        en: 'Please give me…' },
  { slug: 'mwoyeyo',            ko: '뭐예요?',       en: 'What is it?' },
  { slug: 'isseoyo',            ko: '있어요?',       en: 'Is there / Do you have?' },
  { slug: 'eotteoke-gayo',      ko: '어떻게 가요?',  en: 'How do I get there?' },
  { slug: 'gago-sipeoyo',       ko: '가고 싶어요',   en: 'I want to go to…' },
  { slug: 'joahaeyo',           ko: '좋아해요',      en: 'I like…' },
  { slug: 'eseo-wasseoyo',      ko: '에서 왔어요',   en: "I'm from…" },
  { slug: 'jal-butakdeuryeoyo', ko: '잘 부탁드려요', en: 'Nice to meet you.' },
  { slug: 'meokgo-sipeoyo',     ko: '먹고 싶어요',   en: 'I want to eat…' },
  { slug: 'mot-meogeoyo',       ko: '못 먹어요',      en: "I can't eat…" },
  { slug: 'meogeodo-dwaeyo',    ko: '먹어도 돼요?',  en: 'Can I eat…?' },
  { slug: 'gireul-ilheosseoyo', ko: '길을 잃었어요', en: "I'm lost." },
  { slug: 'jaemiisseoyo',       ko: '재미있어요',    en: "It's fun!" },
  { slug: 'nalssi-eottaeyo',    ko: '날씨 어때요?',  en: "What's the weather like?" },
  { slug: 'oraenmanieyo',       ko: '오랜만이에요',  en: 'Long time no see.' },
  { slug: 'jal-jinaesseoyo',    ko: '잘 지냈어요?',  en: 'Have you been well?' },
  { slug: 'geot-gatayo',        ko: '것 같아요',     en: 'It seems like…' },
  { slug: 'na-bwayo',           ko: '나 봐요',       en: 'Looks like…' },
  { slug: 'haeya-hae',          ko: '해야 해',       en: 'I have to…' },
  { slug: 'haji-ma',            ko: '하지 마',       en: "Don't…" },
  { slug: 'boda',               ko: '~보다',         en: 'More than…' },
  { slug: 'seumnida',           ko: '-습니다',       en: 'Formal statement ending' },
  { slug: 'eo-boda',            ko: '-어 보다',      en: 'Try doing…' },
  { slug: 'man',                ko: '~만',           en: 'Only…' },
  { slug: 'bakke',              ko: '~밖에',         en: 'Nothing but…' },
  { slug: 'ege-hante',          ko: '~에게/한테',    en: 'To (a person)' },
  { slug: 'euro',               ko: '~으로',         en: 'By / Using…' },
  { slug: 'eullaeyo',           ko: '~을래요?',      en: 'Would you like to?' },
  { slug: 'ieyo-yeyo',          ko: '~이에요/예요',  en: '…is / …am' },
  { slug: 'hago',               ko: '~하고',         en: '…and' },
]

function loadPrecourseProgress(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem('kpatto.precourse.v1')
    if (!raw) return 0
    const data = JSON.parse(raw) as { lessons?: Record<string, { completed?: boolean }> }
    return Object.values(data.lessons ?? {}).filter(l => l?.completed).length
  } catch { return 0 }
}

function getTodayExpressionIndex(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return dayOfYear % DAILY_EXPRESSIONS.length
}

export default function KPattoHomePage() {
  const [isReturning, setIsReturning] = useState(false)
  const [continueEpisode, setContinueEpisode] = useState<typeof ALL_STORIES[0] | null>(null)
  const [lessonsCompleted, setLessonsCompleted] = useState(0)
  const [streak, setStreak] = useState(0)
  const [weekActivity, setWeekActivity] = useState<boolean[]>(Array(7).fill(false))
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const records = getAllRecords()
    const hasProgress = records.length > 0

    setIsReturning(hasProgress)
    setStreak(getStreak())
    setLessonsCompleted(loadPrecourseProgress())

    // Find last viewed episode
    if (hasProgress) {
      const storyRecords = records
        .filter(r => r.itemType === 'story')
        .sort((a, b) => {
          const aTime = a.lastPracticedAt ?? a.firstLearnedAt
          const bTime = b.lastPracticedAt ?? b.firstLearnedAt
          return bTime.localeCompare(aTime)
        })
      const lastStoryId = storyRecords[0]?.itemId
      if (lastStoryId) {
        const epNum = parseInt(lastStoryId)
        const ep = ALL_STORIES.find(s => s.episode === epNum) ?? null
        setContinueEpisode(ep)
      }
      if (!continueEpisode) setContinueEpisode(ALL_STORIES[0])
    }

    // Week activity dots
    const activity = getActivityByDate()
    const today = new Date()
    const dow = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dow + 6) % 7))
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return (activity[localDateStr(d)] ?? 0) > 0
    })
    setWeekActivity(week)
    setHydrated(true)
  }, [])

  const todayExpr = DAILY_EXPRESSIONS[getTodayExpressionIndex()]
  const precoursePercent = Math.round((lessonsCompleted / TOTAL_LESSONS) * 100)
  const ep = continueEpisode ?? ALL_STORIES[0]
  const epLabel = `EP${String(ep.episode).padStart(2, '0')}`

  // Prevent layout flash — render nothing until hydrated
  if (!hydrated) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32 }}>
        <KPattoHeader />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32 }}>
      <KPattoHeader />

      {isReturning ? (
        <ReturningUser
          ep={ep}
          epLabel={epLabel}
          todayExpr={todayExpr}
          lessonsCompleted={lessonsCompleted}
          precoursePercent={precoursePercent}
          streak={streak}
          weekActivity={weekActivity}
        />
      ) : (
        <NewUser />
      )}
    </div>
  )
}

// ── Returning user layout ───────────────────────────────────────────────────

type Expr = typeof DAILY_EXPRESSIONS[0]

function ReturningUser({
  ep,
  epLabel,
  todayExpr,
  lessonsCompleted,
  precoursePercent,
  streak,
  weekActivity,
}: {
  ep: typeof ALL_STORIES[0]
  epLabel: string
  todayExpr: Expr
  lessonsCompleted: number
  precoursePercent: number
  streak: number
  weekActivity: boolean[]
}) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>

      {/* Continue card — hero */}
      <div style={{ padding: '16px 16px 0' }}>
        <Link
          href={`/kpatto/story/${ep.id}`}
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div style={{
            position: 'relative', width: '100%', height: 200,
            borderRadius: 20, overflow: 'hidden', background: '#1A1A1A',
          }}>
            {ep.thumbnail_url && (
              <Image
                src={ep.thumbnail_url}
                alt={ep.title}
                fill
                style={{ objectFit: 'cover', opacity: 0.75 }}
                sizes="(max-width: 480px) 100vw, 480px"
                priority
              />
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)',
              padding: '0 20px 20px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: ACCENT, letterSpacing: '0.08em', marginBottom: 6 }}>
                {epLabel} · CONTINUE
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginBottom: 14 }}>
                {ep.title}
              </div>
              <div style={{
                alignSelf: 'flex-start',
                background: ACCENT, color: '#FFFFFF',
                fontSize: 13, fontWeight: 800,
                padding: '8px 18px', borderRadius: 99,
                letterSpacing: '-0.01em',
              }}>
                Continue →
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Today's Expression */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T2, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Today's Expression
        </div>
        <Link href={`/kpatto/expressions/${todayExpr.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#FFF9F3',
            border: `1px solid #F5E0C8`,
            borderRadius: 16,
            padding: '16px 18px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: ACCENT, letterSpacing: '-0.03em', marginBottom: 4 }}>
                {todayExpr.ko}
              </div>
              <div style={{ fontSize: 13, color: T1, fontWeight: 500 }}>
                {todayExpr.en}
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: 12 }}>
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </Link>
      </div>

      {/* Pre-course card */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T2, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Pre-Course · Hangeul
        </div>
        <Link href="/kpatto/pre-course" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            border: `1px solid ${DIV}`,
            borderRadius: 16,
            padding: '14px 16px',
            background: '#FFFFFF',
          }}>
            <div style={{ flex: 1, minWidth: 0, marginRight: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 6 }}>
                Master Hangeul Reading
              </div>
              <div style={{ height: 4, background: DIV, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${precoursePercent}%`, background: ACCENT, borderRadius: 2, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: T2, marginTop: 5 }}>
                {lessonsCompleted} / {TOTAL_LESSONS} lessons
              </div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              border: `2.5px solid ${lessonsCompleted >= REQUIRED_LESSONS ? ACCENT : DIV}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800,
              color: lessonsCompleted >= REQUIRED_LESSONS ? ACCENT : T2,
            }}>
              {precoursePercent}%
            </div>
          </div>
        </Link>
      </div>

      {/* Streak */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          border: `1px solid ${DIV}`, borderRadius: 16,
          background: '#FFFFFF', padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#FFF3E0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>🔥</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T1, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {streak}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {['M','T','W','T','F','S','S'].map((day, i) => {
              const today = new Date()
              const dow = today.getDay()
              const todayIdx = (dow + 6) % 7
              const isToday = i === todayIdx
              const done = weekActivity[i]
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: done ? ACCENT : isToday ? '#1A1A1A' : '#F2F2F2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span style={{ fontSize: 11, fontWeight: 600, color: isToday ? '#FFFFFF' : '#888888' }}>{day}</span>
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

// ── New user layout ─────────────────────────────────────────────────────────

function NewUser() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>

      {/* Hero */}
      <div style={{ padding: '32px 20px 0', textAlign: 'center' }}>
        <div style={{
          fontSize: 13, fontWeight: 800, color: ACCENT,
          letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12,
        }}>
          Learn Korean
        </div>
        <h1 style={{
          fontSize: 30, fontWeight: 800, color: T1,
          letterSpacing: '-0.04em', lineHeight: 1.15,
          margin: '0 0 12px',
        }}>
          Read Korean stories.<br />Learn real expressions.
        </h1>
        <p style={{ fontSize: 14, color: T2, lineHeight: 1.6, margin: 0 }}>
          K-PATTO teaches Korean through webtoon-style stories — each episode introduces expressions you'll actually use.
        </p>
      </div>

      {/* Choice cards */}
      <div style={{ padding: '28px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Hangeul first */}
        <Link href="/kpatto/pre-course" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            background: '#1A1A1A', borderRadius: 18,
            padding: '20px 20px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: T2, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Recommended Start
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
              Learn Hangeul First
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 16 }}>
              Korean uses its own alphabet. Master reading in ~15 minutes.
            </div>
            <div style={{
              display: 'inline-block',
              background: ACCENT, color: '#FFFFFF',
              fontSize: 13, fontWeight: 800,
              padding: '8px 18px', borderRadius: 99,
            }}>
              Start Hangeul →
            </div>
          </div>
        </Link>

        {/* Jump to stories */}
        <Link href="/kpatto/story" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            border: `1.5px solid ${DIV}`, borderRadius: 18,
            padding: '18px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T1, marginBottom: 4 }}>
                I already know Hangeul
              </div>
              <div style={{ fontSize: 13, color: T2 }}>
                Jump to Episode 1 →
              </div>
            </div>
            <div style={{
              width: 56, height: 56, borderRadius: 12, overflow: 'hidden',
              flexShrink: 0, background: '#F7F7F7',
              position: 'relative',
            }}>
              <Image
                src="/kpatto/banners/ep1.png"
                alt="EP01"
                fill
                style={{ objectFit: 'cover' }}
                sizes="56px"
              />
            </div>
          </div>
        </Link>
      </div>

      {/* 3 stats */}
      <div style={{
        margin: '24px 16px 0',
        border: `1px solid ${DIV}`, borderRadius: 16,
        padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between',
      }}>
        {[
          { num: '100', label: 'stories' },
          { num: '300+', label: 'expressions' },
          { num: '10', label: 'free episodes' },
        ].map(({ num, label }) => (
          <div key={label} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: ACCENT, letterSpacing: '-0.04em' }}>
              {num}
            </div>
            <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Browse expressions */}
      <div style={{ padding: '16px 16px 0' }}>
        <Link href="/kpatto/expressions" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            border: `1px solid ${DIV}`, borderRadius: 14,
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 2 }}>
                Browse Korean Expressions
              </div>
              <div style={{ fontSize: 12, color: T2 }}>
                30 essential expressions with examples
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </Link>
      </div>

    </div>
  )
}
