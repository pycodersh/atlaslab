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
  // examples가 있는 expression 샘플
  const { data: ex } = await sb
    .from('kp_expressions')
    .select('id, korean, examples')
    .not('examples', 'is', null)
    .limit(3)
  console.log('expressions with examples:', JSON.stringify(ex, null, 2))

  // EP01 dialogues (episode_id=1)
  const { data: ep1 } = await sb
    .from('kp_episodes').select('id').eq('episode_num', 1).single()
  const { data: dlg } = await sb
    .from('kp_dialogues')
    .select('id, speaker, text_ko')
    .eq('episode_id', ep1!.id)
    .order('order_num').limit(5)
  console.log('\nEP01 dialogues sample:', JSON.stringify(dlg, null, 2))

  // OPENAI_API_KEY 존재 여부
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  console.log('\nOPENAI_API_KEY 있음:', hasOpenAI)
}

main().catch(console.error)
