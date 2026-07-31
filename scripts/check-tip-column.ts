import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  // tip 컬럼 존재 여부 + 샘플 확인
  const { data: sample, error: sErr } = await sb
    .from('kp_expressions')
    .select('id, korean, tip')
    .limit(3)
  if (sErr) { console.error('조회 실패:', sErr.message); return }
  console.log('tip 컬럼 존재 여부: ✓ (에러 없음)')
  console.log('샘플:', JSON.stringify(sample, null, 2))

  // focus role인 expression_id 목록
  const { data: focusRows } = await sb
    .from('kp_dialogue_expressions')
    .select('expression_id')
    .eq('role', 'focus')
  const focusIds = [...new Set((focusRows ?? []).map((r: any) => r.expression_id as number))]
  console.log(`\nfocus 역할 고유 expression 수: ${focusIds.length}개`)

  // 해당 IDs의 tip 상태 조회 (배치 처리)
  let nullOrEmpty = 0
  let hasTip = 0
  const BATCH = 200
  for (let i = 0; i < focusIds.length; i += BATCH) {
    const batch = focusIds.slice(i, i + BATCH)
    const { data } = await sb
      .from('kp_expressions')
      .select('id, tip')
      .in('id', batch)
    for (const r of data ?? []) {
      if (r.tip == null || r.tip === '') nullOrEmpty++
      else hasTip++
    }
  }
  console.log(`\n=== tip 현황 ===`)
  console.log(`tip null/빈값: ${nullOrEmpty}개`)
  console.log(`tip 있음:      ${hasTip}개`)
  console.log(`합계:          ${nullOrEmpty + hasTip}개`)
}
main().catch(console.error)
