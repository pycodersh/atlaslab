/**
 * EP40 kp_bubbles 실제 dialogue_id, highlight_text, korean 확인
 * npx tsx scripts/scan-ep40-bubbles.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // EP40 버블 전체
  const { data: bubbles } = await sb.from('kp_bubbles')
    .select('id, episode_id, panel_id, dialogue_id, korean, highlight_text, order_num')
    .eq('episode_id', 40)
    .order('order_num')

  console.log(`\nEP40 kp_bubbles (${(bubbles ?? []).length}건)\n`)
  console.log('  id      | dlg_id | korean[:30]                     | highlight_text')
  console.log('─'.repeat(90))
  for (const b of (bubbles ?? [])) {
    const k = String(b.korean ?? '').slice(0, 30).padEnd(32)
    const hl = b.highlight_text ?? '(NULL)'
    const dlg = b.dialogue_id != null ? String(b.dialogue_id) : 'NULL'
    console.log(`  ${String(b.id).padStart(6)} | ${dlg.padStart(6)} | ${k} | ${hl}`)
  }

  // 수정 대상 두 대사
  console.log('\n── 수정 대상 대사 버블 확인 ──')
  for (const korean of ['그래도 나라마다 달라서 재미있어요.', '그래도 나라마다 달라요. 그게 재미있어요.', '처음엔 다 낯설었는데…']) {
    const hits = (bubbles ?? []).filter(b => b.korean === korean)
    if (hits.length) {
      for (const h of hits) {
        console.log(`  korean="${korean}" → id=${h.id} dlg_id=${h.dialogue_id ?? 'NULL'} highlight_text="${h.highlight_text ?? 'NULL'}"`)
      }
    } else {
      console.log(`  korean="${korean}" → 버블 없음`)
    }
  }

  // dialogue_id=11352, 11348 기반 검색
  console.log('\n── dialogue_id 기반 버블 확인 ──')
  for (const dlgId of [11352, 11348]) {
    const hits = (bubbles ?? []).filter(b => b.dialogue_id === dlgId)
    if (hits.length) {
      for (const h of hits) {
        console.log(`  dlg_id=${dlgId} → bubble id=${h.id} korean="${h.korean}" highlight_text="${h.highlight_text ?? 'NULL'}"`)
      }
    } else {
      console.log(`  dlg_id=${dlgId} → 버블 없음`)
    }
  }
}
main().catch(console.error)
