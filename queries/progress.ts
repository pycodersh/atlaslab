'use client'

import { createClient } from '@/lib/supabase/client'

// ============================================================
// 패턴 진도
// ============================================================

/** 카드 뒷면을 열 때 호출 — review_count++, last_reviewed 갱신 */
export async function recordPatternView(userId: string, patternId: string) {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from('user_pattern_progress')
    .select('id, review_count')
    .eq('user_id', userId)
    .eq('pattern_id', patternId)
    .eq('difficulty', 'normal')
    .maybeSingle()

  if (existing) {
    await supabase
      .from('user_pattern_progress')
      .update({
        review_count: existing.review_count + 1,
        last_reviewed: new Date().toISOString(),
        status: 'learning',
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('user_pattern_progress').insert({
      user_id: userId,
      pattern_id: patternId,
      difficulty: 'normal',
      status: 'learning',
      review_count: 1,
      last_reviewed: new Date().toISOString(),
    })
  }
}

/** 즐겨찾기 토글 — 현재 값을 반전시키고 최신 상태 반환 */
export async function togglePatternFavorite(
  userId: string,
  patternId: string,
): Promise<boolean> {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from('user_pattern_progress')
    .select('id, is_favorited')
    .eq('user_id', userId)
    .eq('pattern_id', patternId)
    .eq('difficulty', 'normal')
    .maybeSingle()

  const newValue = !(existing?.is_favorited ?? false)

  if (existing) {
    await supabase
      .from('user_pattern_progress')
      .update({ is_favorited: newValue })
      .eq('id', existing.id)
  } else {
    await supabase.from('user_pattern_progress').insert({
      user_id: userId,
      pattern_id: patternId,
      difficulty: 'normal',
      status: 'learning',
      review_count: 0,
      is_favorited: newValue,
    })
  }
  return newValue
}

/** 즐겨찾기 여부 조회 */
export async function getPatternFavorites(
  userId: string,
): Promise<Set<string>> {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_pattern_progress')
    .select('pattern_id')
    .eq('user_id', userId)
    .eq('is_favorited', true)
  return new Set((data ?? []).map((r) => r.pattern_id as string))
}

// ============================================================
// 스토리 진도
// ============================================================

/** 미니스토리 낭독 횟수 업데이트 + 완료 처리 */
export async function recordStoryProgress(
  userId: string,
  storyId: string,
  readCount: number,
) {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from('user_story_progress')
    .select('id, read_count')
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .maybeSingle()

  const newReadCount = Math.max(existing?.read_count ?? 0, readCount)

  if (existing) {
    await supabase
      .from('user_story_progress')
      .update({ read_count: newReadCount })
      .eq('id', existing.id)
  } else {
    await supabase.from('user_story_progress').insert({
      user_id: userId,
      story_id: storyId,
      read_count: newReadCount,
    })
  }
}

// ============================================================
// 통계
// ============================================================

export type ProgressStats = {
  completedStories: number
  totalPatternsSeen: number
  totalReviewCount: number
  favoritesCount: number
  studiedDates: string[] // 'YYYY-MM-DD' 형식
}

export async function getProgressStats(userId: string): Promise<ProgressStats> {
  const supabase = createClient()

  const [storyRes, patternRes] = await Promise.all([
    supabase
      .from('user_story_progress')
      .select('story_id, read_count, completed_at')
      .eq('user_id', userId),
    supabase
      .from('user_pattern_progress')
      .select('pattern_id, review_count, is_favorited, last_reviewed')
      .eq('user_id', userId)
      .eq('difficulty', 'normal'),
  ])

  const stories = storyRes.data ?? []
  const patterns = patternRes.data ?? []

  const studiedDates = Array.from(
    new Set(
      patterns
        .filter((p) => p.last_reviewed)
        .map((p) => (p.last_reviewed as string).slice(0, 10)),
    ),
  ).sort()

  return {
    completedStories: stories.filter((s) => s.read_count >= 10).length,
    totalPatternsSeen: patterns.length,
    totalReviewCount: patterns.reduce((acc, p) => acc + (p.review_count as number), 0),
    favoritesCount: patterns.filter((p) => p.is_favorited).length,
    studiedDates,
  }
}
