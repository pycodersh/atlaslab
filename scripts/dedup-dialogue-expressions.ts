// kp_dialogue_expressions 중복 행 제거
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  const { data, error } = await sb
    .from('kp_dialogue_expressions')
    .select('id, dialogue_id, expression_id, role')
    .order('id')
  if (error) { console.error(error); return }

  const rows = data ?? []
  console.log(`총 ${rows.length}건`)

  // 중복 찾기: same (dialogue_id, expression_id, role) → id가 더 큰 것 삭제
  const seen = new Map<string, number>()
  const toDelete: number[] = []
  for (const r of rows) {
    const key = `${r.dialogue_id}|${r.expression_id}|${r.role}`
    if (seen.has(key)) {
      toDelete.push(r.id) // 나중에 온 것(id 큰 것) 삭제
    } else {
      seen.set(key, r.id)
    }
  }
  console.log(`중복 ${toDelete.length}건 삭제 예정`)

  if (!toDelete.length) { console.log('중복 없음'); return }

  for (const id of toDelete) {
    const { error } = await sb.from('kp_dialogue_expressions').delete().eq('id', id)
    if (error) console.error(`삭제 실패 id=${id}:`, error.message)
  }
  console.log(`삭제 완료`)

  const { count } = await sb.from('kp_dialogue_expressions').select('id', { count: 'exact', head: true })
  console.log(`최종 kp_dialogue_expressions: ${count}건`)
}
main().catch(console.error)
