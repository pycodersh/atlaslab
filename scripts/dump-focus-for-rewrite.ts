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
      dialogue_id,
      matched_text,
      role,
      kp_dialogues!inner(episode_id, speaker, kp_episodes!inner(episode_num)),
      kp_expressions!inner(id, korean)
    `)
    .eq('role', 'focus')
    .order('id')

  if (error) { console.error(error); return }

  const rows = (data ?? []).map((r: any) => ({
    de_id: r.id,
    dialogue_id: r.dialogue_id,
    expression_id: r.kp_expressions.id,
    episode: r.kp_dialogues.kp_episodes.episode_num as number,
    speaker: r.kp_dialogues.speaker as string,
    matched_text: r.matched_text as string,
    korean: r.kp_expressions.korean as string,
  })).sort((a, b) => a.episode - b.episode || a.de_id - b.de_id)

  // JSON 형태로 출력 (스크립트 재작성에 활용)
  const output = rows.map(r =>
    `EP${String(r.episode).padStart(2,'0')} | expr_id=${r.expression_id} | ${r.korean} | matched="${r.matched_text}" | speaker=${r.speaker}`
  ).join('\n')

  console.log(output)
  console.log(`\n총 ${rows.length}개`)

  // 중복 expression_id 확인
  const exprCounts = new Map<number, number>()
  for (const r of rows) {
    exprCounts.set(r.expression_id, (exprCounts.get(r.expression_id) ?? 0) + 1)
  }
  const dupes = [...exprCounts.entries()].filter(([, c]) => c > 1)
  if (dupes.length) {
    console.log(`\n중복 expression_id (${dupes.length}개):`)
    dupes.forEach(([id, c]) => {
      const items = rows.filter(r => r.expression_id === id)
      console.log(`  expr_id=${id} (${c}개): ${items.map(i=>`EP${i.episode}`).join(', ')} | ${items[0].korean}`)
    })
  }
}

main().catch(console.error)
