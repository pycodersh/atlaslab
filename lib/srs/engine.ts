/**
 * Patto Memory Engine — 계산 레이어.
 *
 * storage.ts 가 읽기/쓰기를 담당하고,
 * 이 모듈은 SRS 데이터를 기반으로 한 파생 계산을 담당한다.
 *
 * Pattern 상태 (4단계):
 *   new       — repeatCount === 0  (한 번도 연습 안 함)
 *   learning  — intervalDays < 7   (단기 반복 중)
 *   review    — 7 ≤ intervalDays < 30
 *   mastered  — intervalDays ≥ 30
 *
 * Adaptive Scheduler:
 *   하루 최대 dailyLimit 개만 표시. Light/Normal/Intensive 학습 모드 연결 예정.
 */

import {
  getAllRecords, todayStr, addDays,
  getStudiedTodayStoryCount, getPracticedTodayCount,
  getReviewedTodayCount, getDueCount, getEventsByStory,
  type LearningRecord,
} from './storage'
import { magazineStories } from '@/data/magazine-stories'

// ── 상수 ─────────────────────────────────────────────────────────────────────

export const STATUS_THRESHOLDS = {
  review:   7,
  mastered: 30,
} as const

export const DAILY_LIMITS = {
  light:     3,
  normal:    5,
  intensive: 10,
} as const

export type LearningMode = keyof typeof DAILY_LIMITS
export const DEFAULT_LEARNING_MODE: LearningMode = 'normal'

// ── Pattern 상태 (4단계) ─────────────────────────────────────────────────────

export type PatternStatus = 'new' | 'learning' | 'review' | 'mastered'

export function getPatternStatus(r: LearningRecord): PatternStatus {
  if (r.repeatCount === 0) return 'new'
  if (r.intervalDays >= STATUS_THRESHOLDS.mastered) return 'mastered'
  if (r.intervalDays >= STATUS_THRESHOLDS.review)   return 'review'
  return 'learning'
}

// ── PatternDetail — Adaptive Scheduler 확장 구조 ─────────────────────────────

export type PatternDetail = LearningRecord & {
  status:        PatternStatus
  masteryScore:  number        // 0–100, intervalDays 기반 추정. 추후 고도화.
  priorityScore: string        // nextReviewAt 사전순 (낮을수록 우선). 추후 고도화.
  reviewCount:   number
  lastSeenAt:    string | null
}

function toPatternDetail(r: LearningRecord): PatternDetail {
  const status       = getPatternStatus(r)
  const masteryScore = Math.min(100, Math.round((r.intervalDays / STATUS_THRESHOLDS.mastered) * 100))
  const lastSeenAt   = [r.lastPracticedAt, r.lastReviewedAt].filter(Boolean).sort().at(-1) ?? null
  return { ...r, status, masteryScore, priorityScore: r.nextReviewAt ?? '', reviewCount: r.reviewCount, lastSeenAt }
}

function byPriority(a: PatternDetail, b: PatternDetail): number {
  return a.priorityScore.localeCompare(b.priorityScore)
}

// ── Status counts ─────────────────────────────────────────────────────────────

export type StatusCounts = Record<PatternStatus, number>

export function getStatusCounts(): StatusCounts {
  const out: StatusCounts = { new: 0, learning: 0, review: 0, mastered: 0 }
  for (const r of getAllRecords()) {
    if (r.itemType !== 'pattern') continue
    out[getPatternStatus(r)]++
  }
  return out
}

// ── Review Queue ─────────────────────────────────────────────────────────────

export type ReviewQueue = {
  overdue:  PatternDetail[]
  dueToday: PatternDetail[]
  upcoming: PatternDetail[]
}

export function getReviewQueue(): ReviewQueue {
  const today = todayStr()
  const in7   = addDays(today, 7)
  const patterns = getAllRecords()
    .filter(r => r.itemType === 'pattern' && !!r.nextReviewAt)
    .map(toPatternDetail)
  return {
    overdue:  patterns.filter(r => r.nextReviewAt < today).sort(byPriority),
    dueToday: patterns.filter(r => r.nextReviewAt === today).sort(byPriority),
    upcoming: patterns
      .filter(r => r.nextReviewAt > today && r.nextReviewAt <= in7)
      .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt)),
  }
}

// ── Adaptive Scheduler ───────────────────────────────────────────────────────

export type DailyPlan = {
  items:    PatternDetail[]
  capped:   boolean
  overflow: number
  limit:    number
}

export function getDailyPlan(mode: LearningMode = DEFAULT_LEARNING_MODE): DailyPlan {
  const limit    = DAILY_LIMITS[mode]
  const q        = getReviewQueue()
  const pool     = [...q.overdue, ...q.dueToday]
  const capped   = pool.length > limit
  const overflow = Math.max(0, pool.length - limit)
  return { items: pool.slice(0, limit), capped, overflow, limit }
}

// ── Future Schedule ───────────────────────────────────────────────────────────

export type ScheduleType = 'NEW' | 'REVIEW' | 'OVERDUE'
export type ScheduledDay = { count: number; type: ScheduleType }

export function getFutureSchedule(): Record<string, ScheduledDay> {
  const today = todayStr()
  const out: Record<string, ScheduledDay> = {}
  for (const r of getAllRecords()) {
    if (r.itemType !== 'pattern' || !r.nextReviewAt || r.nextReviewAt <= today) continue
    const prev = out[r.nextReviewAt]
    if (!prev) { out[r.nextReviewAt] = { count: 1, type: 'REVIEW' } }
    else        { out[r.nextReviewAt] = { count: prev.count + 1, type: prev.type } }
  }
  return out
}

// ── Today Mission (공통 API) ──────────────────────────────────────────────────

export type TodayMission = {
  newStory:                  { id: number; title: string } | null
  inProgressStory:           { id: number; title: string; patternsDone: number; patternsTotal: number } | null
  reviewTotal:               number
  reviewedToday:             number
  patternsPracticedToday:    number
  storiesStudiedToday:       number
  estimatedMinutes:          number
  isComplete:                boolean
  mode:                      LearningMode
}

export function getTodayMission(mode: LearningMode = DEFAULT_LEARNING_MODE): TodayMission {
  const plan          = getDailyPlan(mode)
  const reviewTotal   = plan.items.length + plan.overflow
  const reviewedToday = getReviewedTodayCount()
  const patternsPracticedToday = getPracticedTodayCount()
  const storiesStudiedToday    = getStudiedTodayStoryCount()
  const dueNow        = getDueCount()

  const learnedStoryIds = new Set(
    getAllRecords()
      .filter(r => r.itemType === 'pattern' && r.repeatCount > 0)
      .map(r => r.storyId)
      .filter((id): id is number => id !== undefined),
  )
  const newStoryData = magazineStories.find(s => !learnedStoryIds.has(s.id)) ?? null
  const newStory = newStoryData ? { id: newStoryData.id, title: newStoryData.title } : null

  const patternCountByStory: Record<number, number> = {}
  for (const r of getAllRecords()) {
    if (r.itemType !== 'pattern' || r.repeatCount === 0 || !r.storyId) continue
    patternCountByStory[r.storyId] = (patternCountByStory[r.storyId] ?? 0) + 1
  }
  const inProgressData = magazineStories.find(s => {
    const done = patternCountByStory[s.id] ?? 0
    return done > 0 && done < s.patterns.length
  }) ?? null
  const inProgressStory = inProgressData
    ? { id: inProgressData.id, title: inProgressData.title, patternsDone: patternCountByStory[inProgressData.id] ?? 0, patternsTotal: inProgressData.patterns.length }
    : null

  const remainingPatterns = Math.max(0, 5 - patternsPracticedToday)
  const remainingReviews  = Math.max(0, dueNow - reviewedToday)
  const estimatedMinutes  = Math.ceil(remainingPatterns * 1 + remainingReviews * 0.5)
  const isComplete        = dueNow === 0 && patternsPracticedToday >= 5

  return { newStory, inProgressStory, reviewTotal, reviewedToday, patternsPracticedToday, storiesStudiedToday, estimatedMinutes, isComplete, mode }
}

// ── Mission Items — 오늘 해야 할 항목 순서 목록 ──────────────────────────────

export type MissionItemType = 'new_story' | 'in_progress_story' | 'review_pattern'

export type MissionItem = {
  type:       MissionItemType
  storyId:    number
  storyTitle: string
  href:       string
  done:       boolean
}

export function getMissionItems(): MissionItem[] {
  const today   = todayStr()
  const records = getAllRecords()
  const items:  MissionItem[] = []

  // ── 1. Story (새 스토리 or 진행 중 스토리) ─────────────────────────
  const learnedStoryIds = new Set(
    records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0)
      .map(r => r.storyId).filter((id): id is number => id !== undefined),
  )
  const patternCountByStory: Record<number, number> = {}
  for (const r of records) {
    if (r.itemType !== 'pattern' || !r.repeatCount || !r.storyId) continue
    patternCountByStory[r.storyId] = (patternCountByStory[r.storyId] ?? 0) + 1
  }
  const practicedTodayByStory = new Set<number>()
  for (const r of records) {
    if (r.itemType === 'pattern' && r.lastPracticedAt?.slice(0, 10) === today && r.storyId) {
      practicedTodayByStory.add(r.storyId)
    }
  }

  const inProgressData = magazineStories.find(s => {
    const done = patternCountByStory[s.id] ?? 0
    return done > 0 && done < s.patterns.length
  })
  const newStoryData = !inProgressData
    ? (magazineStories.find(s => !learnedStoryIds.has(s.id)) ?? null)
    : null
  const storyTarget = inProgressData ?? newStoryData
  if (storyTarget) {
    items.push({
      type:       inProgressData ? 'in_progress_story' : 'new_story',
      storyId:    storyTarget.id,
      storyTitle: storyTarget.title,
      href:       `/stories/${storyTarget.id}?v=p`,
      done:       practicedTodayByStory.has(storyTarget.id),
    })
  }

  // ── 2. Review items (스토리별 그룹) ────────────────────────────────
  const q = getReviewQueue()
  const reviewStoryMap = new Map<number, { title: string; done: boolean }>()
  for (const r of [...q.overdue, ...q.dueToday]) {
    const sid = r.storyId ?? 0
    if (!sid) continue
    const doneToday = r.lastReviewedAt?.slice(0, 10) === today
    if (!reviewStoryMap.has(sid)) {
      const story = magazineStories.find(s => s.id === sid)
      reviewStoryMap.set(sid, { title: story?.title ?? `Story ${sid}`, done: doneToday })
    } else if (doneToday) {
      reviewStoryMap.get(sid)!.done = true
    }
  }
  for (const [storyId, { title, done }] of reviewStoryMap) {
    items.push({ type: 'review_pattern', storyId, storyTitle: title, href: `/stories/${storyId}?v=p`, done })
  }

  return items
}

// ── Enhanced Day Detail (Calendar 상세) ──────────────────────────────────────

export type CompletedStoryDetail = {
  storyId:      number
  storyTitle:   string
  patternsDone: number
  practiceMins: number
}

export type UpcomingReview = {
  date:       string
  storyId:    number
  storyTitle: string
}

export type EnhancedDayDetail = {
  date:            string
  completed:       CompletedStoryDetail[]
  totalPracticeMs: number
  reviewedCount:   number
  due:             { storyId: number; storyTitle: string }[]
  upcoming:        UpcomingReview[]
}

export function getEnhancedDayDetail(dateStr: string): EnhancedDayDetail {
  const today   = todayStr()
  const records = getAllRecords()

  // 해당 날짜 연습한 패턴 → 스토리별 집계
  const storyPracticeMap = new Map<number, { count: number; ms: number }>()
  for (const r of records) {
    if (r.itemType !== 'pattern' || r.lastPracticedAt?.slice(0, 10) !== dateStr) continue
    const sid = r.storyId ?? 0
    if (!sid) continue
    const prev = storyPracticeMap.get(sid) ?? { count: 0, ms: 0 }
    storyPracticeMap.set(sid, { count: prev.count + 1, ms: prev.ms + (r.totalPracticeTime ?? 0) })
  }

  const completed: CompletedStoryDetail[] = []
  let totalPracticeMs = 0
  for (const [storyId, { count, ms }] of storyPracticeMap) {
    const story = magazineStories.find(s => s.id === storyId)
    if (story) { completed.push({ storyId, storyTitle: story.title, patternsDone: count, practiceMins: Math.round(ms / 60000) }); totalPracticeMs += ms }
  }

  const reviewedCount = records.filter(r => r.itemType === 'pattern' && r.lastReviewedAt?.slice(0, 10) === dateStr).length

  // Due: 오늘만 의미 있음
  const due: { storyId: number; storyTitle: string }[] = []
  if (dateStr === today) {
    const q = getReviewQueue()
    const seen = new Set<number>()
    for (const r of [...q.overdue, ...q.dueToday]) {
      const sid = r.storyId ?? 0
      if (!sid || seen.has(sid)) continue
      seen.add(sid)
      const story = magazineStories.find(s => s.id === sid)
      if (story) due.push({ storyId: sid, storyTitle: story.title })
    }
  }

  // Upcoming: 미래 복습 예정 (날짜+스토리별)
  const upcomingMap = new Map<string, Set<number>>()
  for (const r of records) {
    if (r.itemType !== 'pattern' || !r.nextReviewAt || r.nextReviewAt <= today) continue
    const sid = r.storyId ?? 0
    if (!sid) continue
    if (!upcomingMap.has(r.nextReviewAt)) upcomingMap.set(r.nextReviewAt, new Set())
    upcomingMap.get(r.nextReviewAt)!.add(sid)
  }
  const upcoming: UpcomingReview[] = []
  for (const [date, storyIds] of [...upcomingMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, 5)) {
    for (const sid of storyIds) {
      const story = magazineStories.find(s => s.id === sid)
      if (story) upcoming.push({ date, storyId: sid, storyTitle: story.title })
    }
  }

  return { date: dateStr, completed, totalPracticeMs, reviewedCount, due, upcoming }
}

// ── Story Activity (스토리별 학습 이력) ───────────────────────────────────────

export type PatternStage = {
  patternId:    string
  patternTitle: string
  status:       PatternStatus
  intervalDays: number
  reviewCount:  number
  nextReviewAt: string | null
}

export type StoryActivityData = {
  storyId:          number
  storyTitle:       string
  /** event log 기반 뷰 횟수. 이벤트 수집 전에는 0. */
  viewCount:        number
  repeatCount:      number
  reviewsCompleted: number
  lastPracticedAt:  string | null
  nextReviewAt:     string | null
  status:           PatternStatus
  stages:           PatternStage[]
}

export function getStoryActivity(storyId: number, storyTitle: string, patternIds: string[]): StoryActivityData {
  const records     = getAllRecords()
  const patternRecs = records.filter(r => r.itemType === 'pattern' && r.storyId === storyId)

  const events          = getEventsByStory(storyId)
  const viewCount       = events.filter(e => e.eventType === 'completed' || e.eventType === 'started').length
  const repeatCount     = patternRecs.reduce((s, r) => s + r.repeatCount, 0)
  const reviewsCompleted = patternRecs.reduce((s, r) => s + r.reviewCount, 0)
  const lastPracticedAt = patternRecs.map(r => r.lastPracticedAt).filter(Boolean).sort().at(-1) ?? null
  const nextReviewAt    = patternRecs.filter(r => r.nextReviewAt).map(r => r.nextReviewAt).sort().at(0) ?? null

  const statuses = patternRecs.map(r => getPatternStatus(r))
  const status: PatternStatus =
    patternRecs.length === 0                          ? 'new' :
    statuses.every(s => s === 'mastered')             ? 'mastered' :
    statuses.some(s => s === 'review' || s === 'mastered') ? 'review' :
    'learning'

  const stages: PatternStage[] = patternIds.map(pid => {
    const r = patternRecs.find(rr => rr.itemId === pid)
    return { patternId: pid, patternTitle: r?.title ?? pid, status: r ? getPatternStatus(r) : 'new', intervalDays: r?.intervalDays ?? 0, reviewCount: r?.reviewCount ?? 0, nextReviewAt: r?.nextReviewAt ?? null }
  })

  return { storyId, storyTitle, viewCount, repeatCount, reviewsCompleted, lastPracticedAt, nextReviewAt, status, stages }
}

// ── Story Progress List (Progress 화면 ●●○○○ 시각화용) ──────────────────────

export type StoryProgressItem = {
  storyId:      number
  storyTitle:   string
  dots:         number          // 0–5 (SRS 단계 기반)
  status:       PatternStatus
  nextReviewAt: string | null
}

function intervalToDots(interval: number): number {
  if (interval >= 30) return 5
  if (interval >= 14) return 4
  if (interval >= 7)  return 3
  if (interval >= 3)  return 2
  return 1  // 한 번이라도 연습한 패턴은 최소 1점
}

export function getStoryProgressList(): StoryProgressItem[] {
  const records = getAllRecords()
  const byStory = new Map<number, { minInterval: number; nextReviewAt: string | null }>()

  for (const r of records) {
    if (r.itemType !== 'pattern' || !r.storyId) continue
    const interval = r.intervalDays ?? 0
    const nra      = r.nextReviewAt ?? null
    const prev     = byStory.get(r.storyId)
    if (!prev) {
      byStory.set(r.storyId, { minInterval: interval, nextReviewAt: nra })
    } else {
      byStory.set(r.storyId, {
        minInterval: Math.min(prev.minInterval, interval),
        nextReviewAt:
          nra && (!prev.nextReviewAt || nra < prev.nextReviewAt)
            ? nra
            : prev.nextReviewAt,
      })
    }
  }

  return Array.from(byStory.entries())
    .map(([storyId, { minInterval, nextReviewAt }]) => {
      const dots: number = intervalToDots(minInterval)
      const status: PatternStatus =
        minInterval >= 30 ? 'mastered' :
        minInterval >= 7  ? 'review'   :
        minInterval >  0  ? 'learning' : 'new'
      const story = magazineStories.find(s => s.id === storyId)
      return { storyId, storyTitle: story?.title ?? `Story ${storyId}`, dots, status, nextReviewAt }
    })
    .sort((a, b) => a.storyId - b.storyId)
}

// ── Active Story Progress (Progress 화면 — 관리 중인 스토리만) ──────────────
// Mastered 완료 후 복습 일정 없는 스토리는 제외. 최대 8개.

export function getActiveStoryProgress(limit = 8): StoryProgressItem[] {
  const today = todayStr()
  const all   = getStoryProgressList()

  // 오늘 미션에 있는 storyId 집합 (우선순위 1·2)
  const missionIds = new Set(getMissionItems().map(i => i.storyId))

  // 필터: mastered + 향후 복습 없음 → 제외
  const active = all.filter(item => {
    if (item.status !== 'mastered') return true
    return item.nextReviewAt != null && item.nextReviewAt >= today
  })

  // 정렬: 미션 → 복습 예정 빠른 순 → storyId
  active.sort((a, b) => {
    const am = missionIds.has(a.storyId) ? 0 : 1
    const bm = missionIds.has(b.storyId) ? 0 : 1
    if (am !== bm) return am - bm
    const ar = a.nextReviewAt ?? '9999-99-99'
    const br = b.nextReviewAt ?? '9999-99-99'
    if (ar !== br) return ar < br ? -1 : 1
    return a.storyId - b.storyId
  })

  return active.slice(0, limit)
}

// ── Story 완료 훅 (구조 준비 — 트리거는 다음 단계에서 MagazineEngine에 연결) ─

export { onStoryComplete } from './storage'
