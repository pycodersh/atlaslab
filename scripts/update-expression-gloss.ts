/**
 * kp_expressions.english 컬럼에 gloss(영어 번역) 업데이트
 * 사용법: npx tsx scripts/update-expression-gloss.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// id → gloss 매핑 (수동 검수 후 확정된 것만)
const GLOSS: Record<number, string> = {
  // EP01
  770: 'Please give me ~',      // ~주세요
  771: 'What is ~?',            // ~뭐예요?
  772: 'Is there ~?',           // ~있어요?
}

async function main() {
  for (const [id, gloss] of Object.entries(GLOSS)) {
    const { error } = await sb.from('kp_expressions').update({ english: gloss }).eq('id', Number(id))
    console.log(`id=${id}: ${error ? '❌ ' + error.message : '✅ ' + gloss}`)
  }

  // 확인
  const { data } = await sb.from('kp_expressions').select('id, korean, english').in('id', Object.keys(GLOSS).map(Number))
  console.log('\n=== 업데이트 결과 ===')
  data?.forEach(r => console.log(`  id=${r.id} ${r.korean} → "${r.english}"`))
}
main().catch(console.error)
