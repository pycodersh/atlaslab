import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // kp_bubbles에 연결된 고유 expression_id 목록
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('expression_id')
    .not('expression_id', 'is', null)
  const ids = [...new Set(bubbles?.map((r: any) => r.expression_id))] as number[]
  console.log(`고유 expression_id: ${ids.length}개`, ids.sort((a,b)=>a-b))

  // 해당 expressions 상세 조회
  const { data: exps } = await sb
    .from('kp_expressions')
    .select('id, korean, english, description, structure, examples, tip')
    .in('id', ids)
    .order('id')

  console.log('\n=== 팝업에 표시될 expressions ===')
  exps?.forEach((r: any) => {
    console.log(`\nid=${r.id} | ${r.korean}`)
    console.log(`  description: ${r.description?.slice(0, 80)}...`)
  })

  fs.writeFileSync('scripts/bubble-expressions.json', JSON.stringify(exps, null, 2), 'utf-8')
  console.log(`\n✅ bubble-expressions.json 저장 (${exps?.length}개)`)
}
main().catch(console.error)
