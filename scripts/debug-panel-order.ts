/**
 * 전 화 kp_panels order_nums 충돌 스캔
 * npx tsx scripts/debug-panel-order.ts
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
  if (!eps) return

  const conflicts: { ep: number; imageOrds: number[]; gapOrds: number[] }[] = []
  const noConflicts: number[] = []

  for (const ep of eps) {
    const { data: panels } = await sb.from('kp_panels')
      .select('order_num, type')
      .eq('episode_id', ep.id)
      .order('order_num')

    const panelList = panels ?? []
    const gapOrds = panelList.filter(p => p.type === 'gap').map(p => p.order_num)
    const imgOrds = panelList.filter(p => p.type === 'panel').map(p => p.order_num)
    const gapSet = new Set(gapOrds)
    const hasConflict = imgOrds.some(o => gapSet.has(o))

    if (hasConflict) {
      conflicts.push({ ep: ep.episode_num, imageOrds: imgOrds, gapOrds })
    } else {
      noConflicts.push(ep.episode_num)
    }
  }

  console.log(`\n━━ 충돌 없음 (${noConflicts.length}화) ━━`)
  console.log(noConflicts.join(', '))

  console.log(`\n━━ order_num 충돌 (${conflicts.length}화) ━━`)
  for (const c of conflicts) {
    const conflicting = c.imageOrds.filter(o => new Set(c.gapOrds).has(o))
    console.log(`EP${String(c.ep).padStart(2,'0')}  image=[${c.imageOrds.join(',')}]  gap=[${c.gapOrds.join(',')}]  충돌번호=[${conflicting.join(',')}]`)
  }
}
main().catch(console.error)
