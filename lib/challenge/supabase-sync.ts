import { createClient } from '@/lib/supabase/client'
import type { ChallengeType } from '@/lib/challenge/daily-challenge'

export interface DailyChallengeRecord {
  userId: string
  storyId: number
  challengeType: ChallengeType
  userAnswer: string
  isCorrect: boolean | null
}

export async function saveDailyChallengeToSupabase(record: DailyChallengeRecord): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('daily_challenges').insert({
    user_id:        record.userId,
    story_id:       record.storyId,
    challenge_type: record.challengeType,
    user_answer:    record.userAnswer,
    is_correct:     record.isCorrect,
  })
  if (error) {
    console.warn('[challenge-sync] insert failed:', error.message)
  }
}
