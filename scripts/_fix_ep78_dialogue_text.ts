/**
 * EP78 id=11650 대사 텍스트를 버블 문장(반말)에 맞춘다.
 *
 * 배경: kp_dialogues.text_ko = "에마, 한국에 얼마나 있을 거예요?" (존댓말)
 *       kp_bubbles id=4001   = "에마, 한국에 얼마나 있을 거야?"   (반말)
 * 앱은 dialogue_id가 null이라 버블 텍스트를 화면에 표시하고,
 * 같은 화의 다른 민준 대사도 전부 반말이므로 버블 쪽을 정본으로 삼는다.
 *
 * audio_url·audio_hash는 건드리지 않는다 (현재 둘 다 null).
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const DIALOGUE_ID = 11650
const BUBBLE_ID   = 4001

async function main() {
  const { data: before, error: e1 } = await sb
    .from('kp_dialogues').select('id, episode_id, speaker, text_ko, audio_url, audio_hash').eq('id', DIALOGUE_ID).single()
  if (e1) throw new Error(`대사 조회 실패: ${e1.message}`)
  const { data: bub, error: e2 } = await sb
    .from('kp_bubbles').select('id, korean').eq('id', BUBBLE_ID).single()
  if (e2) throw new Error(`버블 조회 실패: ${e2.message}`)

  console.log('변경 전:')
  console.log(`  대사 id=${before.id} [${before.speaker}] ${JSON.stringify(before.text_ko)}`)
  console.log(`  버블 id=${bub.id}          ${JSON.stringify(bub.korean)}`)
  console.log(`  audio_url=${before.audio_url} audio_hash=${before.audio_hash}`)

  if (before.text_ko === bub.korean) {
    console.log('\n이미 동일 — 변경 없음')
    return
  }

  const { data: after, error: e3 } = await sb
    .from('kp_dialogues').update({ text_ko: bub.korean }).eq('id', DIALOGUE_ID)
    .select('id, text_ko, audio_url, audio_hash').single()
  if (e3) throw new Error(`갱신 실패: ${e3.message}`)

  console.log('\n변경 후:')
  console.log(`  대사 id=${after.id} ${JSON.stringify(after.text_ko)}`)
  console.log(`  audio_url=${after.audio_url} audio_hash=${after.audio_hash} (미변경)`)

  // 매칭 재확인
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
  const { data: bubs } = await sb.from('kp_bubbles').select('id, korean').eq('episode_id', 78)
  const hit = (bubs ?? []).filter(b => norm(b.korean) === norm(after.text_ko))
  console.log(`\n버블 매칭: ${hit.length}건 ${hit.map(h => `id=${h.id}`).join(', ')} ${hit.length === 1 ? '✅' : '❌'}`)
}

main().catch(e => { console.error(e); process.exit(1) })
