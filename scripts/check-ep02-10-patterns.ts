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
  const { data: episodes } = await supabase
    .from('kp_episodes')
    .select('id, episode_num')
    .in('episode_num', [2,3,4,5,6,7,8,9,10])
    .order('episode_num')

  const epMap = new Map<number, number>()
  for (const e of episodes ?? []) epMap.set(e.episode_num, e.id)

  for (const epNum of [2,3,4,5,6,7,8,9,10]) {
    const epId = epMap.get(epNum)
    if (!epId) { console.log(`EP${epNum}: 없음`); continue }

    const { data: patterns } = await supabase
      .from('kp_patterns')
      .select('code, order_num, pattern')
      .eq('episode_id', epId)
      .order('order_num')

    console.log(`\nEP${String(epNum).padStart(2,'0')}:`)
    if (!patterns?.length) { console.log('  패턴 없음'); continue }
    patterns.forEach(p => console.log(`  p${p.order_num}: ${p.pattern} (${p.code})`))
  }

  // EP02 패널도 확인
  console.log('\n\n=== EP02 kp_panels ===')
  const ep02id = epMap.get(2)
  if (ep02id) {
    const { data: panels } = await supabase
      .from('kp_panels')
      .select('id, order_num, type, image_url, layout, height_ratio')
      .eq('episode_id', ep02id)
      .order('order_num')
    panels?.forEach(p =>
      console.log(`  order=${p.order_num} type=${p.type} layout=${p.layout ?? '-'} img=${p.image_url ?? '-'} h=${p.height_ratio}`)
    )
  }
}

main().catch(e => { console.error(e); process.exit(1) })
