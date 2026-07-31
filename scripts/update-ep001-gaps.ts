import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const RATIO = 240 / 430   // 모든 gap 통일

async function main() {
  const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 1).single()
  if (!ep) { console.error('Episode 1 not found'); return }

  const { data: panels } = await supabase
    .from('kp_panels')
    .select('id, order_num, type, height_ratio')
    .eq('episode_id', ep.id)
    .order('order_num')

  console.log('Current panels:')
  panels?.forEach(p => console.log(`  [${p.order_num}] ${p.type} h=${p.height_ratio}`))

  // 모든 gap → 240px
  for (const p of panels ?? []) {
    if (p.type !== 'gap') continue
    const { error } = await supabase.from('kp_panels').update({ height_ratio: RATIO }).eq('id', p.id)
    if (error) console.error(`  FAIL id=${p.id}: ${error.message}`)
    else console.log(`  ✓ gap id=${p.id} order=${p.order_num} → height_ratio=${RATIO.toFixed(4)}`)
  }

  // gap-5 (order=11) 삭제 — 버블 없는 빈 gap, 새 레이아웃에 불필요
  const gap5 = panels?.find(p => p.order_num === 11)
  if (gap5) {
    const { error } = await supabase.from('kp_panels').delete().eq('id', gap5.id)
    if (error) console.error(`  FAIL delete gap5: ${error.message}`)
    else console.log(`  ✓ gap-5 (order=11, id=${gap5.id}) 삭제`)
  } else {
    console.log('  gap-5(order=11) not found — skip')
  }

  console.log('\n✓ 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
