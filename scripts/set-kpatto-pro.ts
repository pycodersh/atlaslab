import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

async function main() {
  const userId = 'b06d38a9-e92b-4950-b368-e166caba4a97' // zizou0725@gmail.com

  const { error } = await sb
    .from('user_profiles')
    .update({ kpatto_pro: true, kpatto_subscription_status: 'active' })
    .eq('id', userId)

  if (error) { console.error('업데이트 실패:', error); return }

  const { data } = await sb
    .from('user_profiles')
    .select('id, kpatto_pro, kpatto_subscription_status, kpatto_subscription_id')
    .eq('id', userId)
    .single()

  console.log('완료:', data)
}

main().catch(console.error)
