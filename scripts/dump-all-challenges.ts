import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data, error } = await sb
    .from('kp_challenges')
    .select('id, challenge_type, question, answer, options, word_pieces, kp_episodes(episode_num)')
    .not('challenge_type', 'is', null)
    .order('episode_id').order('id')

  if (error) { console.error(error); process.exit(1) }

  const rows = (data ?? []).map((d: any) => ({
    id: d.id,
    ep: d.kp_episodes?.episode_num ?? '?',
    type: d.challenge_type,
    q: d.question?.prompt ?? '',
    hint: d.question?.hint_en ?? '',
    a: d.answer ?? '',
    opts: d.options ?? null,
    wp: d.word_pieces ?? null,
  }))

  const out = path.resolve(process.cwd(), 'scripts/challenges-dump.json')
  fs.writeFileSync(out, JSON.stringify(rows, null, 2), 'utf-8')
  console.log(`✅ ${rows.length}개 저장 → ${out}`)
}
main().catch(console.error)
