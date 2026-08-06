/**
 * EP 00 진단 + 수정 스크립트
 * 실행: npx tsx scripts/_fix_ep00.ts
 *
 * [1] first_episode IS NULL 또는 0인 행 조회
 * [2] kp_dialogue_expressions → kp_dialogues → kp_episodes 연결로 실제 화 번호 조회
 * [3] first_episode UPDATE
 * [4] 수정 후 검증
 */
import * as dotenv from 'dotenv'
import * as path   from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function main() {
  // ── [1] first_episode = 0 또는 NULL ──────────────────────────────────────────
  console.log('\n[1] first_episode 0 또는 NULL 행 조회')
  const { data: ep0rows, error: e0 } = await sb
    .from('kp_expressions')
    .select('id, korean, english, first_episode')
    .or('first_episode.is.null,first_episode.eq.0')
    .order('id')

  if (e0) { console.error('ERROR:', e0.message); process.exit(1) }
  console.log(`  총 ${ep0rows?.length ?? 0}건`)
  ep0rows?.forEach(r =>
    console.log(`  id=${r.id}  ep=${r.first_episode}  "${r.korean}" / "${r.english}"`)
  )

  if (!ep0rows?.length) {
    console.log('\n✓ EP 00 행 없음. 종료.')
    return
  }

  // ── [2] kp_dialogue_expressions → kp_dialogues → kp_episodes ──────────────
  console.log('\n[2] 연결된 화 번호 조회')
  const ids = ep0rows.map(r => r.id)

  // Step 2a: dialogue_expressions → dialogue_id 가져오기
  const { data: deLinks, error: e1 } = await sb
    .from('kp_dialogue_expressions')
    .select('expression_id, dialogue_id')
    .in('expression_id', ids)

  if (e1) { console.error('ERROR kp_dialogue_expressions:', e1.message); process.exit(1) }
  console.log(`  kp_dialogue_expressions 연결 수: ${deLinks?.length ?? 0}`)

  if (!deLinks?.length) {
    console.log('\n  ⚠️ kp_dialogue_expressions 연결 없음. 수정 불가. 종료.')
    return
  }

  // Step 2b: dialogue_id → episode_id 가져오기
  const dialogueIds = [...new Set(deLinks.map(r => r.dialogue_id))]
  const { data: dlgRows, error: e2 } = await sb
    .from('kp_dialogues')
    .select('id, episode_id')
    .in('id', dialogueIds)

  if (e2) { console.error('ERROR kp_dialogues:', e2.message); process.exit(1) }

  const dlgToEpId = new Map<number, string>()
  for (const d of dlgRows ?? []) dlgToEpId.set(d.id, d.episode_id)

  // Step 2c: episode_id → episode_num 가져오기
  const episodeIds = [...new Set(dlgRows?.map(r => r.episode_id) ?? [])]
  const { data: epRows, error: e3 } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .in('id', episodeIds)

  if (e3) { console.error('ERROR kp_episodes:', e3.message); process.exit(1) }

  const epIdToNum = new Map<string, number>()
  for (const e of epRows ?? []) epIdToNum.set(e.id, e.episode_num)

  // expression_id → 최소 episode_num
  const minEp = new Map<number, number>()
  for (const de of deLinks ?? []) {
    const epId  = dlgToEpId.get(de.dialogue_id)
    const epNum = epId ? epIdToNum.get(epId) : undefined
    if (epNum === undefined) continue

    const cur = minEp.get(de.expression_id)
    if (cur === undefined || epNum < cur) minEp.set(de.expression_id, epNum)
  }

  console.log('\n  expression_id → 최소 episode_num:')
  for (const [exprId, ep] of minEp.entries()) {
    const row = ep0rows.find(r => r.id === exprId)
    console.log(`  id=${exprId}  "${row?.korean}"  → EP ${String(ep).padStart(2,'0')}`)
  }

  // 연결 없는 행
  const unlinked = ep0rows.filter(r => !minEp.has(r.id))
  if (unlinked.length) {
    console.log('\n  ⚠️ episode 연결 없음:')
    unlinked.forEach(r => console.log(`    id=${r.id}  "${r.korean}"`))
  }

  if (!minEp.size) {
    console.log('\n연결된 화 없음. 수정 불가. 종료.')
    return
  }

  // ── [3] UPDATE ───────────────────────────────────────────────────────────────
  console.log('\n[3] first_episode UPDATE')
  for (const [exprId, ep] of minEp.entries()) {
    const { error: eu } = await sb
      .from('kp_expressions')
      .update({ first_episode: ep })
      .eq('id', exprId)
    if (eu) {
      console.error(`  ❌ id=${exprId} UPDATE 실패: ${eu.message}`)
    } else {
      console.log(`  ✅ id=${exprId} first_episode → ${ep}`)
    }
  }

  // ── [4] 검증 ─────────────────────────────────────────────────────────────────
  console.log('\n[4] 수정 후 검증')
  const { data: remaining } = await sb
    .from('kp_expressions')
    .select('id, korean, first_episode')
    .or('first_episode.is.null,first_episode.eq.0')

  console.log(`  first_episode = 0 또는 NULL 잔여: ${remaining?.length ?? 0}건`)
  if (remaining?.length) {
    remaining.forEach(r => console.log(`    id=${r.id}  "${r.korean}"  ep=${r.first_episode}`))
  } else {
    console.log('  ✅ 0건 — Library에서 EP 00 그룹 사라짐')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
