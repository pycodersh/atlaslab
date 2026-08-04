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
  const { data, error } = await sb
    .from('kp_challenges')
    .select('id, episode_id, challenge_type, question, answer, word_pieces, kp_episodes(episode_num)')
    .order('episode_id').order('id')

  if (error) { console.error('Error:', error); return }
  console.log('Total challenges:', data?.length)
  const hit = data?.filter(c => {
    const q = JSON.stringify(c.question)
    const wp = JSON.stringify(c.word_pieces)
    return q.includes('What is this') || q.includes('뭐예요') || wp.includes('저기요') || wp.includes('뭐예요')
  })
  console.log('Matching challenges:', hit?.length)
  hit?.forEach(c => {
    const epNum = (c.kp_episodes as any)?.episode_num
    console.log(`EP${epNum} id=${c.id} type=${c.challenge_type}`)
    console.log('  Q:', JSON.stringify(c.question))
    console.log('  A:', JSON.stringify(c.answer))
    console.log('  WP:', JSON.stringify(c.word_pieces))
  })
}
main().catch(console.error)
