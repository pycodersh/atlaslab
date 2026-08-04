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
  const { error } = await sb.rpc('exec_sql', {
    sql: `
      ALTER TABLE kp_dialogues ADD COLUMN IF NOT EXISTS audio_url TEXT;
      ALTER TABLE kp_expressions ADD COLUMN IF NOT EXISTS audio_url TEXT;
      ALTER TABLE kp_expressions ADD COLUMN IF NOT EXISTS examples_audio_url TEXT;
    `
  })

  if (error) {
    // rpc가 없으면 직접 SQL 실행 불가 → Supabase 대시보드에서 실행 안내
    console.error('RPC 실패 (직접 SQL 실행 필요):', error.message)
    console.log('\nSupabase SQL Editor에서 아래 실행:\n')
    console.log('ALTER TABLE kp_dialogues ADD COLUMN IF NOT EXISTS audio_url TEXT;')
    console.log('ALTER TABLE kp_expressions ADD COLUMN IF NOT EXISTS audio_url TEXT;')
    console.log('ALTER TABLE kp_expressions ADD COLUMN IF NOT EXISTS examples_audio_url TEXT;')
    return
  }

  console.log('✅ 마이그레이션 완료')
}

main().catch(console.error)
