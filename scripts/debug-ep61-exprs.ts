import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const EXPRS = [
  '솔직하게 말해도 돼요?',
  '~이란',
  '-는 게 아니라',
  '-나 싶다',
]

async function main() {
  const { data } = await sb.from('kp_expressions')
    .select('id, korean, english, first_episode')
    .in('korean', EXPRS)

  console.log('── EP61 표현 4개 DB 확인 ──')
  for (const expr of EXPRS) {
    const found = (data ?? []).find(r => r.korean === expr)
    if (found) {
      console.log(`  ✓ id=${found.id} "${found.korean}" (first_ep=${found.first_episode})`)
    } else {
      console.log(`  ✗ 미등록: "${expr}"`)
    }
  }

  // 현재 EP61 배분 확인
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 61).single()
  if (ep) {
    const { data: de } = await sb.from('kp_dialogue_expressions')
      .select('expression_id, matched_text, dialogue_id')
      .eq('episode_id', ep.id)
    console.log(`\n── 현재 EP61 kp_dialogue_expressions (${(de??[]).length}건) ──`)
    for (const r of (de??[])) {
      const expr = (data??[]).find(e => e.id === r.expression_id)
      console.log(`  expression_id=${r.expression_id} (${expr?.korean ?? '?'}) matched="${r.matched_text}"`)
    }
  }
}
main().catch(console.error)
