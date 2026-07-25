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
  // ── STEP 1: EP06 gap-3 bubble 추가 ────────────────────────────────────────
  const { data: ep06 } = await supabase.from('kp_episodes').select('id').eq('episode_num', 6).single()
  if (!ep06) { console.error('EP06 not found'); return }

  // gap-3 = order_num 7 (gap0=1, cut1=2, gap1=3, cut2=4, gap2=5, cut3=6, gap3=7)
  const { data: gap3 } = await supabase
    .from('kp_panels')
    .select('id')
    .eq('episode_id', ep06.id)
    .eq('order_num', 7)
    .single()

  if (!gap3) { console.error('EP06 gap-3(order=7) not found'); return }
  console.log(`EP06 gap-3 panel_id=${gap3.id}`)

  // 현재 버블 수 확인
  const { data: existing } = await supabase
    .from('kp_bubbles')
    .select('id, order_num, korean')
    .eq('panel_id', gap3.id)
    .order('order_num')
  console.log('기존 버블:')
  existing?.forEach(b => console.log(`  order=${b.order_num} "${b.korean}"`))

  const nextOrder = (existing?.length ?? 0) + 1
  const { error: insertErr } = await supabase.from('kp_bubbles').insert({
    episode_id: ep06.id,
    panel_id:   gap3.id,
    order_num:  nextOrder,
    speaker:    'emma',
    korean:     '진짜요? 대박!',
    translations: { en: 'Really? No way!' },
    position: {
      bubbleKey: 'bubble-oval',
      xPct: 4, yPct: 78, widthPct: 52, lines: 1,
    },
    tail: { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }, // tailLTop
    highlight_text: '진짜요',
  })

  if (insertErr) console.error(`INSERT FAIL: ${insertErr.message}`)
  else console.log(`✓ EP06 gap-3 bubble 추가 (order=${nextOrder}): "진짜요? 대박!"`)

  // ── STEP 2: highlight_text 전체 현황 ──────────────────────────────────────
  console.log('\n\n=== kp_bubbles highlight_text 현황 ===')
  const { data: highlights } = await supabase
    .from('kp_bubbles')
    .select('episode_id, korean, highlight_text')
    .not('highlight_text', 'is', null)
    .order('episode_id')
    .order('order_num')

  if (!highlights?.length) {
    console.log('highlight_text가 있는 bubble 없음')
  } else {
    // episode_id → episode_num 매핑
    const epNums = [...new Set(highlights.map(h => h.episode_id))]
    const { data: eps } = await supabase
      .from('kp_episodes')
      .select('id, episode_num')
      .in('id', epNums)
    const epMap = new Map<number, number>()
    eps?.forEach(e => epMap.set(e.id, e.episode_num))

    highlights.forEach(h => {
      const epNum = epMap.get(h.episode_id) ?? h.episode_id
      console.log(`  EP${String(epNum).padStart(2,'0')} "${h.korean}" → highlight: "${h.highlight_text}"`)
    })
  }

  console.log('\n✓ 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
