// exposure-only 표현들을 kp_expressions에 placeholder로 복원하고
// kp_dialogue_expressions exposure 매핑 재연결
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  const backup = JSON.parse(fs.readFileSync('C:\\Users\\msj15\\Downloads\\kpatto_mappings_backup.json', 'utf-8'))
  const exposureRows: Array<{ de_id: number; dialogue_id: number; expression_korean: string; matched_text: string; role: string }> = backup.exposure

  // 현재 kp_expressions에 있는 korean 목록 조회
  const { data: existing } = await sb.from('kp_expressions').select('id, korean')
  const koreanToId = new Map<string, number>((existing ?? []).map((e: any) => [e.korean, e.id]))
  console.log(`현재 kp_expressions: ${koreanToId.size}개`)

  // exposure에서 누락된 unique korean 목록 추출
  const missingKorean = [...new Set(
    exposureRows
      .filter(r => !koreanToId.has(r.expression_korean))
      .map(r => r.expression_korean)
  )]
  console.log(`누락된 exposure 표현: ${missingKorean.length}개`)

  // placeholder로 INSERT
  let insertOk = 0
  for (const korean of missingKorean) {
    const { data, error } = await sb
      .from('kp_expressions')
      .insert({ korean, english: korean })
      .select('id')
      .single()
    if (error || !data) {
      console.error(`  FAIL [${korean}]:`, error?.message)
    } else {
      koreanToId.set(korean, data.id)
      insertOk++
    }
  }
  console.log(`placeholder INSERT 완료: ${insertOk}개`)

  // exposure 매핑 재연결
  const toInsert = exposureRows
    .map(r => ({
      dialogue_id: r.dialogue_id,
      expression_id: koreanToId.get(r.expression_korean),
      matched_text: r.matched_text,
      role: 'exposure',
    }))
    .filter(r => r.expression_id !== undefined)

  console.log(`exposure 매핑 INSERT 예정: ${toInsert.length}건`)

  let deOk = 0
  for (let i = 0; i < toInsert.length; i += 50) {
    const batch = toInsert.slice(i, i + 50)
    const { error } = await sb.from('kp_dialogue_expressions').insert(batch)
    if (error) { console.error(`batch 실패 (${i}~):`, error.message); return }
    deOk += batch.length
  }
  console.log(`exposure 매핑 복원 완료: ${deOk}건`)

  // 최종 집계
  const { count: exprCount } = await sb.from('kp_expressions').select('id', { count: 'exact', head: true })
  const { count: deCount } = await sb.from('kp_dialogue_expressions').select('id', { count: 'exact', head: true })
  console.log(`\n=== 최종 상태 ===`)
  console.log(`kp_expressions: ${exprCount}개`)
  console.log(`kp_dialogue_expressions: ${deCount}건`)
}
main().catch(console.error)
