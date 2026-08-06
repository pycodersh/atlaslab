/**
 * K-PATTO 전용 SRS localStorage 모듈
 *
 * 키:
 *   kpatto-srs-records   — SRS 학습 레코드 (patto-srs-records와 분리)
 *   kpatto-srs-activity  — 일별 활동 카운터 (streak 전용)
 *   kpatto-srs-events    — 이벤트 로그
 *
 * 마이그레이션 (최초 1회, kpatto-srs-migrated 플래그로 관리):
 *   patto-srs-records에서 itemId가 kp-로 시작하는 패턴 레코드만 복사.
 *   story·activity·events 레코드는 구분 불가 → 이전 안 함.
 *   로그인 사용자의 에피소드 완료는 kp_episode_progress(DB)가 정본.
 */

// ── 타입 + 순수 유틸리티 재사용 ─────────────────────────────────────────────
export type { LearningRecord, SrsItemType, LearningEvent, LearningEventType } from '@/lib/srs/storage'
export { localDateStr, addDays, todayStr } from '@/lib/srs/storage'

import type { LearningRecord, LearningEvent } from '@/lib/srs/storage'
import { todayStr, addDays, localDateStr } from '@/lib/srs/storage'

// ── 키 상수 ──────────────────────────────────────────────────────────────────
const KEY          = 'kpatto-srs-records'
const ACTIVITY_KEY = 'kpatto-srs-activity'
const EVENTS_KEY   = 'kpatto-srs-events'
const MIGRATED_KEY = 'kpatto-srs-migrated'
const PATTO_KEY    = 'patto-srs-records'   // 마이그레이션 소스 (읽기 전용)

// ── 마이그레이션 (최초 1회) ───────────────────────────────────────────────────
function runMigrationIfNeeded(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(MIGRATED_KEY) === '1') return

  try {
    const raw = localStorage.getItem(PATTO_KEY)
    if (raw) {
      const oldMap = JSON.parse(raw) as Record<string, LearningRecord>
      const toMigrate: Record<string, LearningRecord> = {}

      for (const [k, rec] of Object.entries(oldMap)) {
        // kp- 접두사 패턴 레코드만 이전
        if (rec.itemType === 'pattern' && rec.itemId.startsWith('kp-')) {
          toMigrate[k] = rec
        }
      }

      if (Object.keys(toMigrate).length > 0) {
        // 기존 kpatto 데이터가 있으면 우선 보존 (덮어쓰지 않음)
        const existing = readAllRaw()
        localStorage.setItem(KEY, JSON.stringify({ ...toMigrate, ...existing }))
      }
    }
  } catch { /* noop — 마이그레이션 실패 시 새로 시작 */ }

  localStorage.setItem(MIGRATED_KEY, '1')
}

// ── 저장소 ───────────────────────────────────────────────────────────────────
function readAllRaw(): Record<string, LearningRecord> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch { return {} }
}

function readAll(): Record<string, LearningRecord> {
  runMigrationIfNeeded()
  return readAllRaw()
}

function writeAll(map: Record<string, LearningRecord>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(map))
}

// ── 활동 로그 ─────────────────────────────────────────────────────────────────
function logActivity(): void {
  if (typeof window === 'undefined') return
  let map: Record<string, number> = {}
  try { map = JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '{}') } catch {}
  const t = localDateStr()
  map[t] = (map[t] ?? 0) + 1
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(map))
}

export function getActivityByDate(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '{}')
  } catch { return {} }
}

// ── Streak ────────────────────────────────────────────────────────────────────
export function getStreak(): number {
  const map = getActivityByDate()
  const has = (d: Date) => (map[localDateStr(d)] ?? 0) > 0
  const cursor = new Date()
  // 오늘 활동 없으면 어제부터 카운트 (오늘 아직 안 했을 수 있음)
  if (!has(cursor)) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (has(cursor)) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// ── 조회 ─────────────────────────────────────────────────────────────────────
export function getAllRecords(): LearningRecord[] {
  return Object.values(readAll())
}

export function getRecord(
  itemType: 'story' | 'pattern',
  itemId: string,
): LearningRecord | null {
  return readAll()[`${itemType}:${itemId}`] ?? null
}

/**
 * 오늘까지 복습 예정인 K-PATTO 패턴.
 * kp- 접두사를 명시적으로 필터링 → patto 패턴 레코드 혼입 차단.
 */
export function getDueItems(): LearningRecord[] {
  const t = todayStr()
  return getAllRecords()
    .filter(
      r => r.itemType === 'pattern'
        && r.itemId.startsWith('kp-')
        && r.nextReviewAt <= t,
    )
    .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt))
}

/** 오늘 연습한 패턴 수 */
export function getPracticedTodayCount(): number {
  const t = todayStr()
  return getAllRecords().filter(
    r => r.itemType === 'pattern' && r.lastPracticedAt?.slice(0, 10) === t,
  ).length
}

// ── 레코드 생성 헬퍼 ─────────────────────────────────────────────────────────
function blankRecord(
  itemId: string,
  itemType: 'story' | 'pattern',
  title: string,
): LearningRecord {
  const now = new Date().toISOString()
  return {
    itemId, itemType, title,
    intervalDays: 1,
    nextReviewAt: addDays(todayStr(), 1),
    reviewCount: 0, correctCount: 0, wrongCount: 0,
    lastReviewedAt: null,
    repeatCount: 0, lastPracticedAt: null, totalPracticeTime: 0,
    firstLearnedAt: now,
  }
}

function ensureRecord(
  map: Record<string, LearningRecord>,
  itemId: string,
  itemType: 'story' | 'pattern',
  title: string,
): LearningRecord {
  const k = `${itemType}:${itemId}`
  if (!map[k]) map[k] = blankRecord(itemId, itemType, title)
  return map[k]
}

// ── 기록 ─────────────────────────────────────────────────────────────────────

/**
 * 에피소드(스토리) 완료 기록.
 * story/[id]/page.tsx의 handleChallengeComplete에서 호출.
 * 로그인 사용자의 정본은 kp_episode_progress(DB) — 이 함수는 streak/활동 용도.
 */
export function onStoryComplete(storyId: number, storyTitle: string): LearningRecord {
  const map = readAll()
  const rec = ensureRecord(map, String(storyId), 'story', storyTitle)
  rec.lastPracticedAt = new Date().toISOString()
  writeAll(map)
  logActivity()
  return rec
}

/**
 * 패턴 연습 기록 (향후 K-PATTO SRS 확장 시 사용).
 * patternId는 반드시 kp- 접두사 형식이어야 함.
 */
export function recordPatternPractice(
  patternId: string,
  storyId: number,
  patternTitle: string,
  storyTitle: string,
  durationMs = 0,
): LearningRecord {
  const map = readAll()
  const now = new Date().toISOString()

  const rec = ensureRecord(map, patternId, 'pattern', patternTitle)
  rec.storyId = storyId
  rec.repeatCount += 1
  rec.lastPracticedAt = now
  rec.totalPracticeTime += Math.max(0, durationMs)

  ensureRecord(map, String(storyId), 'story', storyTitle)
  writeAll(map)
  logActivity()
  return rec
}

/** SRS 복습 결과 적용 */
export function applyReview(
  itemType: 'story' | 'pattern',
  itemId: string,
  correct: boolean,
): LearningRecord | null {
  const map = readAll()
  const k = `${itemType}:${itemId}`
  const rec = map[k]
  if (!rec) return null

  rec.reviewCount += 1
  rec.lastReviewedAt = new Date().toISOString()

  if (correct) {
    rec.correctCount += 1
    rec.intervalDays = Math.max(1, rec.intervalDays) * 2
  } else {
    rec.wrongCount += 1
    rec.intervalDays = 1
  }
  rec.nextReviewAt = addDays(todayStr(), rec.intervalDays)

  map[k] = rec
  writeAll(map)
  logActivity()
  return rec
}

// ── 이벤트 로그 ───────────────────────────────────────────────────────────────
function readEvents(): LearningEvent[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]')
  } catch { return [] }
}

function writeEvents(events: LearningEvent[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

export function recordLearningEvent(
  event: Omit<LearningEvent, 'id' | 'createdAt'>,
): LearningEvent {
  const ev: LearningEvent = {
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  }
  const all = readEvents()
  all.push(ev)
  writeEvents(all)
  return ev
}

export function getAllEvents(): LearningEvent[] {
  return readEvents()
}
