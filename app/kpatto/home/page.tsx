'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { KPattoHeader } from '@/components/kpatto/KPattoHeader'
import { KPATTO_TAB_BAR_HEIGHT } from '@/components/kpatto/KPattoTabBar'
import { ALL_STORIES } from '@/data/kpatto/sample-episode'
import { LESSONS } from '@/data/kpatto/precourse/lessons'
import { getAllRecords, getStreak, getActivityByDate, localDateStr } from '@/lib/kpatto/srs-storage'
import { getMaxCompletedEpisode } from '@/lib/kpatto/episode-progress'
import { useKPattoSubscription } from '@/lib/kpatto/subscription'
import { createClient } from '@/lib/supabase/client'
import { FREE_EPISODES } from '@/lib/kpatto/config'
import { ID_TO_SLUG } from '@/lib/kpatto/expressions-config'
import { ExpressionPopup } from '@/components/kpatto/ExpressionPopup'
import type { KPattoExpression } from '@/data/kpatto/types'

// ── 토큰 ──────────────────────────────────────────────────────────────────────
const ACCENT = '#D4873A'
const T1     = '#111111'
const T2     = '#888888'
const DIV    = '#F2F2F2'

const TOTAL_LESSONS    = LESSONS.length
const REQUIRED_LESSONS = LESSONS.filter(l => l.required).length

// ── 히어로 배너 (날짜 기반 고정 · banner-6~9 추가 시 배열 확장) ─────────────────
const HERO_BANNERS = [
  { src: '/kpatto/banners/banner-1.png', ko: '북촌 한옥마을', en: 'Bukchon Hanok Village' },
  { src: '/kpatto/banners/banner-2.png', ko: '지하철역',      en: 'Subway Station'        },
  { src: '/kpatto/banners/banner-3.png', ko: '전통시장',      en: 'Traditional Market'    },
  { src: '/kpatto/banners/banner-4.png', ko: '동네 카페',     en: 'Neighborhood Cafe'     },
  { src: '/kpatto/banners/banner-5.png', ko: '한강공원',      en: 'Hangang Park'          },
  { src: '/kpatto/banners/banner-6.png', ko: '한강의 밤',     en: 'Hangang at Night'      },
  { src: '/kpatto/banners/banner-7.png', ko: '홍대 거리',     en: 'Hongdae Street'        },
  { src: '/kpatto/banners/banner-8.png', ko: '한옥뷰 카페',   en: 'Hanok View Cafe'       },
  { src: '/kpatto/banners/banner-9.png', ko: '명동 거리',     en: 'Myeongdong Street'     },
] as const

// ── 시간·날짜 유틸 ────────────────────────────────────────────────────────────

/** 배너: 1시간마다 교체, 같은 시간대 새로고침 → 동일 이미지 */
function getHourIndex(): number {
  return new Date().getHours()
}

/** Today's Expression: 하루 단위 고정 */
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
  num:          number
  id:           string
  title:        string    // 한국어
  titleEn:      string    // 영어
  thumbnailUrl: string
}

function buildContinueEpStatic(epNum: number): ContinueEp {
  const num   = Math.max(1, Math.min(epNum, 100))
  const id    = `kp-ep-${String(num).padStart(3, '0')}`
  const story = ALL_STORIES.find(s => s.episode === num)
  return {
    num,
    id,
    title:        story?.title ?? `Episode ${num}`,
    titleEn:      '',
    thumbnailUrl: story?.thumbnail_url
      ?? `/kpatto/ep-${String(num).padStart(3, '0')}/ep${num}_c1.png`,
  }
}

// ── Daily Expression ──────────────────────────────────────────────────────────

type DailyExpr = {
  id:          number
  korean:      string
  english:     string
  audio_url:   string | null
  description: string | null
  structure:   string | null
  category:    string | null
  examples:    { ko: string; en: string }[] | null
  tip:         string | null
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
      border: '1px solid #E0E0E0',
      borderRadius: 16,
      background: '#FFFFFF',
      overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
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
  const banner = HERO_BANNERS[getHourIndex() % HERO_BANNERS.length]
  return (
    <div style={{ padding: '12px 16px 0' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundImage: `url(${banner.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundColor: '#1A1A1A',
      }}>
        {/* 하단 그라데이션 오버레이 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.48) 100%)',
          pointerEvents: 'none',
        }} />

        {/* 장소명 — 좌측 하단 */}
        <div style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 500,
            color: '#FFFFFF',
            lineHeight: 1.35,
          }}>
            {banner.ko}
          </div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.35,
            marginTop: 2,
          }}>
            {banner.en}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 히어로 에피소드 카드 (히어로 배너 대체) ────────────────────────────────────
// 에피소드 썸네일을 전체 배경으로 사용하는 히어로 크기 카드.
// 기존 HeroImage 와 동일한 패딩·비율·모서리·그림자.
// 카드 전체가 탭 영역 → /kpatto/story/:id 이동.

function HeroEpisodeCard({ ep }: { ep: ContinueEp }) {
  const epLabel = `EP ${String(ep.num).padStart(2, '0')}`
  return (
    <div style={{ padding: '12px 16px 0' }}>
      <Link
        href={`/kpatto/story/${ep.id}`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: '#1A1A1A',
        }}>
          {/* 에피소드 썸네일 */}
          <Image
            src={ep.thumbnailUrl}
            alt={ep.title}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center center' }}
            sizes="(max-width: 480px) 100vw, 480px"
            priority
          />

          {/* 하단 그라데이션 오버레이 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65) 100%)',
            pointerEvents: 'none',
          }} />

          {/* 좌측 하단: EP 라벨 + 한글 제목 + 영문 부제 */}
          <div style={{
            position: 'absolute',
            left: 12,
            bottom: 12,
            pointerEvents: 'none',
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.75)',
              letterSpacing: '0.06em',
              lineHeight: 1.3,
            }}>
              {epLabel}
            </div>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.25,
              marginTop: 2,
            }}>
              {ep.title}
            </div>
            {ep.titleEn && (
              <div style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.3,
                marginTop: 2,
              }}>
                {ep.titleEn}
              </div>
            )}
          </div>

          {/* 우측 하단: 오렌지 화살표 */}
          <div style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            pointerEvents: 'none',
          }}>
            <ChevronRight size={22} strokeWidth={2.5} color={ACCENT} />
          </div>
        </div>
      </Link>
    </div>
  )
}

// ── Continue / Start 줄 ───────────────────────────────────────────────────────
// 재사용 가능성이 있으므로 컴포넌트 정의는 유지 (렌더에서는 HeroEpisodeCard 로 대체됨).
// 1행: EP 라벨(min-width 4.5em) · 한글 제목
// 2행: [들여쓰기] 영문 부제  Continue→
// 텍스트 블록은 썸네일 높이 내에서 세로 중앙 정렬.

function ContinueRow({ ep }: { ep: ContinueEp }) {
  const epLabel = `EP ${String(ep.num).padStart(2, '0')}`
  return (
    <div style={{ padding: '10px 16px 0' }}>
      <Card>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 16px 14px 10px',
          gap: 12,
        }}>
          {/* 왼쪽: 썸네일 */}
          <div style={{
            position: 'relative',
            width: 120, height: 80,
            borderRadius: 12,
            overflow: 'hidden',
            flexShrink: 0,
            background: '#F7F7F7',
          }}>
            <Image
              src={ep.thumbnailUrl}
              alt={ep.title}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center center' }}
              sizes="120px"
            />
          </div>

          {/* 오른쪽: 3행 텍스트 */}
          <div style={{
            flex: 1, minWidth: 0,
            display: 'flex', flexDirection: 'column',
            gap: 4,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T2, letterSpacing: '0.04em' }}>
              {epLabel}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ep.title}
            </div>
            <div style={{ fontSize: 12, color: T2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ep.titleEn}
            </div>
          </div>

          {/* 화살표만 클릭 영역 */}
          <Link href={`/kpatto/story/${ep.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', padding: 8, margin: -8, flexShrink: 0 }}>
            <ChevronRight size={20} strokeWidth={2.8} color={ACCENT} />
          </Link>
        </div>
      </Card>
    </div>
  )
}

// ── Today's Expression 카드 ───────────────────────────────────────────────────

function ExpressionCard({
  expr,
  onOpenPopup,
  wrapperRef,
}: {
  expr: DailyExpr
  onOpenPopup: (expr: DailyExpr) => void
  wrapperRef?: React.RefObject<HTMLDivElement | null>
}) {
  const [playing, setPlaying] = useState(false)
  const slug = ID_TO_SLUG[expr.id] ?? null

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (!expr.audio_url) return
    setPlaying(true)
    playAudioUrl(expr.audio_url)
    setTimeout(() => setPlaying(false), 2000)
  }, [expr.audio_url])

  return (
    <div ref={wrapperRef} style={{ padding: '10px 16px 0', display: 'flex', flexDirection: 'column' }}>
      {/* 3줄(라벨·한국어·영어) space-evenly 균등 배치, 화살표 우측 세로 중앙 절대 위치 */}
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', position: 'relative' }}>

        {/* 행 1: TODAY'S EXPRESSION 라벨 */}
        <div style={{ padding: '0 44px 0 16px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: T2, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
            TODAY&apos;S EXPRESSION
          </span>
        </div>

        {/* 행 2: 한국어 표현 */}
        <div style={{ padding: '0 44px 0 16px' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: ACCENT, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            {expr.korean}
          </div>
        </div>

        {/* 행 3: 영어 번역 + 재생 버튼 */}
        <div style={{ padding: '0 44px 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 13, color: T1, fontWeight: 500, flex: 1 }}>
            {expr.english}
          </div>
          {expr.audio_url && (
            <button
              type="button"
              onClick={handlePlay}
              style={{
                flexShrink: 0,
                width: 28, height: 28,
                borderRadius: '50%',
                background: playing ? ACCENT : '#FFF4EA',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="발음 듣기"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill={playing ? '#fff' : ACCENT} stroke="none">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            </button>
          )}
        </div>

        {/* 화살표: 카드 우측 세로 중앙 절대 위치 */}
        <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}>
          {slug ? (
            <Link href={`/kpatto/expressions/${slug}`} style={{ textDecoration: 'none', display: 'flex', padding: 8 }}>
              <ChevronRight size={20} strokeWidth={2.8} color={ACCENT} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onOpenPopup(expr)}
              style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', display: 'flex', WebkitTapHighlightColor: 'transparent' }}
            >
              <ChevronRight size={20} strokeWidth={2.8} color={ACCENT} />
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}

// ── Hangeul Pre-course 카드 ───────────────────────────────────────────────────
// 항상 표시. 0% → "Start Hangeul →", 중간 → "Continue →", 완료 → "Review →" 텍스트 링크

function PrecourseCard({
  lessonsCompleted,
  precoursePercent,
  wrapperRef,
}: {
  lessonsCompleted: number
  precoursePercent: number
  wrapperRef?: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div ref={wrapperRef} style={{ padding: '10px 16px 0', display: 'flex', flexDirection: 'column' }}>
      <Card style={{ flex: 1 }}>
        <CardLabel left="HANGEUL PRE-COURSE" />
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '8px 12px 14px 16px', gap: 12,
        }}>
          {/* 왼쪽: 제목 + 진행바 + 퍼센트 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 8 }}>
              Master Hangeul Reading
            </div>
            <div style={{ height: 5, background: DIV, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${precoursePercent}%`,
                background: ACCENT,
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: T2, marginTop: 5 }}>
              {lessonsCompleted >= REQUIRED_LESSONS ? 'Completed ✓' : `${precoursePercent}% complete`}
            </div>
          </div>

          {/* 화살표만 클릭 영역 */}
          <Link href="/kpatto/pre-course" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', padding: 8, margin: -8, flexShrink: 0 }}>
            <ChevronRight size={20} strokeWidth={2.8} color={ACCENT} />
          </Link>
        </div>
      </Card>
    </div>
  )
}

// ── Streak ────────────────────────────────────────────────────────────────────

function StreakCard({ streak, weekActivity, wrapperRef }: { streak: number; weekActivity: boolean[]; wrapperRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={wrapperRef} style={{ padding: '10px 16px 0', display: 'flex', flexDirection: 'column' }}>
      <Card style={{ flex: 1 }}>
        <CardLabel left="STREAK" />
        <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', gap: 20 }}>
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
                    background: done ? '#1A1A1A' : isToday ? '#1A1A1A' : '#F2F2F2',
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

// ── 통계 줄 ──────────────────────────────────────────────────────────────────

function StatsRow({ wrapperRef }: { wrapperRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={wrapperRef} style={{
      margin: '10px 16px 0',
      border: '1px solid #E0E0E0',
      borderRadius: 14,
      padding: '14px 18px',
      display: 'flex',
      justifyContent: 'space-between',
      boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    }}>
      {([
        { num: '100', label: 'stories' },
        { num: '325', label: 'expressions' },
        { num: '10',  label: 'free episodes' },
      ] as { num: string; label: string }[]).map(({ num, label }, i) => (
        <>
          {i > 0 && (
            <div key={`div-${i}`} style={{
              width: 1, background: '#E0E0E0',
              alignSelf: 'stretch', margin: '6px 0', flexShrink: 0,
            }} />
          )}
          <div key={label} style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: T2, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T1, letterSpacing: '-0.04em' }}>{num}</div>
          </div>
        </>
      ))}
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function KPattoHomePage() {
  const { isPro, loading: subLoading } = useKPattoSubscription()

  // ── 카드 쌍 높이 동기화용 refs ────────────────────────────────────────────────
  const precourseRef  = useRef<HTMLDivElement>(null)
  const expressionRef = useRef<HTMLDivElement>(null)
  const streakRef     = useRef<HTMLDivElement>(null)
  const statsRef      = useRef<HTMLDivElement>(null)

  const [hasProgress,      setHasProgress]      = useState(false)
  const [continueEp,       setContinueEp]        = useState<ContinueEp>(buildContinueEpStatic(1))
  const [lessonsCompleted, setLessonsCompleted]  = useState(0)
  const [streak,           setStreak]            = useState(0)
  const [weekActivity,     setWeekActivity]      = useState<boolean[]>(Array(7).fill(false))
  const [todayExpr,        setTodayExpr]         = useState<DailyExpr | null>(null)
  const [hydrated,         setHydrated]          = useState(false)
  const [popupExpr,        setPopupExpr]         = useState<DailyExpr | null>(null)

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

    // 다음 화 계산
    const sb = createClient()
    getMaxCompletedEpisode().then(async maxDone => {
      const progress = maxDone > 0 || hasOldRecs
      setHasProgress(progress)
      const nextNum  = maxDone > 0 ? Math.min(maxDone + 1, 100) : 1

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
          .select('id, korean, english, audio_url, description, structure, category, examples, tip')
          .not('first_episode', 'is', null)
          .lte('first_episode', maxEp)
          .order('id')
          .range(offset, offset)
          .single()

        if (data) setTodayExpr(data as DailyExpr)
      } catch { /* noop */ }
    })()
  }, [isPro, subLoading])

  // ── 카드 쌍 높이 동기화 (위 2개 / 아래 2개 — 큰 쪽 기준) ─────────────────────
  useEffect(() => {
    if (!hydrated) return
    const syncPair = (a: HTMLDivElement | null, b: HTMLDivElement | null) => {
      if (!a || !b) return
      // 먼저 리셋해서 자연 높이 측정
      a.style.minHeight = ''
      b.style.minHeight = ''
      const h = Math.max(a.offsetHeight, b.offsetHeight)
      a.style.minHeight = `${h}px`
      b.style.minHeight = `${h}px`
    }
    syncPair(precourseRef.current, expressionRef.current)
    syncPair(streakRef.current,    statsRef.current)
  }, [hydrated, todayExpr, lessonsCompleted, streak])

  if (!hydrated) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: `calc(${KPATTO_TAB_BAR_HEIGHT + 16}px + env(safe-area-inset-bottom, 0px))` }}>
        <KPattoHeader />
      </div>
    )
  }

  const precoursePercent = Math.round((lessonsCompleted / TOTAL_LESSONS) * 100)

  return (
    <>
      <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingBottom: `calc(${KPATTO_TAB_BAR_HEIGHT + 16}px + env(safe-area-inset-bottom, 0px))` }}>
        <KPattoHeader />

        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          {/* [1] 히어로 에피소드 카드 (진행 없음 → EP01, 진행 있음 → 다음 화) */}
          <HeroEpisodeCard ep={continueEp} />

          {/* [3] 한글 프리코스 (항상 표시) */}
          <PrecourseCard
            lessonsCompleted={lessonsCompleted}
            precoursePercent={precoursePercent}
            wrapperRef={precourseRef}
          />

          {/* [4] TODAY'S EXPRESSION */}
          {todayExpr && <ExpressionCard expr={todayExpr} onOpenPopup={setPopupExpr} wrapperRef={expressionRef} />}

          {/* [5] Streak (0일 때도 표시) */}
          <StreakCard streak={streak} weekActivity={weekActivity} wrapperRef={streakRef} />

          {/* [6] 통계 100/325/10 (항상 표시) */}
          <StatsRow wrapperRef={statsRef} />
        </div>
      </div>

      {/* TODAY'S EXPRESSION 팝업 — slug 없는 표현용 */}
      {popupExpr && (
        <ExpressionPopup
          expression={{
            ...popupExpr,
            examples:      popupExpr.examples ?? [],
            first_episode: null,
          } as unknown as KPattoExpression}
          onClose={() => setPopupExpr(null)}
        />
      )}
    </>
  )
}
