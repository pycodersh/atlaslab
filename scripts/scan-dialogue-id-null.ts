/**
 * EP01-100 kp_bubbles.dialogue_id NULL 건수 스캔
 * npx tsx scripts/scan-dialogue-id-null.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')

  const rows: { ep: number; total: number; nullCount: number; linkedCount: number }[] = []

  for (const ep of (eps ?? [])) {
    const { data: bubbles } = await sb.from('kp_bubbles')
      .select('id, dialogue_id')
      .eq('episode_id', ep.episode_num as number)
    const total  = (bubbles ?? []).length
    const nullC  = (bubbles ?? []).filter(b => b.dialogue_id == null).length
    const linked = total - nullC
    rows.push({ ep: ep.episode_num as number, total, nullCount: nullC, linkedCount: linked })
  }

  // 표 출력
  console.log('\n화별 kp_bubbles dialogue_id NULL 현황\n')
  console.log('EP  | total | NULL | linked | 상태')
  console.log('────┼───────┼──────┼────────┼──────────────')
  for (const r of rows) {
    const status = r.nullCount === 0    ? '✓ 전부 연결'
                 : r.linkedCount === 0  ? '✗ 전부 NULL'
                 :                        '△ 혼합'
    console.log(
      String(r.ep).padStart(3) + ' | ' +
      String(r.total).padStart(5) + ' | ' +
      String(r.nullCount).padStart(4) + ' | ' +
      String(r.linkedCount).padStart(6) + ' | ' +
      status
    )
  }

  const allNull   = rows.filter(r => r.linkedCount === 0 && r.total > 0)
  const mixed     = rows.filter(r => r.nullCount > 0 && r.linkedCount > 0)
  const allLinked = rows.filter(r => r.nullCount === 0 && r.total > 0)

  console.log(`\n전부 NULL: ${allNull.length}화  [${allNull.map(r=>r.ep).join(', ')}]`)
  console.log(`혼합:      ${mixed.length}화  [${mixed.map(r=>r.ep).join(', ')}]`)
  console.log(`전부 연결: ${allLinked.length}화`)
}
main().catch(console.error)
