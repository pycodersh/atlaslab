/**
 * "What is this?" 챌린지 정답 수정
 * id=624 (translation): "저기요... 이거 뭐예요?" → "이거 뭐예요?"
 * id=628 (word_order): "저기요 이거 뭐예요" → "이거 뭐예요"
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // id=624: translation - 답이 "저기요... 이거 뭐예요?" → "이거 뭐예요?"
  const r1 = await sb.from('kp_challenges').update({ answer: '이거 뭐예요?' }).eq('id', 624)
  console.log('id=624 translation fix:', r1.error ?? '✅')

  // id=628: word_order - 답이 "저기요 이거 뭐예요" → "이거 뭐예요"
  // word_pieces에서 "저기요"는 distractor로 남겨도 됨
  const r2 = await sb.from('kp_challenges').update({ answer: '이거 뭐예요' }).eq('id', 628)
  console.log('id=628 word_order fix:', r2.error ?? '✅')

  // 확인
  const { data } = await sb.from('kp_challenges').select('id, challenge_type, question, answer, word_pieces').in('id', [624, 628])
  data?.forEach(c => {
    console.log(`\nid=${c.id} (${c.challenge_type}):`)
    console.log('  Q:', JSON.stringify(c.question))
    console.log('  A:', JSON.stringify(c.answer))
    console.log('  WP:', JSON.stringify(c.word_pieces))
  })
}
main().catch(console.error)
