/**
 * id=1250 (~더라고요) EP41 수동 연결
 * EP41 대화에 '더라고요' 없이 '더라고'(반말)만 사용됨
 * → 컷2 "근데 말이야, 좀 어색하더라고." 또는 컷4 "역시 그렇더라고!"에 연결
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

async function main() {
  // EP41 에피소드 ID 조회
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 41).single()
  if (!ep) { console.error('EP41 not found'); return }
  const epId = (ep as any).id as number
  console.log(`EP41 episode_id: ${epId}`)

  // EP41 대사 조회
  const { data: dials } = await sb.from('kp_dialogues').select('id, text_ko').eq('episode_id', epId)
  if (!dials) { console.error('대사 없음'); return }
  console.log('EP41 대사:')
  for (const d of dials) console.log(`  [${(d as any).id}] ${(d as any).text_ko}`)

  // '더라고' 포함 대사 찾기
  const target = (dials as any[]).find(d => d.text_ko.includes('더라고'))
  if (!target) { console.error('더라고 포함 대사 없음'); return }
  console.log(`\n연결 대상: [${target.id}] ${target.text_ko}`)

  // kp_dialogue_expressions INSERT
  const { error } = await sb.from('kp_dialogue_expressions').insert({
    expression_id: 1250,
    dialogue_id: target.id,
    role: 'focus',
    matched_text: target.text_ko,
  })
  if (error) {
    console.error('INSERT 실패:', error.message)
  } else {
    console.log('✓ id=1250 EP41 연결 완료')
  }

  // 최종 확인
  const { count } = await sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true })
  console.log(`kp_dialogue_expressions 총: ${count}건`)
}

main().catch(console.error)
