/**
 * 표현 순번 — 활성 패턴 300개를 학습 순서(첫 등장 에피소드 → id)로 세운 1~300 번호.
 * 표현 팝업 상단 배지(#052 / 300)에 쓴다. 한 번 불러오면 모듈 안에 캐시한다.
 * 라이브러리 목록 순서(first_episode, id)와 같은 기준이다.
 */
import { createClient } from '@/lib/supabase/client'

export type ExpressionNumbering = { numberOf: Map<number, number>; total: number }

let cache: Promise<ExpressionNumbering> | null = null

export function getExpressionNumbering(): Promise<ExpressionNumbering> {
  if (!cache) {
    cache = (async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('kp_expressions')
        .select('id, first_episode')
        .eq('is_active', true)
        .order('first_episode', { ascending: true, nullsFirst: false })
        .order('id', { ascending: true })
      if (error || !data) { cache = null; return { numberOf: new Map(), total: 0 } }
      const numberOf = new Map<number, number>()
      data.forEach((r, i) => numberOf.set(r.id as number, i + 1))
      return { numberOf, total: data.length }
    })()
  }
  return cache
}
