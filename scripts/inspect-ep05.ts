import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 5).single()
  const epId = ep!.id

  const { data: bubbles } = await sb.from('kp_bubbles')
    .select('id, panel_id, order_num, speaker, korean, dialogue_id')
    .eq('episode_id', epId).order('panel_id, order_num')
  console.log('=== kp_bubbles EP05 ===')
  for (const b of bubbles ?? []) console.log(JSON.stringify(b))

  const { data: dlgs } = await sb.from('kp_dialogues')
    .select('id, scene_id, order_num, speaker, text_ko')
    .eq('episode_id', epId).order('scene_id, order_num')
  console.log('\n=== kp_dialogues EP05 ===')
  for (const d of dlgs ?? []) console.log(JSON.stringify(d))
}
main().catch(console.error)
