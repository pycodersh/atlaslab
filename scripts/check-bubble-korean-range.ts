import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function run() {
  // kp_bubbles.korean이 있는 버블을 에피소드별로 집계
  const rows: any[] = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data } = await sb.from('kp_bubbles')
      .select('episode_id, korean')
      .not('korean', 'is', null)
      .neq('korean', '')
      .range(from, from + PAGE - 1)
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  console.log(`korean 있는 버블 총 ${rows.length}건`)

  // episode_id → episode_num 맵
  const epIds = [...new Set(rows.map(r => r.episode_id))]
  const { data: epRows } = await sb.from('kp_episodes').select('id, episode_num').in('id', epIds)
  const epMap = new Map((epRows ?? []).map((e: any) => [e.id, e.episode_num]))

  // episode_num별 집계
  const counts = new Map<number, number>()
  for (const r of rows) {
    const epNum = epMap.get(r.episode_id) ?? 0
    counts.set(epNum, (counts.get(epNum) ?? 0) + 1)
  }

  const sorted = [...counts.entries()].sort((a, b) => a[0] - b[0])
  const epNums = sorted.map(([ep]) => ep)
  const minEp = Math.min(...epNums)
  const maxEp = Math.max(...epNums)

  console.log(`\nepisode_num 범위: EP${minEp} ~ EP${maxEp}`)
  console.log(`\n에피소드별 버블 korean 수:`)
  for (const [ep, cnt] of sorted) {
    console.log(`  EP${String(ep).padStart(3, '0')}: ${cnt}건`)
  }
}
run().catch(console.error)
