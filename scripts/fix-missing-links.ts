/**
 * 4건 대사 연결 누락 수정
 * 실행: npx tsx scripts/fix-missing-links.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const LINKS = [
  { expression_id: 1241, dialogue_id: 7228, note: 'EP3 ~먹을 수 있어요? → 매운 거 먹을 수 있어?' },
  { expression_id: 1248, dialogue_id: 7539, note: 'EP33 한국 친구를 사귀고 싶어요 → 한국 친구 사귀고 싶었어요.' },
  { expression_id: 1255, dialogue_id: 7750, note: 'EP54 ~가르쳐 줄 수 있어? → 응! 가르쳐줄 수 있어?' },
  { expression_id: 1261, dialogue_id: 7826, note: 'EP61 저도 그렇게 생각해요 → 맞아요, 사실 나도 그랬어요.' },
]

async function main() {
  for (const { expression_id, dialogue_id, note } of LINKS) {
    // 중복 체크
    const { data: existing } = await sb
      .from('kp_dialogue_expressions')
      .select('id')
      .eq('dialogue_id', dialogue_id)
      .eq('expression_id', expression_id)
      .eq('role', 'focus')
      .maybeSingle()

    if (existing) {
      console.log(`SKIP (이미 연결됨): ${note}`)
      continue
    }

    const { error } = await sb
      .from('kp_dialogue_expressions')
      .insert({ dialogue_id, expression_id, role: 'focus' })

    if (error) {
      console.error(`❌ 실패: ${note}\n   ${error.message}`)
    } else {
      console.log(`✅ 연결 완료: ${note}`)
    }
  }
  console.log('\n완료')
}

main().catch(console.error)
