import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// New panel layout for EP01
// [order_num, type, image_url | null, layout | null, height_ratio | null]
const NEW_PANELS = [
  [1,  'gap',   null,                              null,           100 / 430],
  [2,  'panel', '/kpatto/ep-001/ep01_c1.png',     'wide',         null     ],
  [3,  'gap',   null,                              null,           160 / 430],
  [4,  'panel', '/kpatto/ep-001/ep01_c2.png',     'wide',         null     ],
  [5,  'gap',   null,                              null,           160 / 430],
  [6,  'panel', '/kpatto/ep-001/ep01_c3.png',     'wide',         null     ],
  [7,  'gap',   null,                              null,           120 / 430],
  [8,  'panel', '/kpatto/ep-001/ep01_c4.png',     'wide',         null     ],
  [9,  'gap',   null,                              null,           160 / 430],
  [10, 'panel', '/kpatto/ep-001/ep01_c5.png',     'wide',         null     ],
  [11, 'gap',   null,                              null,           120 / 430],
  [12, 'gap',   null,                              null,           100 / 430],
] as const

async function main() {
  const { data: ep } = await supabase
    .from('kp_episodes')
    .select('id')
    .eq('episode_num', 1)
    .single()
  if (!ep) { console.error('Episode 1 not found'); return }
  const epId = ep.id
  console.log(`Episode 1 DB id: ${epId}`)

  const { data: panels } = await supabase
    .from('kp_panels')
    .select('id, order_num, type, image_url, layout, height_ratio')
    .eq('episode_id', epId)
    .order('order_num')
  console.log(`Current panel count: ${panels?.length ?? 0}`)
  panels?.forEach(p => {
    console.log(`  [${p.order_num}] ${p.type} | url=${p.image_url ?? '-'} | h=${p.height_ratio ?? '-'}`)
  })

  // Update existing panels in-place (keep IDs so bubble panel_id refs survive)
  for (let i = 0; i < (panels?.length ?? 0); i++) {
    const dbPanel = panels![i]
    const np = NEW_PANELS[i]
    if (!np) continue

    const [newOrder, newType, newUrl, newLayout, newRatio] = np
    const upd: Record<string, unknown> = { order_num: newOrder, type: newType }
    if (newUrl    !== null) upd.image_url    = newUrl
    if (newLayout !== null) upd.layout       = newLayout
    if (newRatio  !== null) upd.height_ratio = newRatio

    const { error } = await supabase.from('kp_panels').update(upd).eq('id', dbPanel.id)
    if (error) console.error(`  FAIL panel id=${dbPanel.id}: ${error.message}`)
    else       console.log(`  ✓ panel id=${dbPanel.id} → order=${newOrder} type=${newType}`)
  }

  // Insert extra panels if current count < 12
  const currentCount = panels?.length ?? 0
  for (let i = currentCount; i < NEW_PANELS.length; i++) {
    const [newOrder, newType, newUrl, newLayout, newRatio] = NEW_PANELS[i]
    const rec: Record<string, unknown> = { episode_id: epId, order_num: newOrder, type: newType }
    if (newUrl    !== null) rec.image_url    = newUrl
    if (newLayout !== null) rec.layout       = newLayout
    if (newRatio  !== null) rec.height_ratio = newRatio

    const { error } = await supabase.from('kp_panels').insert(rec)
    if (error) console.error(`  FAIL insert order=${newOrder}: ${error.message}`)
    else       console.log(`  ✓ inserted new panel order=${newOrder} type=${newType}`)
  }

  // Reset all bubble positions (position JSON → null)
  const { error: bubErr } = await supabase
    .from('kp_bubbles')
    .update({ position: null })
    .eq('episode_id', epId)
  if (bubErr) console.error(`  FAIL reset positions: ${bubErr.message}`)
  else        console.log('\n  ✓ 모든 EP01 버블 position → null 초기화')

  console.log('\n✓ EP01 레이아웃 마이그레이션 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
