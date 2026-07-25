import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function count(table: string, filter?: Record<string, unknown>): Promise<number | string> {
  let q = supabase.from(table).select('id', { count: 'exact', head: true })
  if (filter) {
    for (const [k, v] of Object.entries(filter)) q = (q as any).eq(k, v)
  }
  const { count: n, error } = await q
  if (error) return `ERR: ${error.message.slice(0, 60)}`
  return n ?? 0
}

async function main() {
  console.log('=== K-PATTO DB 상태 확인 ===\n')

  // kp_episodes
  const epTotal = await count('kp_episodes')
  const { data: epSample } = await supabase
    .from('kp_episodes')
    .select('episode_num, title, location, is_free')
    .in('episode_num', [1, 11, 50, 100])
    .order('episode_num')
  console.log(`kp_episodes : ${epTotal}개`)
  for (const ep of epSample ?? []) {
    console.log(`  EP${String(ep.episode_num).padStart(2,'0')} ${ep.title} | location: ${ep.location ?? 'null'} | is_free: ${ep.is_free ?? 'null'}`)
  }

  // kp_scenes
  const scTotal = await count('kp_scenes')
  console.log(`\nkp_scenes   : ${scTotal}개`)

  // kp_dialogues
  const dlTotal = await count('kp_dialogues')
  const { data: dlSample } = await supabase
    .from('kp_dialogues')
    .select('speaker, text_ko, order_num')
    .eq('episode_id', (await supabase.from('kp_episodes').select('id').eq('episode_num', 1).single()).data?.id ?? 0)
    .order('order_num')
    .limit(4)
  console.log(`\nkp_dialogues: ${dlTotal}개`)
  if (dlSample?.length) {
    console.log('  EP01 대사 샘플:')
    for (const d of dlSample) {
      console.log(`    [${d.order_num}] ${d.speaker}: ${d.text_ko}`)
    }
  }

  // kp_dialogue_expressions
  const deTotal = await count('kp_dialogue_expressions')
  console.log(`\nkp_dialogue_expressions: ${deTotal}개`)

  // kp_expressions (기존)
  const exTotal = await count('kp_expressions')
  console.log(`\nkp_expressions: ${exTotal}개`)

  // kp_bubbles (기존 웹툰 데이터)
  const bubTotal = await count('kp_bubbles')
  console.log(`kp_bubbles    : ${bubTotal}개 (기존 웹툰)`)

  console.log('\n=== 완료 ===')
}

main().catch(console.error)
