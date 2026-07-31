import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  // episode_num 조인해서 role='focus' 집계
  const { data, error } = await sb
    .from('kp_dialogue_expressions')
    .select('role, dialogue_id, kp_dialogues!inner(episode_id, kp_episodes!inner(episode_num))')
    .eq('role', 'focus')

  if (error) { console.error('오류:', error.message); process.exit(1) }

  // episode_num별 집계
  const epMap = new Map<number, number>()
  for (const row of data ?? []) {
    const epNum = (row as any).kp_dialogues?.kp_episodes?.episode_num
    if (epNum == null) continue
    epMap.set(epNum, (epMap.get(epNum) ?? 0) + 1)
  }

  const sorted = [...epMap.entries()].sort((a, b) => a[0] - b[0])
  const counts = sorted.map(([, c]) => c)
  const total  = counts.reduce((s, c) => s + c, 0)
  const avg    = counts.length ? (total / counts.length).toFixed(1) : '0'
  const min    = counts.length ? Math.min(...counts) : 0
  const max    = counts.length ? Math.max(...counts) : 0

  console.log('=== kp_dialogue_expressions role=focus 에피소드별 ===\n')
  for (const [ep, cnt] of sorted) {
    const bar = '█'.repeat(cnt)
    console.log(`  EP${String(ep).padStart(2,'0')}  ${String(cnt).padStart(3)}  ${bar}`)
  }

  console.log(`\n=== 전체 통계 ===`)
  console.log(`  focus 총 개수   : ${total}`)
  console.log(`  에피소드 수     : ${sorted.length}`)
  console.log(`  에피소드당 평균 : ${avg}`)
  console.log(`  최소            : ${min}`)
  console.log(`  최대            : ${max}`)

  // 0개인 에피소드 확인
  const { data: epRows } = await sb.from('kp_episodes').select('episode_num').order('episode_num')
  const allEps = (epRows ?? []).map(r => r.episode_num)
  const missing = allEps.filter(n => !epMap.has(n))
  if (missing.length) {
    console.log(`\n  focus 없는 EP   : EP${missing.join(', EP')}`)
  }
}

main().catch(console.error)
