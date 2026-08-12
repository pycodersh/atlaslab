import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const EXPRS = ['꿈이 뭐예요?', '~가 되고 싶어요', '-습니다', '포기하고 싶어요']

async function main() {
  const { data } = await sb.from('kp_expressions')
    .select('id, korean, english, first_episode')
    .in('korean', EXPRS)

  console.log('── EP69 표현 4개 DB 확인 ──')
  for (const expr of EXPRS) {
    const found = (data ?? []).find(r => r.korean === expr)
    if (found) {
      console.log(`  ✓ id=${found.id} "${found.korean}" first_ep=${found.first_episode}`)
    } else {
      console.log(`  ✗ 미등록: "${expr}"`)
    }
  }

  // 현재 EP69 연결 확인
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 69).single()
  if (ep) {
    const { data: de } = await sb.from('kp_dialogue_expressions')
      .select('expression_id, matched_text, dialogue_id')
      .eq('episode_id', ep.id)
    console.log(`\n── 현재 EP69 kp_dialogue_expressions (${(de??[]).length}건) ──`)
    for (const r of (de??[])) {
      const expr = (data??[]).find(e => e.id === r.expression_id)
      console.log(`  expression_id=${r.expression_id} (${expr?.korean ?? '?'}) matched="${r.matched_text}"`)
    }

    // EP69 panel order_nums 충돌 확인
    const { data: panels } = await sb.from('kp_panels')
      .select('order_num, type')
      .eq('episode_id', ep.id)
      .order('order_num')
    const panelList = panels ?? []
    const gapOrds = panelList.filter(p => p.type === 'gap').map(p => p.order_num)
    const imgOrds = panelList.filter(p => p.type === 'panel').map(p => p.order_num)
    const gapSet = new Set(gapOrds)
    const conflicting = imgOrds.filter(o => gapSet.has(o))
    console.log(`\n── EP69 panels ──`)
    console.log(`  image order_nums: [${imgOrds.join(',')}]`)
    console.log(`  gap   order_nums: [${gapOrds.join(',')}]`)
    console.log(`  hasOrderConflict: ${conflicting.length > 0} (충돌번호: [${conflicting.join(',')}])`)
  }
}
main().catch(console.error)
