/**
 * Syncs user_learning_stats to Supabase.
 * Fire-and-forget — localStorage is the source of truth.
 */

import { createClient } from '@/lib/supabase/client'
import { loadStats, saveStats, type UserLearningStats } from './adaptive-engine'

export async function syncStatsToSupabase(userId: string): Promise<void> {
  const stats = loadStats()
  const supabase = createClient()

  const { error } = await supabase
    .from('user_learning_stats')
    .upsert(
      {
        user_id:                userId,
        visit_count:            stats.visitCount,
        total_sessions:         stats.totalSessions,
        total_patterns_learned: stats.totalPatternsLearned,
        current_streak:         stats.currentStreak,
        longest_streak:         stats.longestStreak,
        avg_response_time:      stats.avgResponseTime,
        challenge_correct_rate: stats.challengeCorrectRate,
        last_session_at:        stats.lastSessionAt,
        last_visit_at:          stats.lastVisitAt,
        weak_patterns:          stats.weakPatterns,
        updated_at:             new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  if (error) {
    console.warn('[adaptive-sync] upsert failed:', error.message)
  }
}

export async function loadStatsFromSupabase(userId: string): Promise<void> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_learning_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return

  const merged: Partial<UserLearningStats> = {
    visitCount:           data.visit_count            ?? 0,
    totalSessions:        data.total_sessions          ?? 0,
    totalPatternsLearned: data.total_patterns_learned  ?? 0,
    currentStreak:        data.current_streak          ?? 0,
    longestStreak:        data.longest_streak          ?? 0,
    avgResponseTime:      data.avg_response_time       ?? 4000,
    challengeCorrectRate: data.challenge_correct_rate  ?? 1,
    lastSessionAt:        data.last_session_at         ?? null,
    lastVisitAt:          data.last_visit_at           ?? null,
    weakPatterns:         data.weak_patterns           ?? [],
  }

  // Merge: take higher numeric values to avoid losing local progress
  const local = loadStats()
  saveStats({
    ...local,
    visitCount:           Math.max(local.visitCount, merged.visitCount ?? 0),
    totalSessions:        Math.max(local.totalSessions, merged.totalSessions ?? 0),
    totalPatternsLearned: Math.max(local.totalPatternsLearned, merged.totalPatternsLearned ?? 0),
    currentStreak:        Math.max(local.currentStreak, merged.currentStreak ?? 0),
    longestStreak:        Math.max(local.longestStreak, merged.longestStreak ?? 0),
    lastSessionAt:        local.lastSessionAt ?? merged.lastSessionAt ?? null,
    lastVisitAt:          local.lastVisitAt   ?? merged.lastVisitAt   ?? null,
    weakPatterns:         Array.from(new Set([...local.weakPatterns, ...(merged.weakPatterns ?? [])])),
    // Keep local EMA values — they're more accurate than synced snapshots
    avgResponseTime:      local.avgResponseTime,
    challengeCorrectRate: local.challengeCorrectRate,
  })
}
