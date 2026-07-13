/**
 * Syncs local SRS round data to Supabase user_story_srs table.
 * Fire-and-forget — localStorage remains the source of truth.
 * Silently no-ops when the user is not logged in.
 */

import { createClient } from '@/lib/supabase/client'
import type { StoryRoundData } from '@/lib/srs/story-round'

const REVIEW_DAYS = [2, 3, 7, 14, null] as const

function nextReviewTimestamp(round: number): string | null {
  const days = REVIEW_DAYS[round - 1]
  if (days == null) return null
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export async function syncStoryRoundToSupabase(
  userId: string,
  data: StoryRoundData,
): Promise<void> {
  const supabase = createClient()
  const nextReviewAt = nextReviewTimestamp(data.round)

  const { error } = await supabase
    .from('user_story_srs')
    .upsert(
      {
        user_id:        userId,
        story_id:       data.storyId,
        current_round:  data.round,
        completed_at:   new Date().toISOString(),
        next_review_at: nextReviewAt,
        is_mastered:    data.isMastered,
      },
      { onConflict: 'user_id,story_id' },
    )

  if (error) {
    console.warn('[supabase-sync] user_story_srs upsert failed:', error.message)
  }
}
