/**
 * Story-level SRS round tracking (localStorage).
 *
 * Rounds:  1 → 2일 후  (3 recall)
 *          2 → 3일 후  (3 recall)
 *          3 → 7일 후  (2 recall)
 *          4 → 14일 후 (1 recall)
 *          5 → 마스터  (1 recall)
 */

import { localDateStr } from './storage'

const RECALL_COUNTS   = [3, 3, 2, 1, 1]          // index = round-1
const REVIEW_DAYS     = [2, 3, 7, 14, null] as const

export type StoryRoundData = {
  storyId:         number
  round:           number        // completed rounds so far (0 = never started)
  nextReviewAt:    string | null
  isMastered:      boolean
  lastCompletedAt: string | null
}

function key(storyId: number) { return `patto-story-round-${storyId}` }

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function getStoryRound(storyId: number): StoryRoundData {
  if (typeof window === 'undefined') {
    return { storyId, round: 0, nextReviewAt: null, isMastered: false, lastCompletedAt: null }
  }
  try {
    const raw = localStorage.getItem(key(storyId))
    if (raw) return JSON.parse(raw) as StoryRoundData
  } catch {}
  return { storyId, round: 0, nextReviewAt: null, isMastered: false, lastCompletedAt: null }
}

/** Hide-recall rounds for the session about to start */
export function getRecallCount(currentRound: number): number {
  const next = currentRound + 1                    // round we're about to do
  return RECALL_COUNTS[Math.min(next, 5) - 1] ?? 1
}

/** Call once all hide-recall rounds for a session are complete */
export function completeStoryRound(storyId: number): StoryRoundData {
  const cur       = getStoryRound(storyId)
  const today     = localDateStr()
  if (cur.lastCompletedAt === today) return cur
  const done      = Math.min(cur.round + 1, 5)
  const daysNext  = REVIEW_DAYS[done - 1]

  const data: StoryRoundData = {
    storyId,
    round:           done,
    nextReviewAt:    daysNext != null ? addDays(today, daysNext) : null,
    isMastered:      done >= 5,
    lastCompletedAt: today,
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(key(storyId), JSON.stringify(data))
  }
  return data
}

export type StoryStatus = 'new' | 'learning' | 'review_due' | 'mastered'

export function getStoryStatus(storyId: number): StoryStatus {
  const data = getStoryRound(storyId)
  if (data.isMastered) return 'mastered'
  if (data.round === 0) return 'new'
  const today = localDateStr()
  if (data.nextReviewAt && data.nextReviewAt <= today) return 'review_due'
  return 'learning'
}

export function getTodayRecommendedStoryId(allStoryIds: number[]): number | null {
  if (typeof window === 'undefined') return null
  const today = localDateStr()
  for (const id of allStoryIds) {
    const data = getStoryRound(id)
    if (!data.isMastered && data.nextReviewAt && data.nextReviewAt <= today) return id
  }
  for (const id of allStoryIds) {
    if (getStoryRound(id).round === 0) return id
  }
  return null
}

export function nextReviewLabel(data: StoryRoundData): string {
  if (data.isMastered) return ''
  const days = REVIEW_DAYS[data.round - 1]
  if (days == null)  return ''
  if (days === 7)    return '1주일 후'
  if (days === 14)   return '2주일 후'
  return `${days}일 후`
}
