/**
 * Per-story session progress: listening completion, reading count, challenge completion.
 * Separate from StoryRoundData — tracks within-session activity for the current round.
 */

export type StorySessionState = {
  storyId: number
  round: number               // which round this session belongs to
  listeningCompleted: boolean // full story narration played to end
  readingCount: number        // times user confirmed reading (target: 2)
  challengeCompleted: boolean // challenge mode finished
}

function key(storyId: number) { return `patto-story-sess-${storyId}` }

function defaultState(storyId: number, round: number): StorySessionState {
  return { storyId, round, listeningCompleted: false, readingCount: 0, challengeCompleted: false }
}

export function getStorySessionState(storyId: number, round: number): StorySessionState {
  if (typeof window === 'undefined') return defaultState(storyId, round)
  try {
    const raw = localStorage.getItem(key(storyId))
    if (raw) {
      const data = JSON.parse(raw) as StorySessionState
      if (data.round !== round) return defaultState(storyId, round)
      return data
    }
  } catch {}
  return defaultState(storyId, round)
}

export function updateStorySessionState(
  storyId: number,
  round: number,
  update: Partial<Omit<StorySessionState, 'storyId' | 'round'>>,
): StorySessionState {
  const cur  = getStorySessionState(storyId, round)
  const next = { ...cur, ...update }
  if (typeof window !== 'undefined') {
    localStorage.setItem(key(storyId), JSON.stringify(next))
  }
  return next
}
