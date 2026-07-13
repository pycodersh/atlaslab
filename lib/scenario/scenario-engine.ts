/**
 * Scenario Engine — contextual trainer messages based on visitor type & context.
 * Visit count is tracked in Supabase (logged in) or localStorage (guest).
 */

export type VisitorType = 'first_visit' | 'returning' | 'regular' | 'veteran'
export type ScenarioContext = 'home' | 'story' | 'library' | 'progress' | 'essays' | 'session'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

// 경계값: first_visit(1), returning(2-3), regular(4-10), veteran(11+)
export function classifyVisitor(visitCount: number): VisitorType {
  if (visitCount <= 1)  return 'first_visit'
  if (visitCount <= 3)  return 'returning'
  if (visitCount <= 10) return 'regular'
  return 'veteran'
}

// ── Message tables ─────────────────────────────────────────────────────────────

// first_visit: 시간 무관 고정 메시지
const FIRST_VISIT_MESSAGE = "Welcome to PATTO."

// returning: 시간 무관 고정 메시지
const RETURNING_MESSAGE = "Welcome back. Ready for today's session?"

// regular/veteran: 시간대별 메시지
const REGULAR_MESSAGES: Record<TimeOfDay, string> = {
  morning:   "Good morning. Ready to practice?",
  afternoon: "Ready for today's session?",
  evening:   "Good evening. One more session?",
  night:     "Night session. Let's go.",
}

const VETERAN_MESSAGES: Record<TimeOfDay, string> = {
  morning:   "Morning.",
  afternoon: "Ready?",
  evening:   "Evening.",
  night:     "Still at it.",
}

export function getHomeMessage(visitorType: VisitorType, timeOfDay: TimeOfDay): string {
  if (visitorType === 'first_visit') return FIRST_VISIT_MESSAGE
  if (visitorType === 'returning')   return RETURNING_MESSAGE
  if (visitorType === 'regular')     return REGULAR_MESSAGES[timeOfDay]
  return VETERAN_MESSAGES[timeOfDay]
}

export function getSessionCompleteMessage(visitorType: VisitorType): string {
  if (visitorType === 'veteran') return ''  // silent
  return "Great work today. See you next time."
}

// ── Orb tap context messages ───────────────────────────────────────────────────

const ORB_TAP_MESSAGES: Record<ScenarioContext, Record<VisitorType, string>> = {
  home: {
    first_visit: "Tap a story to start reading.",
    returning:   "Pick up where you left off.",
    regular:     "Start today's session?",
    veteran:     "Ready when you are.",
  },
  story: {
    first_visit: "Read through once, then we practice.",
    returning:   "Take your time reading.",
    regular:     "Focus on the patterns.",
    veteran:     "You've got this.",
  },
  library: {
    first_visit: "Browse stories. Find one that interests you.",
    returning:   "Review your saved patterns?",
    regular:     "Looking for something new?",
    veteran:     "Something catching your eye?",
  },
  progress: {
    first_visit: "Your progress will show here.",
    returning:   "Continue your streak?",
    regular:     "Solid progress.",
    veteran:     "Impressive.",
  },
  essays: {
    first_visit: "Write short essays to reinforce patterns.",
    returning:   "Write something today?",
    regular:     "Writing cements the patterns.",
    veteran:     "Keep writing.",
  },
  session: {
    first_visit: "I'll guide you through each pattern.",
    returning:   "Let's practice together.",
    regular:     "Focus on recall.",
    veteran:     "You know the drill.",
  },
}

export function getOrbTapMessage(
  context: ScenarioContext,
  visitorType: VisitorType,
): string {
  return ORB_TAP_MESSAGES[context]?.[visitorType] ?? "Ready when you are."
}

// ── First visit onboarding ─────────────────────────────────────────────────────

export function getFirstVisitButtons(): Array<{ label: string; primary?: boolean }> {
  return [
    { label: 'Explore' },
    { label: 'Try a Guided Session', primary: true },
  ]
}

// ── Veteran home button ────────────────────────────────────────────────────────

export function getVeteranHomeButton(): { label: string } {
  return { label: 'Start' }
}

// ── Visit count (localStorage fallback) ───────────────────────────────────────

const LS_KEY = 'patto_visit_count'

export function getLocalVisitCount(): number {
  try {
    return parseInt(localStorage.getItem(LS_KEY) ?? '0', 10) || 0
  } catch { return 0 }
}

export function incrementLocalVisitCount(): number {
  const next = getLocalVisitCount() + 1
  try { localStorage.setItem(LS_KEY, String(next)) } catch {}
  return next
}

// TrainerPage → ScenarioContext 매핑
export function pageToContext(page: string): ScenarioContext {
  const MAP: Record<string, ScenarioContext> = {
    home:     'home',
    library:  'library',
    progress: 'progress',
    essay:    'essays',
    story:    'story',
    pattern:  'story',
    session:  'session',
  }
  return MAP[page] ?? 'home'
}
