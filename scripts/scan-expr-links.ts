/**
 * 전 화 dialogue_expressions 연결 건수 스캔
 * — 화별 (배정 표현 수 / 실제 연결 수) 비교
 * npx tsx scripts/scan-expr-links.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // 에피소드 목록
  const { data: eps } = await sb.from('kp_episodes')
    .select('id, episode_num')
    .order('episode_num')
  if (!eps) return

  // 표현별 first_episode (각 화에 "배정"된 표현 수 계산용)
  const { data: exprs } = await sb.from('kp_expressions')
    .select('id, first_episode')
  const exprsByEp = new Map<number, number[]>()
  for (const e of (exprs ?? [])) {
    const ep = e.first_episode as number
    if (!exprsByEp.has(ep)) exprsByEp.set(ep, [])
    exprsByEp.get(ep)!.push(e.id as number)
  }

  // 화별 kp_dialogue_expressions 연결 수
  const { data: links } = await sb.from('kp_dialogue_expressions')
    .select('episode_id, expression_id')
  const linksByEpId = new Map<string, number>()
  for (const l of (links ?? [])) {
    const k = l.episode_id as string
    linksByEpId.set(k, (linksByEpId.get(k) ?? 0) + 1)
  }

  console.log(`\n━━ 전 화 dialogue_expressions 연결 현황 ━━`)
  console.log(`${'EP'.padEnd(5)} ${'배정'.padStart(4)} ${'연결'.padStart(4)}  상태`)
  console.log('─'.repeat(40))

  const problems: string[] = []

  for (const ep of eps) {
    const epNum = ep.episode_num as number
    const assigned = (exprsByEp.get(epNum) ?? []).length
    const linked   = linksByEpId.get(ep.id as string) ?? 0
    const ok = linked >= assigned && assigned > 0
    const flag = assigned === 0 ? '표현 없음'
               : linked === 0   ? '⚠ 연결 0건'
               : linked < assigned ? `⚠ ${linked}/${assigned}`
               : '✓'
    console.log(`EP${String(epNum).padStart(2,'0')}  ${String(assigned).padStart(4)} ${String(linked).padStart(4)}  ${flag}`)
    if (!ok) problems.push(`EP${String(epNum).padStart(2,'0')} (배정=${assigned}, 연결=${linked})`)
  }

  if (problems.length > 0) {
    console.log(`\n⚠ 이상 화: ${problems.join(', ')}`)
  } else {
    console.log(`\n✓ 전 화 정상`)
  }
}

main().catch(console.error)
