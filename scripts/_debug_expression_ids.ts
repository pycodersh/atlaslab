/**
 * fetch-episode.ts focusMappings 쿼리 실측
 * — expression_id 가 딸려 오는지, EP02 경복궁 실제 값 확인
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY!

const sbAnon = createClient(url, anon, { auth: { persistSession: false } })
const sbSvc  = createClient(url, svc,  { auth: { persistSession: false } })

async function main() {
  // ── 1. focusMappings 쿼리 재현 (anon 키로) ─────────────────────────────────
  // fetch-episode.ts line 65 와 완전히 동일한 쿼리
  const { data: anon1 } = await sbAnon
    .from('kp_dialogue_expressions')
    .select('dialogue_id, matched_text, expression_id')
    .in('dialogue_id', [10383])
    .eq('role', 'focus')

  console.log('=== focusMappings (anon) — dialogue_id=10383 ===')
  for (const r of (anon1 ?? [])) {
    console.log(`  dialogue_id=${r.dialogue_id}  expression_id=${r.expression_id}  matched="${r.matched_text}"`)
  }
  console.log(`  → highlightMap이 받을 expressionId: ${(anon1 ?? []).map(r => r.expression_id).join(', ')}`)

  // ── 2. 21건 전체 expression_id 확인 ────────────────────────────────────────
  const TARGET = [
    10383, 10393, 11100, 11221, 11230, 11275,
    11460, 11479, 11499, 11598, 11623, 11632,
    11640, 11693, 11732, 11746, 11773, 11805,
    11837, 11887, 11892,
  ]
  const { data: all } = await sbSvc
    .from('kp_dialogue_expressions')
    .select('dialogue_id, expression_id, matched_text, role')
    .in('dialogue_id', TARGET)
    .eq('role', 'focus')
    .order('dialogue_id')
    .order('id')

  console.log('\n=== 21건 전체 expression_id ===')
  let prev = -1
  for (const r of (all ?? [])) {
    if (r.dialogue_id !== prev) { console.log(`\n  dialogue_id=${r.dialogue_id}`); prev = r.dialogue_id }
    console.log(`    expression_id=${r.expression_id}  matched="${r.matched_text}"`)
  }

  // ── 3. kp_bubbles fallback 경로 — expression_id 있는지 ────────────────────
  const { data: ep02 } = await sbSvc.from('kp_episodes').select('id').eq('episode_num', 2).single()
  const { data: bubs } = await sbSvc
    .from('kp_bubbles')
    .select('id, korean, expression_id, highlight_text, dialogue_id')
    .eq('episode_id', ep02!.id)
    .ilike('korean', '%경복궁%')

  console.log('\n=== EP02 경복궁 kp_bubbles (fallback 경로) ===')
  for (const b of (bubs ?? [])) {
    console.log(`  bubble id=${b.id}  expression_id=${b.expression_id}  highlight_text="${b.highlight_text}"`)
    console.log(`  dialogue_id=${b.dialogue_id}  ← NULL이면 highlightMap 안 탐, fallback 사용`)
  }

  // ── 4. dialogueExpressionMap 현재 동작 — .set() 시 어느 expression_id가 남는지
  console.log('\n=== dialogueExpressionMap .set() 동작 시뮬레이션 (어느 id가 살아남나) ===')
  const dialExprMap = new Map<number, number>()
  for (const r of (all ?? [])) {
    if (r.expression_id != null) dialExprMap.set(r.dialogue_id as number, r.expression_id as number)
  }
  for (const dlgId of [10383, 10393, 11100]) {
    console.log(`  dialogue_id=${dlgId}  → .set() 후 expression_id=${dialExprMap.get(dlgId)}  (last wins)`)
  }
}

main().catch(e => { console.error('⛔', e.message); process.exit(1) })
