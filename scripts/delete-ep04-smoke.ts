import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // Delete the bubble
  const { error, count } = await supabase
    .from('kp_bubbles')
    .delete({ count: 'exact' })
    .eq('episode_id', 4)
    .eq('korean', '여기서 담배 피우면 안 돼요.')
  console.log('DELETE:', error?.message ?? `OK (${count} row deleted)`)

  // Revert gap-2 panel: height_ratio 1.1 → 0.88, b-2-2 yPct 44 → 54
  const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 4).single()
  const epId = ep!.id
  // gap-2 = order_num 5 (gap-0=1, cut-1=2, gap-1=3, cut-2=4, gap-2=5)
  const { data: panel } = await supabase.from('kp_panels').select('id').eq('episode_id', epId).eq('order_num', 5).single()
  const panelId = panel!.id

  const r1 = await supabase.from('kp_panels').update({ height_ratio: 0.88 }).eq('id', panelId)
  console.log('height_ratio 1.1→0.88:', r1.error?.message ?? 'OK')

  const r2 = await supabase.from('kp_bubbles')
    .update({ position: { xPct: 44, yPct: 54, widthPct: 44, bubbleKey: 'bubble-oval', lines: 2 } })
    .eq('panel_id', panelId).eq('order_num', 2)
  console.log('b-2-2 yPct 44→54:', r2.error?.message ?? 'OK')

  // Verify remaining bubbles
  const { data: rows } = await supabase
    .from('kp_bubbles').select('order_num, speaker, korean')
    .eq('panel_id', panelId).order('order_num')
  console.log('\ngap-2 remaining bubbles:')
  rows!.forEach(b => console.log(`  ${b.order_num}. [${b.speaker}] ${b.korean}`))
}

main().catch(e => { console.error(e); process.exit(1) })
