import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
  const epId = (ep as any).id

  const { data: panels } = await sb.from('kp_panels').select('*').eq('episode_id', epId).order('id')
  console.log('kp_panels columns:', panels && panels.length > 0 ? Object.keys(panels[0]).join(', ') : 'none')
  console.log('\nEP01 panels:')
  for (const p of (panels ?? [])) console.log(JSON.stringify(p))

  const { data: bubbles } = await sb.from('kp_bubbles').select('id, panel_id, order_num, speaker, korean, dialogue_id')
    .eq('episode_id', epId).order('panel_id').order('order_num')
  console.log(`\nEP01 bubbles (${bubbles?.length}건):`)
  for (const b of (bubbles ?? [])) console.log(`  panel=${b.panel_id} ord=${b.order_num} [${b.speaker}] dlg=${b.dialogue_id} "${b.korean}"`)
}
main().catch(console.error)
