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
  const targets = [
    '달고나 라떼 먹어 보세요!',
    '한국 카페 또 오고 싶어요!',
  ]

  for (const korean of targets) {
    // Check existence first
    const { data: found } = await supabase
      .from('kp_bubbles')
      .select('id, korean')
      .eq('episode_id', 1)
      .eq('korean', korean)

    if (!found?.length) {
      console.log(`이미 없음: ${korean}`)
      continue
    }

    const { error } = await supabase
      .from('kp_bubbles')
      .delete()
      .eq('episode_id', 1)
      .eq('korean', korean)

    if (error) console.error(`FAIL: ${korean} → ${error.message}`)
    else console.log(`✓ 삭제: ${korean} (id=${found[0].id})`)
  }

  // Show remaining
  const { data: all } = await supabase
    .from('kp_bubbles')
    .select('id, panel_id, order_num, korean')
    .eq('episode_id', 1)
    .order('panel_id')
    .order('order_num')

  console.log(`\nEP01 남은 버블: ${all?.length}개`)
  for (const b of all ?? []) {
    console.log(`  id=${b.id} panel=${b.panel_id} [${b.korean.replace(/\n/g, '/')}]`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
