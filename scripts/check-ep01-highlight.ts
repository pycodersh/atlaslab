import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
  const epId = ep!.id

  // EP01 버블 중 expression_id 또는 dialogue_id 있는 것
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, order_num, speaker, korean, highlight_text, expression_id, dialogue_id')
    .eq('episode_id', epId)
    .order('order_num')

  console.log('=== EP01 모든 버블 ===')
  for (const b of bubbles ?? []) {
    const marker = b.expression_id || b.dialogue_id ? '★' : ' '
    console.log(`${marker} id=${b.id} [${b.speaker}] "${b.korean}" | hl=${b.highlight_text} exp_id=${b.expression_id} dlg_id=${b.dialogue_id}`)
  }

  // dialogue_id 목록 추출
  const dlgIds = (bubbles ?? []).filter(b => b.dialogue_id != null).map(b => b.dialogue_id as number)
  if (dlgIds.length > 0) {
    const { data: exprMaps } = await sb
      .from('kp_dialogue_expressions')
      .select('dialogue_id, expression_id, matched_text, role')
      .in('dialogue_id', dlgIds)

    console.log('\n=== kp_dialogue_expressions (EP01 dialogue_ids) ===')
    for (const m of exprMaps ?? []) {
      console.log(`  dlg_id=${m.dialogue_id} exp_id=${m.expression_id} role=${m.role} matched="${m.matched_text}"`)
    }
  }
}
main().catch(console.error)
