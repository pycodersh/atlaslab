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
  // EP03 id 조회
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 3).single()
  if (!ep) { console.log('EP03 없음'); return }

  // EP03 버블 중 expression_id 있는 것들
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, korean, highlight_text, expression_id, dialogue_id')
    .eq('episode_id', ep.id)
    .not('expression_id', 'is', null)
    .order('order_num')

  console.log(`\n=== EP03 하이라이트 버블 (expression_id 있음) ===`)
  for (const b of bubbles ?? []) {
    console.log(`\n  [bubble id=${b.id}] "${b.korean}"`)
    console.log(`    highlight_text: ${b.highlight_text ?? '(null)'}`)
    console.log(`    expression_id: ${b.expression_id}`)
    console.log(`    dialogue_id: ${b.dialogue_id ?? '(null)'}`)

    if (b.dialogue_id) {
      const { data: de } = await sb
        .from('kp_dialogue_expressions')
        .select('matched_text, role, expression_id')
        .eq('dialogue_id', b.dialogue_id)
      if (de && de.length > 0) {
        for (const row of de) {
          console.log(`    → kp_dialogue_expressions: role=${row.role}, matched_text=${row.matched_text ?? '(null)'}, expr_id=${row.expression_id}`)
        }
      } else {
        console.log(`    → kp_dialogue_expressions: (없음)`)
      }
    }
  }
}

main().catch(console.error)
