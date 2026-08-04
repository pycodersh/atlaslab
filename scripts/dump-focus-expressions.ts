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
    .from('kp_expressions')
    .select('id, korean, english, category, first_episode')
    .eq('category', 'focus')
    .order('first_episode').order('id')

  if (error) { console.error(error); process.exit(1) }

  console.log(`총 focus expressions: ${data?.length}`)

  const out = path.resolve(process.cwd(), 'scripts/focus-expressions.json')
  fs.writeFileSync(out, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`✅ 저장 → ${out}`)

  // 콘솔에도 출력 (검수용)
  data?.forEach(r => {
    console.log(`id=${r.id} ep=${r.first_episode} | ${r.korean} | current_english=${r.english}`)
  })
}
main().catch(console.error)
