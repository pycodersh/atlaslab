/**
 * kp_expressions의 examples를 활용해 만들 수 있는 패턴 기반 챌린지 수 계산
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: exprs } = await supabase
    .from('kp_expressions')
    .select('id, episode_id, matched_text, examples')
    .order('episode_id')

  if (!exprs?.length) { console.log('kp_expressions 없음'); return }

  let totalExamples = 0
  let translationQ = 0   // 예문 ko↔en 번역 문제
  let fillBlankQ   = 0   // 예문 패턴 빈칸 문제
  let exprWithEx   = 0   // examples 있는 expression 수
  let exprNoEn     = 0   // en 번역 없는 예문 수

  const byEpisode = new Map<number, { exprCount: number; exCount: number }>()

  for (const e of exprs) {
    const examples: any[] = Array.isArray(e.examples) ? e.examples : []
    if (!examples.length) continue
    exprWithEx++

    for (const ex of examples) {
      totalExamples++
      const hasEn = !!(ex.translations?.en || ex.en)
      if (hasEn) {
        translationQ++  // ko→en 번역 1문제
        fillBlankQ++    // 패턴 빈칸 1문제
      } else {
        exprNoEn++
      }
    }

    const epId = e.episode_id
    if (!byEpisode.has(epId)) byEpisode.set(epId, { exprCount: 0, exCount: 0 })
    const row = byEpisode.get(epId)!
    row.exprCount++
    row.exCount += examples.length
  }

  // 오답 풀 확보 가능 여부: 같은 EP에 다른 expression이 2개 이상 있어야 오답 만들 수 있음
  let epWithEnoughPool = 0
  for (const [, v] of byEpisode) {
    if (v.exprCount >= 3) epWithEnoughPool++ // 오답 2개 + 정답 1개
  }

  console.log('=== 패턴 기반 챌린지 생성 가능 수 ===\n')
  console.log(`kp_expressions 총: ${exprs.length}개`)
  console.log(`  examples 있는 표현: ${exprWithEx}개`)
  console.log(`  총 예문 수: ${totalExamples}개`)
  console.log(`  en 번역 있는 예문: ${translationQ}개`)
  console.log(`  en 번역 없는 예문: ${exprNoEn}개`)
  console.log('')
  console.log('문제 유형별 생성 가능 수:')
  console.log(`  번역 문제 (ko→en)  : ${translationQ}개`)
  console.log(`  빈칸 문제 (패턴 빈칸): ${fillBlankQ}개`)
  console.log(`  합계               : ${translationQ + fillBlankQ}개`)
  console.log('')
  console.log(`오답 풀 충분한 EP (표현 3개+): ${epWithEnoughPool}개`)
  console.log('')

  // 예문 구조 샘플 3개
  console.log('=== examples 구조 샘플 ===')
  let shown = 0
  for (const e of exprs) {
    const examples: any[] = Array.isArray(e.examples) ? e.examples : []
    if (!examples.length || shown >= 3) continue
    console.log(`\nexpression id=${e.id} matched_text="${e.matched_text}"`)
    console.log(`  example[0]: ${JSON.stringify(examples[0])}`)
    shown++
  }
}

main().catch(console.error)
