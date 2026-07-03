/**
 * Patto Memory Engine — 계산 레이어.
 *
 * storage.ts 가 읽기/쓰기를 담당하고,
 * 이 모듈은 SRS 데이터를 기반으로 한 파생 계산을 담당한다.
 *
 * Pattern 상태 정의 (4단계):
 *   new       — 한 번도 연습하지 않은 패턴 (repeatCount === 0 또는 레코드 없음)
 *   learning  — intervalDays < 7  (아직 단기 반복 중)
 *   review    — 7 ≤ intervalDays < 30  (장기 기억 형성 중)
 *   mastered  — intervalDays ≥ 30  (장기 기억 완성)
 *
 * Adaptive Scheduler:
 *   하루 최대 dailyLimit 개만 표시하여 학습 부담을 제한한다.
 *   밀린 복습(overdue)을 우선 처리하고, 나머지는 priorityScore 순.
 *   Light / Normal / Intensive 학습 모드와 연결 예정.
 */

import {
  getAllRecords, todayStr, addDays,
  getLearnedPatternCount, getStudiedTodayStoryCount,
  getPracticedTodayCount, getReviewedTodayCount, getDueCount,
  type LearningRecord,
} from './storage'
import { magazineStories } from '@/data/magazine-stories'

// ── 상수 ─────────────────────────────────────────────────────────────────────

export const STATUS_THRESHOLDS = {
  review:   7,   // intervalDays >= 7  → review
  mastered: 30,  // intervalDays >= 30 → mastered
} as const

/** 학습 모드별 하루 최대 복습 수. Light/Normal/Intensive 연결 예정. */
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

// ── PatternDetail — 향후 Adaptive Scheduler에서 사용할 확장 구조 ──────────────

export type PatternDetail = LearningRecord & {
  status: PatternStatus

  /**
   * 숙달도 점수 (0–100).
   * 향후 correctCount / (correctCount + wrongCount) × intervalDays 가중치 등으로 고도화 예정.
   * 현재는 intervalDays 기반 단순 추정.
   */
  masteryScore: number

  /**
   * 복습 우선순위 점수. 낮을수록 먼저 복습.
   * 향후 overdue 경과일, wrongCount, masteryScore 를 조합해 고도화 예정.
   * 현재는 nextReviewAt 문자열 사전순 → 오래된 것 우선.
   */
  priorityScore: number

  /** LearningRecord.reviewCount 를 그대로 노출 (호출부 편의) */
  reviewCount: number

  /** 마지막으로 학습/복습한 시각 (lastPracticedAt || lastReviewedAt 중 최신) */
  lastSeenAt: string | null
}

function toPatternDetail(r: LearningRecord): PatternDetail {
  const status = getPatternStatus(r)

  // masteryScore: interval 기반 단순 추정 (0–100). 추후 고도화 예정.
  const masteryScore = Math.min(100, Math.round((r.intervalDays / STATUS_THRESHOLDS.mastered) * 100))

  // priorityScore: nextReviewAt 사전순 (ISO 날짜 → 작을수록 우선순위 높음).
  // 추후 overdue 경과일, wrongCount 가중치 추가 예정.
  const priorityScore = r.nextReviewAt ? r.nextReviewAt.localeCompare('0') : 0

  const lastSeenAt = [r.lastPracticedAt, r.lastReviewedAt]
    .filter(Boolean)
    .sort()
    .at(-1) ?? null

  return {
    ...r,
    status,
    masteryScore,
    priorityScore: r.nextReviewAt ? r.nextReviewAt : '',
    reviewCount:   r.reviewCount,
    lastSeenAt,
  } as unknown as PatternDetail
}

// priorityScore 오름차순 정렬 (낮을수록 먼저)
function byPriority(a: PatternDetail, b: PatternDetail): number {
  return String(a.priorityScore).localeCompare(String(b.priorityScore))
}

// ── Status counts ─────────────────────────────────────────────────────────────

export type StatusCounts = Record<PatternStatus, number>

export function getStatusCounts(): StatusCounts {
  const learned = getAllRecords().filter(r => r.itemType === 'pattern')
  // total practiced = learned records count
  const out: StatusCounts = { new: 0, learning: 0, review: 0, mastered: 0 }
  for (const r of learned) {
    out[getPatternStatus(r)]++
  }
  return out
}

// ── Review Queue ─────────────────────────────────────────────────────────────

export type ReviewQueue = {
  overdue:  PatternDetail[]   // nextReviewAt < 오늘, priorityScore 정렬
  dueToday: PatternDetail[]   // nextReviewAt === 오늘, priorityScore 정렬
  upcoming: PatternDetail[]   // 오늘 이후 7일 이내 예정, 날짜순
}

export function getReviewQueue(): ReviewQueue {
  const today = todayStr()
  const in7   = addDays(today, 7)
  const patterns = getAllRecords()
    .filter(r => r.itemType === 'pattern' && !!r.nextReviewAt)
    .map(toPatternDetail)

  return {
    overdue:  patterns
      .filter(r => r.nextReviewAt < today)
      .sort(byPriority),
    dueToday: patterns
      .filter(r => r.nextReviewAt === today)
      .sort(byPriority),
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
  const limit = DAILY_LIMITS[mode]
  const q     = getReviewQueue()
  const pool  = [...q.overdue, ...q.dueToday]     // 이미 priorityScore 정렬됨
  const capped   = pool.length > limit
  const overflow = Math.max(0, pool.length - limit)
  return {
    items: pool.slice(0, limit),
    capped,
    overflow,
    limit,
  }
}

// ── Future Schedule ───────────────────────────────────────────────────────────

export type ScheduleType = 'NEW' | 'REVIEW' | 'OVERDUE'

export type ScheduledDay = {
  count: number
  type:  ScheduleType   // 대표 타입 (OVERDUE > REVIEW > NEW 우선순위)
}

/** 날짜(YYYY-MM-DD) → 해당 날 예정된 복습 정보 (오늘 이후 미래만) */
export function getFutureSchedule(): Record<string, ScheduledDay> {
  const today = todayStr()
  const out: Record<string, ScheduledDay> = {}

  for (const r of getAllRecords()) {
    if (r.itemType !== 'pattern' || !r.nextReviewAt || r.nextReviewAt <= today) continue

    const prev = out[r.nextReviewAt]

    // 타입 결정: 향후 날짜이므로 현재는 REVIEW만 가능.
    // NEW (신규 추가 예정 스토리) / OVERDUE (연쇄 밀림) 타입은 추후 Scheduler 고도화 시 활용.
    const type: ScheduleType = 'REVIEW'

    if (!prev) {
      out[r.nextReviewAt] = { count: 1, type }
    } else {
      out[r.nextReviewAt] = { count: prev.count + 1, type: prev.type }
    }
  }

  return out
}

// ── Today Mission (공통 API) ──────────────────────────────────────────────────

export type TodayMission = {
  /** 오늘 학습할 New Story (아직 패턴 연습을 시작하지 않은 첫 스토리) */
  newStory: { id: number; title: string } | null

  /**
   * 이어서 진행 중인 스토리 (패턴 일부만 완료).
   * 향후 자동 완료 트리거 연결 후 정확도 향상 예정.
   */
  inProgressStory: { id: number; title: string; patternsDone: number; patternsTotal: number } | null

  /** 오늘 복습 대상 패턴 수 (overdue + dueToday, cap 적용 전) */
  reviewTotal: number

  /** 오늘 완료한 복습 수 */
  reviewedToday: number

  /** 오늘 연습한 패턴 수 */
  patternsPracticedToday: number

  /** 오늘 학습한 스토리 수 */
  storiesStudiedToday: number

  /** 예상 소요 시간(분). 패턴 1개 ≈ 1분, 복습 1개 ≈ 0.5분 기준 추정. */
  estimatedMinutes: number

  /** 오늘 미션 완료 여부 (모든 due 복습 완료 + 패턴 5개 이상 연습) */
  isComplete: boolean

  /** 학습 모드 */
  mode: LearningMode
}

export function getTodayMission(mode: LearningMode = DEFAULT_LEARNING_MODE): TodayMission {
  const plan          = getDailyPlan(mode)
  const reviewTotal   = plan.items.length + plan.overflow
  const reviewedToday = getReviewedTodayCount()
  const patternsPracticedToday = getPracticedTodayCount()
  const storiesStudiedToday    = getStudiedTodayStoryCount()
  const dueNow        = getDueCount()

  // New Story: 한 번도 패턴 연습을 시작하지 않은 첫 스토리
  const learnedStoryIds = new Set(
    getAllRecords()
      .filter(r => r.itemType === 'pattern' && r.repeatCount > 0)
      .map(r => r.storyId)
      .filter((id): id is number => id !== undefined),
  )
  const newStoryData = magazineStories.find(s => !learnedStoryIds.has(s.id)) ?? null
  const newStory = newStoryData
    ? { id: newStoryData.id, title: newStoryData.title }
    : null

  // In-progress Story: 패턴 일부만 완료한 스토리
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
    ? {
        id:            inProgressData.id,
        title:         inProgressData.title,
        patternsDone:  patternCountByStory[inProgressData.id] ?? 0,
        patternsTotal: inProgressData.patterns.length,
      }
    : null

  // 예상 소요 시간: 패턴 연습 1개 ≈ 1분, 복습 1개 ≈ 0.5분
  const remainingPatterns = Math.max(0, 5 - patternsPracticedToday)
  const remainingReviews  = Math.max(0, dueNow - reviewedToday)
  const estimatedMinutes  = Math.ceil(remainingPatterns * 1 + remainingReviews * 0.5)

  const isComplete = dueNow === 0 && patternsPracticedToday >= 5

  return {
    newStory,
    inProgressStory,
    reviewTotal,
    reviewedToday,
    patternsPracticedToday,
    storiesStudiedToday,
    estimatedMinutes,
    isComplete,
    mode,
  }
}

// ── Story 완료 훅 (구조 준비 — 트리거는 다음 단계에서 MagazineEngine에 연결) ─

/**
 * Story 완료 기록.
 * 호출 조건(체류 시간, 스크롤, 오디오 재생률 등)은 호출자(MagazineEngine)가 판단한다.
 * 이 함수는 순수하게 "완료 사실"만 받아서 기록한다.
 *
 * @example
 * // MagazineEngine에서 조건 충족 시:
 * import { onStoryComplete } from '@/lib/srs/engine'
 * onStoryComplete(story.id, story.title)
 */
export { onStoryComplete } from './storage'
