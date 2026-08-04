import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
  if (!ep) { console.error('EP01 없음'); return }

  const { data: bubbles } = await sb.from('kp_bubbles')
    .select('id, order_num, korean, dialogue_id, highlight_text, expression_id')
    .eq('episode_id', ep.id)
    .order('order_num')

  console.log('=== kp_bubbles EP01 ===')
  for (const b of bubbles ?? []) {
    console.log(`  [${b.order_num}] dlg=${b.dialogue_id} expr=${b.expression_id} hl="${b.highlight_text}" ko="${b.korean}"`)
  }

  const dlgIds = (bubbles ?? []).filter(b => b.dialogue_id != null).map(b => b.dialogue_id as number)
  const { data: exprs } = await sb.from('kp_dialogue_expressions')
    .select('dialogue_id, expression_id, matched_text, role')
    .in('dialogue_id', dlgIds)

  console.log('\n=== kp_dialogue_expressions ===')
  for (const e of exprs ?? []) {
    console.log(`  dlg=${e.dialogue_id} expr=${e.expression_id} matched="${e.matched_text}" role=${e.role}`)
  }
}
main().catch(console.error)
