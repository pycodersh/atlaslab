import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

async function main() {
  const { data, error } = await sb
    .from('kp_dialogue_expressions')
    .select(`
      id,
      matched_text,
      role,
      kp_dialogues!inner(episode_id, kp_episodes!inner(episode_num)),
      kp_expressions!inner(korean)
    `)
    .eq('role', 'focus')
    .order('id')

  if (error) { console.error(error); return }

  // episode_num 기준 정렬
  const rows = (data ?? []).map((r: any) => ({
    episode: r.kp_dialogues.kp_episodes.episode_num as number,
    matched_text: r.matched_text as string,
    expression_korean: r.kp_expressions.korean as string,
  })).sort((a, b) => a.episode - b.episode)

  // 에피소드별 그룹 출력
  let lastEp = 0
  for (const r of rows) {
    if (r.episode !== lastEp) {
      console.log(`\n=== EP${String(r.episode).padStart(2, '0')} (${rows.filter(x => x.episode === r.episode).length}개) ===`)
      lastEp = r.episode
    }
    console.log(`  "${r.matched_text}"  →  ${r.expression_korean}`)
  }

  console.log(`\n총 ${rows.length}개`)
}

main().catch(console.error)
