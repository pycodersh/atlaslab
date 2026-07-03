/**
 * Patto Memory Engine — 계산 레이어.
 *
 * storage.ts 가 읽기/쓰기를 담당하고,
 * 이 모듈은 SRS 데이터를 기반으로 한 파생 계산을 담당한다.
 *
 * Pattern 상태 정의:
 *   learning  — intervalDays < 7  (아직 단기 반복 중)
 *   review    — 7 ≤ intervalDays < 30  (장기 기억 형성 중)
 *   mastered  — intervalDays ≥ 30  (장기 기억 완성)
 *
 * Adaptive Scheduler:
 *   하루 최대 MAX_DAILY_REVIEW 개만 표시하여 학습 부담을 제한한다.
 *   밀린 복습(overdue)을 우선 처리하고, 나머지는 dueToday 순서로.
 */

import { getAllRecords, todayStr, addDays, type LearningRecord } from './storage'

// ── Status 기준값 ────────────────────────────────────────────────────────────

export const STATUS_THRESHOLDS = {
  review:   7,   // intervalDays >= 7  → review
  mastered: 30,  // intervalDays >= 30 → mastered
} as const

export const MAX_DAILY_REVIEW = 5

// ── Pattern 상태 ─────────────────────────────────────────────────────────────

export type PatternStatus = 'learning' | 'review' | 'mastered'

export function getPatternStatus(intervalDays: number): PatternStatus {
  if (intervalDays >= STATUS_THRESHOLDS.mastered) return 'mastered'
  if (intervalDays >= STATUS_THRESHOLDS.review)   return 'review'
  return 'learning'
}

export type StatusCounts = Record<PatternStatus, number>

export function getStatusCounts(): StatusCounts {
  const out: StatusCounts = { learning: 0, review: 0, mastered: 0 }
  for (const r of getAllRecords()) {
    if (r.itemType !== 'pattern') continue
    out[getPatternStatus(r.intervalDays)]++
  }
  return out
}

// ── Review Queue ─────────────────────────────────────────────────────────────

export type ReviewQueue = {
  overdue:  LearningRecord[]   // nextReviewAt < 오늘
  dueToday: LearningRecord[]   // nextReviewAt === 오늘
  upcoming: LearningRecord[]   // 오늘 이후 7일 이내 예정
}

export function getReviewQueue(): ReviewQueue {
  const today = todayStr()
  const in7   = addDays(today, 7)
  const patterns = getAllRecords()
    .filter(r => r.itemType === 'pattern' && !!r.nextReviewAt)

  return {
    overdue:  patterns
      .filter(r => r.nextReviewAt < today)
      .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt)),
    dueToday: patterns
      .filter(r => r.nextReviewAt === today),
    upcoming: patterns
      .filter(r => r.nextReviewAt > today && r.nextReviewAt <= in7)
      .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt)),
  }
}

// ── Adaptive Scheduler ───────────────────────────────────────────────────────

export type DailyPlan = {
  items:    LearningRecord[]
  capped:   boolean   // MAX_DAILY_REVIEW 초과 여부
  overflow: number    // 초과된 항목 수 (내일 이후로 밀린 것)
}

export function getDailyPlan(): DailyPlan {
  const q    = getReviewQueue()
  const pool = [...q.overdue, ...q.dueToday]
  const capped   = pool.length > MAX_DAILY_REVIEW
  const overflow = Math.max(0, pool.length - MAX_DAILY_REVIEW)
  return {
    items: pool.slice(0, MAX_DAILY_REVIEW),
    capped,
    overflow,
  }
}

// ── Future Schedule (Memory Calendar용) ─────────────────────────────────────

/** 날짜(YYYY-MM-DD) → 해당 날 예정된 복습 수 (오늘 이후 미래만) */
export function getFutureSchedule(): Record<string, number> {
  const today = todayStr()
  const out: Record<string, number> = {}
  for (const r of getAllRecords()) {
    if (r.itemType === 'pattern' && r.nextReviewAt > today) {
      out[r.nextReviewAt] = (out[r.nextReviewAt] ?? 0) + 1
    }
  }
  return out
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
