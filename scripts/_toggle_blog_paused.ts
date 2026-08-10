/**
 * 특정 포스트 is_paused 토글 (렌더링 확인용)
 * npx tsx scripts/_toggle_blog_paused.ts <id> <true|false>
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

const [, , id, val] = process.argv
if (!id || !['true','false'].includes(val)) {
  console.error('Usage: npx tsx _toggle_blog_paused.ts <id> <true|false>')
  process.exit(1)
}

async function main() {
  const { error } = await sb.from('blog_posts').update({ is_paused: val === 'true' }).eq('id', id)
  if (error) { console.error(error.message); process.exit(1) }
  console.log(`[${id.slice(0,8)}] is_paused → ${val}`)
}
main().catch(e => { console.error(e); process.exit(1) })
