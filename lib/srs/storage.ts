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
  storyId?: number                // 패턴이 속한 스토리 (pattern 레코드)
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
  return localDateStr()
}

/** 로컬 타임존 기준 날짜 문자열 (YYYY-MM-DD) — 활동/캘린더/스트릭용 */
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
  const t = localDateStr()
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
    const date = localDateStr(d)
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

// 복습은 Pattern 중심 — 큐/카운트는 pattern 레코드만 대상
/** 오늘까지 복습 예정인 패턴 (nextReviewAt <= 오늘). 이미 오늘 복습한 항목은 nextReviewAt이 미래로 이동해 자동 제외 */
export function getDueItems(): LearningRecord[] {
  const t = todayStr()
  return getAllRecords()
    .filter((r) => r.itemType === 'pattern' && r.nextReviewAt <= t)
    .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt))
}

/** 복습 대기 총 개수 (오늘 이하) */
export function getDueCount(): number {
  return getDueItems().length
}

/** 오늘 예정 (nextReviewAt === 오늘) */
export function getTodayDueCount(): number {
  const t = todayStr()
  return getAllRecords().filter((r) => r.itemType === 'pattern' && r.nextReviewAt === t).length
}

/** 밀린 복습 (nextReviewAt < 오늘) */
export function getOverdueCount(): number {
  const t = todayStr()
  return getAllRecords().filter((r) => r.itemType === 'pattern' && r.nextReviewAt < t).length
}

/** 스토리별 연습 완료 패턴 수 (진행 중 스토리 판단용) */
export function getPracticedPatternCountByStory(): Record<number, number> {
  const out: Record<number, number> = {}
  for (const r of getAllRecords()) {
    if (r.itemType !== 'pattern') continue
    const sid = r.storyId ?? Number((r.itemId.match(/^pt(\d+)-/) ?? [])[1])
    if (sid) out[sid] = (out[sid] ?? 0) + 1
  }
  return out
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

/** 총 낭독(연습) 시간 합계 (ms) */
export function getTotalPracticeMs(): number {
  return getAllRecords().reduce((sum, r) => sum + (r.totalPracticeTime || 0), 0)
}

/** 일별 활동 수 (Learning Calendar용) — 실제 활동 로그 기반 */
export function getActivityByDate(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '{}')
  } catch {
    return {}
  }
}

/** 연속 학습일(streak) — 오늘(또는 어제)부터 거꾸로 활동이 있는 날 수 */
export function getStreak(): number {
  const map = getActivityByDate()
  const has = (d: Date) => (map[localDateStr(d)] ?? 0) > 0
  const cursor = new Date()
  // 오늘 활동이 없으면 어제부터 카운트 시작 (오늘은 아직 안 했을 수 있음)
  if (!has(cursor)) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (has(cursor)) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** 오늘 연습한 패턴 수 (lastPracticedAt === 오늘) */
export function getPracticedTodayCount(): number {
  const t = todayStr()
  return getAllRecords().filter(
    (r) => r.itemType === 'pattern' && r.lastPracticedAt?.slice(0, 10) === t,
  ).length
}

/** 오늘 학습한 (서로 다른) 스토리 수 — 오늘 연습한 패턴이 속한 스토리 기준 */
export function getStudiedTodayStoryCount(): number {
  const t = todayStr()
  const stories = new Set<string>()
  for (const r of getAllRecords()) {
    if (r.itemType !== 'pattern' || r.lastPracticedAt?.slice(0, 10) !== t) continue
    const m = r.itemId.match(/^pt(\d+)-/) // pt{story}-{n}
    if (m) stories.add(m[1])
  }
  return stories.size
}

/** 오늘 복습 완료 수 (lastReviewedAt === 오늘) */
export function getReviewedTodayCount(): number {
  const t = todayStr()
  return getAllRecords().filter((r) => r.lastReviewedAt?.slice(0, 10) === t).length
}

/** 특정 날짜의 학습 상세 (캘린더 탭용) */
export function getDailyStats(dateStr: string): { stories: number; patterns: number; reviews: number } {
  const records = getAllRecords()
  const storySet = new Set<string>()
  let patterns = 0
  let reviews = 0
  for (const r of records) {
    if (r.lastPracticedAt?.slice(0, 10) === dateStr && r.itemType === 'pattern') {
      patterns++
      const m = r.itemId.match(/^pt(\d+)-/)
      if (m) storySet.add(m[1])
    }
    if (r.lastReviewedAt?.slice(0, 10) === dateStr) reviews++
  }
  return { stories: storySet.size, patterns, reviews }
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
  rec.storyId = storyId
  rec.repeatCount += 1
  rec.lastPracticedAt = now
  rec.totalPracticeTime += Math.max(0, durationMs)

  // 소속 스토리도 학습 기록으로 등록 (학습한 스토리 카운트용 — 복습 큐에는 미포함)
  ensureRecord(map, String(storyId), 'story', storyTitle)

  writeAll(map)
  logActivity()
  return rec
}

/**
 * Story 완료 기록 훅.
 * 완료 판정 조건(체류 시간, 스크롤, 오디오 재생률 등)은 호출자가 판단한다.
 * engine.ts 의 onStoryComplete 가 이 함수를 re-export 한다.
 */
export function onStoryComplete(storyId: number, storyTitle: string): LearningRecord {
  const map = readAll()
  const rec = ensureRecord(map, String(storyId), 'story', storyTitle)
  rec.lastPracticedAt = new Date().toISOString()
  writeAll(map)
  logActivity()
  return rec
}

// ── Learning Event Log ───────────────────────────────────────────────────────
// 학습 이력을 날짜별로 추적한다. 향후 MagazineEngine에서 started/completed 이벤트를 emit.

export type LearningEventType = 'started' | 'completed' | 'reviewed'

export type LearningEvent = {
  id:                  string
  storyId:             number
  patternIds?:         string[]
  eventType:           LearningEventType
  /** SRS interval 변화 전 (reviewed 이벤트) */
  reviewStageBefore?:  number
  /** SRS interval 변화 후 (reviewed 이벤트) */
  reviewStageAfter?:   number
  createdAt:           string    // ISO
  durationMs?:         number
  nextReviewAt?:       string    // YYYY-MM-DD
}

const EVENTS_KEY = 'patto-srs-events'

function readEvents(): LearningEvent[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]') } catch { return [] }
}
function writeEvents(events: LearningEvent[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

export function recordLearningEvent(
  event: Omit<LearningEvent, 'id' | 'createdAt'>,
): LearningEvent {
  const ev: LearningEvent = {
    ...event,
    id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  }
  const all = readEvents()
  all.push(ev)
  writeEvents(all)
  return ev
}

export function getEventsByDate(dateStr: string): LearningEvent[] {
  return readEvents().filter(e => e.createdAt.slice(0, 10) === dateStr)
}

export function getEventsByStory(storyId: number): LearningEvent[] {
  return readEvents().filter(e => e.storyId === storyId)
}

export function getAllEvents(): LearningEvent[] {
  return readEvents()
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
