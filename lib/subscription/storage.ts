export type Plan = 'free' | 'premium'

export const FREE_STORY_LIMIT     = 10
export const FREE_WORD_LIMIT      = 20
export const FREE_MAX_ESSAY_WORDS = 300

export const PREMIUM_MAX_ESSAY_WORDS = 500

// Daily review limits (server is authoritative; these mirror server constants for UI hints)
export const FREE_REVIEW_DAILY    = 2
export const PREMIUM_REVIEW_DAILY = 10

/** @deprecated Free plan is now daily-limited like Premium. Use FREE_REVIEW_DAILY. */
export const FREE_REVIEW_LIFETIME = FREE_REVIEW_DAILY

const PLAN_KEY = 'patto-plan'

export function getPlan(): Plan {
  if (typeof window === 'undefined') return 'free'
  return (localStorage.getItem(PLAN_KEY) as Plan) ?? 'free'
}

export function setPlan(plan: Plan): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PLAN_KEY, plan)
}
