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
  avgResponseTime: number   // ms
  challengeCorrectRate: number  // 0–1
  lastSessionAt: string | null  // ISO date
  lastVisitAt: string | null    // ISO date
  weakPatterns: string[]
}

export type TrainerIntensity = 'full' | 'moderate' | 'minimal' | 'silent'

export interface PaceConfig {
  slideDelay: number  // ms before next auto-transition
}

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

  if (!correct) {
    if (!weak.includes(patternId)) weak.push(patternId)
  } else {
    // Remove after 3 correct would require per-pattern tracking — simplified:
    // Just remove on correct to keep it lean
    const idx = weak.indexOf(patternId)
    if (idx !== -1) weak.splice(idx, 1)
  }

  saveStats({ ...stats, weakPatterns: weak })
}

export function shouldRepeatPattern(patternId: string): boolean {
  return loadStats().weakPatterns.includes(patternId)
}

// ── Special situation messages ─────────────────────────────────────────────────

export function getSpecialMessage(stats: UserLearningStats): string | null {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  // Long absence (>7 days since last session)
  if (stats.lastSessionAt) {
    const last = new Date(stats.lastSessionAt)
    const diffDays = Math.floor((now.getTime() - last.getTime()) / 86400000)
    if (diffDays > 7) return `${diffDays}일 만이에요. 다시 시작해봐요.`
  }

  // First challenge ever
  if (stats.totalSessions === 0) return null

  // Streak milestones
  const { currentStreak } = stats
  if (currentStreak === 3)  return "3일 연속이에요! 굉장해요."
  if (currentStreak === 7)  return "7일 연속! 대단한 일이에요."
  if (currentStreak === 30) return "30일 연속! 정말 대단해요."

  // 100 patterns milestone
  if (stats.totalPatternsLearned === 100) return "100개 패턴을 배웠어요!"

  return null
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
  if (visitorType === 'returning')   return "다시 오셨네요. 오늘 세션 시작할까요?"

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
      afternoon: "준비됐나요?",
      evening:   "저녁 세션 시작해봐요.",
      night:     "집중도 높은 시간이에요.",
    },
    advanced: {
      morning:   "좋은 아침.",
      afternoon: "준비됐나요?",
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
    next.slowDoneCount = 0   // reset slow on fast
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
  if (lastVisitAt) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().slice(0, 10)
    if (lastVisitAt === today) {
      // same day, no change
    } else if (lastVisitAt === yStr) {
      currentStreak++
    } else {
      currentStreak = 1  // streak broken
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
  })

  resetSessionAdapt()
}

export function onSessionComplete(patternsLearned: number): void {
  const stats = loadStats()
  saveStats({
    ...stats,
    totalSessions: stats.totalSessions + 1,
    totalPatternsLearned: stats.totalPatternsLearned + patternsLearned,
    lastSessionAt: new Date().toISOString().slice(0, 10),
  })
}

export function onDoneTap(responseTimeMs: number): void {
  const stats = loadStats()
  // Rolling average (simple EMA with α=0.3)
  const ema = Math.round(stats.avgResponseTime * 0.7 + responseTimeMs * 0.3)
  saveStats({ ...stats, avgResponseTime: ema })
}

export function onChallengeResult(correct: boolean): void {
  const stats = loadStats()
  // EMA for challenge correct rate
  const newRate = stats.challengeCorrectRate * 0.8 + (correct ? 1 : 0) * 0.2
  saveStats({ ...stats, challengeCorrectRate: Math.round(newRate * 100) / 100 })
}
