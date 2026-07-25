/**
 * CHECK 3 패턴 순서 수정 v2
 * QA 재분석 후 올바른 순서로 수정
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function ok(msg: string) { console.log(`  ✓ ${msg}`) }
function fail(msg: string): never { console.error(`  ✗ ${msg}`); process.exit(1) }

async function getEpId(epNum: number) {
  const { data, error } = await supabase
    .from('kp_episodes').select('id').eq('episode_num', epNum).single()
  if (error || !data) fail(`EP${epNum} not found`)
  return data.id
}

// Full reorder: provide complete final mapping as [{keyword, finalOrder}]
// Shifts all to 10000+, then sets each to final order
async function reorderPatterns(
  epId: number, epNum: number,
  finalMap: Array<{ keyword: string; finalOrder: number }>
) {
  console.log(`\n[EP${epNum}] Pattern order 수정`)
  const { data: patterns, error } = await supabase
    .from('kp_patterns').select('id, pattern, order_num')
    .eq('episode_id', epId).order('order_num')
  if (error || !patterns?.length) { console.log('  ⚠️  no patterns'); return }

  // Phase 1: shift all to 10000+
  for (const p of patterns) {
    const { error: e } = await supabase.from('kp_patterns')
      .update({ order_num: 10000 + p.order_num }).eq('id', p.id)
    if (e) fail(`temp shift id=${p.id}: ${e.message}`)
  }
  ok('Shifted all to 10000+')

  // Phase 2: apply finalMap entries
  const touched = new Set<number>()
  for (const entry of finalMap) {
    const p = patterns.find(q => q.pattern.includes(entry.keyword))
    if (!p) { console.log(`  ⚠️  keyword "${entry.keyword}" not found`); continue }
    const { error: e } = await supabase.from('kp_patterns')
      .update({ order_num: entry.finalOrder }).eq('id', p.id)
    if (e) fail(`set order id=${p.id}: ${e.message}`)
    touched.add(p.id)
    ok(`"${p.pattern}" ${p.order_num} → ${entry.finalOrder}`)
  }

  // Phase 3: restore untouched patterns to original order_num
  for (const p of patterns) {
    if (touched.has(p.id)) continue
    const { error: e } = await supabase.from('kp_patterns')
      .update({ order_num: p.order_num }).eq('id', p.id)
    if (e) fail(`restore id=${p.id}: ${e.message}`)
  }
  ok('Untouched patterns restored')
}

async function main() {
  // EP01: 뭐예요(1) → 있어요(2) → 주세요(3) → 얼마예요(4) → 이에요(5)
  // Fix: 이에요 2→5, 있어요 4→2, 얼마예요 5→4
  const ep01Id = await getEpId(1)
  await reorderPatterns(ep01Id, 1, [
    { keyword: '이에요', finalOrder: 5 },
    { keyword: '있어요', finalOrder: 2 },
    { keyword: '얼마예요', finalOrder: 4 },
  ])

  // EP04: 해도돼요(1) ↔ 로할게요(3)
  // Correct: 로할게요(1st in dialogue) → 해도돼요(2nd) → 얼마나걸려요(3rd)
  const ep04Id = await getEpId(4)
  await reorderPatterns(ep04Id, 4, [
    { keyword: '해도 돼요', finalOrder: 3 },
    { keyword: '로 할게요', finalOrder: 1 },
  ])

  // EP05: full reorder — 맛있어요 5→2, 추천해주세요 2→3, 주실수있어요 3→4, 어디서살수있어요 4→5
  const ep05Id = await getEpId(5)
  await reorderPatterns(ep05Id, 5, [
    { keyword: '맛있어요', finalOrder: 2 },
    { keyword: '추천해 주세요', finalOrder: 3 },
    { keyword: '주실 수 있어요', finalOrder: 4 },
    { keyword: '어디서 살 수 있어요', finalOrder: 5 },
  ])

  // EP06: 좋아해요(1) ↔ 진짜요(4)
  // Correct: 진짜요(gap-3) appears before 좋아해요(gap-4)
  const ep06Id = await getEpId(6)
  await reorderPatterns(ep06Id, 6, [
    { keyword: '좋아해요', finalOrder: 4 },
    { keyword: '진짜요', finalOrder: 1 },
  ])

  console.log('\n✓ CHECK 3 v2 수정 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
