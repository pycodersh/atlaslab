import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const EXPRS = ['많이 늘었어요', '비결이 뭐예요?', '~이 헷갈려요', '~만큼']

async function main() {
  const { data } = await sb.from('kp_expressions')
    .select('id, korean, english, first_episode')
    .in('korean', EXPRS)

  console.log('── EP66 표현 4개 DB 확인 ──')
  for (const expr of EXPRS) {
    const found = (data ?? []).find(r => r.korean === expr)
    if (found) {
      console.log(`  ✓ id=${found.id} "${found.korean}" first_ep=${found.first_episode}`)
    } else {
      console.log(`  ✗ 미등록: "${expr}"`)
    }
  }

  // 현재 EP66 kp_dialogue_expressions 확인
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 66).single()
  if (ep) {
    const { data: de } = await sb.from('kp_dialogue_expressions')
      .select('expression_id, matched_text, dialogue_id')
      .eq('episode_id', ep.id)
    console.log(`\n── 현재 EP66 kp_dialogue_expressions (${(de??[]).length}건) ──`)
    for (const r of (de??[])) {
      const expr = (data??[]).find(e => e.id === r.expression_id)
      console.log(`  expression_id=${r.expression_id} (${expr?.korean ?? '?'}) matched="${r.matched_text}"`)
    }
  }
}
main().catch(console.error)
