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
  const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 2).single()
  if (!ep) { console.error('EP02 not found'); return }

  // EP02 전체 버블 조회
  const { data: bubbles } = await supabase
    .from('kp_bubbles')
    .select('id, panel_id, order_num, korean, position')
    .eq('episode_id', ep.id)
    .order('order_num')

  console.log('=== EP02 kp_bubbles ===')
  for (const b of bubbles ?? []) {
    const pos = b.position as any
    console.log(`  panel=${b.panel_id} order=${b.order_num} yPct=${pos?.yPct} "${b.korean?.replace(/\n/g, '\\n')}"`)
  }

  // "가고 싶어요" 버블 찾기
  const target = (bubbles ?? []).find(b => b.korean?.includes('가고 싶어요'))
  if (!target) { console.error('가고 싶어요 bubble not found'); return }

  const pos = target.position as any
  const oldY = pos?.yPct ?? 6
  const newY = Math.max(0, oldY - 10)

  console.log(`\n타깃: "${target.korean?.replace(/\n/g, '\\n')}"`)
  console.log(`yPct: ${oldY} → ${newY}`)

  const { error } = await supabase
    .from('kp_bubbles')
    .update({ position: { ...pos, yPct: newY } })
    .eq('id', target.id)

  if (error) console.error(`FAIL: ${error.message}`)
  else console.log('✓ 업데이트 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
