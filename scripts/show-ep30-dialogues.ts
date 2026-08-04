import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 30).single()
  const { data } = await sb.from('kp_dialogues').select('id, order_num, speaker, text_ko').eq('episode_id', ep!.id).order('order_num').order('id')
  console.log(`\nEP30 kp_dialogues (${data?.length}건):\n`)
  for (const d of data ?? []) {
    console.log(`id=${d.id}  ord=${d.order_num}  [${d.speaker}]  "${d.text_ko}"`)
  }
}
main().catch(console.error)
