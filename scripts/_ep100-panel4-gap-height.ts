/**
 * EP100 4컷 위아래 gap 높이 2배 설정
 * gap panel id=2504 (위, 200→400px), id=2505 (아래, 160→320px)
 * overlap_px = custom fixedHeightPx override (fetch-episode.ts 참조)
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

const UPDATES = [
  { id: 2504, label: '위(above c4)', from: 200, to: 400 },
  { id: 2505, label: '아래(below c4)', from: 160, to: 320 },
]

async function main() {
  for (const u of UPDATES) {
    const { error } = await sb
      .from('kp_panels')
      .update({ overlap_px: u.to })
      .eq('id', u.id)
      .eq('episode_id', 100)   // EP100 이외 패널 보호
    if (error) throw new Error(`id=${u.id} 업데이트 실패: ${error.message}`)
    console.log(`✅ id=${u.id} [${u.label}] ${u.from}px → ${u.to}px`)
  }

  // 검증
  const { data, error } = await sb.from('kp_panels').select('id, type, order_num, overlap_px').in('id', UPDATES.map(u => u.id))
  if (error) throw new Error(error.message)
  console.log('\n검증:')
  for (const r of data ?? []) console.log(`  id=${r.id} type=${r.type} order_num=${r.order_num} overlap_px=${r.overlap_px}`)
}
main().catch(e => { console.error(e.message); process.exit(1) })
