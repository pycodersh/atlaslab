import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const EP46_EXPRS = ['~지 얼마나 됐어요?', '아직 ~는 중이에요', '-어 가다', '거의 다 됐어요']
const EP47_EXPRS = ['~스타일 좋아해요?', '요즘 유행이에요', '~잘 어울려요', '~처럼']
const EP48_EXPRS = ['배달 시켜요', '배달 얼마나 걸려요?', '-어 놓다', '가성비 좋아요']

async function checkEp(epNum: number, exprNames: string[]) {
  const { data } = await sb.from('kp_expressions')
    .select('id, korean, english, first_episode')
    .in('korean', exprNames)

  console.log(`\n── EP${epNum} 표현 확인 ──`)
  for (const name of exprNames) {
    const found = (data ?? []).find(r => r.korean === name)
    if (found) {
      console.log(`  ✓ id=${found.id} "${found.korean}" first_ep=${found.first_episode}`)
    } else {
      console.log(`  ✗ 미등록: "${name}"`)
    }
  }

  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', epNum).single()
  if (!ep) return

  const { data: de } = await sb.from('kp_dialogue_expressions')
    .select('expression_id, matched_text, dialogue_id')
  // dialogue → scene → episode 체인으로 필터
  const { data: dlg } = await sb.from('kp_dialogues').select('id, scene_id, speaker, text_ko')
  const { data: scenes } = await sb.from('kp_scenes').select('id, episode_id').eq('episode_id', ep.id as string)
  const sceneIds = new Set((scenes ?? []).map(s => s.id as number))
  const dlgIds = new Set((dlg ?? []).filter(d => sceneIds.has(d.scene_id as number)).map(d => d.id as number))
  const linked = (de ?? []).filter(r => dlgIds.has(r.dialogue_id as number))
  console.log(`  kp_dialogue_expressions 현재 연결: ${linked.length}건`)
  for (const r of linked) {
    const expr = (data ?? []).find(e => e.id === r.expression_id)
    const dInfo = (dlg ?? []).find(d => d.id === r.dialogue_id)
    console.log(`    expr_id=${r.expression_id} (${expr?.korean ?? '?'}) matched="${r.matched_text}" | dlg speaker="${dInfo?.speaker}" text="${(dInfo?.text_ko as string)?.slice(0,20)}"`)
  }
}

async function main() {
  await checkEp(46, EP46_EXPRS)
  await checkEp(47, EP47_EXPRS)
  await checkEp(48, EP48_EXPRS)
}
main().catch(console.error)
