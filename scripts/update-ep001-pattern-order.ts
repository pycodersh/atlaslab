import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// 대화 등장 순서: 뭐예요(1) → 이에요/예요(2) → 주세요(3) → 있어요/없어요(4) → 얼마예요(5)
const TARGET: { code: string; order: number }[] = [
  { code: 'kp-004', order: 1 }, // ~뭐예요?
  { code: 'kp-005', order: 2 }, // ~이에요/예요
  { code: 'kp-003', order: 3 }, // ~주세요
  { code: 'kp-006', order: 4 }, // ~있어요/없어요
  { code: 'kp-007', order: 5 }, // ~얼마예요?
]

async function main() {
  const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 1).single()
  if (!ep) { console.error('EP01 not found'); return }

  const { data: patterns } = await supabase
    .from('kp_patterns')
    .select('id, code, order_num, pattern')
    .eq('episode_id', ep.id)
    .order('order_num')

  if (!patterns?.length) { console.error('EP01 패턴 없음'); return }

  console.log('현재 순서:')
  patterns.forEach(p => console.log(`  order=${p.order_num} code=${p.code} pattern=${p.pattern}`))

  // Phase 1: temp offset +100
  for (const t of TARGET) {
    const row = patterns.find(p => p.code === t.code)
    if (!row) { console.warn(`  ⚠ ${t.code} 없음`); continue }
    await supabase.from('kp_patterns').update({ order_num: t.order + 100 }).eq('id', row.id)
  }

  // Phase 2: real values
  for (const t of TARGET) {
    const row = patterns.find(p => p.code === t.code)
    if (!row) continue
    const { error } = await supabase.from('kp_patterns').update({ order_num: t.order }).eq('id', row.id)
    if (error) console.error(`  FAIL ${t.code}: ${error.message}`)
    else console.log(`  ✓ ${t.code} → order_num=${t.order}`)
  }

  // 최종 확인
  const { data: final } = await supabase
    .from('kp_patterns')
    .select('code, order_num, pattern')
    .eq('episode_id', ep.id)
    .order('order_num')

  console.log('\n최종 순서:')
  final?.forEach(p => console.log(`  p${p.order_num}: ${p.pattern} (${p.code})`))
  console.log('\n✓ 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
