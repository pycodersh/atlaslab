// TRUNCATE 전에 kp_dialogue_expressions 전체 매핑 저장
import * as fs from 'fs'
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
      kp_dialogues!inner(episode_id, kp_episodes!inner(episode_num)),
      kp_expressions!inner(id, korean)
    `)
    .order('id')

  if (error) { console.error(error); return }

  const rows = (data ?? []).map((r: any) => ({
    de_id: r.id,
    dialogue_id: r.dialogue_id as number,
    expression_korean: r.kp_expressions.korean as string,
    matched_text: r.matched_text as string,
    role: r.role as string,
    episode_num: r.kp_dialogues.kp_episodes.episode_num as number,
  }))

  const focusRows = rows.filter(r => r.role === 'focus')
  const exposureRows = rows.filter(r => r.role === 'exposure')

  console.log(`총 ${rows.length}건: focus=${focusRows.length}, exposure=${exposureRows.length}`)

  // JSON 저장
  fs.writeFileSync(
    'C:\\Users\\msj15\\Downloads\\kpatto_mappings_backup.json',
    JSON.stringify({ focus: focusRows, exposure: exposureRows }, null, 2),
    'utf-8'
  )
  console.log('저장 완료: kpatto_mappings_backup.json')
}

main().catch(console.error)
