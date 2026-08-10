import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
async function main() {
  const { data } = await sb.from('kp_bubbles').select('id, episode_id, speaker, korean, dialogue_id').eq('episode_id', 7)
  console.log('EP07 kp_bubbles:', data?.length ?? 0, '건')
  for (const b of data ?? []) console.log(`  bub_id=${b.id} dlg_id=${b.dialogue_id ?? 'null'} [${b.speaker}] ${JSON.stringify(b.korean)}`)

  // merchant 잔존 전체 확인
  const { data: merch } = await sb.from('kp_bubbles').select('id, episode_id, speaker, korean').eq('speaker', 'merchant')
  console.log('\nkp_bubbles merchant 잔존:', merch?.length ?? 0, '건')
  for (const b of merch ?? []) console.log(`  bub_id=${b.id} ep=${b.episode_id} ${JSON.stringify(b.korean)}`)
}
main().catch(e => { console.error(e); process.exit(1) })
