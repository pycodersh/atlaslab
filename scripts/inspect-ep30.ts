import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 30).single()
  if (!ep) { console.error('EP30 없음'); return }
  const epId = ep.id as number

  const [{ data: bubbles }, { data: dialogues }] = await Promise.all([
    sb.from('kp_bubbles')
      .select('id, order_num, speaker, korean, dialogue_id')
      .eq('episode_id', epId)
      .order('order_num'),
    sb.from('kp_dialogues')
      .select('id, order_num, speaker, text_ko')
      .eq('episode_id', epId)
      .order('order_num'),
  ])

  console.log('\n=== kp_bubbles (EP30) ===')
  for (const b of (bubbles ?? [])) {
    const tag = b.dialogue_id != null ? `dlg=${b.dialogue_id}` : 'NULL'
    console.log(`  b.id=${b.id} ord=${b.order_num} [${b.speaker}] (${tag}) "${b.korean}"`)
  }

  console.log('\n=== kp_dialogues (EP30) ===')
  for (const d of (dialogues ?? [])) {
    console.log(`  d.id=${d.id} ord=${d.order_num} [${d.speaker}] "${d.text_ko}"`)
  }
}
main().catch(console.error)
