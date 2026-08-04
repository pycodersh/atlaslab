/**
 * Supabase 1000행 기본 제한 우회용 페이지네이션 헬퍼
 */
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * kp_dialogues 전체를 페이지네이션으로 로드.
 * Supabase 기본 limit=1000을 우회해 모든 에피소드(EP99/100 포함)를 반환.
 */
export async function fetchAllDialogues(
  supabase: SupabaseClient,
  columns = 'id, episode_id, text_ko, speaker',
  pageSize = 500,
): Promise<any[]> {
  const result: any[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('kp_dialogues')
      .select(columns)
      .order('id')
      .range(from, from + pageSize - 1)

    if (error) throw new Error(`kp_dialogues 로드 실패 (range ${from}–${from + pageSize - 1}): ${error.message}`)
    if (!data || data.length === 0) break

    result.push(...data)
    if (data.length < pageSize) break   // 마지막 페이지
    from += pageSize
  }

  return result
}
