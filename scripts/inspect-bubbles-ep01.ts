import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  // EP01 id
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
  const ep1Id = ep!.id

  // kp_bubbles EP01 전체
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, panel_id, order_num, speaker, korean, translations, highlight_text, expression_id')
    .eq('episode_id', ep1Id)
    .order('panel_id, order_num')

  // kp_panels EP01 (gap만)
  const { data: panels } = await sb
    .from('kp_panels')
    .select('id, order_num, type')
    .eq('episode_id', ep1Id)
    .eq('type', 'gap')
    .order('order_num')

  const panelMap = new Map((panels ?? []).map(p => [p.id, p.order_num]))

  console.log('=== kp_bubbles EP01 ===')
  for (const b of bubbles ?? []) {
    const panelOrd = panelMap.get(b.panel_id) ?? '?'
    console.log(`  panel_ord=${panelOrd} | b.order=${b.order_num} | ${b.speaker}: ${b.korean}`)
  }
  console.log(`\n합계: ${bubbles?.length}개\n`)

  // kp_dialogues EP01 전체
  const { data: dialogues } = await sb
    .from('kp_dialogues')
    .select('id, scene_id, order_num, speaker, text_ko')
    .eq('episode_id', ep1Id)
    .order('scene_id, order_num')

  // kp_scenes EP01
  const { data: scenes } = await sb
    .from('kp_scenes')
    .select('id, scene_number')
    .eq('episode_id', ep1Id)
    .order('scene_number')

  const sceneMap = new Map((scenes ?? []).map(s => [s.id, s.scene_number]))

  console.log('=== kp_dialogues EP01 ===')
  for (const d of dialogues ?? []) {
    const sceneNum = sceneMap.get(d.scene_id) ?? '?'
    console.log(`  scene=${sceneNum} | d.order=${d.order_num} | id=${d.id} | ${d.speaker}: ${d.text_ko}`)
  }
  console.log(`\n합계: ${dialogues?.length}개`)

  // kp_bubbles 컬럼 확인 (dialogue_id 있는지)
  const { data: sample } = await sb.from('kp_bubbles').select('*').limit(1)
  if (sample?.[0]) console.log('\nkp_bubbles 컬럼:', Object.keys(sample[0]).join(', '))
}

main().catch(console.error)
