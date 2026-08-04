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
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
  const epMap: Record<number, number> = {}
  for (const e of eps ?? []) epMap[e.id] = e.episode_num

  const { data: challenges } = await sb.from('kp_challenges')
    .select('id, episode_id, challenge_type, question, options, answer, word_pieces')
    .order('episode_id').order('id')

  let currentEp = -1
  for (const c of challenges ?? []) {
    const ep = epMap[c.episode_id] ?? '?'
    if (ep !== currentEp) {
      console.log(`\n=== EP${String(ep).padStart(2,'0')} ===`)
      currentEp = ep as number
    }
    const prompt = c.question?.prompt ?? ''
    if (c.challenge_type === 'translation') {
      console.log(`  [번역] "${prompt}"`)
      console.log(`    → 정답: ${c.answer}`)
      console.log(`    보기: ${(c.options ?? []).join(' / ')}`)
    } else if (c.challenge_type === 'fill_blank') {
      console.log(`  [빈칸] ${prompt}`)
      console.log(`    → 정답: ${c.answer}`)
      console.log(`    보기: ${(c.options ?? []).join(' / ')}`)
    } else if (c.challenge_type === 'word_order') {
      console.log(`  [순서] "${prompt}"`)
      console.log(`    → 정답: ${c.answer}`)
      console.log(`    조각: ${(c.word_pieces ?? []).join(' / ')}`)
    }
  }

  console.log(`\n총 ${challenges?.length ?? 0}개`)
}

main().catch(console.error)
