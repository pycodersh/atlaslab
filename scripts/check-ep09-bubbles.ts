import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 9).single()
  const epId = ep!.id

  const { data: panels } = await sb
    .from('kp_panels')
    .select('id, order_num, type, height_ratio')
    .eq('episode_id', epId)
    .order('order_num')

  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, panel_id, order_num, speaker, korean, position, highlight_text')
    .eq('episode_id', epId)
    .order('panel_id, order_num')

  console.log('=== EP09 kp_panels ===')
  for (const p of panels ?? []) {
    console.log(`  panel id=${p.id} order=${p.order_num} type=${p.type} heightRatio=${p.height_ratio}`)
  }

  console.log('\n=== EP09 kp_bubbles ===')
  for (const b of bubbles ?? []) {
    const pos = b.position as Record<string, unknown> | null
    console.log(`  id=${b.id} panel=${b.panel_id} order=${b.order_num}`)
    console.log(`    speaker=${b.speaker}`)
    console.log(`    korean="${b.korean}"`)
    console.log(`    position=${JSON.stringify(pos)}`)
    console.log(`    highlight=${b.highlight_text ?? '(없음)'}`)
  }
}

main().catch(console.error)
