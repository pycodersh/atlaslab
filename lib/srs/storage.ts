/**
 * SRS (간격 반복) 학습 기록 — 게스트: localStorage
 *
 * PATTO 복습의 단일 진실 공급원(single source of truth).
 * 패턴/스토리 학습·복습 기록을 저장하고, 간단한 SRS 규칙으로 다음 복습일을 계산한다.
 *
 * SRS 규칙(단순):
 *   - 첫 학습 후 nextReviewAt = 다음날 (intervalDays = 1)
 *   - "알겠어"  → intervalDays *= 2  (1→2→4→8→16…), nextReviewAt = 오늘 + intervalDays
 *   - "모르겠어" → intervalDays = 1,  nextReviewAt = 오늘 + 1
 *
 * 향후 Supabase 동기화 시 이 모듈만 교체하면 된다.
 */

export type SrsItemType = 'story' | 'pattern'

export type LearningRecord = {
  itemId: string
  itemType: SrsItemType
  title: string
  intervalDays: number
  nextReviewAt: string            // YYYY-MM-DD
  reviewCount: number
  correctCount: number
  wrongCount: number
  lastReviewedAt: string | null   // ISO
  repeatCount: number             // 연습(따라 읽기) 반복 횟수
  lastPracticedAt: string | null  // ISO
  totalPracticeTime: number       // ms
  firstLearnedAt: string          // ISO
}

const KEY = 'patto-srs-records'
const ACTIVITY_KEY = 'patto-srs-activity'

// ── 날짜 헬퍼 ───────────────────────────────────────────────────────────────
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function keyOf(itemType: SrsItemType, itemId: string) {
  return `${itemType}:${itemId}`
}

// ── 저장소 ──────────────────────────────────────────────────────────────────
function readAll(): Record<string, LearningRecord> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeAll(map: Record<string, LearningRecord>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(map))
}

// ── 일별 활동 로그 (최근 7일 그래프용) ──────────────────────────────────────
function logActivity() {
  if (typeof window === 'undefined') return
  let map: Record<string, number> = {}
  try { map = JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '{}') } catch {}
  const t = todayStr()
  map[t] = (map[t] ?? 0) + 1
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(map))
}

export function getLast7Days(): { date: string; label: string; count: number }[] {
  let map: Record<string, number> = {}
  if (typeof window !== 'undefined') {
    try { map = JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '{}') } catch {}
  }
  const out: { date: string; label: string; count: number }[] = []
  const base = new Date()
  const labels = ['일', '월', '화', '수', '목', '금', '토']
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(base.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    out.push({ date, label: labels[d.getDay()], count: map[date] ?? 0 })
  }
  return out
}

// ── 조회 ────────────────────────────────────────────────────────────────────
export function getAllRecords(): LearningRecord[] {
  return Object.values(readAll())
}

export function getRecord(itemType: SrsItemType, itemId: string): LearningRecord | null {
  return readAll()[keyOf(itemType, itemId)] ?? null
}

/** 오늘까지 복습 예정인 항목 (nextReviewAt <= 오늘), 빠른 순 */
export function getDueItems(): LearningRecord[] {
  const t = todayStr()
  return getAllRecords()
    .filter((r) => r.nextReviewAt <= t)
    .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt))
}

/** 복습 대기 총 개수 (오늘 이하) */
export function getDueCount(): number {
  return getDueItems().length
}

/** 오늘 예정 (nextReviewAt === 오늘) */
export function getTodayDueCount(): number {
  const t = todayStr()
  return getAllRecords().filter((r) => r.nextReviewAt === t).length
}

/** 밀린 복습 (nextReviewAt < 오늘) */
export function getOverdueCount(): number {
  const t = todayStr()
  return getAllRecords().filter((r) => r.nextReviewAt < t).length
}

// ── 통계 ────────────────────────────────────────────────────────────────────
export function getLearnedPatternCount(): number {
  return getAllRecords().filter((r) => r.itemType === 'pattern').length
}

export function getLearnedStoryCount(): number {
  return getAllRecords().filter((r) => r.itemType === 'story').length
}

/** 누적 반복 횟수 (패턴 연습 기준) */
export function getTotalRepeatCount(): number {
  return getAllRecords()
    .filter((r) => r.itemType === 'pattern')
    .reduce((sum, r) => sum + r.repeatCount, 0)
}

// ── 기록 ────────────────────────────────────────────────────────────────────
function blankRecord(
  itemId: string,
  itemType: SrsItemType,
  title: string,
): LearningRecord {
  const now = new Date().toISOString()
  return {
    itemId,
    itemType,
    title,
    intervalDays: 1,
    nextReviewAt: addDays(todayStr(), 1), // 첫 학습 후 다음날 복습
    reviewCount: 0,
    correctCount: 0,
    wrongCount: 0,
    lastReviewedAt: null,
    repeatCount: 0,
    lastPracticedAt: null,
    totalPracticeTime: 0,
    firstLearnedAt: now,
  }
}

/** 패턴/스토리 학습 기록을 보장 (없으면 첫 학습으로 생성) */
function ensureRecord(
  map: Record<string, LearningRecord>,
  itemId: string,
  itemType: SrsItemType,
  title: string,
): LearningRecord {
  const k = keyOf(itemType, itemId)
  if (!map[k]) map[k] = blankRecord(itemId, itemType, title)
  return map[k]
}

/**
 * 패턴 1회 연습(따라 읽기) 완료 기록.
 * - 첫 연습이면 SRS 스케줄을 생성(다음날 복습)
 * - 소속 스토리도 첫 연습 시 복습 대상으로 등록
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
  rec.repeatCount += 1
  rec.lastPracticedAt = now
  rec.totalPracticeTime += Math.max(0, durationMs)

  // 소속 스토리도 복습 대상으로 등록 (첫 연습 시 생성)
  ensureRecord(map, String(storyId), 'story', storyTitle)

  writeAll(map)
  logActivity()
  return rec
}

/**
 * 복습 결과 적용 (SRS 규칙).
 * @param correct true="알겠어", false="모르겠어"
 */
export function applyReview(
  itemType: SrsItemType,
  itemId: string,
  correct: boolean,
): LearningRecord | null {
  const map = readAll()
  const k = keyOf(itemType, itemId)
  const rec = map[k]
  if (!rec) return null

  rec.reviewCount += 1
  rec.lastReviewedAt = new Date().toISOString()

  if (correct) {
    rec.correctCount += 1
    rec.intervalDays = Math.max(1, rec.intervalDays) * 2 // 1→2→4→8→16…
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
