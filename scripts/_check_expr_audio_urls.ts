/** juseyo / mwoyeyo 표현의 기존 audio_urls 확인 (읽기 전용) */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data, error } = await sb
    .from('kp_expressions')
    .select('*')
    .in('slug', ['juseyo', 'mwoyeyo'])
  if (error) throw error
  for (const row of data ?? []) {
    console.log('─'.repeat(70))
    for (const [k, v] of Object.entries(row)) {
      const s = typeof v === 'string' ? v : JSON.stringify(v)
      console.log(`${k}: ${s == null ? 'null' : s.slice(0, 400)}`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
