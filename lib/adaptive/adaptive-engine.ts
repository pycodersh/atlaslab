/**
 * Adaptive Engine — classifies the learner and controls trainer behaviour.
 * localStorage is the source of truth; Supabase syncs asynchronously.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type LearnerLevel = 'beginner' | 'developing' | 'intermediate' | 'advanced'

export interface UserLearningStats {
  visitCount: number
  totalSessions: number
  totalPatternsLearned: number
  currentStreak: number
  longestStreak: number
  avgResponseTime: number         // ms
  challengeCorrectRate: number    // 0–1
  lastSessionAt: string | null    // ISO date (YYYY-MM-DD)
  lastVisitAt: string | null      // ISO date
  weakPatterns: string[]
  patternCorrectCounts: Record<string, number>  // patternId → consecutive correct count
  streakBroken: boolean           // true when streak just broke this session
  firstChallengeComplete: boolean // true after first challenge ever
}

export type TrainerIntensity = 'full' | 'moderate' | 'minimal' | 'silent'

// ── localStorage ───────────────────────────────────────────────────────────────

const LS_KEY = 'patto_learning_stats'

const DEFAULT_STATS: UserLearningStats = {
  visitCount: 0,
  totalSessions: 0,
  totalPatternsLearned: 0,
  currentStreak: 0,
  longestStreak: 0,
  avgResponseTime: 4000,
  challengeCorrectRate: 1,
  lastSessionAt: null,
  lastVisitAt: null,
  weakPatterns: [],
  patternCorrectCounts: {},
  streakBroken: false,
  firstChallengeComplete: false,
}

export function loadStats(): UserLearningStats {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { ...DEFAULT_STATS }
    return { ...DEFAULT_STATS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

export function saveStats(stats: UserLearningStats): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(stats)) } catch {}
}

export function updateStats(patch: Partial<UserLearningStats>): UserLearningStats {
  const next = { ...loadStats(), ...patch }
  saveStats(next)
  return next
}

// ── Level classification ────────────────────────────────────────────────────────

export function getLearnerLevel(stats: UserLearningStats): LearnerLevel {
  const { totalSessions, challengeCorrectRate } = stats
  if (totalSessions < 5) return 'beginner'
  if (totalSessions < 20 && challengeCorrectRate < 0.7) return 'developing'
  if (totalSessions <= 50) return 'intermediate'
  return 'advanced'
}

// ── Trainer intensity ──────────────────────────────────────────────────────────

export function getTrainerIntensity(level: LearnerLevel): TrainerIntensity {
  switch (level) {
    case 'beginner':     return 'full'
    case 'developing':   return 'moderate'
    case 'intermediate': return 'minimal'
    case 'advanced':     return 'silent'
  }
}

// ── Pace adaptation ────────────────────────────────────────────────────────────

export function getSlideDelay(stats: UserLearningStats): number {
  const { avgResponseTime } = stats
  if (avgResponseTime < 3000) return 500
  if (avgResponseTime > 7000) return 1500
  return 1000
}

// ── Weak pattern detection ─────────────────────────────────────────────────────

export function recordPatternResult(patternId: string, correct: boolean): void {
  const stats = loadStats()
  const weak = [...stats.weakPatterns]
  const counts = { ...stats.patternCorrectCounts }

  if (!correct) {
    if (!weak.includes(patternId)) weak.push(patternId)
    counts[patternId] = 0  // reset consecutive correct count
  } else {
    const prev = counts[patternId] ?? 0
    const next = prev + 1
    counts[patternId] = next
    // Remove from weak after 3 consecutive correct answers
    if (next >= 3) {
      const idx = weak.indexOf(patternId)
      if (idx !== -1) weak.splice(idx, 1)
      delete counts[patternId]
    }
  }

  saveStats({ ...stats, weakPatterns: weak, patternCorrectCounts: counts })
}

export function shouldRepeatPattern(patternId: string): boolean {
  return loadStats().weakPatterns.includes(patternId)
}

// ── Special situation ──────────────────────────────────────────────────────────

export type SpecialSituation =
  | { type: 'long_absence'; days: number }
  | { type: 'streak'; count: 3 | 7 | 30 }
  | { type: 'streak_break' }
  | { type: 'first_challenge' }
  | { type: 'patterns_100' }
  | null

export function getSpecialSituation(stats: UserLearningStats): SpecialSituation {
  const now = new Date()

  // Long absence: >7 days since last session
  if (stats.lastSessionAt) {
    const last = new Date(stats.lastSessionAt)
    const diffDays = Math.floor((now.getTime() - last.getTime()) / 86400000)
    if (diffDays > 7) return { type: 'long_absence', days: diffDays }
  }

  // Streak just broke this session start
  if (stats.streakBroken) return { type: 'streak_break' }

  // First challenge ever completed
  if (stats.firstChallengeComplete && stats.totalSessions === 1) {
    return { type: 'first_challenge' }
  }

  // Streak milestones (exact values so they only fire once per milestone)
  const { currentStreak } = stats
  if (currentStreak === 3)  return { type: 'streak', count: 3 }
  if (currentStreak === 7)  return { type: 'streak', count: 7 }
  if (currentStreak === 30) return { type: 'streak', count: 30 }

  // 100 patterns milestone
  if (stats.totalPatternsLearned >= 100 && stats.totalPatternsLearned < 105) {
    return { type: 'patterns_100' }
  }

  return null
}

export function getSpecialMessage(stats: UserLearningStats): string | null {
  const situation = getSpecialSituation(stats)
  if (!situation) return null

  switch (situation.type) {
    case 'long_absence':   return "오랜만이에요! 복습부터 시작할까요?"
    case 'streak_break':   return "어제 못 하셨군요. 오늘 다시 시작해요!"
    case 'first_challenge': return "첫 챌린지 완료!"
    case 'streak':
      if (situation.count === 3)  return "3일 연속이에요! 굉장해요."
      if (situation.count === 7)  return "7일 연속! 대단한 일이에요."
      if (situation.count === 30) return "30일 연속! 정말 대단해요."
      return null
    case 'patterns_100':   return "패턴 100개를 익혔어요!"
  }
}

// ── Home screen message ────────────────────────────────────────────────────────

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export function getAdaptiveHomeMessage(
  level: LearnerLevel,
  visitorType: string,
  timeOfDay: TimeOfDay,
  stats: UserLearningStats,
): string {
  // Special situation takes priority
  const special = getSpecialMessage(stats)
  if (special) return special

  if (visitorType === 'first_visit') return "PATTO에 오신 걸 환영해요."

  // returning: differentiate by level
  if (visitorType === 'returning') {
    if (level === 'beginner') return "어제 배운 내용 기억하세요?"
    return "다시 오셨네요. 오늘 세션 시작할까요?"
  }

  // Level × time-of-day
  const messages: Record<LearnerLevel, Record<TimeOfDay, string>> = {
    beginner: {
      morning:   "좋은 아침이에요. 오늘도 같이 연습해봐요.",
      afternoon: "오늘 세션 시작할까요?",
      evening:   "좋은 저녁이에요. 오늘 한 세션 어때요?",
      night:     "야간 세션이에요. 시작해볼게요.",
    },
    developing: {
      morning:   "좋은 아침이에요. 계속 이어가볼까요?",
      afternoon: "조금씩 실력이 늘고 있어요.",
      evening:   "오늘도 한 세션 해볼까요?",
      night:     "늦은 시간이지만 꾸준함이 중요해요.",
    },
    intermediate: {
      morning:   "오늘 리콜 집중해볼까요?",
      afternoon: "오늘도 시작할까요?",
      evening:   "저녁 세션 시작해봐요.",
      night:     "집중도 높은 시간이에요.",
    },
    advanced: {
      morning:   "좋은 아침.",
      afternoon: "안녕하세요.",
      evening:   "저녁이네요.",
      night:     "아직도 공부 중이에요.",
    },
  }

  return messages[level][timeOfDay]
}

// ── Real-time session adaptation ────────────────────────────────────────────────

export type SessionPaceSignal = 'fast' | 'slow' | 'no_response'

interface SessionAdaptState {
  fastDoneCount: number
  slowDoneCount: number
  noResponseCount: number
}

const SESSION_ADAPT_KEY = 'patto_session_adapt'

export function loadSessionAdapt(): SessionAdaptState {
  try {
    const raw = sessionStorage.getItem(SESSION_ADAPT_KEY)
    if (!raw) return { fastDoneCount: 0, slowDoneCount: 0, noResponseCount: 0 }
    return JSON.parse(raw)
  } catch {
    return { fastDoneCount: 0, slowDoneCount: 0, noResponseCount: 0 }
  }
}

export function resetSessionAdapt(): void {
  try { sessionStorage.removeItem(SESSION_ADAPT_KEY) } catch {}
}

export function recordSessionSignal(signal: SessionPaceSignal): SessionAdaptState {
  const state = loadSessionAdapt()
  const next: SessionAdaptState = { ...state }

  if (signal === 'fast') {
    next.fastDoneCount++
    next.slowDoneCount = 0
  } else if (signal === 'slow') {
    next.slowDoneCount++
    next.fastDoneCount = 0
  } else {
    next.noResponseCount++
  }

  try { sessionStorage.setItem(SESSION_ADAPT_KEY, JSON.stringify(next)) } catch {}
  return next
}

export type SessionAdaptAction =
  | { type: 'go_silent' }
  | { type: 'encourage_slow' }
  | { type: 'offer_repeat_skip' }
  | { type: 'none' }

export function getSessionAdaptAction(state: SessionAdaptState): SessionAdaptAction {
  if (state.fastDoneCount >= 3)   return { type: 'go_silent' }
  if (state.slowDoneCount >= 3)   return { type: 'encourage_slow' }
  if (state.noResponseCount >= 2) return { type: 'offer_repeat_skip' }
  return { type: 'none' }
}

// ── Stat update helpers ────────────────────────────────────────────────────────

export function onSessionStart(): void {
  const stats = loadStats()
  const today = new Date().toISOString().slice(0, 10)

  // Streak calculation
  let { currentStreak, longestStreak, lastVisitAt } = stats
  let streakBroken = false

  if (lastVisitAt) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().slice(0, 10)
    if (lastVisitAt === today) {
      // same day, no change
    } else if (lastVisitAt === yStr) {
      currentStreak++
    } else {
      // Streak broke — only flag if it was actually a streak (> 1 day)
      if (currentStreak > 1) streakBroken = true
      currentStreak = 1
    }
  } else {
    currentStreak = 1
  }

  longestStreak = Math.max(longestStreak, currentStreak)

  saveStats({
    ...stats,
    visitCount: stats.visitCount + 1,
    currentStreak,
    longestStreak,
    lastVisitAt: today,
    streakBroken,
  })

  resetSessionAdapt()
}

export function onSessionComplete(patternsLearned: number): void {
  const stats = loadStats()
  const isFirst = stats.totalSessions === 0
  saveStats({
    ...stats,
    totalSessions: stats.totalSessions + 1,
    totalPatternsLearned: stats.totalPatternsLearned + patternsLearned,
    lastSessionAt: new Date().toISOString().slice(0, 10),
    firstChallengeComplete: isFirst ? true : stats.firstChallengeComplete,
    // Clear one-shot flags after session completes
    streakBroken: false,
  })
}

export function onDoneTap(responseTimeMs: number): void {
  const stats = loadStats()
  // Rolling EMA with α=0.3
  const ema = Math.round(stats.avgResponseTime * 0.7 + responseTimeMs * 0.3)
  saveStats({ ...stats, avgResponseTime: ema })
}

export function onChallengeResult(correct: boolean): void {
  const stats = loadStats()
  // EMA for challenge correct rate
  const newRate = stats.challengeCorrectRate * 0.8 + (correct ? 1 : 0) * 0.2
  saveStats({ ...stats, challengeCorrectRate: Math.round(newRate * 100) / 100 })
}
