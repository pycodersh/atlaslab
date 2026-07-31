import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  // kp_bubbles 삭제
  const bubbleIds = [109, 43, 104]
  const { error: be, count: bc } = await sb.from('kp_bubbles')
    .delete({ count: 'exact' }).in('id', bubbleIds)
  if (be) { console.error('kp_bubbles 삭제 실패:', be.message); process.exit(1) }
  console.log(`kp_bubbles 삭제: ${bc}개 (ids: ${bubbleIds.join(', ')})`)

  // kp_dialogues 삭제 (CASCADE로 kp_dialogue_expressions도 자동 삭제)
  const dialogueIds = [43, 39, 40]
  const { error: de, count: dc } = await sb.from('kp_dialogues')
    .delete({ count: 'exact' }).in('id', dialogueIds)
  if (de) { console.error('kp_dialogues 삭제 실패:', de.message); process.exit(1) }
  console.log(`kp_dialogues 삭제: ${dc}개 (ids: ${dialogueIds.join(', ')})`)

  // 결과 검증
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 4).single()
  const epId = ep!.id
  const { data: remaining } = await sb.from('kp_bubbles')
    .select('id, speaker, korean').eq('episode_id', epId).order('panel_id, order_num')
  console.log(`\nEP04 kp_bubbles 남은 것 (${remaining?.length}개):`)
  for (const b of remaining ?? []) console.log(`  id=${b.id} ${b.speaker}: ${b.korean}`)

  const { data: dlgRemaining } = await sb.from('kp_dialogues')
    .select('id, speaker, text_ko').eq('episode_id', epId).order('scene_id, order_num')
  console.log(`\nEP04 kp_dialogues 남은 것 (${dlgRemaining?.length}개):`)
  for (const d of dlgRemaining ?? []) console.log(`  id=${d.id} ${d.speaker}: ${d.text_ko}`)
}
main().catch(console.error)
