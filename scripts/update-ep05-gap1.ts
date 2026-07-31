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
  const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 5).single()
  const epId = ep!.id

  // gap-1 = order_num 3 (gap-0=1, cut-1=2, gap-1=3)
  const { data: panel } = await supabase.from('kp_panels').select('id').eq('episode_id', epId).eq('order_num', 3).single()
  const panelId = panel!.id
  console.log(`EP05 id=${epId}  gap-1 panel id=${panelId}`)

  const r1 = await supabase.from('kp_panels').update({ height_ratio: 1.35 }).eq('id', panelId)
  console.log('height_ratio 1.1→1.35:', r1.error?.message ?? 'OK')

  const r2 = await supabase.from('kp_bubbles')
    .update({ position: { xPct: 4, yPct: 5, widthPct: 58, bubbleKey: 'bubble-oval', lines: 2 } })
    .eq('panel_id', panelId).eq('order_num', 1)
  console.log('b-1-1 yPct 6→5:', r2.error?.message ?? 'OK')

  const r3 = await supabase.from('kp_bubbles')
    .update({ position: { xPct: 46, yPct: 32, widthPct: 50, bubbleKey: 'bubble-oval', lines: 1 } })
    .eq('panel_id', panelId).eq('order_num', 2)
  console.log('b-1-2 yPct 46→32:', r3.error?.message ?? 'OK')

  const r4 = await supabase.from('kp_bubbles')
    .update({
      korean: '한국 마트에서 이런 거 살 수 있어요?',
      translations: { en: 'Can you buy things like this at Korean marts?' },
      position: { xPct: 4, yPct: 56, widthPct: 66, bubbleKey: 'bubble-oval', lines: 1 },
    })
    .eq('panel_id', panelId).eq('order_num', 3)
  console.log('b-1-3 update:', r4.error?.message ?? 'OK')

  const tailRTop = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }
  const r5 = await supabase.from('kp_bubbles').insert({
    panel_id: panelId,
    episode_id: epId,
    order_num: 4,
    speaker: 'minjun',
    korean: '당연하죠!',
    translations: { en: 'Of course!' },
    audio_url: null,
    position: { xPct: 44, yPct: 76, widthPct: 44, bubbleKey: 'bubble-oval', lines: 1 },
    tail: tailRTop,
  })
  console.log('b-1-4 insert (minjun 당연하죠!):', r5.error?.message ?? 'OK')

  const { data: rows } = await supabase
    .from('kp_bubbles').select('order_num, speaker, korean')
    .eq('panel_id', panelId).order('order_num')
  console.log('\ngap-1 final bubbles:')
  rows!.forEach(b => console.log(`  ${b.order_num}. [${b.speaker}] ${b.korean}`))
}

main().catch(e => { console.error(e); process.exit(1) })
