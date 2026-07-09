export const ONBOARDING_KEY   = 'patto_onboarding_completed_v1'
export const ONBOARDING_REPLAY = 'patto_onboarding_replay_v1'

export function isOnboardingDone(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function markOnboardingDone(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true')
}

export function requestOnboardingReplay(): void {
  localStorage.setItem(ONBOARDING_REPLAY, 'true')
}

export function consumeOnboardingReplay(): boolean {
  if (typeof window === 'undefined') return false
  const had = localStorage.getItem(ONBOARDING_REPLAY) === 'true'
  if (had) localStorage.removeItem(ONBOARDING_REPLAY)
  return had
}
