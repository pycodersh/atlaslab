/**
 * 전 화 dialogue_expressions 연결 건수 정확 스캔
 * kp_dialogue_expressions → kp_dialogues → kp_scenes → kp_episodes (조인)
 * npx tsx scripts/scan-expr-links-v2.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // 1. 모든 dialogue_expressions (dialogue_id 포함)
  const { data: deAll } = await sb.from('kp_dialogue_expressions')
    .select('id, dialogue_id, expression_id')
  const deList = deAll ?? []
  console.log(`kp_dialogue_expressions 총 행 수: ${deList.length}`)

  // 2. 모든 dialogues (scene_id 포함)
  const { data: dlgAll } = await sb.from('kp_dialogues')
    .select('id, scene_id')
  const dlgMap = new Map((dlgAll ?? []).map(d => [d.id as number, d.scene_id as number]))

  // 3. 모든 scenes (episode_id 포함)
  const { data: sceneAll } = await sb.from('kp_scenes')
    .select('id, episode_id')
  const sceneMap = new Map((sceneAll ?? []).map(s => [s.id as number, s.episode_id as string]))

  // 4. 에피소드 목록
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
  const epMap = new Map((eps ?? []).map(e => [e.id as string, e.episode_num as number]))

  // 5. expression별 first_episode (배정 수 계산)
  const { data: exprs } = await sb.from('kp_expressions').select('id, first_episode')
  const assignedByEp = new Map<number, number>()
  for (const e of (exprs ?? [])) {
    const ep = e.first_episode as number
    assignedByEp.set(ep, (assignedByEp.get(ep) ?? 0) + 1)
  }

  // 6. dialogue_expressions → episode 매핑 (연결 건수)
  const linkedByEpNum = new Map<number, number>()
  for (const de of deList) {
    const sceneId = dlgMap.get(de.dialogue_id as number)
    if (!sceneId) continue
    const epId = sceneMap.get(sceneId)
    if (!epId) continue
    const epNum = epMap.get(epId)
    if (!epNum) continue
    linkedByEpNum.set(epNum, (linkedByEpNum.get(epNum) ?? 0) + 1)
  }

  // 7. 보고
  console.log(`\n━━ 전 화 dialogue_expressions 연결 현황 ━━`)
  console.log(`${'EP'.padEnd(5)} ${'배정'.padStart(4)} ${'연결'.padStart(4)}  상태`)
  console.log('─'.repeat(40))

  const problems: string[] = []

  for (const ep of (eps ?? [])) {
    const epNum = ep.episode_num as number
    const assigned = assignedByEp.get(epNum) ?? 0
    const linked   = linkedByEpNum.get(epNum) ?? 0
    const flag = assigned === 0 ? '표현 없음'
               : linked === 0   ? '⚠ 연결 0건'
               : linked < assigned ? `⚠ ${linked}/${assigned}`
               : '✓'
    console.log(`EP${String(epNum).padStart(2,'0')}  ${String(assigned).padStart(4)} ${String(linked).padStart(4)}  ${flag}`)
    if (assigned > 0 && linked < assigned) problems.push(`EP${String(epNum).padStart(2,'0')}`)
  }

  if (problems.length > 0) {
    console.log(`\n⚠ 이상 화: ${problems.join(', ')}`)
  } else {
    console.log(`\n✓ 연결 이상 없음`)
  }
}

main().catch(console.error)
