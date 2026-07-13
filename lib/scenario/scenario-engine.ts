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
const FIRST_VISIT_MESSAGE = "PATTO에 오신 걸 환영해요."

// returning: 시간 무관 고정 메시지
const RETURNING_MESSAGE = "다시 오셨네요. 오늘 세션 시작할까요?"

// regular/veteran: 시간대별 메시지
const REGULAR_MESSAGES: Record<TimeOfDay, string> = {
  morning:   "좋은 아침이에요. 오늘도 연습해볼까요?",
  afternoon: "오늘 세션 시작할까요?",
  evening:   "좋은 저녁이에요. 오늘 한 세션 어때요?",
  night:     "야간 세션이에요. 시작해볼게요.",
}

const VETERAN_MESSAGES: Record<TimeOfDay, string> = {
  morning:   "좋은 아침.",
  afternoon: "준비됐나요?",
  evening:   "저녁이네요.",
  night:     "아직도 공부 중이에요.",
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
    first_visit: "스토리를 탭해서 시작해보세요.",
    returning:   "이어서 시작해볼까요?",
    regular:     "오늘 세션 시작할까요?",
    veteran:     "준비됐을 때 알려주세요.",
  },
  story: {
    first_visit: "한 번 읽어보고 나서 연습해요.",
    returning:   "천천히 읽어보세요.",
    regular:     "패턴에 집중해보세요.",
    veteran:     "할 수 있어요.",
  },
  library: {
    first_visit: "저장한 단어와 패턴이 여기 있어요.",
    returning:   "저장한 단어와 패턴이 여기 있어요.",
    regular:     "저장한 단어와 패턴이 여기 있어요.",
    veteran:     "저장한 단어와 패턴이 여기 있어요.",
  },
  progress: {
    first_visit: "여기에 진행 상황이 표시될 거예요.",
    returning:   "오늘도 계속할까요?",
    regular:     "착실하게 진행되고 있어요.",
    veteran:     "대단해요.",
  },
  essays: {
    first_visit: "짧은 에세이로 패턴을 익혀봐요.",
    returning:   "오늘 뭔가 써볼까요?",
    regular:     "쓰기가 패턴을 굳혀줘요.",
    veteran:     "계속 써요.",
  },
  session: {
    first_visit: "각 패턴을 가이드해드릴게요.",
    returning:   "함께 연습해봐요.",
    regular:     "recall에 집중해봐요.",
    veteran:     "방법은 알고 있죠.",
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
