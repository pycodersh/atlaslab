import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: before } = await sb.from('kp_episodes')
    .select('id, episode_num, title, title_en, theme')
    .eq('episode_num', 61).single()

  console.log('현재 EP61:', JSON.stringify(before, null, 2))

  const { error } = await sb.from('kp_episodes')
    .update({ title: '한강에서', title_en: 'By the Han River' })
    .eq('episode_num', 61)

  if (error) {
    console.error('업데이트 오류:', error.message)
  } else {
    const { data: after } = await sb.from('kp_episodes')
      .select('id, episode_num, title, title_en, theme')
      .eq('episode_num', 61).single()
    console.log('갱신 후 EP61:', JSON.stringify(after, null, 2))
  }
}
main().catch(console.error)
