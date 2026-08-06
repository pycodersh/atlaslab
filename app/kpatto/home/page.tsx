'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { LESSONS } from '@/data/kpatto/precourse/lessons'
import { getAllRecords, getStreak, getActivityByDate, localDateStr } from '@/lib/srs/storage'
import { getMaxCompletedEpisode } from '@/lib/kpatto/episode-progress'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { createClient } from '@/lib/supabase/client'
import { FREE_EPISODES } from '@/lib/kpatto/config'

// ── 토큰 ──────────────────────────────────────────────────────────────────────
const ACCENT = '#D4873A'
const T1     = '#111111'
const T2     = '#888888'
const DIV    = '#F2F2F2'

const TOTAL_LESSONS    = LESSONS.length
const REQUIRED_LESSONS = LESSONS.filter(l => l.required).length

// ── 히어로 이미지 (자유 화 컷, 날짜 기반 고정) ─────────────────────────────────
// 잠긴 화 사용 금지 → EP01-10만 사용
const HERO_IMAGES = [
  { src: '/kpatto/ep09/ep09_c1.png',    alt: '한강에서' },   // Han River
  { src: '/kpatto/ep07/ep07_c1.png',    alt: '시장에서' },   // Market
  { src: '/kpatto/ep02/ep02_c1.png',    alt: '지하철에서' }, // Seoul Subway
  { src: '/kpatto/ep05/ep05_c1.png',    alt: '식당에서' },   // Restaurant
  { src: '/kpatto/ep-001/ep01_c1.png',  alt: '카페에서' },   // Cafe
] as const

// ── 날짜 유틸 ─────────────────────────────────────────────────────────────────

function getDayOfYear(): number {
  const now   = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86400000)
}

// ── 프리코스 진행도 ────────────────────────────────────────────────────────────

function loadPrecourseProgress(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw  = localStorage.getItem('kpatto.precourse.v1')
    if (!raw) return 0
    const data = JSON.parse(raw) as { lessons?: Record<string, { completed?: boolean }> }
    return Object.values(data.lessons ?? {}).filter(l => l?.completed).length
  } catch { return 0 }
}

// ── Continue 에피소드 정보 ────────────────────────────────────────────────────

type ContinueEp = {
  num:      number
  id:       string
  title:    string    // 한국어
  titleEn:  string    // 영어
}

function buildContinueEpStatic(epNum: number): ContinueEp {
  const num    = Math.max(1, Math.min(epNum, 100))
  const id     = `kp-ep-${String(num).padStart(3, '0')}`
  const story  = ALL_STORIES.find(s => s.episode === num)
  return {
    num,
    id,
    title:   story?.title ?? `Episode ${num}`,
    titleEn: '',
  }
}

// ── Daily Expression ──────────────────────────────────────────────────────────

type DailyExpr = {
  id:        number
  korean:    string
  english:   string
  audio_url: string | null
}

// ── 오디오 재생 ──────────────────────────────────────────────────────────────

let _currentAudio: HTMLAudioElement | null = null
function playAudioUrl(url: string) {
  try {
    if (_currentAudio) { _currentAudio.pause(); _currentAudio = null }
    const a = new Audio(url)
    _currentAudio = a
    a.play().catch(() => { /* noop */ })
  } catch { /* noop */ }
}

// ── 카드 컨테이너 ─────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      border: `1px solid ${DIV}`,
      borderRadius: 16,
      background: '#FFFFFF',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── 카드 내부 라벨 ────────────────────────────────────────────────────────────

function CardLabel({ left, right }: { left: string; right?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px 0',
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: T2, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
        {left}
      </span>
      {right && (
        <span style={{ fontSize: 11, fontWeight: 600, color: T2 }}>{right}</span>
      )}
    </div>
  )
}

// ── 히어로 이미지 ─────────────────────────────────────────────────────────────

function HeroImage() {
  const idx = getDayOfYear() % HERO_IMAGES.length
  const img = HERO_IMAGES[idx]
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '4/3',
      background: '#1A1A1A',
      overflow: 'hidden',
    }}>
      <Image
        src={img.src}
        alt={img.alt}
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 480px) 100vw, 480px"
        priority
      />
    </div>
  )
}

// ── Continue 줄 ───────────────────────────────────────────────────────────────

function ContinueRow({ ep }: { ep: ContinueEp }) {
  const epLabel = `EP ${String(ep.num).padStart(2, '0')}`
  return (
    <div style={{ padding: '10px 16px 0' }}>
      <Card>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '12px 14px',
          gap: 10,
        }}>
          {/* 왼쪽: EP 번호 + 제목들 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, marginBottom: 2, letterSpacing: '0.04em' }}>
              {epLabel}
            </div>
            <div style={{
              fontSize: 15, fontWeight: 700, color: T1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {ep.title}
            </div>
            {ep.titleEn && (
              <div style={{
                fontSize: 12, color: T2, marginTop: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {ep.titleEn}
              </div>
            )}
          </div>

          {/* 오른쪽: Continue 버튼 */}
          <Link
            href={`/kpatto/story/${ep.id}`}
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            <div style={{
              background: ACCENT, color: '#FFFFFF',
              fontSize: 12, fontWeight: 700,
              padding: '8px 14px', borderRadius: 99,
              whiteSpace: 'nowrap',
              WebkitTapHighlightColor: 'transparent',
            }}>
              Continue →
            </div>
          </Link>
        </div>
      </Card>
    </div>
  )
}

// ── Today's Expression 카드 ───────────────────────────────────────────────────

function ExpressionCard({ expr }: { expr: DailyExpr }) {
  const [playing, setPlaying] = useState(false)

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (!expr.audio_url) return
    setPlaying(true)
    playAudioUrl(expr.audio_url)
    setTimeout(() => setPlaying(false), 2000)
  }, [expr.audio_url])

  return (
    <div style={{ padding: '10px 16px 0' }}>
      <Link href={`/kpatto/expressions/${expr.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <Card style={{ background: '#FFF9F3', border: '1px solid #F5E0C8' }}>
          <CardLabel left="TODAY'S EXPRESSION" />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 16px 0',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 26, fontWeight: 800, color: ACCENT,
                letterSpacing: '-0.03em', lineHeight: 1.15,
              }}>
                {expr.korean}
              </div>
              <div style={{ fontSize: 13, color: T1, fontWeight: 500, marginTop: 4 }}>
                {expr.english}
              </div>
            </div>
            {/* 재생 버튼 */}
            {expr.audio_url && (
              <button
                type="button"
                onClick={handlePlay}
                style={{
                  flexShrink: 0,
                  width: 36, height: 36,
                  borderRadius: '50%',
                  background: playing ? ACCENT : '#F5E0C8',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-label="발음 듣기"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={playing ? '#fff' : ACCENT}
                  stroke="none">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </button>
            )}
          </div>

          {/* 구분선 + "Say it out loud 3 times" */}
          <div style={{
            margin: '12px 16px 0',
            borderTop: `1px solid #F5E0C8`,
          }} />
          <div style={{
            padding: '8px 16px 12px',
            fontSize: 12, color: T2, fontStyle: 'italic',
          }}>
            Say it out loud 3 times 🗣️
          </div>
        </Card>
      </Link>
    </div>
  )
}

// ── Hangeul Pre-course 카드 ───────────────────────────────────────────────────

function PrecourseCard({
  lessonsCompleted,
  precoursePercent,
}: {
  lessonsCompleted: number
  precoursePercent: number
}) {
  return (
    <div style={{ padding: '10px 16px 0' }}>
      <Link href="/kpatto/pre-course" style={{ textDecoration: 'none', display: 'block' }}>
        <Card>
          <CardLabel
            left="HANGEUL PRE-COURSE"
            right={`${lessonsCompleted} of ${TOTAL_LESSONS}`}
          />
          <div style={{ padding: '8px 16px 14px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 8 }}>
              Master Hangeul Reading
            </div>
            {/* 진행률 바 */}
            <div style={{ height: 5, background: DIV, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${precoursePercent}%`,
                background: ACCENT,
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{
              fontSize: 11, color: T2, marginTop: 5,
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{lessonsCompleted >= REQUIRED_LESSONS ? 'Completed ✓' : `${precoursePercent}% complete`}</span>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

// ── Streak ────────────────────────────────────────────────────────────────────

function StreakCard({ streak, weekActivity }: { streak: number; weekActivity: boolean[] }) {
  return (
    <div style={{ padding: '10px 16px 0' }}>
      <Card>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 20 }}>
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
            {(['M', 'T', 'W', 'T', 'F', 'S', 'S'] as string[]).map((day, i) => {
              const today_   = new Date()
              const dow      = today_.getDay()
              const todayIdx = (dow + 6) % 7
              const isToday  = i === todayIdx
              const done     = weekActivity[i]
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
      </Card>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function KPattoHomePage() {
  const { isPro, loading: subLoading } = useKPattoSubscription()

  const [isReturning,      setIsReturning]      = useState(false)
  const [continueEp,       setContinueEp]        = useState<ContinueEp>(buildContinueEpStatic(1))
  const [lessonsCompleted, setLessonsCompleted]  = useState(0)
  const [streak,           setStreak]            = useState(0)
  const [weekActivity,     setWeekActivity]      = useState<boolean[]>(Array(7).fill(false))
  const [todayExpr,        setTodayExpr]         = useState<DailyExpr | null>(null)
  const [hydrated,         setHydrated]          = useState(false)

  // ── 기본 통계 + 다음 화 계산 ────────────────────────────────────────────────
  useEffect(() => {
    const records    = getAllRecords()
    const hasOldRecs = records.length > 0
    setStreak(getStreak())
    setLessonsCompleted(loadPrecourseProgress())

    // 주간 활동 점
    const activity = getActivityByDate()
    const today    = new Date()
    const dow      = today.getDay()
    const monday   = new Date(today)
    monday.setDate(today.getDate() - ((dow + 6) % 7))
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return (activity[localDateStr(d)] ?? 0) > 0
    })
    setWeekActivity(week)

    // 다음 화 계산 (신규 시스템 max 완료 화)
    const sb = createClient()
    getMaxCompletedEpisode().then(async maxDone => {
      const hasProgress = maxDone > 0 || hasOldRecs
      setIsReturning(hasProgress)
      const nextNum = maxDone > 0 ? Math.min(maxDone + 1, 100) : 1

      // DB에서 영어 제목 병행 조회
      const { data: epData } = await sb
        .from('kp_episodes')
        .select('title_en')
        .eq('episode_num', nextNum)
        .single()

      setContinueEp({
        ...buildContinueEpStatic(nextNum),
        titleEn: (epData?.title_en as string | null) ?? '',
      })
    })

    setHydrated(true)
  }, [])

  // ── Today's Expression (날짜 기반 고정, 무료 범위 제한) ─────────────────────
  useEffect(() => {
    if (subLoading) return
    const maxEp    = isPro ? 100 : FREE_EPISODES
    const dayIdx   = getDayOfYear()
    const supabase = createClient()

    ;(async () => {
      try {
        const { count } = await supabase
          .from('kp_expressions')
          .select('id', { count: 'exact', head: true })
          .not('first_episode', 'is', null)
          .lte('first_episode', maxEp)

        if (!count) return
        const offset = dayIdx % count

        const { data } = await supabase
          .from('kp_expressions')
          .select('id, korean, english, audio_url')
          .not('first_episode', 'is', null)
          .lte('first_episode', maxEp)
          .order('id')
          .range(offset, offset)
          .single()

        if (data) setTodayExpr(data as DailyExpr)
      } catch { /* noop */ }
    })()
  }, [isPro, subLoading])

  if (!hydrated) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32 }}>
        <KPattoHeader />
      </div>
    )
  }

  const precoursePercent = Math.round((lessonsCompleted / TOTAL_LESSONS) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: KPATTO_TAB_BAR_HEIGHT + 32 }}>
      <KPattoHeader />

      {isReturning
        ? <ReturningUserView
            ep={continueEp}
            todayExpr={todayExpr}
            lessonsCompleted={lessonsCompleted}
            precoursePercent={precoursePercent}
            streak={streak}
            weekActivity={weekActivity}
          />
        : <NewUserView
            todayExpr={todayExpr}
            lessonsCompleted={lessonsCompleted}
            precoursePercent={precoursePercent}
          />
      }
    </div>
  )
}

// ── 재방문 사용자 뷰 ─────────────────────────────────────────────────────────

function ReturningUserView({
  ep,
  todayExpr,
  lessonsCompleted,
  precoursePercent,
  streak,
  weekActivity,
}: {
  ep:               ContinueEp
  todayExpr:        DailyExpr | null
  lessonsCompleted: number
  precoursePercent: number
  streak:           number
  weekActivity:     boolean[]
}) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* [1] 히어로 — 랜드마크 이미지 (날짜 고정) */}
      <HeroImage />

      {/* [2] Continue 줄 */}
      <ContinueRow ep={ep} />

      {/* [3] Today's expression */}
      {todayExpr && <ExpressionCard expr={todayExpr} />}

      {/* [4] Hangeul pre-course */}
      <PrecourseCard
        lessonsCompleted={lessonsCompleted}
        precoursePercent={precoursePercent}
      />

      {/* [7] Streak */}
      <StreakCard streak={streak} weekActivity={weekActivity} />
    </div>
  )
}

// ── 신규 사용자 뷰 ────────────────────────────────────────────────────────────

function NewUserView({
  todayExpr,
  lessonsCompleted,
  precoursePercent,
}: {
  todayExpr:        DailyExpr | null
  lessonsCompleted: number
  precoursePercent: number
}) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* 히어로 — 동일한 랜드마크 이미지 */}
      <HeroImage />

      {/* 선택지 카드 */}
      <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link href="/kpatto/pre-course" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ background: '#1A1A1A', borderRadius: 16, padding: '18px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T2, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Recommended start
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
              Learn Hangeul first
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 14 }}>
              Korean uses its own alphabet. Master reading in ~15 minutes.
            </div>
            <div style={{
              display: 'inline-block', background: ACCENT, color: '#FFFFFF',
              fontSize: 12, fontWeight: 700, padding: '7px 16px', borderRadius: 99,
            }}>
              Start Hangeul →
            </div>
          </div>
        </Link>

        <Link href="/kpatto/story" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            border: `1.5px solid ${DIV}`, borderRadius: 16, padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 3 }}>
                I already know Hangeul
              </div>
              <div style={{ fontSize: 12, color: T2 }}>Jump to Episode 1 →</div>
            </div>
            <div style={{
              width: 50, height: 50, borderRadius: 10, overflow: 'hidden',
              flexShrink: 0, background: '#F7F7F7', position: 'relative',
            }}>
              <Image src="/kpatto/banners/ep1.png" alt="EP01" fill style={{ objectFit: 'cover' }} sizes="50px" />
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        margin: '12px 16px 0',
        border: `1px solid ${DIV}`, borderRadius: 14, padding: '14px 18px',
        display: 'flex', justifyContent: 'space-between',
      }}>
        {([
          { num: '100', label: 'stories' },
          { num: '325', label: 'expressions' },
          { num: '10', label: 'free episodes' },
        ] as { num: string; label: string }[]).map(({ num, label }) => (
          <div key={label} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: ACCENT, letterSpacing: '-0.04em' }}>{num}</div>
            <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Today's expression */}
      {todayExpr && <ExpressionCard expr={todayExpr} />}

      {/* Pre-course */}
      <PrecourseCard lessonsCompleted={lessonsCompleted} precoursePercent={precoursePercent} />
    </div>
  )
}
