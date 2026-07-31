import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  const { data: episodes } = await supabase
    .from('kp_episodes')
    .select('id, episode_num, title, theme')
    .lte('episode_num', 10)
    .order('episode_num')

  for (const ep of episodes ?? []) {
    const { data: bubbles } = await supabase
      .from('kp_bubbles')
      .select('order_num, speaker, korean, translations')
      .eq('episode_id', ep.id)
      .order('order_num')

    console.log('='.repeat(60))
    console.log(`EP${String(ep.episode_num).padStart(2,'0')} · ${ep.title} (${ep.theme})`)
    console.log('='.repeat(60))

    for (const b of bubbles ?? []) {
      const speaker = b.speaker ? `[${b.speaker}] ` : ''
      const en = b.translations?.en ? `  → ${b.translations.en}` : ''
      console.log(speaker + b.korean + en)
    }
    console.log()
  }
}

main().catch(console.error)
