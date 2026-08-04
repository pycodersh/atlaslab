import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 30).single()
  const epId = (ep as any).id as number

  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, order_num, speaker, korean, dialogue_id, panel_id, position, tail')
    .eq('episode_id', epId)
    .order('panel_id').order('order_num')

  const dlgIds = (bubbles ?? []).map((b: any) => b.dialogue_id).filter(Boolean)
  const { data: dialogues } = await sb.from('kp_dialogues').select('id, text_ko').in('id', dlgIds)
  const dlgMap = new Map((dialogues ?? []).map((d: any) => [d.id, d.text_ko]))

  console.log(`\nEP30 kp_bubbles (panel순 정렬):\n`)
  let curPanel = -1
  for (const b of (bubbles ?? []) as any[]) {
    if (b.panel_id !== curPanel) { curPanel = b.panel_id; console.log(`── panel=${b.panel_id} ──`) }
    const dlgText = b.dialogue_id ? dlgMap.get(b.dialogue_id) : null
    console.log(`  id=${b.id}  ord=${b.order_num}  [${b.speaker}]  tail=${JSON.stringify(b.tail)}  pos=${JSON.stringify(b.position)}`)
    console.log(`    "${dlgText ?? b.korean}"`)
  }
}
main().catch(console.error)
