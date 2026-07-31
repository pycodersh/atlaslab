import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  // EP02: bubble 107 "어디예요?" (dialogue_id=null → dialogues에 없음)
  const { error: e1, count: c1 } = await sb.from('kp_bubbles')
    .delete({ count: 'exact' }).in('id', [107])
  console.log(`EP02 kp_bubbles 삭제: ${c1}개`, e1?.message ?? '')

  // EP05: bubble 50, 105 (dialogue_id=null → dialogues에 없음)
  const { error: e2, count: c2 } = await sb.from('kp_bubbles')
    .delete({ count: 'exact' }).in('id', [50, 105])
  console.log(`EP05 kp_bubbles 삭제: ${c2}개`, e2?.message ?? '')

  // 검증
  for (const [epNum, epLabel] of [[2,'EP02'],[5,'EP05']]) {
    const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', epNum).single()
    const { data: bubbles } = await sb.from('kp_bubbles')
      .select('id, speaker, korean').eq('episode_id', ep!.id).order('panel_id, order_num')
    console.log(`\n${epLabel} 남은 bubbles (${bubbles?.length}개):`)
    for (const b of bubbles ?? []) console.log(`  id=${b.id} ${b.speaker}: ${b.korean}`)
  }
}
main().catch(console.error)
