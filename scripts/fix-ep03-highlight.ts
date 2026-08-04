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
  // dialogue_id=24, role='focus' → matched_text를 패턴 부분만으로 수정
  const { error, data } = await sb
    .from('kp_dialogue_expressions')
    .update({ matched_text: '뭐예요?' })
    .eq('dialogue_id', 24)
    .eq('role', 'focus')
    .select()

  if (error) {
    console.error('❌ 실패:', error.message)
  } else {
    console.log('✅ 수정 완료:', JSON.stringify(data, null, 2))
  }
}

main().catch(console.error)
