/**
 * 전 화 kp_panels order_num 충돌 스캔 — EP60형 [1,2,3,...] vs 정상형 [2,4,6,...] 구분
 * npx tsx scripts/scan-order-conflicts.ts
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

  const normal: number[] = []
  const conflicts: { ep: number; imageOrds: number[]; gapOrds: number[]; conflicting: number[] }[] = []

  for (const ep of eps) {
    const { data: panels } = await sb.from('kp_panels')
      .select('order_num, type')
      .eq('episode_id', ep.id)
      .order('order_num')

    const panelList = panels ?? []
    const gapOrds = panelList.filter(p => p.type === 'gap').map(p => p.order_num as number)
    const imgOrds = panelList.filter(p => p.type === 'panel').map(p => p.order_num as number)
    const gapSet = new Set(gapOrds)
    const conflicting = imgOrds.filter(o => gapSet.has(o))

    if (conflicting.length > 0) {
      conflicts.push({ ep: ep.episode_num, imageOrds: imgOrds, gapOrds, conflicting })
    } else {
      normal.push(ep.episode_num)
    }
  }

  console.log(`\n━━ 정상 (${normal.length}화) ━━`)
  console.log(normal.join(', '))

  console.log(`\n━━ order_num 충돌 (${conflicts.length}화) ━━`)
  for (const c of conflicts) {
    const imgPattern = c.imageOrds[0] === 1 && c.imageOrds.every((v, i) => v === i + 1)
      ? `[1..${c.imageOrds[c.imageOrds.length - 1]}] 순번형` : `[${c.imageOrds.join(',')}]`
    const gapPattern = `[${c.gapOrds.join(',')}]`
    console.log(`EP${String(c.ep).padStart(2,'0')}  image=${imgPattern}  gap=${gapPattern}`)
  }
}

main().catch(console.error)
