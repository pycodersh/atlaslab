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
  // first_episode null vs not null
  const { count: withEp } = await sb.from('kp_expressions')
    .select('*', { count: 'exact', head: true })
    .not('first_episode', 'is', null)
  const { count: noEp } = await sb.from('kp_expressions')
    .select('*', { count: 'exact', head: true })
    .is('first_episode', null)
  console.log(`first_episode 있음: ${withEp}, 없음: ${noEp}`)

  // kp_bubbles에서 expression_id로 연결된 것들 확인 (focus = 버블에 표시되는 것)
  const { data: bubbleExps } = await sb
    .from('kp_bubbles')
    .select('expression_id')
    .not('expression_id', 'is', null)
  const expIds = [...new Set(bubbleExps?.map((r: any) => r.expression_id))]
  console.log(`\nkp_bubbles에 연결된 expression_id 수: ${expIds.length}`)

  // first_episode 있는 것들 덤프
  const { data: focusData } = await sb
    .from('kp_expressions')
    .select('id, korean, english, first_episode')
    .not('first_episode', 'is', null)
    .order('first_episode').order('id')

  console.log(`\n=== first_episode 있는 것들 (${focusData?.length}개) ===`)
  focusData?.slice(0, 20).forEach((r: any) =>
    console.log(`id=${r.id} ep=${r.first_episode} | ${r.korean} | eng=${r.english}`)
  )

  // 전체 저장
  const out = 'scripts/focus-expressions.json'
  fs.writeFileSync(out, JSON.stringify(focusData, null, 2), 'utf-8')
  console.log(`\n✅ ${focusData?.length}개 저장 → ${out}`)
}
main().catch(console.error)
