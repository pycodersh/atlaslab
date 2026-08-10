/**
 * blog_posts 테이블 컬럼 목록 확인
 */
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
  // 1건만 조회해서 컬럼 목록 확인
  const { data, error } = await sb
    .from('blog_posts')
    .select('*')
    .limit(1)
    .single()

  if (error) { console.error(error); process.exit(1) }
  console.log('=== blog_posts 컬럼 목록 ===')
  console.log(Object.keys(data as object).join('\n'))
}

main().catch(e => { console.error(e); process.exit(1) })
