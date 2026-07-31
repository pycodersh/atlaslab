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
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
  const { data } = await sb.from('kp_challenges')
    .select('id, challenge_type, question, options, answer, word_pieces')
    .eq('episode_id', ep!.id)
    .order('id')

  for (const c of data ?? []) {
    console.log(`--- id=${c.id} type=${c.challenge_type} ---`)
    console.log('  prompt:', c.question?.prompt)
    if (c.options) console.log('  options:', JSON.stringify(c.options))
    console.log('  answer:', c.answer)
    if (c.word_pieces) console.log('  word_pieces:', JSON.stringify(c.word_pieces))
  }
}

main().catch(console.error)
