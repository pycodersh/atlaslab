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

export function classifyVisitor(visitCount: number): VisitorType {
  if (visitCount <= 1)  return 'first_visit'
  if (visitCount <= 5)  return 'returning'
  if (visitCount <= 20) return 'regular'
  return 'veteran'
}

// ── Message tables ─────────────────────────────────────────────────────────────

const HOME_MESSAGES: Record<VisitorType, Record<TimeOfDay, string>> = {
  first_visit: {
    morning:   "Good morning. Let's get started.",
    afternoon: "Welcome. Ready to try?",
    evening:   "Good evening. Let's begin.",
    night:     "Late start? That's fine.",
  },
  returning: {
    morning:   "Good morning. Back again.",
    afternoon: "Welcome back.",
    evening:   "Good evening. Ready to continue?",
    night:     "Back for more?",
  },
  regular: {
    morning:   "Morning. Let's keep the streak.",
    afternoon: "Ready for today's session?",
    evening:   "Good evening. One more session?",
    night:     "Night session. Let's go.",
  },
  veteran: {
    morning:   "Morning. You know what to do.",
    afternoon: "Ready?",
    evening:   "Evening session.",
    night:     "Still at it.",
  },
}

const ORB_TAP_MESSAGES: Record<ScenarioContext, Record<VisitorType, string>> = {
  home: {
    first_visit: "Tap a story to start reading.",
    returning:   "Pick up where you left off.",
    regular:     "Your stories are ready.",
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
    returning:   "All stories are here.",
    regular:     "Looking for something new?",
    veteran:     "Something catching your eye?",
  },
  progress: {
    first_visit: "Your progress will show here.",
    returning:   "Early days — keep going.",
    regular:     "Solid progress.",
    veteran:     "Impressive.",
  },
  essays: {
    first_visit: "Write short essays to reinforce patterns.",
    returning:   "Practice makes permanent.",
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

export function getHomeMessage(visitorType: VisitorType, timeOfDay: TimeOfDay): string {
  return HOME_MESSAGES[visitorType][timeOfDay]
}

export function getOrbTapMessage(
  context: ScenarioContext,
  visitorType: VisitorType,
): string {
  return ORB_TAP_MESSAGES[context]?.[visitorType] ?? "Ready when you are."
}

export function getFirstVisitButtons(): Array<{ label: string; primary?: boolean }> {
  return [
    { label: 'Explore' },
    { label: 'Try a Guided Session', primary: true },
  ]
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
