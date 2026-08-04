import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: eps } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .gte('episode_num', 11).lte('episode_num', 30)
    .order('episode_num')
  if (!eps?.length) { console.error('에피소드 없음'); return }

  const epMap = new Map(eps.map(e => [e.id as number, e.episode_num as number]))
  const epIds = eps.map(e => e.id as number)

  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, speaker, korean, dialogue_id')
    .in('episode_id', epIds)
    .is('dialogue_id', null)
    .order('episode_id').order('id')

  const list = (bubbles ?? []) as { id: number; episode_id: number; speaker: string; korean: string; dialogue_id: null }[]

  // 에피소드별 집계
  const byEp: Record<number, typeof list> = {}
  for (const b of list) {
    const epNum = epMap.get(b.episode_id) ?? 0
    if (!byEp[epNum]) byEp[epNum] = []
    byEp[epNum].push(b)
  }

  console.log(`\n=== EP11~30  dialogue_id=null 버블: 총 ${list.length}개 ===\n`)
  console.log('EP    null버블수')
  for (const [epNum, items] of Object.entries(byEp).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const flag = items.length > 0 ? ' ⚠️' : ' ✅'
    console.log(`EP${String(epNum).padEnd(3)} ${items.length}개${flag}`)
  }

  // EP별로 dialogue 총 수도 함께 조회
  const { data: allBubbles } = await sb
    .from('kp_bubbles')
    .select('episode_id, dialogue_id')
    .in('episode_id', epIds)
  const totalByEp: Record<number, { total: number; linked: number }> = {}
  for (const b of (allBubbles ?? [])) {
    const epNum = epMap.get(b.episode_id as number) ?? 0
    if (!totalByEp[epNum]) totalByEp[epNum] = { total: 0, linked: 0 }
    totalByEp[epNum].total++
    if (b.dialogue_id != null) totalByEp[epNum].linked++
  }

  console.log('\n=== 에피소드별 연결 현황 ===\n')
  console.log('EP    total  linked  null  linked%')
  for (const [epNum, v] of Object.entries(totalByEp).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const nullCnt = v.total - v.linked
    const pct = Math.round(v.linked / v.total * 100)
    const flag = nullCnt > 0 ? ' ⚠️' : ' ✅'
    console.log(`EP${String(epNum).padEnd(3)} ${String(v.total).padEnd(6)} ${String(v.linked).padEnd(7)} ${String(nullCnt).padEnd(5)} ${pct}%${flag}`)
  }

  // 목록 출력 (에피소드별)
  console.log('\n=== null 버블 목록 ===\n')
  for (const [epNum, items] of Object.entries(byEp).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.log(`── EP${epNum} (${items.length}개) ──`)
    for (const b of items) {
      console.log(`  id=${b.id} [${b.speaker}] "${b.korean}"`)
    }
  }
}
main().catch(console.error)
