/**
 * kpatto_challenges_ep31_100_export.json → kp_challenges INSERT
 * 실제 DB 스키마: episode_id, challenge_type, question(jsonb), options(text[]), answer, word_pieces(text[]), order_num
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

const JSON_PATH = 'C:/Users/msj15/Downloads/kpatto_challenges_ep31_100_export.json'
const BATCH = 50

async function main() {
  const raw: any[] = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
  console.log(`로드: ${raw.length}건`)

  // 에피소드 맵 (episode_num → episode_id)
  const { data: epRows } = await sb.from('kp_episodes').select('id, episode_num').gte('episode_num', 31).lte('episode_num', 100)
  const epNumToId = new Map((epRows ?? []).map((e: any) => [e.episode_num as number, e.id as number]))

  // order_num 카운터 (episode_id별)
  const orderCounter: Record<number, number> = {}
  function nextOrder(epId: number) {
    orderCounter[epId] = (orderCounter[epId] ?? 0) + 1
    return orderCounter[epId]
  }

  // JSON 필드 → DB 컬럼 매핑
  const mapped = raw.map(ch => {
    const epId = epNumToId.get(ch.episode_num)
    if (!epId) { console.warn(`  episode_num=${ch.episode_num} 없음`); return null }
    const isWordOrder = ch.type === 'word_order'
    return {
      episode_id: epId,
      challenge_type: ch.type,                        // translation / fill_blank / word_order
      question: { prompt: ch.question },               // jsonb
      options: isWordOrder ? null : (ch.choices ?? null),
      word_pieces: isWordOrder ? (ch.choices ?? null) : null,
      answer: ch.answer,
      order_num: nextOrder(epId),
    }
  }).filter(Boolean)

  console.log(`변환 완료: ${mapped.length}건`)

  let ok = 0, fail = 0
  for (let i = 0; i < mapped.length; i += BATCH) {
    const batch = mapped.slice(i, i + BATCH)
    const { error } = await sb.from('kp_challenges').insert(batch)
    if (error) {
      console.error(`  배치 ${i}~${i+batch.length-1} 실패:`, error.message)
      for (const ch of batch) {
        const { error: e2 } = await sb.from('kp_challenges').insert(ch)
        if (e2) { console.error(`    [FAIL] ep${(ch as any).episode_id} ${(ch as any).challenge_type}:`, e2.message); fail++ }
        else ok++
      }
    } else {
      ok += batch.length
    }
  }

  const { count } = await sb.from('kp_challenges').select('*', { count: 'exact', head: true })
  console.log(`\nkp_challenges INSERT 완료: ${ok}건 성공, ${fail}건 실패`)
  console.log(`kp_challenges 총: ${count}건`)
}

main().catch(console.error)
